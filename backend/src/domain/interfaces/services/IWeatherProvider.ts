export interface WeatherData {
  city: string;
  country?: string | undefined;
  latitude?: number | undefined;
  longitude?: number | undefined;
  temperature: number;
  description: string;
  humidity: number;
  windSpeed: number;
  pressure?: number | undefined;
  visibility?: number | undefined;
  uvIndex?: number | undefined;
  timestamp: string;
}

export interface IWeatherProvider {
  name: string;
  isAvailable(): boolean;
  getWeatherByCity(city: string, country?: string): Promise<WeatherData>;
  getWeatherByCoordinates(latitude: number, longitude: number): Promise<WeatherData>;
}
