import { Injectable, Inject, Logger, OnModuleInit, ServiceUnavailableException } from '@nestjs/common';
import { ConfigType } from '@nestjs/config';
import { PrismaService } from '../../prisma/prisma.service';
import { S3Service } from '../s3/s3.service';
import aiConfig from './ai.config';
import { AiHealthResponseDto } from './dto/ai-health-response.dto';

class NonRetryableError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'NonRetryableError';
  }
}

@Injectable()
export class AiService implements OnModuleInit {
  private readonly logger = new Logger(AiService.name);
  private readonly baseUrl: string;
  private readonly timeoutMs: number;
  private readonly maxRetries: number;

  constructor(
    @Inject(aiConfig.KEY)
    private config: ConfigType<typeof aiConfig>,
    private readonly prisma: PrismaService,
    private readonly s3Service: S3Service,
  ) {
    if (!config.baseUrl) {
      this.logger.warn('AI_SERVICE_URL environment variable is not set. AI scoring will be inactive until configured.');
    }
    this.baseUrl = config.baseUrl || '';
    this.timeoutMs = config.timeoutMs;
    this.maxRetries = config.maxRetries;
  }

  onModuleInit() {
    if (!this.baseUrl) {
      return;
    }
    // Run recovery after application has started
    setImmediate(() => {
      this.recoverInterruptedJobs().catch((err) => {
        this.logger.error('Failed to run AI recovery on startup', err);
      });
    });
  }

  async checkHealth(): Promise<AiHealthResponseDto> {
    if (!this.baseUrl) {
      throw new ServiceUnavailableException('AI_SERVICE_URL environment variable is not configured');
    }
    try {
      const response = await fetch(`${this.baseUrl}/health`, {
        signal: AbortSignal.timeout(5000),
      });
      if (!response.ok) {
        throw new Error(`AI service health check returned status ${response.status}`);
      }
      return (await response.json()) as AiHealthResponseDto;
    } catch (error: any) {
      this.logger.error(`AI service is unreachable at ${this.baseUrl}: ${error.message}`);
      throw error;
    }
  }

  async scoreCv(pdfUrl: string, jobRequirements: string): Promise<number> {
    if (!this.baseUrl) {
      throw new Error('AI_SERVICE_URL environment variable is not configured');
    }
    let lastError: Error | null = null;

    for (let attempt = 1; attempt <= this.maxRetries; attempt++) {
      try {
        this.logger.log(`Calling AI service for recommendation (attempt ${attempt}/${this.maxRetries})...`);

        const response = await fetch(`${this.baseUrl}/api/v1/recommend`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            pdf_url: pdfUrl,
            job_requirements: jobRequirements,
          }),
          signal: AbortSignal.timeout(this.timeoutMs),
        });

        if (response.status === 422) {
          const body: any = await response.json().catch(() => ({}));
          const detail = body.detail || 'Could not extract text from PDF (file may be scanned or image-based).';
          // Non-retryable error
          throw new NonRetryableError(detail);
        }

        if (!response.ok) {
          const body: any = await response.json().catch(() => ({}));
          const detail = body.detail || `AI service returned error status ${response.status}`;
          throw new Error(detail);
        }

        const data: any = await response.json();
        if (typeof data.score !== 'number') {
          throw new Error('AI service did not return a valid numeric score');
        }

        return data.score;
      } catch (error: any) {
        lastError = error;

        // If it's a non-retryable error (e.g. 422 image-only PDF), stop immediately
        if (error instanceof NonRetryableError) {
          this.logger.warn(`Non-retryable AI error: ${error.message}`);
          throw error;
        }

        this.logger.warn(`AI scoring attempt ${attempt} failed: ${error.message}`);

        if (attempt < this.maxRetries) {
          const delayMs = Math.pow(2, attempt) * 1000;
          this.logger.log(`Waiting ${delayMs}ms before retrying AI service...`);
          await new Promise((resolve) => setTimeout(resolve, delayMs));
        }
      }
    }

    throw lastError || new Error('Failed to score CV with AI service after maximum retries');
  }

  async processSubmission(submissionId: number): Promise<void> {
    if (!this.baseUrl) {
      this.logger.warn(`AI_SERVICE_URL is not configured. Marking submission ${submissionId} as FAILED.`);
      await this.safeUpdateSubmission(submissionId, {
        aiScoreStatus: 'FAILED',
        aiError: 'AI_SERVICE_URL is not configured in the environment',
      });
      return;
    }

    this.logger.log(`Starting AI scoring for submission ID: ${submissionId}`);

    const submission = await this.prisma.formSubmission.findUnique({
      where: { id: submissionId },
      include: {
        form: true,
        cvFile: true,
      },
    });

    if (!submission) {
      this.logger.warn(`Submission with ID ${submissionId} not found, skipping AI scoring.`);
      return;
    }

    // 1. Check if form requirements exist
    const requirements = submission.form?.requirements?.trim();
    if (!requirements) {
      this.logger.log(`Form ${submission.formId} has no requirements. Marking submission ${submissionId} as SKIPPED.`);
      await this.safeUpdateSubmission(submissionId, {
        aiScoreStatus: 'SKIPPED',
        aiError: 'Form has no job requirements specified',
      });
      return;
    }

    // 2. Check if CV file exists
    if (!submission.cvFile || !submission.cvFile.key) {
      this.logger.warn(`Submission ${submissionId} has no associated CV file record.`);
      await this.safeUpdateSubmission(submissionId, {
        aiScoreStatus: 'FAILED',
        aiError: 'CV file record not found in storage',
      });
      return;
    }

    // 3. Mark as PROCESSING
    await this.safeUpdateSubmission(submissionId, {
      aiScoreStatus: 'PROCESSING',
      aiError: null,
    });

    try {
      // 4. Generate presigned download URL with 15 minutes (900s) TTL
      const presignedUrl = await this.s3Service.getPresignedDownloadUrl(submission.cvFile.key, 900);

      // 5. Call AI service to compute score
      const score = await this.scoreCv(presignedUrl, requirements);

      // 6. Update database with score and COMPLETED status
      await this.safeUpdateSubmission(submissionId, {
        cvScore: score,
        aiScoreStatus: 'COMPLETED',
        aiError: null,
      });

      this.logger.log(`Successfully scored submission ${submissionId} with score: ${score}`);
    } catch (error: any) {
      this.logger.error(`Failed to complete AI scoring for submission ${submissionId}: ${error.message}`);
      await this.safeUpdateSubmission(submissionId, {
        aiScoreStatus: 'FAILED',
        aiError: error.message || 'An error occurred during AI scoring',
      });
    }
  }

  private async safeUpdateSubmission(submissionId: number, data: any): Promise<void> {
    try {
      await this.prisma.formSubmission.update({
        where: { id: submissionId },
        data,
      });
    } catch (error: any) {
      this.logger.warn(`Failed to update submission ${submissionId}: ${error.message}`);
    }
  }

  private async recoverInterruptedJobs(): Promise<void> {
    const tenMinutesAgo = new Date(Date.now() - 10 * 60 * 1000);

    // Find submissions stuck in PROCESSING for more than 10 minutes (likely due to a backend crash/restart)
    const stuckSubmissions = await this.prisma.formSubmission.findMany({
      where: {
        aiScoreStatus: 'PROCESSING',
        createdAt: { lt: tenMinutesAgo },
      },
      select: { id: true },
    });

    if (stuckSubmissions.length > 0) {
      this.logger.log(`Found ${stuckSubmissions.length} stuck AI scoring jobs. Requeuing...`);
      for (const item of stuckSubmissions) {
        await this.safeUpdateSubmission(item.id, {
          aiScoreStatus: 'PENDING',
          aiError: 'Recovered after service restart',
        });
        setImmediate(() => {
          this.processSubmission(item.id).catch((err) => {
            this.logger.error(`Error processing recovered submission ${item.id}`, err);
          });
        });
      }
    }
  }
}
