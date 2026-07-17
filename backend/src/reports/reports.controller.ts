import { Controller, Get, Query, Param, UseGuards, Res } from '@nestjs/common';
import type { Response } from 'express';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { ReportsService } from './reports.service';
import { AnalyticsQueryDto } from './dto/analytics-query.dto';


@Controller('admin/reports')
export class ReportsController {
  constructor(private readonly reportsService: ReportsService) {}

  @Get('analytics')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  async getAnalytics(@Query() query: AnalyticsQueryDto) {
    const tickets = await this.reportsService.getFilteredTickets(query);
    const summary = await this.reportsService.getStatusAndPrioritySummary(query);
    const breakdowns = await this.reportsService.getBreakdowns(query);
    const trend = await this.reportsService.getTrend(query);
    const avgResolution = await this.reportsService.getAvgResolutionHours(query);
    return { tickets, ...summary, ...breakdowns, ...trend, ...avgResolution };
  }

  @Get('analytics/export')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  async exportAnalytics(@Query() query: AnalyticsQueryDto, @Res() res: Response) {
    const tickets = await this.reportsService.getTicketsForExport(query);

    const columns = [
      'id', 'tracking_number', 'piu_id', 'ti_id', 'software', 'issue_category',
      'status', 'priority', 'submitter_name', 'submitter_email',
      'created_at', 'completed_at', 'closed_at',
    ];

    const escapeCsv = (val: unknown) => {
      if (val === null || val === undefined) return '';
      const str = val instanceof Date ? val.toISOString() : String(val);
      return `"${str.replace(/"/g, '""')}"`;
    };

    const header = columns.join(',');
    const rows = tickets.map((t) => columns.map((c) => escapeCsv((t as any)[c])).join(','));
    const csv = [header, ...rows].join('\n');

    res.header('Content-Type', 'text/csv');
    res.header('Content-Disposition', 'attachment; filename="tickets-export.csv"');
    res.send(csv);
  }

@Get('/tickets/:id/timeline')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  async getTimeline(@Param('id') id: string) {
    return this.reportsService.getTicketTimeline(BigInt(id));
  }
}