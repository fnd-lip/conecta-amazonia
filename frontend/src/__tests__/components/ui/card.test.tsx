import React from "react";
import { cleanup, render, screen } from "@testing-library/react";
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "../../../components/ui/card";

// Mock do cn pra facilitar asserts
jest.mock("@/lib/utils", () => ({
  __esModule: true,
  cn: (...classes: Array<string | undefined>) => classes.filter(Boolean).join(" "),
}));

afterEach(() => {
  cleanup();
  jest.clearAllMocks();
});

describe("Card (ui)", () => {
  it("Card renderiza com data-slot, classes base e className extra, repassando props", () => {
    render(
      <Card className="extra" id="card-1" aria-label="card">
        Conteúdo
      </Card>
    );

    const el = screen.getByText("Conteúdo").closest("div");
    expect(el).toBeInTheDocument();

    expect(el).toHaveAttribute("data-slot", "card");
    expect(el).toHaveAttribute("id", "card-1");
    expect(el).toHaveAttribute("aria-label", "card");

    const className = el?.getAttribute("class") || "";
    expect(className).toContain("bg-card");
    expect(className).toContain("rounded-xl");
    expect(className).toContain("extra");
  });

  it("CardHeader renderiza com data-slot e classes base + extra", () => {
    render(
      <CardHeader className="hdr-extra">
        <span>Header</span>
      </CardHeader>
    );

    const headerText = screen.getByText("Header");
    const el = headerText.closest("div");
    expect(el).toBeInTheDocument();
    expect(el).toHaveAttribute("data-slot", "card-header");

    const className = el?.getAttribute("class") || "";
    expect(className).toContain("@container/card-header");
    expect(className).toContain("px-6");
    expect(className).toContain("hdr-extra");
  });

  it("CardTitle renderiza com data-slot e classes base + extra", () => {
    render(<CardTitle className="title-extra">Título</CardTitle>);

    const el = screen.getByText("Título");
    expect(el).toHaveAttribute("data-slot", "card-title");

    const className = el.getAttribute("class") || "";
    expect(className).toContain("font-semibold");
    expect(className).toContain("title-extra");
  });

  it("CardDescription renderiza com data-slot e classes base + extra", () => {
    render(<CardDescription className="desc-extra">Descrição</CardDescription>);

    const el = screen.getByText("Descrição");
    expect(el).toHaveAttribute("data-slot", "card-description");

    const className = el.getAttribute("class") || "";
    expect(className).toContain("text-muted-foreground");
    expect(className).toContain("text-sm");
    expect(className).toContain("desc-extra");
  });

  it("CardAction renderiza com data-slot e classes base + extra", () => {
    render(<CardAction className="act-extra">Ação</CardAction>);

    const el = screen.getByText("Ação");
    expect(el).toHaveAttribute("data-slot", "card-action");

    const className = el.getAttribute("class") || "";
    expect(className).toContain("justify-self-end");
    expect(className).toContain("act-extra");
  });

  it("CardContent renderiza com data-slot e classes base + extra", () => {
    render(<CardContent className="cnt-extra">Conteúdo</CardContent>);

    const el = screen.getByText("Conteúdo");
    expect(el).toHaveAttribute("data-slot", "card-content");

    const className = el.getAttribute("class") || "";
    expect(className).toContain("px-6");
    expect(className).toContain("cnt-extra");
  });

  it("CardFooter renderiza com data-slot e classes base + extra", () => {
    render(<CardFooter className="ftr-extra">Rodapé</CardFooter>);

    const el = screen.getByText("Rodapé");
    expect(el).toHaveAttribute("data-slot", "card-footer");

    const className = el.getAttribute("class") || "";
    expect(className).toContain("flex");
    expect(className).toContain("items-center");
    expect(className).toContain("px-6");
    expect(className).toContain("ftr-extra");
  });

  it("composição: Card com Header/Content/Footer renderiza tudo corretamente", () => {
    render(
      <Card>
        <CardHeader>
          <CardTitle>Meu Card</CardTitle>
          <CardDescription>Descrição</CardDescription>
          <CardAction>⋯</CardAction>
        </CardHeader>
        <CardContent>Corpo</CardContent>
        <CardFooter>Fim</CardFooter>
      </Card>
    );

    expect(screen.getByText("Meu Card")).toHaveAttribute("data-slot", "card-title");
    expect(screen.getByText("Descrição")).toHaveAttribute("data-slot", "card-description");
    expect(screen.getByText("⋯")).toHaveAttribute("data-slot", "card-action");
    expect(screen.getByText("Corpo")).toHaveAttribute("data-slot", "card-content");
    expect(screen.getByText("Fim")).toHaveAttribute("data-slot", "card-footer");

    // o Card pai existe com data-slot
    const cardRoot = screen.getByText("Meu Card").closest('[data-slot="card"]');
    expect(cardRoot).toBeInTheDocument();
  });
});
