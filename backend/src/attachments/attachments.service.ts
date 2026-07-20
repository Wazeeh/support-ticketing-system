import {
  Injectable,
  BadRequestException,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import {
  S3Client,
  PutObjectCommand,
  GetObjectCommand,
} from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { randomUUID } from 'crypto';
import { TicketAttachment } from './entities/ticket-attachment.entity';
import { Ticket } from '../tickets/entities/ticket.entity';
import { AuditLog } from '../audit-logs/entities/audit-log.entity';

interface MulterFile {
  originalname: string;
  mimetype: string;
  size: number;
  buffer: Buffer;
}

const ALLOWED_MIME_TYPES = new Set([
  'application/pdf',
  'image/png',
  'image/jpeg',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  'text/csv',
]);

const MAX_FILES_PER_TICKET = 10;
const MAX_TOTAL_BYTES = 20 * 1024 * 1024;

@Injectable()
export class AttachmentsService {
  private readonly s3: S3Client;
  private readonly bucket: string;

  constructor(
    @InjectRepository(TicketAttachment)
    private readonly attachmentsRepo: Repository<TicketAttachment>,

    @InjectRepository(Ticket)
    private readonly ticketsRepo: Repository<Ticket>,

    @InjectRepository(AuditLog)
    private readonly auditLogsRepo: Repository<AuditLog>,
  ) {
    this.s3 = new S3Client({
      region: process.env.AWS_REGION,
    });

    this.bucket = process.env.AWS_S3_BUCKET_NAME!;

    if (!this.bucket) {
      throw new Error('AWS_S3_BUCKET_NAME is missing from .env');
    }
  }

  async uploadFiles(
    ticketId: number,
    files: MulterFile[],
    actorUserId: number | null,
  ): Promise<TicketAttachment[]> {
    const ticket = await this.ticketsRepo.findOne({
      where: { id: ticketId },
    });

    if (!ticket) {
      throw new NotFoundException(`Ticket ${ticketId} not found`);
    }

    if (!files || files.length === 0) {
      throw new BadRequestException('At least one file is required');
    }

    const existing = await this.attachmentsRepo.find({
      where: { ticket_id: ticketId },
    });

    const existingCount = existing.length;

    const existingBytes = existing.reduce(
      (sum, attachment) => sum + Number(attachment.size_bytes),
      0,
    );

    if (existingCount + files.length > MAX_FILES_PER_TICKET) {
      throw new BadRequestException(
        `Max ${MAX_FILES_PER_TICKET} files allowed per ticket`,
      );
    }

    const newBytes = files.reduce(
      (sum, file) => sum + file.size,
      0,
    );

    if (existingBytes + newBytes > MAX_TOTAL_BYTES) {
      throw new BadRequestException(
        'Cumulative attachment size exceeds 20MB for this ticket',
      );
    }

    for (const file of files) {
      if (!ALLOWED_MIME_TYPES.has(file.mimetype)) {
        throw new BadRequestException(
          `${file.originalname}: file type not allowed`,
        );
      }

      if (file.size <= 0) {
        throw new BadRequestException(
          `${file.originalname}: empty file is not allowed`,
        );
      }
    }

    const saved: TicketAttachment[] = [];

    for (const file of files) {
      const safeName = file.originalname.replace(
        /[^a-zA-Z0-9.\-_]/g,
        '_',
      );

      const storageKey =
        `tickets/${ticketId}/${randomUUID()}-${safeName}`;

      await this.s3.send(
        new PutObjectCommand({
          Bucket: this.bucket,
          Key: storageKey,
          Body: file.buffer,
          ContentType: file.mimetype,
        }),
      );

      const attachment = this.attachmentsRepo.create({
        ticket_id: ticketId,
        file_name: file.originalname,
        storage_key: storageKey,
        mime_type: file.mimetype,
        size_bytes: file.size,
        uploaded_by_user_id: actorUserId,
      });

      const savedAttachment =
        await this.attachmentsRepo.save(attachment);

      saved.push(savedAttachment);
    }

    await this.auditLogsRepo.save(
      this.auditLogsRepo.create({
        ticket_id: ticketId,
        actor_id: actorUserId ?? undefined,
        action: 'ATTACHMENT_ADDED',
        note: `${files.length} file(s) uploaded`,
      }),
    );

    return saved;
  }

  async uploadFilesForUser(
    ticketId: number,
    files: MulterFile[],
    userId: number,
    role: string,
  ): Promise<TicketAttachment[]> {
    const ticket = await this.findTicketOrFail(ticketId);

    this.ensureTicketAccess(ticket, userId, role);

    return this.uploadFiles(ticketId, files, userId);
  }

  async listForAuthorizedUser(
    ticketId: number,
    userId: number,
    role: string,
  ): Promise<TicketAttachment[]> {
    const ticket = await this.findTicketOrFail(ticketId);

    this.ensureTicketAccess(ticket, userId, role);

    return this.attachmentsRepo.find({
      where: { ticket_id: ticketId },
      order: { created_at: 'DESC' },
    });
  }

  async getAuthorizedDownloadUrl(
    attachmentId: number,
    userId: number,
    role: string,
  ): Promise<string> {
    const attachment = await this.attachmentsRepo.findOne({
      where: { id: attachmentId },
    });

    if (!attachment) {
      throw new NotFoundException(
        `Attachment ${attachmentId} not found`,
      );
    }

    const ticket = await this.findTicketOrFail(
      Number(attachment.ticket_id),
    );

    this.ensureTicketAccess(ticket, userId, role);

    return this.generateDownloadUrl(attachment);
  }

  async listForTicket(
    ticketId: number,
  ): Promise<TicketAttachment[]> {
    const ticket = await this.findTicketOrFail(ticketId);

    return this.attachmentsRepo.find({
      where: { ticket_id: ticket.id },
      order: { created_at: 'DESC' },
    });
  }

  async getDownloadUrl(
    attachmentId: number,
  ): Promise<string> {
    const attachment = await this.attachmentsRepo.findOne({
      where: { id: attachmentId },
    });

    if (!attachment) {
      throw new NotFoundException(
        `Attachment ${attachmentId} not found`,
      );
    }

    return this.generateDownloadUrl(attachment);
  }

  private async findTicketOrFail(
    ticketId: number,
  ): Promise<Ticket> {
    const ticket = await this.ticketsRepo.findOne({
      where: { id: ticketId },
    });

    if (!ticket) {
      throw new NotFoundException(
        `Ticket ${ticketId} not found`,
      );
    }

    return ticket;
  }

  private ensureTicketAccess(
    ticket: Ticket,
    userId: number,
    role: string,
  ): void {
    if (role === 'ADMIN') {
      return;
    }

    if (
      role === 'DEVELOPER' &&
      Number(ticket.assigned_to_user_id) === Number(userId)
    ) {
      return;
    }

    throw new ForbiddenException(
      'You do not have permission to access attachments for this ticket',
    );
  }

  private async generateDownloadUrl(
    attachment: TicketAttachment,
  ): Promise<string> {
    const safeDownloadName = attachment.file_name.replace(
      /["\r\n]/g,
      '_',
    );

    const command = new GetObjectCommand({
      Bucket: this.bucket,
      Key: attachment.storage_key,
      ResponseContentDisposition:
        `attachment; filename="${safeDownloadName}"`,
    });

    return getSignedUrl(this.s3, command, {
      expiresIn: 300,
    });
  }
}