import { z } from 'zod';
import { v4 as uuidv4 } from 'uuid';

export const UserSchema = z.object({
  id: z.string(),
  email: z.string().email(),
  password: z.string().min(6),
  name: z.string().min(2),
  createdAt: z.date(),
  updatedAt: z.date(),
});

export type User = z.infer<typeof UserSchema>;

export class UserEntity {
  private constructor(
    public readonly id: string,
    public readonly email: string,
    public readonly password: string,
    public readonly name: string,
    public readonly createdAt: Date,
    public readonly updatedAt: Date
  ) {}

  static create(data: Omit<User, 'id' | 'createdAt' | 'updatedAt'>): UserEntity {
    const now = new Date();
    return new UserEntity(
      uuidv4(), // Generate UUID
      data.email,
      data.password,
      data.name,
      now,
      now
    );
  }

  static fromPersistence(data: any): UserEntity {
    return new UserEntity(
      data.id,
      data.email,
      data.password,
      data.name,
      data.created_at ? new Date(data.created_at) : new Date(),
      data.updated_at ? new Date(data.updated_at) : new Date()
    );
  }

  toJSON(): Omit<User, 'password'> {
    return {
      id: this.id,
      email: this.email,
      name: this.name,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt,
    };
  }
}
