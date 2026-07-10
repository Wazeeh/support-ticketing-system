import { IsInt, IsString, IsEmail, IsOptional, IsIn, MinLength } from 'class-validator';

export class CreateTicketDto {
  @IsInt()
  piu_id: number;

  @IsInt()
  ti_id: number;

  @IsIn(['TMS', 'FINMAN'])
  software: string;

  @IsString()
  issue_category: string;

  @IsOptional()
  @IsString()
  other_description?: string;

  @IsString()
  @MinLength(1)
  description: string;

  @IsString()
  submitter_name: string;

  @IsEmail()
  submitter_email: string;

  @IsOptional()
  @IsString()
  submitter_phone?: string;
}