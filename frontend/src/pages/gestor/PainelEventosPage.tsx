import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { isAuthenticated, isAdmin, isGestor } from '../../auth-utils';
import EventFormDialog from './components/EventFormDialog';
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
import { Eye, Pencil, Plus, Trash2, BarChart3 } from 'lucide-react';
import { API_URL } from '@/config/api';
import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area';

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

export default function PainelEventosPage() {
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

    // Se não for gestor, bloquear acesso
    if (!isGestor()) {
      navigate('/');
      return;
    }

    fetchEvents();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [navigate]);

  const fetchEvents = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_URL}/events/mine`, {
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
      const response = await fetch(`${API_URL}/events/${eventId}`, {
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
      <div className="min-h-screen bg-linear-to-br from-gray-50 to-blue-100 p-8">
        <div className="flex flex-col items-center justify-center min-h-100 gap-4">
          <div className="w-12 h-12 border-4 border-gray-200 border-t-purple-600 rounded-full animate-spin" />
          <p className="text-slate-500 text-lg">Carregando eventos...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-linear-to-br from-gray-50 to-blue-100 p-2 md:p-8">
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-slate-800 mb-2">
          Painel do Gestor
        </h1>
        <p className="text-slate-500 text-base">
          Gerencie seus eventos de forma simples e eficiente
        </p>
      </div>

      {/* Estatísticas */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <Card className="bg-white rounded-xl shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all duration-300">
          <CardContent className="p-6">
            <div className="flex justify-between items-center mb-4">
              <div>
                <div className="text-3xl font-bold text-slate-800 mb-1">
                  {totalEvents}
                </div>
                <div className="text-slate-500 text-sm font-medium">
                  Total de Eventos
                </div>
              </div>
              <div className="w-12 h-12 rounded-lg bg-linear-to-br from-purple-500 to-purple-700 flex items-center justify-center text-2xl">
                📅
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white rounded-xl shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all duration-300">
          <CardContent className="p-6">
            <div className="flex justify-between items-center mb-4">
              <div>
                <div className="text-3xl font-bold text-slate-800 mb-1">
                  {upcomingEvents}
                </div>
                <div className="text-slate-500 text-sm font-medium">
                  Eventos Futuros
                </div>
              </div>
              <div className="w-12 h-12 rounded-lg bg-linear-to-br from-pink-400 to-red-500 flex items-center justify-center text-2xl">
                🎯
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white rounded-xl shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all duration-300">
          <CardContent className="p-6">
            <div className="flex justify-between items-center mb-4">
              <div>
                <div className="text-3xl font-bold text-slate-800 mb-1">
                  {pastEvents}
                </div>
                <div className="text-slate-500 text-sm font-medium">
                  Eventos Realizados
                </div>
              </div>
              <div className="w-12 h-12 rounded-lg bg-linear-to-br from-orange-200 to-orange-400 flex items-center justify-center text-2xl">
                ✅
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white rounded-xl shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all duration-300">
          <CardContent className="p-6">
            <div className="flex justify-between items-center mb-4">
              <div>
                <div className="text-3xl font-bold text-slate-800 mb-1">
                  {totalSubEvents}
                </div>
                <div className="text-slate-500 text-sm font-medium">
                  Subeventos
                </div>
              </div>
              <div className="w-12 h-12 rounded-lg bg-linear-to-br from-teal-300 to-pink-200 flex items-center justify-center text-2xl">
                🎪
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Seção de Eventos */}
      <div className="bg-white rounded-xl p-3 shadow-sm md:p-6">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
          <h2 className="text-2xl font-semibold text-slate-800">
            Meus Eventos
          </h2>
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button
                onClick={handleNewEvent}
                size="lg"
                className="bg-blue-600 hover:bg-blue-700"
              >
                <Plus className="w-4 h-4" />
                Novo Evento
              </Button>
            </DialogTrigger>
            <DialogContent className="flex flex-col max-w-4xl h-screen w-screen md:max-h-[90vh] md:max-w-3xl overflow-hidden">
              <DialogHeader>
                <DialogTitle className="text-2xl">
                  {editingEvent ? 'Editar Evento' : 'Novo Evento'}
                </DialogTitle>
                <DialogDescription>
                  {editingEvent
                    ? 'Atualize as informações do evento.'
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
          <div className="p-4 bg-red-50 text-red-600 rounded-lg mb-4">
            {error}
          </div>
        )}

        {events.length === 0 ? (
          <div className="text-center py-16 px-8 text-slate-500">
            <div className="text-6xl mb-4 opacity-50">📭</div>
            <h3 className="text-xl font-semibold mb-2 text-slate-600">
              Nenhum evento cadastrado
            </h3>
            <p className="mb-6">
              Você ainda não possui eventos cadastrados. Comece criando seu
              primeiro evento!
            </p>
            <Button onClick={handleNewEvent} size="lg">
              <Plus /> Criar Primeiro Evento
            </Button>
          </div>
        ) : (
          <ScrollArea className="h-[70vh] overflow-auto border rounded-lg md:h-full">
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
                      <div className="flex gap-2 justify-end">
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-green-600 hover:text-green-700 hover:bg-green-50"
                          onClick={() =>
                            navigate(`/gestor/eventos/${event.id}/dashboard`)
                          }
                        >
                          <BarChart3 className="w-4 h-4" />
                          Dashboard
                        </Button>
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
            <ScrollBar orientation="vertical" />
            <ScrollBar orientation="horizontal" />
          </ScrollArea>
        )}
      </div>
    </div>
  );
}
