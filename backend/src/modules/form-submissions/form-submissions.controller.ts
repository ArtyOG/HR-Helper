import { Controller, Post, Get, Patch, Body, Param, UseGuards, NotFoundException, Req, Delete, HttpCode } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { FormSubmissionsService } from './form-submissions.service';
import { SubmitFormDto } from './dto/submit-form.dto';
import { SubmissionResponseDto } from './dto/submission-response.dto';
import { SubmissionDetailResponseDto } from './dto/submission-detail-response.dto';
import { UpdateSubmissionStatusDto } from './dto/update-submission-status.dto';
import { BulkUpdateSubmissionStatusDto } from './dto/bulk-update-submission-status.dto';
import { JwtAuthGuard } from '../auth/auth.middleware';
@ApiTags('form-submissions')
@Controller('forms/:formId/submissions')
export class FormSubmissionsController {
  constructor(private readonly submissionsService: FormSubmissionsService) {}

  @Post()
  @ApiOperation({ summary: 'Submit a form' })
  @ApiResponse({ status: 201, type: SubmissionResponseDto })
  async submit(@Param('formId') formId: string, @Body() submitFormDto: SubmitFormDto) {
    return this.submissionsService.submit(formId, submitFormDto);
  }

  @Get()
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Get all submissions for a form' })
  @ApiResponse({ status: 200, type: [SubmissionResponseDto] })
  async findAll(@Req() req: { user: { id: number } }, @Param('formId') formId: string) {
    return this.submissionsService.findAllByFormId(formId, req.user.id);
  }

  @Get(':submissionId')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Get a submission by ID with form structure' })
  @ApiResponse({ status: 200, type: SubmissionDetailResponseDto })
  async findOne(@Req() req: { user: { id: number } }, @Param('formId') formId: string, @Param('submissionId') submissionId: string) {
    return this.submissionsService.findOne(submissionId, req.user.id);
  }


  @Patch('bulk/status')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Bulk update submission statuses' })
  @ApiResponse({ status: 200, description: 'Statuses updated successfully' })
  async bulkUpdateStatus(
    @Req() req: { user: { id: number } },
    @Param('formId') formId: string,
    @Body() dto: BulkUpdateSubmissionStatusDto,
  ) {
    return this.submissionsService.bulkUpdateStatus(formId, dto.submissionIds, dto.status, req.user.id);
  }

  @Patch(':submissionId/status')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Update a submission status' })
  @ApiResponse({ status: 200, type: SubmissionDetailResponseDto })
  async updateStatus(
    @Req() req: { user: { id: number } },
    @Param('formId') formId: string,
    @Param('submissionId') submissionId: string,
    @Body() dto: UpdateSubmissionStatusDto,
  ) {
    return this.submissionsService.updateStatus(formId, submissionId, dto.status, req.user.id);
  }

  @Delete(':submissionId')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @HttpCode(204)
  @ApiOperation({ summary: 'Delete a submission' })
  @ApiResponse({ status: 204, description: 'Submission deleted successfully' })
  async delete(@Req() req: { user: { id: number } }, @Param('submissionId') submissionId: string) {
    return this.submissionsService.delete(submissionId, req.user.id);
  }

  @Post(':submissionId/rescore')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Re-trigger AI CV scoring for a submission' })
  @ApiResponse({ status: 200, type: SubmissionResponseDto })
  async rescore(
    @Req() req: { user: { id: number } },
    @Param('formId') formId: string,
    @Param('submissionId') submissionId: string,
  ) {
    return this.submissionsService.rescore(formId, submissionId, req.user.id);
  }
}
