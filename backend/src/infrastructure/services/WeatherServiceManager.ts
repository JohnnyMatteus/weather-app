import { IWeatherProvider, WeatherData } from '@/domain/interfaces/services/IWeatherProvider';
import { OpenMeteoProvider } from '@/infrastructure/external/providers/OpenMeteoProvider';
import { OpenWeatherProvider } from '@/infrastructure/external/providers/OpenWeatherProvider';
import { weatherApiRequests, weatherApiDuration } from '@/infrastructure/monitoring/MetricsService';

export class WeatherServiceManager {
  private providers: IWeatherProvider[] = [];

  constructor() {
    // Initialize providers in order of preference
    this.providers = [
      new OpenWeatherProvider(process.env['OPENWEATHER_API_KEY'] || ''), // Working API key, supports Brazilian cities
      new OpenMeteoProvider(), // Free, no API key required, works with Brazilian cities
    ];
  }

  async getWeatherByCity(city: string, country?: string): Promise<WeatherData> {
    console.log(`[WeatherServiceManager] Getting weather for ${city}${country ? `, ${country}` : ''}`);
    
    // Try each provider in order
    for (const provider of this.providers) {
      if (!provider.isAvailable()) {
        console.log(`[WeatherServiceManager] Provider ${provider.name} is not available, skipping`);
        continue;
      }

      try {
        console.log(`[WeatherServiceManager] Trying provider: ${provider.name}`);
        const start = Date.now();
        const result = await provider.getWeatherByCity(city, country);
        const duration = (Date.now() - start) / 1000;
        
        // Record metrics
        weatherApiRequests.inc({ provider: provider.name, status: 'success' });
        weatherApiDuration.observe({ provider: provider.name }, duration);
        
        console.log(`[WeatherServiceManager] Success with provider: ${provider.name}`);
        return result;
      } catch (error) {
        // Record failed request
        weatherApiRequests.inc({ provider: provider.name, status: 'error' });
        console.error(`[WeatherServiceManager] Provider ${provider.name} failed:`, error);
        continue;
      }
    }

    // If all providers fail, throw error
    console.error(`[WeatherServiceManager] All providers failed for ${city}`);
    throw new Error(`All weather providers failed for ${city}. Please try again later.`);
  }

  async getWeatherByCoordinates(latitude: number, longitude: number): Promise<WeatherData> {
    console.log(`[WeatherServiceManager] Getting weather for coordinates: ${latitude}, ${longitude}`);
    
    // Try each provider in order
    for (const provider of this.providers) {
      if (!provider.isAvailable()) {
        console.log(`[WeatherServiceManager] Provider ${provider.name} is not available, skipping`);
        continue;
      }

      try {
        console.log(`[WeatherServiceManager] Trying provider: ${provider.name}`);
        const start = Date.now();
        const result = await provider.getWeatherByCoordinates(latitude, longitude);
        const duration = (Date.now() - start) / 1000;
        
        // Record metrics
        weatherApiRequests.inc({ provider: provider.name, status: 'success' });
        weatherApiDuration.observe({ provider: provider.name }, duration);
        
        console.log(`[WeatherServiceManager] Success with provider: ${provider.name}`);
        return result;
      } catch (error) {
        // Record failed request
        weatherApiRequests.inc({ provider: provider.name, status: 'error' });
        console.error(`[WeatherServiceManager] Provider ${provider.name} failed:`, error);
        continue;
      }
    }

    // If all providers fail, throw error
    console.error(`[WeatherServiceManager] All providers failed for coordinates ${latitude}, ${longitude}`);
    throw new Error(`All weather providers failed for coordinates ${latitude}, ${longitude}. Please try again later.`);
  }

  getAvailableProviders(): string[] {
    return this.providers
      .filter(provider => provider.isAvailable())
      .map(provider => provider.name);
  }

  getProviderStatus(): { name: string; available: boolean }[] {
    return this.providers.map(provider => ({
      name: provider.name,
      available: provider.isAvailable()
    }));
  }
}
