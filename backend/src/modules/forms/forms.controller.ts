import { Controller, Post, Get, Body, Param, NotFoundException, Patch, Delete, HttpCode, UseGuards, Req } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { FormsService } from './forms.service';
import { CreateFormDto } from './dto/create-form.dto';
import { UpdateFormDto } from './dto/update-form.dto';
import { UpdateScheduleDto } from './dto/update-status.dto';
import { FormResponseDto, FormListResponseDto } from './dto/form-response.dto';
import { JwtAuthGuard } from '../auth/auth.middleware';

@ApiTags('forms')
@Controller('forms')
export class FormsController {
  constructor(private readonly formsService: FormsService) {}

  @Post()
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Create a new form' })
  @ApiResponse({ status: 201, type: FormResponseDto })
  async create(@Req() req: { user: { id: number } }, @Body() createFormDto: CreateFormDto) {
    return this.formsService.create(req.user.id, createFormDto);
  }

  @Get()
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Get all forms' })
  @ApiResponse({ status: 200, type: [FormListResponseDto] })
  async findAll(@Req() req: { user: { id: number } }) {
    return this.formsService.findAllByUserId(req.user.id);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a form by ID' })
  @ApiResponse({ status: 200, type: FormResponseDto })
  async findOne(@Param('id') id: string) {
    const form = await this.formsService.findOne(id);
    if (!form) {
      throw new NotFoundException('Form not found');
    }
    return form;
  }

  @Post(':formId/copy')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Copy an existing form' })
  @ApiResponse({ status: 201, type: FormResponseDto })
  async copy(@Req() req: { user: { id: number } }, @Param('formId') formId: string) {
    return this.formsService.copy(formId, req.user.id);
  }

  @Patch(':formId')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Update an existing form' })
  @ApiResponse({ status: 200, type: FormResponseDto })
  async update(@Req() req: { user: { id: number } }, @Param('formId') formId: string, @Body() updateFormDto: UpdateFormDto) {
    return this.formsService.update(formId, req.user.id, updateFormDto);
  }

  @Patch(':formId/status')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Update form schedule (open now, close at end time)' })
  @ApiResponse({ status: 200, type: FormResponseDto })
  async updateStatus(@Req() req: { user: { id: number } }, @Param('formId') formId: string, @Body() dto: UpdateScheduleDto) {
    return this.formsService.updateSchedule(formId, req.user.id, dto.closeAt);
  }

  @Delete(':formId')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @HttpCode(204)
  @ApiOperation({ summary: 'Delete a form' })
  @ApiResponse({ status: 204, description: 'Form deleted successfully' })
  async delete(@Req() req: { user: { id: number } }, @Param('formId') formId: string) {
    await this.formsService.delete(formId, req.user.id);
  }
}
