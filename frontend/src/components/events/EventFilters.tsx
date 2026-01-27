import { useCallback, useEffect, useState } from 'react';
import './EventFilters.css';

interface EventFiltersProps {
  onFilterChange: (filters: FilterValues) => void;
}

export interface FilterValues {
  categoria: string;
  dataInicio: string;
  dataFim: string;
}

export default function EventFilters({ onFilterChange }: EventFiltersProps) {
  const [categoria, setCategoria] = useState('');
  const [dataInicio, setDataInicio] = useState('');
  const [dataFim, setDataFim] = useState('');
  const [eventTypes, setEventTypes] = useState<{ id: number; nome: string }[]>(
    []
  );
  const [eventTypesLoading, setEventTypesLoading] = useState(false);
  const [appliedFilters, setAppliedFilters] = useState<FilterValues>({
    categoria: '',
    dataInicio: '',
    dataFim: '',
  });

  const handleApplyFilters = () => {
    const filters = { categoria, dataInicio, dataFim };
    setAppliedFilters(filters);
    onFilterChange(filters);
  };

  const handleClearFilters = () => {
    setCategoria('');
    setDataInicio('');
    setDataFim('');
    const clearedFilters = { categoria: '', dataInicio: '', dataFim: '' };
    setAppliedFilters(clearedFilters);
    onFilterChange(clearedFilters);
  };

  const hasAppliedFilters = appliedFilters.categoria || appliedFilters.dataInicio || appliedFilters.dataFim;

  const loadEventTypes = useCallback(async () => {
    if (eventTypesLoading) return;
    setEventTypesLoading(true);
    try {
      const res = await fetch('http://localhost:3001/event-types');
      const data = await res.json();
      setEventTypes(Array.isArray(data) ? data : []);
    } catch {
      setEventTypes([]);
    } finally {
      setEventTypesLoading(false);
    }
  }, [eventTypesLoading]);

  useEffect(() => {
    loadEventTypes();
  }, [loadEventTypes]);

  return (
    <div className="event-filters">
      <div className="filters-container">
        <div className="filter-group">
          <label className="filter-label" htmlFor="categoria">
            Categoria
            {eventTypesLoading && (
              <span
                className="loading-spinner"
                aria-label="Carregando tipos de evento"
                role="status"
              />
            )}
          </label>
          <select
            id="categoria"
            value={categoria}
            onChange={(e) => setCategoria(e.target.value)}
            onFocus={loadEventTypes}
          >
            <option value="">Todas as categorias</option>
            {eventTypes.map((type) => (
              <option key={type.id} value={type.nome}>
                {type.nome}
              </option>
            ))}
          </select>
        </div>

        <div className="filter-group">
          <label htmlFor="dataInicio">Data inicial</label>
          <input
            type="date"
            id="dataInicio"
            value={dataInicio}
            onChange={(e) => setDataInicio(e.target.value)}
          />
        </div>

        <div className="filter-group">
          <label htmlFor="dataFim">Data final</label>
          <input
            type="date"
            id="dataFim"
            value={dataFim}
            onChange={(e) => setDataFim(e.target.value)}
          />
        </div>

        <button className="btn-apply-filters" onClick={handleApplyFilters}>
          Aplicar filtros
        </button>

        {hasAppliedFilters && (
          <button className="btn-clear-filters" onClick={handleClearFilters}>
            Limpar filtros
          </button>
        )}
      </div>

      {hasAppliedFilters && (
        <div className="active-filters-indicator">
          <span>🔍 Filtros ativos</span>
        </div>
      )}
    </div>
  );
}
