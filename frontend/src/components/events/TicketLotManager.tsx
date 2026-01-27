import { useState, useEffect } from 'react';
import './TicketLotManager.css';

interface TicketLot {
  id?: string;
  name: string;
  price: number;
  quantity: number;
  active: boolean;
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
  });

  useEffect(() => {
    if (eventId) {
      loadLots();
    }
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
          ? parseFloat(value) || 0
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

    if (!formData.name || formData.price <= 0 || formData.quantity <= 0) {
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
          `http://localhost:3001/event-ticket-lot/tickets/lots/${editingLot.id}`,
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
          `http://localhost:3001/event-ticket-lot/${eventId}/tickets/lots`,
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
    });
  };

  const handleDelete = async (lotId: string) => {
    if (!confirm('Deseja realmente excluir este lote?')) return;

    setLoading(true);
    setError('');

    try {
      const token = localStorage.getItem('token');
      const res = await fetch(
        `http://localhost:3001/event-ticket-lot/tickets/lots/${lotId}`,
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
    });
  };

  if (!eventId) {
    return (
      <div className="ticket-lot-manager">
        <p className="info-message">
          ℹ️ Salve o evento primeiro para adicionar lotes de ingressos
        </p>
      </div>
    );
  }

  return (
    <div className="ticket-lot-manager">
      <h3>Lotes de Ingressos</h3>

      <form onSubmit={handleSubmit} className="lot-form">
        <div className="form-col">
          <div className="form-field">
            <label>Nome do Lote</label>
            <input
              type="text"
              name="name"
              placeholder="Ex: 1º Lote, VIP, Pista"
              value={formData.name}
              onChange={handleInputChange}
              disabled={loading}
              required
            />
          </div>

          <div className="form-field">
            <label>Preço (R$)</label>
            <input
              type="number"
              name="price"
              step="0.01"
              min="0"
              placeholder="0.00"
              value={formData.price || ''}
              onChange={handleInputChange}
              disabled={loading}
              required
            />
          </div>

          <div className="form-field">
            <label>Quantidade</label>
            <input
              type="number"
              name="quantity"
              min="1"
              placeholder="100"
              value={formData.quantity || ''}
              onChange={handleInputChange}
              disabled={loading}
              required
            />
          </div>

          <div className="form-field checkbox-field">
            <label>
              <input
                type="checkbox"
                name="active"
                checked={formData.active}
                onChange={(e) =>
                  setFormData({ ...formData, active: e.target.checked })
                }
                disabled={loading}
              />
              Ativo
            </label>
          </div>
        </div>

        <div className="form-actions">
          {editingLot && (
            <button
              type="button"
              onClick={handleCancelEdit}
              className="btn-cancel"
              disabled={loading}
            >
              Cancelar
            </button>
          )}
          <button type="submit" className="btn-submit" disabled={loading}>
            {loading
              ? 'Salvando...'
              : editingLot
                ? 'Atualizar Lote'
                : 'Adicionar Lote'}
          </button>
        </div>
      </form>

      {error && <div className="error-message">{error}</div>}

      {lots.length > 0 && (
        <div className="lots-list">
          <h4>Lotes Cadastrados</h4>
          <table className="lots-table">
            <thead>
              <tr>
                <th>Nome</th>
                <th>Preço</th>
                <th>Quantidade</th>
                <th>Status</th>
                <th>Ações</th>
              </tr>
            </thead>
            <tbody>
              {lots.map((lot) => (
                <tr key={lot.id}>
                  <td>{lot.name}</td>
                  <td>R$ {lot.price.toFixed(2)}</td>
                  <td>{lot.quantity}</td>
                  <td>
                    <span
                      className={`status-badge ${lot.active ? 'active' : 'inactive'}`}
                    >
                      {lot.active ? 'Ativo' : 'Inativo'}
                    </span>
                  </td>
                  <td className="actions">
                    <button
                      onClick={() => handleEdit(lot)}
                      className="btn-edit"
                      disabled={loading}
                    >
                      Editar
                    </button>
                    <button
                      onClick={() => lot.id && handleDelete(lot.id)}
                      className="btn-delete"
                      disabled={loading}
                    >
                      Excluir
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

export default TicketLotManager;
