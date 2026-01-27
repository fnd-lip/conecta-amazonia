import type { User } from './admin.types';

interface AdminUsersTabProps {
  users: User[];
}

const formatCreationDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric'
  });
};

export default function AdminUsersTab({ users }: AdminUsersTabProps) {
  return (
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
                    <span
                      className={`role-badge ${user.type
                        .toLowerCase()
                        .replace(' ', '-')}`}
                    >
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
  );
}
