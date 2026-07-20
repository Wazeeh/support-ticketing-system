import { IsEnum } from 'class-validator';

export enum TicketPriority {
  LOW = 'LOW',
  MEDIUM = 'MEDIUM',
  HIGH = 'HIGH',
  URGENT = 'URGENT',
}

export class SetPriorityDto {
  @IsEnum(TicketPriority)
  priority!: TicketPriority;
}
