import { useState } from 'react';
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

  return (
    <div className="event-filters">
      <div className="filters-container">
        <div className="filter-group">
          <label htmlFor="categoria">Categoria</label>
          <select
            id="categoria"
            value={categoria}
            onChange={(e) => setCategoria(e.target.value)}
          >
            <option value="">Todas as categorias</option>
            <option value="cultura">Cultura</option>
            <option value="turismo">Turismo</option>
            <option value="gastronomia">Gastronomia</option>
            <option value="festividade">Festividade</option>
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
