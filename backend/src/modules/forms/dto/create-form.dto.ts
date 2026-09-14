import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsNotEmpty, IsOptional, IsBoolean, IsArray, IsEnum, ValidateNested, IsNumber } from 'class-validator';
import { Type } from 'class-transformer';
import { FieldType } from '@prisma/client';

class CreateOptionDto {
  @ApiPropertyOptional()
  @IsNumber()
  @IsOptional()
  order?: number;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  value!: string;
}

class CreateFieldDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  label!: string;

  @ApiProperty({ enum: FieldType })
  @IsEnum(FieldType)
  type!: FieldType;

  @ApiPropertyOptional()
  @IsBoolean()
  @IsOptional()
  required?: boolean;

  @ApiPropertyOptional()
  @IsNumber()
  @IsOptional()
  order?: number;

  @ApiPropertyOptional({ type: [CreateOptionDto] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateOptionDto)
  @IsOptional()
  options?: CreateOptionDto[];
}

export class CreateFormDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  title!: string;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  description?: string;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  requirements?: string;

  @ApiProperty({ type: [CreateFieldDto] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateFieldDto)
  fields!: CreateFieldDto[];
}
