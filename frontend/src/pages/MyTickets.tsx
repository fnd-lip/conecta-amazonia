import { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { API_URL } from '@/config/api';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Ticket, Calendar, ArrowLeft, CheckCircle2 } from 'lucide-react';

interface OrderItem {
  id: string;
  ticketLotId: string;
  quantity: number;
  price: number;
  ticketLot: {
    id: string;
    name: string;
    price: number;
  };
}

interface Order {
  id: string;
  eventId: string;
  status: string;
  createdAt: string;
  event: {
    id: string;
    nome: string;
    descricao: string;
    data: string;
    logoUrl?: string;
  };
  items: OrderItem[];
  validations?: Array<{
    id: string;
    validatedAt: string;
    validatedBy: string;
  }>;
}

function formatDate(isoDate: string) {
  const d = new Date(isoDate);
  if (Number.isNaN(d.getTime())) return isoDate;
  return (
    d.toLocaleDateString('pt-BR', { timeZone: 'UTC' }) +
    ' ' +
    d.toLocaleTimeString('pt-BR', {
      timeZone: 'UTC',
      hour: '2-digit',
      minute: '2-digit',
    })
  );
}

const getStatusBadge = (status: string) => {
  const statusMap: Record<
    string,
    {
      label: string;
      variant: 'default' | 'secondary' | 'destructive' | 'outline';
    }
  > = {
    confirmed: { label: 'Confirmado', variant: 'default' },
    pending: { label: 'Pendente', variant: 'secondary' },
    cancelled: { label: 'Cancelado', variant: 'destructive' },
  };

  const statusInfo = statusMap[status] || {
    label: status,
    variant: 'outline' as const,
  };

  return <Badge variant={statusInfo.variant}>{statusInfo.label}</Badge>;
};

export default function MyTickets() {
  const navigate = useNavigate();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    const token = localStorage.getItem('token');
    if (!token) {
      navigate('/login');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const response = await fetch(`${API_URL}/orders`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.status === 401) {
        localStorage.removeItem('token');
        navigate('/login');
        return;
      }

      if (!response.ok) {
        throw new Error('Erro ao carregar seus ingressos');
      }

      const data = await response.json();
      setOrders(data);
    } catch (err: unknown) {
      setError(
        err instanceof Error ? err.message : 'Erro ao carregar ingressos'
      );
    } finally {
      setLoading(false);
    }
  };

  const getTotalQuantity = (order: Order) => {
    return order.items.reduce((sum, item) => sum + item.quantity, 0);
  };

  const getTotalPrice = (order: Order) => {
    return order.items.reduce(
      (sum, item) => sum + item.price * item.quantity,
      0
    );
  };

  const isValidated = (order: Order) => {
    return order.validations && order.validations.length > 0;
  };

  const unusedOrders = orders.filter((order) => !isValidated(order));
  const usedOrders = orders.filter((order) => isValidated(order));

  const renderOrderCard = (order: Order) => (
    <Card key={order.id} className="overflow-hidden">
      <CardHeader className="bg-muted/50">
        <div className="flex justify-between items-start">
          <div className="flex-1">
            <CardTitle className="text-2xl mb-2">{order.event.nome}</CardTitle>
            <CardDescription className="flex flex-wrap items-center gap-3">
              <span className="flex items-center gap-1">
                <Calendar className="w-4 h-4" />
                {formatDate(order.event.data)}
              </span>
              <span className="text-xs text-muted-foreground">
                Pedido #{order.id.substring(0, 8)}
              </span>
            </CardDescription>
          </div>
          <div className="flex gap-2">
            {isValidated(order) && (
              <Badge className="bg-green-500 hover:bg-green-600">
                <CheckCircle2 className="w-3 h-3 mr-1" />
                Utilizado
              </Badge>
            )}
            {getStatusBadge(order.status)}
          </div>
        </div>
      </CardHeader>
      <CardContent className="pt-6">
        <div className="space-y-4">
          {/* Detalhes dos ingressos */}
          <div className="space-y-2">
            <h4 className="font-semibold text-sm text-muted-foreground">
              Ingressos
            </h4>
            {order.items.map((item) => (
              <div
                key={item.id}
                className="flex justify-between items-center p-3 bg-muted/30 rounded-lg"
              >
                <div>
                  <p className="font-medium">{item.ticketLot.name}</p>
                  <p className="text-sm text-muted-foreground">
                    Quantidade: {item.quantity}
                  </p>
                </div>
                <div className="text-right">
                  <p className="font-semibold">
                    R$ {(item.price * item.quantity).toFixed(2)}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    R$ {item.price.toFixed(2)} cada
                  </p>
                </div>
              </div>
            ))}
          </div>

          {/* Validação info */}
          {isValidated(order) && order.validations && order.validations[0] && (
            <div className="p-3 bg-green-50 dark:bg-green-950 border border-green-200 dark:border-green-800 rounded-lg">
              <p className="text-sm font-medium text-green-900 dark:text-green-100">
                Ingresso validado em{' '}
                {formatDate(order.validations[0].validatedAt)}
              </p>
            </div>
          )}

          {/* Resumo */}
          <div className="pt-4 border-t">
            <div className="flex justify-between items-center mb-4">
              <span className="font-semibold">Total de ingressos:</span>
              <span className="text-lg font-bold">
                {getTotalQuantity(order)}
              </span>
            </div>
            <div className="flex justify-between items-center mb-4">
              <span className="font-semibold">Valor total:</span>
              <span className="text-2xl font-bold text-primary">
                R$ {getTotalPrice(order).toFixed(2)}
              </span>
            </div>
            <div className="text-xs text-muted-foreground">
              Comprado em {formatDate(order.createdAt)}
            </div>
          </div>

          {/* Ações */}
          <div className="pt-4 space-y-2">
            <Button asChild className="w-full">
              <Link to={`/ingresso/${order.id}`}>
                <Ticket className="w-4 h-4 mr-2" />
                Ver Ingresso e QR Code
              </Link>
            </Button>
            <Button asChild className="w-full" variant="outline">
              <Link to={`/eventos/${order.eventId}`}>
                Ver Detalhes do Evento
              </Link>
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-lg text-muted-foreground">
          Carregando seus ingressos...
        </p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="mb-8">
          <Button asChild variant="outline" className="mb-4">
            <Link to="/" className="inline-flex items-center gap-2">
              <ArrowLeft className="w-4 h-4" />
              Voltar
            </Link>
          </Button>
          <div className="flex items-center gap-3 mb-2">
            <Ticket className="w-8 h-8" />
            <h1 className="text-4xl font-bold">Meus Ingressos</h1>
          </div>
          <p className="text-muted-foreground">
            Veja todos os ingressos que você comprou
          </p>
        </div>

        {error && (
          <Card className="mb-6 border-destructive">
            <CardContent className="pt-6">
              <p className="text-destructive">{error}</p>
            </CardContent>
          </Card>
        )}

        {orders.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center">
              <Ticket className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
              <h3 className="text-xl font-semibold mb-2">
                Nenhum ingresso encontrado
              </h3>
              <p className="text-muted-foreground mb-6">
                Você ainda não comprou nenhum ingresso.
              </p>
              <Button asChild>
                <Link to="/">Explorar Eventos</Link>
              </Button>
            </CardContent>
          </Card>
        ) : (
          <Tabs defaultValue="unused" className="w-full">
            <TabsList className="grid w-full grid-cols-2 mb-6">
              <TabsTrigger value="unused">
                Não Utilizados ({unusedOrders.length})
              </TabsTrigger>
              <TabsTrigger value="used">
                Utilizados ({usedOrders.length})
              </TabsTrigger>
            </TabsList>

            <TabsContent value="unused">
              {unusedOrders.length === 0 ? (
                <Card>
                  <CardContent className="flex flex-col items-center justify-center py-12">
                    <Ticket className="w-12 h-12 text-muted-foreground mb-4" />
                    <p className="text-lg font-medium text-muted-foreground">
                      Nenhum ingresso não utilizado
                    </p>
                    <p className="text-sm text-muted-foreground mt-2">
                      Todos os seus ingressos já foram validados
                    </p>
                  </CardContent>
                </Card>
              ) : (
                <div className="space-y-6">
                  {unusedOrders.map(renderOrderCard)}
                </div>
              )}
            </TabsContent>

            <TabsContent value="used">
              {usedOrders.length === 0 ? (
                <Card>
                  <CardContent className="flex flex-col items-center justify-center py-12">
                    <CheckCircle2 className="w-12 h-12 text-muted-foreground mb-4" />
                    <p className="text-lg font-medium text-muted-foreground">
                      Nenhum ingresso utilizado
                    </p>
                    <p className="text-sm text-muted-foreground mt-2">
                      Seus ingressos aparecerão aqui após serem validados
                    </p>
                  </CardContent>
                </Card>
              ) : (
                <div className="space-y-6">
                  {usedOrders.map(renderOrderCard)}
                </div>
              )}
            </TabsContent>
          </Tabs>
        )}
      </div>
    </div>
  );
}
