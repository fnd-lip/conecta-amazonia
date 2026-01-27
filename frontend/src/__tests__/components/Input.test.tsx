/**
 * Testes do Input (shadcn)
 * Objetivo: garantir que o usuário consegue digitar e que o valor é refletido.
 */

import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Input } from "@/components/ui/input";

describe("Input (UI)", () => {
  test("permite digitar e atualizar o valor", async () => {
    const user = userEvent.setup();

    render(<Input aria-label="email" />);

    const input = screen.getByLabelText("email");
    await user.type(input, "alicia@teste.com");

    expect(input).toHaveValue("alicia@teste.com");
  });
});
