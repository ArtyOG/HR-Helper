import { Test, TestingModule } from '@nestjs/testing';
import { BadRequestException, ForbiddenException, NotFoundException } from '@nestjs/common';
import { InterviewSlotsService } from './interview-slots.service';
import { PrismaService } from '../../prisma/prisma.service';
import { InterviewSlotStatus } from '@prisma/client';

describe('InterviewSlotsService', () => {
  let service: InterviewSlotsService;
  let prisma: {
    form: {
      findUnique: jest.Mock;
    };
    interviewSlot: {
      findUnique: jest.Mock;
      findMany: jest.Mock;
      createMany: jest.Mock;
      delete: jest.Mock;
      deleteMany: jest.Mock;
      update: jest.Mock;
    };
    formSubmission: {
      findUnique: jest.Mock;
    };
    $transaction: jest.Mock;
  };

  beforeEach(async () => {
    prisma = {
      form: {
        findUnique: jest.fn(),
      },
      interviewSlot: {
        findUnique: jest.fn(),
        findMany: jest.fn(),
        createMany: jest.fn(),
        delete: jest.fn(),
        deleteMany: jest.fn(),
        update: jest.fn(),
      },
      formSubmission: {
        findUnique: jest.fn(),
      },
      $transaction: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        InterviewSlotsService,
        {
          provide: PrismaService,
          useValue: prisma,
        },
      ],
    }).compile();

    service = module.get<InterviewSlotsService>(InterviewSlotsService);
  });

  describe('deleteSlot', () => {
    const formId = 'form-uuid-1';
    const slotId = 101;
    const userId = 1;

    it('should successfully delete an unbooked slot', async () => {
      prisma.form.findUnique.mockResolvedValue({ id: formId, userId });
      prisma.interviewSlot.findUnique.mockResolvedValue({
        id: slotId,
        formId,
        status: InterviewSlotStatus.AVAILABLE,
        submissionId: null,
      });
      prisma.interviewSlot.delete.mockResolvedValue({ id: slotId });

      const result = await service.deleteSlot(formId, slotId, userId);

      expect(prisma.form.findUnique).toHaveBeenCalledWith({ where: { id: formId } });
      expect(prisma.interviewSlot.findUnique).toHaveBeenCalledWith({ where: { id: slotId } });
      expect(prisma.interviewSlot.delete).toHaveBeenCalledWith({ where: { id: slotId } });
      expect(result).toEqual({ id: slotId });
    });

    it('should throw NotFoundException if form not found', async () => {
      prisma.form.findUnique.mockResolvedValue(null);

      await expect(service.deleteSlot(formId, slotId, userId)).rejects.toThrow(
        NotFoundException,
      );
    });

    it('should throw ForbiddenException if user is not form owner', async () => {
      prisma.form.findUnique.mockResolvedValue({ id: formId, userId: 999 });

      await expect(service.deleteSlot(formId, slotId, userId)).rejects.toThrow(
        ForbiddenException,
      );
    });

    it('should throw NotFoundException if slot not found', async () => {
      prisma.form.findUnique.mockResolvedValue({ id: formId, userId });
      prisma.interviewSlot.findUnique.mockResolvedValue(null);

      await expect(service.deleteSlot(formId, slotId, userId)).rejects.toThrow(
        NotFoundException,
      );
    });

    it('should throw NotFoundException if slot belongs to another form', async () => {
      prisma.form.findUnique.mockResolvedValue({ id: formId, userId });
      prisma.interviewSlot.findUnique.mockResolvedValue({
        id: slotId,
        formId: 'other-form-id',
        status: InterviewSlotStatus.AVAILABLE,
        submissionId: null,
      });

      await expect(service.deleteSlot(formId, slotId, userId)).rejects.toThrow(
        NotFoundException,
      );
    });

    it('should throw BadRequestException if slot is booked', async () => {
      prisma.form.findUnique.mockResolvedValue({ id: formId, userId });
      prisma.interviewSlot.findUnique.mockResolvedValue({
        id: slotId,
        formId,
        status: InterviewSlotStatus.BOOKED,
        submissionId: 'sub-123',
      });

      await expect(service.deleteSlot(formId, slotId, userId)).rejects.toThrow(
        BadRequestException,
      );
    });
  });

  describe('clearSlots', () => {
    const formId = 'form-uuid-1';
    const userId = 1;

    it('should successfully clear unbooked slots for form', async () => {
      prisma.form.findUnique.mockResolvedValue({ id: formId, userId });
      prisma.interviewSlot.deleteMany.mockResolvedValue({ count: 5 });

      const result = await service.clearSlots(formId, userId);

      expect(prisma.form.findUnique).toHaveBeenCalledWith({ where: { id: formId } });
      expect(prisma.interviewSlot.deleteMany).toHaveBeenCalledWith({
        where: {
          formId,
          status: { not: InterviewSlotStatus.BOOKED },
          submissionId: null,
        },
      });
      expect(result).toEqual({ count: 5 });
    });

    it('should throw NotFoundException if form not found', async () => {
      prisma.form.findUnique.mockResolvedValue(null);

      await expect(service.clearSlots(formId, userId)).rejects.toThrow(
        NotFoundException,
      );
    });

    it('should throw ForbiddenException if user is not form owner', async () => {
      prisma.form.findUnique.mockResolvedValue({ id: formId, userId: 999 });

      await expect(service.clearSlots(formId, userId)).rejects.toThrow(
        ForbiddenException,
      );
    });
  });

  describe('findAll', () => {
    const userId = 1;

    it('should return all interview slots for user ordered by startTime asc', async () => {
      const mockSlots = [
        {
          id: 1,
          startTime: new Date('2026-10-01T09:00:00.000Z'),
          status: InterviewSlotStatus.BOOKED,
          form: { id: 'f-1', title: 'Software Engineer' },
          submission: { id: 's-1', email: 'dev@test.com', status: 'PENDING' },
        },
      ];
      prisma.interviewSlot.findMany.mockResolvedValue(mockSlots);

      const result = await service.findAll(userId);

      expect(prisma.interviewSlot.findMany).toHaveBeenCalledWith({
        where: {
          form: {
            userId,
          },
        },
        include: {
          form: {
            select: {
              id: true,
              title: true,
            },
          },
          submission: {
            select: {
              id: true,
              email: true,
              status: true,
              cvEvaluation: {
                select: {
                  score: true,
                  status: true,
                },
              },
            },
          },
        },
        orderBy: { startTime: 'asc' },
      });
      expect(result).toEqual(mockSlots);
    });

    it('should filter by status=BOOKED and limit=5', async () => {
      prisma.interviewSlot.findMany.mockResolvedValue([]);

      await service.findAll(userId, {
        status: InterviewSlotStatus.BOOKED,
        limit: 5,
      });

      expect(prisma.interviewSlot.findMany).toHaveBeenCalledWith({
        where: {
          form: {
            userId,
          },
          status: InterviewSlotStatus.BOOKED,
        },
        include: expect.any(Object),
        orderBy: { startTime: 'asc' },
        take: 5,
      });
    });

    it('should filter by formId and upcoming=true', async () => {
      prisma.interviewSlot.findMany.mockResolvedValue([]);

      await service.findAll(userId, {
        formId: 'form-uuid-xyz',
        upcoming: true,
      });

      expect(prisma.interviewSlot.findMany).toHaveBeenCalledWith({
        where: {
          form: {
            userId,
          },
          formId: 'form-uuid-xyz',
          endTime: { gte: expect.any(Date) },
        },
        include: expect.any(Object),
        orderBy: { startTime: 'asc' },
      });
    });
  });
});

