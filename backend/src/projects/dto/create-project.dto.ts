import { IsString, IsOptional, IsDate, IsEnum, IsNumber } from 'class-validator';
import { ProjectStatus } from '@prisma/client';

export class CreateProjectDto {
  @IsString()
  name: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsString()
  @IsOptional()
  clientName?: string;

  @IsString()
  @IsOptional()
  clientEmail?: string;

  @IsDate()
  @IsOptional()
  startDate?: Date;

  @IsDate()
  @IsOptional()
  endDate?: Date;

  @IsEnum(ProjectStatus)
  @IsOptional()
  status?: ProjectStatus;

  @IsNumber()
  @IsOptional()
  budget?: number;
}
