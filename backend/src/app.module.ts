import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TicketsModule } from './tickets/tickets.module';
import { PiuModule } from './piu/piu.module';
import { TiModule } from './ti/ti.module';
import { CategoriesModule } from './categories/categories.module';
@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    TypeOrmModule.forRoot({
  type: 'postgres',
  url: process.env.DATABASE_URL,
  autoLoadEntities: true,
  synchronize: false,
  ssl: {
    rejectUnauthorized: false,
  },
}),
    TicketsModule,
    PiuModule,
    TiModule,
  ],
})
export class AppModule {}
