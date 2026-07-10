import { Controller, Get } from '@nestjs/common';
import { PiuService } from './piu.service';

@Controller('piu')
export class PiuController {
  constructor(private readonly piuService: PiuService) {}

  @Get()
  async findAll() {
    return this.piuService.findAllActive();
  }
}