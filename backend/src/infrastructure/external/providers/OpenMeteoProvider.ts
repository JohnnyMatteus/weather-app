import axios from 'axios';
import { IWeatherProvider, WeatherData } from '@/domain/interfaces/services/IWeatherProvider';

export class OpenMeteoProvider implements IWeatherProvider {
  name = 'OpenMeteo';
  private baseUrl = 'https://api.open-meteo.com/v1';

  isAvailable(): boolean {
    return true; // Open-Meteo is free and doesn't require API key
  }

  async getWeatherByCity(city: string, country?: string): Promise<WeatherData> {
    try {
      // Use a simple approach with known coordinates for major Brazilian cities
      const cityCoordinates = this.getCityCoordinates(city, country);
      
      if (cityCoordinates) {
        console.log(`[OpenMeteo] Using known coordinates for ${city}: ${cityCoordinates.latitude}, ${cityCoordinates.longitude}`);
        return this.getWeatherByCoordinates(
          cityCoordinates.latitude, 
          cityCoordinates.longitude, 
          cityCoordinates.name, 
          cityCoordinates.country
        );
      }

      // Fallback to geocoding
      const geocodingQuery = `name=${encodeURIComponent(city)}&count=5`;
      const geocodingUrl = `${this.baseUrl}/geocoding/search?${geocodingQuery}`;
      console.log(`[OpenMeteo] Geocoding URL: ${geocodingUrl}`);
      
      const geocodingResponse = await axios.get(geocodingUrl);
      const geocodingData = geocodingResponse.data;
      console.log(`[OpenMeteo] Geocoding results:`, geocodingData.results?.length || 0);
      
      if (!geocodingData.results || geocodingData.results.length === 0) {
        throw new Error(`City "${city}" not found`);
      }

      const { latitude, longitude, name, country: resultCountry } = geocodingData.results[0];
      console.log(`[OpenMeteo] Selected: ${name}, ${resultCountry} (${latitude}, ${longitude})`);
      
      return this.getWeatherByCoordinates(latitude, longitude, name, resultCountry);
    } catch (error) {
      console.error('OpenMeteo geocoding error:', error);
      throw new Error(`Failed to get weather for ${city}: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  private getCityCoordinates(city: string, country?: string): { latitude: number; longitude: number; name: string; country: string } | null {
    const cityMap: { [key: string]: { latitude: number; longitude: number; name: string; country: string } } = {
      'sao paulo': { latitude: -23.5505, longitude: -46.6333, name: 'São Paulo', country: 'BR' },
      'são paulo': { latitude: -23.5505, longitude: -46.6333, name: 'São Paulo', country: 'BR' },
      'rio de janeiro': { latitude: -22.9068, longitude: -43.1729, name: 'Rio de Janeiro', country: 'BR' },
      'brasilia': { latitude: -15.7801, longitude: -47.9292, name: 'Brasília', country: 'BR' },
      'brasília': { latitude: -15.7801, longitude: -47.9292, name: 'Brasília', country: 'BR' },
      'salvador': { latitude: -12.9777, longitude: -38.5016, name: 'Salvador', country: 'BR' },
      'fortaleza': { latitude: -3.7319, longitude: -38.5267, name: 'Fortaleza', country: 'BR' },
      'belo horizonte': { latitude: -19.9167, longitude: -43.9345, name: 'Belo Horizonte', country: 'BR' },
      'manaus': { latitude: -3.1190, longitude: -60.0217, name: 'Manaus', country: 'BR' },
      'curitiba': { latitude: -25.4244, longitude: -49.2654, name: 'Curitiba', country: 'BR' },
      'recife': { latitude: -8.0476, longitude: -34.8770, name: 'Recife', country: 'BR' },
      'porto alegre': { latitude: -30.0346, longitude: -51.2177, name: 'Porto Alegre', country: 'BR' },
      'london': { latitude: 51.5074, longitude: -0.1278, name: 'London', country: 'GB' },
      'new york': { latitude: 40.7128, longitude: -74.0060, name: 'New York', country: 'US' },
      'tokyo': { latitude: 35.6762, longitude: 139.6503, name: 'Tokyo', country: 'JP' },
      'paris': { latitude: 48.8566, longitude: 2.3522, name: 'Paris', country: 'FR' },
    };

    const normalizedCity = city.toLowerCase().trim();
    return cityMap[normalizedCity] || null;
  }

  async getWeatherByCoordinates(
    latitude: number, 
    longitude: number, 
    cityName?: string, 
    countryName?: string
  ): Promise<WeatherData> {
    try {
      const weatherUrl = `${this.baseUrl}/forecast?latitude=${latitude}&longitude=${longitude}&current_weather=true&hourly=temperature_2m,relativehumidity_2m,windspeed_10m,pressure_msl,visibility,uv_index&timezone=auto`;
      
      const response = await axios.get(weatherUrl);
      const data = response.data;
      
      if (!data.current_weather) {
        throw new Error('No weather data available');
      }

      const current = data.current_weather;
      const hourly = data.hourly;
      const currentTimeIndex = hourly.time.findIndex((time: string) => time === current.time);

      return {
        city: cityName || 'Unknown',
        country: countryName || undefined,
        latitude,
        longitude,
        temperature: Math.round(current.temperature),
        description: this.getWeatherDescription(current.weathercode),
        humidity: hourly.relativehumidity_2m[currentTimeIndex] || 0,
        windSpeed: Math.round(current.windspeed),
        pressure: hourly.pressure_msl[currentTimeIndex] || undefined,
        visibility: hourly.visibility[currentTimeIndex] || undefined,
        uvIndex: hourly.uv_index[currentTimeIndex] || undefined,
        timestamp: new Date().toISOString(),
      };
    } catch (error) {
      console.error('OpenMeteo weather error:', error);
      throw new Error(`Failed to get weather data: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  // New: forecast (next 5 days, daily min/max and hourly temp)
  async getForecastByCoordinates(
    latitude: number,
    longitude: number
  ): Promise<any> {
    try {
      const forecastUrl = `${this.baseUrl}/forecast?latitude=${latitude}&longitude=${longitude}&hourly=temperature_2m,relativehumidity_2m,windspeed_10m,pressure_msl,uv_index&daily=temperature_2m_max,temperature_2m_min,uv_index_max&forecast_days=5&timezone=auto`;
      const response = await axios.get(forecastUrl);
      const data = response.data;
      if (!data?.hourly || !data?.daily) {
        throw new Error('No forecast data available');
      }
      return {
        hourly: data.hourly,
        daily: data.daily,
      };
    } catch (error) {
      console.error('OpenMeteo forecast error:', error);
      throw new Error(`Failed to get forecast data: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  async getForecastByCity(city: string, country?: string): Promise<any> {
    const cityCoordinates = this.getCityCoordinates(city, country);
    if (cityCoordinates) {
      return this.getForecastByCoordinates(cityCoordinates.latitude, cityCoordinates.longitude);
    }
    // fallback geocoding
    const geocodingQuery = `name=${encodeURIComponent(city)}&count=5`;
    const geocodingUrl = `${this.baseUrl}/geocoding/search?${geocodingQuery}`;
    const geocodingResponse = await axios.get(geocodingUrl);
    const geocodingData = geocodingResponse.data;
    if (!geocodingData.results || geocodingData.results.length === 0) {
      throw new Error(`City "${city}" not found`);
    }
    const { latitude, longitude } = geocodingData.results[0];
    return this.getForecastByCoordinates(latitude, longitude);
  }

  private getWeatherDescription(code: number): string {
    const descriptions: { [key: number]: string } = {
      0: 'Céu limpo',
      1: 'Predominantemente limpo',
      2: 'Parcialmente nublado',
      3: 'Nublado',
      45: 'Nevoeiro',
      48: 'Nevoeiro com geada',
      51: 'Garoa fraca',
      53: 'Garoa moderada',
      55: 'Garoa intensa',
      61: 'Chuva fraca',
      63: 'Chuva moderada',
      65: 'Chuva forte',
      71: 'Neve fraca',
      73: 'Neve moderada',
      75: 'Neve forte',
      77: 'Grãos de neve',
      80: 'Pancadas de chuva fracas',
      81: 'Pancadas de chuva moderadas',
      82: 'Pancadas de chuva fortes',
      85: 'Pancadas de neve fracas',
      86: 'Pancadas de neve fortes',
      95: 'Trovoadas',
      96: 'Trovoadas com granizo fraco',
      99: 'Trovoadas com granizo forte',
    };

    return descriptions[code] || 'Desconhecido';
  }
}
