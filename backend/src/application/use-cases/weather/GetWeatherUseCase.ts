import { z } from 'zod';
import { WeatherEntity } from '../../../domain/entities/Weather';
import { SearchHistoryEntity } from '../../../domain/entities/SearchHistory';
import { WeatherServiceManager } from '../../../infrastructure/services/WeatherServiceManager';
import { ICacheService } from '../../../domain/interfaces/services/ICacheService';
import { ISearchHistoryRepository } from '../../../domain/interfaces/repositories/ISearchHistoryRepository';
import { IEventBus } from '../../../domain/interfaces/services/IEventBus';
import { MongoWeatherRepository } from '../../../infrastructure/database/MongoWeatherRepository';

export const GetWeatherRequestSchema = z.object({
  city: z.string().min(1),
  country: z.string().optional(),
  userId: z.string(),
});

export type GetWeatherRequest = z.infer<typeof GetWeatherRequestSchema>;

export interface GetWeatherResponse {
  weather: WeatherEntity;
  fromCache: boolean;
}

export class GetWeatherUseCase {
  private readonly weatherRepository = new MongoWeatherRepository();

  constructor(
    private readonly weatherServiceManager: WeatherServiceManager,
    private readonly cacheService: ICacheService,
    private readonly searchHistoryRepository: ISearchHistoryRepository,
    private readonly eventBus: IEventBus
  ) {}

  async execute(request: GetWeatherRequest): Promise<GetWeatherResponse> {
    const cacheKey = `weather:${request.city?.toLowerCase() || 'unknown'}:${request.country?.toLowerCase() || 'unknown'}`;
    
    // Try to get from cache first
    const cachedWeather = await this.cacheService.get<WeatherEntity>(cacheKey);
    if (cachedWeather) {
      // Even when served from cache, persist search in history (best-effort)
      if (request.userId) {
        try {
          const searchHistory = SearchHistoryEntity.create({
            userId: request.userId,
            city: cachedWeather.city,
            country: cachedWeather.country,
            latitude: cachedWeather.latitude,
            longitude: cachedWeather.longitude,
            temperature: cachedWeather.temperature,
            description: cachedWeather.description,
            humidity: cachedWeather.humidity,
            windSpeed: cachedWeather.windSpeed,
          });
          await this.searchHistoryRepository.create(searchHistory);
          await this.searchHistoryRepository.deleteOldEntries(request.userId, 5);
          await this.eventBus.publish({
            eventType: 'WeatherSearched',
            aggregateId: request.userId,
            payload: { city: cachedWeather.city, country: cachedWeather.country },
            timestamp: new Date(),
          });
        } catch {}
      }

      return {
        weather: cachedWeather,
        fromCache: true,
      };
    }

    // Get weather from external service
    const weatherData = await this.weatherServiceManager.getWeatherByCity(request.city, request.country);
    
    // Convert to WeatherEntity
    const weather = WeatherEntity.create({
      city: weatherData.city,
      country: weatherData.country,
      latitude: weatherData.latitude,
      longitude: weatherData.longitude,
      temperature: weatherData.temperature,
      description: weatherData.description,
      humidity: weatherData.humidity,
      windSpeed: weatherData.windSpeed,
      pressure: weatherData.pressure,
      visibility: weatherData.visibility,
      uvIndex: weatherData.uvIndex,
    });

    // Save to MongoDB (best-effort)
    try {
      const weatherForMongo = {
        ...weatherData,
        timestamp: new Date()
      } as any;
      await this.weatherRepository.save(weatherForMongo, request.userId, 'weather-service');
    } catch {}

    // Cache the result
    await this.cacheService.set(cacheKey, weather, 300); // 5 minutes TTL

    // Save to search history if user is authenticated (best-effort)
    if (request.userId) {
      try {
        const searchHistory = SearchHistoryEntity.create({
          userId: request.userId,
          city: weather.city,
          country: weather.country,
          latitude: weather.latitude,
          longitude: weather.longitude,
          temperature: weather.temperature,
          description: weather.description,
          humidity: weather.humidity,
          windSpeed: weather.windSpeed,
        });

        await this.searchHistoryRepository.create(searchHistory);
        // Keep only last 5 searches
        await this.searchHistoryRepository.deleteOldEntries(request.userId, 5);

        // Publish domain event
        await this.eventBus.publish({
          eventType: 'WeatherSearched',
          aggregateId: request.userId,
          payload: { city: weather.city, country: weather.country },
          timestamp: new Date(),
        });
      } catch {}
    }

    return {
      weather,
      fromCache: false,
    };
  }
}
