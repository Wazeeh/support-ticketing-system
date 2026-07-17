import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { AnalyticsQueryDto } from './dto/analytics-query.dto';

@Injectable()
export class ReportsService {
  constructor(private prisma: PrismaService) {}

  private buildWhereClause(query: AnalyticsQueryDto) {
    const submittedRange = {
      ...(query.submitted_from && { gte: new Date(query.submitted_from) }),
      ...(query.submitted_to && { lte: new Date(query.submitted_to) }),
    };

    const completedRange = {
      ...(query.completed_from && { gte: new Date(query.completed_from) }),
      ...(query.completed_to && { lte: new Date(query.completed_to) }),
    };

    return {
      ...(Object.keys(submittedRange).length > 0 && { created_at: submittedRange }),
      ...(Object.keys(completedRange).length > 0 && { completed_at: completedRange }),
      ...(query.issue_category && { issue_category: query.issue_category }),
      ...(query.software && { software: query.software }),
      ...(query.piu_id && { piu_id: query.piu_id }),
      ...(query.ti_id && { ti_id: query.ti_id }),
    };
  }

  async getFilteredTickets(query: AnalyticsQueryDto) {
    const where = this.buildWhereClause(query);
    return this.prisma.tickets.findMany({ where });
  }

  async getStatusAndPrioritySummary(query: AnalyticsQueryDto) {
    const where = this.buildWhereClause(query);

    const byStatusRaw = await this.prisma.tickets.groupBy({
      by: ['status'],
      where,
      _count: { status: true },
    });

    const byPriorityRaw = await this.prisma.tickets.groupBy({
      by: ['priority'],
      where,
      _count: { priority: true },
    });

    const by_status = Object.fromEntries(
      byStatusRaw.map((row) => [row.status, row._count.status]),
    );

    const by_priority = Object.fromEntries(
      byPriorityRaw.map((row) => [row.priority ?? 'UNSET', row._count.priority]),
    );

    return { by_status, by_priority };
  }
  async getBreakdowns(query: AnalyticsQueryDto) {
    const where = this.buildWhereClause(query);

    const byCategoryRaw = await this.prisma.tickets.groupBy({
      by: ['issue_category'],
      where,
      _count: { issue_category: true },
    });

    const byPiuRaw = await this.prisma.tickets.groupBy({
      by: ['piu_id'],
      where,
      _count: { piu_id: true },
    });

    const breakdown_by_category = Object.fromEntries(
      byCategoryRaw.map((row) => [row.issue_category, row._count.issue_category]),
    );

    const breakdown_by_piu = Object.fromEntries(
      byPiuRaw.map((row) => [row.piu_id, row._count.piu_id]),
    );

    return { breakdown_by_category, breakdown_by_piu };
  }
  async getTrend(query: AnalyticsQueryDto) {
    const where = this.buildWhereClause(query);

    const tickets = await this.prisma.tickets.findMany({
      where,
      select: { created_at: true, completed_at: true },
    });

    const trendMap: Record<string, { submitted: number; completed: number }> = {};

    for (const t of tickets) {
      const submittedDay = t.created_at.toISOString().slice(0, 10);
      trendMap[submittedDay] ??= { submitted: 0, completed: 0 };
      trendMap[submittedDay].submitted += 1;

      if (t.completed_at) {
        const completedDay = t.completed_at.toISOString().slice(0, 10);
        trendMap[completedDay] ??= { submitted: 0, completed: 0 };
        trendMap[completedDay].completed += 1;
      }
    }

    const trend = Object.entries(trendMap)
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([date, counts]) => ({ date, ...counts }));

    return { trend };
  }
  async getAvgResolutionHours(query: AnalyticsQueryDto) {
    const where = {
      ...this.buildWhereClause(query),
      closed_at: { not: null },
    };

    const tickets = await this.prisma.tickets.findMany({
      where,
      select: { created_at: true, closed_at: true },
    });

    if (tickets.length === 0) {
      return { avg_resolution_hours: null };
    }

    const totalHours = tickets.reduce((sum, t) => {
      const hours = (t.closed_at!.getTime() - t.created_at.getTime()) / (1000 * 60 * 60);
      return sum + hours;
    }, 0);

    const avg_resolution_hours = Math.round((totalHours / tickets.length) * 100) / 100;

    return { avg_resolution_hours };
  }
  async getTicketsForExport(query: AnalyticsQueryDto) {
    const where = this.buildWhereClause(query);
    return this.prisma.tickets.findMany({ where });
  }
  async getTicketTimeline(ticketId: bigint) {
    const logs = await this.prisma.audit_logs.findMany({
      where: { ticket_id: ticketId },
      orderBy: { created_at: 'asc' },
      include: {
        users: { select: { full_name: true, role: true } },
      },
    });

    const statusChanges = logs.filter((l) => l.action === 'STATUS_CHANGED');
    const time_in_status: Record<string, number> = {};

    for (let i = 0; i < statusChanges.length; i++) {
      const current = statusChanges[i];
      const next = statusChanges[i + 1];
      const statusName = current.to_value ?? 'UNKNOWN';
      const endTime = next ? next.created_at.getTime() : Date.now();
      const hours = (endTime - current.created_at.getTime()) / (1000 * 60 * 60);
      time_in_status[statusName] = (time_in_status[statusName] ?? 0) + Math.round(hours * 100) / 100;
    }

    const events = logs.map((l) => ({
      id: l.id.toString(),
      action: l.action,
      from_value: l.from_value,
      to_value: l.to_value,
      note: l.note,
      created_at: l.created_at,
      actor: l.users ? { name: l.users.full_name, role: l.users.role } : null,
    }));

    return {
      events,
      duration_summary: { time_in_status },
    };
  }
}