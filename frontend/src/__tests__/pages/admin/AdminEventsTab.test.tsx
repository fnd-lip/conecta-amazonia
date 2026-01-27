import React from "react";
import { fireEvent, render, screen, within } from "@testing-library/react";
import AdminEventsTab from "../../../pages/admin/AdminEventsTab";
import type { Event } from "../../../pages/admin/admin.types";

type TestUser = {
  id: string;
  name: string;
};

function makeEvent(
  partial: Partial<Event> & {
    id: string;
    nome: string;
    data: string;
    user: TestUser;
  }
): Event {
  return {
    id: partial.id,
    nome: partial.nome,
    data: partial.data,
    categoria: partial.categoria ?? null,
    user: partial.user as Event["user"],
    children: partial.children ?? ([] as unknown as Event["children"]),
    descricao: partial.descricao ?? "Descrição de teste",
    ...partial,
  } as Event;
}


const PTBR_DATE_TIME_REGEX = /^\d{2}\/\d{2}\/\d{4}(,\s*|\s+)\d{2}:\d{2}$/;

describe("AdminEventsTab", () => {
  it("renderiza título com contagem e estado vazio quando events.length === 0", () => {
    const onView = jest.fn();
    const events: Event[] = [];

    render(<AdminEventsTab events={events} onView={onView} />);

    expect(
      screen.getByRole("heading", { name: /Todos os Eventos \(0\)/i })
    ).toBeInTheDocument();

    expect(
      screen.getByText(/Nenhum evento encontrado no sistema\./i)
    ).toBeInTheDocument();

    expect(screen.queryByRole("table")).not.toBeInTheDocument();
    expect(onView).not.toHaveBeenCalled();
  });

  it("renderiza tabela com cabeçalhos e linhas quando há eventos", () => {
    const onView = jest.fn();

    const events: Event[] = [
      makeEvent({
        id: "e1",
        nome: "Festival de Música",
        data: "2026-01-09T10:30:00.000Z",
        categoria: "show",
        user: { id: "u1", name: "Felipe" },
        children: [{ id: "c1" }, { id: "c2" }] as unknown as Event["children"],
      }),
      makeEvent({
        id: "e2",
        nome: "Feira Gastronômica",
        data: "2026-01-11T15:00:00.000Z",
        categoria: null,
        user: { id: "u2", name: "Maria" },
        children: [] as unknown as Event["children"],
      }),
    ];

    render(<AdminEventsTab events={events} onView={onView} />);

    expect(
      screen.getByRole("heading", { name: /Todos os Eventos \(2\)/i })
    ).toBeInTheDocument();

    const table = screen.getByRole("table");
    expect(table).toBeInTheDocument();

    const headers = within(table)
      .getAllByRole("columnheader")
      .map((h) => h.textContent?.trim());

    expect(headers).toEqual([
      "Nome",
      "Data",
      "Tipo",
      "Categoria",
      "Criado por",
      "Subeventos",
      "Ações",
    ]);

    const rows = within(table).getAllByRole("row");
    expect(rows).toHaveLength(3);

    const row1Cells = within(rows[1]).getAllByRole("cell");
    expect(
      within(row1Cells[0]).getByText("Festival de Música")
    ).toBeInTheDocument();

    expect(row1Cells[1].textContent ?? "").toMatch(PTBR_DATE_TIME_REGEX);

    // Tipo
    const principal1 = within(row1Cells[2]).getByText("Principal");
    expect(principal1).toHaveClass("type-badge", "principal");

    // Categoria "show" -> "Show"
    const cat1 = within(row1Cells[3]).getByText("Show");
    expect(cat1).toHaveClass("category-badge");

    expect(row1Cells[4]).toHaveTextContent("Felipe");

    // children: 2
    const subCount1 = within(row1Cells[5]).getByText("2");
    expect(subCount1).toHaveClass("subevent-count");

    // Ações
    expect(
      within(row1Cells[6]).getByRole("button", { name: "Ver" })
    ).toHaveClass("btn-view");
    expect(
      within(row1Cells[6]).getByRole("button", { name: "Editar" })
    ).toHaveClass("btn-edit");
    expect(
      within(row1Cells[6]).getByRole("button", { name: "Excluir" })
    ).toHaveClass("btn-delete");

    // Linha 2
    const row2Cells = within(rows[2]).getAllByRole("cell");
    expect(
      within(row2Cells[0]).getByText("Feira Gastronômica")
    ).toBeInTheDocument();

    expect(row2Cells[1].textContent ?? "").toMatch(PTBR_DATE_TIME_REGEX);

    const principal2 = within(row2Cells[2]).getByText("Principal");
    expect(principal2).toHaveClass("type-badge", "principal");

    // categoria null -> badge vazio
    const badge2 = row2Cells[3].querySelector(".category-badge");
    expect(badge2).not.toBeNull();
    expect((badge2?.textContent ?? "").trim()).toBe("");

    expect(row2Cells[4]).toHaveTextContent("Maria");

    // children vazio -> mostra 0 com classe no-subevent
    const zero = within(row2Cells[5]).getByText("0");
    expect(zero).toHaveClass("no-subevent");
  });

  it("ao clicar em 'Ver' chama onView com o id do evento", () => {
    const onView = jest.fn();

    const events: Event[] = [
      makeEvent({
        id: "e1",
        nome: "Festival de Música",
        data: "2026-01-09T10:30:00.000Z",
        categoria: "show",
        user: { id: "u1", name: "Felipe" },
        children: [{ id: "c1" }] as unknown as Event["children"],
      }),
      makeEvent({
        id: "e2",
        nome: "Feira Gastronômica",
        data: "2026-01-11T15:00:00.000Z",
        categoria: "feira",
        user: { id: "u2", name: "Maria" },
        children: [] as unknown as Event["children"],
      }),
    ];

    render(<AdminEventsTab events={events} onView={onView} />);

    const buttonsVer = screen.getAllByRole("button", { name: "Ver" });
    expect(buttonsVer).toHaveLength(2);

    fireEvent.click(buttonsVer[1]);
    expect(onView).toHaveBeenCalledTimes(1);
    expect(onView).toHaveBeenCalledWith("e2");

    fireEvent.click(buttonsVer[0]);
    expect(onView).toHaveBeenCalledTimes(2);
    expect(onView).toHaveBeenLastCalledWith("e1");
  });
});
