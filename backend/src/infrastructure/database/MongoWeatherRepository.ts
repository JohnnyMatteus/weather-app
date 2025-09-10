import { Weather } from '@/domain/entities/Weather';
import { WeatherModel, IWeatherDocument } from './models/WeatherModel';
import { MongoConnection } from './MongoConnection';
import { logger } from '../logging/Logger';

export class MongoWeatherRepository {
  private db = MongoConnection.getInstance().getDatabase();

  async save(weatherData: Weather, userId?: string, provider: string = 'unknown'): Promise<void> {
    try {
      const weatherDoc: any = {
        city: weatherData.city,
        country: weatherData.country || '',
        latitude: weatherData.latitude || 0,
        longitude: weatherData.longitude || 0,
        temperature: weatherData.temperature,
        description: weatherData.description,
        humidity: weatherData.humidity,
        windSpeed: weatherData.windSpeed,
        timestamp: new Date(weatherData.timestamp),
        provider,
        userId: userId
      };

      // Only add optional fields if they have values
      if (weatherData.pressure !== undefined) weatherDoc.pressure = weatherData.pressure;
      if (weatherData.visibility !== undefined) weatherDoc.visibility = weatherData.visibility;
      if (weatherData.uvIndex !== undefined) weatherDoc.uvIndex = weatherData.uvIndex;

      await WeatherModel.create(weatherDoc);
      logger.info(`Weather data saved for ${weatherData.city}, ${weatherData.country}`);
    } catch (error: any) {
      logger.warn({
        msg: 'Failed to save weather data (non-blocking)',
        name: error?.name,
        message: error?.message,
        code: error?.code,
        paths: error?.errors ? Object.keys(error.errors) : undefined,
      });
      // Do not throw to avoid failing the request; persistence is best-effort
      return;
    }
  }

  async findByCity(city: string, country?: string, limit: number = 10): Promise<Weather[]> {
    try {
      const query: any = { city: new RegExp(city, 'i') };
      if (country) {
        query.country = new RegExp(country, 'i');
      }

      const results = await WeatherModel
        .find(query)
        .sort({ timestamp: -1 })
        .limit(limit)
        .lean();

      return results.map(this.mapToWeatherData);
    } catch (error) {
      logger.error('Failed to find weather data by city:', error);
      throw new Error('Failed to find weather data');
    }
  }

  async findByCoordinates(latitude: number, longitude: number, limit: number = 10): Promise<Weather[]> {
    try {
      const results = await WeatherModel
        .find({
          latitude: { $gte: latitude - 0.1, $lte: latitude + 0.1 },
          longitude: { $gte: longitude - 0.1, $lte: longitude + 0.1 }
        })
        .sort({ timestamp: -1 })
        .limit(limit)
        .lean();

      return results.map(this.mapToWeatherData);
    } catch (error) {
      logger.error('Failed to find weather data by coordinates:', error);
      throw new Error('Failed to find weather data');
    }
  }

  async findByUser(userId: string, limit: number = 10): Promise<Weather[]> {
    try {
      const results = await WeatherModel
        .find({ userId })
        .sort({ timestamp: -1 })
        .limit(limit)
        .lean();

      return results.map(this.mapToWeatherData);
    } catch (error) {
      logger.error('Failed to find weather data by user:', error);
      throw new Error('Failed to find weather data');
    }
  }

  async getRecentWeather(city: string, country?: string, minutes: number = 30): Promise<Weather | null> {
    try {
      const query: any = { 
        city: new RegExp(city, 'i'),
        timestamp: { $gte: new Date(Date.now() - minutes * 60 * 1000) }
      };
      if (country) {
        query.country = new RegExp(country, 'i');
      }

      const result = await WeatherModel
        .findOne(query)
        .sort({ timestamp: -1 })
        .lean();

      return result ? this.mapToWeatherData(result) : null;
    } catch (error) {
      logger.error('Failed to get recent weather data:', error);
      throw new Error('Failed to get recent weather data');
    }
  }

  async getWeatherStats(provider?: string, days: number = 7): Promise<any> {
    try {
      const query: any = {
        timestamp: { $gte: new Date(Date.now() - days * 24 * 60 * 60 * 1000) }
      };
      if (provider) {
        query.provider = provider;
      }

      const stats = await WeatherModel.aggregate([
        { $match: query },
        {
          $group: {
            _id: '$provider',
            count: { $sum: 1 },
            avgTemperature: { $avg: '$temperature' },
            avgHumidity: { $avg: '$humidity' },
            avgWindSpeed: { $avg: '$windSpeed' }
          }
        }
      ]);

      return stats;
    } catch (error) {
      logger.error('Failed to get weather stats:', error);
      throw new Error('Failed to get weather stats');
    }
  }

  private mapToWeatherData(doc: any): Weather {
    return {
      city: doc.city,
      country: doc.country,
      latitude: doc.latitude,
      longitude: doc.longitude,
      temperature: doc.temperature,
      description: doc.description,
      humidity: doc.humidity,
      windSpeed: doc.windSpeed,
      pressure: doc.pressure,
      visibility: doc.visibility,
      uvIndex: doc.uvIndex,
      timestamp: doc.timestamp.toISOString()
    };
  }
}
