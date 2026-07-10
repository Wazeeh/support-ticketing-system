import { Controller, Get, Param, ParseIntPipe } from '@nestjs/common';
import { TiService } from './ti.service';

@Controller('piu')
export class TiController {
  constructor(private readonly tiService: TiService) {}

  @Get(':piuId/ti')
  async findByPiu(@Param('piuId', ParseIntPipe) piuId: number) {
    return this.tiService.findByPiu(piuId);
  }
}
