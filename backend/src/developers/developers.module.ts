import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DevelopersController, DeveloperDevelopersController } from './developers.controller';
import { DevelopersService } from './developers.service';
import { UserLookup } from '../notifications/entities/user-lookup.entity';

@Module({
  imports: [TypeOrmModule.forFeature([UserLookup])],
  controllers: [DevelopersController, DeveloperDevelopersController],
  providers: [DevelopersService],
})
export class DevelopersModule {}