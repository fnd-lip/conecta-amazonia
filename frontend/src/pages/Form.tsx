import { useState, useEffect } from 'react';
import './Form.css';

interface FormProps {
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
  };
  onCancel?: () => void;
}

function Form({ onSuccess, editingEvent, onCancel }: FormProps) {
  const [formData, setFormData] = useState({
    nome: '',
    descricao: '',
    data: '',
    categoria: '',
    externalLink: '',
    relatedLinks: '', // string separada por vírgula
    parentId: '',
  });
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');
  interface EventoPai {
    id: string;
    nome: string;
  }
  const [eventosPai, setEventosPai] = useState<EventoPai[]>([]);
  const isEditing = !!editingEvent;

  useEffect(() => {
    // Buscar eventos para seleção de evento pai
    fetch('http://localhost:3001/events')
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

    if (editingEvent) {
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
        }));
      });
    }
  }, [editingEvent]);

  function handleChange(
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  }

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    if (e.target.files && e.target.files[0]) {
      setLogoFile(e.target.files[0]);
    } else {
      setLogoFile(null);
    }
  }

  async function handleSubmit() {
    setLoading(true);
    setSuccess('');
    setError('');
    try {
      const token = localStorage.getItem('token');
      const url = isEditing
        ? `http://localhost:3001/events/${editingEvent.id}`
        : 'http://localhost:3001/events';
      const method = isEditing ? 'PUT' : 'POST';

      const formDataToSend = new FormData();
      Object.entries(formData).forEach(([key, value]) => {
        if (key === 'relatedLinks') {
          // Envia como array se não vazio
          const arr = value
            .split(',')
            .map((v) => v.trim())
            .filter((v) => v.length > 0);
          formDataToSend.append('relatedLinks', JSON.stringify(arr));
        } else if (key === 'parentId') {
          if (value) formDataToSend.append('parentId', value);
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

        if (!isEditing) {
          setFormData({
            nome: '',
            descricao: '',
            data: '',
            categoria: '',
            externalLink: '',
            relatedLinks: '',
            parentId: '',
          });
          setLogoFile(null);
        }

        if (onSuccess) {
          onSuccess();
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

  return (
    <>
      <div className="form-container">
        <h2>{isEditing ? 'Editar Evento' : 'Cadastro de Evento'}</h2>

        <form className="form-card" onSubmit={(e) => e.preventDefault()}>
          <div className="form-group">
            <label>Evento Pai (opcional)</label>
            <select
              name="parentId"
              value={formData.parentId}
              onChange={handleChange}
              disabled={loading}
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

          <div className="form-group">
            <label>Nome do evento</label>
            <input
              type="text"
              name="nome"
              placeholder="Ex: Festival Cultural"
              value={formData.nome}
              onChange={handleChange}
              disabled={loading}
            />
          </div>

          <div className="form-group">
            <label>Descrição</label>
            <textarea
              name="descricao"
              placeholder="Descreva o evento..."
              rows={4}
              value={formData.descricao}
              onChange={handleChange}
              disabled={loading}
            />
          </div>

          <div className="form-group">
            <label>Data</label>
            <input
              type="datetime-local"
              name="data"
              value={formData.data}
              onChange={handleChange}
              disabled={loading}
            />
          </div>

          <div className="form-group">
            <label>Categoria</label>
            <select
              name="categoria"
              value={formData.categoria}
              onChange={handleChange}
              disabled={loading}
            >
              <option value="">Selecione...</option>
              <option value="cultura">Cultura</option>
              <option value="turismo">Turismo</option>
              <option value="gastronomia">Gastronomia</option>
              <option value="festividade">Festividade</option>
            </select>
          </div>

          <div className="form-group">
            <label>Link do site oficial</label>
            <input
              type="url"
              name="externalLink"
              placeholder="https://siteoficial.com"
              value={formData.externalLink}
              onChange={handleChange}
              disabled={loading}
            />
          </div>

          <div className="form-group">
            <label>Links relacionados (separe por vírgula)</label>
            <input
              type="text"
              name="relatedLinks"
              placeholder="https://link1.com, https://link2.com"
              value={formData.relatedLinks}
              onChange={handleChange}
              disabled={loading}
            />
          </div>

          <div className="form-group">
            <label>Logo do evento</label>
            <input
              type="file"
              name="logo"
              accept="image/*"
              onChange={handleFileChange}
              disabled={loading}
            />
          </div>

          <div
            style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}
          >
            {isEditing && onCancel && (
              <button
                type="button"
                onClick={handleCancel}
                disabled={loading}
                style={{
                  padding: '12px 24px',
                  backgroundColor: '#6c757d',
                  color: 'white',
                  border: 'none',
                  borderRadius: '4px',
                  cursor: 'pointer',
                }}
              >
                Cancelar
              </button>
            )}
            <button
              type="button"
              className="btn-submit"
              onClick={handleSubmit}
              disabled={loading}
            >
              {loading
                ? 'Enviando...'
                : isEditing
                  ? 'Atualizar Evento'
                  : 'Cadastrar Evento'}
            </button>
          </div>
        </form>
        {success && (
          <div style={{ color: 'green', marginTop: 8 }}>{success}</div>
        )}
        {error && <div style={{ color: 'red', marginTop: 8 }}>{error}</div>}
      </div>
    </>
  );
}

export default Form;
