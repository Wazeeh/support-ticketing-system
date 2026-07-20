import { Controller, Get, UseGuards } from '@nestjs/common';
import { DevelopersService } from './developers.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';

@Controller('admin/developers')
export class DevelopersController {
  constructor(private readonly developersService: DevelopersService) {}

  @Get()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  async findAll() {
    return this.developersService.findAllActive();
  }
}