import { Schema, model, Document } from 'mongoose';

export interface ISearchHistoryDocument extends Document {
  userId: string;
  city: string;
  country: string;
  latitude: number;
  longitude: number;
  temperature: number;
  description: string;
  humidity: number;
  windSpeed: number;
  searchedAt: Date;
}

const SearchHistorySchema = new Schema<ISearchHistoryDocument>({
  userId: {
    type: String,
    required: true,
    index: true
  },
  city: {
    type: String,
    required: true
  },
  country: {
    type: String,
    required: true
  },
  latitude: {
    type: Number,
    required: true
  },
  longitude: {
    type: Number,
    required: true
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
  searchedAt: {
    type: Date,
    default: Date.now,
    index: true
  }
}, {
  timestamps: true
});

// Índices compostos para otimizar consultas
SearchHistorySchema.index({ userId: 1, searchedAt: -1 });

// TTL para limpeza automática de dados antigos (90 dias)
SearchHistorySchema.index({ searchedAt: 1 }, { expireAfterSeconds: 7776000 });

export const SearchHistoryModel = model<ISearchHistoryDocument>('SearchHistory', SearchHistorySchema);
