import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { weatherService } from '../services/weatherApi';
import { toast } from '@/shared/hooks/use-toast';

export function useWeather(city: string, country?: string, enabled: boolean = true) {
  return useQuery({
    queryKey: ['weather', city, country],
    queryFn: () => weatherService.getWeather(city, country),
    enabled: enabled && !!city,
    staleTime: 5 * 60 * 1000, // 5 minutes
    retry: 1,
  });
}

export function useSearchWeather() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ city, country }: { city: string; country?: string }) =>
      weatherService.getWeather(city, country),
    onSuccess: (data) => {
      if (data.success) {
        // Invalidate and refetch any searchHistory queries (any limit)
        queryClient.invalidateQueries({
          predicate: (q) => Array.isArray(q.queryKey) && q.queryKey[0] === 'searchHistory',
        });
        
        toast({
          title: 'Weather updated',
          description: `Weather for ${data.data.weather.city} has been updated.`,
        });
      }
    },
    onError: (error: any, variables) => {
      // Queue request for Background Sync
      try {
        const params = new URLSearchParams({ city: variables.city });
        if (variables.country) params.append('country', variables.country);
        const url = `/api/weather?${params}`;
        if (navigator.serviceWorker?.controller) {
          navigator.serviceWorker.controller.postMessage({ type: 'QUEUE_SEARCH', payload: { url } });
        }
      } catch {}

      toast({
        title: 'Error',
        description: error.response?.data?.error || 'Failed to fetch weather data',
        variant: 'destructive',
      });
    },
  });
}

export function useSearchHistory(limit: number = 5) {
  return useQuery({
    queryKey: ['searchHistory', limit],
    queryFn: () => weatherService.getSearchHistory(limit),
    staleTime: 2 * 60 * 1000, // 2 minutes
  });
}

export function useSearchWeatherByCoordinates() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ latitude, longitude }: { latitude: number; longitude: number }) =>
      weatherService.getWeatherByCoordinates(latitude, longitude),
    onSuccess: (data) => {
      if (data.success) {
        queryClient.invalidateQueries({
          predicate: (q) => Array.isArray(q.queryKey) && q.queryKey[0] === 'searchHistory',
        });
        toast({
          title: 'Weather updated',
          description: `Weather for ${data.data.weather.city} has been updated.`,
        });
      }
    },
    onError: (error: any) => {
      toast({
        title: 'Error',
        description: error.response?.data?.error || 'Failed to fetch weather data',
        variant: 'destructive',
      });
    },
  });
}

export function useForecast(city?: string, country?: string, enabled: boolean = true) {
  return useQuery({
    queryKey: ['forecast', city, country],
    queryFn: () => weatherService.getForecast(city as string, country),
    enabled: enabled && !!city,
    staleTime: 10 * 60 * 1000,
    retry: 1,
  });
}

export function useForecastByCoordinates(latitude?: number, longitude?: number, enabled: boolean = true) {
  return useQuery({
    queryKey: ['forecast', latitude, longitude],
    queryFn: () => weatherService.getForecastByCoordinates(latitude as number, longitude as number),
    enabled: enabled && latitude !== undefined && longitude !== undefined,
    staleTime: 10 * 60 * 1000,
    retry: 1,
  });
}
