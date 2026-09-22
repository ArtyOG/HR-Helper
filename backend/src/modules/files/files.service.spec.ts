import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException, ForbiddenException, BadRequestException } from '@nestjs/common';
import { FilesService } from './files.service';
import { PrismaService } from '../../prisma/prisma.service';
import { S3Service } from '../s3/s3.service';

describe('FilesService', () => {
  let service: FilesService;
  let prisma: {
    file: {
      findUnique: jest.Mock;
      create: jest.Mock;
    };
  };
  let s3Service: {
    getPresignedUploadUrl: jest.Mock;
    getPresignedDownloadUrl: jest.Mock;
    getFileMetadata: jest.Mock;
    uploadFile: jest.Mock;
  };

  const mockFile = {
    id: 1,
    filename: 'resume.pdf',
    key: 'documents/1725531200000-resume.pdf',
    size: 1024,
    contentType: 'application/pdf',
    createdAt: new Date(),
    updatedAt: new Date(),
    submissions: [
      {
        id: 'sub-uuid-1',
        formId: 'form-uuid-1',
        form: {
          userId: 10,
        },
      },
    ],
  };

  beforeEach(async () => {
    prisma = {
      file: {
        findUnique: jest.fn(),
        create: jest.fn(),
      },
    };

    s3Service = {
      getPresignedUploadUrl: jest.fn(),
      getPresignedDownloadUrl: jest.fn(),
      getFileMetadata: jest.fn(),
      uploadFile: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        FilesService,
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

    service = module.get<FilesService>(FilesService);
  });

  describe('getFileById', () => {
    it('should throw NotFoundException if file does not exist', async () => {
      prisma.file.findUnique.mockResolvedValue(null);

      await expect(service.getFileById(999, 10)).rejects.toThrow(NotFoundException);
      expect(prisma.file.findUnique).toHaveBeenCalledWith({
        where: { id: 999 },
        include: {
          submissions: {
            include: {
              form: {
                select: { userId: true },
              },
            },
          },
        },
      });
    });

    it('should throw ForbiddenException if file has no submissions (orphaned upload)', async () => {
      prisma.file.findUnique.mockResolvedValue({
        ...mockFile,
        submissions: [],
      });

      await expect(service.getFileById(1, 10)).rejects.toThrow(ForbiddenException);
    });

    it('should throw ForbiddenException if user does not own the submission form', async () => {
      prisma.file.findUnique.mockResolvedValue(mockFile);

      // User 99 is not the owner (owner is 10)
      await expect(service.getFileById(1, 99)).rejects.toThrow(ForbiddenException);
      expect(s3Service.getPresignedDownloadUrl).not.toHaveBeenCalled();
    });

    it('should return file details and presigned download URL if user owns the form', async () => {
      prisma.file.findUnique.mockResolvedValue(mockFile);
      s3Service.getPresignedDownloadUrl.mockResolvedValue('https://s3.example.com/download-url');

      const result = await service.getFileById(1, 10);

      expect(result).toBeDefined();
      expect(result.url).toBe('https://s3.example.com/download-url');
      expect(s3Service.getPresignedDownloadUrl).toHaveBeenCalledWith(mockFile.key, 60);
    });
  });

  describe('removed endpoints verification', () => {
    it('should not have getFile method', () => {
      expect((service as any).getFile).toBeUndefined();
    });

    it('should not have uploadFileDirect method', () => {
      expect((service as any).uploadFileDirect).toBeUndefined();
    });
  });

  describe('getPresignedUploadUrl', () => {
    it('should reject non-pdf file', async () => {
      await expect(service.getPresignedUploadUrl('test.png', 1024)).rejects.toThrow(BadRequestException);
    });

    it('should reject file size <= 0', async () => {
      await expect(service.getPresignedUploadUrl('test.pdf', 0)).rejects.toThrow(BadRequestException);
    });

    it('should reject file size > 10MB', async () => {
      await expect(service.getPresignedUploadUrl('test.pdf', 11 * 1024 * 1024)).rejects.toThrow(BadRequestException);
    });

    it('should generate presigned upload url for valid pdf', async () => {
      s3Service.getPresignedUploadUrl.mockResolvedValue('https://s3.example.com/upload');

      const result = await service.getPresignedUploadUrl('my-resume.pdf', 2048);

      expect(result).toHaveProperty('key');
      expect(result).toHaveProperty('uploadUrl', 'https://s3.example.com/upload');
    });
  });
});
