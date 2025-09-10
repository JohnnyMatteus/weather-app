import { describe, it, expect, vi, beforeEach } from 'vitest';
import { WeatherServiceManager } from './WeatherServiceManager';
import { OpenMeteoProvider } from '../external/providers/OpenMeteoProvider';
import { OpenWeatherProvider } from '../external/providers/OpenWeatherProvider';

// Mock the providers
vi.mock('../external/providers/OpenMeteoProvider');
vi.mock('../external/providers/OpenWeatherProvider');

describe('WeatherServiceManager', () => {
  let manager: WeatherServiceManager;
  let mockOpenMeteoProvider: any;
  let mockOpenWeatherProvider: any;

  beforeEach(() => {
    // Reset mocks
    vi.clearAllMocks();

    // Create mock instances
    mockOpenMeteoProvider = {
      name: 'OpenMeteo',
      isAvailable: vi.fn(),
      getWeatherByCity: vi.fn(),
      getWeatherByCoordinates: vi.fn(),
    };

    mockOpenWeatherProvider = {
      name: 'OpenWeatherMap',
      isAvailable: vi.fn(),
      getWeatherByCity: vi.fn(),
      getWeatherByCoordinates: vi.fn(),
    };

    // Mock constructors
    (OpenMeteoProvider as any).mockImplementation(() => mockOpenMeteoProvider);
    (OpenWeatherProvider as any).mockImplementation(() => mockOpenWeatherProvider);

    manager = new WeatherServiceManager();
  });

  describe('getWeatherByCity', () => {
    it('should use first available provider', async () => {
      const mockWeatherData = {
        city: 'São Paulo',
        country: 'BR',
        latitude: -23.5505,
        longitude: -46.6333,
        temperature: 25,
        description: 'Partly cloudy',
        humidity: 65,
        windSpeed: 12,
        pressure: 1013,
        visibility: 10,
        uvIndex: 6,
        timestamp: '2025-09-09T12:00:00Z',
      };

      mockOpenMeteoProvider.isAvailable.mockReturnValue(true);
      mockOpenMeteoProvider.getWeatherByCity.mockResolvedValue(mockWeatherData);

      const result = await manager.getWeatherByCity('São Paulo');

      expect(mockOpenMeteoProvider.getWeatherByCity).toHaveBeenCalledWith('São Paulo', undefined);
      expect(result).toEqual(mockWeatherData);
    });

    it('should skip unavailable providers', async () => {
      const mockWeatherData = {
        city: 'São Paulo',
        country: 'BR',
        latitude: -23.5505,
        longitude: -46.6333,
        temperature: 25,
        description: 'Partly cloudy',
        humidity: 65,
        windSpeed: 12,
        pressure: 1013,
        visibility: 10,
        uvIndex: 6,
        timestamp: '2025-09-09T12:00:00Z',
      };

      mockOpenMeteoProvider.isAvailable.mockReturnValue(false);
      mockOpenWeatherProvider.isAvailable.mockReturnValue(true);
      mockOpenWeatherProvider.getWeatherByCity.mockResolvedValue(mockWeatherData);

      const result = await manager.getWeatherByCity('São Paulo');

      expect(mockOpenMeteoProvider.getWeatherByCity).not.toHaveBeenCalled();
      expect(mockOpenWeatherProvider.getWeatherByCity).toHaveBeenCalledWith('São Paulo', undefined);
      expect(result).toEqual(mockWeatherData);
    });

    it('should throw error when all providers fail', async () => {
      mockOpenMeteoProvider.isAvailable.mockReturnValue(true);
      mockOpenMeteoProvider.getWeatherByCity.mockRejectedValue(new Error('API Error'));
      mockOpenWeatherProvider.isAvailable.mockReturnValue(true);
      mockOpenWeatherProvider.getWeatherByCity.mockRejectedValue(new Error('API Error'));

      await expect(manager.getWeatherByCity('São Paulo'))
        .rejects.toThrow('All weather providers failed');
    });
  });

  describe('getWeatherByCoordinates', () => {
    it('should use first available provider', async () => {
      const mockWeatherData = {
        city: 'São Paulo',
        country: 'BR',
        latitude: -23.5505,
        longitude: -46.6333,
        temperature: 25,
        description: 'Partly cloudy',
        humidity: 65,
        windSpeed: 12,
        pressure: 1013,
        visibility: 10,
        uvIndex: 6,
        timestamp: '2025-09-09T12:00:00Z',
      };

      mockOpenMeteoProvider.isAvailable.mockReturnValue(true);
      mockOpenMeteoProvider.getWeatherByCoordinates.mockResolvedValue(mockWeatherData);

      const result = await manager.getWeatherByCoordinates(-23.5505, -46.6333);

      expect(mockOpenMeteoProvider.getWeatherByCoordinates).toHaveBeenCalledWith(-23.5505, -46.6333);
      expect(result).toEqual(mockWeatherData);
    });
  });

  describe('getAvailableProviders', () => {
    it('should return names of available providers', () => {
      mockOpenMeteoProvider.isAvailable.mockReturnValue(true);
      mockOpenWeatherProvider.isAvailable.mockReturnValue(false);

      const availableProviders = manager.getAvailableProviders();

      expect(availableProviders).toEqual(['OpenMeteo']);
    });
  });

  describe('getProviderStatus', () => {
    it('should return status of all providers', () => {
      mockOpenMeteoProvider.isAvailable.mockReturnValue(true);
      mockOpenWeatherProvider.isAvailable.mockReturnValue(false);

      const status = manager.getProviderStatus();

      expect(status).toHaveLength(2);
      expect(status).toContainEqual({ name: 'OpenWeatherMap', available: false });
      expect(status).toContainEqual({ name: 'OpenMeteo', available: true });
    });
  });
});
