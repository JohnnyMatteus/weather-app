import { Badge } from '@/shared/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/components/ui/card';
import { Separator } from '@/shared/components/ui/separator';
import { 
  MapPin, 
  Thermometer, 
  Droplets, 
  Wind, 
  Eye, 
  Gauge,
  Clock,
  Cloud
} from 'lucide-react';

interface WeatherCardProps {
  weather: {
    city: string;
    country?: string;
    temperature: number;
    description: string;
    humidity: number;
    windSpeed: number;
    pressure?: number;
    visibility?: number;
    timestamp: string;
  };
}

export function WeatherCard({ weather }: WeatherCardProps) {
  const formatTime = (timestamp: string) => {
    return new Date(timestamp).toLocaleString();
  };

  const getWeatherIcon = (description: string) => {
    const desc = description.toLowerCase();
    if (desc.includes('sun') || desc.includes('clear')) return '☀️';
    if (desc.includes('cloud')) return '☁️';
    if (desc.includes('rain')) return '🌧️';
    if (desc.includes('snow')) return '❄️';
    if (desc.includes('storm')) return '⛈️';
    if (desc.includes('fog') || desc.includes('mist')) return '🌫️';
    if (desc.includes('céu limpo') || desc.includes('limpo')) return '☀️';
    if (desc.includes('nublado')) return '☁️';
    if (desc.includes('chuva') || desc.includes('garoa')) return '🌧️';
    if (desc.includes('neve') || desc.includes('granizo')) return '❄️';
    if (desc.includes('trovoada') || desc.includes('trovoadas')) return '⛈️';
    if (desc.includes('nevoeiro')) return '🌫️';
    return '🌤️';
  };

  return (
    <Card className="max-w-2xl mx-auto">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <MapPin className="h-5 w-5 text-muted-foreground" />
            <CardTitle className="text-xl">
              {weather.city}
              {weather.country && (
                <span className="text-muted-foreground ml-1">
                  , {weather.country}
                </span>
              )}
            </CardTitle>
          </div>
          <Badge variant="secondary" className="flex items-center space-x-1">
            <Clock className="h-3 w-3" />
            <span className="text-xs">{formatTime(weather.timestamp)}</span>
          </Badge>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-6">
        <div className="text-center space-y-2">
          <div className="text-6xl">{getWeatherIcon(weather.description)}</div>
          <div className="text-4xl font-bold">{weather.temperature}°C</div>
          <div className="text-lg text-muted-foreground capitalize">
            {weather.description}
          </div>
        </div>

        <Separator />

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="flex items-center space-x-2">
            <Droplets className="h-4 w-4 text-blue-500" />
            <div>
              <div className="text-sm text-muted-foreground">Umidade</div>
              <div className="font-semibold">{weather.humidity}%</div>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <Wind className="h-4 w-4 text-green-500" />
            <div>
              <div className="text-sm text-muted-foreground">Velocidade do Vento</div>
              <div className="font-semibold">{weather.windSpeed} m/s</div>
            </div>
          </div>

          {weather.pressure && (
            <div className="flex items-center space-x-2">
              <Gauge className="h-4 w-4 text-purple-500" />
              <div>
                <div className="text-sm text-muted-foreground">Pressão</div>
                <div className="font-semibold">{weather.pressure} hPa</div>
              </div>
            </div>
          )}

          {weather.visibility && (
            <div className="flex items-center space-x-2">
              <Eye className="h-4 w-4 text-orange-500" />
              <div>
                <div className="text-sm text-muted-foreground">Visibilidade</div>
                <div className="font-semibold">{weather.visibility / 1000} km</div>
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
