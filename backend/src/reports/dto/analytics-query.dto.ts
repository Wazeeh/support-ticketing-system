import { IsOptional, IsInt, IsEnum, IsDateString } from 'class-validator';
import { Type } from 'class-transformer';
import { software_type, issue_category } from '../../../generated/prisma/client';

export class AnalyticsQueryDto {
  @IsOptional()
  @IsDateString()
  submitted_from?: string;

  @IsOptional()
  @IsDateString()
  submitted_to?: string;

  @IsOptional()
  @IsDateString()
  completed_from?: string;

  @IsOptional()
  @IsDateString()
  completed_to?: string;

  @IsOptional()
  @IsEnum(issue_category)
  issue_category?: issue_category;

  @IsOptional()
  @IsEnum(software_type)
  software?: software_type;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  piu_id?: number;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  ti_id?: number;
}