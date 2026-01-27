import React, { act } from "react";
import {
  cleanup,
  fireEvent,
  render,
  screen,
  waitFor,
} from "@testing-library/react";
import {
  EventAutocomplete,
  AutocompleteEvent,
} from "../../../components/events/EventAutocomplete";

// Mocks dos componentes UI 
type InputProps = {
  placeholder?: string;
  className?: string;
  value?: string;
  onChange?: React.ChangeEventHandler<HTMLInputElement>;
  onKeyDown?: React.KeyboardEventHandler<HTMLInputElement>;
};

jest.mock("@/components/ui/input", () => {
  return {
    __esModule: true,
    Input: (props: InputProps) => <input data-testid="input" {...props} />,
  };
});

type ButtonProps = {
  children?: React.ReactNode;
  onClick?: React.MouseEventHandler<HTMLButtonElement>;
  className?: string;
  size?: string;
};

jest.mock("@/components/ui/button", () => {
  return {
    __esModule: true,
    Button: (props: ButtonProps) => (
      <button
        type="button"
        data-testid="button"
        onClick={props.onClick}
        className={props.className}
      >
        {props.children}
      </button>
    ),
  };
});

// Mocks dos ícones 
jest.mock("lucide-react", () => {
  return {
    __esModule: true,
    Search: () => <span data-testid="icon-search" />,
    Loader2: (props: { className?: string }) => (
      <span data-testid="icon-loader" className={props.className} />
    ),
  };
});

// Helper p/ mock de fetch tipado 
type JsonValue = unknown;
type FetchResponse = {
  ok: boolean;
  json: () => Promise<JsonValue>;
};

function mockFetchOnce(response: FetchResponse): void {
  const fetchMock = global.fetch as unknown as jest.Mock;
  fetchMock.mockResolvedValueOnce(response);
}

async function flushMicrotasks(): Promise<void> {
  await act(async () => {
    await Promise.resolve();
  });
}

async function advanceDebounce(ms = 200): Promise<void> {
  await act(async () => {
    jest.advanceTimersByTime(ms);
  });
  await flushMicrotasks();
}

beforeEach(() => {
  jest.useFakeTimers();
  global.fetch = jest.fn();
});

afterEach(() => {
  cleanup();
  jest.clearAllMocks();
  jest.useRealTimers();
});

describe("EventAutocomplete", () => {
  it("renderiza o input e o botão de busca", () => {
    render(
      <EventAutocomplete
        onSelectSuggestion={jest.fn()}
        onSearchSubmit={jest.fn()}
      />
    );

    expect(screen.getByTestId("input")).toBeInTheDocument();
    expect(screen.getByTestId("button")).toBeInTheDocument();
    expect(screen.getByTestId("icon-search")).toBeInTheDocument();
  });

  it("não faz fetch quando query tem menos de 2 caracteres", async () => {
    render(
      <EventAutocomplete
        onSelectSuggestion={jest.fn()}
        onSearchSubmit={jest.fn()}
      />
    );

    fireEvent.change(screen.getByTestId("input"), { target: { value: "a" } });

    await advanceDebounce(200);

    expect(global.fetch).not.toHaveBeenCalled();
  });

  it("faz fetch após 200ms quando query >= 2 e mostra sugestões", async () => {
    const suggestions: AutocompleteEvent[] = [
      {
        id: "1",
        nome: "Festival de Música",
        categoria: "show",
        data: "2026-01-10T00:00:00.000Z",
        locationName: "Manaus",
      },
      {
        id: "2",
        nome: "Feira Gastronômica",
        categoria: "feira",
        data: "2026-01-12T00:00:00.000Z",
        locationName: null,
      },
    ];

    mockFetchOnce({
      ok: true,
      json: async () => suggestions,
    });

    render(
      <EventAutocomplete
        onSelectSuggestion={jest.fn()}
        onSearchSubmit={jest.fn()}
      />
    );

    fireEvent.change(screen.getByTestId("input"), { target: { value: "fe" } });

    expect(global.fetch).not.toHaveBeenCalled();

    await advanceDebounce(200);

    expect(global.fetch).toHaveBeenCalledTimes(1);
    expect(global.fetch).toHaveBeenCalledWith(
      "http://localhost:3001/events/search?q=fe"
    );

    expect(await screen.findByText("Festival de Música")).toBeInTheDocument();
    expect(await screen.findByText("Feira Gastronômica")).toBeInTheDocument();

    // Texto real é "show"/"feira" 
    expect(screen.getByText("show")).toBeInTheDocument();
    expect(screen.getByText("feira")).toBeInTheDocument();

    expect(screen.getByText(/Local não informado/i)).toBeInTheDocument();
  });

  it("mostra loader durante a busca e esconde ao finalizar", async () => {
    const suggestions: AutocompleteEvent[] = [
      {
        id: "1",
        nome: "Evento X",
        categoria: "x",
        data: "2026-01-10T00:00:00.000Z",
        locationName: "Centro",
      },
    ];

    let resolveFetch: ((v: FetchResponse) => void) | null = null;

    (global.fetch as unknown as jest.Mock).mockImplementationOnce(
      () =>
        new Promise<FetchResponse>((resolve) => {
          resolveFetch = resolve;
        })
    );

    render(
      <EventAutocomplete
        onSelectSuggestion={jest.fn()}
        onSearchSubmit={jest.fn()}
      />
    );

    fireEvent.change(screen.getByTestId("input"), { target: { value: "ev" } });

    await advanceDebounce(200);

    await waitFor(() => {
      expect(screen.getByTestId("icon-loader")).toBeInTheDocument();
    });

    resolveFetch?.({
      ok: true,
      json: async () => suggestions,
    });

    await flushMicrotasks();

    await waitFor(() => {
      expect(screen.queryByTestId("icon-loader")).not.toBeInTheDocument();
    });

    expect(screen.getByText("Evento X")).toBeInTheDocument();
  });

  it("ao clicar numa sugestão chama onSelectSuggestion e preenche o input", async () => {
    const onSelectSuggestion = jest.fn();
    const onSearchSubmit = jest.fn();

    const suggestions: AutocompleteEvent[] = [
      {
        id: "1",
        nome: "Evento Clique",
        categoria: "show",
        data: "2026-01-10T00:00:00.000Z",
        locationName: "Manaus",
      },
    ];

    mockFetchOnce({
      ok: true,
      json: async () => suggestions,
    });

    render(
      <EventAutocomplete
        onSelectSuggestion={onSelectSuggestion}
        onSearchSubmit={onSearchSubmit}
      />
    );

    const input = screen.getByTestId("input") as HTMLInputElement;

    fireEvent.change(input, { target: { value: "ev" } });
    await advanceDebounce(200);

    expect(await screen.findByText("Evento Clique")).toBeInTheDocument();

    fireEvent.click(screen.getByText("Evento Clique"));

    expect(onSelectSuggestion).toHaveBeenCalledTimes(1);
    expect(onSelectSuggestion).toHaveBeenCalledWith(suggestions[0]);

    expect(input.value).toBe("Evento Clique");
    expect(screen.queryByText("Evento Clique")).not.toBeInTheDocument();
  });

  it("ao pressionar Enter chama onSearchSubmit com o termo atual e esconde sugestões", async () => {
    const onSearchSubmit = jest.fn();

    const suggestions: AutocompleteEvent[] = [
      {
        id: "1",
        nome: "Evento Enter",
        categoria: "show",
        data: "2026-01-10T00:00:00.000Z",
        locationName: "Manaus",
      },
    ];

    mockFetchOnce({
      ok: true,
      json: async () => suggestions,
    });

    render(
      <EventAutocomplete
        onSelectSuggestion={jest.fn()}
        onSearchSubmit={onSearchSubmit}
      />
    );

    const input = screen.getByTestId("input") as HTMLInputElement;

    fireEvent.change(input, { target: { value: "en" } });
    await advanceDebounce(200);

    expect(await screen.findByText("Evento Enter")).toBeInTheDocument();

    fireEvent.keyDown(input, { key: "Enter" });

    expect(onSearchSubmit).toHaveBeenCalledTimes(1);
    expect(onSearchSubmit).toHaveBeenCalledWith("en");

    expect(screen.queryByText("Evento Enter")).not.toBeInTheDocument();
  });

  it("ao clicar no botão chama onSearchSubmit com o termo atual e esconde sugestões", async () => {
    const onSearchSubmit = jest.fn();

    const suggestions: AutocompleteEvent[] = [
      {
        id: "1",
        nome: "Evento Botão",
        categoria: "show",
        data: "2026-01-10T00:00:00.000Z",
        locationName: "Manaus",
      },
    ];

    mockFetchOnce({
      ok: true,
      json: async () => suggestions,
    });

    render(
      <EventAutocomplete
        onSelectSuggestion={jest.fn()}
        onSearchSubmit={onSearchSubmit}
      />
    );

    const input = screen.getByTestId("input") as HTMLInputElement;

    fireEvent.change(input, { target: { value: "bo" } });
    await advanceDebounce(200);

    expect(await screen.findByText("Evento Botão")).toBeInTheDocument();

    fireEvent.click(screen.getByTestId("button"));

    expect(onSearchSubmit).toHaveBeenCalledTimes(1);
    expect(onSearchSubmit).toHaveBeenCalledWith("bo");

    expect(screen.queryByText("Evento Botão")).not.toBeInTheDocument();
  });

  it("quando limpa o input (value = '') chama onSearchSubmit('') imediatamente", () => {
    const onSearchSubmit = jest.fn();

    render(
      <EventAutocomplete
        onSelectSuggestion={jest.fn()}
        onSearchSubmit={onSearchSubmit}
      />
    );

    const input = screen.getByTestId("input");

    fireEvent.change(input, { target: { value: "ab" } });
    fireEvent.change(input, { target: { value: "" } });

    expect(onSearchSubmit).toHaveBeenCalledWith("");
  });

  it("se o fetch retornar ok=false não mostra sugestões", async () => {
    mockFetchOnce({
      ok: false,
      json: async () => [],
    });

    render(
      <EventAutocomplete
        onSelectSuggestion={jest.fn()}
        onSearchSubmit={jest.fn()}
      />
    );

    fireEvent.change(screen.getByTestId("input"), { target: { value: "zz" } });
    await advanceDebounce(200);

    expect(global.fetch).toHaveBeenCalledTimes(1);

    expect(screen.queryByText(/Local não informado/i)).not.toBeInTheDocument();
  });
});
