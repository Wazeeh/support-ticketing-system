import { Injectable, BadRequestException, NotFoundException, ForbiddenException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Ticket } from './entities/ticket.entity';
import { AuditLog } from '../audit-logs/entities/audit-log.entity';
import { CreateTicketDto } from './dto/create-ticket.dto';
import { SetPriorityDto } from './dto/set-priority.dto';
import { VALID_CATEGORIES_BY_SOFTWARE } from '../common/category-software-map';

@Injectable()
export class TicketsService {
  constructor(
    @InjectRepository(Ticket)
    private ticketsRepo: Repository<Ticket>,
    @InjectRepository(AuditLog)
    private auditLogsRepo: Repository<AuditLog>,
  ) {}

  async create(dto: CreateTicketDto): Promise<Ticket> {
    // 1. Category must belong to the chosen software
    const allowedCategories = VALID_CATEGORIES_BY_SOFTWARE[dto.software];
    if (!allowedCategories || !allowedCategories.includes(dto.issue_category)) {
      throw new BadRequestException(
        `"${dto.issue_category}" is not a valid category for ${dto.software}`,
      );
    }

    // 2. other_description is required only when category is OTHER
    if (dto.issue_category === 'OTHER' && !dto.other_description) {
      throw new BadRequestException('other_description is required when issue_category is OTHER');
    }

    // No tracking_number here — the DB trigger (trg_generate_tracking_number) generates it on insert
    const ticket = this.ticketsRepo.create({
      ...dto,
      status: 'SUBMITTED',
    });

    return this.ticketsRepo.save(ticket);
  }

  async findByTrackingNumber(trackingNumber: string): Promise<Ticket | null> {
    return this.ticketsRepo.findOne({ where: { tracking_number: trackingNumber } });
  }

  async setPriority(ticketId: number, dto: SetPriorityDto, actorUserId: number): Promise<Ticket> {
    const ticket = await this.ticketsRepo.findOne({ where: { id: ticketId } });
    if (!ticket) {
      throw new NotFoundException(`No ticket found with id ${ticketId}`);
    }

    if (ticket.status !== 'SUBMITTED') {
      throw new ForbiddenException(
        `Cannot set priority: ticket is in status ${ticket.status}, expected SUBMITTED`,
      );
    }

    const fromStatus = ticket.status;

    ticket.priority = dto.priority;
    ticket.status = 'ACCEPTED';
    ticket.accepted_by_user_id = actorUserId;
    ticket.accepted_at = new Date();

    const savedTicket = await this.ticketsRepo.save(ticket);

    const auditLog = this.auditLogsRepo.create({
      ticket_id: ticket.id,
      actor_id: actorUserId,
      action: 'PRIORITY_SET',
      from_value: fromStatus,
      to_value: 'ACCEPTED',
      note: `Priority set to ${dto.priority}`,
    });
    await this.auditLogsRepo.save(auditLog);

    return savedTicket;
  }
}