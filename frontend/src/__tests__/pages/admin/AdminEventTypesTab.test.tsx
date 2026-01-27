import React from "react";
import { fireEvent, render, screen, within } from "@testing-library/react";
import AdminEventTypesTab from "../../../pages/admin/AdminEventTypesTab";
import type { EventType } from "../../../pages/admin/admin.types";

type Props = React.ComponentProps<typeof AdminEventTypesTab>;

function renderTab(override?: Partial<Props>) {
  const baseProps: Props = {
    eventTypes: [],
    newTypeName: "",
    editingTypeId: null,
    editingTypeName: "",
    typeBusy: false,
    onNewTypeNameChange: jest.fn(),
    onEditingTypeNameChange: jest.fn(),
    onCreate: jest.fn(),
    onStartEdit: jest.fn(),
    onCancelEdit: jest.fn(),
    onSaveEdit: jest.fn(),
    onDelete: jest.fn(),
  };

  const props = { ...baseProps, ...override };
  render(<AdminEventTypesTab {...props} />);
  return props;
}

describe("AdminEventTypesTab", () => {
  it("renderiza título com contagem e estado vazio quando eventTypes.length === 0", () => {
    renderTab({ eventTypes: [] });

    expect(
      screen.getByRole("heading", { name: /Tipos de Evento \(0\)/i })
    ).toBeInTheDocument();
    expect(
      screen.getByText(/Nenhum tipo de evento cadastrado\./i)
    ).toBeInTheDocument();

    expect(screen.queryByRole("table")).not.toBeInTheDocument();
  });

  it("campo 'Novo tipo de evento' chama onNewTypeNameChange ao digitar", () => {
    const onNewTypeNameChange = jest.fn();

    renderTab({ onNewTypeNameChange });

    const input = screen.getByPlaceholderText("Novo tipo de evento");
    fireEvent.change(input, { target: { value: "show" } });

    expect(onNewTypeNameChange).toHaveBeenCalledTimes(1);
    expect(onNewTypeNameChange).toHaveBeenCalledWith("show");
  });

  it("clicar em 'Adicionar' chama onCreate", () => {
    const onCreate = jest.fn();

    renderTab({ onCreate, newTypeName: "show" });

    const btn = screen.getByRole("button", { name: "Adicionar" });
    fireEvent.click(btn);

    expect(onCreate).toHaveBeenCalledTimes(1);
  });

  it("quando typeBusy=true desabilita inputs/botões e mostra 'Salvando...'", () => {
    const props = renderTab({ typeBusy: true });

    const newInput = screen.getByPlaceholderText("Novo tipo de evento");
    expect(newInput).toBeDisabled();

    const addBtn = screen.getByRole("button", { name: "Salvando..." });
    expect(addBtn).toBeDisabled();

    fireEvent.click(addBtn);
    expect(props.onCreate).not.toHaveBeenCalled();
  });

  it("renderiza tabela com tipos e capitaliza nome (primeira letra maiúscula)", () => {
    const eventTypes: EventType[] = [
      { id: 1, nome: "show" } as EventType,
      { id: 2, nome: "feira" } as EventType,
    ];

    renderTab({ eventTypes });

    expect(
      screen.getByRole("heading", { name: /Tipos de Evento \(2\)/i })
    ).toBeInTheDocument();

    const table = screen.getByRole("table");
    expect(table).toBeInTheDocument();

    const headers = within(table)
      .getAllByRole("columnheader")
      .map((h) => h.textContent?.trim());

    expect(headers).toEqual(["Nome", "Ações"]);

    expect(screen.getByText("Show")).toBeInTheDocument();
    expect(screen.getByText("Feira")).toBeInTheDocument();

    // botões padrão (não editando)
    expect(screen.getAllByRole("button", { name: "Editar" })).toHaveLength(2);
    expect(screen.getAllByRole("button", { name: "Excluir" })).toHaveLength(2);
  });

  it("clicar em 'Editar' chama onStartEdit passando o type correto", () => {
    const onStartEdit = jest.fn();
    const eventTypes: EventType[] = [
      { id: 1, nome: "show" } as EventType,
      { id: 2, nome: "feira" } as EventType,
    ];

    renderTab({ eventTypes, onStartEdit });

    const editButtons = screen.getAllByRole("button", { name: "Editar" });
    fireEvent.click(editButtons[1]);

    expect(onStartEdit).toHaveBeenCalledTimes(1);
    expect(onStartEdit).toHaveBeenCalledWith(eventTypes[1]);
  });

  it("clicar em 'Excluir' chama onDelete passando o type correto", () => {
    const onDelete = jest.fn();
    const eventTypes: EventType[] = [
      { id: 1, nome: "show" } as EventType,
      { id: 2, nome: "feira" } as EventType,
    ];

    renderTab({ eventTypes, onDelete });

    const delButtons = screen.getAllByRole("button", { name: "Excluir" });
    fireEvent.click(delButtons[0]);

    expect(onDelete).toHaveBeenCalledTimes(1);
    expect(onDelete).toHaveBeenCalledWith(eventTypes[0]);
  });

  it("quando editingTypeId === type.id mostra input inline e botões Salvar/Cancelar", () => {
    const eventTypes: EventType[] = [
      { id: 1, nome: "show" } as EventType,
      { id: 2, nome: "feira" } as EventType,
    ];

    renderTab({
      eventTypes,
      editingTypeId: 2,
      editingTypeName: "feira nova",
    });

    // O nome do tipo 2 não aparece como <strong> aparece input
    expect(screen.queryByText("Feira")).not.toBeInTheDocument();

    const inlineInputs = screen.getAllByRole("textbox");
    // tem o input do "Novo tipo" e o inline-input
    expect(inlineInputs.length).toBeGreaterThanOrEqual(2);

    const saveBtn = screen.getByRole("button", { name: "Salvar" });
    const cancelBtn = screen.getByRole("button", { name: "Cancelar" });
    expect(saveBtn).toBeInTheDocument();
    expect(cancelBtn).toBeInTheDocument();

    // Para o item em edição não deve mostrar Editar/Excluir
    const editButtons = screen.getAllByRole("button", { name: "Editar" });
    const deleteButtons = screen.getAllByRole("button", { name: "Excluir" });
    expect(editButtons).toHaveLength(1);
    expect(deleteButtons).toHaveLength(1);
  });

  it("ao alterar o input inline chama onEditingTypeNameChange", () => {
    const onEditingTypeNameChange = jest.fn();

    const eventTypes: EventType[] = [{ id: 1, nome: "show" } as EventType];

    renderTab({
      eventTypes,
      editingTypeId: 1,
      editingTypeName: "show",
      onEditingTypeNameChange,
    });

    // pega o input inline
    const inline = document.querySelector("input.inline-input") as HTMLInputElement | null;
    expect(inline).not.toBeNull();

    fireEvent.change(inline!, { target: { value: "show novo" } });
    expect(onEditingTypeNameChange).toHaveBeenCalledTimes(1);
    expect(onEditingTypeNameChange).toHaveBeenCalledWith("show novo");
  });

  it("clicar em 'Salvar' chama onSaveEdit e 'Cancelar' chama onCancelEdit", () => {
    const onSaveEdit = jest.fn();
    const onCancelEdit = jest.fn();

    const eventTypes: EventType[] = [{ id: 1, nome: "show" } as EventType];

    renderTab({
      eventTypes,
      editingTypeId: 1,
      editingTypeName: "show",
      onSaveEdit,
      onCancelEdit,
    });

    fireEvent.click(screen.getByRole("button", { name: "Salvar" }));
    expect(onSaveEdit).toHaveBeenCalledTimes(1);

    fireEvent.click(screen.getByRole("button", { name: "Cancelar" }));
    expect(onCancelEdit).toHaveBeenCalledTimes(1);
  });

  it("quando typeBusy=true durante edição, desabilita input inline e botões", () => {
    const eventTypes: EventType[] = [{ id: 1, nome: "show" } as EventType];

    renderTab({
      eventTypes,
      editingTypeId: 1,
      editingTypeName: "show",
      typeBusy: true,
    });

    const inline = document.querySelector("input.inline-input") as HTMLInputElement | null;
    expect(inline).not.toBeNull();
    expect(inline!).toBeDisabled();

    expect(screen.getByRole("button", { name: "Salvar" })).toBeDisabled();
    expect(screen.getByRole("button", { name: "Cancelar" })).toBeDisabled();

    // tbm desabilita os botões de criar
    expect(screen.getByPlaceholderText("Novo tipo de evento")).toBeDisabled();
    expect(screen.getByRole("button", { name: "Salvando..." })).toBeDisabled();
  });
});
