import { useEffect, useRef, useState, type ReactNode } from 'react';
import { createPortal } from 'react-dom';
import { X, Send, MapPin } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { API_URL } from '@/config/api';
import './AssistantChat.css';

type ChatMessage = {
  role: 'user' | 'assistant';
  content: string;
};

type RecommendedEvent = {
  id: string;
  nome: string;
  categoria: string;
  data: string;
  locationName: string | null;
};

interface AssistantChatProps {
  open: boolean;
  onClose: () => void;
}

export default function AssistantChat({ open, onClose }: AssistantChatProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [recommended, setRecommended] = useState<RecommendedEvent[]>([]);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const typingRef = useRef<number | null>(null);

  useEffect(() => {
    if (containerRef.current) {
      containerRef.current.scrollTop = containerRef.current.scrollHeight;
    }
  }, [messages, open]);

  const stopTyping = () => {
    if (typingRef.current !== null) {
      window.clearTimeout(typingRef.current);
      typingRef.current = null;
    }
  };

  const renderInline = (text: string) => {
    const parts: ReactNode[] = [];
    const pattern = /\*\*(.+?)\*\*/g;
    let lastIndex = 0;
    let match: RegExpExecArray | null;

    while ((match = pattern.exec(text))) {
      if (match.index > lastIndex) {
        parts.push(text.slice(lastIndex, match.index));
      }
      parts.push(<strong key={`${match.index}-${match[1]}`}>{match[1]}</strong>);
      lastIndex = match.index + match[0].length;
    }

    if (lastIndex < text.length) {
      parts.push(text.slice(lastIndex));
    }

    return parts;
  };

  const renderAssistantContent = (content: string) => {
    const lines = content.split('\n');
    const blocks: ReactNode[] = [];
    let listItems: ReactNode[] = [];

    const flushList = (key: string) => {
      if (listItems.length > 0) {
        blocks.push(
          <ul key={key} className="assistant-list">
            {listItems}
          </ul>
        );
        listItems = [];
      }
    };

    lines.forEach((line, index) => {
      const trimmed = line.trim();
      if (!trimmed) {
        flushList(`list-${index}`);
        return;
      }

      if (trimmed.startsWith('- ')) {
        const itemText = trimmed.slice(2);
        listItems.push(
          <li key={`item-${index}`}>{renderInline(itemText)}</li>
        );
        return;
      }

      flushList(`list-${index}`);
      blocks.push(
        <p key={`p-${index}`} className="assistant-paragraph">
          {renderInline(trimmed)}
        </p>
      );
    });

    flushList('list-end');
    return blocks;
  };

  const handleSend = async () => {
    const text = input.trim();
    if (!text || loading) return;

    const isFirstMessage = messages.every(
      (message) => message.role !== 'assistant'
    );
    stopTyping();
    setInput('');
    setRecommended([]);
    setMessages((prev) => [
      ...prev,
      { role: 'user', content: text },
      { role: 'assistant', content: '' },
    ]);
    setLoading(true);

    const updateAssistantContent = (content: string) => {
      setMessages((prev) => {
        const updated = [...prev];
        for (let i = updated.length - 1; i >= 0; i -= 1) {
          if (updated[i].role === 'assistant') {
            updated[i] = { ...updated[i], content };
            return updated;
          }
        }
        return [...prev, { role: 'assistant', content }];
      });
    };

    const typeReply = (content: string) => {
      stopTyping();
      if (!content) {
        updateAssistantContent('Nao consegui responder agora. Tente novamente.');
        return;
      }

      let index = 0;
      const step = () => {
        index += 1;
        updateAssistantContent(content.slice(0, index));
        if (index < content.length) {
          typingRef.current = window.setTimeout(step, 18);
        } else {
          typingRef.current = null;
        }
      };
      step();
    };

    const fallbackAsk = async () => {
      try {
        const response = await fetch(`${API_URL}/assistant/ask`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ message: text, firstMessage: isFirstMessage }),
        });
        if (!response.ok) {
          const body = await response.text();
          console.error('Assistente fallback erro:', response.status, body);
          typeReply('Nao consegui responder agora. Tente novamente.');
          return;
        }
        const data = await response.json();
        if (Array.isArray(data?.events)) {
          setRecommended(data.events);
        }
        typeReply(data?.reply || 'Nao consegui responder agora. Tente novamente.');
      } catch (error) {
        console.error('Assistente fallback erro geral:', error);
        typeReply('Nao consegui responder agora. Tente novamente.');
      }
    };

    try {
      const response = await fetch(`${API_URL}/assistant/stream`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: text, firstMessage: isFirstMessage }),
      });

      if (!response.ok) {
        const text = await response.text();
        console.error('Assistente erro HTTP:', response.status, text);
        throw new Error('Erro ao falar com o assistente.');
      }

      if (!response.body) {
        throw new Error('Sem resposta do assistente.');
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let buffer = '';
      let receivedDelta = false;

      const appendDelta = (delta: string) => {
        receivedDelta = true;
        setMessages((prev) => {
          const updated = [...prev];
          for (let i = updated.length - 1; i >= 0; i -= 1) {
            if (updated[i].role === 'assistant') {
              updated[i] = {
                ...updated[i],
                content: updated[i].content + delta,
              };
              break;
            }
          }
          return updated;
        });
      };

      const setAssistantError = (content: string) => {
        setMessages((prev) => {
          const updated = [...prev];
          for (let i = updated.length - 1; i >= 0; i -= 1) {
            if (updated[i].role === 'assistant') {
              updated[i] = {
                ...updated[i],
                content,
              };
              break;
            }
          }
          return updated;
        });
      };

      while (true) {
        const { value, done } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n');
        buffer = lines.pop() || '';

        for (const line of lines) {
          const trimmed = line.trim();
          if (!trimmed.startsWith('data:')) continue;
          const data = trimmed.replace(/^data:\s*/, '');
          if (data === '[DONE]') {
            if (!receivedDelta) {
              await fallbackAsk();
            }
            setLoading(false);
            return;
          }

          try {
            const payload = JSON.parse(data) as { delta?: string; error?: string };
            if (payload.error) {
              console.error('Assistente erro stream:', payload.error);
              throw new Error(payload.error);
            }
            if (Array.isArray((payload as any).events)) {
              setRecommended((payload as any).events);
            }
            if (payload.delta) {
              appendDelta(payload.delta);
            }
          } catch (parseError) {
            console.error('Assistente erro parse:', parseError);
            setAssistantError('Desculpe, tive um problema ao buscar recomendacoes.');
            throw parseError;
          }
        }
      }

      if (!receivedDelta) {
        await fallbackAsk();
      }
    } catch (error) {
      console.error('Assistente erro geral:', error);
      await fallbackAsk();
    } finally {
      setLoading(false);
    }
  };

  if (!open || typeof document === 'undefined') return null;

  return createPortal(
    <div className="assistant-chat">
      <div className="assistant-header">
        <div>
          <strong>Nara</strong>
          <span>Guia de eventos da Conecta Amazonia</span>
        </div>
        <button
          className="assistant-close"
          onClick={onClose}
          aria-label="Fechar assistente"
        >
          <X size={18} />
        </button>
      </div>

      <div className="assistant-messages" ref={containerRef}>
        {messages.length === 0 ? (
          <div className="assistant-empty">
            Pergunte sobre eventos e eu recomendo opcoes pra voce.
          </div>
        ) : (
          messages.map((message, index) => (
            <div
              key={`${message.role}-${index}`}
              className={`assistant-message ${message.role}`}
            >
              {message.role === 'assistant' &&
              message.content === '' &&
              loading ? (
                <span className="typing-indicator" aria-label="Digitando">
                  <span />
                  <span />
                  <span />
                </span>
              ) : message.role === 'assistant' ? (
                renderAssistantContent(message.content)
              ) : (
                message.content
              )}
            </div>
          ))
        )}
      </div>

      {recommended.length > 0 && (
        <div className="assistant-recommended">
          <div className="assistant-recommended-title">
            Eventos sugeridos
          </div>
          <div className="assistant-recommended-list">
            {recommended.map((event) => (
              <button
                key={event.id}
                className="assistant-recommended-item"
                onClick={() => {
                  window.dispatchEvent(
                    new CustomEvent('assistant-focus-event', {
                      detail: { id: event.id },
                    })
                  );
                  const mapSection = document.getElementById(
                    'events-map-section'
                  );
                  if (mapSection) {
                    mapSection.scrollIntoView({ behavior: 'smooth' });
                  }
                }}
              >
                <MapPin size={14} />
                <span>{event.nome}</span>
              </button>
            ))}
          </div>
        </div>
      )}

      <div className="assistant-input">
        <input
          type="text"
          placeholder="Ex: eventos culturais para este mes"
          value={input}
          onChange={(event) => setInput(event.target.value)}
          onKeyDown={(event) => event.key === 'Enter' && handleSend()}
          disabled={loading}
        />
        <Button
          size="icon"
          className="assistant-send"
          onClick={handleSend}
          disabled={loading}
          aria-label="Enviar mensagem"
        >
          <Send size={16} />
        </Button>
      </div>
    </div>,
    document.body
  );
}
