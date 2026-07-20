import { Controller, Post, Patch, Get, Body, Param, Query, ParseIntPipe, NotFoundException, UseGuards, Req, UseInterceptors, UploadedFile } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import type { Request } from 'express';
import { TicketsService } from './tickets.service';
import { CreateTicketDto } from './dto/create-ticket.dto';
import { SetPriorityDto } from './dto/set-priority.dto';
import { AssignDeveloperDto } from './dto/assign-developer.dto';
import { CreateReplyDto } from '../ticket-replies/dto/create-reply.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';

@Controller('tickets')
export class TicketsController {
  constructor(private readonly ticketsService: TicketsService) {}

  @Post()
  @UseInterceptors(FileInterceptor('attachment'))
  async create(
    @Body() dto: CreateTicketDto,
    @UploadedFile() file: Express.Multer.File,
  ) {
    return this.ticketsService.create(dto, file);
  }

  @Get('track/:trackingNumber')
  async trackByTrackingNumber(@Param('trackingNumber') trackingNumber: string) {
    const ticket = await this.ticketsService.findByTrackingNumber(trackingNumber);
    if (!ticket) {
      throw new NotFoundException('No ticket found with that tracking number');
    }
    return ticket;
  }

  // NOTE: must stay ABOVE ':trackingNumber' to avoid being swallowed by it,
  // and it must come before any other single-segment dynamic GET route.
  @Get('developer/tickets')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('DEVELOPER')
  async findMyTickets(
    @Req() req: Request,
    @Query()
    query: {
      search?: string;
      status?: string;
      priority?: string;
      software?: string;
      piu_id?: string;
      page?: string;
      page_size?: string;
    },
  ) {
    const developerId = (req.user as any).userId;
    return this.ticketsService.findAllForDeveloper(developerId, {
      search: query.search,
      status: query.status,
      priority: query.priority,
      software: query.software,
      piu_id: query.piu_id ? parseInt(query.piu_id, 10) : undefined,
      page: query.page ? parseInt(query.page, 10) : undefined,
      page_size: query.page_size ? parseInt(query.page_size, 10) : undefined,
    });
  }

  @Get(':trackingNumber')
  async getByTrackingNumber(@Param('trackingNumber') trackingNumber: string) {
    const ticket = await this.ticketsService.findByTrackingNumber(trackingNumber);
    if (!ticket) {
      throw new NotFoundException('No ticket found with that tracking number');
    }
    return ticket;
  }

  @Patch(':id/priority')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  async setPriority(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: SetPriorityDto,
    @Req() req: Request,
  ) {
    const actorUserId = (req.user as any).userId;
    return this.ticketsService.setPriority(id, dto, actorUserId);
  }

  @Patch(':id/assign')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  async assignDeveloper(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: AssignDeveloperDto,
    @Req() req: Request,
  ) {
    const actorUserId = (req.user as any).userId;
    return this.ticketsService.assignDeveloper(id, dto, actorUserId);
  }

  @Post(':id/reply')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('DEVELOPER')
  async addReply(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: CreateReplyDto,
    @Req() req: Request,
  ) {
    const actorUserId = (req.user as any).userId;
    return this.ticketsService.addReply(id, dto, actorUserId);
  }

  @Patch(':id/complete')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('DEVELOPER')
  async completeTicket(
    @Param('id', ParseIntPipe) id: number,
    @Req() req: Request,
  ) {
    const actorUserId = (req.user as any).userId;
    return this.ticketsService.completeTicket(id, actorUserId);
  }

  @Patch(':id/close')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  async closeTicket(
    @Param('id', ParseIntPipe) id: number,
    @Req() req: Request,
  ) {
    const actorUserId = (req.user as any).userId;
    return this.ticketsService.closeTicket(id, actorUserId);
  }

  @Patch(':id/reopen')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  async reopenTicket(
    @Param('id', ParseIntPipe) id: number,
    @Req() req: Request,
  ) {
    const actorUserId = (req.user as any).userId;
    return this.ticketsService.reopenTicket(id, actorUserId);
  }
}