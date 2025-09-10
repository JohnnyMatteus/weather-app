import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useSearchWeather, useSearchWeatherByCoordinates, useForecast, useForecastByCoordinates } from '../hooks/useWeather';
import { Button } from '@/shared/components/ui/button';
import { Input } from '@/shared/components/ui/input';
import { Label } from '@/shared/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/shared/components/ui/card';
import { Badge } from '@/shared/components/ui/badge';
import { Separator } from '@/shared/components/ui/separator';
import { Loader2, MapPin, Thermometer, Droplets, Wind, Eye, Gauge } from 'lucide-react';
import { WeatherCard } from '../components/WeatherCard';
import { ForecastList } from '../components/ForecastList';
import { useGeolocation } from '@/shared/hooks/useGeolocation';

const searchSchema = z.object({
  city: z.string().min(1, 'Cidade é obrigatória'),
  country: z.string().optional(),
});

type SearchForm = z.infer<typeof searchSchema>;

export function WeatherPage() {
  const [currentWeather, setCurrentWeather] = useState<any>(null);
  const searchWeatherMutation = useSearchWeather();
  const searchByCoordsMutation = useSearchWeatherByCoordinates();
  const { status: geoStatus, coords, getCurrentPosition } = useGeolocation();
  const [lastQuery, setLastQuery] = useState<{ city?: string; country?: string; lat?: number; lon?: number } | null>(null);
  const forecastCity = lastQuery?.city;
  const forecastCountry = lastQuery?.country;
  const forecastLat = lastQuery?.lat;
  const forecastLon = lastQuery?.lon;
  const forecastByCity = useForecast(forecastCity, forecastCountry, !!forecastCity);
  const forecastByCoords = useForecastByCoordinates(forecastLat, forecastLon, forecastLat !== undefined && forecastLon !== undefined);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<SearchForm>({
    resolver: zodResolver(searchSchema),
  });

  const onSubmit = (data: SearchForm) => {
    searchWeatherMutation.mutate(
      { city: data.city, country: data.country },
      {
        onSuccess: (response) => {
          if (response.success) {
            setCurrentWeather(response.data.weather);
            setLastQuery({ city: response.data.weather.city, country: response.data.weather.country });
            reset();
          }
        },
      }
    );
  };

  const onUseMyLocation = async () => {
    try {
      const position = await getCurrentPosition();
      searchByCoordsMutation.mutate(
        { latitude: position.latitude, longitude: position.longitude },
        {
          onSuccess: (response) => {
            if (response.success) {
              setCurrentWeather(response.data.weather);
              setLastQuery({ lat: position.latitude, lon: position.longitude });
            }
          },
        }
      );
    } catch {
      // ignored: toast handled by mutation hook if needed
    }
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="text-center space-y-2">
        <h1 className="text-3xl font-bold">Previsão do Tempo</h1>
        <p className="text-muted-foreground">
          Obtenha informações meteorológicas atuais para qualquer cidade
        </p>
      </div>

      <Card className="max-w-2xl mx-auto">
        <CardHeader>
          <CardTitle>Buscar Clima</CardTitle>
          <CardDescription>
            Digite o nome de uma cidade para obter informações meteorológicas atuais
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="city">Cidade *</Label>
                <Input
                  id="city"
                  placeholder="Digite o nome da cidade"
                  {...register('city')}
                  disabled={searchWeatherMutation.isPending || searchByCoordsMutation.isPending}
                />
                {errors.city && (
                  <p className="text-sm text-destructive">{errors.city.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="country">País (opcional)</Label>
                <Input
                  id="country"
                  placeholder="Digite o código do país"
                  {...register('country')}
                  disabled={searchWeatherMutation.isPending || searchByCoordsMutation.isPending}
                />
                {errors.country && (
                  <p className="text-sm text-destructive">{errors.country.message}</p>
                )}
              </div>
            </div>

            <div className="flex gap-3">
              <Button
                type="submit"
                className="flex-1"
                disabled={searchWeatherMutation.isPending || searchByCoordsMutation.isPending}
              >
                {(searchWeatherMutation.isPending || searchByCoordsMutation.isPending) && (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                )}
                Buscar Clima
              </Button>
              <Button
                type="button"
                variant="secondary"
                onClick={onUseMyLocation}
                disabled={searchWeatherMutation.isPending || searchByCoordsMutation.isPending}
              >
                <MapPin className="mr-2 h-4 w-4" /> Usar minha localização
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      {currentWeather && (
        <WeatherCard weather={currentWeather} />
      )}

      {/* Forecast */}
      {forecastCity && forecastByCity.data?.data?.daily && (
        <ForecastList
          title="Previsão (Próximos dias)"
          days={(forecastByCity.data.data.daily.time || []).map((date: string, i: number) => ({
            date,
            min: forecastByCity.data?.data?.daily?.temperature_2m_min?.[i],
            max: forecastByCity.data?.data?.daily?.temperature_2m_max?.[i],
            code: forecastByCity.data?.data?.daily?.weathercode?.[i],
          }))}
        />
      )}

      {forecastLat !== undefined && forecastLon !== undefined && forecastByCoords.data?.data?.daily && (
        <ForecastList
          title="Previsão (Próximos dias)"
          days={(forecastByCoords.data.data.daily.time || []).map((date: string, i: number) => ({
            date,
            min: forecastByCoords.data?.data?.daily?.temperature_2m_min?.[i],
            max: forecastByCoords.data?.data?.daily?.temperature_2m_max?.[i],
            code: forecastByCoords.data?.data?.daily?.weathercode?.[i],
          }))}
        />
      )}

      {(searchWeatherMutation.isError || searchByCoordsMutation.isError) && (
        <Card className="max-w-2xl mx-auto">
          <CardContent className="pt-6">
            <div className="text-center text-destructive">
              Falha ao buscar dados meteorológicos. Tente novamente.
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
