import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Ticket, ShoppingCart, Plus, Minus } from 'lucide-react';
import { API_URL } from '@/config/api';

export interface TicketLot {
  id: string;
  name: string;
  price: number;
  quantity: number;
  active: boolean;
  maxPerUser?: number | null;
}

interface TicketPurchaseProps {
  ticketLots: TicketLot[];
  eventId: string;
}

export default function TicketPurchase({
  ticketLots,
  eventId,
}: TicketPurchaseProps) {
  const navigate = useNavigate();
  const [ticketQuantities, setTicketQuantities] = useState<
    Record<string, number>
  >({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleQuantityChange = (ticketId: string, delta: number) => {
    setTicketQuantities((prev) => {
      const current = prev[ticketId] || 0;
      const newQuantity = Math.max(0, current + delta);
      return { ...prev, [ticketId]: newQuantity };
    });
  };

  const getTotalPrice = () => {
    return ticketLots.reduce((total, ticket) => {
      const quantity = ticketQuantities[ticket.id] || 0;
      return total + ticket.price * quantity;
    }, 0);
  };

  const getTotalItems = () => {
    return Object.values(ticketQuantities).reduce((sum, qty) => sum + qty, 0);
  };

  const handlePurchase = async () => {
    const items = Object.entries(ticketQuantities)
      .filter(([, qty]) => qty > 0)
      .map(([ticketLotId, quantity]) => ({ ticketLotId, quantity }));

    if (items.length === 0) {
      alert('Selecione pelo menos um ingresso');
      return;
    }

    const token = localStorage.getItem('token');
    if (!token) {
      alert('Você precisa estar logado para comprar ingressos');
      navigate('/login');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const response = await fetch(`${API_URL}/orders`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ eventId, items }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Erro ao finalizar compra');
      }

      const order = await response.json();
      alert(
        `Compra realizada com sucesso! Pedido #${order.id.substring(0, 8)}`
      );

      // Limpar seleção e recarregar página para atualizar estoque
      setTicketQuantities({});
      window.location.reload();
    } catch (err: unknown) {
      const errorMessage =
        err instanceof Error ? err.message : 'Erro ao processar compra';
      setError(errorMessage);
      alert(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  if (!ticketLots || ticketLots.length === 0) {
    return null;
  }

  return (
    <section>
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Ticket className="w-5 h-5 md:w-6 md:h-6" />
            <CardTitle className="text-xl md:text-3xl">
              Ingressos Disponíveis
            </CardTitle>
          </div>
          <CardDescription className="text-sm">
            Selecione a quantidade de ingressos que deseja adquirir
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-4">
            {ticketLots
              .filter((ticket) => ticket.active)
              .map((ticket) => {
                const quantity = ticketQuantities[ticket.id] || 0;
                const isAvailable = ticket.quantity > 0;

                return (
                  <Card
                    key={ticket.id}
                    className={!isAvailable ? 'opacity-60' : ''}
                  >
                    <CardContent className="flex flex-col md:flex-row md:items-center md:justify-between md:p-6 gap-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 md:gap-3 mb-2 flex-wrap">
                          <h3 className="text-base md:text-lg font-semibold">
                            {ticket.name}
                          </h3>
                          {!isAvailable && (
                            <Badge variant="destructive" className="text-xs">
                              Esgotado
                            </Badge>
                          )}
                        </div>
                        <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 text-sm text-muted-foreground">
                          <span className="text-xl md:text-2xl font-bold text-foreground">
                            R$ {ticket.price.toFixed(2)}
                          </span>
                          <span className="text-xs md:text-sm">
                            {ticket.quantity} disponíveis
                          </span>
                          {ticket.maxPerUser && (
                            <span className="text-xs bg-muted px-2 py-1 rounded">
                              Máx. {ticket.maxPerUser} por pessoa
                            </span>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center gap-2 md:gap-3 justify-end md:justify-start">
                        <Button
                          variant="outline"
                          size="icon"
                          className="h-9 w-9 md:h-10 md:w-10"
                          onClick={() => handleQuantityChange(ticket.id, -1)}
                          disabled={!isAvailable || quantity === 0}
                        >
                          <Minus className="w-3 h-3 md:w-4 md:h-4" />
                        </Button>
                        <span className="w-10 md:w-12 text-center font-semibold text-base md:text-lg">
                          {quantity}
                        </span>
                        <Button
                          variant="outline"
                          size="icon"
                          className="h-9 w-9 md:h-10 md:w-10"
                          onClick={() => handleQuantityChange(ticket.id, 1)}
                          disabled={
                            !isAvailable ||
                            quantity >= ticket.quantity ||
                            (ticket.maxPerUser
                              ? quantity >= ticket.maxPerUser
                              : false)
                          }
                        >
                          <Plus className="w-3 h-3 md:w-4 md:h-4" />
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
          </div>

          {getTotalItems() > 0 && (
            <div className="border-t pt-4 md:pt-6 space-y-3 md:space-y-4">
              <div className="flex justify-between items-center text-base md:text-lg">
                <span className="font-semibold">Total:</span>
                <span className="text-xl md:text-2xl font-bold">
                  R$ {getTotalPrice().toFixed(2)}
                </span>
              </div>
              <div className="text-xs md:text-sm text-muted-foreground">
                {getTotalItems()}{' '}
                {getTotalItems() === 1 ? 'ingresso' : 'ingressos'}{' '}
                selecionado(s)
              </div>
              <Button
                onClick={handlePurchase}
                size="lg"
                className="w-full text-sm md:text-base"
                disabled={loading}
              >
                <ShoppingCart className="w-4 h-4 md:w-5 md:h-5 mr-2" />
                {loading ? 'Processando...' : 'Finalizar Compra'}
              </Button>
              {error && <p className="text-sm text-destructive">{error}</p>}
            </div>
          )}
        </CardContent>
      </Card>
    </section>
  );
}
