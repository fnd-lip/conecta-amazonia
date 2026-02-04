import { useState, useEffect, useRef } from 'react';
import { Search, Loader2 } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { API_URL } from '@/config/api'; 

export interface AutocompleteEvent {
  id: string;
  nome: string;
  categoria: string;
  data: string;
  locationName?: string | null;
}

interface EventAutocompleteProps {
  onSelectSuggestion: (event: AutocompleteEvent) => void;
  onSearchSubmit: (term: string) => void;
  className?: string;
}

export function EventAutocomplete({
  onSelectSuggestion,
  onSearchSubmit,
  className,
}: EventAutocompleteProps) {
  const [query, setQuery] = useState('');
  const [suggestions, setSuggestions] = useState<AutocompleteEvent[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [isSearching, setIsSearching] = useState(false);

  const wrapperRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const delayDebounceFn = setTimeout(async () => {
      if (query.length >= 2) {
        setIsSearching(true);
        try {
          const res = await fetch(
            `${API_URL}/events/search?q=${encodeURIComponent(query)}`
          );
          if (res.ok) {
            const data = await res.json();
            setSuggestions(data);
            setShowSuggestions(true);
          }
        } catch (error) {
          console.error('Erro autocomplete:', error);
        } finally {
          setIsSearching(false);
        }
      } else {
        setSuggestions([]);
        setShowSuggestions(false);
      }
    }, 200);

    return () => clearTimeout(delayDebounceFn);
  }, [query]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      setShowSuggestions(false);
      onSearchSubmit(query);
    }
  };

  const handleSuggestionClick = (event: AutocompleteEvent) => {
    setQuery(event.nome);
    setShowSuggestions(false);
    onSelectSuggestion(event);
  };

  return (
    <div ref={wrapperRef} className={`relative z-20 ${className}`}>
      <div className="flex gap-2">
        <div className="relative w-full">
          <Input
            placeholder="Busque por evento ou cidade..."
            className="rounded-md bg-white pr-8"
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);

              if (e.target.value === '') onSearchSubmit('');
            }}
            onKeyDown={handleKeyDown}
          />
          {isSearching && (
            <div className="absolute right-3 top-2.5">
              <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
            </div>
          )}
        </div>
        <Button
          size="icon"
          className="bg-[#1A4331] hover:bg-[#153628] text-white w-10 shrink-0"
          onClick={() => {
            setShowSuggestions(false);
            onSearchSubmit(query);
          }}
        >
          <Search className="h-4 w-4" />
        </Button>
      </div>

      {showSuggestions && suggestions.length > 0 && (
        <div className="absolute top-full left-0 right-0 mt-1 bg-white border rounded-md shadow-lg max-h-60 overflow-y-auto z-50">
          {suggestions.map((suggestion) => (
            <div
              key={suggestion.id}
              className="p-3 hover:bg-gray-100 cursor-pointer border-b last:border-0 flex items-center justify-between"
              onClick={() => handleSuggestionClick(suggestion)}
            >
              <div>
                <p className="font-medium text-sm text-gray-800">
                  {suggestion.nome}
                </p>
                <p className="text-xs text-gray-500">
                  {suggestion.locationName || 'Local não informado'} •{' '}
                  {new Date(suggestion.data).toLocaleDateString()}
                </p>
              </div>
              <span className="text-[10px] bg-gray-200 px-2 py-0.5 rounded text-gray-600 uppercase">
                {suggestion.categoria}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
