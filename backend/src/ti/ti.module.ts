import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TiController } from './ti.controller';
import { TiService } from './ti.service';
import { Ti } from './entities/ti.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Ti])],
  controllers: [TiController],
  providers: [TiService],
})
export class TiModule {}
