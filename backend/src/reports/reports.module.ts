import { Module } from '@nestjs/common';
import { ReportsController } from './reports.controller';
import { TicketsController } from './tickets.controller';
import { ReportsService } from './reports.service';

@Module({
  controllers: [ReportsController, TicketsController],
  providers: [ReportsService]
})
export class ReportsModule {}