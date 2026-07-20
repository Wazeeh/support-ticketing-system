import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { TiController } from './ti.controller';
import { TiService } from './ti.service';
import { Ti } from './entities/ti.entity';

describe('TiController', () => {
  let controller: TiController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [TiController],
      providers: [
        TiService,
        { provide: getRepositoryToken(Ti), useValue: {} },
      ],
    }).compile();
    controller = module.get<TiController>(TiController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
