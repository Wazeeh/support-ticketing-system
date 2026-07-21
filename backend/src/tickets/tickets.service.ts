import {
  Injectable,
  BadRequestException,
  NotFoundException,
  ConflictException,
  ForbiddenException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { Ticket } from './entities/ticket.entity';
import { AuditLog } from '../audit-logs/entities/audit-log.entity';
import { TicketReply } from '../ticket-replies/entities/ticket-reply.entity';
import { UserLookup } from '../notifications/entities/user-lookup.entity';

import { CreateTicketDto } from './dto/create-ticket.dto';
import { SetPriorityDto } from './dto/set-priority.dto';
import { AssignDeveloperDto } from './dto/assign-developer.dto';
import { CreateReplyDto } from '../ticket-replies/dto/create-reply.dto';
import { ReassignDeveloperDto } from './dto/reassign-developer.dto';
import { RouteToAdminDto } from './dto/route-to-admin.dto';

import { VALID_CATEGORIES_BY_SOFTWARE } from '../common/category-software-map';
import { NotificationsService } from '../notifications/notifications.service';
import { AttachmentsService } from '../attachments/attachments.service';
import { MailService } from '../mail/mail.service';

export interface CreateTicketResponse {
  ticket_id: number;
  tracking_number: string;
  status: string;
  created_at: Date;
  confirmation_email_sent: boolean;
}
@Injectable()
export class TicketsService {
  constructor(
    @InjectRepository(Ticket)
    private readonly ticketsRepo: Repository<Ticket>,

    @InjectRepository(AuditLog)
    private readonly auditLogsRepo: Repository<AuditLog>,

    @InjectRepository(TicketReply)
    private readonly ticketRepliesRepo: Repository<TicketReply>,

    @InjectRepository(UserLookup)
    private readonly usersRepo: Repository<UserLookup>,

    private readonly notificationsService: NotificationsService,
    private readonly attachmentsService: AttachmentsService,
    private readonly mailService: MailService,
  ) {}

  async create(
    dto: CreateTicketDto,
    files?: Express.Multer.File[],
  ): Promise<CreateTicketResponse> {
    const allowedCategories =
      VALID_CATEGORIES_BY_SOFTWARE[dto.software];

    if (
      !allowedCategories ||
      !allowedCategories.includes(dto.issue_category)
    ) {
      throw new BadRequestException(
        `"${dto.issue_category}" is not a valid category for ${dto.software}`,
      );
    }

    if (
      dto.issue_category === 'OTHER' &&
      !dto.other_description
    ) {
      throw new BadRequestException(
        'other_description is required when issue_category is OTHER',
      );
    }

    const ticket = this.ticketsRepo.create({
      ...dto,
      status: 'SUBMITTED',
    });

    const initialSave =
      await this.ticketsRepo.save(ticket);

    const savedTicket =
      await this.ticketsRepo.findOne({
        where: {
          id: initialSave.id,
        },
      });

    if (!savedTicket) {
      throw new NotFoundException(
        'Ticket was created but could not be re-fetched',
      );
    }

    if (files && files.length > 0) {
      await this.attachmentsService.uploadFiles(
        savedTicket.id,
        files,
        null,
      );
    }

    await this.notificationsService.notifyAllAdmins(
      savedTicket.id,
      'NEW_TICKET',
      `New ticket ${savedTicket.tracking_number} submitted`,
    );

    const confirmationEmailSent =
      await this.mailService.sendTicketConfirmation({
        recipientName: savedTicket.submitter_name,
        recipientEmail: savedTicket.submitter_email,
        trackingNumber: savedTicket.tracking_number,
      });

    return {
      ticket_id: savedTicket.id,
      tracking_number: savedTicket.tracking_number,
      status: savedTicket.status,
      created_at: savedTicket.created_at,
      confirmation_email_sent: confirmationEmailSent,
    };
  }

  async findByTrackingNumber(
    trackingNumber: string,
  ): Promise<Ticket | null> {
    return this.ticketsRepo.findOne({
      where: {
        tracking_number: trackingNumber,
      },
    });
  }

  async findOneDetail(
    ticketId: number,
  ): Promise<
    Ticket & {
      replies: TicketReply[];
      timeline: AuditLog[];
    }
  > {
    const ticket =
      await this.ticketsRepo.findOne({
        where: {
          id: ticketId,
        },
      });

    if (!ticket) {
      throw new NotFoundException(
        `No ticket found with id ${ticketId}`,
      );
    }

    const replies =
      await this.ticketRepliesRepo.find({
        where: {
          ticket_id: ticketId,
        },
        order: {
          created_at: 'ASC',
        },
      });

    const timeline =
      await this.auditLogsRepo.find({
        where: {
          ticket_id: ticketId,
        },
        order: {
          created_at: 'ASC',
        },
      });

    return {
      ...ticket,
      replies,
      timeline,
    };
  }

  async findAll(params: {
    search?: string;
    status?: string;
    priority?: string;
    software?: string;
    piu_id?: number;
    page?: number;
    page_size?: number;
  }): Promise<{
    data: Ticket[];
    total: number;
    page: number;
    page_size: number;
  }> {
    const page =
      params.page && params.page > 0
        ? params.page
        : 1;

    const pageSize =
      params.page_size && params.page_size > 0
        ? params.page_size
        : 25;

    const query =
      this.ticketsRepo.createQueryBuilder('ticket');

    if (params.search) {
      query.andWhere(
        'ticket.tracking_number ILIKE :search',
        {
          search: `%${params.search}%`,
        },
      );
    }

    if (params.status) {
      query.andWhere(
        'ticket.status = :status',
        {
          status: params.status,
        },
      );
    }

    if (params.priority) {
      query.andWhere(
        'ticket.priority = :priority',
        {
          priority: params.priority,
        },
      );
    }

    if (params.software) {
      query.andWhere(
        'ticket.software = :software',
        {
          software: params.software,
        },
      );
    }

    if (params.piu_id) {
      query.andWhere(
        'ticket.piu_id = :piu_id',
        {
          piu_id: params.piu_id,
        },
      );
    }

    query.orderBy(
      'ticket.created_at',
      'DESC',
    );

    query
      .skip((page - 1) * pageSize)
      .take(pageSize);

    const [data, total] =
      await query.getManyAndCount();

    return {
      data,
      total,
      page,
      page_size: pageSize,
    };
  }

  async findAllForDeveloper(
    developerId: number,
    params: {
      search?: string;
      status?: string;
      priority?: string;
      software?: string;
      piu_id?: number;
      page?: number;
      page_size?: number;
    },
  ): Promise<{
    data: Ticket[];
    total: number;
    page: number;
    page_size: number;
  }> {
    const page =
      params.page && params.page > 0
        ? params.page
        : 1;

    const pageSize =
      params.page_size && params.page_size > 0
        ? params.page_size
        : 25;

    const query =
      this.ticketsRepo.createQueryBuilder('ticket');

    query.where(
      'ticket.assigned_to_user_id = :developerId',
      {
        developerId,
      },
    );

    if (params.search) {
      query.andWhere(
        'ticket.tracking_number ILIKE :search',
        {
          search: `%${params.search}%`,
        },
      );
    }

    if (params.status) {
      query.andWhere(
        'ticket.status = :status',
        {
          status: params.status,
        },
      );
    }

    if (params.priority) {
      query.andWhere(
        'ticket.priority = :priority',
        {
          priority: params.priority,
        },
      );
    }

    if (params.software) {
      query.andWhere(
        'ticket.software = :software',
        {
          software: params.software,
        },
      );
    }

    if (params.piu_id) {
      query.andWhere(
        'ticket.piu_id = :piu_id',
        {
          piu_id: params.piu_id,
        },
      );
    }

    query.orderBy(
      'ticket.created_at',
      'DESC',
    );

    query
      .skip((page - 1) * pageSize)
      .take(pageSize);

    const [data, total] =
      await query.getManyAndCount();

    return {
      data,
      total,
      page,
      page_size: pageSize,
    };
  }

  async findOneForDeveloper(
    ticketId: number,
    actorUserId: number,
  ): Promise<
    Ticket & {
      replies: TicketReply[];
      timeline: AuditLog[];
    }
  > {
    const ticket =
      await this.ticketsRepo.findOne({
        where: {
          id: ticketId,
        },
      });

    if (!ticket) {
      throw new NotFoundException(
        `No ticket found with id ${ticketId}`,
      );
    }

    if (
      ticket.assigned_to_user_id !==
      actorUserId
    ) {
      throw new ForbiddenException(
        'You are not the assigned developer for this ticket',
      );
    }

    const replies =
      await this.ticketRepliesRepo.find({
        where: {
          ticket_id: ticketId,
        },
        order: {
          created_at: 'ASC',
        },
      });

    const timeline =
      await this.auditLogsRepo.find({
        where: {
          ticket_id: ticketId,
        },
        order: {
          created_at: 'ASC',
        },
      });

    return {
      ...ticket,
      replies,
      timeline,
    };
  }

  async getTimeline(
    ticketId: number,
    actorUserId: number,
    role: string,
  ): Promise<{
    events: any[];
    duration_summary: {
      time_in_status: Record<string, number>;
    };
  }> {
    const ticket =
      await this.ticketsRepo.findOne({
        where: {
          id: ticketId,
        },
      });

    if (!ticket) {
      throw new NotFoundException(
        `No ticket found with id ${ticketId}`,
      );
    }

    if (
      role === 'DEVELOPER' &&
      ticket.assigned_to_user_id !==
        actorUserId
    ) {
      throw new ForbiddenException(
        'You are not the assigned developer for this ticket',
      );
    }

    const logs =
      await this.auditLogsRepo.find({
        where: {
          ticket_id: ticketId,
        },
        order: {
          created_at: 'ASC',
        },
      });

    const actorIds = [
      ...new Set(
        logs
          .map((log) => log.actor_id)
          .filter(
            (id): id is number =>
              id != null,
          ),
      ),
    ];

    const actors = actorIds.length
      ? await this.usersRepo.find({
          where: actorIds.map((id) => ({
            id,
          })),
        })
      : [];

    const actorMap = new Map(
      actors.map((actor) => [
        actor.id,
        actor,
      ]),
    );

    const events = logs.map((log) => {
      const actor =
        log.actor_id != null
          ? actorMap.get(log.actor_id)
          : null;

      return {
        id: String(log.id),
        action: log.action,
        from_value: log.from_value,
        to_value: log.to_value,
        note: log.note,
        timestamp: log.created_at,
        actor_name: actor
          ? actor.full_name
          : null,
        actor_role: actor
          ? actor.role
          : null,
      };
    });

    const statusChanges = logs.filter(
      (log) =>
        log.action === 'STATUS_CHANGED',
    );

    const timeInStatus: Record<
      string,
      number
    > = {};

    for (
      let index = 0;
      index < statusChanges.length;
      index += 1
    ) {
      const current =
        statusChanges[index];

      const next =
        statusChanges[index + 1];

      const statusName =
        current.to_value ?? 'UNKNOWN';

      const endTime = next
        ? next.created_at.getTime()
        : Date.now();

      const hours =
        (endTime -
          current.created_at.getTime()) /
        (1000 * 60 * 60);

      timeInStatus[statusName] =
        (timeInStatus[statusName] ?? 0) +
        Math.round(hours * 100) / 100;
    }

    return {
      events,
      duration_summary: {
        time_in_status: timeInStatus,
      },
    };
  }

  async setPriority(
    ticketId: number,
    dto: SetPriorityDto,
    actorUserId: number,
  ): Promise<Ticket> {
    const ticket =
      await this.ticketsRepo.findOne({
        where: {
          id: ticketId,
        },
      });

    if (!ticket) {
      throw new NotFoundException(
        `No ticket found with id ${ticketId}`,
      );
    }

    if (ticket.status !== 'SUBMITTED') {
      throw new ConflictException(
        `Cannot set priority: ticket is in status ${ticket.status}, expected SUBMITTED`,
      );
    }

    const fromStatus = ticket.status;

    ticket.priority = dto.priority;
    ticket.status = 'ACCEPTED';
    ticket.accepted_by_user_id =
      actorUserId;
    ticket.accepted_at = new Date();

    const savedTicket =
      await this.ticketsRepo.save(ticket);

    const auditLog =
      this.auditLogsRepo.create({
        ticket_id: ticket.id,
        actor_id: actorUserId,
        action: 'PRIORITY_SET',
        from_value: fromStatus,
        to_value: 'ACCEPTED',
        note: `Priority set to ${dto.priority}`,
      });

    await this.auditLogsRepo.save(
      auditLog,
    );

    return savedTicket;
  }

  async assignDeveloper(
    ticketId: number,
    dto: AssignDeveloperDto,
    actorUserId: number,
  ): Promise<Ticket> {
    const ticket =
      await this.ticketsRepo.findOne({
        where: {
          id: ticketId,
        },
      });

    if (!ticket) {
      throw new NotFoundException(
        `No ticket found with id ${ticketId}`,
      );
    }

    if (ticket.status !== 'ACCEPTED') {
      throw new ConflictException(
        `Cannot assign developer: ticket is in status ${ticket.status}, expected ACCEPTED`,
      );
    }

    const fromStatus = ticket.status;

    ticket.assigned_to_user_id =
      dto.developer_user_id;

    ticket.status = 'ASSIGNED';

    const savedTicket =
      await this.ticketsRepo.save(ticket);

    const auditLog =
      this.auditLogsRepo.create({
        ticket_id: ticket.id,
        actor_id: actorUserId,
        action: 'ASSIGNED',
        from_value: fromStatus,
        to_value: 'ASSIGNED',
        note: `Assigned to user ${dto.developer_user_id}`,
      });

    await this.auditLogsRepo.save(
      auditLog,
    );

    await this.notificationsService.notifyUser(
      dto.developer_user_id,
      savedTicket.id,
      'ASSIGNED_TO_YOU',
      `Ticket ${savedTicket.tracking_number} was assigned to you`,
    );

    return savedTicket;
  }

  async addReply(
    ticketId: number,
    dto: CreateReplyDto,
    actorUserId: number,
  ): Promise<TicketReply> {
    const ticket =
      await this.ticketsRepo.findOne({
        where: {
          id: ticketId,
        },
      });

    if (!ticket) {
      throw new NotFoundException(
        `No ticket found with id ${ticketId}`,
      );
    }

    if (ticket.status === 'CLOSED') {
      throw new ConflictException(
        'Cannot reply to a closed ticket',
      );
    }

    const fromStatus = ticket.status;

    const reply =
      this.ticketRepliesRepo.create({
        ticket_id: ticketId,
        author_user_id: actorUserId,
        message: dto.message,
        is_closing_reply:
          dto.is_closing_reply ?? false,
      });

    const savedReply =
      await this.ticketRepliesRepo.save(
        reply,
      );

    if (ticket.status === 'ASSIGNED') {
      ticket.status = 'IN_PROGRESS';

      await this.ticketsRepo.save(ticket);

      const auditLog =
        this.auditLogsRepo.create({
          ticket_id: ticket.id,
          actor_id: actorUserId,
          action: 'REPLY_ADDED',
          from_value: fromStatus,
          to_value: 'IN_PROGRESS',
          note:
            'First reply — ticket moved to in progress',
        });

      await this.auditLogsRepo.save(
        auditLog,
      );
    } else {
      const auditLog =
        this.auditLogsRepo.create({
          ticket_id: ticket.id,
          actor_id: actorUserId,
          action: 'REPLY_ADDED',
          from_value: ticket.status,
          to_value: ticket.status,
          note: 'Reply added',
        });

      await this.auditLogsRepo.save(
        auditLog,
      );
    }

    return savedReply;
  }

  async addReplyAsDeveloper(
    ticketId: number,
    dto: CreateReplyDto,
    actorUserId: number,
  ): Promise<TicketReply> {
    const ticket =
      await this.ticketsRepo.findOne({
        where: {
          id: ticketId,
        },
      });

    if (!ticket) {
      throw new NotFoundException(
        `No ticket found with id ${ticketId}`,
      );
    }

    if (
      ticket.assigned_to_user_id !==
      actorUserId
    ) {
      throw new ForbiddenException(
        'You are not the assigned developer for this ticket',
      );
    }

    return this.addReply(
      ticketId,
      dto,
      actorUserId,
    );
  }

  async completeTicket(
    ticketId: number,
    actorUserId: number,
  ): Promise<Ticket> {
    const ticket =
      await this.ticketsRepo.findOne({
        where: {
          id: ticketId,
        },
      });

    if (!ticket) {
      throw new NotFoundException(
        `No ticket found with id ${ticketId}`,
      );
    }

    if (
      ticket.status !== 'IN_PROGRESS'
    ) {
      throw new ConflictException(
        `Cannot complete ticket: ticket is in status ${ticket.status}, expected IN_PROGRESS`,
      );
    }

    const fromStatus = ticket.status;

    ticket.status = 'COMPLETED';
    ticket.completed_at = new Date();

    const savedTicket =
      await this.ticketsRepo.save(ticket);

    const auditLog =
      this.auditLogsRepo.create({
        ticket_id: ticket.id,
        actor_id: actorUserId,
        action: 'STATUS_CHANGED',
        from_value: fromStatus,
        to_value: 'COMPLETED',
        note:
          'Marked as completed by developer',
      });

    await this.auditLogsRepo.save(
      auditLog,
    );

    return savedTicket;
  }

  async completeTicketAsDeveloper(
    ticketId: number,
    actorUserId: number,
  ): Promise<Ticket> {
    const ticket =
      await this.ticketsRepo.findOne({
        where: {
          id: ticketId,
        },
      });

    if (!ticket) {
      throw new NotFoundException(
        `No ticket found with id ${ticketId}`,
      );
    }

    if (
      ticket.assigned_to_user_id !==
      actorUserId
    ) {
      throw new ForbiddenException(
        'You are not the assigned developer for this ticket',
      );
    }

    return this.completeTicket(
      ticketId,
      actorUserId,
    );
  }

  async reassignTicket(
    ticketId: number,
    dto: ReassignDeveloperDto,
    actorUserId: number,
  ): Promise<Ticket> {
    const ticket =
      await this.ticketsRepo.findOne({
        where: {
          id: ticketId,
        },
      });

    if (!ticket) {
      throw new NotFoundException(
        `No ticket found with id ${ticketId}`,
      );
    }

    if (
      ticket.assigned_to_user_id !==
      actorUserId
    ) {
      throw new ForbiddenException(
        'You are not the assigned developer for this ticket',
      );
    }

    if (
      !['ASSIGNED', 'IN_PROGRESS'].includes(
        ticket.status,
      )
    ) {
      throw new ConflictException(
        `Cannot reassign: ticket is in status ${ticket.status}, expected ASSIGNED or IN_PROGRESS`,
      );
    }

    const targetDeveloper =
      await this.usersRepo.findOne({
        where: {
          id: dto.target_developer_user_id,
          role: 'DEVELOPER',
          is_active: true,
        },
      });

    if (!targetDeveloper) {
      throw new NotFoundException(
        'Target developer not found or inactive',
      );
    }

    const previousAssigneeId =
      ticket.assigned_to_user_id;

    ticket.assigned_to_user_id =
      dto.target_developer_user_id;

    const savedTicket =
      await this.ticketsRepo.save(ticket);

    const auditLog =
      this.auditLogsRepo.create({
        ticket_id: ticket.id,
        actor_id: actorUserId,
        action: 'REASSIGNED',
        from_value: String(
          previousAssigneeId,
        ),
        to_value: String(
          dto.target_developer_user_id,
        ),
        note: dto.note ?? null,
      });

    await this.auditLogsRepo.save(
      auditLog,
    );

    await this.notificationsService.notifyUser(
      dto.target_developer_user_id,
      savedTicket.id,
      'ASSIGNED_TO_YOU',
      `Ticket ${savedTicket.tracking_number} was reassigned to you`,
    );

    return savedTicket;
  }

  async routeToAdmin(
    ticketId: number,
    dto: RouteToAdminDto,
    actorUserId: number,
  ): Promise<Ticket> {
    const ticket =
      await this.ticketsRepo.findOne({
        where: {
          id: ticketId,
        },
      });

    if (!ticket) {
      throw new NotFoundException(
        `No ticket found with id ${ticketId}`,
      );
    }

    if (
      ticket.assigned_to_user_id !==
      actorUserId
    ) {
      throw new ForbiddenException(
        'You are not the assigned developer for this ticket',
      );
    }

    if (ticket.status === 'CLOSED') {
      throw new ConflictException(
        'Cannot route a closed ticket back to admin',
      );
    }

    const fromStatus = ticket.status;

    ticket.assigned_to_user_id = null;
    ticket.status = 'ACCEPTED';

    const savedTicket =
      await this.ticketsRepo.save(ticket);

    const auditLog =
      this.auditLogsRepo.create({
        ticket_id: ticket.id,
        actor_id: actorUserId,
        action: 'ROUTED_TO_ADMIN',
        from_value: fromStatus,
        to_value: 'ACCEPTED',
        note: dto.note ?? null,
      });

    await this.auditLogsRepo.save(
      auditLog,
    );

    return savedTicket;
  }

  async closeTicket(
    ticketId: number,
    actorUserId: number,
  ): Promise<Ticket> {
    const ticket =
      await this.ticketsRepo.findOne({
        where: {
          id: ticketId,
        },
      });

    if (!ticket) {
      throw new NotFoundException(
        `No ticket found with id ${ticketId}`,
      );
    }

    if (ticket.status !== 'COMPLETED') {
      throw new ConflictException(
        `Cannot close ticket: ticket is in status ${ticket.status}, expected COMPLETED`,
      );
    }

    const fromStatus = ticket.status;

    ticket.status = 'CLOSED';
    ticket.closed_at = new Date();

    const savedTicket =
      await this.ticketsRepo.save(ticket);

    const auditLog =
      this.auditLogsRepo.create({
        ticket_id: ticket.id,
        actor_id: actorUserId,
        action: 'CLOSED',
        from_value: fromStatus,
        to_value: 'CLOSED',
        note: 'Ticket closed by admin',
      });

    await this.auditLogsRepo.save(
      auditLog,
    );

    return savedTicket;
  }

  async reopenTicket(
    ticketId: number,
    actorUserId: number,
  ): Promise<Ticket> {
    const ticket =
      await this.ticketsRepo.findOne({
        where: {
          id: ticketId,
        },
      });

    if (!ticket) {
      throw new NotFoundException(
        `No ticket found with id ${ticketId}`,
      );
    }

    if (ticket.status !== 'CLOSED') {
      throw new ConflictException(
        `Cannot reopen ticket: ticket is in status ${ticket.status}, expected CLOSED`,
      );
    }

    const fromStatus = ticket.status;

    let assigneeStillActive = false;

    if (ticket.assigned_to_user_id) {
      const assignee =
        await this.usersRepo.findOne({
          where: {
            id: ticket.assigned_to_user_id,
            is_active: true,
          },
        });

      assigneeStillActive = Boolean(
        assignee,
      );
    }

    ticket.status = assigneeStillActive
      ? 'ASSIGNED'
      : 'ACCEPTED';

    ticket.closed_at = null;

    if (!assigneeStillActive) {
      ticket.assigned_to_user_id = null;
    }

    const savedTicket =
      await this.ticketsRepo.save(ticket);

    const auditLog =
      this.auditLogsRepo.create({
        ticket_id: ticket.id,
        actor_id: actorUserId,
        action: 'REOPENED',
        from_value: fromStatus,
        to_value: savedTicket.status,
        note: 'Ticket reopened by admin',
      });

    await this.auditLogsRepo.save(
      auditLog,
    );

    return savedTicket;
  }
}