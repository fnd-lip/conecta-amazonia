import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { isAuthenticated, isAdmin } from '../auth-utils';
import './Admin.css';

interface Event {
  id: string;
  nome: string;
  descricao: string;
  data: string;
  categoria: string;
  parentId?: string | null;
  user: {
    name: string;
  };
  children?: Event[];
}

interface User {
  id: string;
  name: string;
  email: string;
  type: string;
  createdAt: string;
}

export default function Admin() {
  const [activeTab, setActiveTab] = useState<'eventos' | 'usuarios'>('eventos');
  const [events, setEvents] = useState<Event[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    // Verificar autenticação e permissões
    if (!isAuthenticated()) {
      navigate('/login');
      return;
    }

    if (!isAdmin()) {
      navigate('/gestor/eventos');
      return;
    }

    // Carregar dados iniciais
    if (activeTab === 'eventos') {
      fetchEvents();
    } else {
      fetchUsers();
    }
  }, [navigate, activeTab]);

  const fetchEvents = async () => {
    try {
      setLoading(true);
      setError('');
      const token = localStorage.getItem('token');

      const response = await fetch('http://localhost:3001/admin/events', {
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
      setEvents(data || []);
    } catch (err) {
      setError('Erro ao carregar eventos');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const fetchUsers = async () => {
    try {
      setLoading(true);
      setError('');
      const token = localStorage.getItem('token');

      const response = await fetch('http://localhost:3001/admin/users', {
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
        throw new Error('Erro ao carregar usuários');
      }

      const data = await response.json();
      setUsers(data || []);
    } catch (err) {
      setError('Erro ao carregar usuários');
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

  const formatCreationDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  return (
    <div className="admin-container">
      <div className="admin-header">
        <h1>Painel Administrativo</h1>
        <p>Gerencie todos os eventos e usuários do sistema</p>
      </div>

      <div className="admin-tabs">
        <button
          className={`tab-button ${activeTab === 'eventos' ? 'active' : ''}`}
          onClick={() => setActiveTab('eventos')}
        >
          Eventos
        </button>
        <button
          className={`tab-button ${activeTab === 'usuarios' ? 'active' : ''}`}
          onClick={() => setActiveTab('usuarios')}
        >
          Usuários
        </button>
      </div>

      {loading && (
        <div className="loading-container">
          <h3>Carregando...</h3>
        </div>
      )}

      {error && (
        <div className="error-container">
          <p>{error}</p>
          <button onClick={() => activeTab === 'eventos' ? fetchEvents() : fetchUsers()}>
            Tentar Novamente
          </button>
        </div>
      )}

      {!loading && !error && activeTab === 'eventos' && (
        <div className="events-tab">
          <h2>Todos os Eventos ({events.length})</h2>
          {events.length === 0 ? (
            <div className="empty-state">
              <p>Nenhum evento encontrado no sistema.</p>
            </div>
          ) : (
            <div className="table-container">
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>Nome</th>
                    <th>Data</th>
                    <th>Tipo</th>
                    <th>Categoria</th>
                    <th>Criado por</th>
                    <th>Subeventos</th>
                    <th>Ações</th>
                  </tr>
                </thead>
                <tbody>
                  {events.map((event) => (
                    <tr key={event.id}>
                      <td>
                        <strong>{event.nome}</strong>
                      </td>
                      <td>{formatDate(event.data)}</td>
                      <td>
                        <span className="type-badge principal">
                          Principal
                        </span>
                      </td>
                      <td>
                        <span className="category-badge">
                          {event.categoria}
                        </span>
                      </td>
                      <td>{event.user.name}</td>
                      <td>
                        {event.children && event.children.length > 0 ? (
                          <span className="subevent-count">
                            {event.children.length}
                          </span>
                        ) : (
                          <span className="no-subevent">0</span>
                        )}
                      </td>
                      <td>
                        <div className="action-buttons">
                          <button
                            className="btn-view"
                            onClick={() => navigate(`/eventos/${event.id}`)}
                          >
                            Ver
                          </button>
                          <button className="btn-edit">Editar</button>
                          <button className="btn-delete">Excluir</button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {!loading && !error && activeTab === 'usuarios' && (
        <div className="users-tab">
          <h2>Todos os Usuários ({users.length})</h2>
          {users.length === 0 ? (
            <div className="empty-state">
              <p>Nenhum usuário encontrado no sistema.</p>
            </div>
          ) : (
            <div className="table-container">
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>Nome</th>
                    <th>E-mail</th>
                    <th>Papel</th>
                    <th>Data de Criação</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map((user) => (
                    <tr key={user.id}>
                      <td>
                        <strong>{user.name}</strong>
                      </td>
                      <td>{user.email}</td>
                      <td>
                        <span className={`role-badge ${user.type.toLowerCase().replace(' ', '-')}`}>
                          {user.type}
                        </span>
                      </td>
                      <td>{formatCreationDate(user.createdAt)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
    </div>
  );
}