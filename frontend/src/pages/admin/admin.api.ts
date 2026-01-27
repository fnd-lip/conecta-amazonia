// src/services/admin.api.ts
import type { Event, User, EventType } from './admin.types';
import { getToken } from '../../auth-utils';

export class ApiError extends Error {
  status?: number;

  constructor(message: string, status?: number) {
    super(message);
    this.status = status;
  }
}

function getAuthHeaders() {
  const token = getToken();
  return {
    Authorization: `Bearer ${token}`,
    'Content-Type': 'application/json',
  };
}

async function request<T>(
  url: string,
  options: RequestInit,
  fallbackMessage: string
) {
  const response = await fetch(url, options);

  if (response.status === 401 || response.status === 403) {
    throw new ApiError(
      'Não autorizado. Faça login novamente.',
      response.status
    );
  }

  if (!response.ok) {
    let message = fallbackMessage;
    try {
      const data = await response.json();
      message = data?.message || fallbackMessage;
    } catch {}
    throw new ApiError(message, response.status);
  }

  return response.json() as Promise<T>;
}

export async function fetchAdminEvents() {
  return request<Event[]>(
    'http://localhost:3001/admin/events',
    {
      headers: getAuthHeaders(),
    },
    'Erro ao carregar eventos'
  );
}

export async function fetchAdminUsers() {
  return request<User[]>(
    'http://localhost:3001/admin/users',
    {
      headers: getAuthHeaders(),
    },
    'Erro ao carregar usuários'
  );
}

export async function fetchAdminEventTypes() {
  return request<EventType[]>(
    'http://localhost:3001/admin/event-types',
    {
      headers: getAuthHeaders(),
    },
    'Erro ao carregar tipos de evento'
  );
}

export async function createAdminEventType(nome: string) {
  return request(
    'http://localhost:3001/admin/event-types',
    {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify({ nome }),
    },
    'Erro ao criar tipo de evento'
  );
}

export async function updateAdminEventType(id: number, nome: string) {
  return request(
    `http://localhost:3001/admin/event-types/${id}`,
    {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify({ nome }),
    },
    'Erro ao atualizar tipo de evento'
  );
}

export async function deleteAdminEventType(id: number) {
  return request(
    `http://localhost:3001/admin/event-types/${id}`,
    {
      method: 'DELETE',
      headers: getAuthHeaders(),
    },
    'Erro ao excluir tipo de evento'
  );
}
