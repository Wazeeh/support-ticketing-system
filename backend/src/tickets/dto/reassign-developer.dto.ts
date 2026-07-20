import { IsInt, IsOptional, IsString } from 'class-validator';

export class ReassignDeveloperDto {
  @IsInt()
  target_developer_user_id: number;

  @IsOptional()
  @IsString()
  note?: string;
}