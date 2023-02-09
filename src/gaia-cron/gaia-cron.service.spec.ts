import { Test, TestingModule } from '@nestjs/testing';
import { GaiaCronService } from './gaia-cron.service';

describe('GaiaCronService', () => {
  let service: GaiaCronService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [GaiaCronService],
    }).compile();

    service = module.get<GaiaCronService>(GaiaCronService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
