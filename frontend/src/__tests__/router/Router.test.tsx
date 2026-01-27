import React from "react";
import { MemoryRouter } from "react-router-dom";
import { render, screen } from "@testing-library/react";
import AppRoutes from "../../router/Router";

jest.mock("../../pages/Home", () => ({
  __esModule: true,
  default: () => <div>HOME_PAGE</div>,
}));

jest.mock("../../pages/Sobre", () => ({
  __esModule: true,
  default: () => <div>SOBRE_PAGE</div>,
}));

jest.mock("../../pages/Login", () => ({
  __esModule: true,
  default: () => <div>LOGIN_PAGE</div>,
}));

jest.mock("../../pages/gestor/Eventos", () => ({
  __esModule: true,
  default: () => <div>GESTOR_EVENTOS_PAGE</div>,
}));

jest.mock("../../pages/EventDetails", () => ({
  __esModule: true,
  default: () => <div>EVENT_DETAILS_PAGE</div>,
}));

jest.mock("../../pages/Admin", () => ({
  __esModule: true,
  default: () => <div>ADMIN_PAGE</div>,
}));

jest.mock("../../pages/CalendarPage", () => ({
  __esModule: true,
  default: () => <div>CALENDAR_PAGE</div>,
}));

function renderAt(path: string) {
  render(
    <MemoryRouter initialEntries={[path]}>
      <AppRoutes />
    </MemoryRouter>
  );
}

describe("AppRoutes (Router)", () => {
  it("renderiza Home em /", () => {
    renderAt("/");
    expect(screen.getByText("HOME_PAGE")).toBeInTheDocument();
  });

  it("renderiza Sobre em /sobre", () => {
    renderAt("/sobre");
    expect(screen.getByText("SOBRE_PAGE")).toBeInTheDocument();
  });

  it("renderiza Login em /login", () => {
    renderAt("/login");
    expect(screen.getByText("LOGIN_PAGE")).toBeInTheDocument();
  });

  it("renderiza EventosGestor em /gestor/eventos", () => {
    renderAt("/gestor/eventos");
    expect(screen.getByText("GESTOR_EVENTOS_PAGE")).toBeInTheDocument();
  });

  it("renderiza EventDetails em /eventos/:id (ex.: /eventos/123)", () => {
    renderAt("/eventos/123");
    expect(screen.getByText("EVENT_DETAILS_PAGE")).toBeInTheDocument();
  });

  it("renderiza Admin em /admin", () => {
    renderAt("/admin");
    expect(screen.getByText("ADMIN_PAGE")).toBeInTheDocument();
  });

  it("renderiza CalendarPage em /events/calendario", () => {
    renderAt("/events/calendario");
    expect(screen.getByText("CALENDAR_PAGE")).toBeInTheDocument();
  });

  it("rota inexistente não renderiza nenhuma página mockada", () => {
    renderAt("/rota-que-nao-existe");

    expect(screen.queryByText("HOME_PAGE")).not.toBeInTheDocument();
    expect(screen.queryByText("SOBRE_PAGE")).not.toBeInTheDocument();
    expect(screen.queryByText("LOGIN_PAGE")).not.toBeInTheDocument();
    expect(screen.queryByText("GESTOR_EVENTOS_PAGE")).not.toBeInTheDocument();
    expect(screen.queryByText("EVENT_DETAILS_PAGE")).not.toBeInTheDocument();
    expect(screen.queryByText("ADMIN_PAGE")).not.toBeInTheDocument();
    expect(screen.queryByText("CALENDAR_PAGE")).not.toBeInTheDocument();
  });
});
