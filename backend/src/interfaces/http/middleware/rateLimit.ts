import { Request, Response, NextFunction } from 'express';
import { RedisConnection } from '@/infrastructure/cache/RedisConnection';

interface RateLimitOptions {
  windowSeconds: number;
  max: number;
  keyPrefix?: string;
}

export function rateLimit(options: RateLimitOptions) {
  const { windowSeconds, max, keyPrefix = 'ratelimit' } = options;
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      const client = RedisConnection.getClient();
      const ip = (req.headers['x-forwarded-for'] as string)?.split(',')[0]?.trim() || req.ip || 'unknown';
      const key = `${keyPrefix}:${ip}`;
      const now = Math.floor(Date.now() / 1000);
      const windowStart = now - windowSeconds;

      // Use a sorted set as sliding window
      await client.zremrangebyscore(key, 0, windowStart);
      await client.zadd(key, now, `${now}-${Math.random()}`);
      const count = await client.zcard(key);
      await client.expire(key, windowSeconds);

      if (count > max) {
        res.status(429).json({ success: false, error: 'Too Many Requests' });
        return;
      }

      next();
    } catch (err) {
      // On Redis error, fail-open
      next();
    }
  };
}
