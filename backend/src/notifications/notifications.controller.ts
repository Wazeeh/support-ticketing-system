import { Controller, Get, Patch, Param, ParseIntPipe, UseGuards, Req, NotFoundException } from '@nestjs/common';
import type { Request } from 'express';
import { NotificationsService } from './notifications.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('notifications')
export class NotificationsController {
  constructor(private readonly notificationsService: NotificationsService) {}

  @Get()
  @UseGuards(JwtAuthGuard)
  async findMine(@Req() req: Request) {
    const userId = (req.user as any).userId;
    return this.notificationsService.findForUser(userId);
  }

  @Patch(':id/read')
  @UseGuards(JwtAuthGuard)
  async markAsRead(@Param('id', ParseIntPipe) id: number) {
    const notification = await this.notificationsService.markAsRead(id);
    if (!notification) {
      throw new NotFoundException(`No notification found with id ${id}`);
    }
    return notification;
  }
}