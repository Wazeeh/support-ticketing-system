import { Controller, Get, Query, UseGuards, Req } from '@nestjs/common';
import type { Request } from 'express';
import { NotificationsService } from './notifications.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';

@Controller('admin/notifications')
export class NotificationsAdminAliasController {
  constructor(private readonly notificationsService: NotificationsService) {}

  @Get()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  async findMine(
    @Req() req: Request,
    @Query('unread_only') unreadOnly?: string,
  ) {
    const userId = (req.user as any).userId;
    return this.notificationsService.findForUser(userId, unreadOnly === 'true');
  }
}