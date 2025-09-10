import { ISearchHistoryRepository } from '@/domain/interfaces/repositories/ISearchHistoryRepository';
import { SearchHistoryEntity } from '@/domain/entities/SearchHistory';
import { SearchHistoryModel, ISearchHistoryDocument } from './models/SearchHistoryModel';
import { logger } from '../logging/Logger';

export class MongoSearchHistoryRepository implements ISearchHistoryRepository {
  async save(userId: string, weatherData: {
    city: string;
    country: string;
    latitude: number;
    longitude: number;
    temperature: number;
    description: string;
    humidity: number;
    windSpeed: number;
  }): Promise<void> {
    try {
      const searchHistoryDoc: Partial<ISearchHistoryDocument> = {
        userId,
        city: weatherData.city,
        country: weatherData.country,
        latitude: weatherData.latitude,
        longitude: weatherData.longitude,
        temperature: weatherData.temperature,
        description: weatherData.description,
        humidity: weatherData.humidity,
        windSpeed: weatherData.windSpeed,
        searchedAt: new Date()
      };

      await SearchHistoryModel.create(searchHistoryDoc);
      logger.info(`Search history saved for user ${userId} - ${weatherData.city}, ${weatherData.country}`);
    } catch (error: any) {
      logger.warn({
        msg: 'Failed to save search history (non-blocking)',
        message: error?.message,
      });
      return;
    }
  }

  async findByUserId(userId: string, limit: number = 5): Promise<SearchHistoryEntity[]> {
    try {
      const results = await SearchHistoryModel
        .find({ userId })
        .sort({ searchedAt: -1 })
        .limit(limit)
        .lean();

      return results.map(doc => SearchHistoryEntity.fromPersistence({
        id: doc._id.toString(),
        userId: doc.userId,
        city: doc.city,
        country: doc.country,
        latitude: doc.latitude,
        longitude: doc.longitude,
        temperature: doc.temperature,
        description: doc.description,
        humidity: doc.humidity,
        windSpeed: doc.windSpeed,
        searchedAt: doc.searchedAt
      }));
    } catch (error: any) {
      logger.warn({ msg: 'Failed to find search history (returning empty)', message: error?.message });
      return [];
    }
  }

  async create(searchHistory: SearchHistoryEntity): Promise<SearchHistoryEntity> {
    try {
      const searchHistoryDoc: Partial<ISearchHistoryDocument> = {
        userId: searchHistory.userId,
        city: searchHistory.city,
        country: searchHistory.country || '',
        latitude: searchHistory.latitude || 0,
        longitude: searchHistory.longitude || 0,
        temperature: searchHistory.temperature,
        description: searchHistory.description,
        humidity: searchHistory.humidity,
        windSpeed: searchHistory.windSpeed,
        searchedAt: searchHistory.searchedAt
      };

      const result = await SearchHistoryModel.create(searchHistoryDoc);
      logger.info(`Search history created for user ${searchHistory.userId}`);
      return searchHistory;
    } catch (error) {
      logger.error('Failed to create search history:', error);
      throw new Error('Failed to create search history');
    }
  }

  async deleteOldEntries(userId: string, keepCount: number): Promise<void> {
    try {
      const entries = await SearchHistoryModel
        .find({ userId })
        .sort({ searchedAt: -1 })
        .skip(keepCount);

      if (entries.length > 0) {
        const idsToDelete = entries.map(entry => entry._id);
        await SearchHistoryModel.deleteMany({ _id: { $in: idsToDelete } });
        logger.info(`Deleted ${idsToDelete.length} old search history entries for user ${userId}`);
      }
    } catch (error) {
      logger.error('Failed to delete old search history entries:', error);
      throw new Error('Failed to delete old search history entries');
    }
  }

  async deleteByUserId(userId: string): Promise<void> {
    try {
      await SearchHistoryModel.deleteMany({ userId });
      logger.info(`Search history deleted for user ${userId}`);
    } catch (error) {
      logger.error('Failed to delete search history:', error);
      throw new Error('Failed to delete search history');
    }
  }

  async getSearchStats(days: number = 30): Promise<any> {
    try {
      const query = {
        searchedAt: { $gte: new Date(Date.now() - days * 24 * 60 * 60 * 1000) }
      };

      const stats = await SearchHistoryModel.aggregate([
        { $match: query },
        {
          $group: {
            _id: '$city',
            count: { $sum: 1 },
            uniqueUsers: { $addToSet: '$userId' }
          }
        },
        {
          $project: {
            city: '$_id',
            searchCount: '$count',
            uniqueUserCount: { $size: '$uniqueUsers' }
          }
        },
        { $sort: { searchCount: -1 } },
        { $limit: 10 }
      ]);

      return stats;
    } catch (error) {
      logger.error('Failed to get search stats:', error);
      throw new Error('Failed to get search stats');
    }
  }
}
