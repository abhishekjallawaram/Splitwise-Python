import { Test, TestingModule } from '@nestjs/testing';
import { MemcachedService } from './memcached.service';

describe('MemcachedService', () => {
  let service: MemcachedService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [MemcachedService],
    }).compile();

    service = module.get<MemcachedService>(MemcachedService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
