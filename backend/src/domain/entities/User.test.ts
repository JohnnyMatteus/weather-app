import { describe, it, expect } from 'vitest';
import { UserEntity } from './User';

describe('UserEntity', () => {
  it('should create a user entity', () => {
    const userData = {
      email: 'test@example.com',
      password: 'hashedpassword',
      name: 'Test User',
    };

    const user = UserEntity.create(userData);

    expect(user.email).toBe(userData.email);
    expect(user.password).toBe(userData.password);
    expect(user.name).toBe(userData.name);
    expect(user.createdAt).toBeInstanceOf(Date);
    expect(user.updatedAt).toBeInstanceOf(Date);
  });

  it('should create user from persistence data', () => {
    const createdDate = new Date('2023-01-01T00:00:00.000Z');
    const updatedDate = new Date('2023-01-02T00:00:00.000Z');
    
    const persistenceData = {
      id: 'user-123',
      email: 'test@example.com',
      password: 'hashedpassword',
      name: 'Test User',
      created_at: createdDate.toISOString(),
      updated_at: updatedDate.toISOString(),
    };

    const user = UserEntity.fromPersistence(persistenceData);

    expect(user.id).toBe(persistenceData.id);
    expect(user.email).toBe(persistenceData.email);
    expect(user.password).toBe(persistenceData.password);
    expect(user.name).toBe(persistenceData.name);
    expect(user.createdAt).toEqual(createdDate);
    expect(user.updatedAt).toEqual(updatedDate);
  });

  it('should convert to JSON without password', () => {
    const createdDate = new Date('2023-01-01T00:00:00.000Z');
    const updatedDate = new Date('2023-01-02T00:00:00.000Z');
    
    const userData = {
      id: 'user-123',
      email: 'test@example.com',
      password: 'hashedpassword',
      name: 'Test User',
      created_at: createdDate.toISOString(),
      updated_at: updatedDate.toISOString(),
    };

    const user = UserEntity.fromPersistence(userData);
    const json = user.toJSON();

    expect(json.id).toBe(userData.id);
    expect(json.email).toBe(userData.email);
    expect(json.name).toBe(userData.name);
    expect(json.createdAt).toEqual(createdDate);
    expect(json.updatedAt).toEqual(updatedDate);
    expect(json).not.toHaveProperty('password');
  });
});
