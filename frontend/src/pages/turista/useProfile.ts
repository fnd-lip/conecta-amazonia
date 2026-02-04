import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import type { UserData, ProfileFormData } from './profile.schema';
import { API_URL } from '@/config/api';


interface UpdateProfilePayload {
  name?: string;
  email?: string;
  password?: string;
}

export function useProfile() {
  const [user, setUser] = useState<UserData | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const navigate = useNavigate();

  const getToken = () => localStorage.getItem('token');

  const fetchUser = useCallback(async () => {
    try {
      const token = getToken();
      if (!token) {
        navigate('/login');
        return;
      }

      setLoading(true);
      setError('');

      const response = await fetch(`${API_URL}/users/me`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        let message = 'Erro ao carregar perfil';

        if (
          response.headers.get('content-type')?.includes('application/json')
        ) {
          const data = await response.json();
          message = data.message || message;
        }

        throw new Error(message);
      }

      const data: UserData = await response.json();
      setUser(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao carregar perfil');
    } finally {
      setLoading(false);
    }
  }, [navigate]);

  const updateUser = async (values: ProfileFormData) => {
    if (!user) return false;

    try {
      const token = getToken();
      if (!token) {
        navigate('/login');
        return false;
      }

      setSaving(true);
      setError('');

      const payload: UpdateProfilePayload = {
        ...(values.name ? { name: values.name } : {}),
        ...(values.email ? { email: values.email } : {}),
        ...(values.password ? { password: values.password } : {}),
      };

      const response = await fetch(`${API_URL}/users`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Erro ao atualizar perfil');
      }

      await fetchUser();
      return true;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao atualizar perfil');
      return false;
    } finally {
      setSaving(false);
    }
  };

  const deleteAccount = async () => {
    try {
      const token = getToken();
      if (!token) {
        navigate('/login');
        return;
      }

      const confirmed = window.confirm(
        'Tem certeza que deseja excluir sua conta? Essa ação é irreversível.'
      );

      if (!confirmed) return;

      const response = await fetch(`${API_URL}/users`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Erro ao excluir conta');
      }

      localStorage.removeItem('token');
      navigate('/login');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao excluir conta');
    }
  };

  useEffect(() => {
    fetchUser();
  }, [fetchUser]);

  return {
    user,
    loading,
    saving,
    error,
    updateUser,
    deleteAccount,
  };
}
