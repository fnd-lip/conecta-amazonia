import { Request, Response } from 'express';
import prisma from '../../config/prisma';
import logger from '../../config/logger';
import { assistantAsk, assistantStream } from './assistant.provider';

type EventSummary = {
  id: string;
  nome: string;
  descricao: string;
  data: Date;
  categoria: string;
  locationName: string | null;
};

function buildContext(events: EventSummary[], firstMessage: boolean) {
  const lines = events.map((event) => {
    const date = event.data.toISOString();
    const location = event.locationName || 'Local a definir';
    return `- ${event.nome} | ${event.categoria} | ${date} | ${location} | ${event.descricao}`;
  });

  return [
    'Voce e um assistente que recomenda eventos para usuarios.',
    firstMessage
      ? 'Se apresente brevemente apenas na primeira interacao.'
      : 'Nao se apresente novamente.',
    'Use apenas os eventos listados. Seja direta e amigavel.',
    'Use emojis apenas quando fizer sentido e de forma moderada.',
    'Se nao houver eventos adequados, sugira ajustar filtros.',
    'Eventos disponiveis:',
    ...lines,
  ].join('\n');
}

async function loadEvents() {
  const events = await prisma.event.findMany({
    where: { parentId: null },
    select: {
      id: true,
      nome: true,
      descricao: true,
      data: true,
      locationName: true,
      eventType: { select: { nome: true } },
    },
    orderBy: { data: 'asc' },
    take: 50,
  });

  return events.map((event) => ({
    id: event.id,
    nome: event.nome,
    descricao: event.descricao,
    data: event.data,
    categoria: event.eventType.nome,
    locationName: event.locationName,
  }));
}

function rankEvents(events: EventSummary[], message: string) {
  const tokens = message
    .toLowerCase()
    .split(/[\s,.;:!?]+/)
    .filter((token) => token.length > 2);

  if (tokens.length === 0) return [];

  return events
    .map((event) => {
      const haystack = [
        event.nome,
        event.descricao,
        event.categoria,
        event.locationName || '',
      ]
        .join(' ')
        .toLowerCase();
      const score = tokens.reduce(
        (total, token) => (haystack.includes(token) ? total + 1 : total),
        0
      );
      return { event, score };
    })
    .filter((item) => item.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, 10)
    .map(({ event }) => ({
      id: event.id,
      nome: event.nome,
      categoria: event.categoria,
      data: event.data,
      locationName: event.locationName,
    }));
}

export class AssistantController {
  static async ask(req: Request, res: Response) {
    try {
      const { message, firstMessage } = req.body as {
        message?: string;
        firstMessage?: boolean;
      };
      if (!message || !message.trim()) {
        return res.status(400).json({ message: 'Mensagem obrigatoria.' });
      }

      const events = await loadEvents();
      const prompt = buildContext(events, Boolean(firstMessage));

      const reply = await assistantAsk(prompt, message.trim());
      const recommendations = rankEvents(events, message.trim());
      return res.json({ reply, events: recommendations });
    } catch (error) {
      logger.error({ error }, 'Erro ao chamar assistente');
      return res.status(500).json({ message: 'Erro interno do servidor' });
    }
  }

  static async stream(req: Request, res: Response) {
    const { message, firstMessage } = req.body as {
      message?: string;
      firstMessage?: boolean;
    };
    if (!message || !message.trim()) {
      return res.status(400).json({ message: 'Mensagem obrigatoria.' });
    }

    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');
    res.write(`data: ${JSON.stringify({ status: 'start' })}\n\n`);

    const controller = new AbortController();
    const onClose = () => controller.abort();
    req.on('close', onClose);

    try {
      const events = await loadEvents();
      const prompt = buildContext(events, Boolean(firstMessage));
      const recommendations = rankEvents(events, message.trim());
      await assistantStream(prompt, message.trim(), (payload) => {
        res.write(`data: ${JSON.stringify(payload)}\n\n`);
      });

      res.write(`data: ${JSON.stringify({ events: recommendations })}\n\n`);
      res.write('data: [DONE]\n\n');
      res.end();
    } catch (error) {
      if ((error as any)?.name === 'AbortError') {
        res.end();
        return;
      }
      console.error('Erro ao streamar assistente:', error);
      logger.error({ error }, 'Erro ao streamar assistente');
      res.write(
        `data: ${JSON.stringify({
          error: 'Erro interno do servidor.',
          details: error instanceof Error ? error.message : String(error),
        })}\n\n`
      );
      res.write('data: [DONE]\n\n');
      res.end();
    } finally {
      req.off('close', onClose);
    }
  }
}
