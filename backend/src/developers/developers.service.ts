import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UserLookup } from '../notifications/entities/user-lookup.entity';

@Injectable()
export class DevelopersService {
  constructor(
    @InjectRepository(UserLookup)
    private usersRepo: Repository<UserLookup>,
  ) {}

  async findAllActive() {
    const developers = await this.usersRepo.find({
      where: { role: 'DEVELOPER', is_active: true },
    });

    return developers.map((dev) => ({
      id: dev.id,
      full_name: dev.full_name,
    }));
  }
}