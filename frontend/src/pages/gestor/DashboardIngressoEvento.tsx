import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { isAuthenticated, isGestor, isAdmin } from '../../auth-utils';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '../../components/ui/table';
import { Badge } from '../../components/ui/badge';
import {
  ArrowLeft,
  DollarSign,
  Ticket,
  Users,
  CheckCircle,
  XCircle,
  TrendingUp,
} from 'lucide-react';
import {
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Area,
  AreaChart,
} from 'recharts';
import { API_URL } from '@/config/api';

interface TicketLot {
  id: string;
  name: string;
  price: number;
  quantity: number;
  sold: number;
  remaining: number;
  active: boolean;
}

interface EventStatistics {
  eventId: string;
  eventName: string;
  eventDate: string;
  eventType: string;
  totalTicketsAvailable: number;
  totalTicketsSold: number;
  ticketsRemaining: number;
  ticketsValidated: number;
  totalRevenue: number;
  totalOrders: number;
  ticketLots: TicketLot[];
}

interface DailySales {
  date: string;
  tickets: number;
  revenue: number;
  accumulated: number;
}

export default function DashboardIngressoEvento() {
  const [statistics, setStatistics] = useState<EventStatistics | null>(null);
  const [dailySales, setDailySales] = useState<DailySales[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();

  useEffect(() => {
    if (!isAuthenticated()) {
      navigate('/login');
      return;
    }

    // Verificar se é gestor ou admin
    if (!isGestor() && !isAdmin()) {
      navigate('/');
      return;
    }

    fetchStatistics();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id, navigate]);

  const fetchStatistics = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_URL}/events/${id}/statistics`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        if (response.status === 403) {
          throw new Error('Você não tem permissão para visualizar este evento');
        }
        if (response.status === 404) {
          throw new Error('Evento não encontrado');
        }
        throw new Error('Erro ao carregar estatísticas');
      }

      const data = await response.json();
      setStatistics(data);

      // Buscar dados de vendas diárias
      await fetchDailySales();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Erro ao carregar dados');
    } finally {
      setLoading(false);
    }
  };

  const fetchDailySales = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_URL}/events/${id}/daily-sales`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setDailySales(data.dailySales || []);
      }
    } catch (err) {
      console.error('Erro ao carregar vendas diárias:', err);
      // Não definir erro aqui, apenas log, pois é um recurso adicional
    }
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(value);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <p className="text-lg">Carregando...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Card className="max-w-md">
          <CardContent className="pt-6">
            <p className="text-red-600 mb-4">{error}</p>
            <Button onClick={() => navigate('/gestor/eventos')}>
              <ArrowLeft className="mr-2 h-4 w-4" />
              Voltar para Eventos
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!statistics) {
    return null;
  }

  const percentageSold =
    statistics.totalTicketsAvailable > 0
      ? (statistics.totalTicketsSold / statistics.totalTicketsAvailable) * 100
      : 0;

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-6 flex items-center justify-between">
          <div>
            <Button
              variant="outline"
              onClick={() => navigate('/gestor/eventos')}
              className="mb-4"
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Voltar
            </Button>
            <h1 className="text-3xl font-bold text-gray-900">
              {statistics.eventName}
            </h1>
            <p className="text-gray-600 mt-2">
              {formatDate(statistics.eventDate)} • {statistics.eventType}
            </p>
          </div>
        </div>

        {/* Cards de Resumo */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Receita Total
              </CardTitle>
              <DollarSign className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">
                {formatCurrency(statistics.totalRevenue)}
              </div>
              <p className="text-xs text-gray-600 mt-1">
                {statistics.totalOrders} pedidos confirmados
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Ingressos Vendidos
              </CardTitle>
              <Ticket className="h-4 w-4 text-blue-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-600">
                {statistics.totalTicketsSold}
              </div>
              <p className="text-xs text-gray-600 mt-1">
                de {statistics.totalTicketsAvailable} disponíveis (
                {percentageSold.toFixed(1)}%)
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Ingressos Restantes
              </CardTitle>
              <Users className="h-4 w-4 text-orange-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-orange-600">
                {statistics.ticketsRemaining}
              </div>
              <p className="text-xs text-gray-600 mt-1">
                {statistics.ticketsRemaining > 0
                  ? 'Ainda disponível'
                  : 'Esgotado'}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Ingressos Validados
              </CardTitle>
              <CheckCircle className="h-4 w-4 text-purple-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-purple-600">
                {statistics.ticketsValidated}
              </div>
              <p className="text-xs text-gray-600 mt-1">
                {statistics.totalOrders > 0
                  ? `${((statistics.ticketsValidated / statistics.totalOrders) * 100).toFixed(1)}% dos pedidos`
                  : 'Nenhum pedido'}
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Gráfico de Vendas por Dia */}
        {dailySales.length > 0 && (
          <Card className="mb-8">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-blue-600" />
                Evolução de Vendas por Dia
              </CardTitle>
            </CardHeader>
            <CardContent className='p-1 md:p-6'>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart
                    data={dailySales}
                    margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
                  >
                    <defs>
                      <linearGradient
                        id="colorTickets"
                        x1="0"
                        y1="0"
                        x2="0"
                        y2="1"
                      >
                        <stop
                          offset="5%"
                          stopColor="#3b82f6"
                          stopOpacity={0.8}
                        />
                        <stop
                          offset="95%"
                          stopColor="#3b82f6"
                          stopOpacity={0}
                        />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis
                      dataKey="date"
                      tickFormatter={(value) => {
                        const date = new Date(value);
                        return `${date.getDate()}/${date.getMonth() + 1}`;
                      }}
                    />
                    <YAxis
                      label={{
                        value: 'Ingressos',
                        angle: -90,
                        position: 'insideLeft',
                      }}
                    />
                    <Tooltip
                      content={({ active, payload }) => {
                        if (active && payload && payload.length) {
                          const data = payload[0].payload;
                          return (
                            <div className="bg-white p-4 border border-gray-200 rounded-lg shadow-lg">
                              <p className="font-semibold mb-2">
                                {new Date(data.date).toLocaleDateString(
                                  'pt-BR',
                                  {
                                    day: '2-digit',
                                    month: 'long',
                                    year: 'numeric',
                                  }
                                )}
                              </p>
                              <p className="text-sm text-blue-600">
                                Vendidos: {data.tickets} ingressos
                              </p>
                              <p className="text-sm text-green-600">
                                Receita: {formatCurrency(data.revenue)}
                              </p>
                              <p className="text-sm text-gray-600 border-t mt-2 pt-2">
                                Acumulado: {data.accumulated} ingressos
                              </p>
                            </div>
                          );
                        }
                        return null;
                      }}
                    />
                    <Area
                      type="monotone"
                      dataKey="tickets"
                      stroke="#3b82f6"
                      strokeWidth={2}
                      fillOpacity={1}
                      fill="url(#colorTickets)"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
              <div className="mt-4 text-sm text-gray-600 text-center">
                Gráfico mostrando a quantidade de ingressos vendidos por dia
              </div>
            </CardContent>
          </Card>
        )}

        {/* Tabela de Lotes */}
        <Card>
          <CardHeader>
            <CardTitle>Detalhamento por Lote</CardTitle>
          </CardHeader>
          <CardContent>
            {statistics.ticketLots.length === 0 ? (
              <p className="text-center text-gray-500 py-8">
                Nenhum lote de ingresso cadastrado para este evento.
              </p>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Nome do Lote</TableHead>
                    <TableHead>Preço</TableHead>
                    <TableHead className="text-center">Total</TableHead>
                    <TableHead className="text-center">Vendidos</TableHead>
                    <TableHead className="text-center">Restantes</TableHead>
                    <TableHead className="text-center">% Vendido</TableHead>
                    <TableHead className="text-center">Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {statistics.ticketLots.map((lot) => {
                    const percentSold =
                      lot.quantity > 0 ? (lot.sold / lot.quantity) * 100 : 0;

                    return (
                      <TableRow key={lot.id}>
                        <TableCell className="font-medium">
                          {lot.name}
                        </TableCell>
                        <TableCell>{formatCurrency(lot.price)}</TableCell>
                        <TableCell className="text-center">
                          {lot.quantity}
                        </TableCell>
                        <TableCell className="text-center font-semibold text-blue-600">
                          {lot.sold}
                        </TableCell>
                        <TableCell className="text-center">
                          {lot.remaining}
                        </TableCell>
                        <TableCell className="text-center">
                          <span
                            className={
                              percentSold >= 80
                                ? 'text-green-600 font-semibold'
                                : percentSold >= 50
                                  ? 'text-orange-600'
                                  : 'text-gray-600'
                            }
                          >
                            {percentSold.toFixed(1)}%
                          </span>
                        </TableCell>
                        <TableCell className="text-center">
                          {lot.active ? (
                            <Badge variant="default" className="bg-green-500">
                              <CheckCircle className="mr-1 h-3 w-3" />
                              Ativo
                            </Badge>
                          ) : (
                            <Badge variant="secondary">
                              <XCircle className="mr-1 h-3 w-3" />
                              Inativo
                            </Badge>
                          )}
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
