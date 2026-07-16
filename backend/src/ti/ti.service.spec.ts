import { Test, TestingModule } from '@nestjs/testing';
import { TiService } from './ti.service';

describe('TiService', () => {
  let service: TiService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [TiService],
    }).compile();

    service = module.get<TiService>(TiService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
