import { apiClient } from '@/shared/api/client';

export const weatherApi = apiClient;

export interface WeatherData {
  city: string;
  country?: string;
  latitude?: number;
  longitude?: number;
  temperature: number;
  description: string;
  humidity: number;
  windSpeed: number;
  pressure?: number;
  visibility?: number;
  uvIndex?: number;
  timestamp: string;
}

export interface WeatherResponse {
  success: boolean;
  data: {
    weather: WeatherData;
    fromCache: boolean;
  };
}

export interface SearchHistoryItem {
  id: string;
  city: string;
  country?: string;
  temperature: number;
  description: string;
  searchedAt: string;
}

export interface SearchHistoryResponse {
  success: boolean;
  data: {
    history: SearchHistoryItem[];
  };
}

export interface ForecastDaily {
  time: string[]; // dates
  temperature_2m_max?: number[];
  temperature_2m_min?: number[];
  weathercode?: number[];
}

export interface ForecastResponse {
  success: boolean;
  data: {
    hourly?: any;
    daily?: ForecastDaily;
  };
}

export const weatherService = {
  getWeather: async (city: string, country?: string): Promise<WeatherResponse> => {
    const params = new URLSearchParams({ city });
    if (country) params.append('country', country);
    
    const response = await weatherApi.get<WeatherResponse>(`/weather?${params}`);
    return response.data;
  },

  getWeatherByCoordinates: async (latitude: number, longitude: number): Promise<WeatherResponse> => {
    const params = new URLSearchParams({ latitude: String(latitude), longitude: String(longitude) });
    const response = await weatherApi.get<WeatherResponse>(`/weather?${params}`);
    return response.data;
  },

  getForecast: async (city: string, country?: string): Promise<ForecastResponse> => {
    const params = new URLSearchParams({ city });
    if (country) params.append('country', country);
    const response = await weatherApi.get<ForecastResponse>(`/weather/forecast?${params}`);
    return response.data;
  },

  getForecastByCoordinates: async (latitude: number, longitude: number): Promise<ForecastResponse> => {
    const params = new URLSearchParams({ latitude: String(latitude), longitude: String(longitude) });
    const response = await weatherApi.get<ForecastResponse>(`/weather/forecast?${params}`);
    return response.data;
  },

  getSearchHistory: async (limit: number = 5): Promise<SearchHistoryResponse> => {
    const response = await weatherApi.get<SearchHistoryResponse>(
      `/weather/history?limit=${limit}`
    );
    return response.data;
  },
};
