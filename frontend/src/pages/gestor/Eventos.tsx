import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { isAuthenticated, isAdmin } from '../../auth-utils';
import Form from '../Form';

interface Event {
  id: string;
  nome: string;
  descricao: string;
  data: string;
  categoria: string;
  children?: Event[];
}

export default function Eventos() {
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showForm, setShowForm] = useState(false);
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
  }, [navigate]);

  const fetchEvents = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:3001/events/mine', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
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
      minute: '2-digit'
    });
  };

  const handleEventSuccess = () => {
    setShowForm(false);
    setEditingEvent(null);
    fetchEvents(); // Recarregar lista após criar/editar evento
  };

  const handleEdit = (event: Event) => {
    setEditingEvent(event);
    setShowForm(true);
  };

  const handleCancelEdit = () => {
    setEditingEvent(null);
    setShowForm(false);
  };

  const handleNewEvent = () => {
    setEditingEvent(null);
    setShowForm(true);
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
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
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
      alert(`Erro ao excluir evento: ${err instanceof Error ? err.message : 'Erro desconhecido'}`);
    }
  };

  if (loading) {
    return (
      <div style={{ padding: '20px', textAlign: 'center' }}>
        <h2>Carregando eventos...</h2>
      </div>
    );
  }

  return (
    <div style={{ padding: '20px' }}>
      <h1>Área do Gestor Local</h1>
      <h2>Meus Eventos</h2>

      <div style={{ marginBottom: '20px' }}>
        <button
          onClick={() => showForm ? setShowForm(false) : handleNewEvent()}
          style={{
            padding: '10px 20px',
            backgroundColor: '#007bff',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer'
          }}
        >
          {showForm ? 'Ocultar Formulário' : 'Novo Evento'}
        </button>
      </div>

      {showForm && (
        <div style={{
          marginBottom: '30px',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center'
        }}>
          <div style={{ width: '100%', maxWidth: '600px' }}>
            <Form
              onSuccess={handleEventSuccess}
              editingEvent={editingEvent || undefined}
              onCancel={handleCancelEdit}
            />
          </div>
        </div>
      )}

      {error && (
        <div style={{ color: 'red', marginBottom: '20px' }}>
          {error}
        </div>
      )}

      {events.length === 0 ? (
        <div style={{
          textAlign: 'center',
          padding: '40px',
          backgroundColor: '#f8f9fa',
          borderRadius: '8px',
          border: '1px solid #dee2e6'
        }}>
          <h3>Nenhum evento cadastrado</h3>
          <p>Você ainda não possui eventos cadastrados. Clique em "Novo Evento" para criar seu primeiro evento.</p>
        </div>
      ) : (
        <div style={{ overflowX: 'auto' }}>
          <table style={{
            width: '100%',
            borderCollapse: 'collapse',
            backgroundColor: 'white',
            borderRadius: '8px',
            overflow: 'hidden',
            boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
          }}>
            <thead>
              <tr style={{ backgroundColor: '#f8f9fa' }}>
                <th style={{ padding: '12px', textAlign: 'left', borderBottom: '1px solid #dee2e6' }}>
                  Nome do Evento
                </th>
                <th style={{ padding: '12px', textAlign: 'left', borderBottom: '1px solid #dee2e6' }}>
                  Descrição
                </th>
                <th style={{ padding: '12px', textAlign: 'left', borderBottom: '1px solid #dee2e6' }}>
                  Data
                </th>
                <th style={{ padding: '12px', textAlign: 'left', borderBottom: '1px solid #dee2e6' }}>
                  Categoria
                </th>
                <th style={{ padding: '12px', textAlign: 'left', borderBottom: '1px solid #dee2e6' }}>
                  Subeventos
                </th>
                <th style={{ padding: '12px', textAlign: 'center', borderBottom: '1px solid #dee2e6' }}>
                  Ações
                </th>
              </tr>
            </thead>
            <tbody>
              {events.map((event) => (
                <tr key={event.id} style={{ borderBottom: '1px solid #dee2e6' }}>
                  <td style={{ padding: '12px' }}>
                    <strong>{event.nome}</strong>
                  </td>
                  <td style={{ padding: '12px', maxWidth: '200px' }}>
                    {event.descricao.length > 50
                      ? `${event.descricao.substring(0, 50)}...`
                      : event.descricao
                    }
                  </td>
                  <td style={{ padding: '12px' }}>
                    {formatDate(event.data)}
                  </td>
                  <td style={{ padding: '12px' }}>
                    <span style={{
                      padding: '4px 8px',
                      backgroundColor: '#e9ecef',
                      borderRadius: '4px',
                      fontSize: '12px'
                    }}>
                      {event.categoria}
                    </span>
                  </td>
                  <td style={{ padding: '12px' }}>
                    {event.children && event.children.length > 0 ? (
                      <span style={{ color: '#28a745' }}>
                        {event.children.length} subevento(s)
                      </span>
                    ) : (
                      <span style={{ color: '#6c757d' }}>Nenhum</span>
                    )}
                  </td>
                  <td style={{ padding: '12px', textAlign: 'center' }}>
                    <button
                      onClick={() => navigate(`/eventos/${event.id}`)}
                      style={{
                        padding: '6px 12px',
                        backgroundColor: '#17a2b8',
                        color: 'white',
                        border: 'none',
                        borderRadius: '4px',
                        cursor: 'pointer',
                        marginRight: '5px',
                        fontSize: '12px'
                      }}
                    >
                      Ver Detalhes
                    </button>
                    <button
                      onClick={() => handleEdit(event)}
                      style={{
                        padding: '6px 12px',
                        backgroundColor: '#ffc107',
                        color: 'black',
                        border: 'none',
                        borderRadius: '4px',
                        cursor: 'pointer',
                        marginRight: '5px',
                        fontSize: '12px'
                      }}
                    >
                      Editar
                    </button>
                    <button
                      onClick={() => handleDelete(event.id, event.nome)}
                      style={{
                        padding: '6px 12px',
                        backgroundColor: '#dc3545',
                        color: 'white',
                        border: 'none',
                        borderRadius: '4px',
                        cursor: 'pointer',
                        fontSize: '12px'
                      }}
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
