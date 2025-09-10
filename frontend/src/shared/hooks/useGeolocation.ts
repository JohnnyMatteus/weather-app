import { useCallback, useEffect, useRef, useState } from 'react';

type GeolocationStatus = 'idle' | 'prompt' | 'granted' | 'denied' | 'unsupported' | 'locating' | 'error';

export interface Coordinates {
  latitude: number;
  longitude: number;
  accuracy?: number;
}

export interface UseGeolocationResult {
  status: GeolocationStatus;
  coords: Coordinates | null;
  error: string | null;
  getCurrentPosition: (opts?: { timeoutMs?: number; maximumAgeMs?: number; enableHighAccuracy?: boolean }) => Promise<Coordinates>;
}

export function useGeolocation(): UseGeolocationResult {
  const [status, setStatus] = useState<GeolocationStatus>('idle');
  const [coords, setCoords] = useState<Coordinates | null>(null);
  const [error, setError] = useState<string | null>(null);
  const isMounted = useRef(true);

  useEffect(() => {
    return () => {
      isMounted.current = false;
    };
  }, []);

  const getCurrentPosition = useCallback(
    async (opts?: { timeoutMs?: number; maximumAgeMs?: number; enableHighAccuracy?: boolean }): Promise<Coordinates> => {
      if (!('geolocation' in navigator)) {
        setStatus('unsupported');
        const err = 'Geolocalização não suportada neste navegador.';
        setError(err);
        throw new Error(err);
      }

      setStatus('locating');
      setError(null);

      const { timeoutMs = 10000, maximumAgeMs = 0, enableHighAccuracy = true } = opts || {};

      const position = await new Promise<GeolocationPosition>((resolve, reject) => {
        const timeoutId = window.setTimeout(() => {
          reject(new Error('Tempo esgotado ao obter localização'));
        }, timeoutMs);

        navigator.geolocation.getCurrentPosition(
          (pos) => {
            window.clearTimeout(timeoutId);
            resolve(pos);
          },
          (err) => {
            window.clearTimeout(timeoutId);
            reject(err);
          },
          { enableHighAccuracy, maximumAge: maximumAgeMs, timeout: timeoutMs }
        );
      });

      const result: Coordinates = {
        latitude: position.coords.latitude,
        longitude: position.coords.longitude,
        accuracy: position.coords.accuracy,
      };

      if (isMounted.current) {
        setCoords(result);
        setStatus('granted');
      }

      return result;
    },
    []
  );

  return { status, coords, error, getCurrentPosition };
}


