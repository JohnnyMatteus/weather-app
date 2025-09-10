import { Request, Response, NextFunction } from 'express';
import { RedisConnection } from '@/infrastructure/cache/RedisConnection';

interface StoredResponse {
  status: number;
  headers: Record<string, string>;
  body: any;
}

export function idempotency(ttlSeconds: number = 600) {
  return async (req: Request, res: Response, next: NextFunction) => {
    const key = (req.headers['x-idempotency-key'] as string) || '';
    if (!key) {
      return next();
    }

    const client = RedisConnection.getClient();
    const redisKey = `idem:${key}`;

    try {
      const cached = await client.get(redisKey);
      if (cached) {
        const parsed: StoredResponse = JSON.parse(cached);
        for (const [h, v] of Object.entries(parsed.headers || {})) {
          res.setHeader(h, v);
        }
        res.status(parsed.status).json(parsed.body);
        return;
      }

      // Intercept response to store it
      const originalJson = res.json.bind(res);
      res.json = ((body: any) => {
        const status = res.statusCode || 200;
        const headers: Record<string, string> = {
          'Content-Type': res.getHeader('Content-Type') as string || 'application/json',
        };
        const toStore: StoredResponse = { status, headers, body };
        client.setex(redisKey, ttlSeconds, JSON.stringify(toStore)).catch(() => {});
        return originalJson(body);
      }) as any;

      return next();
    } catch {
      return next();
    }
  };
}


