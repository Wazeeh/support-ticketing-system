import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { TiService } from './ti.service';
import { Ti } from './entities/ti.entity';

describe('TiService', () => {
  let service: TiService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TiService,
        { provide: getRepositoryToken(Ti), useValue: {} },
      ],
    }).compile();
    service = module.get<TiService>(TiService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});