import { Pool } from 'pg';
import { logger } from '../logging/Logger';

export class DatabaseConnection {
  private static pool: Pool;

  static async initialize(): Promise<void> {
    const databaseUrl = process.env['DATABASE_URL'] || 'postgresql://weather_user:weather_password@localhost:5432/weather_db';
    
    this.pool = new Pool({
      connectionString: databaseUrl,
      max: 20,
      idleTimeoutMillis: 30000,
      connectionTimeoutMillis: 2000,
    });

    // Test connection
    try {
      const client = await this.pool.connect();
      await client.query('SELECT NOW()');
      client.release();
      logger.info('Database connection established');
    } catch (error) {
      logger.error('Failed to connect to database:', error);
      throw error;
    }
  }

  static getPool(): Pool {
    if (!this.pool) {
      throw new Error('Database not initialized. Call initialize() first.');
    }
    return this.pool;
  }

  static async close(): Promise<void> {
    if (this.pool) {
      await this.pool.end();
      logger.info('Database connection closed');
    }
  }
}
