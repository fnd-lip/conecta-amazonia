import React from "react";
import { fireEvent, render, screen } from "@testing-library/react";
import AdminHeaderTabs from "../../../pages/admin/AdminHeaderTabs";
import type { AdminTab } from "../../../pages/admin/admin.types";

describe("AdminHeaderTabs", () => {
  it("renderiza título e descrição do painel", () => {
    const onTabChange = jest.fn();
    const activeTab: AdminTab = "eventos";

    render(<AdminHeaderTabs activeTab={activeTab} onTabChange={onTabChange} />);

    expect(
      screen.getByRole("heading", { name: /Painel Administrativo/i })
    ).toBeInTheDocument();

    expect(
      screen.getByText(/Gerencie todos os eventos e usuários do sistema/i)
    ).toBeInTheDocument();
  });

  it("renderiza os 3 botões e aplica classe 'active' somente no tab ativo", () => {
    const onTabChange = jest.fn();

    const { rerender } = render(
      <AdminHeaderTabs activeTab={"eventos"} onTabChange={onTabChange} />
    );

    const btnEventos = screen.getByRole("button", { name: "Eventos" });
    const btnUsuarios = screen.getByRole("button", { name: "Usuários" });
    const btnTipos = screen.getByRole("button", { name: "Tipos de Evento" });

    expect(btnEventos).toHaveClass("tab-button");
    expect(btnUsuarios).toHaveClass("tab-button");
    expect(btnTipos).toHaveClass("tab-button");

    expect(btnEventos).toHaveClass("active");
    expect(btnUsuarios).not.toHaveClass("active");
    expect(btnTipos).not.toHaveClass("active");

    rerender(<AdminHeaderTabs activeTab={"usuarios"} onTabChange={onTabChange} />);

    expect(btnEventos).not.toHaveClass("active");
    expect(btnUsuarios).toHaveClass("active");
    expect(btnTipos).not.toHaveClass("active");

    rerender(<AdminHeaderTabs activeTab={"tipos"} onTabChange={onTabChange} />);

    expect(btnEventos).not.toHaveClass("active");
    expect(btnUsuarios).not.toHaveClass("active");
    expect(btnTipos).toHaveClass("active");
  });

  it("ao clicar em cada botão chama onTabChange com o tab correto", () => {
    const onTabChange = jest.fn();

    render(<AdminHeaderTabs activeTab={"eventos"} onTabChange={onTabChange} />);

    fireEvent.click(screen.getByRole("button", { name: "Usuários" }));
    expect(onTabChange).toHaveBeenCalledTimes(1);
    expect(onTabChange).toHaveBeenLastCalledWith("usuarios");

    fireEvent.click(screen.getByRole("button", { name: "Tipos de Evento" }));
    expect(onTabChange).toHaveBeenCalledTimes(2);
    expect(onTabChange).toHaveBeenLastCalledWith("tipos");

    fireEvent.click(screen.getByRole("button", { name: "Eventos" }));
    expect(onTabChange).toHaveBeenCalledTimes(3);
    expect(onTabChange).toHaveBeenLastCalledWith("eventos");
  });

  it("não chama onTabChange ao apenas renderizar", () => {
    const onTabChange = jest.fn();

    render(<AdminHeaderTabs activeTab={"eventos"} onTabChange={onTabChange} />);

    expect(onTabChange).not.toHaveBeenCalled();
  });
});
