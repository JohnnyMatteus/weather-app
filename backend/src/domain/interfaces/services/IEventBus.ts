export interface DomainEvent {
  eventType: string;
  aggregateId: string;
  payload: any;
  timestamp: Date;
}

export interface IEventBus {
  publish(event: DomainEvent): Promise<void>;
  subscribe(eventType: string, handler: (event: DomainEvent) => Promise<void>): void;
}
