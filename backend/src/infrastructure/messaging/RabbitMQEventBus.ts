import amqp from 'amqplib';
import { IEventBus, DomainEvent } from '../../domain/interfaces/services/IEventBus';

export class RabbitMQEventBus implements IEventBus {
  private connection: any = null;
  private channel: any = null;
  private readonly exchangeName = 'weather-app-events';
  private readonly handlers = new Map<string, Array<(event: DomainEvent) => Promise<void>>>();

  constructor(private readonly connectionUrl: string) {}

  async connect(): Promise<void> {
    try {
      this.connection = await amqp.connect(this.connectionUrl);
      this.channel = await this.connection.createChannel();
      
      await this.channel.assertExchange(this.exchangeName, 'topic', { durable: true });
      
      console.log('Connected to RabbitMQ');
    } catch (error) {
      console.error('Failed to connect to RabbitMQ:', error);
      throw error;
    }
  }

  async disconnect(): Promise<void> {
    if (this.channel) {
      await this.channel.close();
    }
    if (this.connection) {
      await this.connection.close();
    }
  }

  async publish(event: DomainEvent): Promise<void> {
    if (!this.channel) {
      throw new Error('EventBus not connected');
    }

    try {
      const routingKey = `${event.aggregateId}.${event.eventType}`;
      const message = Buffer.from(JSON.stringify(event));
      
      await this.channel.publish(this.exchangeName, routingKey, message, {
        persistent: true,
        timestamp: event.timestamp.getTime(),
      });

      console.log(`Published event: ${event.eventType} for aggregate: ${event.aggregateId}`);
    } catch (error) {
      console.error('Failed to publish event:', error);
      throw error;
    }
  }

  subscribe(eventType: string, handler: (event: DomainEvent) => Promise<void>): void {
    if (!this.handlers.has(eventType)) {
      this.handlers.set(eventType, []);
    }
    this.handlers.get(eventType)!.push(handler);
  }

  async startConsuming(): Promise<void> {
    if (!this.channel) {
      throw new Error('EventBus not connected');
    }

    const queueName = 'weather-app-event-handlers';
    await this.channel.assertQueue(queueName, { durable: true });
    await this.channel.bindQueue(queueName, this.exchangeName, '*.*');

    await this.channel.consume(queueName, async (msg: any) => {
      if (!msg) return;

      try {
        const event: DomainEvent = JSON.parse(msg.content.toString());
        
        const handlers = this.handlers.get(event.eventType) || [];
        for (const handler of handlers) {
          await handler(event);
        }

        this.channel!.ack(msg);
      } catch (error) {
        console.error('Error processing event:', error);
        this.channel!.nack(msg, false, false);
      }
    });
  }
}
