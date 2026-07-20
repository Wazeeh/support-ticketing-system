import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UserLookup } from '../notifications/entities/user-lookup.entity';

@Injectable()
export class DevelopersService {
  constructor(
    @InjectRepository(UserLookup)
    private userLookupRepo: Repository<UserLookup>,
  ) {}

  async findAllActive(): Promise<UserLookup[]> {
    return this.userLookupRepo.find({
      where: { role: 'DEVELOPER', is_active: true },
      order: { full_name: 'ASC' },
    });
  }
}