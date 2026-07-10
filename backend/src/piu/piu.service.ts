import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Piu } from './entities/piu.entity';

@Injectable()
export class PiuService {
  constructor(
    @InjectRepository(Piu)
    private piuRepo: Repository<Piu>,
  ) {}

  async findAllActive(): Promise<Piu[]> {
    return this.piuRepo.find({ where: { is_active: true }, order: { name: 'ASC' } });
  }
}
