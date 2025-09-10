import { z } from 'zod';
import { v4 as uuidv4 } from 'uuid';

export const SearchHistorySchema = z.object({
  id: z.string(),
  userId: z.string(),
  city: z.string(),
  country: z.string().optional(),
  latitude: z.number().optional(),
  longitude: z.number().optional(),
  temperature: z.number(),
  description: z.string(),
  humidity: z.number(),
  windSpeed: z.number(),
  searchedAt: z.date(),
});

export type SearchHistory = z.infer<typeof SearchHistorySchema>;

export class SearchHistoryEntity {
  private constructor(
    public readonly id: string,
    public readonly userId: string,
    public readonly city: string,
    public readonly country: string | undefined,
    public readonly latitude: number | undefined,
    public readonly longitude: number | undefined,
    public readonly temperature: number,
    public readonly description: string,
    public readonly humidity: number,
    public readonly windSpeed: number,
    public readonly searchedAt: Date
  ) {}

  static create(data: Omit<SearchHistory, 'id' | 'searchedAt'>): SearchHistoryEntity {
    return new SearchHistoryEntity(
      uuidv4(), // Generate UUID
      data.userId,
      data.city,
      data.country,
      data.latitude,
      data.longitude,
      data.temperature,
      data.description,
      data.humidity,
      data.windSpeed,
      new Date()
    );
  }

  static fromPersistence(data: SearchHistory): SearchHistoryEntity {
    return new SearchHistoryEntity(
      data.id,
      data.userId,
      data.city,
      data.country,
      data.latitude,
      data.longitude,
      data.temperature,
      data.description,
      data.humidity,
      data.windSpeed,
      data.searchedAt
    );
  }

  toJSON(): SearchHistory {
    return {
      id: this.id,
      userId: this.userId,
      city: this.city,
      country: this.country,
      latitude: this.latitude,
      longitude: this.longitude,
      temperature: this.temperature,
      description: this.description,
      humidity: this.humidity,
      windSpeed: this.windSpeed,
      searchedAt: this.searchedAt,
    };
  }
}
