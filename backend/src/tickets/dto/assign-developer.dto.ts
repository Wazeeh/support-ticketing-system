import { IsInt } from 'class-validator';

export class AssignDeveloperDto {
  @IsInt()
  developer_user_id: number;
}