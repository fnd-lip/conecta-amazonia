import React from "react";
import {
  cleanup,
  fireEvent,
  render,
  screen,
  waitFor,
} from "@testing-library/react";
import type useEmblaCarousel from "embla-carousel-react";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
  type CarouselApi,
} from "../../../components/ui/carousel";

// Mock cn
jest.mock("@/lib/utils", () => ({
  __esModule: true,
  cn: (...classes: Array<string | undefined>) => classes.filter(Boolean).join(" "),
}));

// Mock lucide icons
jest.mock("lucide-react", () => ({
  __esModule: true,
  ArrowLeft: () => <span data-testid="icon-left" />,
  ArrowRight: () => <span data-testid="icon-right" />,
}));

// Mock Button (shadcn)
type ButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: string;
  size?: string;
};
jest.mock("@/components/ui/button", () => ({
  __esModule: true,
  Button: (props: ButtonProps) => (
    <button data-testid={String(props["data-slot"] ?? "button")} {...props}>
      {props.children}
    </button>
  ),
}));

// mock embla-carousel-react -
type EmblaEvent = "reInit" | "select";

let lastEmblaOptions: Record<string, unknown> | null = null;
let lastEmblaPlugins: unknown = null;

const scrollPrevMock = jest.fn();
const scrollNextMock = jest.fn();
const canScrollPrevMock = jest.fn(() => false);
const canScrollNextMock = jest.fn(() => false);

const onMock = jest.fn();
const offMock = jest.fn();

const apiMockPartial: Partial<CarouselApi> = {
  scrollPrev: scrollPrevMock as unknown as CarouselApi["scrollPrev"],
  scrollNext: scrollNextMock as unknown as CarouselApi["scrollNext"],
  canScrollPrev: canScrollPrevMock as unknown as CarouselApi["canScrollPrev"],
  canScrollNext: canScrollNextMock as unknown as CarouselApi["canScrollNext"],
  on: onMock as unknown as CarouselApi["on"],
  off: offMock as unknown as CarouselApi["off"],
};

const apiMock = apiMockPartial as unknown as CarouselApi;

// ref callback
const carouselRefMock = jest.fn();

jest.mock("embla-carousel-react", () => {
  return {
    __esModule: true,
    default: (opts: Record<string, unknown>, plugins: unknown) => {
      lastEmblaOptions = opts;
      lastEmblaPlugins = plugins;
      return [carouselRefMock, apiMock];
    },
  };
});

afterEach(() => {
  cleanup();
  jest.clearAllMocks();
  lastEmblaOptions = null;
  lastEmblaPlugins = null;
});

function renderBasic(
  orientation?: "horizontal" | "vertical",
  setApi?: (api: CarouselApi) => void
) {
  return render(
    <Carousel orientation={orientation} setApi={setApi}>
      <CarouselContent>
        <CarouselItem>Slide 1</CarouselItem>
        <CarouselItem>Slide 2</CarouselItem>
      </CarouselContent>
      <CarouselPrevious />
      <CarouselNext />
    </Carousel>
  );
}

describe("Carousel (ui)", () => {
  it("renderiza o container com role region e aria-roledescription", () => {
    renderBasic();

    const region = screen.getByRole("region");
    expect(region).toHaveAttribute("aria-roledescription", "carousel");
    expect(region).toHaveAttribute("data-slot", "carousel");
  });

  it("chama useEmblaCarousel com axis 'x' quando orientation=horizontal (default)", () => {
    renderBasic();

    expect(lastEmblaOptions).not.toBeNull();
    expect(lastEmblaOptions?.axis).toBe("x");
  });

  it("chama useEmblaCarousel com axis 'y' quando orientation=vertical", () => {
    renderBasic("vertical");

    expect(lastEmblaOptions).not.toBeNull();
    expect(lastEmblaOptions?.axis).toBe("y");
  });

  it("repassa plugins para useEmblaCarousel (com tipo correto)", () => {
    type CarouselPlugin = Parameters<typeof useEmblaCarousel>[1];

    const plugins = [{ fake: true }] as unknown as CarouselPlugin;

    render(
      <Carousel plugins={plugins}>
        <CarouselContent>
          <CarouselItem>Slide</CarouselItem>
        </CarouselContent>
      </Carousel>
    );

    expect(lastEmblaPlugins).toBe(plugins);
  });

  it("chama setApi com api do embla", async () => {
    const setApi = jest.fn();

    renderBasic(undefined, setApi);

    await waitFor(() => {
      expect(setApi).toHaveBeenCalledTimes(1);
    });

    expect(setApi).toHaveBeenCalledWith(apiMock);
  });

  it("registra listeners on('reInit'/'select') e faz off('select') no cleanup", () => {
    const { unmount } = renderBasic();

    expect(onMock).toHaveBeenCalled();

    const onEvents = onMock.mock.calls.map((c) => c[0]) as EmblaEvent[];
    expect(onEvents).toContain("reInit");
    expect(onEvents).toContain("select");

    unmount();

    const offEvents = offMock.mock.calls.map((c) => c[0]) as EmblaEvent[];
    expect(offEvents).toContain("select");
  });

  it("CarouselContent aplica classes de orientação (horizontal: -ml-4)", () => {
    const { container } = renderBasic("horizontal");

    const contentOuter = container.querySelector(
      '[data-slot="carousel-content"]'
    ) as HTMLDivElement | null;
    expect(contentOuter).not.toBeNull();

    const innerDiv = contentOuter?.querySelector("div") as HTMLDivElement | null;
    expect(innerDiv).not.toBeNull();

    const cls = innerDiv?.getAttribute("class") || "";
    expect(cls).toContain("flex");
    expect(cls).toContain("-ml-4");
  });

  it("CarouselContent aplica classes de orientação (vertical: -mt-4 flex-col)", () => {
    const { container } = renderBasic("vertical");

    const contentOuter = container.querySelector(
      '[data-slot="carousel-content"]'
    ) as HTMLDivElement | null;
    expect(contentOuter).not.toBeNull();

    const innerDiv = contentOuter?.querySelector("div") as HTMLDivElement | null;
    expect(innerDiv).not.toBeNull();

    const cls = innerDiv?.getAttribute("class") || "";
    expect(cls).toContain("flex");
    expect(cls).toContain("-mt-4");
    expect(cls).toContain("flex-col");
  });

  it("CarouselItem aplica padding correto conforme orientação", () => {
    renderBasic("horizontal");

    const slide1 = screen
      .getByText("Slide 1")
      .closest('[data-slot="carousel-item"]');
    expect(slide1).toBeInTheDocument();
    expect(slide1?.getAttribute("class") || "").toContain("pl-4");

    cleanup();
    jest.clearAllMocks();

    renderBasic("vertical");

    const vSlide1 = screen
      .getByText("Slide 1")
      .closest('[data-slot="carousel-item"]');
    expect(vSlide1).toBeInTheDocument();
    expect(vSlide1?.getAttribute("class") || "").toContain("pt-4");
  });

  it("CarouselPrevious/Next ficam disabled conforme api.canScrollPrev/Next e clique chama scroll", () => {
    canScrollPrevMock.mockReturnValue(false);
    canScrollNextMock.mockReturnValue(true);

    renderBasic();

    const prev = screen.getByTestId("carousel-previous") as HTMLButtonElement;
    const next = screen.getByTestId("carousel-next") as HTMLButtonElement;

    expect(prev.disabled).toBe(true);
    expect(next.disabled).toBe(false);

    fireEvent.click(next);
    expect(scrollNextMock).toHaveBeenCalledTimes(1);

    fireEvent.click(prev);
    expect(scrollPrevMock).toHaveBeenCalledTimes(0);
  });

  it("ArrowLeft e ArrowRight no teclado acionam scrollPrev/scrollNext", () => {
    canScrollPrevMock.mockReturnValue(true);
    canScrollNextMock.mockReturnValue(true);

    renderBasic();

    const region = screen.getByRole("region");

    fireEvent.keyDown(region, { key: "ArrowRight" });
    expect(scrollNextMock).toHaveBeenCalledTimes(1);

    fireEvent.keyDown(region, { key: "ArrowLeft" });
    expect(scrollPrevMock).toHaveBeenCalledTimes(1);
  });
});
