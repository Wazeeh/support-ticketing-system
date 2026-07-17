import { Test, TestingModule } from '@nestjs/testing';
import { PiuService } from './piu.service';

describe('PiuService', () => {
  let service: PiuService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [PiuService],
    }).compile();

    service = module.get<PiuService>(PiuService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
