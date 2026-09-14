import { ApiProperty } from '@nestjs/swagger';

export class ScoreResponseDto {
  @ApiProperty({ example: true })
  success!: boolean;

  @ApiProperty({ example: 87.5 })
  score!: number;
}
