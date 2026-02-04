import { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import QRCode from 'react-qr-code';
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
import {
  Ticket,
  Calendar,
  MapPin,
  ArrowLeft,
  Download,
  Share2,
} from 'lucide-react';

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
    locationName?: string;
    latitude?: number;
    longitude?: number;
  };
  items: OrderItem[];
}

function formatDate(isoDate: string) {
  const d = new Date(isoDate);
  if (Number.isNaN(d.getTime())) return isoDate;
  return (
    d.toLocaleDateString('pt-BR', { timeZone: 'UTC' }) +
    ' às ' +
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

const resolveImageUrl = (url: string) =>
  url?.startsWith('http') ? url : `${API_URL}${url}`;

export default function TicketDetail() {
  const { orderId } = useParams<{ orderId: string }>();
  const navigate = useNavigate();
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!orderId) {
      navigate('/meus-ingressos');
      return;
    }
    fetchOrder();
  }, [orderId]);

  const fetchOrder = async () => {
    const token = localStorage.getItem('token');
    if (!token) {
      navigate('/login');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const response = await fetch(`${API_URL}/orders/${orderId}`, {
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
        throw new Error('Erro ao carregar detalhes do ingresso');
      }

      const data = await response.json();
      setOrder(data);
    } catch (err: unknown) {
      setError(
        err instanceof Error ? err.message : 'Erro ao carregar ingresso'
      );
    } finally {
      setLoading(false);
    }
  };

  const getTotalQuantity = () => {
    if (!order) return 0;
    return order.items.reduce((sum, item) => sum + item.quantity, 0);
  };

  const getTotalPrice = () => {
    if (!order) return 0;
    return order.items.reduce(
      (sum, item) => sum + item.price * item.quantity,
      0
    );
  };

  const handleDownloadQR = () => {
    const svg = document.getElementById('qr-code-svg');
    if (!svg) return;

    const svgData = new XMLSerializer().serializeToString(svg);
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    const img = new Image();

    img.onload = () => {
      canvas.width = img.width;
      canvas.height = img.height;
      ctx?.drawImage(img, 0, 0);
      const pngFile = canvas.toDataURL('image/png');

      const downloadLink = document.createElement('a');
      downloadLink.download = `ingresso-${orderId}.png`;
      downloadLink.href = pngFile;
      downloadLink.click();
    };

    img.src = 'data:image/svg+xml;base64,' + btoa(svgData);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-lg text-muted-foreground">Carregando ingresso...</p>
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Card className="max-w-md">
          <CardContent className="pt-6 text-center">
            <p className="text-destructive mb-4">
              {error || 'Ingresso não encontrado'}
            </p>
            <Button asChild>
              <Link to="/meus-ingressos">Voltar para Meus Ingressos</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Dados para o QR Code (formato JSON com informações do ingresso)
  const qrData = JSON.stringify({
    orderId: order.id,
    eventId: order.eventId,
    userId: order.id, // Será substituído pelo userId real do backend
    tickets: order.items.map((item) => ({
      lotId: item.ticketLotId,
      lotName: item.ticketLot.name,
      quantity: item.quantity,
    })),
    status: order.status,
    timestamp: order.createdAt,
  });

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <Button asChild variant="outline" className="mb-6">
          <Link to="/meus-ingressos" className="inline-flex items-center gap-2">
            <ArrowLeft className="w-4 h-4" />
            Voltar para Meus Ingressos
          </Link>
        </Button>

        {/* Header do Ingresso */}
        <Card className="mb-6 overflow-hidden">
          <div
            className="h-48 bg-cover bg-center relative"
            style={
              order.event.logoUrl
                ? {
                    backgroundImage: `url(${resolveImageUrl(order.event.logoUrl)})`,
                  }
                : { backgroundColor: 'hsl(var(--muted))' }
            }
          >
            <div className="absolute inset-0 bg-black/50" />
            <div className="relative h-full flex flex-col justify-end p-6">
              <h1 className="text-3xl font-bold text-white mb-2">
                {order.event.nome}
              </h1>
              <div className="flex items-center gap-3">
                {getStatusBadge(order.status)}
                <span className="text-white/90 text-sm">
                  Pedido #{order.id.substring(0, 8)}
                </span>
              </div>
            </div>
          </div>

          <CardContent className="pt-6">
            <div className="grid md:grid-cols-2 gap-6">
              {/* Informações do Evento */}
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <Calendar className="w-5 h-5 text-primary mt-0.5" />
                  <div>
                    <p className="text-sm text-muted-foreground">Data e Hora</p>
                    <p className="font-medium">
                      {formatDate(order.event.data)}
                    </p>
                  </div>
                </div>

                {order.event.locationName && (
                  <div className="flex items-start gap-3">
                    <MapPin className="w-5 h-5 text-primary mt-0.5" />
                    <div>
                      <p className="text-sm text-muted-foreground">Local</p>
                      <p className="font-medium">{order.event.locationName}</p>
                    </div>
                  </div>
                )}

                <div className="flex items-start gap-3">
                  <Ticket className="w-5 h-5 text-primary mt-0.5" />
                  <div>
                    <p className="text-sm text-muted-foreground">
                      Total de Ingressos
                    </p>
                    <p className="font-medium">{getTotalQuantity()}</p>
                  </div>
                </div>
              </div>

              {/* QR Code */}
              <div className="flex flex-col items-center justify-center bg-muted/30 rounded-lg p-6">
                <p className="text-sm text-muted-foreground mb-4 text-center">
                  Apresente este QR Code na entrada
                </p>
                <div className="bg-white p-4 rounded-lg">
                  <QRCode
                    id="qr-code-svg"
                    value={qrData}
                    size={200}
                    level="H"
                  />
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  className="mt-4"
                  onClick={handleDownloadQR}
                >
                  <Download className="w-4 h-4 mr-2" />
                  Baixar QR Code
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Detalhes dos Ingressos */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Detalhes dos Ingressos</CardTitle>
            <CardDescription>
              Informações sobre os lotes de ingressos adquiridos
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {order.items.map((item) => (
                <div
                  key={item.id}
                  className="flex justify-between items-center p-4 bg-muted/30 rounded-lg"
                >
                  <div>
                    <p className="font-semibold">{item.ticketLot.name}</p>
                    <p className="text-sm text-muted-foreground">
                      Quantidade: {item.quantity} × R$ {item.price.toFixed(2)}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-lg font-bold">
                      R$ {(item.price * item.quantity).toFixed(2)}
                    </p>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-6 pt-6 border-t">
              <div className="flex justify-between items-center text-lg font-semibold">
                <span>Total Pago:</span>
                <span className="text-2xl text-primary">
                  R$ {getTotalPrice().toFixed(2)}
                </span>
              </div>
              <p className="text-sm text-muted-foreground mt-2">
                Comprado em {formatDate(order.createdAt)}
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Ações */}
        <div className="flex gap-3">
          <Button asChild className="flex-1">
            <Link to={`/eventos/${order.eventId}`}>Ver Detalhes do Evento</Link>
          </Button>
          <Button variant="outline" className="flex-1">
            <Share2 className="w-4 h-4 mr-2" />
            Compartilhar
          </Button>
        </div>
      </div>
    </div>
  );
}
