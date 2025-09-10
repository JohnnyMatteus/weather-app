import { Pool } from 'pg';

const pool = new Pool({
  connectionString: process.env['DATABASE_URL'] || 'postgresql://weather_user:weather_pass@localhost:5432/weather_db',
});

async function migrate() {
  const client = await pool.connect();
  
  try {
    // Create tables
    await client.query(`
      CREATE TABLE IF NOT EXISTS users (
        id VARCHAR(255) PRIMARY KEY,
        email VARCHAR(255) UNIQUE NOT NULL,
        password VARCHAR(255) NOT NULL,
        name VARCHAR(255) NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS search_history (
        id VARCHAR(255) PRIMARY KEY,
        user_id VARCHAR(255) NOT NULL,
        city VARCHAR(255) NOT NULL,
        country VARCHAR(255),
        latitude DECIMAL(10, 8),
        longitude DECIMAL(11, 8),
        temperature DECIMAL(5, 2),
        description VARCHAR(255),
        humidity INTEGER,
        wind_speed DECIMAL(5, 2),
        searched_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users (id)
      );

      CREATE INDEX IF NOT EXISTS idx_search_history_user_id ON search_history(user_id);
      CREATE INDEX IF NOT EXISTS idx_search_history_searched_at ON search_history(searched_at);
    `);

    console.log('✅ Database migration completed successfully!');
  } finally {
    client.release();
    await pool.end();
  }
}

migrate().catch(console.error);
