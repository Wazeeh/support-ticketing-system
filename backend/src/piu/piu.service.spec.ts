import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { PiuService } from './piu.service';
import { Piu } from './entities/piu.entity';

describe('PiuService', () => {
  let service: PiuService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PiuService,
        { provide: getRepositoryToken(Piu), useValue: {} },
      ],
    }).compile();
    service = module.get<PiuService>(PiuService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});