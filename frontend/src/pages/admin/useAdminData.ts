import { useCallback, useState } from 'react';
import type { NavigateFunction } from 'react-router-dom';
import {
  ApiError,
  createAdminEventType,
  deleteAdminEventType,
  fetchAdminEventTypes,
  fetchAdminEvents,
  fetchAdminUsers,
  updateAdminEventType,
} from './admin.api';
import type { AdminTab, Event, EventType, User } from './admin.types';

export default function useAdminData(navigate: NavigateFunction) {
  const [events, setEvents] = useState<Event[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [eventTypes, setEventTypes] = useState<EventType[]>([]);
  const [newTypeName, setNewTypeName] = useState('');
  const [editingTypeId, setEditingTypeId] = useState<number | null>(null);
  const [editingTypeName, setEditingTypeName] = useState('');
  const [typeBusy, setTypeBusy] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const handleUnauthorized = () => {
    localStorage.removeItem('token');
    navigate('/login');
  };

  const handleApiError = (err: unknown, fallback: string) => {
    if (err instanceof ApiError && (err.status === 401 || err.status === 403)) {
      handleUnauthorized();
      return;
    }
    const message = err instanceof ApiError ? err.message : fallback;
    setError(message);
    console.error(err);
  };

  const fetchEvents = useCallback(async () => {
    try {
      setLoading(true);
      setError('');
      // A API já pega o token internamente agora
      const data = await fetchAdminEvents();
      setEvents(Array.isArray(data) ? (data as Event[]) : []);
    } catch (err) {
      handleApiError(err, 'Erro ao carregar eventos');
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchUsers = useCallback(async () => {
    try {
      setLoading(true);
      setError('');
      const data = await fetchAdminUsers();
      setUsers(Array.isArray(data) ? (data as User[]) : []);
    } catch (err) {
      handleApiError(err, 'Erro ao carregar usuários');
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchEventTypes = useCallback(async () => {
    try {
      setLoading(true);
      setError('');
      const data = await fetchAdminEventTypes();
      setEventTypes(Array.isArray(data) ? (data as EventType[]) : []);
    } catch (err) {
      handleApiError(err, 'Erro ao carregar tipos de evento');
    } finally {
      setLoading(false);
    }
  }, []);

  const handleCreateType = useCallback(async () => {
    const nome = newTypeName.trim();
    if (!nome) {
      setError('Informe o nome do tipo de evento.');
      return;
    }

    try {
      setTypeBusy(true);
      setError('');

      await createAdminEventType(nome);
      setNewTypeName('');
      await fetchEventTypes();
    } catch (err) {
      handleApiError(err, 'Erro ao criar tipo de evento');
    } finally {
      setTypeBusy(false);
    }
  }, [newTypeName, fetchEventTypes]);

  const handleStartEditType = (type: EventType) => {
    setEditingTypeId(type.id);
    setEditingTypeName(type.nome);
    setError('');
  };

  const handleCancelEditType = () => {
    setEditingTypeId(null);
    setEditingTypeName('');
  };

  const handleSaveEditType = useCallback(async () => {
    if (editingTypeId === null) return;
    const nome = editingTypeName.trim();
    if (!nome) {
      setError('Informe o nome do tipo de evento.');
      return;
    }

    try {
      setTypeBusy(true);
      setError('');
      await updateAdminEventType(editingTypeId, nome);
      setEditingTypeId(null);
      setEditingTypeName('');
      await fetchEventTypes();
    } catch (err) {
      handleApiError(err, 'Erro ao atualizar tipo de evento');
    } finally {
      setTypeBusy(false);
    }
  }, [editingTypeId, editingTypeName, fetchEventTypes]);

  const handleDeleteType = useCallback(
    async (type: EventType) => {
      const confirmed = window.confirm(
        `Excluir o tipo "${type.nome}"? Essa ação não pode ser desfeita.`
      );
      if (!confirmed) return;

      try {
        setTypeBusy(true);
        setError('');
        await deleteAdminEventType(type.id);
        await fetchEventTypes();
      } catch (err) {
        handleApiError(err, 'Erro ao excluir tipo de evento');
      } finally {
        setTypeBusy(false);
      }
    },
    [fetchEventTypes]
  );

  const loadTab = useCallback(
    (tab: AdminTab) => {
      if (tab === 'eventos') {
        fetchEvents();
      } else if (tab === 'usuarios') {
        fetchUsers();
      } else {
        fetchEventTypes();
      }
    },
    [fetchEvents, fetchUsers, fetchEventTypes]
  );

  return {
    events,
    users,
    eventTypes,
    newTypeName,
    editingTypeId,
    editingTypeName,
    typeBusy,
    loading,
    error,
    setNewTypeName,
    setEditingTypeName,
    fetchEvents,
    fetchUsers,
    fetchEventTypes,
    handleCreateType,
    handleStartEditType,
    handleCancelEditType,
    handleSaveEditType,
    handleDeleteType,
    loadTab,
    setError,
    setLoading,
  };
}
