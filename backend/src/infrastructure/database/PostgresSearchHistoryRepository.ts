import { Pool } from 'pg';
import { ISearchHistoryRepository } from '@/domain/interfaces/repositories/ISearchHistoryRepository';
import { SearchHistoryEntity } from '@/domain/entities/SearchHistory';

export class PostgresSearchHistoryRepository implements ISearchHistoryRepository {
  private pool: Pool;

  constructor() {
    this.pool = new Pool({
      connectionString: process.env['DATABASE_URL'] || 'postgresql://weather_user:weather_pass@localhost:5432/weather_db',
    });
  }

  async create(searchHistory: SearchHistoryEntity): Promise<SearchHistoryEntity> {
    const client = await this.pool.connect();
    try {
      const query = `
        INSERT INTO search_history (
          id, user_id, city, country, latitude, longitude, 
          temperature, description, humidity, wind_speed, searched_at
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
        RETURNING *
      `;

      await client.query(query, [
        searchHistory.id,
        searchHistory.userId,
        searchHistory.city,
        searchHistory.country || null,
        searchHistory.latitude || null,
        searchHistory.longitude || null,
        searchHistory.temperature,
        searchHistory.description,
        searchHistory.humidity,
        searchHistory.windSpeed,
        searchHistory.searchedAt.toISOString()
      ]);

      return searchHistory;
    } finally {
      client.release();
    }
  }

  async findByUserId(userId: string, limit: number = 5): Promise<SearchHistoryEntity[]> {
    const client = await this.pool.connect();
    try {
      const query = `
        SELECT * FROM search_history 
        WHERE user_id = $1 
        ORDER BY searched_at DESC 
        LIMIT $2
      `;

      const result = await client.query(query, [userId, Number(limit)]);

      return result.rows.map(row => SearchHistoryEntity.fromPersistence({
        id: row.id,
        userId: row.user_id,
        city: row.city,
        country: row.country || undefined,
        latitude: row.latitude || undefined,
        longitude: row.longitude || undefined,
        temperature: Number(row.temperature),
        description: row.description,
        humidity: Number(row.humidity),
        windSpeed: Number(row.wind_speed),
        searchedAt: new Date(row.searched_at)
      }));
    } finally {
      client.release();
    }
  }

  async findById(id: string): Promise<SearchHistoryEntity | null> {
    const client = await this.pool.connect();
    try {
      const query = 'SELECT * FROM search_history WHERE id = $1';
      const result = await client.query(query, [id]);

      if (result.rows.length === 0) return null;

      const row = result.rows[0];
      return SearchHistoryEntity.fromPersistence({
        id: row.id,
        userId: row.user_id,
        city: row.city,
        country: row.country || undefined,
        latitude: row.latitude || undefined,
        longitude: row.longitude || undefined,
        temperature: Number(row.temperature),
        description: row.description,
        humidity: Number(row.humidity),
        windSpeed: Number(row.wind_speed),
        searchedAt: new Date(row.searched_at)
      });
    } finally {
      client.release();
    }
  }

  async delete(id: string): Promise<void> {
    const client = await this.pool.connect();
    try {
      const query = 'DELETE FROM search_history WHERE id = $1';
      await client.query(query, [id]);
    } finally {
      client.release();
    }
  }

  async deleteOldEntries(userId: string, keepCount: number): Promise<void> {
    const client = await this.pool.connect();
    try {
      const query = `
        DELETE FROM search_history 
        WHERE user_id = $1 
        AND id NOT IN (
          SELECT id FROM search_history 
          WHERE user_id = $1 
          ORDER BY searched_at DESC 
          LIMIT $2
        )
      `;
      await client.query(query, [userId, keepCount]);
    } finally {
      client.release();
    }
  }

  async disconnect(): Promise<void> {
    await this.pool.end();
  }
}