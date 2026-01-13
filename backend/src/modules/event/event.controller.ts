import { Request, Response } from 'express';
import { EventService } from './event.service';
import { CreateEventDTO } from './event.types';
import logger from '../../config/logger';
import { EventRepository } from './event.repository';

const eventRepository = new EventRepository();
const eventService = new EventService(eventRepository);

class EventController {
  async create(req: Request, res: Response) {
    try {
      const userId = (req as any).user.id;
      let logoUrl: string | undefined = undefined;
      if (req.file) {
        // Save the relative path to the uploaded file
        logoUrl = `/uploads/${req.file.filename}`;
      }
      let relatedLinks = req.body.relatedLinks;
      if (typeof relatedLinks === 'string') {
        try {
          // Se vier como JSON, parse
          relatedLinks = JSON.parse(relatedLinks);
        } catch {
          // Se vier como string separada por vírgula
          relatedLinks = relatedLinks
            .split(',')
            .map((v: string) => v.trim())
            .filter((v: string) => v.length > 0);
        }
      }
      const eventData = { ...req.body, userId, logoUrl, relatedLinks };

      const event = await eventService.createEvent(eventData as CreateEventDTO);
      logger.info({ event }, 'Evento criado com sucesso');
      return res.status(201).json(event);
    } catch (err: unknown) {
      const errorMessage =
        err instanceof Error ? err.message : 'Internal server error!';
      logger.error({ err }, 'Erro ao criar evento');
      return res.status(400).json({ error: errorMessage });
    }
  }

  async getById(req: Request, res: Response) {
    try {
      const { id } = req.params;
      if (!id) return res.status(400).json({ error: 'ID é obrigatório' });

      const event = await eventService.getEventById(id);

      logger.info({ event }, 'Evento recuperado com sucesso');
      return res.status(200).json(event);
    } catch (err: unknown) {
      const errorMessage =
        err instanceof Error ? err.message : 'Internal server error!';
      logger.error({ err }, 'Erro ao recuperar evento');
      return res.status(404).json({ error: errorMessage });
    }
  }

  async getMine(req: Request, res: Response) {
    try {
      const userId = (req as any).user.id;
      const events = await eventService.getEventsByUser(userId);

      logger.info({ userId, count: events.length }, 'Eventos recuperados');

      return res.status(200).json({
        message:
          events.length > 0
            ? 'Eventos encontrados'
            : 'Nenhum evento cadastrado',
        events,
      });
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Erro interno';
      logger.error({ err }, 'Erro ao recuperar eventos do usuário');
      return res.status(500).json({ error: errorMessage });
    }
  }

  async delete(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const userId = (req as any).user.id;

      if (!id) {
        return res.status(400).json({ error: 'ID é obrigatório' });
      }

      await eventService.deleteEvent(id, userId);

      logger.info({ eventId: id, userId }, 'Evento excluído com sucesso');
      return res.status(200).json({ message: 'Evento excluído com sucesso' });
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Erro interno';
      logger.error({ err }, 'Erro ao excluir evento');
      return res.status(404).json({ error: errorMessage });
    }
  }

  async update(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const userId = (req as any).user.id;
      const eventData = req.body;

      if (!id) {
        return res.status(400).json({ error: 'ID é obrigatório' });
      }

      const updatedEvent = await eventService.updateEvent(
        id,
        userId,
        eventData
      );

      logger.info({ eventId: id, userId }, 'Evento atualizado com sucesso');
      return res.status(200).json(updatedEvent);
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Erro interno';
      logger.error({ err }, 'Erro ao atualizar evento');
      return res.status(400).json({ error: errorMessage });
    }
  }

  async listLandingPage(req: Request, res: Response) {
    try {
      const limit = req.query.limit
        ? parseInt(req.query.limit as string)
        : undefined;

      const events = await eventService.listLandingPageEvents(limit);

      return res.json(events);
    } catch (error: any) {
      console.error('Error listing events:', error);
      return res.status(500).json({ message: 'Falha ao buscar eventos.' });
    }
  }

  async listAll(req: Request, res: Response) {
    try {
      const { categoria, dataInicio, dataFim, limit } = req.query;
      const filters: any = {};
      if (categoria) filters.categoria = categoria;
      if (dataInicio || dataFim) {
        filters.data = {};
        if (dataInicio) filters.data.gte = new Date(dataInicio as string);
        if (dataFim) filters.data.lte = new Date(dataFim as string);
      }
      const limitValue = limit ? parseInt(limit as string) : undefined;
      const events = await eventService.listAllEventsWithFilters(
        filters,
        limitValue
      );
      return res.json(events);
    } catch (error: any) {
      console.error('Error listing all events:', error);
      return res.status(500).json({ message: 'Falha ao buscar eventos.' });
    }
  }
  async getPublicCalendar(req: Request, res: Response) {
    try {
      const { start, end } = req.query;

      if (!start || !end) {
        return res.status(400).json({ error: 'Start e End são obrigatórios' });
      }
      const events = await eventService.getPublicCalendarEvents(
        start as string,
        end as string
      );
      return res.json(events);
    } catch (err: any) {}
  }
}

export default new EventController();
