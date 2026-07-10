import { Test, TestingModule } from '@nestjs/testing';
import { TiController } from './ti.controller';

describe('TiController', () => {
  let controller: TiController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [TiController],
    }).compile();

    controller = module.get<TiController>(TiController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
