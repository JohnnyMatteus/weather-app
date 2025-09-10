import { IWeatherProvider, WeatherData } from '@/domain/interfaces/services/IWeatherProvider';
import { OpenMeteoProvider } from '@/infrastructure/external/providers/OpenMeteoProvider';
import { OpenWeatherProvider } from '@/infrastructure/external/providers/OpenWeatherProvider';
import { weatherApiRequests, weatherApiDuration } from '@/infrastructure/monitoring/MetricsService';

export class WeatherServiceManager {
  private providers: IWeatherProvider[] = [];

  constructor() {
    this.providers = [
      new OpenWeatherProvider(process.env['OPENWEATHER_API_KEY'] || ''),
      new OpenMeteoProvider(),
    ];
  }

  async getWeatherByCity(city: string, country?: string): Promise<WeatherData> {
    console.log(`[WeatherServiceManager] Buscando clima para ${city}${country ? `, ${country}` : ''}`);
    for (const provider of this.providers) {
      if (!provider.isAvailable()) {
        console.log(`[WeatherServiceManager] Provedor ${provider.name} indisponível, ignorando`);
        continue;
      }
      try {
        console.log(`[WeatherServiceManager] Tentando provedor: ${provider.name}`);
        const start = Date.now();
        const result = await provider.getWeatherByCity(city, country);
        const duration = (Date.now() - start) / 1000;
        weatherApiRequests.inc({ provider: provider.name, status: 'success' });
        weatherApiDuration.observe({ provider: provider.name }, duration);
        console.log(`[WeatherServiceManager] Sucesso com provedor: ${provider.name}`);
        return result;
      } catch (error) {
        weatherApiRequests.inc({ provider: provider.name, status: 'error' });
        console.error(`[WeatherServiceManager] Provedor ${provider.name} falhou:`, error);
        continue;
      }
    }
    console.error(`[WeatherServiceManager] Todos os provedores falharam para ${city}`);
    throw new Error(`Não foi possível obter dados de clima para ${city}. Tente novamente mais tarde.`);
  }

  async getWeatherByCoordinates(latitude: number, longitude: number): Promise<WeatherData> {
    console.log(`[WeatherServiceManager] Buscando clima para coordenadas: ${latitude}, ${longitude}`);
    for (const provider of this.providers) {
      if (!provider.isAvailable()) {
        console.log(`[WeatherServiceManager] Provedor ${provider.name} indisponível, ignorando`);
        continue;
      }
      try {
        console.log(`[WeatherServiceManager] Tentando provedor: ${provider.name}`);
        const start = Date.now();
        const result = await provider.getWeatherByCoordinates(latitude, longitude);
        const duration = (Date.now() - start) / 1000;
        weatherApiRequests.inc({ provider: provider.name, status: 'success' });
        weatherApiDuration.observe({ provider: provider.name }, duration);
        console.log(`[WeatherServiceManager] Sucesso com provedor: ${provider.name}`);
        return result;
      } catch (error) {
        weatherApiRequests.inc({ provider: provider.name, status: 'error' });
        console.error(`[WeatherServiceManager] Provedor ${provider.name} falhou:`, error);
        continue;
      }
    }
    console.error(`[WeatherServiceManager] Todos os provedores falharam para coordenadas ${latitude}, ${longitude}`);
    throw new Error(`Não foi possível obter dados de clima para as coordenadas ${latitude}, ${longitude}. Tente novamente mais tarde.`);
  }

  getAvailableProviders(): string[] {
    return this.providers.filter(p => p.isAvailable()).map(p => p.name);
  }

  getProviderStatus(): { name: string; available: boolean }[] {
    return this.providers.map(p => ({ name: p.name, available: p.isAvailable() }));
  }
}
