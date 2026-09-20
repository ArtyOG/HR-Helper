import { Controller, Post, Get, Delete, Body, Param, Query, UseGuards, Req, HttpCode, ParseIntPipe } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { InterviewSlotsService } from './interview-slots.service';
import { CreateInterviewSlotsDto } from './dto/create-interview-slot.dto';
import { BookInterviewSlotDto } from './dto/book-interview-slot.dto';
import { InterviewSlotResponseDto } from './dto/interview-slot-response.dto';
import { FilterInterviewSlotsDto } from './dto/filter-interview-slots.dto';
import { JwtAuthGuard } from '../auth/auth.middleware';

@ApiTags('interview-slots')
@Controller()
export class InterviewSlotsController {
  constructor(private readonly slotsService: InterviewSlotsService) {}

  @Get('interview-slots')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Get all interview timeslots for authenticated HR user with optional filtering' })
  @ApiResponse({ status: 200, type: [InterviewSlotResponseDto] })
  async findAll(
    @Req() req: { user: { id: number } },
    @Query() query: FilterInterviewSlotsDto,
  ) {
    return this.slotsService.findAll(req.user.id, query);
  }

  @Post('forms/:formId/interview-slots')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Batch create interview timeslots for a form (HR)' })
  @ApiResponse({ status: 201, type: [InterviewSlotResponseDto] })
  async createSlots(
    @Req() req: { user: { id: number } },
    @Param('formId') formId: string,
    @Body() dto: CreateInterviewSlotsDto,
  ) {
    return this.slotsService.createSlots(formId, req.user.id, dto);
  }

  @Get('forms/:formId/interview-slots')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Get all interview timeslots for a form (HR)' })
  @ApiResponse({ status: 200, type: [InterviewSlotResponseDto] })
  async findAllByFormId(
    @Req() req: { user: { id: number } },
    @Param('formId') formId: string,
  ) {
    return this.slotsService.findAllByFormId(formId, req.user.id);
  }

  @Get('forms/:formId/interview-slots/available')
  @ApiOperation({ summary: 'Get available interview timeslots for candidates (Public)' })
  @ApiResponse({ status: 200, type: [InterviewSlotResponseDto] })
  async findAvailableByFormId(@Param('formId') formId: string) {
    return this.slotsService.findAvailableByFormId(formId);
  }

  @Delete('forms/:formId/interview-slots/:slotId')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @HttpCode(204)
  @ApiOperation({ summary: 'Delete an unbooked interview timeslot (HR)' })
  @ApiResponse({ status: 204, description: 'Interview slot deleted successfully' })
  @ApiResponse({ status: 400, description: 'Cannot delete a booked interview slot' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  @ApiResponse({ status: 404, description: 'Form or interview slot not found' })
  async deleteSlot(
    @Req() req: { user: { id: number } },
    @Param('formId') formId: string,
    @Param('slotId', ParseIntPipe) slotId: number,
  ) {
    await this.slotsService.deleteSlot(formId, slotId, req.user.id);
  }

  @Delete('forms/:formId/interview-slots')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @HttpCode(204)
  @ApiOperation({ summary: 'Clear all unbooked interview timeslots for a form (HR)' })
  @ApiResponse({ status: 204, description: 'All unbooked interview slots deleted successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  @ApiResponse({ status: 404, description: 'Form not found' })
  async clearSlots(
    @Req() req: { user: { id: number } },
    @Param('formId') formId: string,
  ) {
    await this.slotsService.clearSlots(formId, req.user.id);
  }

  @Post('submissions/:submissionId/interview-slot')
  @ApiOperation({ summary: 'Book an interview timeslot (Candidate)' })
  @ApiResponse({ status: 201, type: InterviewSlotResponseDto })
  async bookSlot(
    @Param('submissionId') submissionId: string,
    @Body() dto: BookInterviewSlotDto,
  ) {
    return this.slotsService.bookSlot(submissionId, dto.slotId);
  }

  @Get('submissions/:submissionId/interview-slot')
  @ApiOperation({ summary: 'Get interview booking details for a submission' })
  @ApiResponse({ status: 200, type: InterviewSlotResponseDto })
  async getBooking(@Param('submissionId') submissionId: string) {
    return this.slotsService.getBookingBySubmissionId(submissionId);
  }
}
