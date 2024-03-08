import { Injectable, OnModuleDestroy } from '@nestjs/common';
import * as Memcached from 'memcached';
import * as process from 'process';

@Injectable()
export class MemcachedService implements OnModuleDestroy {
  private memcached: Memcached;

  constructor() {
    this.memcached = new Memcached(process.env.MEMCAHCE_URL);
  }

  set(key: string, value: any, ttl: number) {
    return new Promise((resolve, reject) => {
      this.memcached.set(key, value, ttl, (err) => {
        if (err) return reject(err);
        resolve(true);
      });
    });
  }

  get(key: string) {
    return new Promise((resolve, reject) => {
      this.memcached.get(key, (err, data) => {
        if (err) return reject(err);
        resolve(data);
      });
    });
  }

  onModuleDestroy(): any {
    this.memcached.end();
  }
}
