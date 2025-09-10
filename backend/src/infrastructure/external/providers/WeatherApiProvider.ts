import axios from 'axios';
import { IWeatherProvider, WeatherData } from '@/domain/interfaces/services/IWeatherProvider';

export class WeatherApiProvider implements IWeatherProvider {
  name = 'WeatherAPI';
  private apiKey: string;
  private baseUrl = 'https://api.weatherapi.com/v1';

  constructor(apiKey: string) {
    this.apiKey = apiKey;
  }

  isAvailable(): boolean {
    return !!this.apiKey && this.apiKey.length > 0;
  }

  async getWeatherByCity(city: string, country?: string): Promise<WeatherData> {
    if (!this.isAvailable()) {
      throw new Error('WeatherAPI key not configured');
    }

    try {
      const query = country ? `${city},${country}` : city;
      const url = `${this.baseUrl}/current.json?key=${this.apiKey}&q=${encodeURIComponent(query)}&aqi=no`;
      
      console.log(`[WeatherAPI] Requesting weather for: ${query}`);
      const response = await axios.get(url);
      const data = response.data;
      console.log(`[WeatherAPI] Response for ${query}:`, data.location?.name);
      
      return {
        city: data.location.name,
        country: data.location.country,
        latitude: data.location.lat,
        longitude: data.location.lon,
        temperature: Math.round(data.current.temp_c),
        description: data.current.condition.text,
        humidity: data.current.humidity,
        windSpeed: Math.round(data.current.wind_kph),
        pressure: data.current.pressure_mb,
        visibility: Math.round(data.current.vis_km),
        uvIndex: data.current.uv,
        timestamp: new Date().toISOString(),
      };
    } catch (error) {
      console.error('WeatherAPI error:', error);
      throw new Error(`Failed to get weather for ${city}: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  async getWeatherByCoordinates(latitude: number, longitude: number): Promise<WeatherData> {
    if (!this.isAvailable()) {
      throw new Error('WeatherAPI key not configured');
    }

    try {
      const url = `${this.baseUrl}/current.json?key=${this.apiKey}&q=${latitude},${longitude}&aqi=no`;
      
      console.log(`[WeatherAPI] Requesting weather for coordinates: ${latitude}, ${longitude}`);
      const response = await axios.get(url);
      const data = response.data;
      console.log(`[WeatherAPI] Response for coordinates:`, data.location?.name);
      
      return {
        city: data.location.name,
        country: data.location.country,
        latitude: data.location.lat,
        longitude: data.location.lon,
        temperature: Math.round(data.current.temp_c),
        description: data.current.condition.text,
        humidity: data.current.humidity,
        windSpeed: Math.round(data.current.wind_kph),
        pressure: data.current.pressure_mb,
        visibility: Math.round(data.current.vis_km),
        uvIndex: data.current.uv,
        timestamp: new Date().toISOString(),
      };
    } catch (error) {
      console.error('WeatherAPI error:', error);
      throw new Error(`Failed to get weather data: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }
}
