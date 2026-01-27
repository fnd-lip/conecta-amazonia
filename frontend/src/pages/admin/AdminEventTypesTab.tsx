import type { EventType } from './admin.types';

interface AdminEventTypesTabProps {
  eventTypes: EventType[];
  newTypeName: string;
  editingTypeId: number | null;
  editingTypeName: string;
  typeBusy: boolean;
  onNewTypeNameChange: (value: string) => void;
  onEditingTypeNameChange: (value: string) => void;
  onCreate: () => void;
  onStartEdit: (type: EventType) => void;
  onCancelEdit: () => void;
  onSaveEdit: () => void;
  onDelete: (type: EventType) => void;
}

const formatTypeName = (value?: string | null) => {
  if (!value) return '';
  return value.charAt(0).toUpperCase() + value.slice(1);
};

export default function AdminEventTypesTab({
  eventTypes,
  newTypeName,
  editingTypeId,
  editingTypeName,
  typeBusy,
  onNewTypeNameChange,
  onEditingTypeNameChange,
  onCreate,
  onStartEdit,
  onCancelEdit,
  onSaveEdit,
  onDelete,
}: AdminEventTypesTabProps) {
  return (
    <div className="types-tab">
      <h2>Tipos de Evento ({eventTypes.length})</h2>

      <div className="type-form">
        <input
          type="text"
          placeholder="Novo tipo de evento"
          value={newTypeName}
          onChange={(e) => onNewTypeNameChange(e.target.value)}
          disabled={typeBusy}
        />
        <button className="btn-primary" onClick={onCreate} disabled={typeBusy}>
          {typeBusy ? 'Salvando...' : 'Adicionar'}
        </button>
      </div>

      {eventTypes.length === 0 ? (
        <div className="empty-state">
          <p>Nenhum tipo de evento cadastrado.</p>
        </div>
      ) : (
        <div className="table-container">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Nome</th>
                <th>Ações</th>
              </tr>
            </thead>
            <tbody>
              {eventTypes.map((type) => (
                <tr key={type.id}>
                  <td>
                    {editingTypeId === type.id ? (
                      <input
                        className="inline-input"
                        value={editingTypeName}
                        onChange={(e) =>
                          onEditingTypeNameChange(e.target.value)
                        }
                        disabled={typeBusy}
                      />
                    ) : (
                      <strong>{formatTypeName(type.nome)}</strong>
                    )}
                  </td>
                  <td>
                    <div className="action-buttons">
                      {editingTypeId === type.id ? (
                        <>
                          <button
                            className="btn-save"
                            onClick={onSaveEdit}
                            disabled={typeBusy}
                          >
                            Salvar
                          </button>
                          <button
                            className="btn-cancel"
                            onClick={onCancelEdit}
                            disabled={typeBusy}
                          >
                            Cancelar
                          </button>
                        </>
                      ) : (
                        <>
                          <button
                            className="btn-edit"
                            onClick={() => onStartEdit(type)}
                            disabled={typeBusy}
                          >
                            Editar
                          </button>
                          <button
                            className="btn-delete"
                            onClick={() => onDelete(type)}
                            disabled={typeBusy}
                          >
                            Excluir
                          </button>
                        </>
                      )}
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
