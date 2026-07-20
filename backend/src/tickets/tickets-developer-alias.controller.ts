import { Controller, Patch, Post, Get, Body, Param, ParseIntPipe, Query, UseGuards, Req } from '@nestjs/common';
import type { Request } from 'express';
import { TicketsService } from './tickets.service';
import { CreateReplyDto } from '../ticket-replies/dto/create-reply.dto';
import { ReassignDeveloperDto } from './dto/reassign-developer.dto';
import { RouteToAdminDto } from './dto/route-to-admin.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';

@Controller('developer/tickets')
export class TicketsDeveloperAliasController {
  constructor(private readonly ticketsService: TicketsService) {}

  @Get()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('DEVELOPER')
  async findAll(
    @Query('search') search: string | undefined,
    @Query('status') status: string | undefined,
    @Query('priority') priority: string | undefined,
    @Query('software') software: string | undefined,
    @Query('piu_id') piuId: string | undefined,
    @Query('page') page: string | undefined,
    @Query('page_size') pageSize: string | undefined,
    @Req() req: Request,
  ) {
    const actorUserId = (req.user as any).userId;
    return this.ticketsService.findAllForDeveloper(actorUserId, {
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
  @Roles('DEVELOPER')
  async findOne(@Param('id', ParseIntPipe) id: number, @Req() req: Request) {
    const actorUserId = (req.user as any).userId;
    return this.ticketsService.findOneForDeveloper(id, actorUserId);
  }

  @Post(':id/reply')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('DEVELOPER')
  async developerReply(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: CreateReplyDto,
    @Req() req: Request,
  ) {
    const actorUserId = (req.user as any).userId;
    return this.ticketsService.addReplyAsDeveloper(id, dto, actorUserId);
  }

  @Patch(':id/reassign')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('DEVELOPER')
  async reassign(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: ReassignDeveloperDto,
    @Req() req: Request,
  ) {
    const actorUserId = (req.user as any).userId;
    return this.ticketsService.reassignTicket(id, dto, actorUserId);
  }

  @Patch(':id/route-to-admin')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('DEVELOPER')
  async routeToAdmin(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: RouteToAdminDto,
    @Req() req: Request,
  ) {
    const actorUserId = (req.user as any).userId;
    return this.ticketsService.routeToAdmin(id, dto, actorUserId);
  }

  @Patch(':id/complete')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('DEVELOPER')
  async developerComplete(
    @Param('id', ParseIntPipe) id: number,
    @Req() req: Request,
  ) {
    const actorUserId = (req.user as any).userId;
    return this.ticketsService.completeTicketAsDeveloper(id, actorUserId);
  }
}