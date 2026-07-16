import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PiuController } from './piu.controller';
import { PiuService } from './piu.service';
import { Piu } from './entities/piu.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Piu])],
  controllers: [PiuController],
  providers: [PiuService],
  exports: [PiuService],
})
export class PiuModule {}