import React from "react";
import { cleanup, render, screen } from "@testing-library/react";
import { ScrollArea, ScrollBar } from "../../../components/ui/scroll-area";

// Mock cn
jest.mock("@/lib/utils", () => ({
  __esModule: true,
  cn: (...classes: Array<string | undefined | false>) =>
    classes.filter(Boolean).join(" "),
}));

// Mock Radix ScrollArea 
type RootProps = React.HTMLAttributes<HTMLDivElement> & { children?: React.ReactNode };
type ViewportProps = React.HTMLAttributes<HTMLDivElement> & { children?: React.ReactNode };
type ScrollbarProps = React.HTMLAttributes<HTMLDivElement> & {
  children?: React.ReactNode;
  orientation?: "vertical" | "horizontal";
};
type ThumbProps = React.HTMLAttributes<HTMLDivElement>;
type CornerProps = React.HTMLAttributes<HTMLDivElement>;

jest.mock("@radix-ui/react-scroll-area", () => {
  return {
    __esModule: true,
    Root: (props: RootProps) => <div data-testid="radix-root" {...props} />,
    Viewport: (props: ViewportProps) => <div data-testid="radix-viewport" {...props} />,
    ScrollAreaScrollbar: (props: ScrollbarProps) => (
      <div data-testid="radix-scrollbar" {...props} />
    ),
    ScrollAreaThumb: (props: ThumbProps) => <div data-testid="radix-thumb" {...props} />,
    Corner: (props: CornerProps) => <div data-testid="radix-corner" {...props} />,
  };
});

afterEach(() => {
  cleanup();
  jest.clearAllMocks();
});

describe("ScrollArea (ui)", () => {
  it("ScrollArea renderiza Root/Viewport/Scrollbar/Thumb/Corner e passa data-slot", () => {
    render(
      <ScrollArea className="extra-root">
        <div>Conteúdo</div>
      </ScrollArea>
    );

    const root = screen.getByTestId("radix-root");
    expect(root).toBeInTheDocument();
    expect(root).toHaveAttribute("data-slot", "scroll-area");

    const rootCls = root.getAttribute("class") || "";
    expect(rootCls).toContain("relative");
    expect(rootCls).toContain("extra-root");

    const viewport = screen.getByTestId("radix-viewport");
    expect(viewport).toBeInTheDocument();
    expect(viewport).toHaveAttribute("data-slot", "scroll-area-viewport");
    expect(screen.getByText("Conteúdo")).toBeInTheDocument();

    const scrollbar = screen.getByTestId("radix-scrollbar");
    expect(scrollbar).toBeInTheDocument();
    expect(scrollbar).toHaveAttribute("data-slot", "scroll-area-scrollbar");

    const thumb = screen.getByTestId("radix-thumb");
    expect(thumb).toBeInTheDocument();
    expect(thumb).toHaveAttribute("data-slot", "scroll-area-thumb");
    expect(thumb.getAttribute("class") || "").toContain("rounded-full");

    const corner = screen.getByTestId("radix-corner");
    expect(corner).toBeInTheDocument();
  });

  it("ScrollBar (default vertical) aplica classes de vertical e orientation", () => {
    render(<ScrollBar className="extra" />);

    const scrollbar = screen.getByTestId("radix-scrollbar");
    expect(scrollbar).toHaveAttribute("data-slot", "scroll-area-scrollbar");
    expect(scrollbar).toHaveAttribute("orientation", "vertical");

    const cls = scrollbar.getAttribute("class") || "";
    expect(cls).toContain("flex");
    expect(cls).toContain("w-2.5"); // vertical
    expect(cls).toContain("border-l");
    expect(cls).toContain("extra");

    const thumb = screen.getByTestId("radix-thumb");
    expect(thumb).toHaveAttribute("data-slot", "scroll-area-thumb");
  });

  it("ScrollBar horizontal aplica classes de horizontal e orientation", () => {
    render(<ScrollBar orientation="horizontal" className="h-extra" />);

    const scrollbar = screen.getByTestId("radix-scrollbar");
    expect(scrollbar).toHaveAttribute("orientation", "horizontal");

    const cls = scrollbar.getAttribute("class") || "";
    expect(cls).toContain("h-2.5"); // horizontal
    expect(cls).toContain("flex-col");
    expect(cls).toContain("border-t");
    expect(cls).toContain("h-extra");
  });
});
