import mongoose, { Connection } from 'mongoose';
import { logger } from '../logging/Logger';

export class MongoConnection {
  private static instance: MongoConnection;
  private connection: Connection | null = null;

  private constructor() {}

  static getInstance(): MongoConnection {
    if (!MongoConnection.instance) {
      MongoConnection.instance = new MongoConnection();
    }
    return MongoConnection.instance;
  }

  async connect(): Promise<void> {
    try {
      const mongoUrl = process.env['MONGODB_URL'] || 'mongodb://localhost:27017/weather_db';

      const conn = await mongoose.connect(mongoUrl, {
        autoIndex: true,
      } as any);

      this.connection = conn.connection;
      logger.info('MongoDB (Mongoose) connected successfully');
    } catch (error) {
      logger.error('Failed to connect to MongoDB:', error);
      throw error;
    }
  }

  getDatabase(): any {
    // For compatibility where a Db is expected; return underlying native db
    if (!this.connection || !this.connection.db) {
      throw new Error('MongoDB not connected. Call connect() first.');
    }
    return this.connection.db as any;
  }

  async disconnect(): Promise<void> {
    if (this.connection) {
      await this.connection.close();
      this.connection = null;
      logger.info('MongoDB connection closed');
    }
  }

  isConnected(): boolean {
    return !!this.connection && this.connection.readyState === 1;
  }
}
