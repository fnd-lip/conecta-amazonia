import {
  ApiError,
  fetchAdminEvents,
  fetchAdminUsers,
  fetchAdminEventTypes,
  createAdminEventType,
  updateAdminEventType,
  deleteAdminEventType,
} from "../../../pages/admin/admin.api";

type FetchResponse = {
  ok: boolean;
  status: number;
  json: () => Promise<unknown>;
};

function mockFetchOnce(res: Partial<FetchResponse>) {
  (global.fetch as jest.Mock).mockResolvedValueOnce({
    ok: true,
    status: 200,
    json: async () => ({}),
    ...res,
  });
}

describe("admin.api.ts", () => {
  beforeEach(() => {
    jest.resetAllMocks();
    global.fetch = jest.fn();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it("fetchAdminEvents: chama endpoint correto e retorna json", async () => {
    const data = [{ id: "1", nome: "Evento" }];
    mockFetchOnce({ ok: true, status: 200, json: async () => data });

    const result = await fetchAdminEvents("token123");

    expect(global.fetch).toHaveBeenCalledTimes(1);
    expect(global.fetch).toHaveBeenCalledWith(
      "http://localhost:3001/admin/events",
      expect.objectContaining({
        headers: expect.objectContaining({
          Authorization: "Bearer token123",
          "Content-Type": "application/json",
        }),
      })
    );
    expect(result).toEqual(data);
  });

  it("fetchAdminUsers: chama endpoint correto e retorna json", async () => {
    const data = [{ id: "u1" }];
    mockFetchOnce({ ok: true, status: 200, json: async () => data });

    const result = await fetchAdminUsers("tok");

    expect(global.fetch).toHaveBeenCalledWith(
      "http://localhost:3001/admin/users",
      expect.any(Object)
    );
    expect(result).toEqual(data);
  });

  it("fetchAdminEventTypes: chama endpoint correto e retorna json", async () => {
    const data = [{ id: 1, nome: "Show" }];
    mockFetchOnce({ ok: true, status: 200, json: async () => data });

    const result = await fetchAdminEventTypes("tok");

    expect(global.fetch).toHaveBeenCalledWith(
      "http://localhost:3001/admin/event-types",
      expect.any(Object)
    );
    expect(result).toEqual(data);
  });

  it("createAdminEventType: envia POST com body e retorna json", async () => {
    const data = { id: 10, nome: "Feira" };
    mockFetchOnce({ ok: true, status: 200, json: async () => data });

    const result = await createAdminEventType("tok", "Feira");

    expect(global.fetch).toHaveBeenCalledWith(
      "http://localhost:3001/admin/event-types",
      expect.objectContaining({
        method: "POST",
        headers: expect.objectContaining({
          Authorization: "Bearer tok",
          "Content-Type": "application/json",
        }),
        body: JSON.stringify({ nome: "Feira" }),
      })
    );
    expect(result).toEqual(data);
  });

  it("updateAdminEventType: envia PUT com id no path e body", async () => {
    const data = { id: 7, nome: "Atualizado" };
    mockFetchOnce({ ok: true, status: 200, json: async () => data });

    const result = await updateAdminEventType("tok", 7, "Atualizado");

    expect(global.fetch).toHaveBeenCalledWith(
      "http://localhost:3001/admin/event-types/7",
      expect.objectContaining({
        method: "PUT",
        headers: expect.objectContaining({
          Authorization: "Bearer tok",
          "Content-Type": "application/json",
        }),
        body: JSON.stringify({ nome: "Atualizado" }),
      })
    );
    expect(result).toEqual(data);
  });

  it("deleteAdminEventType: envia DELETE com id no path", async () => {
    const data = { ok: true };
    mockFetchOnce({ ok: true, status: 200, json: async () => data });

    const result = await deleteAdminEventType("tok", 3);

    expect(global.fetch).toHaveBeenCalledWith(
      "http://localhost:3001/admin/event-types/3",
      expect.objectContaining({
        method: "DELETE",
        headers: expect.objectContaining({
          Authorization: "Bearer tok",
          "Content-Type": "application/json",
        }),
      })
    );
    expect(result).toEqual(data);
  });

  it("401/403: lança ApiError('Unauthorized') com status", async () => {
    mockFetchOnce({ ok: false, status: 401, json: async () => ({}) });

    try {
      await fetchAdminEvents("tok");
      throw new Error("expected to throw");
    } catch (e) {
      expect(e).toBeInstanceOf(ApiError);
      const err = e as ApiError;
      expect(err.message).toBe("Unauthorized");
      expect(err.status).toBe(401);
    }

    mockFetchOnce({ ok: false, status: 403, json: async () => ({}) });

    try {
      await fetchAdminUsers("tok");
      throw new Error("expected to throw");
    } catch (e) {
      expect(e).toBeInstanceOf(ApiError);
      const err = e as ApiError;
      expect(err.message).toBe("Unauthorized");
      expect(err.status).toBe(403);
    }
  });

  it("erro não-ok: usa message vindo do json quando existir", async () => {
    mockFetchOnce({
      ok: false,
      status: 500,
      json: async () => ({ message: "Falhou geral" }),
    });

    try {
      await fetchAdminEventTypes("tok");
      throw new Error("expected to throw");
    } catch (e) {
      expect(e).toBeInstanceOf(ApiError);
      const err = e as ApiError;
      expect(err.message).toBe("Falhou geral");
      expect(err.status).toBe(500);
    }
  });

  it("erro não-ok: quando json() falha, usa fallbackMessage", async () => {
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: false,
      status: 400,
      json: async () => {
        throw new Error("json inválido");
      },
    });

    try {
      await fetchAdminUsers("tok");
      throw new Error("expected to throw");
    } catch (e) {
      expect(e).toBeInstanceOf(ApiError);
      const err = e as ApiError;
      expect(err.message).toBe("Erro ao carregar usuários");
      expect(err.status).toBe(400);
    }
  });

  it("ApiError guarda status quando passado no construtor", () => {
    const err = new ApiError("msg", 418);
    expect(err.message).toBe("msg");
    expect(err.status).toBe(418);
    expect(err.name).toBe("Error"); // default do Error
  });

  it("token null ainda monta header Bearer null (comportamento atual)", async () => {
    mockFetchOnce({ ok: true, status: 200, json: async () => [] });

    await fetchAdminEvents(null);

    expect(global.fetch).toHaveBeenCalledWith(
      "http://localhost:3001/admin/events",
      expect.objectContaining({
        headers: expect.objectContaining({
          Authorization: "Bearer null",
        }),
      })
    );
  });
});
