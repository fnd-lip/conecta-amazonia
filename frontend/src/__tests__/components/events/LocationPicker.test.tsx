import React from "react";
import { cleanup, render, screen } from "@testing-library/react";
import LocationPicker from "../../../components/events/LocationPicker";

jest.mock("leaflet/dist/leaflet.css", () => ({}));
jest.mock("leaflet/dist/images/marker-icon.png", () => "marker-icon.png");
jest.mock("leaflet/dist/images/marker-shadow.png", () => "marker-shadow.png");

// Mock do leaflet
jest.mock("leaflet", () => {
  const L = {
    icon: jest.fn(() => ({})),
    Marker: {
      prototype: {
        options: {} as Record<string, unknown>,
      },
    },
  };
  return { __esModule: true, default: L };
});

// Tipos auxiliares 
type LatLng = { lat: number; lng: number };
type LeafletClickEvent = { latlng: LatLng };

type LocationValue = { latitude: number; longitude: number };

type MapContainerProps = {
  children: React.ReactNode;
  center: [number, number];
  zoom: number;
  scrollWheelZoom: boolean;
  className?: string;
};

type MarkerProps = { position: [number, number] };
type TileLayerProps = { attribution: string; url: string };

type MapLike = {
  setView: (
    center: [number, number],
    zoom: number,
    options: { animate: boolean }
  ) => void;
  getZoom: () => number;
};

type MapEventsHandlers = {
  click?: (e: LeafletClickEvent) => void;
};

// Mocks do react-leaflet 
let lastMapEventsHandlers: MapEventsHandlers | null = null;

type SetViewArgs = [[number, number], number, { animate: boolean }];

const setViewMock: jest.Mock<void, SetViewArgs> = jest.fn();
const getZoomMock: jest.Mock<number, []> = jest.fn(() => 13);

const MapContainerMock = jest.fn((props: MapContainerProps) => (
  <div data-testid="map">{props.children}</div>
));

const TileLayerMock = jest.fn((props: TileLayerProps) => {
  void props; // evita "defined but never used"
  return <div data-testid="tile-layer" />;
});

const MarkerMock = jest.fn((props: MarkerProps) => (
  <div data-testid="marker" data-position={JSON.stringify(props.position)} />
));

jest.mock("react-leaflet", () => {
  return {
    __esModule: true,
    MapContainer: (props: MapContainerProps) => MapContainerMock(props),
    TileLayer: (props: TileLayerProps) => TileLayerMock(props),
    Marker: (props: MarkerProps) => MarkerMock(props),
    useMap: (): MapLike => ({
      setView: setViewMock,
      getZoom: getZoomMock,
    }),
    useMapEvents: (handlers: MapEventsHandlers) => {
      lastMapEventsHandlers = handlers;
      return null;
    },
  };
});

afterEach(() => {
  cleanup();
  jest.clearAllMocks();
  lastMapEventsHandlers = null;
});

describe("LocationPicker", () => {
  it("renderiza a dica (hint)", () => {
    render(<LocationPicker value={null} onSelect={jest.fn()} />);

    expect(
      screen.getByText(/Clique no mapa para ajustar a localizacao\./i)
    ).toBeInTheDocument();
  });

  it("usa o centro default quando value é null", () => {
    render(<LocationPicker value={null} onSelect={jest.fn()} />);

    const firstCallProps = MapContainerMock.mock.calls[0]?.[0] as MapContainerProps;
    expect(firstCallProps.center).toEqual([-3.119, -60.0217]);
    expect(firstCallProps.zoom).toBe(13);
    expect(firstCallProps.scrollWheelZoom).toBe(true);
  });

  it("usa o centro do value quando fornecido e renderiza o Marker", () => {
    const value: LocationValue = { latitude: -10.0, longitude: -60.5 };

    render(<LocationPicker value={value} onSelect={jest.fn()} />);

    const firstCallProps = MapContainerMock.mock.calls[0]?.[0] as MapContainerProps;
    expect(firstCallProps.center).toEqual([-10.0, -60.5]);

    const marker = screen.getByTestId("marker");
    expect(marker.getAttribute("data-position")).toBe(
      JSON.stringify([-10.0, -60.5])
    );
  });

  it("ao clicar no mapa chama onSelect com latitude/longitude do evento", () => {
    const onSelect = jest.fn();
    render(<LocationPicker value={null} onSelect={onSelect} />);

    expect(lastMapEventsHandlers?.click).toBeDefined();

    lastMapEventsHandlers?.click?.({ latlng: { lat: 1.23, lng: 4.56 } });

    expect(onSelect).toHaveBeenCalledTimes(1);
    expect(onSelect).toHaveBeenCalledWith({ latitude: 1.23, longitude: 4.56 });
  });

  it("quando value muda, chama map.setView para centralizar (animate: true)", () => {
    const onSelect = jest.fn();

    const { rerender } = render(
      <LocationPicker value={null} onSelect={onSelect} />
    );

    expect(setViewMock).not.toHaveBeenCalled();

    rerender(
      <LocationPicker
        value={{ latitude: -3.2, longitude: -60.1 }}
        onSelect={onSelect}
      />
    );

    expect(getZoomMock).toHaveBeenCalled();
    expect(setViewMock).toHaveBeenCalledWith([-3.2, -60.1], 13, {
      animate: true,
    });
  });
});
