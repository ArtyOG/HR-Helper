import { Controller, Post, Get, Body, Param, UseInterceptors, UploadedFile, BadRequestException } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiTags, ApiOperation, ApiResponse, ApiParam, ApiConsumes, ApiBody } from '@nestjs/swagger';
import { FilesService } from './files.service';
import { CreateUploadUrlDto } from './dto/createUploadUrl.dto';
import { CreateFileRecordDto } from './dto/createFileRecord.dto';

@ApiTags('files')
@Controller('files')
export class FilesController {
  constructor(private readonly filesService: FilesService) {}

  @Post('upload')
  @UseInterceptors(FileInterceptor('file', {
    limits: { fileSize: 10 * 1024 * 1024 },
  }))
  @ApiOperation({ summary: 'Directly upload a CV file to S3 via backend (bypasses browser S3 CORS)' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        file: {
          type: 'string',
          format: 'binary',
        },
      },
    },
  })
  @ApiResponse({ status: 201, description: 'File uploaded successfully.' })
  async uploadFile(
    @UploadedFile() file: { originalname: string; mimetype: string; size: number; buffer: Buffer },
  ) {
    if (!file) {
      throw new BadRequestException('No file uploaded.');
    }
    return this.filesService.uploadFileDirect(file);
  }

  @Post()
  @ApiOperation({ summary: 'Create a file record in the database' })
  @ApiResponse({ status: 201, description: 'File record created successfully.' })
  async createFileRecord(@Body() dto: CreateFileRecordDto) {
    return this.filesService.createFileRecord(dto.key);
  }

  @Post('presigned-url')
  @ApiOperation({ summary: 'Create a pre-signed upload URL for S3' })
  @ApiResponse({ status: 201, description: 'Pre-signed URL created successfully.' })
  async createUploadUrl(@Body() dto: CreateUploadUrlDto) {
    return this.filesService.getPresignedUploadUrl(dto.filename, dto.filesize);
  }

  @Get()
  @ApiOperation({ summary: 'Get all file records' })
  @ApiResponse({ status: 200, description: 'File records retrieved successfully.' })
  async getFile() {
    return this.filesService.getFile();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get file details by ID' })
  @ApiParam({ name: 'id', description: 'The ID of the file record', type: Number })
  @ApiResponse({ status: 200, description: 'File details retrieved successfully.' })
  async getFileById(@Param('id') id: number) {
    return this.filesService.getFileById(id);
  }
}