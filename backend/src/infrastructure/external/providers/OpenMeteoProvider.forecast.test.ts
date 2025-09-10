import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import axios from 'axios';
import { OpenMeteoProvider } from './OpenMeteoProvider';

vi.mock('axios');

describe('OpenMeteoProvider - Forecast', () => {
  const provider = new OpenMeteoProvider();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('should get forecast by city', async () => {
    // For São Paulo we use known coordinates (no geocoding call), so only mock forecast
    (axios.get as unknown as any).mockResolvedValueOnce({
      data: {
        hourly: {
          time: ['2025-09-10T00:00', '2025-09-10T01:00'],
          temperature_2m: [22, 21],
          relativehumidity_2m: [70, 72],
          windspeed_10m: [5, 6],
          pressure_msl: [1012, 1011],
          uv_index: [3, 0],
        },
        daily: {
          time: ['2025-09-10', '2025-09-11'],
          temperature_2m_max: [28, 29],
          temperature_2m_min: [18, 19],
          weathercode: [1, 2],
        },
      },
    });

    const result = await provider.getForecastByCity('São Paulo');
    expect(result.daily.time.length).toBe(2);
    expect(result.daily.temperature_2m_max?.[0]).toBe(28);
  });

  it('should get forecast by coordinates', async () => {
    (axios.get as unknown as any).mockResolvedValueOnce({
      data: {
        hourly: {
          time: ['2025-09-10T00:00', '2025-09-10T01:00'],
          temperature_2m: [22, 21],
          relativehumidity_2m: [70, 72],
          windspeed_10m: [5, 6],
          pressure_msl: [1012, 1011],
          uv_index: [3, 0],
        },
        daily: {
          time: ['2025-09-10'],
          temperature_2m_max: [30],
          temperature_2m_min: [20],
          weathercode: [3],
        },
      },
    });
    const result = await provider.getForecastByCoordinates(-23.55, -46.63);
    expect(result.daily.time[0]).toBe('2025-09-10');
  });
});


