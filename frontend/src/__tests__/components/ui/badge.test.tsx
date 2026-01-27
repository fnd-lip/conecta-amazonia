import React from "react";
import { cleanup, render, screen } from "@testing-library/react";
import { Badge, badgeVariants } from "../../../components/ui/badge";

// Mock do cn pra facilitar asserts
jest.mock("@/lib/utils", () => ({
  __esModule: true,
  cn: (...classes: Array<string | undefined>) => classes.filter(Boolean).join(" "),
}));

// Mock do Slot (Radix): clona o filho e injeta props (inclui className/data-slot/etc)
type SlotProps = React.HTMLAttributes<HTMLElement> & {
  children: React.ReactElement<Record<string, unknown>>;
};

jest.mock("@radix-ui/react-slot", () => {
  return {
    __esModule: true,
    Slot: (props: SlotProps) => {
      const { children, ...rest } = props;

      // garante tipagem do child
      const child = React.Children.only(children) as React.ReactElement<Record<string, unknown>>;

      // pega children original do filho sem depender de props tipado como unknown
      const originalChildren =
        (child.props as Record<string, unknown>)["children"] as React.ReactNode;

      return React.cloneElement(
        child,
        rest as React.Attributes & Record<string, unknown>,
        originalChildren
      );
    },
  };
});

afterEach(() => {
  cleanup();
  jest.clearAllMocks();
});

describe("Badge (ui)", () => {
  it("renderiza como <span> por padrão com data-slot e className extra", () => {
    render(<Badge className="extra">Novo</Badge>);

    const el = screen.getByText("Novo");
    expect(el.tagName.toLowerCase()).toBe("span");
    expect(el).toHaveAttribute("data-slot", "badge");

    const className = el.getAttribute("class") || "";
    expect(className).toContain("inline-flex");
    expect(className).toContain("rounded-full");
    expect(className).toContain("extra");
  });

  it("aplica variant default quando não passa variant", () => {
    render(<Badge>Default</Badge>);

    const el = screen.getByText("Default");
    const className = el.getAttribute("class") || "";

    expect(className).toContain("bg-primary");
    expect(className).toContain("text-primary-foreground");
  });

  it("aplica variant secondary", () => {
    render(<Badge variant="secondary">Sec</Badge>);

    const el = screen.getByText("Sec");
    const className = el.getAttribute("class") || "";

    expect(className).toContain("bg-secondary");
    expect(className).toContain("text-secondary-foreground");
  });

  it("aplica variant destructive", () => {
    render(<Badge variant="destructive">Boom</Badge>);

    const el = screen.getByText("Boom");
    const className = el.getAttribute("class") || "";

    expect(className).toContain("bg-destructive");
    expect(className).toContain("text-white");
  });

  it("aplica variant outline", () => {
    render(<Badge variant="outline">Out</Badge>);

    const el = screen.getByText("Out");
    const className = el.getAttribute("class") || "";

    expect(className).toContain("text-foreground");
  });

  it("quando asChild=true, renderiza o elemento filho como nó final (Slot)", () => {
    render(
      <Badge asChild className="from-badge">
        <a href="/x">Link</a>
      </Badge>
    );

    const link = screen.getByRole("link", { name: "Link" });
    expect(link.tagName.toLowerCase()).toBe("a");
    expect(link).toHaveAttribute("href", "/x");
    expect(link).toHaveAttribute("data-slot", "badge");

    const className = link.getAttribute("class") || "";
    expect(className).toContain("inline-flex");
    expect(className).toContain("from-badge");
  });

  it("badgeVariants retorna string de classes para um variant", () => {
    const cls = badgeVariants({ variant: "secondary" });
    expect(typeof cls).toBe("string");
    expect(cls).toContain("bg-secondary");
  });
});
