/**
 * Testes do Button (shadcn)
 * Objetivo: garantir renderização, clique e comportamento quando disabled.
 */

import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Button } from "@/components/ui/button";

describe("Button (UI)", () => {
  test("renderiza com texto", () => {
    render(<Button>Salvar</Button>);
    expect(screen.getByRole("button", { name: /salvar/i })).toBeInTheDocument();
  });

  test("executa onClick quando clicado", async () => {
    const user = userEvent.setup();
    const onClick = jest.fn();

    render(<Button onClick={onClick}>Clique</Button>);

    await user.click(screen.getByRole("button", { name: /clique/i }));
    expect(onClick).toHaveBeenCalledTimes(1);
  });

  test("não executa onClick quando disabled", async () => {
    const user = userEvent.setup();
    const onClick = jest.fn();

    render(
      <Button disabled onClick={onClick}>
        Clique
      </Button>
    );

    await user.click(screen.getByRole("button", { name: /clique/i }));
    expect(onClick).not.toHaveBeenCalled();
  });
});
