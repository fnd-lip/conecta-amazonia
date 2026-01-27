import React from "react";
import { cleanup, render, screen } from "@testing-library/react";
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "../../../components/ui/sheet";

// Mock cn
jest.mock("@/lib/utils", () => ({
  __esModule: true,
  cn: (...classes: Array<string | undefined | false>) =>
    classes.filter(Boolean).join(" "),
}));

// Mock lucide icon
jest.mock("lucide-react", () => ({
  __esModule: true,
  XIcon: (props: React.HTMLAttributes<HTMLElement>) => (
    <span data-testid="x-icon" {...props} />
  ),
}));

type RootProps = { children?: React.ReactNode } & React.HTMLAttributes<HTMLDivElement>;
type TriggerProps = { children?: React.ReactNode } & React.ButtonHTMLAttributes<HTMLButtonElement>;
type PortalProps = { children?: React.ReactNode } & React.HTMLAttributes<HTMLDivElement>;
type OverlayProps = React.HTMLAttributes<HTMLDivElement>;
type ContentProps = { children?: React.ReactNode } & React.HTMLAttributes<HTMLDivElement>;
type CloseProps = { children?: React.ReactNode } & React.ButtonHTMLAttributes<HTMLButtonElement>;
type TitleProps = { children?: React.ReactNode } & React.HTMLAttributes<HTMLHeadingElement>;
type DescriptionProps = { children?: React.ReactNode } & React.HTMLAttributes<HTMLParagraphElement>;

jest.mock("@radix-ui/react-dialog", () => {
  return {
    __esModule: true,
    Root: (props: RootProps) => <div data-testid="radix-root" {...props} />,
    Trigger: (props: TriggerProps) => (
      <button data-testid="radix-trigger" type="button" {...props} />
    ),
    Portal: (props: PortalProps) => (
      <div data-testid="radix-portal" {...props}>
        {props.children}
      </div>
    ),
    Overlay: (props: OverlayProps) => <div data-testid="radix-overlay" {...props} />,
    Content: (props: ContentProps) => <div data-testid="radix-content" {...props} />,
    Close: (props: CloseProps) => (
      <button data-testid="radix-close" type="button" {...props} />
    ),
    Title: (props: TitleProps) => <h2 data-testid="radix-title" {...props} />,
    Description: (props: DescriptionProps) => (
      <p data-testid="radix-description" {...props} />
    ),
  };
});

afterEach(() => {
  cleanup();
  jest.clearAllMocks();
});

describe("Sheet (ui)", () => {
  it("Sheet / Trigger / Close passam data-slot", () => {
    render(
      <Sheet>
        <SheetTrigger>Abrir</SheetTrigger>
        <SheetClose>Fechar</SheetClose>
      </Sheet>
    );

    const root = screen.getByTestId("radix-root");
    expect(root).toHaveAttribute("data-slot", "sheet");

    const trigger = screen.getByTestId("radix-trigger");
    expect(trigger).toHaveAttribute("data-slot", "sheet-trigger");
    expect(trigger).toHaveTextContent("Abrir");

    const close = screen.getByTestId("radix-close");
    expect(close).toHaveAttribute("data-slot", "sheet-close");
    expect(close).toHaveTextContent("Fechar");
  });

  it("SheetContent renderiza Portal + Overlay + Content e botão Close interno", () => {
    render(
      <SheetContent>
        <div>Conteúdo</div>
      </SheetContent>
    );

    const portal = screen.getByTestId("radix-portal");
    expect(portal).toBeInTheDocument();
    expect(portal).toHaveAttribute("data-slot", "sheet-portal");

    const overlay = screen.getByTestId("radix-overlay");
    expect(overlay).toBeInTheDocument();
    expect(overlay).toHaveAttribute("data-slot", "sheet-overlay");

    const content = screen.getByTestId("radix-content");
    expect(content).toBeInTheDocument();
    expect(content).toHaveAttribute("data-slot", "sheet-content");
    expect(screen.getByText("Conteúdo")).toBeInTheDocument();

    // Close interno 
    expect(screen.getByText("Close")).toBeInTheDocument();
    expect(screen.getByTestId("x-icon")).toBeInTheDocument();
  });

  it("SheetOverlay aplica classes base + extra", () => {
    render(
      <SheetContent>
        <div>Ok</div>
      </SheetContent>
    );

    const overlay = screen.getByTestId("radix-overlay");
    const cls = overlay.getAttribute("class") || "";
    expect(cls).toContain("fixed");
    expect(cls).toContain("inset-0");
    expect(cls).toContain("bg-black/50");
  });

  it("SheetContent aplica classes dependendo do side (default right)", () => {
    render(
      <SheetContent>
        <div>Ok</div>
      </SheetContent>
    );

    const content = screen.getByTestId("radix-content");
    const cls = content.getAttribute("class") || "";

    // base
    expect(cls).toContain("bg-background");
    expect(cls).toContain("fixed");
    expect(cls).toContain("z-50");

    // right
    expect(cls).toContain("right-0");
    expect(cls).toContain("border-l");
    expect(cls).toContain("slide-in-from-right");
  });

  it("SheetContent side=left aplica classes de left", () => {
    render(
      <SheetContent side="left">
        <div>Ok</div>
      </SheetContent>
    );

    const content = screen.getByTestId("radix-content");
    const cls = content.getAttribute("class") || "";

    expect(cls).toContain("left-0");
    expect(cls).toContain("border-r");
    expect(cls).toContain("slide-in-from-left");
  });

  it("SheetContent side=top aplica classes de top", () => {
    render(
      <SheetContent side="top">
        <div>Ok</div>
      </SheetContent>
    );

    const content = screen.getByTestId("radix-content");
    const cls = content.getAttribute("class") || "";

    expect(cls).toContain("top-0");
    expect(cls).toContain("border-b");
    expect(cls).toContain("slide-in-from-top");
  });

  it("SheetContent side=bottom aplica classes de bottom", () => {
    render(
      <SheetContent side="bottom">
        <div>Ok</div>
      </SheetContent>
    );

    const content = screen.getByTestId("radix-content");
    const cls = content.getAttribute("class") || "";

    expect(cls).toContain("bottom-0");
    expect(cls).toContain("border-t");
    expect(cls).toContain("slide-in-from-bottom");
  });

  it("SheetHeader/SheetFooter aplicam data-slot e classes base + extra", () => {
    render(
      <div>
        <SheetHeader className="h-extra">Header</SheetHeader>
        <SheetFooter className="f-extra">Footer</SheetFooter>
      </div>
    );

    const header = screen.getByText("Header");
    expect(header).toHaveAttribute("data-slot", "sheet-header");
    expect(header.getAttribute("class") || "").toContain("p-4");
    expect(header.getAttribute("class") || "").toContain("h-extra");

    const footer = screen.getByText("Footer");
    expect(footer).toHaveAttribute("data-slot", "sheet-footer");
    expect(footer.getAttribute("class") || "").toContain("mt-auto");
    expect(footer.getAttribute("class") || "").toContain("f-extra");
  });

  it("SheetTitle/SheetDescription passam data-slot e classes base + extra", () => {
    render(
      <div>
        <SheetTitle className="t-extra">Título</SheetTitle>
        <SheetDescription className="d-extra">Desc</SheetDescription>
      </div>
    );

    const title = screen.getByTestId("radix-title");
    expect(title).toHaveAttribute("data-slot", "sheet-title");
    const titleCls = title.getAttribute("class") || "";
    expect(titleCls).toContain("font-semibold");
    expect(titleCls).toContain("t-extra");

    const desc = screen.getByTestId("radix-description");
    expect(desc).toHaveAttribute("data-slot", "sheet-description");
    const descCls = desc.getAttribute("class") || "";
    expect(descCls).toContain("text-muted-foreground");
    expect(descCls).toContain("text-sm");
    expect(descCls).toContain("d-extra");
  });

  it("SheetContent aceita className extra e repassa props (ex.: aria-label)", () => {
    render(
      <SheetContent className="content-extra" aria-label="sheet-content">
        <div>Ok</div>
      </SheetContent>
    );

    const content = screen.getByTestId("radix-content");
    expect(content).toHaveAttribute("aria-label", "sheet-content");
    expect(content.getAttribute("class") || "").toContain("content-extra");
  });
});
