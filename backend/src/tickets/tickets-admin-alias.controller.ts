import { Controller, Get, Patch, Post, Body, Param, Query, ParseIntPipe, UseGuards, Req } from '@nestjs/common';
import type { Request } from 'express';
import { TicketsService } from './tickets.service';
import { SetPriorityDto } from './dto/set-priority.dto';
import { AssignDeveloperDto } from './dto/assign-developer.dto';
import { CreateReplyDto } from '../ticket-replies/dto/create-reply.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';

@Controller('admin/tickets')
export class TicketsAdminAliasController {
  constructor(private readonly ticketsService: TicketsService) {}

  @Get()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  async findAll(
    @Query('search') search?: string,
    @Query('status') status?: string,
    @Query('priority') priority?: string,
    @Query('software') software?: string,
    @Query('piu_id') piuId?: string,
    @Query('page') page?: string,
    @Query('page_size') pageSize?: string,
  ) {
    return this.ticketsService.findAll({
      search,
      status,
      priority,
      software,
      piu_id: piuId ? Number(piuId) : undefined,
      page: page ? Number(page) : undefined,
      page_size: pageSize ? Number(pageSize) : undefined,
    });
  }

  @Get(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  async findOne(@Param('id', ParseIntPipe) id: number) {
    return this.ticketsService.findOneDetail(id);
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
  @Roles('ADMIN')
  async adminReply(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: CreateReplyDto,
    @Req() req: Request,
  ) {
    const actorUserId = (req.user as any).userId;
    return this.ticketsService.addReply(id, dto, actorUserId);
  }

  @Patch(':id/complete')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  async adminComplete(
    @Param('id', ParseIntPipe) id: number,
    @Req() req: Request,
  ) {
    const actorUserId = (req.user as any).userId;
    return this.ticketsService.completeTicket(id, actorUserId);
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