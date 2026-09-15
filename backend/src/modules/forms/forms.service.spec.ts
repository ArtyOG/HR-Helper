import { Test, TestingModule } from '@nestjs/testing';
import { ForbiddenException, NotFoundException } from '@nestjs/common';
import { FormsService } from './forms.service';
import { PrismaService } from '../../prisma/prisma.service';
import { FieldType } from '@prisma/client';

describe('FormsService', () => {
  let service: FormsService;
  let prisma: {
    user: {
      findUnique: jest.Mock;
    };
    form: {
      create: jest.Mock;
      findMany: jest.Mock;
      findUnique: jest.Mock;
      update: jest.Mock;
      delete: jest.Mock;
    };
    formSubmission: {
      count: jest.Mock;
    };
    field: {
      deleteMany: jest.Mock;
    };
    $transaction: jest.Mock;
  };

  const mockUser = {
    id: 1,
    email: 'hr@example.com',
    name: 'HR Manager',
  };

  const mockForm = {
    id: 'uuid-123',
    title: 'Software Engineer Application',
    description: 'Apply here',
    requirements: '3+ years experience',
    isOpen: true,
    openAt: new Date('2026-09-01T00:00:00.000Z'),
    closeAt: new Date('2026-09-30T00:00:00.000Z'),
    userId: 1,
    fields: [
      {
        id: 10,
        formId: 'uuid-123',
        label: 'Full Name',
        type: FieldType.TEXT,
        required: true,
        order: 0,
        options: [],
      },
    ],
    _count: { submissions: 0 },
  };

  beforeEach(async () => {
    prisma = {
      user: {
        findUnique: jest.fn().mockResolvedValue(mockUser),
      },
      form: {
        create: jest.fn(),
        findMany: jest.fn(),
        findUnique: jest.fn(),
        update: jest.fn(),
        delete: jest.fn(),
      },
      formSubmission: {
        count: jest.fn(),
      },
      field: {
        deleteMany: jest.fn(),
      },
      $transaction: jest.fn((callback) => callback(prisma)),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        FormsService,
        {
          provide: PrismaService,
          useValue: prisma,
        },
      ],
    }).compile();

    service = module.get<FormsService>(FormsService);
  });

  describe('create', () => {
    it('should create a form with fields and options', async () => {
      const dto = {
        title: 'Software Engineer Application',
        description: 'Apply here',
        requirements: '3+ years experience',
        fields: [
          {
            label: 'Full Name',
            type: FieldType.TEXT,
            required: true,
          },
        ],
      };

      prisma.form.create.mockResolvedValue({ id: 'uuid-123', ...dto, userId: 1 });

      const result = await service.create(1, dto);

      expect(prisma.user.findUnique).toHaveBeenCalledWith({ where: { id: 1 } });
      expect(prisma.form.create).toHaveBeenCalledWith({
        data: {
          title: dto.title,
          description: dto.description,
          requirements: dto.requirements,
          userId: 1,
          fields: {
            create: [
              {
                label: 'Full Name',
                type: FieldType.TEXT,
                required: true,
                order: 0,
                options: {
                  create: undefined,
                },
              },
            ],
          },
        },
        include: {
          fields: {
            orderBy: { order: 'asc' },
            include: {
              options: {
                orderBy: { order: 'asc' },
              },
            },
          },
        },
      });
      expect(result.id).toEqual('uuid-123');
    });

    it('should throw NotFoundException if user does not exist', async () => {
      prisma.user.findUnique.mockResolvedValue(null);

      await expect(
        service.create(999, {
          title: 'Title',
          fields: [],
        }),
      ).rejects.toThrow(new NotFoundException('User does not exist'));
    });
  });

  describe('update', () => {
    const updateDto = {
      title: 'Updated Application',
      fields: [
        {
          label: 'Portfolio URL',
          type: FieldType.TEXT,
          required: false,
        },
      ],
    };

    it('should update a form if user is owner and no submissions exist', async () => {
      prisma.form.findUnique.mockResolvedValue({ id: 'uuid-123', userId: 1 });
      prisma.formSubmission.count.mockResolvedValue(0);
      prisma.form.update.mockResolvedValue({ id: 'uuid-123', title: 'Updated Application' });

      const result = await service.update('uuid-123', 1, updateDto);

      expect(prisma.field.deleteMany).toHaveBeenCalledWith({ where: { formId: 'uuid-123' } });
      expect(prisma.form.update).toHaveBeenCalled();
      expect(result.title).toEqual('Updated Application');
    });

    it('should throw ForbiddenException if user is not the owner', async () => {
      prisma.form.findUnique.mockResolvedValue({ id: 'uuid-123', userId: 2 }); // different user

      await expect(service.update('uuid-123', 1, updateDto)).rejects.toThrow(
        new ForbiddenException('You do not have permission to edit this form'),
      );
    });

    it('should throw ForbiddenException if form already has submissions (locking rule)', async () => {
      prisma.form.findUnique.mockResolvedValue({ id: 'uuid-123', userId: 1 });
      prisma.formSubmission.count.mockResolvedValue(3); // submissions exist!

      await expect(service.update('uuid-123', 1, updateDto)).rejects.toThrow(
        new ForbiddenException('Cannot edit a form that has received submissions'),
      );
    });
  });

  describe('copy', () => {
    it('should clone an existing form with Copy of prefix and isOpen set to false', async () => {
      prisma.form.findUnique.mockResolvedValue(mockForm);
      prisma.form.create.mockResolvedValue({
        ...mockForm,
        id: 'uuid-456',
        title: 'Copy of Software Engineer Application',
        isOpen: false,
      });

      const result = await service.copy('uuid-123', 1);

      expect(prisma.user.findUnique).toHaveBeenCalledWith({ where: { id: 1 } });
      expect(prisma.form.findUnique).toHaveBeenCalledWith({
        where: { id: 'uuid-123' },
        include: {
          fields: {
            orderBy: { order: 'asc' },
            include: {
              options: {
                orderBy: { order: 'asc' },
              },
            },
          },
        },
      });
      expect(prisma.form.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            title: 'Copy of Software Engineer Application',
            isOpen: false,
            userId: 1,
          }),
        }),
      );
      expect(result.id).toEqual('uuid-456');
    });

    it('should throw NotFoundException if the form to copy does not exist', async () => {
      prisma.form.findUnique.mockResolvedValue(null);

      await expect(service.copy('non-existent-id', 1)).rejects.toThrow(
        new NotFoundException('Form not found'),
      );
    });
  });

  describe('updateSchedule', () => {
    it('should update openAt to now and set closeAt', async () => {
      prisma.form.findUnique.mockResolvedValue({ id: 'uuid-123', userId: 1 });
      prisma.form.update.mockResolvedValue({
        id: 'uuid-123',
        closeAt: new Date('2026-10-01T00:00:00.000Z'),
      });

      const result = await service.updateSchedule('uuid-123', 1, '2026-10-01T00:00:00.000Z');

      expect(prisma.form.update).toHaveBeenCalledWith({
        where: { id: 'uuid-123' },
        data: {
          openAt: expect.any(Date),
          closeAt: new Date('2026-10-01T00:00:00.000Z'),
        },
      });
      expect(result.id).toEqual('uuid-123');
    });

    it('should throw ForbiddenException if user does not own the form', async () => {
      prisma.form.findUnique.mockResolvedValue({ id: 'uuid-123', userId: 99 });

      await expect(
        service.updateSchedule('uuid-123', 1, '2026-10-01T00:00:00.000Z'),
      ).rejects.toThrow(
        new ForbiddenException('You do not have permission to update this form'),
      );
    });
  });
});
