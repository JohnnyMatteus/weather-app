import { Card, CardContent, CardHeader, CardTitle } from '@/shared/components/ui/card';

interface ForecastListProps {
  title?: string;
  days?: { date: string; min?: number; max?: number; code?: number }[];
}

export function ForecastList({ title = 'Previsão', days = [] }: ForecastListProps) {
  if (!days.length) return null;
  return (
    <Card className="max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle>{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {days.map((d, idx) => (
            <div key={idx} className="flex items-center justify-between border rounded-md p-3">
              <div>
                <div className="font-medium">{new Date(d.date).toLocaleDateString()}</div>
                <div className="text-sm text-muted-foreground">Min {d.min ?? '-'}°C · Max {d.max ?? '-'}°C</div>
              </div>
              <div className="text-sm">{d.code ?? ''}</div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}


