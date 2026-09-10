import { ApiProperty } from '@nestjs/swagger';
import { IsInt, IsNotEmpty } from 'class-validator';

export class BookInterviewSlotDto {
  @ApiProperty({ example: 1 })
  @IsInt()
  @IsNotEmpty()
  slotId!: number;
}
