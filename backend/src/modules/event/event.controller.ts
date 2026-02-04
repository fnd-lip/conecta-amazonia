import { Request, Response } from 'express';
import { EventService } from './event.service';
import { CreateEventDTO } from './event.types';
import logger from '../../config/logger';
import { EventRepository } from './event.repository';
import { EventTypeRepository } from '../event-type/event-type.repository';

const eventRepository = new EventRepository();
const eventTypeRepository = new EventTypeRepository();
const eventService = new EventService(eventRepository, eventTypeRepository);

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
      const latitude =
        req.body.latitude !== undefined && req.body.latitude !== ''
          ? parseFloat(req.body.latitude)
          : undefined;
      const longitude =
        req.body.longitude !== undefined && req.body.longitude !== ''
          ? parseFloat(req.body.longitude)
          : undefined;

      if (latitude !== undefined && Number.isNaN(latitude)) {
        return res.status(400).json({ error: 'Latitude invalida.' });
      }
      if (longitude !== undefined && Number.isNaN(longitude)) {
        return res.status(400).json({ error: 'Longitude invalida.' });
      }

      const eventData = {
        ...req.body,
        userId,
        logoUrl,
        relatedLinks,
        latitude,
        longitude,
      };

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

      let logoUrl: string | undefined = undefined;
      if (req.file) {
        logoUrl = `/uploads/${req.file.filename}`;
      }

      let relatedLinks = eventData.relatedLinks;
      if (typeof relatedLinks === 'string') {
        try {
          relatedLinks = JSON.parse(relatedLinks);
        } catch {
          relatedLinks = relatedLinks
            .split(',')
            .map((v: string) => v.trim())
            .filter((v: string) => v.length > 0);
        }
      }
      const latitude =
        eventData.latitude !== undefined && eventData.latitude !== ''
          ? parseFloat(eventData.latitude)
          : undefined;
      const longitude =
        eventData.longitude !== undefined && eventData.longitude !== ''
          ? parseFloat(eventData.longitude)
          : undefined;

      if (latitude !== undefined && Number.isNaN(latitude)) {
        return res.status(400).json({ error: 'Latitude invalida.' });
      }
      if (longitude !== undefined && Number.isNaN(longitude)) {
        return res.status(400).json({ error: 'Longitude invalida.' });
      }

      if (!id) {
        return res.status(400).json({ error: 'ID é obrigatório' });
      }

      const updatedEvent = await eventService.updateEvent(id, userId, {
        ...eventData,
        ...(logoUrl ? { logoUrl } : {}),
        ...(relatedLinks !== undefined ? { relatedLinks } : {}),
        ...(latitude !== undefined ? { latitude } : {}),
        ...(longitude !== undefined ? { longitude } : {}),
      });

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
      const { categoria, dataInicio, dataFim, limit, nome } = req.query;
      const filters: any = {};

      if (categoria) {
        const categoriaValue = String(categoria).trim();
        const categoriaId = Number(categoriaValue);

        if (Number.isFinite(categoriaId)) {
          filters.eventTypeId = categoriaId;
        } else {
          const type = await eventTypeRepository.findByName(categoriaValue);
          if (!type) {
            return res.json([]);
          }
          filters.eventTypeId = type.id;
        }
      }

      if (dataInicio || dataFim) {
        filters.data = {};
        if (dataInicio) filters.data.gte = new Date(dataInicio as string);
        if (dataFim) filters.data.lte = new Date(dataFim as string);
      }
      if (nome) {
        const termo = String(nome);
        filters.OR = [
          { nome: { contains: termo, mode: 'insensitive' } },
          { locationName: { contains: termo, mode: 'insensitive' } },
        ];
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

  async search(req: Request, res: Response) {
    try {
      const query = req.query.q as string;

      if (!query) {
        return res.json([]);
      }

      const events = await eventService.searchEvents(query);

      return res.json(events);
    } catch (error: any) {
      console.error('Error searching events:', error);
      return res.status(500).json({ message: 'Erro ao realizar busca.' });
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

  async getStatistics(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const userId = (req as any).user.id;

      if (!id) {
        return res.status(400).json({ error: 'ID é obrigatório' });
      }

      const statistics = await eventService.getEventStatistics(id, userId);

      if (!statistics) {
        return res.status(404).json({ message: 'Evento não encontrado!' });
      }

      return res.json(statistics);
    } catch (error: any) {
      logger.error('Error getting event statistics:', error);
      if (error.message.includes('permissão')) {
        return res.status(403).json({ message: error.message });
      }
      return res
        .status(500)
        .json({ message: error.message || 'Erro ao buscar estatísticas.' });
    }
  }

  async getDailySales(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const userId = (req as any).user.id;

      if (!id) {
        return res.status(400).json({ error: 'ID é obrigatório' });
      }

      const dailySales = await eventService.getDailySales(id, userId);

      return res.json({ dailySales });
    } catch (error: any) {
      logger.error('Error getting daily sales:', error);
      if (error.message.includes('permissão')) {
        return res.status(403).json({ message: error.message });
      }
      return res
        .status(500)
        .json({ message: error.message || 'Erro ao buscar vendas diárias.' });
    }
  }
}

export default new EventController();
