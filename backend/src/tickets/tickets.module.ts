import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TicketsController } from './tickets.controller';
import { TicketsService } from './tickets.service';
import { Ticket } from './entities/ticket.entity';
import { AuditLog } from '../audit-logs/entities/audit-log.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Ticket, AuditLog])],
  controllers: [TicketsController],
  providers: [TicketsService],
})
export class TicketsModule {}