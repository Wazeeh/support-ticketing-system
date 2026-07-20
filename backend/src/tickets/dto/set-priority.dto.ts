import { IsIn } from 'class-validator';

export class SetPriorityDto {
  @IsIn(['LOW', 'MEDIUM', 'HIGH', 'URGENT'])
  priority: string;
}