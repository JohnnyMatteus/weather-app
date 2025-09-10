import { describe, it, expect, beforeAll } from 'vitest';
import axios from 'axios';

const BASE = 'http://localhost:3001';

describe('Weather + History integration', () => {
  let accessToken = '';

  beforeAll(async () => {
    process.env['NODE_ENV'] = 'test';
    // register (ignore if exists)
    try {
      await axios.post(`${BASE}/api/auth/register`, {
        name: 'Test User',
        email: 'itest@example.com',
        password: 'password123',
      });
    } catch {}
    const login = await axios.post(`${BASE}/api/auth/login`, {
      email: 'itest@example.com',
      password: 'password123',
    });
    accessToken = login.data.data.accessToken;
  });

  it('should fetch weather and save to Mongo, then return history (max 5)', async () => {
    const headers = { Authorization: `Bearer ${accessToken}` };

    const weatherResp = await axios.get(`${BASE}/api/weather`, {
      params: { city: 'Belo Horizonte' },
      headers,
    });
    expect(weatherResp.status).toBe(200);
    expect(weatherResp.data.success).toBe(true);
    expect(weatherResp.data.data.weather.city).toBeTruthy();

    // Call a few times to populate history
    for (let i = 0; i < 3; i++) {
      await axios.get(`${BASE}/api/weather`, { params: { city: 'São Paulo' }, headers });
    }

    const histResp = await axios.get(`${BASE}/api/weather/history`, {
      params: { limit: 5 },
      headers,
    });
    expect(histResp.status).toBe(200);
    expect(histResp.data.success).toBe(true);
    const items = histResp.data.data?.history ?? histResp.data.data;
    expect(Array.isArray(items)).toBe(true);
    expect(items.length).toBeLessThanOrEqual(5);
  }, 30000);
});


