import { z } from 'zod';
import { ISearchHistoryRepository } from '../../../domain/interfaces/repositories/ISearchHistoryRepository';

export const GetSearchHistoryRequestSchema = z.object({
  userId: z.string(),
  limit: z.coerce.number().min(1).max(10).optional().default(5),
});

export type GetSearchHistoryRequest = z.infer<typeof GetSearchHistoryRequestSchema>;

export interface GetSearchHistoryResponse {
  history: Array<{
    id: string;
    city: string;
    country: string | undefined;
    temperature: number;
    description: string;
    searchedAt: string;
  }>;
}

export class GetSearchHistoryUseCase {
  constructor(
    private readonly searchHistoryRepository: ISearchHistoryRepository
  ) {}

  async execute(request: GetSearchHistoryRequest): Promise<GetSearchHistoryResponse> {
    const history = await this.searchHistoryRepository.findByUserId(
      request.userId,
      request.limit || 5
    );

    return {
      history: history.map(item => ({
        id: item.id,
        city: item.city,
        country: item.country || undefined,
        temperature: item.temperature,
        description: item.description,
        searchedAt: item.searchedAt.toISOString(),
      })),
    };
  }
}
