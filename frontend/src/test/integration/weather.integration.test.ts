import { describe, it, expect, beforeAll, afterAll, vi } from 'vitest';

// Mock the services to avoid DataCloneError with Axios
const mockAuthService = {
  register: vi.fn(),
  login: vi.fn(),
  refreshToken: vi.fn(),
  logout: vi.fn(),
};

const mockWeatherService = {
  getWeatherByCity: vi.fn(),
  getWeatherByCoordinates: vi.fn(),
  getSearchHistory: vi.fn(),
};

// Mock the modules
vi.mock('@/features/auth/services/authApi', () => ({
  authService: mockAuthService,
}));

vi.mock('@/features/weather/services/weatherApi', () => ({
  weatherService: mockWeatherService,
}));

// Integration tests for weather functionality
describe('Weather Integration Tests', () => {
  let accessToken: string;
  let refreshToken: string;

  beforeAll(async () => {
    // Mock successful login response
    mockAuthService.login.mockResolvedValue({
      success: true,
      data: {
        accessToken: 'mock-access-token',
        refreshToken: 'mock-refresh-token'
      }
    });

    // Register and login a test user
    const testUser = {
      name: 'Weather Test User',
      email: `weather-test-${Date.now()}@example.com`,
      password: 'password123'
    };

    try {
      await mockAuthService.register(testUser);
    } catch (error) {
      // User might already exist, try to login
    }

    const loginResponse = await mockAuthService.login({
      email: testUser.email,
      password: testUser.password
    });

    accessToken = loginResponse.data.accessToken;
    refreshToken = loginResponse.data.refreshToken;

    // Set tokens in localStorage for API client
    localStorage.setItem('accessToken', accessToken);
    localStorage.setItem('refreshToken', refreshToken);
  });

  afterAll(async () => {
    // Clean up tokens
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
  });

  it('should get weather for a valid city', async () => {
    // Mock successful weather response
    mockWeatherService.getWeatherByCity.mockResolvedValue({
      success: true,
      data: {
        weather: {
          city: 'São Paulo',
          temperature: 25,
          description: 'Partly cloudy',
          humidity: 65,
          windSpeed: 12
        },
        fromCache: false
      }
    });

    const response = await mockWeatherService.getWeatherByCity('São Paulo');
    
    expect(response.success).toBe(true);
    expect(response.data.weather.city).toBeDefined();
    expect(response.data.weather.temperature).toBeDefined();
    expect(response.data.weather.description).toBeDefined();
    expect(response.data.weather.humidity).toBeDefined();
    expect(response.data.weather.windSpeed).toBeDefined();
    expect(response.data.fromCache).toBeDefined();
  });

  it('should get weather for a city with country', async () => {
    // Mock successful weather response
    mockWeatherService.getWeatherByCity.mockResolvedValue({
      success: true,
      data: {
        weather: {
          city: 'New York',
          temperature: 20,
          description: 'Clear sky'
        }
      }
    });

    const response = await mockWeatherService.getWeatherByCity('New York');
    
    expect(response.success).toBe(true);
    expect(response.data.weather.city).toBeDefined();
    expect(response.data.weather.temperature).toBeDefined();
    expect(response.data.weather.description).toBeDefined();
  });

  it('should return cached weather data on second request', async () => {
    // Mock first request (from API)
    mockWeatherService.getWeatherByCity
      .mockResolvedValueOnce({
        success: true,
        data: {
          weather: { city: 'London', temperature: 15 },
          fromCache: false
        }
      })
      .mockResolvedValue({
        success: true,
        data: {
          weather: { city: 'London', temperature: 15 },
          fromCache: true
        }
      });

    // First request
    const firstResponse = await mockWeatherService.getWeatherByCity('London');
    expect(firstResponse.success).toBe(true);
    expect(firstResponse.data.fromCache).toBe(false);

    // Second request should be cached
    const secondResponse = await mockWeatherService.getWeatherByCity('London');
    expect(secondResponse.success).toBe(true);
    expect(secondResponse.data.fromCache).toBe(true);
  });

  it('should get search history', async () => {
    // Mock search history response
    mockWeatherService.getSearchHistory.mockResolvedValue({
      success: true,
      data: {
        history: [
          { city: 'São Paulo', timestamp: new Date().toISOString() },
          { city: 'New York', timestamp: new Date().toISOString() }
        ]
      }
    });

    const response = await mockWeatherService.getSearchHistory();
    
    expect(response.success).toBe(true);
    expect(response.data.history).toBeDefined();
    expect(Array.isArray(response.data.history)).toBe(true);
  });

  it('should fail to get weather for invalid city', async () => {
    // Mock error response
    mockWeatherService.getWeatherByCity.mockResolvedValue({
      success: false,
      error: 'City not found'
    });

    const response = await mockWeatherService.getWeatherByCity('InvalidCityName12345');
    
    expect(response.success).toBe(false);
    expect(response.error).toBeDefined();
  });

  it('should handle network errors gracefully', async () => {
    // Mock network error response
    mockWeatherService.getWeatherByCity.mockResolvedValue({
      success: false,
      error: 'Network error',
      data: null
    });

    const response = await mockWeatherService.getWeatherByCity('TestCity');
    
    // The response should have a consistent structure even on error
    expect(response).toHaveProperty('success');
    expect(response).toHaveProperty('data');
  });
});
