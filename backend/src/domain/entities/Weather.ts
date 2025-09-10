import { z } from 'zod';

export const WeatherSchema = z.object({
  city: z.string(),
  country: z.string().optional(),
  latitude: z.number().optional(),
  longitude: z.number().optional(),
  temperature: z.number(),
  description: z.string(),
  humidity: z.number().min(0).max(100),
  windSpeed: z.number().min(0),
  pressure: z.number().optional(),
  visibility: z.number().optional(),
  uvIndex: z.number().optional(),
  timestamp: z.date(),
});

export type Weather = z.infer<typeof WeatherSchema>;

export class WeatherEntity {
  private constructor(
    public readonly city: string,
    public readonly country: string | undefined,
    public readonly latitude: number | undefined,
    public readonly longitude: number | undefined,
    public readonly temperature: number,
    public readonly description: string,
    public readonly humidity: number,
    public readonly windSpeed: number,
    public readonly pressure: number | undefined,
    public readonly visibility: number | undefined,
    public readonly uvIndex: number | undefined,
    public readonly timestamp: Date
  ) {}

  static create(data: Omit<Weather, 'timestamp'>): WeatherEntity {
    return new WeatherEntity(
      data.city,
      data.country,
      data.latitude,
      data.longitude,
      data.temperature,
      data.description,
      data.humidity,
      data.windSpeed,
      data.pressure,
      data.visibility,
      data.uvIndex,
      new Date()
    );
  }

  static fromExternalAPI(data: any): WeatherEntity {
    return new WeatherEntity(
      data.name,
      data.sys?.country,
      data.coord?.lat,
      data.coord?.lon,
      Math.round(data.main.temp - 273.15), // Convert Kelvin to Celsius
      data.weather[0]?.description || 'Unknown',
      data.main.humidity,
      data.wind?.speed || 0,
      data.main.pressure,
      data.visibility,
      undefined, // UV index not available in basic API
      new Date()
    );
  }

  toJSON(): any {
    const result: any = {
      city: this.city,
      country: this.country,
      latitude: this.latitude,
      longitude: this.longitude,
      temperature: this.temperature,
      description: this.description,
      humidity: this.humidity,
      windSpeed: this.windSpeed,
      timestamp: this.timestamp,
    };

    // Only include optional fields if they have values
    if (this.pressure !== undefined) result.pressure = this.pressure;
    if (this.visibility !== undefined) result.visibility = this.visibility;
    if (this.uvIndex !== undefined) result.uvIndex = this.uvIndex;

    return result;
  }

  getCacheKey(): string {
    return `weather:${this.city.toLowerCase()}:${this.country?.toLowerCase() || 'unknown'}`;
  }
}
