import { Card, CardContent } from '../../components/ui/card';
import { Calendar, MapPin } from 'lucide-react';

interface StatsCardsProps {
  total: number;
  confirmed: number;
}

export function StatsCards({ total, confirmed }: StatsCardsProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
      <Card className="shadow-sm border-gray-100">
        <CardContent className="p-6 flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-500">
              Total de Inscrições
            </p>
            <h3 className="text-2xl font-bold text-gray-900 mt-1">{total}</h3>
          </div>
          <div className="p-3 bg-blue-50 rounded-full text-blue-600">
            <Calendar className="h-6 w-6" />
          </div>
        </CardContent>
      </Card>

      <Card className="shadow-sm border-gray-100">
        <CardContent className="p-6 flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-500">
              Eventos Confirmados
            </p>
            <h3 className="text-2xl font-bold text-green-600 mt-1">
              {confirmed}
            </h3>
          </div>
          <div className="p-3 bg-green-50 rounded-full text-green-600">
            <MapPin className="h-6 w-6" />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
