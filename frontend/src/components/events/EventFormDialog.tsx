import { useState, useEffect, useCallback } from 'react';
import LocationPicker from './LocationPicker';
import TicketLotManager from './TicketLotManager';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Separator } from '../ui/separator';
import { ScrollArea } from '../ui/scroll-area';
import { API_URL } from '@/config/api';
import './EventFormDialog.css';

interface EventFormDialogProps {
  onSuccess?: () => void;
  editingEvent?: {
    id: string;
    nome: string;
    descricao: string;
    data: string;
    categoria: string;
    externalLink?: string;
    relatedLinks?: string[];
    parentId?: string;
    latitude?: number | null;
    longitude?: number | null;
    locationName?: string | null;
  };
  onCancel?: () => void;
}

interface EventoPai {
  id: string;
  nome: string;
}

interface EventType {
  id: number;
  nome: string;
}

interface LocationResult {
  display_name: string;
  lat: string;
  lon: string;
}

function EventFormDialog({
  onSuccess,
  editingEvent,
  onCancel,
}: EventFormDialogProps) {
  const [formData, setFormData] = useState({
    nome: '',
    descricao: '',
    data: '',
    categoria: '',
    externalLink: '',
    relatedLinks: '',
    parentId: '',
    locationName: '',
    latitude: '',
    longitude: '',
  });
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');
  const [locationQuery, setLocationQuery] = useState('');
  const [locationResults, setLocationResults] = useState<LocationResult[]>([]);
  const [isSearchingLocation, setIsSearchingLocation] = useState(false);
  const [selectedLocation, setSelectedLocation] = useState<{
    latitude: number;
    longitude: number;
    locationName: string;
  } | null>(null);
  const [eventosPai, setEventosPai] = useState<EventoPai[]>([]);
  const [eventTypes, setEventTypes] = useState<EventType[]>([]);
  const [eventTypesLoading, setEventTypesLoading] = useState(false);
  const [createdEventId, setCreatedEventId] = useState<string | null>(null);
  const [currentStep, setCurrentStep] = useState(1);
  const isEditing = !!editingEvent;

  const loadEventTypes = useCallback(async () => {
    if (eventTypesLoading) return;
    setEventTypesLoading(true);
    try {
      const res = await fetch(`${API_URL}/event-types`);
      const data = await res.json();
      setEventTypes(Array.isArray(data) ? data : []);
    } catch {
      setEventTypes([]);
    } finally {
      setEventTypesLoading(false);
    }
  }, [eventTypesLoading]);

  useEffect(() => {
    fetch(`${API_URL}/events/all`)
      .then((res) => res.json())
      .then((data) => {
        const eventos: EventoPai[] = Array.isArray(data)
          ? data.map((e: { id: string; nome: string }) => ({
              id: e.id,
              nome: e.nome,
            }))
          : (data.events as EventoPai[]);
        setEventosPai(eventos);
      })
      .catch(() => setEventosPai([]));

    loadEventTypes();

    if (editingEvent) {
      setCreatedEventId(editingEvent.id);
      const dateForInput = new Date(editingEvent.data)
        .toISOString()
        .slice(0, 16);
      Promise.resolve().then(() => {
        setFormData((prev) => ({
          ...prev,
          nome: editingEvent.nome,
          descricao: editingEvent.descricao,
          data: dateForInput,
          categoria: editingEvent.categoria,
          externalLink: editingEvent.externalLink || '',
          relatedLinks: (editingEvent.relatedLinks || []).join(', '),
          parentId: editingEvent.parentId || '',
          locationName: editingEvent.locationName || '',
          latitude:
            editingEvent.latitude !== null &&
            editingEvent.latitude !== undefined
              ? String(editingEvent.latitude)
              : '',
          longitude:
            editingEvent.longitude !== null &&
            editingEvent.longitude !== undefined
              ? String(editingEvent.longitude)
              : '',
        }));
        if (
          editingEvent.latitude !== null &&
          editingEvent.latitude !== undefined &&
          editingEvent.longitude !== null &&
          editingEvent.longitude !== undefined
        ) {
          setSelectedLocation({
            latitude: editingEvent.latitude,
            longitude: editingEvent.longitude,
            locationName: editingEvent.locationName || '',
          });
        } else {
          setSelectedLocation(null);
        }
        setLocationQuery(editingEvent.locationName || '');
      });
    }
  }, [editingEvent, loadEventTypes]);

  function handleChange(
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  }

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) {
      setLogoFile(null);
      return;
    }

    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp'];
    const maxSizeBytes = 5 * 1024 * 1024;

    if (!allowedTypes.includes(file.type)) {
      setError('Formato de imagem inválido. Use JPG, PNG ou WebP.');
      setLogoFile(null);
      return;
    }

    if (file.size > maxSizeBytes) {
      setError('Imagem muito grande. Tamanho máximo permitido: 5MB.');
      setLogoFile(null);
      return;
    }

    setError('');
    setLogoFile(file);
  }

  useEffect(() => {
    const query = locationQuery.trim();
    if (query.length < 3) {
      setLocationResults([]);
      setIsSearchingLocation(false);
      return;
    }

    const controller = new AbortController();
    const timeout = setTimeout(async () => {
      try {
        setIsSearchingLocation(true);
        const res = await fetch(
          `https://nominatim.openstreetmap.org/search?format=json&limit=5&q=${encodeURIComponent(
            query
          )}`,
          { signal: controller.signal }
        );
        if (!res.ok) throw new Error('Search failed');
        const data = await res.json();
        setLocationResults(Array.isArray(data) ? data : []);
      } catch {
        setLocationResults([]);
      } finally {
        setIsSearchingLocation(false);
      }
    }, 400);

    return () => {
      controller.abort();
      clearTimeout(timeout);
    };
  }, [locationQuery]);

  const updateLocationFields = (payload: {
    latitude: number;
    longitude: number;
    locationName: string;
  }) => {
    setSelectedLocation(payload);
    setFormData((prev) => ({
      ...prev,
      latitude: String(payload.latitude),
      longitude: String(payload.longitude),
      locationName: payload.locationName,
    }));
  };

  const handleSelectLocation = (result: LocationResult) => {
    const latitude = parseFloat(result.lat);
    const longitude = parseFloat(result.lon);
    if (Number.isNaN(latitude) || Number.isNaN(longitude)) return;

    updateLocationFields({
      latitude,
      longitude,
      locationName: result.display_name,
    });
    setLocationQuery(result.display_name);
    setLocationResults([]);
  };

  const handleMapSelect = async (value: {
    latitude: number;
    longitude: number;
  }) => {
    const latitude = value.latitude;
    const longitude = value.longitude;
    let locationName = 'Localização selecionada';

    try {
      const res = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}`
      );
      if (res.ok) {
        const data = await res.json();
        if (data && data.display_name) {
          locationName = data.display_name as string;
          setLocationQuery(locationName);
          setLocationResults([]);
        }
      }
    } catch (err) {
      // Falha ao buscar nome da localização
      console.error('Erro ao buscar endereço:', err);
    }

    updateLocationFields({ latitude, longitude, locationName });
  };

  async function handleSubmit() {
    setLoading(true);
    setSuccess('');
    setError('');
    try {
      const token = localStorage.getItem('token');
      const url = isEditing
        ? `${API_URL}/events/${editingEvent.id}`
        : `${API_URL}/events`;
      const method = isEditing ? 'PUT' : 'POST';

      const formDataToSend = new FormData();
      Object.entries(formData).forEach(([key, value]) => {
        if (key === 'relatedLinks') {
          const arr = value
            .split(',')
            .map((v) => v.trim())
            .filter((v) => v.length > 0);
          formDataToSend.append('relatedLinks', JSON.stringify(arr));
        } else if (key === 'parentId') {
          if (value) formDataToSend.append('parentId', value);
        } else if (
          (key === 'latitude' ||
            key === 'longitude' ||
            key === 'locationName') &&
          !value
        ) {
          return;
        } else {
          formDataToSend.append(key, value);
        }
      });
      if (logoFile) {
        formDataToSend.append('logo', logoFile);
      }

      const response = await fetch(url, {
        method,
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formDataToSend,
      });
      const result = await response.json();
      if (response.ok) {
        const successMessage = isEditing
          ? 'Evento atualizado com sucesso!'
          : 'Evento cadastrado com sucesso!';
        setSuccess(successMessage);

        if (result.id) {
          setCreatedEventId(result.id);
        }

        // Sempre oferece a opção de ir para ingressos após salvar
        // Mas não muda automaticamente se estiver editando
        if (!isEditing) {
          setCurrentStep(2);
        }
      } else {
        setError(
          result.error ||
            `Erro ao ${isEditing ? 'atualizar' : 'cadastrar'} evento`
        );
      }
    } catch {
      setError(`Erro de conexão com a API`);
    }
    setLoading(false);
  }

  const handleCancel = () => {
    if (onCancel) {
      onCancel();
    }
  };

  const handleFinish = () => {
    if (onSuccess) {
      onSuccess();
    }
  };

  return (
    <div className="event-form-dialog">
      {/* Steps Indicator */}
      <div className="steps-container">
        <div className={`step ${currentStep >= 1 ? 'active' : ''}`}>
          <div className="step-number">1</div>
          <div className="step-label">Dados do Evento</div>
        </div>
        <div className="step-divider" />
        <div className={`step ${currentStep >= 2 ? 'active' : ''}`}>
          <div className="step-number">2</div>
          <div className="step-label">Ingressos (Opcional)</div>
        </div>
      </div>

      {currentStep === 1 && (
        <ScrollArea className="h-[calc(85vh-180px)]">
          <form onSubmit={(e) => e.preventDefault()} className="event-form">
            <div className="form-section">
              <h3 className="section-title">📝 Informações Básicas</h3>
              <div className="form-grid">
                <div className="form-field full-width">
                  <label>Evento Pai (opcional)</label>
                  <select
                    name="parentId"
                    value={formData.parentId}
                    onChange={handleChange}
                    disabled={loading}
                    className="form-select"
                  >
                    <option value="">Nenhum (evento principal)</option>
                    {eventosPai
                      .filter((e) => !isEditing || e.id !== editingEvent?.id)
                      .map((e) => (
                        <option key={e.id} value={e.id}>
                          {e.nome}
                        </option>
                      ))}
                  </select>
                </div>

                <div className="form-field full-width">
                  <label>Nome do evento *</label>
                  <Input
                    type="text"
                    name="nome"
                    placeholder="Ex: Festival Cultural 2026"
                    value={formData.nome}
                    onChange={handleChange}
                    disabled={loading}
                    required
                  />
                </div>

                <div className="form-field full-width">
                  <label>Descrição *</label>
                  <textarea
                    name="descricao"
                    placeholder="Descreva o evento..."
                    rows={4}
                    value={formData.descricao}
                    onChange={handleChange}
                    disabled={loading}
                    className="form-textarea"
                    required
                  />
                </div>

                <div className="form-field">
                  <label>Data e Hora *</label>
                  <Input
                    type="datetime-local"
                    name="data"
                    value={formData.data}
                    onChange={handleChange}
                    disabled={loading}
                    required
                  />
                </div>

                <div className="form-field">
                  <label>
                    Categoria *
                    {eventTypesLoading && (
                      <span className="loading-indicator"> Carregando...</span>
                    )}
                  </label>
                  <select
                    name="categoria"
                    value={formData.categoria}
                    onChange={handleChange}
                    onFocus={loadEventTypes}
                    disabled={loading}
                    className="form-select"
                    required
                  >
                    <option value="">Selecione...</option>
                    {eventTypes.map((type) => (
                      <option key={type.id} value={type.nome}>
                        {type.nome}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            <Separator className="my-6" />

            <div className="form-section">
              <h3 className="section-title">🔗 Links e Recursos</h3>
              <div className="form-grid">
                <div className="form-field full-width">
                  <label>Link do site oficial</label>
                  <Input
                    type="url"
                    name="externalLink"
                    placeholder="https://siteoficial.com"
                    value={formData.externalLink}
                    onChange={handleChange}
                    disabled={loading}
                  />
                </div>

                <div className="form-field full-width">
                  <label>Links relacionados (separe por vírgula)</label>
                  <Input
                    type="text"
                    name="relatedLinks"
                    placeholder="https://link1.com, https://link2.com"
                    value={formData.relatedLinks}
                    onChange={handleChange}
                    disabled={loading}
                  />
                </div>

                <div className="form-field full-width">
                  <label>Logo do evento</label>
                  <Input
                    type="file"
                    name="logo"
                    accept="image/jpeg,image/png,image/webp"
                    onChange={handleFileChange}
                    disabled={loading}
                  />
                  <small className="text-muted">
                    Formatos aceitos: JPG, PNG, WebP (máx. 5MB)
                  </small>
                </div>
              </div>
            </div>

            <Separator className="my-6" />

            <div className="form-section">
              <h3 className="section-title">📍 Localização</h3>
              <div className="form-grid">
                <div className="form-field full-width">
                  <label>Endereço do evento</label>
                  <Input
                    type="text"
                    name="locationSearch"
                    placeholder="Digite um endereço ou ponto de referência"
                    value={locationQuery}
                    onChange={(e) => {
                      setLocationQuery(e.target.value);
                      setSelectedLocation(null);
                      setFormData((prev) => ({
                        ...prev,
                        locationName: '',
                        latitude: '',
                        longitude: '',
                      }));
                    }}
                    disabled={loading}
                  />
                  {isSearchingLocation && (
                    <div className="location-helper">Buscando endereços...</div>
                  )}
                  {!isSearchingLocation &&
                    locationQuery.length >= 3 &&
                    locationResults.length === 0 && (
                      <div className="location-helper">
                        Nenhum resultado encontrado.
                      </div>
                    )}
                  {locationResults.length > 0 && (
                    <div className="location-results">
                      {locationResults.map((result) => (
                        <button
                          key={`${result.lat}-${result.lon}`}
                          type="button"
                          className="location-result-item"
                          onClick={() => handleSelectLocation(result)}
                        >
                          {result.display_name}
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                <div className="form-field full-width">
                  <label>Mapa</label>
                  <LocationPicker
                    value={
                      selectedLocation
                        ? {
                            latitude: selectedLocation.latitude,
                            longitude: selectedLocation.longitude,
                          }
                        : null
                    }
                    onSelect={handleMapSelect}
                  />
                  {selectedLocation && (
                    <div className="location-coords">
                      📌 Lat: {selectedLocation.latitude.toFixed(6)} | Lng:{' '}
                      {selectedLocation.longitude.toFixed(6)}
                    </div>
                  )}
                </div>
              </div>
            </div>

            {success && (
              <div className="success-message">
                ✅ {success}
                {(createdEventId || editingEvent?.id) && (
                  <div style={{ marginTop: '0.75rem' }}>
                    <Button
                      type="button"
                      size="sm"
                      onClick={() => setCurrentStep(2)}
                      variant="outline"
                    >
                      🎫 Gerenciar Ingressos →
                    </Button>
                  </div>
                )}
              </div>
            )}
            {error && <div className="error-message">❌ {error}</div>}

            <div className="form-actions">
              {onCancel && (
                <Button type="button" variant="outline" onClick={handleCancel}>
                  Cancelar
                </Button>
              )}
              {(createdEventId || editingEvent?.id) && (
                <Button
                  type="button"
                  variant="secondary"
                  onClick={() => setCurrentStep(2)}
                >
                  🎫 Ir para Ingressos →
                </Button>
              )}
              <Button type="button" onClick={handleSubmit} disabled={loading}>
                {loading
                  ? '⏳ Salvando...'
                  : isEditing
                    ? '💾 Atualizar Evento'
                    : '✨ Criar Evento'}
              </Button>
            </div>
          </form>
        </ScrollArea>
      )}

      {currentStep === 2 && (
        <ScrollArea className="h-[calc(85vh-180px)]">
          <div className="tickets-step">
            <TicketLotManager
              eventId={createdEventId || (editingEvent?.id ?? null)}
            />

            <div className="form-actions">
              <Button
                type="button"
                variant="outline"
                onClick={() => setCurrentStep(1)}
              >
                ← Voltar
              </Button>
              <Button type="button" onClick={handleFinish}>
                ✅ Concluir
              </Button>
            </div>
          </div>
        </ScrollArea>
      )}
    </div>
  );
}

export default EventFormDialog;
