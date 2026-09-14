import { Injectable, BadRequestException, NotFoundException, ForbiddenException, Logger } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { FormsService } from '../forms/forms.service';
import { AiService } from '../ai/ai.service';
import { SubmitFormDto } from './dto/submit-form.dto';

@Injectable()
export class FormSubmissionsService {
  private readonly logger = new Logger(FormSubmissionsService.name);

  constructor(
    private prisma: PrismaService,
    private formsService: FormsService,
    private aiService: AiService,
  ) {}

  async submit(formId: string, dto: SubmitFormDto) {
    const form = await this.formsService.findOne(formId);
    if (!form) {
      throw new NotFoundException('Form not found');
    }

    const now = new Date();

    // Check if the form has a start time and hasn't opened yet
    if (form.openAt && now < form.openAt) {
      throw new BadRequestException('Form is not open yet');
    }

    // Check if the form has an end time and has already closed
    if (form.closeAt && now > form.closeAt) {
      throw new BadRequestException('Form submission period has ended');
    }

    // Validate required fields
    for (const field of form.fields) {
      if (field.required) {
        const answer = dto.answers.find((a) => a.fieldId === field.id);
        if (!answer || (!answer.value && !answer.optionId)) {
          throw new BadRequestException(`Field ${field.label} is required`);
        }
      }
    }

    const submission = await this.prisma.$transaction(async (tx) => {
      return tx.formSubmission.create({
        data: {
          formId: formId,
          email: dto.email,
          cvFileId: dto.cvFileId,
          answers: {
            create: dto.answers.map((answer) => ({
              fieldId: answer.fieldId,
              value: answer.value,
              optionId: answer.optionId,
            })),
          },
        },
      });
    });

    // Trigger AI scoring in background without blocking response to client
    setImmediate(() => {
      this.aiService.processSubmission(submission.id).catch((err) => {
        this.logger.error(`Background AI scoring error for submission ${submission.id}`, err);
      });
    });

    return submission;
  }

  async findOne(id: string, userId: number) {
    const submission = await this.prisma.formSubmission.findUnique({
      where: { id },
      include: {
        form: {
          include: {
            fields: {
              include: {
                options: true,
              },
            },
          },
        },
        answers: {
          include: {
            field: true,
            option: true,
          },
        },
        cvFile: true,
      },
    });

    if (!submission) {
      throw new NotFoundException('Submission not found');
    }

    if (submission.form.userId !== userId) {
      throw new ForbiddenException('You do not have permission to view this submission');
    }

    return submission;
  }

  async findAllByFormId(formId: string, userId: number) {
    const form = await this.prisma.form.findUnique({ where: { id: formId } });
    if (!form || form.userId !== userId) {
      throw new ForbiddenException('You do not have permission to view submissions for this form');
    }

    return this.prisma.formSubmission.findMany({
      where: { formId },
      include: {
        cvFile: true,
        answers: true,
      },
    });
  }
  
  async delete(submissionId: string, userId: number) {
    const submission = await this.prisma.formSubmission.findUnique({
      where: { id: submissionId },
      include: { form: true },
    });

    if (!submission) {
      throw new NotFoundException('Submission not found');
    }

    if (submission.form.userId !== userId) {
      throw new ForbiddenException('You do not have permission to delete this submission');
    }

    return this.prisma.formSubmission.delete({
      where: { id: submissionId },
    });
  }

  async updateStatus(formId: string, submissionId: string, status: import('@prisma/client').SubmissionStatus, userId: number) {
    const submission = await this.prisma.formSubmission.findFirst({
      where: { id: submissionId, formId },
      include: { form: true },
    });

    if (!submission) {
      throw new NotFoundException('Submission not found');
    }

    if (submission.form.userId !== userId) {
      throw new ForbiddenException('You do not have permission to update this submission');
    }

    return this.prisma.formSubmission.update({
      where: { id: submissionId },
      data: { status },
      include: {
        cvFile: true,
        answers: true,
      },
    });
  }

  async bulkUpdateStatus(formId: string, submissionIds: string[], status: import('@prisma/client').SubmissionStatus, userId: number) {
    const form = await this.prisma.form.findUnique({ where: { id: formId } });
    if (!form || form.userId !== userId) {
      throw new ForbiddenException('You do not have permission to update submissions for this form');
    }

    // Verify all submissions belong to the form
    const submissions = await this.prisma.formSubmission.findMany({
      where: {
        id: { in: submissionIds },
        formId,
      },
    });

    if (submissions.length !== submissionIds.length) {
      throw new BadRequestException('Some submissions were not found or do not belong to this form');
    }

    await this.prisma.formSubmission.updateMany({
      where: {
        id: { in: submissionIds },
        formId,
      },
      data: { status },
    });

    return { count: submissionIds.length };
  }

  async rescore(formId: string, submissionId: number, userId: number) {
    const form = await this.prisma.form.findUnique({ where: { id: formId } });
    if (!form || form.userId !== userId) {
      throw new ForbiddenException('You do not have permission to rescore submissions for this form');
    }

    const submission = await this.prisma.formSubmission.findFirst({
      where: { id: submissionId, formId },
    });

    if (!submission) {
      throw new NotFoundException('Submission not found');
    }

    const updated = await this.prisma.formSubmission.update({
      where: { id: submissionId },
      data: {
        aiScoreStatus: 'PENDING',
        aiError: null,
      },
    });

    setImmediate(() => {
      this.aiService.processSubmission(submissionId).catch((err) => {
        this.logger.error(`Manual rescore failed for submission ${submissionId}`, err);
      });
    });

    return updated;
  }
}
