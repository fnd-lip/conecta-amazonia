import React from "react";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
  DropdownMenuShortcut,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
} from "../../../components/ui/dropdown-menu";

function ExampleMenu() {
  const [checked, setChecked] = React.useState(true);
  const [radio, setRadio] = React.useState("a");

  return (
    <DropdownMenu>
      <DropdownMenuTrigger>Open</DropdownMenuTrigger>

      <DropdownMenuContent>
        <DropdownMenuLabel inset>Conta</DropdownMenuLabel>

        <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
          Perfil <DropdownMenuShortcut>⌘P</DropdownMenuShortcut>
        </DropdownMenuItem>

        <DropdownMenuSeparator />

        <DropdownMenuCheckboxItem checked={checked} onCheckedChange={setChecked}>
          Receber emails
        </DropdownMenuCheckboxItem>

        <DropdownMenuSeparator />

        <DropdownMenuRadioGroup value={radio} onValueChange={setRadio}>
          <DropdownMenuRadioItem value="a">Opção A</DropdownMenuRadioItem>
          <DropdownMenuRadioItem value="b">Opção B</DropdownMenuRadioItem>
        </DropdownMenuRadioGroup>

        <DropdownMenuSeparator />

        <DropdownMenuSub>
          <DropdownMenuSubTrigger>Mais</DropdownMenuSubTrigger>
          <DropdownMenuSubContent>
            <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
              Ajuda
            </DropdownMenuItem>
          </DropdownMenuSubContent>
        </DropdownMenuSub>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

async function openMenu(user: ReturnType<typeof userEvent.setup>) {
  const trigger = screen.getByRole("button", { name: /open/i });

  await user.click(trigger);

  await waitFor(() => {
    expect(trigger).toHaveAttribute("aria-expanded", "true");
  });
}

describe("dropdown-menu", () => {
  beforeAll(() => {
    // algumas versões do JSDOM não têm PointerEvent; Radix usa pointer events
    if (!(globalThis as unknown as { PointerEvent?: unknown }).PointerEvent) {
      (globalThis as unknown as { PointerEvent: unknown }).PointerEvent =
        window.MouseEvent as unknown;
    }
  });

  it("abre o menu ao clicar no trigger e renderiza conteúdo básico", async () => {
    const user = userEvent.setup();
    render(<ExampleMenu />);

    await openMenu(user);

    expect(await screen.findByText("Conta")).toBeInTheDocument();
    expect(screen.getByText("Perfil")).toBeInTheDocument();
    expect(screen.getByText("⌘P")).toBeInTheDocument();
  });

  it("renderiza data-slot no Trigger e no Content quando aberto (sanity check)", async () => {
    const user = userEvent.setup();
    const { container } = render(<ExampleMenu />);

    // trigger existe sempre
    expect(
      container.querySelector('[data-slot="dropdown-menu-trigger"]')
    ).toBeTruthy();

    await openMenu(user);

    // content só existe quando aberto 
    expect(
      document.querySelector('[data-slot="dropdown-menu-content"]')
    ).toBeTruthy();
  });

  it("checkbox item: alterna aria-checked ao clicar", async () => {
    const user = userEvent.setup();
    render(<ExampleMenu />);

    await openMenu(user);

    const checkbox = screen.getByRole("menuitemcheckbox", {
      name: /receber emails/i,
    });

    expect(checkbox).toHaveAttribute("aria-checked", "true");

    await user.click(checkbox);
    expect(checkbox).toHaveAttribute("aria-checked", "false");
  });

  it("radio group: seleciona opção e atualiza aria-checked", async () => {
    const user = userEvent.setup();
    render(<ExampleMenu />);

    await openMenu(user);

    const radioA = screen.getByRole("menuitemradio", { name: "Opção A" });
    const radioB = screen.getByRole("menuitemradio", { name: "Opção B" });

    expect(radioA).toHaveAttribute("aria-checked", "true");
    expect(radioB).toHaveAttribute("aria-checked", "false");

    await user.click(radioB);

    expect(radioA).toHaveAttribute("aria-checked", "false");
    expect(radioB).toHaveAttribute("aria-checked", "true");
  });

  it("submenu: abre ao interagir com o SubTrigger e renderiza SubContent", async () => {
    const user = userEvent.setup();
    render(<ExampleMenu />);

    await openMenu(user);

    const subTrigger = screen.getByRole("menuitem", { name: /mais/i });

    await user.hover(subTrigger);
    fireEvent.pointerMove(subTrigger);
    await user.click(subTrigger);

    expect(await screen.findByText("Ajuda")).toBeInTheDocument();
  });

  it("Separator: existe no DOM quando o menu está aberto", async () => {
    const user = userEvent.setup();
    render(<ExampleMenu />);

    await openMenu(user);

    const seps = document.querySelectorAll(
      '[data-slot="dropdown-menu-separator"]'
    );
    expect(seps.length).toBeGreaterThan(0);
  });

  it("Shortcut renderiza como span com data-slot", async () => {
    const user = userEvent.setup();
    render(<ExampleMenu />);

    await openMenu(user);

    const shortcut = await screen.findByText("⌘P");
    expect(shortcut.tagName.toLowerCase()).toBe("span");
    expect(shortcut).toHaveAttribute("data-slot", "dropdown-menu-shortcut");
  });
});
