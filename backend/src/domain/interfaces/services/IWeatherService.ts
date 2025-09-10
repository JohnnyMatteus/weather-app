import { WeatherEntity } from '../../entities/Weather';

export interface IWeatherService {
  getWeatherByCity(city: string, country?: string): Promise<WeatherEntity>;
  getWeatherByCoordinates(latitude: number, longitude: number): Promise<WeatherEntity>;
}
