import { z } from 'zod';
import { OpenMeteoProvider } from '@/infrastructure/external/providers/OpenMeteoProvider';

export const GetForecastRequestSchema = z.object({
  city: z.string().optional(),
  latitude: z.number().optional(),
  longitude: z.number().optional(),
  country: z.string().optional(),
});

export type GetForecastRequest = z.infer<typeof GetForecastRequestSchema>;

export class GetForecastUseCase {
  constructor(private readonly provider: OpenMeteoProvider) {}

  async execute(req: GetForecastRequest): Promise<{ hourly: any; daily: any }> {
    if (req.latitude !== undefined && req.longitude !== undefined) {
      return this.provider.getForecastByCoordinates(req.latitude, req.longitude);
    }
    if (req.city) {
      return this.provider.getForecastByCity(req.city, req.country);
    }
    throw new Error('city or coordinates are required');
  }
}


