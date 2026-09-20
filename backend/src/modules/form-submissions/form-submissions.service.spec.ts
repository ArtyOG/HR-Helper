import { Test, TestingModule } from '@nestjs/testing';
import { BadRequestException, NotFoundException, ForbiddenException } from '@nestjs/common';
import { FormSubmissionsService } from './form-submissions.service';
import { FormsService } from '../forms/forms.service';
import { AiService } from '../ai/ai.service';
import { PrismaService } from '../../prisma/prisma.service';
import { FieldType, SubmissionStatus } from '@prisma/client';

describe('FormSubmissionsService', () => {
  let service: FormSubmissionsService;
  let formsService: {
    findOne: jest.Mock;
  };
  let aiService: {
    processSubmission: jest.Mock;
  };
  let prisma: {
    formSubmission: {
      create: jest.Mock;
      findUnique: jest.Mock;
      findFirst: jest.Mock;
      findMany: jest.Mock;
      update: jest.Mock;
      updateMany: jest.Mock;
      delete: jest.Mock;
    };
    file: {
      findUnique: jest.Mock;
    };
    form: {
      findUnique: jest.Mock;
    };
    $transaction: jest.Mock;
  };

  beforeEach(async () => {
    formsService = {
      findOne: jest.fn(),
    };

    aiService = {
      processSubmission: jest.fn().mockResolvedValue(undefined),
    };

    prisma = {
      formSubmission: {
        create: jest.fn(),
        findUnique: jest.fn(),
        findFirst: jest.fn(),
        findMany: jest.fn(),
        update: jest.fn(),
        updateMany: jest.fn(),
        delete: jest.fn(),
      },
      file: {
        findUnique: jest.fn().mockResolvedValue({ id: 101, key: 'file-key' }),
      },
      form: {
        findUnique: jest.fn(),
      },
      $transaction: jest.fn((callback) => callback(prisma)),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        FormSubmissionsService,
        {
          provide: FormsService,
          useValue: formsService,
        },
        {
          provide: AiService,
          useValue: aiService,
        },
        {
          provide: PrismaService,
          useValue: prisma,
        },
      ],
    }).compile();

    service = module.get<FormSubmissionsService>(FormSubmissionsService);
  });

  describe('submit', () => {
    const validDto = {
      email: 'candidate@example.com',
      cvFileId: 101,
      answers: [
        { fieldId: 1, value: 'Jane Doe' },
        { fieldId: 2, optionId: 5 },
      ],
    };

    it('should throw NotFoundException if form does not exist', async () => {
      formsService.findOne.mockResolvedValue(null);

      await expect(service.submit('invalid-form-id', validDto)).rejects.toThrow(
        new NotFoundException('Form not found'),
      );
    });

    it('should throw BadRequestException if form has not opened yet', async () => {
      const futureDate = new Date(Date.now() + 1000 * 60 * 60 * 24); // Tomorrow
      formsService.findOne.mockResolvedValue({
        id: 'uuid-123',
        openAt: futureDate,
        closeAt: null,
        fields: [],
      });

      await expect(service.submit('uuid-123', validDto)).rejects.toThrow(
        new BadRequestException('Form is not open yet'),
      );
    });

    it('should throw BadRequestException if form submission period has closed', async () => {
      const pastDate = new Date(Date.now() - 1000 * 60 * 60 * 24); // Yesterday
      formsService.findOne.mockResolvedValue({
        id: 'uuid-123',
        openAt: new Date(Date.now() - 1000 * 60 * 60 * 48),
        closeAt: pastDate,
        fields: [],
      });

      await expect(service.submit('uuid-123', validDto)).rejects.toThrow(
        new BadRequestException('Form submission period has ended'),
      );
    });

    it('should throw BadRequestException if a required field has no answer', async () => {
      formsService.findOne.mockResolvedValue({
        id: 'uuid-123',
        openAt: null,
        closeAt: null,
        fields: [
          { id: 1, label: 'Full Name', required: true, type: FieldType.TEXT },
          { id: 99, label: 'Phone Number', required: true, type: FieldType.TEXT }, // Missing in answers
        ],
      });

      await expect(service.submit('uuid-123', validDto)).rejects.toThrow(
        new BadRequestException('Field Phone Number is required'),
      );
    });

    it('should successfully record submission and answers when input is valid', async () => {
      formsService.findOne.mockResolvedValue({
        id: 'uuid-123',
        openAt: null,
        closeAt: null,
        fields: [
          { id: 1, label: 'Full Name', required: true, type: FieldType.TEXT },
          { id: 2, label: 'Department', required: true, type: FieldType.SELECT },
        ],
      });

      const mockCreatedSubmission = {
        id: 'sub-uuid-101',
        formId: 'uuid-123',
        email: 'candidate@example.com',
        cvFileId: 101,
        createdAt: new Date(),
      };
      prisma.formSubmission.create.mockResolvedValue(mockCreatedSubmission);

      const result = await service.submit('uuid-123', validDto);

      expect(prisma.formSubmission.create).toHaveBeenCalledWith({
        data: {
          formId: 'uuid-123',
          email: 'candidate@example.com',
          cvFileId: 101,
          cvEvaluation: {
            create: {
              fileId: 101,
            },
          },
          answers: {
            create: [
              { fieldId: 1, value: 'Jane Doe', optionId: undefined },
              { fieldId: 2, value: undefined, optionId: 5 },
            ],
          },
        },
        include: {
          cvEvaluation: {
            include: {
              file: true,
            },
          },
          answers: true,
        },
      });
      expect(result).toEqual(mockCreatedSubmission);
    });
  });

  describe('findOne', () => {
    it('should return submission if user is the form creator', async () => {
      const mockSubmission = {
        id: 'sub-uuid-101',
        formId: 'uuid-123',
        form: { userId: 42 },
      };
      prisma.formSubmission.findUnique.mockResolvedValue(mockSubmission);

      const result = await service.findOne('sub-uuid-101', 42);
      expect(result).toEqual(mockSubmission);
    });

    it('should throw ForbiddenException if user does not own the form', async () => {
      const mockSubmission = {
        id: 'sub-uuid-101',
        formId: 'uuid-123',
        form: { userId: 42 },
      };
      prisma.formSubmission.findUnique.mockResolvedValue(mockSubmission);

      await expect(service.findOne('sub-uuid-101', 99)).rejects.toThrow(
        new ForbiddenException('You do not have permission to view this submission'),
      );
    });
  });

  describe('updateStatus', () => {
    it('should update submission status if user owns the form', async () => {
      const mockSubmission = {
        id: 'sub-uuid-101',
        formId: 'uuid-123',
        form: { userId: 42 },
      };
      prisma.formSubmission.findFirst.mockResolvedValue(mockSubmission);
      prisma.formSubmission.update.mockResolvedValue({
        ...mockSubmission,
        status: SubmissionStatus.APPROVED,
      });

      const result = await service.updateStatus(
        'uuid-123',
        'sub-uuid-101',
        SubmissionStatus.APPROVED,
        42,
      );

      expect(prisma.formSubmission.update).toHaveBeenCalledWith({
        where: { id: 'sub-uuid-101' },
        data: { status: SubmissionStatus.APPROVED },
        include: {
          cvEvaluation: {
            include: {
              file: true,
            },
          },
          answers: true,
        },
      });
      expect(result.status).toEqual(SubmissionStatus.APPROVED);
    });

    it('should throw ForbiddenException if user is not the owner', async () => {
      prisma.formSubmission.findFirst.mockResolvedValue({
        id: 'sub-uuid-101',
        formId: 'uuid-123',
        form: { userId: 42 },
      });

      await expect(
        service.updateStatus('uuid-123', 'sub-uuid-101', SubmissionStatus.APPROVED, 99),
      ).rejects.toThrow(
        new ForbiddenException('You do not have permission to update this submission'),
      );
    });
  });
});
