import { Request, Response } from 'express';
import { GetWeatherUseCase } from '../../../application/use-cases/weather/GetWeatherUseCase';
import { GetSearchHistoryUseCase } from '../../../application/use-cases/weather/GetSearchHistoryUseCase';
import { MongoSearchHistoryRepository } from '../../../infrastructure/database/MongoSearchHistoryRepository';

import { WeatherServiceManager } from '../../../infrastructure/services/WeatherServiceManager';
import { RedisCacheService } from '../../../infrastructure/cache/RedisCacheService';
import { RabbitMQEventBus } from '../../../infrastructure/messaging/RabbitMQEventBus';
import { RedisConnection } from '../../../infrastructure/cache/RedisConnection';
import { searchHistoryRequests } from '../../../infrastructure/monitoring/MetricsService';
import { GetForecastUseCase } from '../../../application/use-cases/weather/GetForecastUseCase';
import { OpenMeteoProvider } from '../../../infrastructure/external/providers/OpenMeteoProvider';

export class WeatherController {
  private getWeatherUseCase!: GetWeatherUseCase;
  private getSearchHistoryUseCase!: GetSearchHistoryUseCase;
  private getForecastUseCase!: GetForecastUseCase;

  constructor() {
    // Use cases will be initialized lazily when needed
  }

  private async initializeUseCases() {
    if (!this.getWeatherUseCase || !this.getSearchHistoryUseCase || !this.getForecastUseCase) {
      const searchHistoryRepository = new MongoSearchHistoryRepository();
      const weatherServiceManager = new WeatherServiceManager();
      const cacheService = new RedisCacheService(RedisConnection.getClient());
      const eventBus = new RabbitMQEventBus(process.env['RABBITMQ_URL'] || 'amqp://localhost:5672');
      await eventBus.connect();
      
      this.getWeatherUseCase = new GetWeatherUseCase(weatherServiceManager, cacheService, searchHistoryRepository, eventBus);

      this.getSearchHistoryUseCase = new GetSearchHistoryUseCase(searchHistoryRepository);

      this.getForecastUseCase = new GetForecastUseCase(new OpenMeteoProvider());
    }
  }

  async getWeather(req: Request, res: Response): Promise<void> {
    try {
      await this.initializeUseCases();
      const userId = (req as any).userId;
      const result = await this.getWeatherUseCase.execute({
        city: req.query['city'] as string,
        country: req.query['country'] as string,
        userId,
      });
      
      res.status(200).json({
        success: true,
        data: result,
      });
    } catch (error: any) {
      res.status(400).json({
        success: false,
        error: error.message,
      });
    }
  }

  async getSearchHistory(req: Request, res: Response): Promise<void> {
    try {
      await this.initializeUseCases();
      const userId = (req as any).userId;
      const limitParam = (req.query['limit'] as string) ?? '';
      const parsedLimit = Number(limitParam);
      const limit = Number.isFinite(parsedLimit) && parsedLimit > 0 ? Math.min(parsedLimit, 5) : 5;

      const result = await this.getSearchHistoryUseCase.execute({
        userId,
        limit,
      });
      
      // Increment search history requests metric
      searchHistoryRequests.inc();
      
      res.status(200).json({
        success: true,
        data: result,
      });
    } catch (error: any) {
      res.status(400).json({
        success: false,
        error: error.message,
      });
    }
  }

  async getForecast(req: Request, res: Response): Promise<void> {
    try {
      await this.initializeUseCases();
      const city = req.query['city'] as string | undefined;
      const latitude = req.query['latitude'] ? Number(req.query['latitude']) : undefined;
      const longitude = req.query['longitude'] ? Number(req.query['longitude']) : undefined;
      const country = req.query['country'] as string | undefined;

      const result = await this.getForecastUseCase.execute({ city, latitude, longitude, country });
      res.status(200).json({ success: true, data: result });
    } catch (error: any) {
      res.status(400).json({ success: false, error: error.message });
    }
  }
}