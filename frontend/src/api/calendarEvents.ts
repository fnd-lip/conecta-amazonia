import { API_URL } from '../config/api';

export type ApiEvent = {
  id: string;
  nome: string;
  categoria?: string;
  data: string;
  descricao?: string;
};

export async function fetchCalendarEvents(params: {
  startDateISO: string;
  endDateISO: string;
}) {
  const url = `${API_URL}/events/calendar?start=${encodeURIComponent(
    params.startDateISO
  )}&end=${encodeURIComponent(params.endDateISO)}`;

  const res = await fetch(url);

  if (!res.ok) {
    throw new Error(`HTTP ${res.status}`);
  }

  const data = (await res.json()) as ApiEvent[];

  return Array.isArray(data) ? data : [];
}
