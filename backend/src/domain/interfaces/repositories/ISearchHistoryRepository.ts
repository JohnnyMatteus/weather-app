import { SearchHistoryEntity } from '../../entities/SearchHistory';

export interface ISearchHistoryRepository {
  findByUserId(userId: string, limit?: number): Promise<SearchHistoryEntity[]>;
  create(searchHistory: SearchHistoryEntity): Promise<SearchHistoryEntity>;
  deleteOldEntries(userId: string, keepCount: number): Promise<void>;
}
