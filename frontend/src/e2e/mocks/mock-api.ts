import type { Page, Route } from "@playwright/test";

export type EventData = {
  id: string;
  nome: string;
  categoria: string;
  data: string;
  local?: string;
  logoUrl?: string | null;
  latitude?: number | null;
  longitude?: number | null;
  locationName?: string | null;
};

export type EventType = { id: number; nome: string };

function fulfillJson(route: Route, body: unknown, status = 200): Promise<void> {
  return route.fulfill({
    status,
    contentType: "application/json",
    body: JSON.stringify(body),
  });
}

function safeUrl(raw: string): URL {
  try {
    return new URL(raw);
  } catch {
    return new URL(raw, "http://localhost");
  }
}

function hasAnySearchParams(u: URL, keys: string[]): boolean {
  return keys.some((k) => u.searchParams.has(k));
}

export type HomeMockOptions = {
  highlights?: EventData[];
  eventTypes?: EventType[];
  mapEventsBase?: EventData[];
  failEventTypes?: boolean;
  failHighlights?: boolean;
  failMap?: boolean;
};

export async function installHomeApiMocks(page: Page, opts: HomeMockOptions = {}) {
  const highlights: EventData[] =
    opts.highlights ??
    [
      {
        id: "h1",
        nome: "Festival do Açaí",
        categoria: "gastronomia",
        data: "2026-01-20",
        locationName: "Manaus",
        latitude: -3.119,
        longitude: -60.021,
      },
    ];

  const eventTypes: EventType[] =
    opts.eventTypes ??
    [
      { id: 1, nome: "Cultura" },
      { id: 2, nome: "Gastronomia" },
    ];

  const mapEventsBase: EventData[] =
    opts.mapEventsBase ??
    [
      {
        id: "m1",
        nome: "Show Cultural",
        categoria: "cultura",
        data: "2026-01-21",
        locationName: "Teatro Amazonas",
        latitude: -3.1303,
        longitude: -60.0236,
      },
      {
        id: "m2",
        nome: "Trilha Guiada",
        categoria: "aventura",
        data: "2026-01-22",
        locationName: "Reserva",
        latitude: -3.15,
        longitude: -60.05,
      },
    ];

  // event-types
  await page.route("**/event-types", async (route) => {
    if (opts.failEventTypes) return fulfillJson(route, { message: "boom" }, 500);
    return fulfillJson(route, eventTypes);
  });

  // events/all (highlights e mapa)
  await page.route("**/events/all**", async (route) => {
    const reqUrl = safeUrl(route.request().url());

    const isHighlights =
      reqUrl.searchParams.get("limit") === "10" &&
      !hasAnySearchParams(reqUrl, ["categoria", "dataInicio", "dataFim", "nome"]);

    if (isHighlights) {
      if (opts.failHighlights) return fulfillJson(route, { message: "boom" }, 500);
      return fulfillJson(route, highlights);
    }

    if (opts.failMap) return fulfillJson(route, { message: "boom" }, 500);

    const categoria = reqUrl.searchParams.get("categoria");
    const dataInicio = reqUrl.searchParams.get("dataInicio");
    const dataFim = reqUrl.searchParams.get("dataFim");
    const nome = reqUrl.searchParams.get("nome");

    let list = [...mapEventsBase];

    if (categoria && categoria !== "todos") {
      list = list.filter((e) => e.categoria === categoria);
    }

    if (nome) {
      const term = nome.toLowerCase();
      list = list.filter((e) => e.nome.toLowerCase().includes(term));
    }

    if (dataInicio) list = list.filter((e) => e.data >= dataInicio);
    if (dataFim) list = list.filter((e) => e.data <= dataFim);

    return fulfillJson(route, list);
  });
}
