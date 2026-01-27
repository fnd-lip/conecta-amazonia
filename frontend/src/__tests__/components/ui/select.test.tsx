import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectSeparator,
  SelectTrigger,
  SelectValue,
} from "../../../components/ui/select";

function ExampleSelect() {
  const [value, setValue] = React.useState<string>("");

  return (
    <Select value={value} onValueChange={setValue}>
      <SelectTrigger aria-label="Categoria" size="default">
        <SelectValue placeholder="Selecione..." />
      </SelectTrigger>

      <SelectContent>
        <SelectGroup>
          <SelectLabel>Tipos</SelectLabel>
          <SelectItem value="a">Opção A</SelectItem>
          <SelectItem value="b">Opção B</SelectItem>
          <SelectSeparator />
          <SelectItem value="c">Opção C</SelectItem>
        </SelectGroup>
      </SelectContent>
    </Select>
  );
}

type PointerCaptureHost = HTMLElement & {
  hasPointerCapture?: (pointerId: number) => boolean;
  setPointerCapture?: (pointerId: number) => void;
  releasePointerCapture?: (pointerId: number) => void;
};

type ScrollIntoViewHost = Element & {
  scrollIntoView?: (arg?: boolean | ScrollIntoViewOptions) => void;
};

function ensureDomPolyfills(): void {
  // pointer capture (Radix usa em alguns componentes)
  const htmlProto = HTMLElement.prototype as PointerCaptureHost;

  if (typeof htmlProto.hasPointerCapture !== "function") {
    htmlProto.hasPointerCapture = () => false;
  }
  if (typeof htmlProto.setPointerCapture !== "function") {
    htmlProto.setPointerCapture = () => undefined;
  }
  if (typeof htmlProto.releasePointerCapture !== "function") {
    htmlProto.releasePointerCapture = () => undefined;
  }

  // scrollIntoView (Radix Select chama ao abrir/navegar)
  const elProto = Element.prototype as ScrollIntoViewHost;
  if (typeof elProto.scrollIntoView !== "function") {
    elProto.scrollIntoView = () => undefined;
  }
}

async function openSelect(): Promise<HTMLElement> {
  const trigger = screen.getByRole("combobox", { name: /categoria/i });

  trigger.focus();

  // abre via teclado
  fireEvent.keyDown(trigger, { key: "ArrowDown" });
  fireEvent.keyDown(trigger, { key: "Enter" });

  await waitFor(() => {
    const content = document.querySelector('[data-slot="select-content"]');
    expect(content).toBeTruthy();
  });

  return trigger;
}

describe("select", () => {
  beforeAll(() => {
    ensureDomPolyfills();
  });

  it("renderiza o trigger com data-slot e placeholder", () => {
    render(<ExampleSelect />);

    const trigger = screen.getByRole("combobox", { name: /categoria/i });
    expect(trigger).toBeInTheDocument();
    expect(trigger).toHaveAttribute("data-slot", "select-trigger");
    expect(trigger).toHaveAttribute("data-size", "default");
    expect(screen.getByText("Selecione...")).toBeInTheDocument();
  });

  it("abre o select e renderiza conteúdo (Label, Items, Separator)", async () => {
    render(<ExampleSelect />);

    await openSelect();

    expect(await screen.findByText("Tipos")).toBeInTheDocument();
    expect(screen.getByText("Opção A")).toBeInTheDocument();
    expect(screen.getByText("Opção B")).toBeInTheDocument();
    expect(screen.getByText("Opção C")).toBeInTheDocument();

    const sep = document.querySelector('[data-slot="select-separator"]');
    expect(sep).toBeTruthy();
  });

  it("seleciona um item e fecha o menu (valor aparece no trigger)", async () => {
    const user = userEvent.setup();
    render(<ExampleSelect />);

    await openSelect();

    // itens do Radix Select rendem como option
    const optB = await screen.findByRole("option", { name: "Opção B" });
    await user.click(optB);

    await waitFor(() => {
      const content = document.querySelector('[data-slot="select-content"]');
      expect(content).toBeFalsy();
    });

    expect(screen.getByText("Opção B")).toBeInTheDocument();
  });

  it("sanity: data-slot aparece nos wrappers quando aberto", async () => {
    render(<ExampleSelect />);

    await openSelect();

    expect(document.querySelector('[data-slot="select-content"]')).toBeTruthy();
    expect(document.querySelector('[data-slot="select-group"]')).toBeTruthy();
    expect(document.querySelector('[data-slot="select-label"]')).toBeTruthy();

    const items = document.querySelectorAll('[data-slot="select-item"]');
    expect(items.length).toBeGreaterThan(0);
  });
});
