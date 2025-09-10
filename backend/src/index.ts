import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import swaggerJsdoc from 'swagger-jsdoc';
import swaggerUi from 'swagger-ui-express';
import { config } from 'dotenv';
import { logger } from './infrastructure/logging/Logger';
import { DatabaseConnection } from './infrastructure/database/DatabaseConnection';
import { MongoConnection } from './infrastructure/database/MongoConnection';
import { RedisConnection } from './infrastructure/cache/RedisConnection';
import { RabbitMQConnection } from './infrastructure/messaging/RabbitMQConnection';
import { authRoutes } from './interfaces/http/routes/authRoutes';
import { weatherRoutes } from './interfaces/http/routes/weatherRoutes';
import { metricsRoutes } from './interfaces/http/routes/metricsRoutes';
import { errorHandler } from './interfaces/http/middleware/errorHandler';
import { requestLogger } from './interfaces/http/middleware/requestLogger';
import { metricsMiddleware } from './interfaces/http/middleware/metricsMiddleware';
import { WeatherModel } from './infrastructure/database/models/WeatherModel';
import { register } from './infrastructure/monitoring/MetricsService';
import { initializeTracing } from './infrastructure/telemetry/tracing';
import { validateEnv } from './config/env';

config();

// Validate environment configuration
void validateEnv(process.env);

void initializeTracing();

const app = express();
const PORT = Number(process.env['PORT']) || 3001;

app.use(helmet({
  contentSecurityPolicy: false,
  crossOriginEmbedderPolicy: false,
}));
app.disable('x-powered-by');

app.use(cors({
  origin: process.env['FRONTEND_URL'] || 'http://localhost:3000',
  credentials: true,
}));

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  message: 'Too many requests from this IP, please try again later.',
  standardHeaders: true,
  legacyHeaders: false,
});
app.use(limiter);

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));
app.use(requestLogger);
app.use(metricsMiddleware);

const swaggerOptions = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Weather App API',
      version: '1.0.0',
      description: 'A modern weather application API with clean architecture',
    },
    servers: [
      { url: `http://localhost:${PORT}`, description: 'Development server' },
    ],
    components: {
      securitySchemes: {
        bearerAuth: { type: 'http', scheme: 'bearer', bearerFormat: 'JWT' },
      },
    },
  },
  apis: ['./src/interfaces/http/routes/*.ts'],
};

const swaggerSpec = swaggerJsdoc(swaggerOptions);
app.use('/docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

app.get('/health', (req, res) => {
  res.status(200).json({ status: 'OK', timestamp: new Date().toISOString(), uptime: process.uptime() });
});

app.get('/test', (req, res) => {
  res.status(200).json({ message: 'Test endpoint working', timestamp: new Date().toISOString() });
});

app.use('/api/auth', authRoutes);
app.use('/api/weather', weatherRoutes);
app.use('/api/metrics', metricsRoutes);

app.get('/', (_req, res) => {
  res.status(200).json({ status: 'OK' });
});

app.get('/metrics', async (_req, res) => {
  try {
    res.set('Content-Type', register.contentType);
    const metrics = await register.metrics();
    res.end(metrics);
  } catch (error) {
    res.status(500).end('Error generating metrics');
  }
});

app.use(errorHandler);

app.use('*', (req, res) => {
  res.status(404).json({ success: false, error: 'Route not found' });
});

async function startServer() {
  try {
    await DatabaseConnection.initialize();
    logger.info('PostgreSQL connected successfully');

    await MongoConnection.getInstance().connect();
    logger.info('MongoDB connected successfully');

    try {
      await WeatherModel.init();
      logger.info('Mongoose indexes initialized for WeatherModel');
    } catch (e) {
      logger.warn('Failed to initialize Mongoose indexes for WeatherModel');
    }

    await RedisConnection.initialize();
    logger.info('Redis connected successfully');

    await RabbitMQConnection.initialize();
    logger.info('RabbitMQ connected successfully');

    app.listen(PORT, '0.0.0.0', () => {
      logger.info(`Server running on http://0.0.0.0:${PORT}`);
      logger.info(`API Documentation available at http://0.0.0.0:${PORT}/docs`);
    });
  } catch (error) {
    logger.error('Failed to start server:', error);
    process.exit(1);
  }
}

process.on('SIGTERM', async () => {
  logger.info('SIGTERM received, shutting down gracefully');
  await DatabaseConnection.close();
  await MongoConnection.getInstance().disconnect();
  await RedisConnection.close();
  await RabbitMQConnection.close();
  process.exit(0);
});

process.on('SIGINT', async () => {
  logger.info('SIGINT received, shutting down gracefully');
  await DatabaseConnection.close();
  await MongoConnection.getInstance().disconnect();
  await RedisConnection.close();
  await RabbitMQConnection.close();
  process.exit(0);
});

startServer();