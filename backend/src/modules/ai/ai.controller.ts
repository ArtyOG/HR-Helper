import { Controller, Get, Post, Body, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { AiService } from './ai.service';
import { AiHealthResponseDto } from './dto/ai-health-response.dto';
import { ScoreCvDto } from './dto/score-cv.dto';
import { ScoreResponseDto } from './dto/score-response.dto';
import { JwtAuthGuard } from '../auth/auth.middleware';

@ApiTags('ai')
@Controller('ai')
export class AiController {
  constructor(private readonly aiService: AiService) {}

  @Get('health')
  @ApiOperation({ summary: 'Check connectivity with AI service' })
  @ApiResponse({ status: 200, type: AiHealthResponseDto })
  async checkHealth(): Promise<AiHealthResponseDto> {
    return this.aiService.checkHealth();
  }

  @Post('score')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Direct test endpoint to score a CV against job requirements' })
  @ApiResponse({ status: 200, type: ScoreResponseDto })
  async scoreCv(@Body() dto: ScoreCvDto): Promise<ScoreResponseDto> {
    const score = await this.aiService.scoreCv(dto.pdfUrl, dto.jobRequirements);
    return {
      success: true,
      score,
    };
  }
}
