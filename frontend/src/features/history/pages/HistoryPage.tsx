import { useSearchHistory } from '@/features/weather/hooks/useWeather';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/shared/components/ui/card';
import { Badge } from '@/shared/components/ui/badge';
import { Separator } from '@/shared/components/ui/separator';
import { 
  History, 
  MapPin, 
  Thermometer, 
  Clock,
  Cloud,
  Loader2
} from 'lucide-react';

export function HistoryPage() {
  const { data, isLoading, error } = useSearchHistory(5);

  const formatTime = (timestamp: string | undefined) => {
    if (!timestamp) return 'Data não disponível';
    return new Date(timestamp).toLocaleString();
  };

  const getWeatherIcon = (description: string | undefined) => {
    if (!description) return '🌤️';
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

  if (isLoading) {
    return (
      <div className="container mx-auto p-6">
        <div className="flex items-center justify-center h-64">
          <Loader2 className="h-8 w-8 animate-spin" />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto p-6">
        <Card className="max-w-2xl mx-auto">
          <CardContent className="pt-6">
            <div className="text-center text-destructive">
              Falha ao carregar histórico de buscas. Tente novamente.
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Normalize backend response: supports { data: { history: [] } } or { data: [] } or []
  const history = (data as any)?.data?.history ?? (data as any)?.data ?? (data as any) ?? [];

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="text-center space-y-2">
        <h1 className="text-3xl font-bold flex items-center justify-center space-x-2">
          <History className="h-8 w-8" />
          <span>Histórico de Buscas</span>
        </h1>
        <p className="text-muted-foreground">
          Suas buscas meteorológicas recentes
        </p>
      </div>

      {history.length === 0 ? (
        <Card className="max-w-2xl mx-auto">
          <CardContent className="pt-6">
            <div className="text-center space-y-2">
              <Cloud className="h-12 w-12 mx-auto text-muted-foreground" />
              <div className="text-lg font-semibold">Nenhum histórico de busca ainda</div>
              <div className="text-muted-foreground">
                Comece a buscar informações meteorológicas para ver seu histórico aqui
              </div>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {history.map((item, index) => (
            <Card key={item.id} className="max-w-2xl mx-auto">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <MapPin className="h-5 w-5 text-muted-foreground" />
                    <CardTitle className="text-lg">
                      {item.city || 'Cidade não disponível'}
                      {item.country && (
                        <span className="text-muted-foreground ml-1">
                          , {item.country}
                        </span>
                      )}
                    </CardTitle>
                  </div>
                  <Badge variant="outline" className="flex items-center space-x-1">
                    <Clock className="h-3 w-3" />
                    <span className="text-xs">{formatTime(item.searchedAt)}</span>
                  </Badge>
                </div>
              </CardHeader>
              
              <CardContent>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div className="text-3xl">{getWeatherIcon(item.description)}</div>
                    <div>
                      <div className="text-2xl font-bold flex items-center space-x-1">
                        <Thermometer className="h-5 w-5" />
                        <span>{item.temperature || 'N/A'}°C</span>
                      </div>
                      <div className="text-muted-foreground capitalize">
                        {item.description || 'Descrição não disponível'}
                      </div>
                    </div>
                  </div>
                  
                  <div className="text-right">
                    <div className="text-sm text-muted-foreground">Busca #{history.length - index}</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
