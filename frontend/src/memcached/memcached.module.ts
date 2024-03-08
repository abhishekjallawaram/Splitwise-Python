import { Global, Module } from '@nestjs/common';
import { MemcachedService } from './memcached.service';

@Global()
@Module({
  providers: [MemcachedService],
  exports: [MemcachedService],
})
export class MemcachedModule {}
