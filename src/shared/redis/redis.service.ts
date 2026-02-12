import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Redis } from '@upstash/redis';
import {
  BATCH_SIZE,
  MAX_CONCURRENT,
} from 'src/common/constants/cache.constant';

@Injectable()
export class RedisService {
  private redis: Redis;
  constructor(private readonly configService: ConfigService) {
    this.redis = new Redis({
      url: configService.get<string>('upstash.redis.restUrl'),
      token: configService.get<string>('upstash.redis.restToken'),
    });
  }
  async set(key: string, value: any, ttlSeconds?: number) {
    if (ttlSeconds) {
      return await this.redis.set(key, value, { ex: ttlSeconds });
    }
    return await this.redis.set(key, value);
  }

  async get<T = any>(key: string): Promise<T | null> {
    return await this.redis.get<T>(key);
  }

  async del(key: string) {
    return await this.redis.del(key);
  }
}
