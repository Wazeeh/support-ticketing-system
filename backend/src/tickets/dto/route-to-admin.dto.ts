import { IsOptional, IsString } from 'class-validator';

export class RouteToAdminDto {
  @IsOptional()
  @IsString()
  note?: string;
}