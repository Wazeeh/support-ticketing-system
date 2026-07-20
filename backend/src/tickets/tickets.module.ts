import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TicketsController } from './tickets.controller';
import { TicketsAdminAliasController } from './tickets-admin-alias.controller';
import { TicketsDeveloperAliasController } from './tickets-developer-alias.controller';
import { TicketsService } from './tickets.service';
import { Ticket } from './entities/ticket.entity';
import { AuditLog } from '../audit-logs/entities/audit-log.entity';
import { TicketReply } from '../ticket-replies/entities/ticket-reply.entity';
import { UserLookup } from '../notifications/entities/user-lookup.entity';
import { NotificationsModule } from '../notifications/notifications.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Ticket, AuditLog, TicketReply, UserLookup]),
    NotificationsModule,
  ],
  controllers: [TicketsController, TicketsAdminAliasController, TicketsDeveloperAliasController],
  providers: [TicketsService],
})
export class TicketsModule {}