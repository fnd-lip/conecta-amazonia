import React from "react";
import { render, screen, within } from "@testing-library/react";
import AdminUsersTab from "../../../pages/admin/AdminUsersTab";

type TestUser = {
  id: string;
  name: string;
  email: string;
  type: string;
  createdAt: string;
};

describe("AdminUsersTab", () => {
  it("renderiza título com contagem e estado vazio quando users.length === 0", () => {
    const users: TestUser[] = [];

    render(<AdminUsersTab users={users} />);

    expect(
      screen.getByRole("heading", { name: /Todos os Usuários \(0\)/i })
    ).toBeInTheDocument();

    expect(
      screen.getByText(/Nenhum usuário encontrado no sistema\./i)
    ).toBeInTheDocument();

    expect(screen.queryByRole("table")).not.toBeInTheDocument();
  });

  it("renderiza tabela com cabeçalhos e linhas quando há usuários", () => {
    const users: TestUser[] = [
      {
        id: "u1",
        name: "Felipe Lima",
        email: "felipe@teste.com",
        type: "ADMIN",
        createdAt: "2026-01-09T10:00:00.000Z",
      },
      {
        id: "u2",
        name: "Maria Silva",
        email: "maria@teste.com",
        type: "GESTOR DE EVENTOS",
        createdAt: "2026-01-11T15:30:00.000Z",
      },
    ];

    render(<AdminUsersTab users={users} />);

    expect(
      screen.getByRole("heading", { name: /Todos os Usuários \(2\)/i })
    ).toBeInTheDocument();

    const table = screen.getByRole("table");
    expect(table).toBeInTheDocument();

    const headers = within(table)
      .getAllByRole("columnheader")
      .map((h) => h.textContent?.trim());

    expect(headers).toEqual(["Nome", "E-mail", "Papel", "Data de Criação"]);

    const rows = within(table).getAllByRole("row");
    expect(rows).toHaveLength(3);

    const row1Cells = within(rows[1]).getAllByRole("cell");
    expect(within(row1Cells[0]).getByText("Felipe Lima")).toBeInTheDocument();
    expect(row1Cells[1]).toHaveTextContent("felipe@teste.com");
    expect(row1Cells[2]).toHaveTextContent("ADMIN");
    expect(row1Cells[3].textContent ?? "").toMatch(/^\d{2}\/\d{2}\/\d{4}$/);

    const row2Cells = within(rows[2]).getAllByRole("cell");
    expect(within(row2Cells[0]).getByText("Maria Silva")).toBeInTheDocument();
    expect(row2Cells[1]).toHaveTextContent("maria@teste.com");
    expect(row2Cells[2]).toHaveTextContent("GESTOR DE EVENTOS");
    expect(row2Cells[3].textContent ?? "").toMatch(/^\d{2}\/\d{2}\/\d{4}$/);
  });

  it("aplica classe role-badge baseada no type (comportamento atual do replace: só 1 espaço)", () => {
    const users: TestUser[] = [
      {
        id: "u1",
        name: "Maria Silva",
        email: "maria@teste.com",
        type: "GESTOR DE EVENTOS",
        createdAt: "2026-01-11T15:30:00.000Z",
      },
      {
        id: "u2",
        name: "João",
        email: "joao@teste.com",
        type: "ADMIN",
        createdAt: "2026-01-11T15:30:00.000Z",
      },
    ];

    render(<AdminUsersTab users={users} />);

    const badgeGestor = screen.getByText("GESTOR DE EVENTOS");
    expect(badgeGestor).toHaveClass("role-badge");

    expect(badgeGestor).toHaveClass("gestor-de");

    const badgeAdmin = screen.getByText("ADMIN");
    expect(badgeAdmin).toHaveClass("role-badge");
    expect(badgeAdmin).toHaveClass("admin");
  });
});
