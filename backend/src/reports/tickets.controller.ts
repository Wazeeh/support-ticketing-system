import { Controller, Get, Param, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { ReportsService } from './reports.service';

@Controller('tickets')
export class TicketsController {
  constructor(private readonly reportsService: ReportsService) {}

  @Get(':id/timeline')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  async getTimeline(@Param('id') id: string) {
    return this.reportsService.getTicketTimeline(BigInt(id));
  }
}