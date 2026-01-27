import React from "react";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import EventFilters from "../../components/events/EventFilters";

jest.mock("../../components/events/EventFilters.css", () => ({}));

type MockFetchResponse = Pick<Response, "ok" | "json">;

beforeEach(() => {
  const fetchMock: jest.MockedFunction<typeof fetch> = jest.fn();

  fetchMock.mockImplementation((input: RequestInfo | URL) => {
    const url = String(input);

    if (url.includes("/event-types")) {
      const res: MockFetchResponse = {
        ok: true,
        json: async () => [
          { id: 1, nome: "cultura" },
          { id: 2, nome: "turismo" },
        ],
      };
      return Promise.resolve(res as Response);
    }

    const res: MockFetchResponse = {
      ok: true,
      json: async () => ({}),
    };
    return Promise.resolve(res as Response);
  });

  Object.defineProperty(globalThis, "fetch", {
    value: fetchMock,
    writable: true,
    configurable: true,
  });
});

afterEach(() => {
  jest.restoreAllMocks();
});

describe("EventFilters (Filtros)", () => {
  test("aplica filtros e exibe indicador de filtros ativos", async () => {
    const user = userEvent.setup();
    const onFilterChange = jest.fn();

    render(<EventFilters onFilterChange={onFilterChange} />);

    // aguarda o option "cultura" existir (carregado via fetch + useEffect)
    await screen.findByRole("option", { name: "cultura" });

    // Categoria
    await user.selectOptions(screen.getByLabelText(/categoria/i), "cultura");

    // Datas (ids do componente são dataInicio e dataFim)
    await user.type(screen.getByLabelText(/data inicial/i), "2026-01-01");
    await user.type(screen.getByLabelText(/data final/i), "2026-01-31");

    // Aplicar filtros
    await user.click(
      screen.getByRole("button", { name: /aplicar filtros/i })
    );

    // deve chamar com as chaves certas
    expect(onFilterChange).toHaveBeenCalledWith({
      categoria: "cultura",
      dataInicio: "2026-01-01",
      dataFim: "2026-01-31",
    });

    // Indicador visual
    expect(screen.getByText(/filtros ativos/i)).toBeInTheDocument();

    // Botão limpar aparece quando existem filtros aplicados
    expect(
      screen.getByRole("button", { name: /limpar filtros/i })
    ).toBeInTheDocument();
  });

  test("limpa filtros e remove indicador", async () => {
    const user = userEvent.setup();
    const onFilterChange = jest.fn();

    render(<EventFilters onFilterChange={onFilterChange} />);

    await screen.findByRole("option", { name: "turismo" });

    await user.selectOptions(screen.getByLabelText(/categoria/i), "turismo");
    await user.click(
      screen.getByRole("button", { name: /aplicar filtros/i })
    );

    // agora deve existir botão limpar e indicador
    expect(screen.getByText(/filtros ativos/i)).toBeInTheDocument();

    await user.click(
      screen.getByRole("button", { name: /limpar filtros/i })
    );

    // indicador some
    expect(screen.queryByText(/filtros ativos/i)).not.toBeInTheDocument();

    // chama com valores limpos
    expect(onFilterChange).toHaveBeenLastCalledWith({
      categoria: "",
      dataInicio: "",
      dataFim: "",
    });

    // campos voltam ao default
    await waitFor(() => {
      expect(screen.getByLabelText(/categoria/i)).toHaveValue("");
      expect(screen.getByLabelText(/data inicial/i)).toHaveValue("");
      expect(screen.getByLabelText(/data final/i)).toHaveValue("");
    });
  });
});
