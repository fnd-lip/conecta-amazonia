import { act } from "react";
import { renderHook } from "@testing-library/react";
import useAdminData from "../../../pages/admin/useAdminData";
import type { NavigateFunction } from "react-router-dom";
import type { AdminTab, Event, EventType, User } from "../../../pages/admin/admin.types";

// Mock do módulo admin.api 
jest.mock("../../../pages/admin/admin.api", () => {
  class ApiError extends Error {
    status?: number;

    constructor(message: string, status?: number) {
      super(message);
      this.name = "ApiError";
      this.status = status;
    }
  }

  return {
    ApiError,
    fetchAdminEvents: jest.fn(),
    fetchAdminUsers: jest.fn(),
    fetchAdminEventTypes: jest.fn(),
    createAdminEventType: jest.fn(),
    updateAdminEventType: jest.fn(),
    deleteAdminEventType: jest.fn(),
  };
});

import {
  ApiError,
  fetchAdminEvents,
  fetchAdminUsers,
  fetchAdminEventTypes,
  createAdminEventType,
  updateAdminEventType,
  deleteAdminEventType,
} from "../../../pages/admin/admin.api";

// Tipos locais para NÃO carregar "any" nos mocks
type FetchListFn = (token: string | null) => Promise<unknown[]>;
type CreateFn = (token: string | null, nome: string) => Promise<unknown>;
type UpdateFn = (token: string | null, id: number, nome: string) => Promise<unknown>;
type DeleteFn = (token: string | null, id: number) => Promise<unknown>;

const mockedFetchAdminEvents = fetchAdminEvents as unknown as jest.MockedFunction<FetchListFn>;
const mockedFetchAdminUsers = fetchAdminUsers as unknown as jest.MockedFunction<FetchListFn>;
const mockedFetchAdminEventTypes = fetchAdminEventTypes as unknown as jest.MockedFunction<FetchListFn>;
const mockedCreateAdminEventType = createAdminEventType as unknown as jest.MockedFunction<CreateFn>;
const mockedUpdateAdminEventType = updateAdminEventType as unknown as jest.MockedFunction<UpdateFn>;
const mockedDeleteAdminEventType = deleteAdminEventType as unknown as jest.MockedFunction<DeleteFn>;

function flushMicrotasks(): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, 0));
}

describe("useAdminData", () => {
  let navigate: jest.MockedFunction<NavigateFunction>;
  let removeItemSpy: jest.SpyInstance;
  let getItemSpy: jest.SpyInstance;
  let confirmSpy: jest.SpyInstance;
  let consoleErrorSpy: jest.SpyInstance;

  beforeEach(() => {
    jest.clearAllMocks();

    navigate = jest.fn() as unknown as jest.MockedFunction<NavigateFunction>;

    // LocalStorage: use Storage.prototype 
    getItemSpy = jest.spyOn(Storage.prototype, "getItem");
    removeItemSpy = jest.spyOn(Storage.prototype, "removeItem");

    getItemSpy.mockReturnValue("token-123");

    confirmSpy = jest.spyOn(window, "confirm").mockReturnValue(true);

    consoleErrorSpy = jest.spyOn(console, "error").mockImplementation(() => undefined);
  });

  afterEach(() => {
    confirmSpy.mockRestore();
    consoleErrorSpy.mockRestore();
    getItemSpy.mockRestore();
    removeItemSpy.mockRestore();
  });

  it("estado inicial", () => {
    const { result } = renderHook(() => useAdminData(navigate));

    expect(result.current.events).toEqual([]);
    expect(result.current.users).toEqual([]);
    expect(result.current.eventTypes).toEqual([]);

    expect(result.current.newTypeName).toBe("");
    expect(result.current.editingTypeId).toBeNull();
    expect(result.current.editingTypeName).toBe("");

    expect(result.current.typeBusy).toBe(false);
    expect(result.current.loading).toBe(true);
    expect(result.current.error).toBe("");
  });

  it("fetchEvents: carrega eventos e desliga loading", async () => {
    const events = [{ id: "e1" }] as unknown as Event[];
    mockedFetchAdminEvents.mockResolvedValueOnce(events as unknown as unknown[]);

    const { result } = renderHook(() => useAdminData(navigate));

    await act(async () => {
      await result.current.fetchEvents();
      await flushMicrotasks();
    });

    expect(getItemSpy).toHaveBeenCalledWith("token");
    expect(mockedFetchAdminEvents).toHaveBeenCalledWith("token-123");
    expect(result.current.events).toEqual(events);
    expect(result.current.loading).toBe(false);
    expect(result.current.error).toBe("");
  });

  it("fetchUsers: carrega usuários e desliga loading", async () => {
    const users = [{ id: "u1" }] as unknown as User[];
    mockedFetchAdminUsers.mockResolvedValueOnce(users as unknown as unknown[]);

    const { result } = renderHook(() => useAdminData(navigate));

    await act(async () => {
      await result.current.fetchUsers();
      await flushMicrotasks();
    });

    expect(mockedFetchAdminUsers).toHaveBeenCalledWith("token-123");
    expect(result.current.users).toEqual(users);
    expect(result.current.loading).toBe(false);
    expect(result.current.error).toBe("");
  });

  it("fetchEventTypes: carrega tipos e desliga loading", async () => {
    const types = [{ id: 1, nome: "show" }] as unknown as EventType[];
    mockedFetchAdminEventTypes.mockResolvedValueOnce(types as unknown as unknown[]);

    const { result } = renderHook(() => useAdminData(navigate));

    await act(async () => {
      await result.current.fetchEventTypes();
      await flushMicrotasks();
    });

    expect(mockedFetchAdminEventTypes).toHaveBeenCalledWith("token-123");
    expect(result.current.eventTypes).toEqual(types);
    expect(result.current.loading).toBe(false);
    expect(result.current.error).toBe("");
  });

  it("handleCreateType: quando newTypeName vazio (ou só espaços) -> seta erro e não chama API", async () => {
    const { result } = renderHook(() => useAdminData(navigate));

    await act(async () => {
      result.current.setNewTypeName("   ");
    });

    await act(async () => {
      await result.current.handleCreateType();
      await flushMicrotasks();
    });

    expect(result.current.error).toBe("Informe o nome do tipo de evento.");
    expect(mockedCreateAdminEventType).not.toHaveBeenCalled();
    expect(mockedFetchAdminEventTypes).not.toHaveBeenCalled();
  });

  it("handleCreateType: cria tipo, limpa newTypeName e recarrega lista", async () => {
    mockedCreateAdminEventType.mockResolvedValueOnce({} as unknown);
    mockedFetchAdminEventTypes.mockResolvedValueOnce(
      [{ id: 1, nome: "show" }] as unknown as unknown[]
    );

    const { result } = renderHook(() => useAdminData(navigate));

    await act(async () => {
      result.current.setNewTypeName("show");
    });

    await act(async () => {
      await result.current.handleCreateType();
      await flushMicrotasks();
    });

    expect(mockedCreateAdminEventType).toHaveBeenCalledWith("token-123", "show");
    expect(mockedFetchAdminEventTypes).toHaveBeenCalledTimes(1);
    expect(result.current.newTypeName).toBe("");
    expect(result.current.typeBusy).toBe(false);
    expect(result.current.error).toBe("");
  });

  it("handleStartEditType / handleCancelEditType: controla id/nome de edição", () => {
    const type = { id: 10, nome: "feira" } as unknown as EventType;
    const { result } = renderHook(() => useAdminData(navigate));

    act(() => {
      result.current.handleStartEditType(type);
    });

    expect(result.current.editingTypeId).toBe(10);
    expect(result.current.editingTypeName).toBe("feira");
    expect(result.current.error).toBe("");

    act(() => {
      result.current.handleCancelEditType();
    });

    expect(result.current.editingTypeId).toBeNull();
    expect(result.current.editingTypeName).toBe("");
  });

  it("handleSaveEditType: se editingTypeId null -> não chama API", async () => {
    const { result } = renderHook(() => useAdminData(navigate));

    await act(async () => {
      await result.current.handleSaveEditType();
      await flushMicrotasks();
    });

    expect(mockedUpdateAdminEventType).not.toHaveBeenCalled();
  });

  it("handleSaveEditType: se nome em branco -> seta erro e não chama API", async () => {
    const type = { id: 1, nome: "show" } as unknown as EventType;
    const { result } = renderHook(() => useAdminData(navigate));

    act(() => {
      result.current.handleStartEditType(type);
    });

    act(() => {
      result.current.setEditingTypeName("   ");
    });

    await act(async () => {
      await result.current.handleSaveEditType();
      await flushMicrotasks();
    });

    expect(result.current.error).toBe("Informe o nome do tipo de evento.");
    expect(mockedUpdateAdminEventType).not.toHaveBeenCalled();
  });

  it("handleSaveEditType: atualiza, limpa edição e recarrega lista", async () => {
    mockedUpdateAdminEventType.mockResolvedValueOnce({} as unknown);
    mockedFetchAdminEventTypes.mockResolvedValueOnce(
      [{ id: 1, nome: "show novo" }] as unknown as unknown[]
    );

    const type = { id: 1, nome: "show" } as unknown as EventType;
    const { result } = renderHook(() => useAdminData(navigate));

    act(() => {
      result.current.handleStartEditType(type);
    });

    act(() => {
      result.current.setEditingTypeName("show novo");
    });

    await act(async () => {
      await result.current.handleSaveEditType();
      await flushMicrotasks();
    });

    expect(mockedUpdateAdminEventType).toHaveBeenCalledWith("token-123", 1, "show novo");
    expect(mockedFetchAdminEventTypes).toHaveBeenCalledTimes(1);

    expect(result.current.editingTypeId).toBeNull();
    expect(result.current.editingTypeName).toBe("");
    expect(result.current.typeBusy).toBe(false);
    expect(result.current.error).toBe("");
  });

  it("handleDeleteType: se confirm=false não chama API", async () => {
    confirmSpy.mockReturnValueOnce(false);

    const type = { id: 2, nome: "feira" } as unknown as EventType;
    const { result } = renderHook(() => useAdminData(navigate));

    await act(async () => {
      await result.current.handleDeleteType(type);
      await flushMicrotasks();
    });

    expect(mockedDeleteAdminEventType).not.toHaveBeenCalled();
    expect(mockedFetchAdminEventTypes).not.toHaveBeenCalled();
  });

  it("handleDeleteType: se confirm=true chama delete e recarrega lista", async () => {
    mockedDeleteAdminEventType.mockResolvedValueOnce({} as unknown);
    mockedFetchAdminEventTypes.mockResolvedValueOnce(
      [{ id: 1, nome: "show" }] as unknown as unknown[]
    );

    const type = { id: 2, nome: "feira" } as unknown as EventType;
    const { result } = renderHook(() => useAdminData(navigate));

    await act(async () => {
      await result.current.handleDeleteType(type);
      await flushMicrotasks();
    });

    expect(window.confirm).toHaveBeenCalledTimes(1);
    expect(mockedDeleteAdminEventType).toHaveBeenCalledWith("token-123", 2);
    expect(mockedFetchAdminEventTypes).toHaveBeenCalledTimes(1);
    expect(result.current.typeBusy).toBe(false);
    expect(result.current.error).toBe("");
  });

  it("erros 401/403: remove token e navega /login (fetchEvents)", async () => {
    mockedFetchAdminEvents.mockRejectedValueOnce(new ApiError("Unauthorized", 401));

    const { result } = renderHook(() => useAdminData(navigate));

    await act(async () => {
      await result.current.fetchEvents();
      await flushMicrotasks();
    });

    expect(removeItemSpy).toHaveBeenCalledWith("token");
    expect(navigate).toHaveBeenCalledWith("/login");
  });

  it("erro ApiError não-401/403: seta mensagem e não navega", async () => {
    mockedFetchAdminUsers.mockRejectedValueOnce(new ApiError("Falha qualquer", 500));

    const { result } = renderHook(() => useAdminData(navigate));

    await act(async () => {
      await result.current.fetchUsers();
      await flushMicrotasks();
    });

    expect(result.current.error).toBe("Falha qualquer");
    expect(navigate).not.toHaveBeenCalled();
  });

  it("erro desconhecido: usa fallback e não navega", async () => {
    mockedFetchAdminEventTypes.mockRejectedValueOnce(new Error("boom"));

    const { result } = renderHook(() => useAdminData(navigate));

    await act(async () => {
      await result.current.fetchEventTypes();
      await flushMicrotasks();
    });

    expect(result.current.error).toBe("Erro ao carregar tipos de evento");
    expect(navigate).not.toHaveBeenCalled();
  });

  it("loadTab chama fetch correto conforme aba", async () => {
    mockedFetchAdminEvents.mockResolvedValueOnce([] as unknown[]);
    mockedFetchAdminUsers.mockResolvedValueOnce([] as unknown[]);
    mockedFetchAdminEventTypes.mockResolvedValueOnce([] as unknown[]);

    const { result } = renderHook(() => useAdminData(navigate));

    await act(async () => {
      result.current.loadTab("eventos" as AdminTab);
      await flushMicrotasks();
    });
    expect(mockedFetchAdminEvents).toHaveBeenCalledTimes(1);

    await act(async () => {
      result.current.loadTab("usuarios" as AdminTab);
      await flushMicrotasks();
    });
    expect(mockedFetchAdminUsers).toHaveBeenCalledTimes(1);

    await act(async () => {
      result.current.loadTab("tipos" as AdminTab);
      await flushMicrotasks();
    });
    expect(mockedFetchAdminEventTypes).toHaveBeenCalledTimes(1);
  });
});
