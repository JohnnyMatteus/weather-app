import { z } from 'zod';
import { logger } from '@/infrastructure/logging/Logger';

const EnvSchema = z.object({
  PORT: z.coerce.number().int().positive().optional(),
  FRONTEND_URL: z.string().url().optional(),
  DATABASE_URL: z.string().min(1),
  REDIS_URL: z.string().min(1),
  JWT_SECRET: z.string().min(16),
  JWT_REFRESH_SECRET: z.string().min(16),
  RABBITMQ_URL: z.string().min(1),
  OPENWEATHER_API_KEY: z.string().min(1),
  MONGODB_URL: z.string().min(1),
  MONGODB_DATABASE: z.string().min(1),
  OTEL_ENABLED: z.enum(['true', 'false']).optional(),
  OTEL_EXPORTER_OTLP_ENDPOINT: z.string().url().optional(),
});

export type AppEnv = z.infer<typeof EnvSchema>;

export function validateEnv(env: NodeJS.ProcessEnv): AppEnv {
  const result = EnvSchema.safeParse(env);
  if (!result.success) {
    logger.error({ msg: 'Invalid environment configuration', issues: result.error.flatten() });
    throw new Error('Environment validation failed');
  }
  return result.data;
}


