import React from "react";
import { cleanup, render, screen } from "@testing-library/react";
import MapView from "../../../components/events/MapView";

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
type EventLocation = {
  id: string;
  nome: string;
  categoria: string;
  latitude?: number | null;
  longitude?: number | null;
  locationName?: string | null;
};

type MapContainerProps = {
  children: React.ReactNode;
  center: [number, number];
  zoom: number;
  scrollWheelZoom: boolean;
  className?: string;
  style?: React.CSSProperties;
};

type TileLayerProps = { attribution: string; url: string };

type MarkerInstance = {
  openPopup: () => void;
};

type MarkerProps = {
  position: [number, number];
  children?: React.ReactNode;
  ref?: (instance: MarkerInstance | null) => void;
};

type PopupProps = { children: React.ReactNode };

type MapLike = {
  flyTo: (
    center: [number, number],
    zoom: number,
    options: { animate: boolean; duration: number }
  ) => void;
  getZoom: () => number;
};

// Mocks do react-leaflet 
const flyToMock: jest.Mock<void, [[number, number], number, { animate: boolean; duration: number }]> =
  jest.fn();
const getZoomMock: jest.Mock<number, []> = jest.fn(() => 12);

// inspecionar props passadas ao MapContainer
const MapContainerMock = jest.fn((props: MapContainerProps) => (
  <div data-testid="map">{props.children}</div>
));

const TileLayerMock = jest.fn((props: TileLayerProps) => {
  void props;
  return <div data-testid="tile-layer" />;
});

const PopupMock = jest.fn((props: PopupProps) => (
  <div data-testid="popup">{props.children}</div>
));

const markerInstancesByKey = new Map<string, MarkerInstance>();

const MarkerMock = jest.fn((props: MarkerProps & { "data-marker-key"?: string }) => {
  // cada Marker no render recebe uma instância com openPopup mockado
  const key =
    typeof props["data-marker-key"] === "string"
      ? props["data-marker-key"]
      : JSON.stringify(props.position);

  const instance: MarkerInstance = {
    openPopup: jest.fn(),
  };

  markerInstancesByKey.set(key, instance);

  // simula o comportamento do ref callback
  if (props.ref) {
    props.ref(instance);
  }

  return (
    <div data-testid="marker" data-position={JSON.stringify(props.position)}>
      {props.children}
    </div>
  );
});

jest.mock("react-leaflet", () => {
  return {
    __esModule: true,
    MapContainer: (props: MapContainerProps) => MapContainerMock(props),
    TileLayer: (props: TileLayerProps) => TileLayerMock(props),
    Marker: (props: MarkerProps) => MarkerMock(props),
    Popup: (props: PopupProps) => PopupMock(props),
    useMap: (): MapLike => ({
      flyTo: flyToMock,
      getZoom: getZoomMock,
    }),
  };
});

afterEach(() => {
  cleanup();
  jest.clearAllMocks();
  markerInstancesByKey.clear();
});

describe("MapView", () => {
  it("usa o center default quando não há eventos com latitude/longitude válidos", () => {
    const events: EventLocation[] = [
      { id: "1", nome: "A", categoria: "Cat", latitude: null, longitude: null },
      { id: "2", nome: "B", categoria: "Cat" }, // undefined
    ];

    render(<MapView events={events} focusedEventId={null} />);

    const firstCallProps = MapContainerMock.mock.calls[0]?.[0] as MapContainerProps;
    expect(firstCallProps.center).toEqual([-3.119, -60.0217]);
    expect(firstCallProps.zoom).toBe(13);
    expect(firstCallProps.scrollWheelZoom).toBe(true);
  });

  it("usa como center o primeiro evento com coords válidas", () => {
    const events: EventLocation[] = [
      { id: "a", nome: "Evento A", categoria: "Show", latitude: -3.2, longitude: -60.1 },
      { id: "b", nome: "Evento B", categoria: "Festa", latitude: -3.3, longitude: -60.2 },
    ];

    render(<MapView events={events} focusedEventId={null} />);

    const firstCallProps = MapContainerMock.mock.calls[0]?.[0] as MapContainerProps;
    expect(firstCallProps.center).toEqual([-3.2, -60.1]);
  });

  it("renderiza markers apenas para eventos com latitude/longitude finitos", () => {
    const events: EventLocation[] = [
      { id: "ok1", nome: "OK 1", categoria: "A", latitude: -3.2, longitude: -60.1 },
      { id: "bad1", nome: "BAD 1", categoria: "B", latitude: null, longitude: -60.2 },
      { id: "bad2", nome: "BAD 2", categoria: "C", latitude: -3.3, longitude: undefined },
      { id: "ok2", nome: "OK 2", categoria: "D", latitude: -3.4, longitude: -60.3 },
    ];

    render(<MapView events={events} focusedEventId={null} />);

    // Só 2 markers 
    const markers = screen.getAllByTestId("marker");
    expect(markers).toHaveLength(2);
  });

  it("mostra o conteúdo do Popup com nome, categoria e locationName quando existir", () => {
    const events: EventLocation[] = [
      {
        id: "x",
        nome: "Meu Evento",
        categoria: "Teatro",
        latitude: -3.2,
        longitude: -60.1,
        locationName: "Teatro Amazonas",
      },
    ];

    render(<MapView events={events} focusedEventId={null} />);

    expect(screen.getByText("Meu Evento")).toBeInTheDocument();
    expect(screen.getByText("Teatro")).toBeInTheDocument();
    expect(screen.getByText("Teatro Amazonas")).toBeInTheDocument();
  });

  it("quando focusedEventId aponta para um evento, chama flyTo com zoom >= 13 e animate true", () => {
    const events: EventLocation[] = [
      { id: "a", nome: "A", categoria: "Cat", latitude: -3.2, longitude: -60.1 },
      { id: "b", nome: "B", categoria: "Cat", latitude: -3.3, longitude: -60.2 },
    ];

    render(<MapView events={events} focusedEventId="b" />);

    // getZoom retorna 12 então Math.max(12,13) = 13
    expect(getZoomMock).toHaveBeenCalled();
    expect(flyToMock).toHaveBeenCalledWith([-3.3, -60.2], 13, {
      animate: true,
      duration: 0.5,
    });
  });

  it("quando focusedEventId muda, abre o popup do marker correspondente (openPopup)", () => {
    const events: EventLocation[] = [
      { id: "a", nome: "A", categoria: "Cat", latitude: -3.2, longitude: -60.1 },
      { id: "b", nome: "B", categoria: "Cat", latitude: -3.3, longitude: -60.2 },
    ];

    const { rerender } = render(<MapView events={events} focusedEventId={null} />);

    // Nenhum marker deve ter aberto popup ainda
    const allOpenPopupCallsBefore = Array.from(markerInstancesByKey.values()).reduce(
      (acc, inst) => acc + (inst.openPopup as jest.Mock).mock.calls.length,
      0
    );
    expect(allOpenPopupCallsBefore).toBe(0);

    rerender(<MapView events={events} focusedEventId="b" />);

    const allOpenPopupCallsAfter = Array.from(markerInstancesByKey.values()).reduce(
      (acc, inst) => acc + (inst.openPopup as jest.Mock).mock.calls.length,
      0
    );
    expect(allOpenPopupCallsAfter).toBe(1);
  });
});
