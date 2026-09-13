import { ApiProperty } from '@nestjs/swagger';

export class AiHealthResponseDto {
  @ApiProperty({ example: 'ok' })
  status!: string;

  @ApiProperty({ example: 'ai-service' })
  service!: string;
}
