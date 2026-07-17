import { Test, TestingModule } from '@nestjs/testing';
import { PiuController } from './piu.controller';

describe('PiuController', () => {
  let controller: PiuController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [PiuController],
    }).compile();

    controller = module.get<PiuController>(PiuController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
