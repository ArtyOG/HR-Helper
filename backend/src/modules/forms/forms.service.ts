import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateFormDto } from './dto/create-form.dto';
import { UpdateFormDto } from './dto/update-form.dto';

@Injectable()
export class FormsService {
  constructor(private prisma: PrismaService) {}

  async create(userId: number, dto: CreateFormDto) {
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user) {
      throw new NotFoundException(`User does not exist`);
    }

    return this.prisma.form.create({
      data: {
        title: dto.title,
        description: dto.description,
        requirements: dto.requirements,
        userId: userId,
        fields: {
          create: dto.fields.map((field, fieldIdx) => ({
            label: field.label,
            type: field.type,
            required: field.required || false,
            order: field.order ?? fieldIdx,
            options: {
              create: field.options?.map((opt, optIdx) => ({
                value: opt.value,
                order: opt.order ?? optIdx,
              })),
            },
          })),
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
  }

  async findAllByUserId(userId: number) {
    const forms = await this.prisma.form.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      include: {
        _count: {
          select: { submissions: true },
        },
      },
    });

    return forms.map(({ _count, ...form }) => ({
      ...form,
      submissionCount: _count.submissions,
    }));
  }

  async findOne(id: string) {
    const form = await this.prisma.form.findUnique({
      where: { id },
      include: {
        fields: {
          orderBy: { order: 'asc' },
          include: {
            options: {
              orderBy: { order: 'asc' },
            },
          },
        },
        _count: {
          select: { submissions: true },
        },
      },
    });

    if (!form) return null;

    const { _count, ...formData } = form;
    return {
      ...formData,
      submissionCount: _count.submissions,
    };
  }

  async update(id: string, userId: number, dto: UpdateFormDto) {
    const form = await this.prisma.form.findUnique({ where: { id } });
    if (!form) {
      throw new NotFoundException('Form not found');
    }
    if (form.userId !== userId) {
      throw new ForbiddenException('You do not have permission to edit this form');
    }

    const hasSubmissions = await this.prisma.formSubmission.count({
      where: { formId: id },
    });

    if (hasSubmissions > 0) {
      throw new ForbiddenException('Cannot edit a form that has received submissions');
    }

    return this.prisma.$transaction(async (tx: Prisma.TransactionClient) => {
      // 1. Delete all existing fields (options will cascade delete)
      await tx.field.deleteMany({
        where: { formId: id },
      });

      // 2. Recreate the form fields and options
      return tx.form.update({
        where: { id },
        data: {
          title: dto.title,
          description: dto.description,
          requirements: dto.requirements,
          fields: {
            create: dto.fields.map((field, fieldIdx) => ({
              label: field.label,
              type: field.type,
              required: field.required || false,
              order: field.order ?? fieldIdx,
              options: {
                create: field.options?.map((opt, optIdx) => ({
                  value: opt.value,
                  order: opt.order ?? optIdx,
                })),
              },
            })),
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
    });
  }

  async copy(id: string, userId: number) {
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user) {
      throw new NotFoundException(`User does not exist`);
    }

    const originalForm = await this.prisma.form.findUnique({
      where: { id },
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
    
    if (!originalForm) {
      throw new NotFoundException('Form not found');
    }

    return this.prisma.form.create({
      data: {
        title: `Copy of ${originalForm.title}`,
        description: originalForm.description,
        requirements: originalForm.requirements,
        userId: userId,
        isOpen: false,
        fields: {
          create: originalForm.fields.map((field: typeof originalForm.fields[number]) => ({
            label: field.label,
            type: field.type,
            required: field.required,
            order: field.order,
            options: {
              create: field.options.map((opt: typeof field.options[number]) => ({
                value: opt.value,
                order: opt.order,
              })),
            },
          })),
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
  }

  async updateSchedule(id: string, userId: number, closeAt: string) {
    const form = await this.prisma.form.findUnique({ where: { id } });
    if (!form) {
      throw new NotFoundException('Form not found');
    }
    if (form.userId !== userId) {
      throw new ForbiddenException('You do not have permission to update this form');
    }

    return this.prisma.form.update({
      where: { id },
      data: {
        openAt: new Date(), // Start immediately
        closeAt: new Date(closeAt),
      },
    });
  }

  async delete(id: string, userId: number) {
    const form = await this.prisma.form.findUnique({ where: { id } });
    if (!form) {
      throw new NotFoundException('Form not found');
    }
    if (form.userId !== userId) {
      throw new ForbiddenException('You do not have permission to delete this form');
    }

    try {
      return await this.prisma.form.delete({
        where: { id },
      });
    } catch (error: any) {
      if (error?.code === 'P2025') {
        throw new NotFoundException(`Form with ID ${id} not found`);
      }
      throw error;
    }
  }
}
