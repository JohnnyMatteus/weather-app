import axios from 'axios';
import { IWeatherProvider, WeatherData } from '@/domain/interfaces/services/IWeatherProvider';

export class OpenWeatherProvider implements IWeatherProvider {
  name = 'OpenWeatherMap';
  private apiKey: string;
  private baseUrl = 'https://api.openweathermap.org/data/2.5';

  constructor(apiKey: string) {
    if (!apiKey) {
      throw new Error('OpenWeatherMap API key is required');
    }
    this.apiKey = apiKey;
  }

  isAvailable(): boolean {
    return !!this.apiKey && this.apiKey.length > 0;
  }

  async getWeatherByCity(city: string, country?: string): Promise<WeatherData> {
    if (!this.isAvailable()) {
      throw new Error('OpenWeatherMap API key not configured');
    }

    try {
      const query = country ? `${city},${country}` : city;
      const url = `${this.baseUrl}/weather?q=${encodeURIComponent(query)}&appid=${this.apiKey}&units=metric`;
      
      const response = await axios.get(url);
      const data = response.data;
      
      return {
        city: data.name,
        country: data.sys.country,
        latitude: data.coord.lat,
        longitude: data.coord.lon,
        temperature: Math.round(data.main.temp),
        description: data.weather[0].description,
        humidity: data.main.humidity,
        windSpeed: Math.round(data.wind.speed * 3.6), // Convert m/s to km/h
        pressure: data.main.pressure,
        visibility: data.visibility ? Math.round(data.visibility / 1000) : 10, // Convert m to km, default 10km
        uvIndex: undefined, // OpenWeatherMap doesn't provide UV index in free tier
        timestamp: new Date().toISOString(),
      };
    } catch (error) {
      console.error('OpenWeatherMap error:', error);
      throw new Error(`Failed to get weather for ${city}: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  async getWeatherByCoordinates(latitude: number, longitude: number): Promise<WeatherData> {
    if (!this.isAvailable()) {
      throw new Error('OpenWeatherMap API key not configured');
    }

    try {
      const url = `${this.baseUrl}/weather?lat=${latitude}&lon=${longitude}&appid=${this.apiKey}&units=metric`;
      
      const response = await axios.get(url);
      const data = response.data;
      
      return {
        city: data.name,
        country: data.sys.country,
        latitude: data.coord.lat,
        longitude: data.coord.lon,
        temperature: Math.round(data.main.temp),
        description: data.weather[0].description,
        humidity: data.main.humidity,
        windSpeed: Math.round(data.wind.speed * 3.6), // Convert m/s to km/h
        pressure: data.main.pressure,
        visibility: data.visibility ? Math.round(data.visibility / 1000) : 10, // Convert m to km, default 10km
        uvIndex: undefined, // OpenWeatherMap doesn't provide UV index in free tier
        timestamp: new Date().toISOString(),
      };
    } catch (error) {
      console.error('OpenWeatherMap error:', error);
      throw new Error(`Failed to get weather data: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }
}
