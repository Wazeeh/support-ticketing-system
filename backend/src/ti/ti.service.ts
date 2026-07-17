import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Ti } from './entities/ti.entity';

@Injectable()
export class TiService {
  constructor(
    @InjectRepository(Ti)
    private tiRepo: Repository<Ti>,
  ) {}

  async findByPiu(piuId: number): Promise<Ti[]> {
    return this.tiRepo.find({
      where: { piu_id: piuId, is_active: true },
      order: { name: 'ASC' },
    });
  }
}
