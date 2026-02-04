import { ChevronLeft, ChevronRight, Calendar } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { API_URL } from '@/config/api';

interface CarouselEvent {
  id: string;
  nome: string;
  data?: string;
  imagem?: string | null;
  logoUrl?: string | null;
}

interface Props {
  events: CarouselEvent[];
  loading: boolean;
  error: string | null;
}

const fallbackImages = ['/icons/event-placeholder.svg'];

const apiBaseUrl = () => API_URL;

const resolveImageUrl = (url: string) =>
  url.startsWith('http') ? url : `${apiBaseUrl()}${url}`;

const normalizeImageValue = (value?: string | null) => {
  if (typeof value !== 'string') return null;
  const trimmed = value.trim();
  if (!trimmed || trimmed === 'null' || trimmed === 'undefined') return null;
  return trimmed;
};

const getImage = (event: CarouselEvent, index: number) => {
  const imagem = normalizeImageValue(event.imagem);
  if (imagem) return imagem;
  const logoUrl = normalizeImageValue(event.logoUrl);
  if (logoUrl) return resolveImageUrl(logoUrl);
  return fallbackImages[index % fallbackImages.length];
};

const formatDate = (dateString?: string) => {
  if (!dateString) return '';

  try {
    const date = new Date(dateString);
    if (isNaN(date.getTime())) {
      return dateString;
    }
    return date.toLocaleDateString('pt-BR');
  } catch {
    return dateString;
  }
};

export function EventCarousel({ events, loading, error }: Props) {
  const [activeIndex, setActiveIndex] = useState(0);
  const [containerWidth, setContainerWidth] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!containerRef.current) return;

    const updateWidth = () => {
      if (containerRef.current) {
        setContainerWidth(containerRef.current.offsetWidth);
      }
    };

    updateWidth();
    window.addEventListener('resize', updateWidth);

    return () => window.removeEventListener('resize', updateWidth);
  }, []);

  useEffect(() => {
    if (events.length <= 1) return;

    const interval = setInterval(() => {
      setActiveIndex((prev) => (prev + 1) % events.length);
    }, 5000);

    return () => clearInterval(interval);
  }, [events.length]);

  const getSlideDimensions = () => {
    if (containerWidth === 0) return { width: 734, height: 440 };

    if (containerWidth < 640) {
      const width = Math.min(300, containerWidth - 32);
      return { width, height: width * 0.6 };
    } else if (containerWidth < 1024) {
      const width = Math.min(500, containerWidth * 0.8);
      return { width, height: width * 0.6 };
    } else {
      return { width: 734, height: 440 };
    }
  };

  const { width: slideWidth, height: slideHeight } = getSlideDimensions();
  const slideGap = 8;

  const getInitialOffset = () => {
    if (containerWidth === 0) return 0;
    return (containerWidth - slideWidth) / 2;
  };

  const initialOffset = getInitialOffset();

  const handlePrev = () => {
    setActiveIndex((prev) => (prev === 0 ? events.length - 1 : prev - 1));
  };

  const handleNext = () => {
    setActiveIndex((prev) => (prev === events.length - 1 ? 0 : prev + 1));
  };

  const getSlidePosition = (index: number) => {
    const basePosition = index * (slideWidth + slideGap);

    const activePosition = activeIndex * (slideWidth + slideGap);
    const centerPosition = initialOffset;

    const offsetNeeded = centerPosition - activePosition;

    return basePosition + offsetNeeded;
  };

  if (loading) {
    return (
      <div ref={containerRef} className="w-full py-12 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="flex justify-center gap-4">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="rounded-2xl bg-gray-200 animate-pulse"
                style={{
                  width: slideWidth,
                  height: slideHeight,
                }}
              />
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="w-full py-12 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
            <p className="text-red-600 font-medium">{error}</p>
          </div>
        </div>
      </div>
    );
  }

  if (events.length === 0) {
    return (
      <div className="w-full py-12 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="bg-gray-50 border border-gray-200 rounded-lg p-6 text-center">
            <p className="text-gray-600">Nenhum evento disponível</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div
      ref={containerRef}
      className="relative w-full overflow-hidden py-12 px-4"
    >
      <div className="max-w-7xl mx-auto relative">
        <div className="relative" style={{ height: slideHeight }}>
          {events.map((event, index) => {
            const isActive = index === activeIndex;
            const isAdjacent = Math.abs(index - activeIndex) === 1;
            const isVisible = Math.abs(index - activeIndex) <= 2;

            return (
              <div
                key={event.id}
                className="absolute rounded-2xl overflow-hidden transition-all duration-500 cursor-pointer will-change-transform"
                style={{
                  left: getSlidePosition(index),
                  width: slideWidth,
                  height: slideHeight,
                  transform: isActive
                    ? 'scale(1) translateZ(0)'
                    : isAdjacent
                      ? `scale(0.85) translateX(${index > activeIndex ? '60px' : '-60px'})`
                      : 'scale(0.7)',
                  opacity: isVisible ? 1 : 0,
                  zIndex: isActive ? 20 : isAdjacent ? 10 : 0,
                  filter: isActive ? 'none' : 'brightness(0.8)',
                }}
                onClick={() => setActiveIndex(index)}
              >
                <div
                  className="absolute inset-0 bg-cover bg-center transition-transform duration-700 hover:scale-110"
                  style={{
                    backgroundImage: `url(${getImage(event, index)})`,
                  }}
                />

                <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-black/50 to-transparent" />

                <div className="relative h-full p-6 flex flex-col justify-end text-white">
                  <h3 className="text-xl md:text-2xl font-bold leading-tight line-clamp-2">
                    {event.nome}
                  </h3>

                  {event.data && (
                    <div className="flex items-center gap-2 mt-3 text-sm opacity-90">
                      <Calendar className="w-4 h-4 flex-shrink-0" />
                      <span>{formatDate(event.data)}</span>
                    </div>
                  )}

                  <button
                    className="mt-6 self-start px-5 py-2 bg-white text-black font-semibold rounded-full hover:bg-white/90 transition-colors hover:scale-105 active:scale-95"
                    onClick={(e) => {
                      e.stopPropagation();
                      window.location.href = `/eventos/${event.id}`;
                    }}
                  >
                    Ver detalhes
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        {events.length > 1 && (
          <>
            <button
              onClick={handlePrev}
              className="absolute left-4 top-1/2 -translate-y-1/2 z-30 w-10 h-10 rounded-full bg-white/90 hover:bg-white shadow-lg flex items-center justify-center transition-all hover:scale-110 disabled:opacity-50"
              disabled={events.length <= 1}
              aria-label="Evento anterior"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>

            <button
              onClick={handleNext}
              className="absolute right-4 top-1/2 -translate-y-1/2 z-30 w-10 h-10 rounded-full bg-white/90 hover:bg-white shadow-lg flex items-center justify-center transition-all hover:scale-110 disabled:opacity-50"
              disabled={events.length <= 1}
              aria-label="Próximo evento"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </>
        )}

        {events.length > 1 && (
          <div className="flex justify-center gap-2 mt-8">
            {events.map((_, index) => (
              <button
                key={index}
                onClick={() => setActiveIndex(index)}
                className={`w-2 h-2 rounded-full transition-all duration-300 ${
                  index === activeIndex
                    ? 'bg-black w-8'
                    : 'bg-gray-300 hover:bg-gray-400'
                }`}
                aria-label={`Ir para slide ${index + 1}`}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
