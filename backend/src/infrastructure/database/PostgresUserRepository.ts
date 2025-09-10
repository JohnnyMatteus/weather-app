import { Pool } from 'pg';
import { IUserRepository } from '@/domain/interfaces/repositories/IUserRepository';
import { UserEntity } from '@/domain/entities/User';

export class PostgresUserRepository implements IUserRepository {
  private pool: Pool;

  constructor() {
    this.pool = new Pool({
      connectionString: process.env['DATABASE_URL'] || 'postgresql://weather_user:weather_pass@localhost:5432/weather_db',
    });
  }

  async create(user: UserEntity): Promise<UserEntity> {
    const client = await this.pool.connect();
    try {
      const query = `
        INSERT INTO users (id, email, password, name, created_at, updated_at)
        VALUES ($1, $2, $3, $4, $5, $6)
        RETURNING *
      `;
      
      const now = new Date().toISOString();
      const result = await client.query(query, [
        user.id, user.email, user.password, user.name, now, now
      ]);

      return UserEntity.fromPersistence(result.rows[0]);
    } finally {
      client.release();
    }
  }

  async findByEmail(email: string): Promise<UserEntity | null> {
    const client = await this.pool.connect();
    try {
      const query = 'SELECT * FROM users WHERE email = $1';
      const result = await client.query(query, [email]);

      if (result.rows.length === 0) return null;

      const row = result.rows[0];
      return UserEntity.fromPersistence({
        id: row.id,
        email: row.email,
        password: row.password,
        name: row.name,
        createdAt: new Date(row.created_at),
        updatedAt: new Date(row.updated_at)
      });
    } finally {
      client.release();
    }
  }

  async findById(id: string): Promise<UserEntity | null> {
    const client = await this.pool.connect();
    try {
      const query = 'SELECT * FROM users WHERE id = $1';
      const result = await client.query(query, [id]);

      if (result.rows.length === 0) return null;

      const row = result.rows[0];
      return UserEntity.fromPersistence({
        id: row.id,
        email: row.email,
        password: row.password,
        name: row.name,
        createdAt: new Date(row.created_at),
        updatedAt: new Date(row.updated_at)
      });
    } finally {
      client.release();
    }
  }

  async update(user: UserEntity): Promise<UserEntity> {
    const client = await this.pool.connect();
    try {
      const query = `
        UPDATE users 
        SET email = $1, password = $2, name = $3, updated_at = $4
        WHERE id = $5
      `;
      
      const now = new Date().toISOString();
      await client.query(query, [user.email, user.password, user.name, now, user.id]);

      return user;
    } finally {
      client.release();
    }
  }

  async delete(id: string): Promise<void> {
    const client = await this.pool.connect();
    try {
      const query = 'DELETE FROM users WHERE id = $1';
      await client.query(query, [id]);
    } finally {
      client.release();
    }
  }

  async disconnect(): Promise<void> {
    await this.pool.end();
  }
}