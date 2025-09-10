import { describe, it, expect, vi, beforeEach } from 'vitest';
import axios from 'axios';
import { OpenMeteoProvider } from './OpenMeteoProvider';

vi.mock('axios');

describe('OpenMeteoProvider', () => {
  let provider: OpenMeteoProvider;

  beforeEach(() => {
    provider = new OpenMeteoProvider();
    vi.clearAllMocks();
  });

  describe('isAvailable', () => {
    it('should always return true', () => {
      expect(provider.isAvailable()).toBe(true);
    });
  });

  describe('getWeatherByCity', () => {
    it('should get weather for a valid city', async () => {
      const mockWeatherResponse = {
        data: {
          current_weather: {
            temperature: 25,
            weathercode: 1,
            windspeed: 12,
            time: '2025-09-09T12:00'
          },
          hourly: {
            time: ['2025-09-09T12:00'],
            relativehumidity_2m: [65],
            pressure_msl: [1013],
            visibility: [10],
            uv_index: [6]
          }
        }
      } as any;

      (axios.get as unknown as any).mockResolvedValueOnce(mockWeatherResponse);

      const result = await provider.getWeatherByCity('São Paulo');

      expect(result.city).toBe('São Paulo');
      expect(result.country).toBe('BR');
      expect(result.temperature).toBe(25);
      expect(result.description).toBe('Predominantemente limpo');
      expect(result.humidity).toBe(65);
      expect(result.windSpeed).toBe(12);
      expect(result.pressure).toBe(1013);
      expect(result.visibility).toBe(10);
      expect(result.uvIndex).toBe(6);
    });

    it('should throw error when city is not found', async () => {
      const mockGeocodingResponse = { data: { results: [] } } as any;
      (axios.get as unknown as any).mockResolvedValueOnce(mockGeocodingResponse);

      await expect(provider.getWeatherByCity('InvalidCity'))
        .rejects.toThrow('City "InvalidCity" not found');
    });

    it('should throw error when geocoding API fails', async () => {
      (axios.get as unknown as any).mockRejectedValueOnce(new Error('Request failed with status code 500'));

      await expect(provider.getWeatherByCity('São Paulo'))
        .rejects.toThrow('Failed to get weather data: Request failed with status code 500');
    });
  });

  describe('getWeatherByCoordinates', () => {
    it('should get weather for valid coordinates', async () => {
      const mockWeatherResponse = {
        data: {
          current_weather: {
            temperature: 20,
            weathercode: 0,
            windspeed: 8,
            time: '2025-09-09T12:00'
          },
          hourly: {
            time: ['2025-09-09T12:00'],
            relativehumidity_2m: [60],
            pressure_msl: [1015],
            visibility: [15],
            uv_index: [4]
          }
        }
      } as any;

      (axios.get as unknown as any).mockResolvedValueOnce(mockWeatherResponse);

      const result = await provider.getWeatherByCoordinates(-23.5505, -46.6333, 'São Paulo', 'BR');

      expect(result.city).toBe('São Paulo');
      expect(result.country).toBe('BR');
      expect(result.latitude).toBe(-23.5505);
      expect(result.longitude).toBe(-46.6333);
      expect(result.temperature).toBe(20);
      expect(result.description).toBe('Céu limpo');
    });

    it('should throw error when weather API fails', async () => {
      (axios.get as unknown as any).mockRejectedValueOnce(new Error('Weather API error: 500'));

      await expect(provider.getWeatherByCoordinates(-23.5505, -46.6333))
        .rejects.toThrow('Weather API error: 500');
    });
  });

  describe('getWeatherDescription', () => {
    it('should return correct description for weather codes', () => {
      const provider = new OpenMeteoProvider() as any;
      
      expect(provider.getWeatherDescription(0)).toBe('Céu limpo');
      expect(provider.getWeatherDescription(1)).toBe('Predominantemente limpo');
      expect(provider.getWeatherDescription(45)).toBe('Nevoeiro');
      expect(provider.getWeatherDescription(61)).toBe('Chuva fraca');
      expect(provider.getWeatherDescription(95)).toBe('Trovoadas');
      expect(provider.getWeatherDescription(999)).toBe('Desconhecido');
    });
  });
});
