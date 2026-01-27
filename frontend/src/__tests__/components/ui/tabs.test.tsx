import React from "react";
import { cleanup, render, screen } from "@testing-library/react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../../../components/ui/tabs";

// mock cn
jest.mock("@/lib/utils", () => ({
  __esModule: true,
  cn: (...classes: Array<string | undefined | false>) =>
    classes.filter(Boolean).join(" "),
}));

// mock Radix Tabs
type RootProps = React.HTMLAttributes<HTMLDivElement> & { children?: React.ReactNode };
type ListProps = React.HTMLAttributes<HTMLDivElement> & { children?: React.ReactNode };
type ContentProps = React.HTMLAttributes<HTMLDivElement> & {
  children?: React.ReactNode;
  value?: string;
};

type TriggerProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  children?: React.ReactNode;
  value: string; 
};

jest.mock("@radix-ui/react-tabs", () => {
  return {
    __esModule: true,
    Root: (props: RootProps) => <div data-testid="radix-root" {...props} />,
    List: (props: ListProps) => <div data-testid="radix-list" {...props} />,
    Trigger: (props: TriggerProps) => {
      const { value, ...rest } = props;
      return (
        <button
          data-testid="radix-trigger"
          data-value={value}
          type="button"
          {...rest}
        />
      );
    },
    Content: (props: ContentProps) => {
      const { value, ...rest } = props;
      return <div data-testid="radix-content" data-value={value} {...rest} />;
    },
  };
});

afterEach(() => {
  cleanup();
  jest.clearAllMocks();
});

describe("Tabs (ui wrappers)", () => {
  it("Tabs: aplica data-slot, classes base + extra e repassa props", () => {
    render(
      <Tabs className="extra" id="tabs-id" aria-label="tabs">
        <div>child</div>
      </Tabs>
    );

    const root = screen.getByTestId("radix-root");
    expect(root).toHaveAttribute("data-slot", "tabs");
    expect(root).toHaveAttribute("id", "tabs-id");
    expect(root).toHaveAttribute("aria-label", "tabs");

    const cls = root.getAttribute("class") || "";
    expect(cls).toContain("flex");
    expect(cls).toContain("flex-col");
    expect(cls).toContain("gap-2");
    expect(cls).toContain("extra");

    expect(screen.getByText("child")).toBeInTheDocument();
  });

  it("TabsList: aplica data-slot, classes base + extra e repassa props", () => {
    render(
      <TabsList className="list-extra" aria-label="lista">
        Lista
      </TabsList>
    );

    const list = screen.getByTestId("radix-list");
    expect(list).toHaveAttribute("data-slot", "tabs-list");
    expect(list).toHaveAttribute("aria-label", "lista");

    const cls = list.getAttribute("class") || "";
    expect(cls).toContain("inline-flex");
    expect(cls).toContain("h-9");
    expect(cls).toContain("rounded-lg");
    expect(cls).toContain("p-[3px]");
    expect(cls).toContain("list-extra");

    expect(screen.getByText("Lista")).toBeInTheDocument();
  });

  it("TabsTrigger: aplica data-slot, classes base + extra e repassa props (value obrigatório)", () => {
    render(
      <TabsTrigger value="tab-a" className="trg-extra" aria-label="trigger">
        Trigger
      </TabsTrigger>
    );

    const trigger = screen.getByTestId("radix-trigger");
    expect(trigger).toHaveAttribute("data-slot", "tabs-trigger");
    expect(trigger).toHaveAttribute("aria-label", "trigger");

    // value guardado em data-value
    expect(trigger).toHaveAttribute("data-value", "tab-a");

    const cls = trigger.getAttribute("class") || "";
    expect(cls).toContain("inline-flex");
    expect(cls).toContain("rounded-md");
    expect(cls).toContain("text-sm");
    expect(cls).toContain("trg-extra");

    expect(screen.getByText("Trigger")).toBeInTheDocument();
  });

  it("TabsContent: aplica data-slot, classes base + extra e repassa props", () => {
    render(
      <TabsContent value="tab-a" className="cnt-extra" aria-label="conteudo">
        Conteúdo
      </TabsContent>
    );

    const content = screen.getByTestId("radix-content");
    expect(content).toHaveAttribute("data-slot", "tabs-content");
    expect(content).toHaveAttribute("aria-label", "conteudo");
    expect(content).toHaveAttribute("data-value", "tab-a");

    const cls = content.getAttribute("class") || "";
    expect(cls).toContain("flex-1");
    expect(cls).toContain("outline-none");
    expect(cls).toContain("cnt-extra");

    expect(screen.getByText("Conteúdo")).toBeInTheDocument();
  });

  it("composição: Tabs + List + Triggers + Content renderizam juntos", () => {
    render(
      <Tabs defaultValue="a">
        <TabsList>
          <TabsTrigger value="a">A</TabsTrigger>
          <TabsTrigger value="b">B</TabsTrigger>
        </TabsList>
        <TabsContent value="a">Conteúdo A</TabsContent>
      </Tabs>
    );

    expect(screen.getByTestId("radix-root")).toHaveAttribute("data-slot", "tabs");
    expect(screen.getByTestId("radix-list")).toHaveAttribute("data-slot", "tabs-list");

    const triggers = screen.getAllByTestId("radix-trigger");
    expect(triggers).toHaveLength(2);
    triggers.forEach((t) => {
      expect(t).toHaveAttribute("data-slot", "tabs-trigger");
    });

    expect(screen.getByTestId("radix-content")).toHaveAttribute("data-slot", "tabs-content");
    expect(screen.getByText("Conteúdo A")).toBeInTheDocument();
  });
});
