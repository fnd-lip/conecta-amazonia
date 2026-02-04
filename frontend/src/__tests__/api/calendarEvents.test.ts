import { fetchCalendarEvents } from "../../api/calendarEvents";

describe("fetchCalendarEvents", () => {
  beforeEach(() => {
    jest.restoreAllMocks();
  });

  test("faz fetch na URL correta e retorna array quando a resposta é um array", async () => {
    const startDateISO = "2026-01-01T00:00:00.000Z";
    const endDateISO = "2026-01-31T23:59:59.000Z";

    const payload = [
      { id: "1", nome: "Evento A", data: "2026-01-10T10:00:00.000Z" },
      { id: "2", nome: "Evento B", data: "2026-01-11T11:00:00.000Z" },
    ];

    const fetchSpy = jest.spyOn(globalThis, "fetch").mockResolvedValueOnce({
      ok: true,
      status: 200,
      json: async () => payload,
    } as unknown as Response);

    const result = await fetchCalendarEvents({ startDateISO, endDateISO });

    expect(fetchSpy).toHaveBeenCalledTimes(1);
    expect(fetchSpy).toHaveBeenCalledWith(
      `http://localhost:3001/events/calendar?start=${startDateISO}&end=${endDateISO}`
    );

    expect(result).toEqual(payload);
  });

  test("lança erro quando res.ok é false (HTTP status)", async () => {
    const startDateISO = "2026-01-01T00:00:00.000Z";
    const endDateISO = "2026-01-31T23:59:59.000Z";

    jest.spyOn(globalThis, "fetch").mockResolvedValueOnce({
      ok: false,
      status: 500,
      json: async () => ({ message: "fail" }),
    } as unknown as Response);

    await expect(
      fetchCalendarEvents({ startDateISO, endDateISO })
    ).rejects.toThrow("HTTP 500");
  });

  test("retorna array vazio quando o json não é um array", async () => {
    const startDateISO = "2026-01-01T00:00:00.000Z";
    const endDateISO = "2026-01-31T23:59:59.000Z";

    jest.spyOn(globalThis, "fetch").mockResolvedValueOnce({
      ok: true,
      status: 200,
      json: async () => ({ not: "an array" }),
    } as unknown as Response);

    const result = await fetchCalendarEvents({ startDateISO, endDateISO });

    expect(result).toEqual([]);
  });
});
