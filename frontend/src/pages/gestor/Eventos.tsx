import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { isAuthenticated, isAdmin } from '../../auth-utils';
import EventFormDialog from '../../components/events/EventFormDialog';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '../../components/ui/dialog';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '../../components/ui/table';
import { Button } from '../../components/ui/button';
import { Badge } from '../../components/ui/badge';
import { Card, CardContent } from '../../components/ui/card';
import './Eventos.css';
import { Eye, Pencil, Plus, Trash2 } from 'lucide-react';

interface Event {
  id: string;
  nome: string;
  descricao: string;
  data: string;
  categoria: string;
  children?: Event[];
  latitude?: number | null;
  longitude?: number | null;
  locationName?: string | null;
}

export default function Eventos() {
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingEvent, setEditingEvent] = useState<Event | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    // Verificar se tem token
    if (!isAuthenticated()) {
      navigate('/login');
      return;
    }

    // Se for admin, redirecionar para página admin
    if (isAdmin()) {
      navigate('/admin');
      return;
    }

    fetchEvents();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [navigate]);

  const fetchEvents = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:3001/events/mine', {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (response.status === 401 || response.status === 403) {
        localStorage.removeItem('token');
        navigate('/login');
        return;
      }

      if (!response.ok) {
        throw new Error('Erro ao carregar eventos');
      }

      const data = await response.json();
      setEvents(data.events || []);
    } catch (err) {
      setError('Erro ao carregar eventos');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const formatCategory = (value?: string | null) => {
    if (!value) return '';
    return value.charAt(0).toUpperCase() + value.slice(1);
  };

  const handleEventSuccess = () => {
    setDialogOpen(false);
    setEditingEvent(null);
    fetchEvents(); // Recarregar lista após criar/editar evento
  };

  const handleEdit = (event: Event) => {
    setEditingEvent(event);
    setDialogOpen(true);
  };

  const handleCancelEdit = () => {
    setEditingEvent(null);
    setDialogOpen(false);
  };

  const handleNewEvent = () => {
    setEditingEvent(null);
    setDialogOpen(true);
  };

  const handleDelete = async (eventId: string, eventName: string) => {
    const confirmed = window.confirm(
      `Tem certeza que deseja excluir o evento "${eventName}"?\n\nEsta ação não pode ser desfeita.`
    );

    if (!confirmed) return;

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:3001/events/${eventId}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (response.status === 401 || response.status === 403) {
        localStorage.removeItem('token');
        navigate('/login');
        return;
      }

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Erro ao excluir evento');
      }

      // Recarregar lista após exclusão
      await fetchEvents();

      // mostrar mensagem de sucesso
      alert('Evento excluído com sucesso!');
    } catch (err) {
      console.error('Erro ao excluir evento:', err);
      alert(
        `Erro ao excluir evento: ${err instanceof Error ? err.message : 'Erro desconhecido'}`
      );
    }
  };

  // Calcular estatísticas
  const totalEvents = events.length;
  const upcomingEvents = events.filter(
    (e) => new Date(e.data) > new Date()
  ).length;
  const pastEvents = totalEvents - upcomingEvents;
  const totalSubEvents = events.reduce(
    (acc, e) => acc + (e.children?.length || 0),
    0
  );

  if (loading) {
    return (
      <div className="dashboard-container">
        <div className="loading-container">
          <div className="loading-spinner" />
          <p style={{ color: '#64748b', fontSize: '1.125rem' }}>
            Carregando eventos...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="dashboard-container">
      <div className="dashboard-header">
        <h1 className="dashboard-title">Painel do Gestor</h1>
        <p className="dashboard-subtitle">
          Gerencie seus eventos de forma simples e eficiente
        </p>
      </div>

      {/* Estatísticas */}
      <div className="stats-grid">
        <Card className="stat-card">
          <CardContent className="p-6">
            <div className="stat-header">
              <div>
                <div className="stat-value">{totalEvents}</div>
                <div className="stat-label">Total de Eventos</div>
              </div>
              <div className="stat-icon primary">📅</div>
            </div>
          </CardContent>
        </Card>

        <Card className="stat-card">
          <CardContent className="p-6">
            <div className="stat-header">
              <div>
                <div className="stat-value">{upcomingEvents}</div>
                <div className="stat-label">Eventos Futuros</div>
              </div>
              <div className="stat-icon success">🎯</div>
            </div>
          </CardContent>
        </Card>

        <Card className="stat-card">
          <CardContent className="p-6">
            <div className="stat-header">
              <div>
                <div className="stat-value">{pastEvents}</div>
                <div className="stat-label">Eventos Realizados</div>
              </div>
              <div className="stat-icon warning">✅</div>
            </div>
          </CardContent>
        </Card>

        <Card className="stat-card">
          <CardContent className="p-6">
            <div className="stat-header">
              <div>
                <div className="stat-value">{totalSubEvents}</div>
                <div className="stat-label">Subeventos</div>
              </div>
              <div className="stat-icon info">🎪</div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Seção de Eventos */}
      <div className="events-section">
        <div className="section-header">
          <h2 className="section-title">Meus Eventos</h2>
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button
                onClick={handleNewEvent}
                size="lg"
                variant="default"
                className="bg-blue-600 hover:bg-blue-700 text-white"
              >
                <Plus /> Novo Evento
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>
                  {editingEvent ? 'Editar Evento' : 'Criar Novo Evento'}
                </DialogTitle>
                <DialogDescription>
                  {editingEvent
                    ? 'Atualize as informações do evento abaixo.'
                    : 'Preencha os dados para criar um novo evento.'}
                </DialogDescription>
              </DialogHeader>
              <EventFormDialog
                onSuccess={handleEventSuccess}
                editingEvent={editingEvent || undefined}
                onCancel={handleCancelEdit}
              />
            </DialogContent>
          </Dialog>
        </div>

        {error && (
          <div
            style={{
              padding: '1rem',
              backgroundColor: '#fee',
              color: '#c33',
              borderRadius: '8px',
              marginBottom: '1rem',
            }}
          >
            {error}
          </div>
        )}

        {events.length === 0 ? (
          <div className="empty-state">
            <div className="empty-state-icon">📭</div>
            <h3 className="empty-state-title">Nenhum evento cadastrado</h3>
            <p className="empty-state-description">
              Você ainda não possui eventos cadastrados. Comece criando seu
              primeiro evento!
            </p>
            <Button onClick={handleNewEvent} size="lg">
              <Plus /> Criar Primeiro Evento
            </Button>
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nome</TableHead>
                <TableHead>Descrição</TableHead>
                <TableHead>Data</TableHead>
                <TableHead>Categoria</TableHead>
                <TableHead>Subeventos</TableHead>
                <TableHead className="text-right">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {events.map((event) => (
                <TableRow key={event.id}>
                  <TableCell className="font-medium">{event.nome}</TableCell>
                  <TableCell className="max-w-xs truncate">
                    {event.descricao.length > 60
                      ? `${event.descricao.substring(0, 60)}...`
                      : event.descricao}
                  </TableCell>
                  <TableCell>{formatDate(event.data)}</TableCell>
                  <TableCell>
                    <Badge variant="secondary">
                      {formatCategory(event.categoria)}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    {event.children && event.children.length > 0 ? (
                      <Badge variant="default">
                        {event.children.length} subevento(s)
                      </Badge>
                    ) : (
                      <span className="text-gray-400 text-sm">Nenhum</span>
                    )}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="action-buttons justify-end">
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                        onClick={() => navigate(`/eventos/${event.id}`)}
                      >
                        <Eye className="w-4 h-4" />
                        Ver
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-amber-600 hover:text-amber-700 hover:bg-amber-50"
                        onClick={() => handleEdit(event)}
                      >
                        <Pencil className="w-4 h-4" />
                        Editar
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-red-600 hover:text-red-700 hover:bg-red-50"
                        onClick={() => handleDelete(event.id, event.nome)}
                      >
                        <Trash2 className="w-4 h-4" />
                        Excluir
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </div>
    </div>
  );
}
