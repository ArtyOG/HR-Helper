import { Test, TestingModule } from '@nestjs/testing';
import { ServiceUnavailableException } from '@nestjs/common';
import { AiService } from './ai.service';
import { PrismaService } from '../../prisma/prisma.service';
import { S3Service } from '../s3/s3.service';
import aiConfig from './ai.config';

describe('AiService', () => {
  let service: AiService;
  let prisma: {
    formSubmission: {
      findUnique: jest.Mock;
    };
    cvEvaluation: {
      update: jest.Mock;
      findMany: jest.Mock;
    };
  };
  let s3Service: {
    getPresignedDownloadUrl: jest.Mock;
  };

  const mockAiConfig = {
    baseUrl: 'http://localhost:8000',
    timeoutMs: 5000,
    maxRetries: 2,
  };

  beforeEach(async () => {
    prisma = {
      formSubmission: {
        findUnique: jest.fn(),
      },
      cvEvaluation: {
        update: jest.fn(),
        findMany: jest.fn().mockResolvedValue([]),
      },
    };

    s3Service = {
      getPresignedDownloadUrl: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AiService,
        {
          provide: aiConfig.KEY,
          useValue: mockAiConfig,
        },
        {
          provide: PrismaService,
          useValue: prisma,
        },
        {
          provide: S3Service,
          useValue: s3Service,
        },
      ],
    }).compile();

    service = module.get<AiService>(AiService);
  });

  describe('checkHealth', () => {
    it('should throw ServiceUnavailableException if baseUrl is missing', async () => {
      const module: TestingModule = await Test.createTestingModule({
        providers: [
          AiService,
          {
            provide: aiConfig.KEY,
            useValue: { baseUrl: '', timeoutMs: 5000, maxRetries: 1 },
          },
          {
            provide: PrismaService,
            useValue: prisma,
          },
          {
            provide: S3Service,
            useValue: s3Service,
          },
        ],
      }).compile();

      const unconfiguredService = module.get<AiService>(AiService);

      await expect(unconfiguredService.checkHealth()).rejects.toThrow(
        new ServiceUnavailableException('AI_SERVICE_URL environment variable is not configured'),
      );
    });

    it('should return health status when AI service responds successfully', async () => {
      const mockHealth = { status: 'ok', service: 'ai-service' };
      global.fetch = jest.fn().mockResolvedValue({
        ok: true,
        json: jest.fn().mockResolvedValue(mockHealth),
      } as any);

      const result = await service.checkHealth();
      expect(result).toEqual(mockHealth);
    });
  });

  describe('processSubmission', () => {
    it('should skip scoring if form has no requirements', async () => {
      prisma.formSubmission.findUnique.mockResolvedValue({
        id: 'sub-uuid-1',
        cvEvaluation: {
          file: { key: 'documents/resume.pdf' },
        },
        form: { requirements: '' },
      });

      await service.processSubmission('sub-uuid-1');

      expect(prisma.cvEvaluation.update).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { submissionId: 'sub-uuid-1' },
          data: expect.objectContaining({
            status: 'SKIPPED',
            error: 'Form has no job requirements specified',
          }),
        }),
      );
    });

    it('should mark scoring as FAILED if submission has no cvFile', async () => {
      prisma.formSubmission.findUnique.mockResolvedValue({
        id: 'sub-uuid-1',
        cvEvaluation: null,
        form: { requirements: 'Skill A' },
      });

      await service.processSubmission('sub-uuid-1');

      expect(prisma.cvEvaluation.update).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { submissionId: 'sub-uuid-1' },
          data: expect.objectContaining({
            status: 'FAILED',
            error: 'CV file record not found in storage',
          }),
        }),
      );
    });

    it('should successfully score CV and update status to COMPLETED', async () => {
      prisma.formSubmission.findUnique.mockResolvedValue({
        id: 'sub-uuid-1',
        cvEvaluation: {
          file: { key: 'documents/resume.pdf' },
        },
        form: { requirements: 'Must know TypeScript and NestJS' },
      });

      s3Service.getPresignedDownloadUrl.mockResolvedValue('https://s3.amazonaws.com/presigned-cv.pdf');

      global.fetch = jest.fn().mockResolvedValue({
        ok: true,
        status: 200,
        json: jest.fn().mockResolvedValue({ score: 85 }),
      } as any);

      await service.processSubmission('sub-uuid-1');

      expect(s3Service.getPresignedDownloadUrl).toHaveBeenCalledWith('documents/resume.pdf', 900);
      expect(prisma.cvEvaluation.update).toHaveBeenCalledWith({
        where: { submissionId: 'sub-uuid-1' },
        data: {
          score: 85,
          status: 'COMPLETED',
          error: null,
        },
      });
    });
  });
});
