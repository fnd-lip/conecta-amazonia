import React from "react";
import { cleanup, render, screen } from "@testing-library/react";
import { Avatar, AvatarFallback, AvatarImage } from "../../../components/ui/avatar";

jest.mock("@/lib/utils", () => ({
  __esModule: true,
  cn: (...classes: Array<string | undefined>) => classes.filter(Boolean).join(" "),
}));

type PrimitiveProps = React.HTMLAttributes<HTMLDivElement> & { children?: React.ReactNode };
type ImageProps = React.ImgHTMLAttributes<HTMLImageElement>;
type FallbackProps = React.HTMLAttributes<HTMLSpanElement> & { children?: React.ReactNode };

jest.mock("@radix-ui/react-avatar", () => {
  return {
    __esModule: true,
    Root: (props: PrimitiveProps) => (
      <div data-testid="radix-root" {...props} />
    ),
    Image: (props: ImageProps) => (
      <img data-testid="radix-image" {...props} />
    ),
    Fallback: (props: FallbackProps) => (
      <span data-testid="radix-fallback" {...props} />
    ),
  };
});

afterEach(() => {
  cleanup();
  jest.clearAllMocks();
});

describe("Avatar (ui)", () => {
  it("renderiza Avatar com data-slot e classes default + className extra", () => {
    render(<Avatar className="extra-class" aria-label="avatar" />);

    const root = screen.getByTestId("radix-root");
    expect(root).toBeInTheDocument();
    expect(root).toHaveAttribute("data-slot", "avatar");
    expect(root).toHaveAttribute("aria-label", "avatar");

    const className = root.getAttribute("class") || "";
    expect(className).toContain("relative");
    expect(className).toContain("rounded-full");
    expect(className).toContain("extra-class");
  });

  it("renderiza AvatarImage com data-slot, classes e repassa src/alt", () => {
    render(
      <Avatar>
        <AvatarImage
          className="img-extra"
          src="https://example.com/a.png"
          alt="Foto"
        />
      </Avatar>
    );

    const img = screen.getByTestId("radix-image") as HTMLImageElement;
    expect(img).toBeInTheDocument();
    expect(img).toHaveAttribute("data-slot", "avatar-image");
    expect(img).toHaveAttribute("src", "https://example.com/a.png");
    expect(img).toHaveAttribute("alt", "Foto");

    const className = img.getAttribute("class") || "";
    expect(className).toContain("aspect-square");
    expect(className).toContain("size-full");
    expect(className).toContain("img-extra");
  });

  it("renderiza AvatarFallback com data-slot, classes e children", () => {
    render(
      <Avatar>
        <AvatarFallback className="fb-extra">FL</AvatarFallback>
      </Avatar>
    );

    const fb = screen.getByTestId("radix-fallback");
    expect(fb).toBeInTheDocument();
    expect(fb).toHaveAttribute("data-slot", "avatar-fallback");
    expect(fb).toHaveTextContent("FL");

    const className = fb.getAttribute("class") || "";
    expect(className).toContain("bg-muted");
    expect(className).toContain("items-center");
    expect(className).toContain("rounded-full");
    expect(className).toContain("fb-extra");
  });
});
