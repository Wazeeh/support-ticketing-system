import { Injectable, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Ticket } from './entities/ticket.entity';
import { CreateTicketDto } from './dto/create-ticket.dto';
import { VALID_CATEGORIES_BY_SOFTWARE } from '../common/category-software-map';

@Injectable()
export class TicketsService {
  constructor(
    @InjectRepository(Ticket)
    private ticketsRepo: Repository<Ticket>,
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

    // 3. Generate the tracking number
    const trackingNumber = await this.generateTrackingNumber();

    // 4. Build and save the ticket
    const ticket = this.ticketsRepo.create({
      ...dto,
      tracking_number: trackingNumber,
      status: 'SUBMITTED',
    });

    return this.ticketsRepo.save(ticket);
  }

  private async generateTrackingNumber(): Promise<string> {
    const year = new Date().getFullYear();
    const count = await this.ticketsRepo.count();
    const nextNumber = (count + 1).toString().padStart(6, '0');
    return `TKT-${year}-${nextNumber}`;
  }

  async findByTrackingNumber(trackingNumber: string): Promise<Ticket | null> {
    return this.ticketsRepo.findOne({ where: { tracking_number: trackingNumber } });
  }
}