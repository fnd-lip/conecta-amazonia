import type { Event } from './admin.types';

interface AdminEventsTabProps {
  events: Event[];
  onView: (id: string) => void;
}

const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
};

const formatCategory = (value?: string | null) => {
  if (!value) return '';
  return value.charAt(0).toUpperCase() + value.slice(1);
};

export default function AdminEventsTab({ events, onView }: AdminEventsTabProps) {
  return (
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
                    <span className="type-badge principal">Principal</span>
                  </td>
                  <td>
                    <span className="category-badge">
                      {formatCategory(event.categoria)}
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
                        onClick={() => onView(event.id)}
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
  );
}
