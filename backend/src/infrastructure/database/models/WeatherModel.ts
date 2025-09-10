import { Schema, model, Document } from 'mongoose';

export interface IWeatherDocument extends Document {
  city: string;
  country?: string;
  latitude?: number;
  longitude?: number;
  temperature: number;
  description: string;
  humidity: number;
  windSpeed: number;
  pressure?: number;
  visibility?: number;
  uvIndex?: number;
  timestamp: Date;
  provider: string;
  userId?: string;
}

const WeatherSchema = new Schema<IWeatherDocument>({
  city: {
    type: String,
    required: true,
    index: true
  },
  country: {
    type: String,
    required: false,
    index: true
  },
  latitude: {
    type: Number,
    required: false
  },
  longitude: {
    type: Number,
    required: false
  },
  temperature: {
    type: Number,
    required: true
  },
  description: {
    type: String,
    required: true
  },
  humidity: {
    type: Number,
    required: true
  },
  windSpeed: {
    type: Number,
    required: true
  },
  pressure: {
    type: Number
  },
  visibility: {
    type: Number
  },
  uvIndex: {
    type: Number
  },
  timestamp: {
    type: Date,
    default: Date.now,
    index: true
  },
  provider: {
    type: String,
    required: true,
    index: true
  },
  userId: {
    type: String,
    index: true
  }
}, {
  timestamps: true
});

// Índices e TTL (desabilitar em ambiente de teste para evitar ruído)
if (process.env['NODE_ENV'] !== 'test') {
  WeatherSchema.index({ city: 1, country: 1, timestamp: -1 });
  WeatherSchema.index({ userId: 1, timestamp: -1 });
  WeatherSchema.index({ provider: 1, timestamp: -1 });
  // TTL para limpeza automática de dados antigos (30 dias)
  WeatherSchema.index({ timestamp: 1 }, { expireAfterSeconds: 2592000 });
}

export const WeatherModel = model<IWeatherDocument>('Weather', WeatherSchema);
