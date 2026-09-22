import { Injectable, BadRequestException, NotFoundException, ForbiddenException, InternalServerErrorException } from '@nestjs/common';
import { S3Service } from '../s3/s3.service';
import { PrismaService } from '../../prisma/prisma.service';
import { FileResponseDto } from './dto/fileResponse.dto';
import { ResponseUploadUrlDto } from './dto/responseUploadUrl.dto';

@Injectable()
export class FilesService {
  constructor(private readonly s3Service: S3Service
    , private readonly prisma: PrismaService
  ) {}

  async getPresignedUploadUrl(filename: string, fileSize: number): Promise<ResponseUploadUrlDto> {
    if (!filename.toLowerCase().endsWith('.pdf')) {
      throw new BadRequestException('Only PDF files are allowed.');
    }

    if(fileSize <= 0) {
      throw new BadRequestException('File size must be greater than 0 bytes.');
    }

    if(fileSize > 10 * 1024 * 1024) {
      throw new BadRequestException('File size exceeds the maximum limit of 10 MB.');
    }

    const mimeType = 'application/pdf';

    const safeName = filename.replace(/[^a-zA-Z0-9.-]/g, '_');
    const key = `documents/${Date.now()}-${safeName}`;

    const uploadUrl = await this.s3Service.getPresignedUploadUrl(key, mimeType, fileSize, 60 * 60);

    return { key, uploadUrl };
  }

  async createFileRecord(key: string): Promise<FileResponseDto> {
    try {
      const metadata = await this.s3Service.getFileMetadata(key);
      if (!metadata) {
        throw new BadRequestException('File does not exis.');
      }

      const fileRecord = await this.prisma.file.create({
        data: {
          filename: key.split('/').pop() || 'unknown',
          key: key,
          contentType: metadata.contentType,
          size: metadata.contentLength,
        },
      });
      return new FileResponseDto(fileRecord);
    } catch (error) {
      throw new BadRequestException('Error creating file record.');
    } 
  }

  async getFileById(id: number, userId: number): Promise<FileResponseDto & { url: string }> {
    try {
      const fileRecord = await this.prisma.file.findUnique({
        where: { id },
        include: {
          submissions: {
            include: {
              form: {
                select: {
                  userId: true,
                },
              },
            },
          },
        },
      });

      if (!fileRecord) {
        throw new NotFoundException(`File is not found.`);
      }

      const isAuthorized = fileRecord.submissions.some(
        (submission) => submission.form.userId === userId,
      );

      if (!isAuthorized) {
        throw new ForbiddenException('You do not have permission to access this file.');
      }

      const res = await this.s3Service.getPresignedDownloadUrl(fileRecord.key, 60);
      const fileResponse = new FileResponseDto(fileRecord);
      return { ...fileResponse, url: res };
    } catch (error) {
      if (error instanceof NotFoundException || error instanceof ForbiddenException) {
        throw error;
      }
      throw new InternalServerErrorException('Error retrieving file record.');
    }
  }
}