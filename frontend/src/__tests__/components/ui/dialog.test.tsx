import React from "react";
import { cleanup, render, screen } from "@testing-library/react";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogOverlay,
  DialogPortal,
  DialogTitle,
  DialogTrigger,
} from "../../../components/ui/dialog";

// Mock cn
jest.mock("@/lib/utils", () => ({
  __esModule: true,
  cn: (...classes: Array<string | undefined>) => classes.filter(Boolean).join(" "),
}));

// Mock lucide icon
jest.mock("lucide-react", () => ({
  __esModule: true,
  XIcon: () => <span data-testid="x-icon" />,
}));

// Mock Radix Dialog Primitives 
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

describe("Dialog (ui)", () => {
  it("Dialog / Trigger / Portal / Close passam data-slot", () => {
    render(
      <Dialog>
        <DialogTrigger>Open</DialogTrigger>
        <DialogPortal>
          <DialogClose>Close</DialogClose>
        </DialogPortal>
      </Dialog>
    );

    // Root
    const root = screen.getByTestId("radix-root");
    expect(root).toHaveAttribute("data-slot", "dialog");

    // Trigger
    const trigger = screen.getByTestId("radix-trigger");
    expect(trigger).toHaveAttribute("data-slot", "dialog-trigger");
    expect(trigger).toHaveTextContent("Open");

    // Portal wrapper (agora repassa props)
    const portal = screen.getByTestId("radix-portal");
    expect(portal).toHaveAttribute("data-slot", "dialog-portal");

    // Close wrapper
    const close = screen.getByTestId("radix-close");
    expect(close).toHaveAttribute("data-slot", "dialog-close");
    expect(close).toHaveTextContent("Close");
  });

  it("DialogOverlay aplica data-slot e classes base + extra", () => {
    render(<DialogOverlay className="extra-overlay" />);

    const overlay = screen.getByTestId("radix-overlay");
    expect(overlay).toHaveAttribute("data-slot", "dialog-overlay");

    const cls = overlay.getAttribute("class") || "";
    expect(cls).toContain("fixed");
    expect(cls).toContain("inset-0");
    expect(cls).toContain("bg-black/50");
    expect(cls).toContain("extra-overlay");
  });

  it("DialogContent renderiza Portal + Overlay + Content e inclui botão de fechar por padrão", () => {
    render(
      <DialogContent>
        <div>Conteúdo</div>
      </DialogContent>
    );

    // Portal (wrapper)
    const portal = screen.getByTestId("radix-portal");
    expect(portal).toBeInTheDocument();
    expect(portal).toHaveAttribute("data-slot", "dialog-portal");

    // Overlay
    const overlay = screen.getByTestId("radix-overlay");
    expect(overlay).toBeInTheDocument();
    expect(overlay).toHaveAttribute("data-slot", "dialog-overlay");

    // Content
    const content = screen.getByTestId("radix-content");
    expect(content).toBeInTheDocument();
    expect(content).toHaveAttribute("data-slot", "dialog-content");
    expect(screen.getByText("Conteúdo")).toBeInTheDocument();

    // Close interno com ícone e sr-only "Close"
    const closeButtons = screen.getAllByTestId("radix-close");
    expect(closeButtons.length).toBeGreaterThanOrEqual(1);
    expect(screen.getByTestId("x-icon")).toBeInTheDocument();
    expect(screen.getByText("Close")).toBeInTheDocument();
  });

  it("DialogContent NÃO renderiza botão de fechar quando showCloseButton=false", () => {
    render(
      <DialogContent showCloseButton={false}>
        <div>Conteúdo</div>
      </DialogContent>
    );

    expect(screen.getByTestId("radix-portal")).toBeInTheDocument();
    expect(screen.getByTestId("radix-overlay")).toBeInTheDocument();
    expect(screen.getByTestId("radix-content")).toBeInTheDocument();

    expect(screen.queryByText("Close")).not.toBeInTheDocument();
    expect(screen.queryByTestId("x-icon")).not.toBeInTheDocument();
  });

  it("DialogHeader e DialogFooter aplicam data-slot e classes base + extra", () => {
    render(
      <div>
        <DialogHeader className="hdr-extra">H</DialogHeader>
        <DialogFooter className="ftr-extra">F</DialogFooter>
      </div>
    );

    const header = screen.getByText("H");
    expect(header).toHaveAttribute("data-slot", "dialog-header");
    expect(header.getAttribute("class") || "").toContain("flex");
    expect(header.getAttribute("class") || "").toContain("hdr-extra");

    const footer = screen.getByText("F");
    expect(footer).toHaveAttribute("data-slot", "dialog-footer");
    expect(footer.getAttribute("class") || "").toContain("sm:justify-end");
    expect(footer.getAttribute("class") || "").toContain("ftr-extra");
  });

  it("DialogTitle e DialogDescription passam data-slot e classes base + extra", () => {
    render(
      <div>
        <DialogTitle className="t-extra">Título</DialogTitle>
        <DialogDescription className="d-extra">Desc</DialogDescription>
      </div>
    );

    const title = screen.getByTestId("radix-title");
    expect(title).toHaveAttribute("data-slot", "dialog-title");
    const titleCls = title.getAttribute("class") || "";
    expect(titleCls).toContain("text-lg");
    expect(titleCls).toContain("font-semibold");
    expect(titleCls).toContain("t-extra");

    const desc = screen.getByTestId("radix-description");
    expect(desc).toHaveAttribute("data-slot", "dialog-description");
    const descCls = desc.getAttribute("class") || "";
    expect(descCls).toContain("text-muted-foreground");
    expect(descCls).toContain("text-sm");
    expect(descCls).toContain("d-extra");
  });

  it("DialogContent aceita className extra e repassa props", () => {
    render(
      <DialogContent className="content-extra" aria-label="dialog-content">
        <div>Ok</div>
      </DialogContent>
    );

    const content = screen.getByTestId("radix-content");
    expect(content).toHaveAttribute("aria-label", "dialog-content");

    const cls = content.getAttribute("class") || "";
    expect(cls).toContain("bg-background");
    expect(cls).toContain("content-extra");
  });
});
