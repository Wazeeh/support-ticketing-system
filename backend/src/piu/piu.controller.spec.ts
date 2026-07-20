import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { PiuController } from './piu.controller';
import { PiuService } from './piu.service';
import { Piu } from './entities/piu.entity';

describe('PiuController', () => {
  let controller: PiuController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [PiuController],
      providers: [
        PiuService,
        { provide: getRepositoryToken(Piu), useValue: {} },
      ],
    }).compile();
    controller = module.get<PiuController>(PiuController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});