import { Controller, Post, Get, Body, Param, UseGuards, Req } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiParam, ApiBearerAuth } from '@nestjs/swagger';
import { FilesService } from './files.service';
import { CreateUploadUrlDto } from './dto/createUploadUrl.dto';
import { CreateFileRecordDto } from './dto/createFileRecord.dto';
import { JwtAuthGuard } from '../auth/auth.middleware';

@ApiTags('files')
@Controller('files')
export class FilesController {
  constructor(private readonly filesService: FilesService) {}

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

  @Get(':id')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Get file details and presigned download URL by ID' })
  @ApiParam({ name: 'id', description: 'The ID of the file record', type: Number })
  @ApiResponse({ status: 200, description: 'File details and download URL retrieved successfully.' })
  @ApiResponse({ status: 401, description: 'Unauthorized.' })
  @ApiResponse({ status: 403, description: 'Forbidden. You do not own the form associated with this file.' })
  @ApiResponse({ status: 404, description: 'File not found.' })
  async getFileById(
    @Req() req: { user: { id: number } },
    @Param('id') id: number,
  ) {
    return this.filesService.getFileById(Number(id), req.user.id);
  }
}