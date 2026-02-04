import { useState, useEffect } from 'react';
import { API_URL } from '@/config/api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { AlertCircle, Pencil, Trash2 } from 'lucide-react';
import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area';

interface TicketLot {
  id?: string;
  name: string;
  price: number;
  quantity: number;
  active: boolean;
  maxPerUser?: number | null;
}

interface TicketLotManagerProps {
  eventId: string | null;
  onLotsChange?: (lots: TicketLot[]) => void;
}

function TicketLotManager({ eventId, onLotsChange }: TicketLotManagerProps) {
  const [lots, setLots] = useState<TicketLot[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [editingLot, setEditingLot] = useState<TicketLot | null>(null);
  const [formData, setFormData] = useState<TicketLot>({
    name: '',
    price: 0,
    quantity: 0,
    active: true,
    maxPerUser: null,
  });

  useEffect(() => {
    if (eventId) {
      loadLots();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [eventId]);

  useEffect(() => {
    if (onLotsChange) {
      onLotsChange(lots);
    }
  }, [lots, onLotsChange]);

  const loadLots = async () => {
    if (!eventId) return;

    setLoading(true);
    setError('');
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(
        `http://localhost:3001/event-ticket-lot/${eventId}/tickets/lots`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!res.ok) {
        throw new Error('Erro ao carregar lotes');
      }

      const data = await res.json();
      setLots(Array.isArray(data) ? data : []);
    } catch {
      setError('Erro ao carregar lotes de ingressos');
      setLots([]);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value, type } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]:
        type === 'number'
          ? value === '' || value === null
            ? name === 'maxPerUser'
              ? null
              : 0
            : name === 'maxPerUser'
              ? value === '0'
                ? null
                : parseInt(value, 10)
              : parseFloat(value)
          : type === 'checkbox'
            ? (e.target as HTMLInputElement).checked
            : value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!eventId) {
      setError('Evento deve ser criado antes de adicionar lotes de ingressos');
      return;
    }

    if (!formData.name || formData.price < 0 || formData.quantity <= 0) {
      setError('Preencha todos os campos corretamente');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const token = localStorage.getItem('token');

      if (editingLot?.id) {
        // Atualizar lote existente
        const res = await fetch(
          `${API_URL}/event-ticket-lot/tickets/lots/${editingLot.id}`,
          {
            method: 'PUT',
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify(formData),
          }
        );

        if (!res.ok) {
          throw new Error('Erro ao atualizar lote');
        }

        const updated = await res.json();
        setLots((prev) =>
          prev.map((lot) => (lot.id === editingLot.id ? updated : lot))
        );
        setEditingLot(null);
      } else {
        // Criar novo lote
        const res = await fetch(
          `${API_URL}/event-ticket-lot/${eventId}/tickets/lots`,
          {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify(formData),
          }
        );

        if (!res.ok) {
          throw new Error('Erro ao criar lote');
        }

        const newLot = await res.json();
        setLots((prev) => [...prev, newLot]);
      }

      // Limpar formulário
      setFormData({
        name: '',
        price: 0,
        quantity: 0,
        active: true,
        maxPerUser: null,
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao processar lote');
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (lot: TicketLot) => {
    setEditingLot(lot);
    setFormData({
      name: lot.name,
      price: lot.price,
      quantity: lot.quantity,
      active: lot.active,
      maxPerUser: lot.maxPerUser,
    });
  };

  const handleDelete = async (lotId: string) => {
    if (!confirm('Deseja realmente excluir este lote?')) return;

    setLoading(true);
    setError('');

    try {
      const token = localStorage.getItem('token');
      const res = await fetch(
        `${API_URL}/event-ticket-lot/tickets/lots/${lotId}`,
        {
          method: 'DELETE',
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!res.ok) {
        throw new Error('Erro ao excluir lote');
      }

      setLots((prev) => prev.filter((lot) => lot.id !== lotId));
    } catch {
      setError('Erro ao excluir lote');
    } finally {
      setLoading(false);
    }
  };

  const handleCancelEdit = () => {
    setEditingLot(null);
    setFormData({
      name: '',
      price: 0,
      quantity: 0,
      active: true,
      maxPerUser: null,
    });
  };

  if (!eventId) {
    return (
      <Alert className="border-blue-500 bg-blue-50">
        <AlertCircle className="h-4 w-4 text-blue-600" />
        <AlertDescription className="text-blue-800">
          Salve o evento primeiro para adicionar lotes de ingressos
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <div className="">
      <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
        Lotes de Ingressos
      </h3>

      <div>
        <div className="">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Nome do Lote</Label>
              <Input
                id="name"
                name="name"
                placeholder="Ex: 1º Lote, VIP, Pista"
                value={formData.name}
                onChange={handleInputChange}
                disabled={loading}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="price">Preço (R$)</Label>
              <Input
                id="price"
                name="price"
                type="number"
                step="any"
                min="0"
                placeholder="0.00"
                value={formData.price === 0 ? '0' : formData.price || ''}
                onChange={handleInputChange}
                disabled={loading}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="quantity">Quantidade</Label>
              <Input
                id="quantity"
                name="quantity"
                type="number"
                min="1"
                placeholder="100"
                value={formData.quantity || ''}
                onChange={handleInputChange}
                disabled={loading}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="maxPerUser">Limite por Usuário (opcional)</Label>
              <Input
                id="maxPerUser"
                name="maxPerUser"
                type="number"
                min="1"
                placeholder="Sem limite"
                value={formData.maxPerUser || ''}
                onChange={handleInputChange}
                disabled={loading}
              />
            </div>

            <div className="flex items-center space-x-2">
              <Checkbox
                id="active"
                checked={formData.active}
                onCheckedChange={(checked) =>
                  setFormData({ ...formData, active: checked as boolean })
                }
                disabled={loading}
              />
              <Label htmlFor="active" className="cursor-pointer">
                Ativo
              </Label>
            </div>

            <div className="flex gap-2 justify-end pt-4">
              {editingLot && (
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleCancelEdit}
                  disabled={loading}
                >
                  Cancelar
                </Button>
              )}
              <Button type="submit" disabled={loading}>
                {loading
                  ? 'Salvando...'
                  : editingLot
                    ? 'Atualizar Lote'
                    : 'Adicionar Lote'}
              </Button>
            </div>
          </form>
        </div>
      </div>

      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {lots.length > 0 && (
        <div className="">
          <h4 className="text-sm font-semibold text-gray-700 mb-3">
            Lotes Cadastrados
          </h4>
          <div className="border rounded-lg w-full">
            <ScrollArea className="w-72 md:w-full">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Nome</TableHead>
                    <TableHead>Preço</TableHead>
                    <TableHead>Quantidade</TableHead>
                    <TableHead>Limite/Usuário</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-center md:text-right">
                      Ações
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {lots.map((lot) => (
                    <TableRow key={lot.id}>
                      <TableCell>{lot.name}</TableCell>
                      <TableCell>R$ {lot.price.toFixed(2)}</TableCell>
                      <TableCell>{lot.quantity}</TableCell>
                      <TableCell>{lot.maxPerUser || 'Sem limite'}</TableCell>
                      <TableCell>
                        <Badge variant={lot.active ? 'default' : 'secondary'}>
                          {lot.active ? 'Ativo' : 'Inativo'}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex gap-2 justify-end">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleEdit(lot)}
                            disabled={loading}
                          >
                            <Pencil className="w-4 h-4" />
                          </Button>
                          <Button
                            size="sm"
                            variant="destructive"
                            onClick={() => lot.id && handleDelete(lot.id)}
                            disabled={loading}
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
              <ScrollBar orientation="horizontal" />
            </ScrollArea>
          </div>
        </div>
      )}
    </div>
  );
}

export default TicketLotManager;
