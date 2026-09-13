import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty, IsUrl } from 'class-validator';

export class ScoreCvDto {
  @ApiProperty({
    description: 'Presigned URL to download candidate CV PDF',
    example: 'https://storage.example.com/documents/resume.pdf?token=...',
  })
  @IsString()
  @IsNotEmpty()
  @IsUrl()
  pdfUrl!: string;

  @ApiProperty({
    description: 'Job requirements text to score against',
    example: 'Looking for a Senior Backend Engineer proficient in NestJS, TypeScript, and Docker.',
  })
  @IsString()
  @IsNotEmpty()
  jobRequirements!: string;
}
