import { Controller, Post, Get, Body, Param, UseGuards, Req } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { InterviewSlotsService } from './interview-slots.service';
import { CreateInterviewSlotsDto } from './dto/create-interview-slot.dto';
import { BookInterviewSlotDto } from './dto/book-interview-slot.dto';
import { InterviewSlotResponseDto } from './dto/interview-slot-response.dto';
import { JwtAuthGuard } from '../auth/auth.middleware';

@ApiTags('interview-slots')
@Controller()
export class InterviewSlotsController {
  constructor(private readonly slotsService: InterviewSlotsService) {}

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
