import amqp from 'amqplib';
import { logger } from '../logging/Logger';

export class RabbitMQConnection {
  private static connection: amqp.Connection | null = null;
  private static channel: amqp.Channel | null = null;

  static async initialize(): Promise<void> {
    try {
      const url = process.env['RABBITMQ_URL'] || 'amqp://localhost:5672';
      this.connection = await amqp.connect(url) as any;
      
      if (this.connection) {
        this.channel = await (this.connection as any).createChannel();
        
        if (this.channel) {
          // Declare exchanges
          await this.channel.assertExchange('user.events', 'topic', { durable: true });
          await this.channel.assertExchange('weather.events', 'topic', { durable: true });
        }
      }
      
      logger.info('RabbitMQ connected successfully');
    } catch (error) {
      logger.error('Failed to connect to RabbitMQ:', error);
      throw error;
    }
  }

  static getChannel(): amqp.Channel {
    if (!this.channel) {
      throw new Error('RabbitMQ not initialized. Call initialize() first.');
    }
    return this.channel;
  }

  static async close(): Promise<void> {
    if (this.channel) {
      await this.channel.close();
    }
    if (this.connection) {
      await (this.connection as any).close();
    }
    logger.info('RabbitMQ connection closed');
  }
}
