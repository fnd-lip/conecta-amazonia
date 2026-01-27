import React from "react";
import { cleanup, render, screen } from "@testing-library/react";
import { Separator } from "../../../components/ui/separator";

// Mock cn
jest.mock("@/lib/utils", () => ({
  __esModule: true,
  cn: (...classes: Array<string | undefined | false>) =>
    classes.filter(Boolean).join(" "),
}));

// Mock Radix Separator
type RootProps = React.HTMLAttributes<HTMLDivElement> & {
  orientation?: "horizontal" | "vertical";
  decorative?: boolean;
};

jest.mock("@radix-ui/react-separator", () => {
  return {
    __esModule: true,
    Root: (props: RootProps) => {
      const { decorative, orientation, ...rest } = props;
      return (
        <div
          data-testid="radix-separator"
          data-decorative={decorative ? "true" : "false"}
          data-orientation={orientation}
          {...rest}
        />
      );
    },
  };
});

afterEach(() => {
  cleanup();
  jest.clearAllMocks();
});

describe("Separator (ui)", () => {
  it("renderiza com defaults: orientation=horizontal e decorative=true", () => {
    render(<Separator />);

    const sep = screen.getByTestId("radix-separator");
    expect(sep).toBeInTheDocument();

    expect(sep).toHaveAttribute("data-slot", "separator");

    // no mock, guardamos em data-*
    expect(sep).toHaveAttribute("data-orientation", "horizontal");
    expect(sep).toHaveAttribute("data-decorative", "true");

    const cls = sep.getAttribute("class") || "";
    expect(cls).toContain("bg-border");
    expect(cls).toContain("shrink-0");
    expect(cls).toContain("data-[orientation=horizontal]:h-px");
    expect(cls).toContain("data-[orientation=horizontal]:w-full");
  });

  it("aceita orientation=vertical e decorative=false e concatena className extra", () => {
    render(
      <Separator orientation="vertical" decorative={false} className="extra" />
    );

    const sep = screen.getByTestId("radix-separator");

    expect(sep).toHaveAttribute("data-orientation", "vertical");
    expect(sep).toHaveAttribute("data-decorative", "false");

    const cls = sep.getAttribute("class") || "";
    expect(cls).toContain("data-[orientation=vertical]:h-full");
    expect(cls).toContain("data-[orientation=vertical]:w-px");
    expect(cls).toContain("extra");
  });

  it("repassa props extras (ex.: aria-label e id)", () => {
    render(<Separator aria-label="sep" id="sep-1" />);

    const sep = screen.getByTestId("radix-separator");
    expect(sep).toHaveAttribute("aria-label", "sep");
    expect(sep).toHaveAttribute("id", "sep-1");
  });
});
