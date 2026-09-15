import {
  Injectable,
  BadRequestException,
  NotFoundException,
  ForbiddenException,
  ConflictException,
} from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateInterviewSlotsDto } from './dto/create-interview-slot.dto';
import { InterviewSlotStatus } from '@prisma/client';

@Injectable()
export class InterviewSlotsService {
  constructor(private prisma: PrismaService) {}

  /**
   * HR: Create timeslots in bulk for a form
   */
  async createSlots(formId: string, userId: number, dto: CreateInterviewSlotsDto) {
    const form = await this.prisma.form.findUnique({ where: { id: formId } });
    if (!form) {
      throw new NotFoundException('Form not found');
    }
    if (form.userId !== userId) {
      throw new ForbiddenException('You do not have permission to manage timeslots for this form');
    }

    const now = new Date();

    // Validate timeslots logic
    for (const slot of dto.slots) {
      if (slot.startTime >= slot.endTime) {
        throw new BadRequestException(`Start time (${slot.startTime.toISOString()}) must be before end time (${slot.endTime.toISOString()})`);
      }
      if (slot.startTime < now) {
        throw new BadRequestException(`Start time (${slot.startTime.toISOString()}) cannot be in the past`);
      }
    }

    // Create timeslots
    await this.prisma.interviewSlot.createMany({
      data: dto.slots.map((slot) => ({
        formId,
        startTime: slot.startTime,
        endTime: slot.endTime,
        meetingLink: slot.meetingLink ?? null,
        status: InterviewSlotStatus.AVAILABLE,
      })),
    });

    return this.prisma.interviewSlot.findMany({
      where: { formId },
      orderBy: { startTime: 'asc' },
    });
  }

  /**
   * HR: Get all timeslots for a form
   */
  async findAllByFormId(formId: string, userId: number) {
    const form = await this.prisma.form.findUnique({ where: { id: formId } });
    if (!form) {
      throw new NotFoundException('Form not found');
    }
    if (form.userId !== userId) {
      throw new ForbiddenException('You do not have permission to view timeslots for this form');
    }

    return this.prisma.interviewSlot.findMany({
      where: { formId },
      include: {
        submission: {
          select: {
            id: true,
            email: true,
            status: true,
          },
        },
      },
      orderBy: { startTime: 'asc' },
    });
  }

  /**
   * Candidate (Public): Get available timeslots for a form
   */
  async findAvailableByFormId(formId: string) {
    const form = await this.prisma.form.findUnique({ where: { id: formId } });
    if (!form) {
      throw new NotFoundException('Form not found');
    }

    return this.prisma.interviewSlot.findMany({
      where: {
        formId,
        status: InterviewSlotStatus.AVAILABLE,
        startTime: { gt: new Date() },
      },
      orderBy: { startTime: 'asc' },
    });
  }

  /**
   * Candidate (Public): Book a timeslot atomically
   */
  async bookSlot(submissionId: string, slotId: number) {
    const submission = await this.prisma.formSubmission.findUnique({
      where: { id: submissionId },
      include: { interviewSlot: true },
    });

    if (!submission) {
      throw new NotFoundException('Submission not found');
    }

    if (submission.interviewSlot) {
      throw new BadRequestException('You have already booked an interview slot for this submission');
    }

    return this.prisma.$transaction(async (tx) => {
      const slot = await tx.interviewSlot.findUnique({
        where: { id: slotId },
      });

      if (!slot) {
        throw new NotFoundException('Interview slot not found');
      }

      if (slot.formId !== submission.formId) {
        throw new BadRequestException('This interview slot does not belong to the submission form');
      }

      if (slot.status !== InterviewSlotStatus.AVAILABLE) {
        throw new ConflictException('This interview slot is no longer available');
      }

      try {
        return await tx.interviewSlot.update({
          where: { id: slotId },
          data: {
            status: InterviewSlotStatus.BOOKED,
            submissionId,
          },
        });
      } catch (error: any) {
        // Catch Prisma unique constraint failure (P2002) if submission already booked concurrently
        if (error.code === 'P2002') {
          throw new ConflictException('You have already booked an interview slot or this slot was taken');
        }
        throw error;
      }
    });
  }

  /**
   * Candidate / HR: Get booking for a submission
   */
  async getBookingBySubmissionId(submissionId: string) {
    const slot = await this.prisma.interviewSlot.findUnique({
      where: { submissionId },
      include: {
        form: {
          select: {
            id: true,
            title: true,
          },
        },
      },
    });

    if (!slot) {
      throw new NotFoundException('No interview booking found for this submission');
    }

    return slot;
  }
}
