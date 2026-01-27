import React from "react";
import {
  fireEvent,
  render,
  screen,
  waitFor,
  within,
} from "@testing-library/react";
import TicketLotManager from "../../../components/events/TicketLotManager";

type FetchArgs = [input: RequestInfo | URL, init?: RequestInit];

function respOkJson(data: unknown): Response {
  return {
    ok: true,
    status: 200,
    json: async () => data,
  } as unknown as Response;
}

function respFail(status = 500): Response {
  return {
    ok: false,
    status,
    json: async () => ({}),
  } as unknown as Response;
}

function setFetchMock(
  impl: (url: string, init?: RequestInit) => Promise<Response> | Response
) {
  global.fetch = (jest.fn(async (...args: FetchArgs) => {
    const url = String(args[0]);
    const init = args[1];
    return impl(url, init);
  }) as unknown) as typeof fetch;
}

async function waitSubmitEnabled() {
  await waitFor(() => {
    const btn = screen.getByRole("button", {
      name: /Adicionar Lote|Atualizar Lote|Salvando\.\.\./i,
    });
    expect(btn).toBeInTheDocument();
    expect(btn).not.toBeDisabled();
  });
}

describe("TicketLotManager", () => {
  beforeEach(() => {
    jest.restoreAllMocks();
    localStorage.clear();
    localStorage.setItem("token", "tok_test");
  });

  it("quando eventId é null, mostra mensagem informativa e não renderiza form/tabela", () => {
    render(<TicketLotManager eventId={null} />);

    expect(screen.getByText(/Salve o evento primeiro/i)).toBeInTheDocument();

    expect(
      screen.queryByRole("heading", { name: /Lotes de Ingressos/i })
    ).not.toBeInTheDocument();
    expect(
      screen.queryByPlaceholderText(/Ex:\s*1º Lote/i)
    ).not.toBeInTheDocument();
    expect(screen.queryByRole("table")).not.toBeInTheDocument();
  });

  it("carrega lotes (GET) quando eventId existe e mostra tabela", async () => {
    setFetchMock(async (url) => {
      if (url.includes("/event-ticket-lot/ev1/tickets/lots")) {
        return respOkJson([
          { id: "l1", name: "1º Lote", price: 50, quantity: 100, active: true },
          { id: "l2", name: "VIP", price: 120.5, quantity: 20, active: false },
        ]);
      }
      return respOkJson([]);
    });

    render(<TicketLotManager eventId="ev1" />);

    const table = await screen.findByRole("table");
    const t = within(table);

    expect(t.getByText("1º Lote")).toBeInTheDocument();
    expect(t.getByText("VIP")).toBeInTheDocument();

    expect(t.getByText("Ativo")).toBeInTheDocument();
    expect(t.getByText("Inativo")).toBeInTheDocument();

    await waitSubmitEnabled();
  });

  it("onLotsChange é chamado quando os lotes são carregados", async () => {
    const onLotsChange = jest.fn();

    setFetchMock(async (url) => {
      if (url.includes("/event-ticket-lot/ev1/tickets/lots")) {
        return respOkJson([
          { id: "l1", name: "1º Lote", price: 10, quantity: 2, active: true },
        ]);
      }
      return respOkJson([]);
    });

    render(<TicketLotManager eventId="ev1" onLotsChange={onLotsChange} />);

    await screen.findByText("1º Lote");

    await waitFor(() => {
      expect(onLotsChange).toHaveBeenCalled();
      const calls = onLotsChange.mock.calls;
      const lastArg = calls[calls.length - 1]?.[0];
      expect(Array.isArray(lastArg)).toBe(true);
      expect(lastArg?.[0]?.name).toBe("1º Lote");
    });

    await waitSubmitEnabled();
  });

  it("valida campos do form: se price/quantity <= 0 ou name vazio, mostra erro e não faz POST", async () => {
    setFetchMock(async (url) => {
      if (url.includes("/event-ticket-lot/ev1/tickets/lots")) {
        return respOkJson([]); // GET inicial
      }
      return respOkJson([]);
    });

    const { container } = render(<TicketLotManager eventId="ev1" />);

    await waitSubmitEnabled();

    // Submete o form 
    const form = container.querySelector("form.lot-form");
    expect(form).toBeTruthy();
    fireEvent.submit(form as HTMLFormElement);

    // agora deve aparecer a mensagem de validação
    expect(
      await screen.findByText(/Preencha todos os campos corretamente/i)
    ).toBeInTheDocument();

    // não deve ter chamado POST
    const calls = (global.fetch as unknown as jest.Mock).mock.calls as FetchArgs[];
    const postCalls = calls.filter(([, init]) => init?.method === "POST");
    expect(postCalls.length).toBe(0);
  });

  it("cria lote (POST) e adiciona na lista", async () => {
    setFetchMock(async (url, init) => {
      if (url.includes("/event-ticket-lot/ev1/tickets/lots") && !init?.method) {
        return respOkJson([]);
      }

      if (
        url.includes("/event-ticket-lot/ev1/tickets/lots") &&
        init?.method === "POST"
      ) {
        const body = init.body ? JSON.parse(String(init.body)) : {};
        return respOkJson({
          id: "new1",
          name: body.name ?? "Novo",
          price: Number(body.price ?? 1),
          quantity: Number(body.quantity ?? 1),
          active: Boolean(body.active ?? true),
        });
      }

      return respOkJson([]);
    });

    render(<TicketLotManager eventId="ev1" />);

    await waitSubmitEnabled();

    fireEvent.change(screen.getByPlaceholderText(/Ex:\s*1º Lote/i), {
      target: { value: "Pista" },
    });
    fireEvent.change(screen.getByPlaceholderText("0.00"), {
      target: { value: "30" },
    });
    fireEvent.change(screen.getByPlaceholderText("100"), {
      target: { value: "200" },
    });

    fireEvent.click(screen.getByRole("button", { name: /Adicionar Lote/i }));

    const table = await screen.findByRole("table");
    const t = within(table);

    expect(t.getByText("Pista")).toBeInTheDocument();
    expect(t.getByText(/R\$\s*30\.00/)).toBeInTheDocument();
    expect(t.getByText("200")).toBeInTheDocument();
  });

  it("editar lote: clicar Editar preenche o form, salvar faz PUT e atualiza linha", async () => {
    setFetchMock(async (url, init) => {
      if (url.includes("/event-ticket-lot/ev1/tickets/lots") && !init?.method) {
        return respOkJson([
          { id: "l1", name: "VIP", price: 100, quantity: 10, active: true },
        ]);
      }

      if (
        url.includes("/event-ticket-lot/tickets/lots/l1") &&
        init?.method === "PUT"
      ) {
        const body = init.body ? JSON.parse(String(init.body)) : {};
        return respOkJson({
          id: "l1",
          name: body.name ?? "VIP",
          price: Number(body.price ?? 100),
          quantity: Number(body.quantity ?? 10),
          active: Boolean(body.active ?? true),
        });
      }

      return respOkJson([]);
    });

    render(<TicketLotManager eventId="ev1" />);

    await screen.findByText("VIP");
    await waitSubmitEnabled();

    fireEvent.click(screen.getByRole("button", { name: /Editar/i }));

    const nameInput = screen.getByPlaceholderText(
      /Ex:\s*1º Lote/i
    ) as HTMLInputElement;
    expect(nameInput.value).toBe("VIP");

    fireEvent.change(nameInput, { target: { value: "VIP Atualizado" } });

    fireEvent.click(screen.getByRole("button", { name: /Atualizar Lote/i }));

    await screen.findByText("VIP Atualizado");
  });

  it("cancelar edição: volta para modo adicionar e limpa o form", async () => {
    setFetchMock(async (url) => {
      if (url.includes("/event-ticket-lot/ev1/tickets/lots")) {
        return respOkJson([
          { id: "l1", name: "VIP", price: 100, quantity: 10, active: true },
        ]);
      }
      return respOkJson([]);
    });

    render(<TicketLotManager eventId="ev1" />);

    await screen.findByText("VIP");
    await waitSubmitEnabled();

    fireEvent.click(screen.getByRole("button", { name: /Editar/i }));
    fireEvent.click(screen.getByRole("button", { name: /Cancelar/i }));

    expect(
      screen.getByRole("button", { name: /Adicionar Lote/i })
    ).toBeInTheDocument();

    const nameInput = screen.getByPlaceholderText(
      /Ex:\s*1º Lote/i
    ) as HTMLInputElement;
    expect(nameInput.value).toBe("");
  });

  it("excluir lote: confirma, faz DELETE e remove da lista", async () => {
    jest.spyOn(window, "confirm").mockReturnValue(true);

    setFetchMock(async (url, init) => {
      if (url.includes("/event-ticket-lot/ev1/tickets/lots") && !init?.method) {
        return respOkJson([
          { id: "l1", name: "VIP", price: 100, quantity: 10, active: true },
        ]);
      }

      if (
        url.includes("/event-ticket-lot/tickets/lots/l1") &&
        init?.method === "DELETE"
      ) {
        return respOkJson({});
      }

      return respOkJson([]);
    });

    render(<TicketLotManager eventId="ev1" />);

    await screen.findByText("VIP");
    await waitSubmitEnabled();

    fireEvent.click(screen.getByRole("button", { name: /Excluir/i }));

    await waitFor(() => {
      expect(screen.queryByText("VIP")).not.toBeInTheDocument();
    });
  });

  it("quando loadLots falha (res.ok false), mostra erro e não renderiza tabela", async () => {
    setFetchMock(async (url) => {
      if (url.includes("/event-ticket-lot/ev1/tickets/lots")) {
        return respFail(500);
      }
      return respOkJson([]);
    });

    render(<TicketLotManager eventId="ev1" />);

    await screen.findByText(/Erro ao carregar lotes de ingressos/i);
    expect(screen.queryByRole("table")).not.toBeInTheDocument();

    await waitSubmitEnabled();
  });

  it("quando DELETE falha, mostra erro", async () => {
    jest.spyOn(window, "confirm").mockReturnValue(true);

    setFetchMock(async (url, init) => {
      if (url.includes("/event-ticket-lot/ev1/tickets/lots") && !init?.method) {
        return respOkJson([
          { id: "l1", name: "VIP", price: 100, quantity: 10, active: true },
        ]);
      }

      if (
        url.includes("/event-ticket-lot/tickets/lots/l1") &&
        init?.method === "DELETE"
      ) {
        return respFail(500);
      }

      return respOkJson([]);
    });

    render(<TicketLotManager eventId="ev1" />);

    await screen.findByText("VIP");
    await waitSubmitEnabled();

    fireEvent.click(screen.getByRole("button", { name: /Excluir/i }));

    await screen.findByText(/Erro ao excluir lote/i);
    expect(screen.getByText("VIP")).toBeInTheDocument();
  });
});
