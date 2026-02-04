export type ApiEvent = {
  id: string;
  nome: string;
  categoria?: string;
  data: string;
  descricao?: string;
};

export async function fetchCalendarEvents(params: { startDateISO: string; endDateISO: string }) {
  const url = `http://localhost:3001/events/calendar?start=${params.startDateISO}&end=${params.endDateISO}`;

  const res = await fetch(url);

  if (!res.ok) {
    throw new Error(`HTTP ${res.status}`);
  }

  const data = (await res.json()) as ApiEvent[];

  if (Array.isArray(data)) {
    return data;
  }

  return [];
}
