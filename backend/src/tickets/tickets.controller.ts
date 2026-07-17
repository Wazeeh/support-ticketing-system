import {
  Controller, Post, Get, Patch, Body, Param, ParseIntPipe,
  NotFoundException, UseGuards, Req,
} from '@nestjs/common';
import { TicketsService } from './tickets.service';
import { CreateTicketDto } from './dto/create-ticket.dto';
import { SetPriorityDto } from './dto/set-priority.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';

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

  @Patch('admin/:id/priority')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  async setPriority(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: SetPriorityDto,
    @Req() req,
  ) {
    return this.ticketsService.setPriority(id, dto, req.user.userId);
  }
}