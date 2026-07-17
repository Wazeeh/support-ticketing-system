import { Controller, Post, Get, Body, Param, NotFoundException } from '@nestjs/common';
import { TicketsService } from './tickets.service';
import { CreateTicketDto } from './dto/create-ticket.dto';

@Controller('tickets')
export class TicketsController {
  constructor(private readonly ticketsService: TicketsService) {}

  @Post()
  async create(@Body() dto: CreateTicketDto) {
    return this.ticketsService.create(dto);
  }

  @Get(':trackingNumber')
  async getByTrackingNumber(@Param('trackingNumber') trackingNumber: string) {
    const ticket = await this.ticketsService.findByTrackingNumber(trackingNumber);
    if (!ticket) {
      throw new NotFoundException('No ticket found with that tracking number');
    }
    return ticket;
  }
}