import { EventRepository } from './event.repository';
import { CreateEventDTO } from './event.types';
import { EventTypeRepository } from '../event-type/event-type.repository';

const DEFAULT_EVENT_LIMIT = 4;

export class EventService {
  constructor(
    private eventRepository: EventRepository,
    private eventTypeRepository: EventTypeRepository
  ) {}

  private async resolveEventTypeId(payload: {
    eventTypeId?: number;
    categoria?: string;
  }) {
    if (payload.eventTypeId !== undefined) {
      const id = Number(payload.eventTypeId);
      if (!Number.isFinite(id)) {
        throw new Error('Tipo de evento invalido.');
      }
      const exists = await this.eventTypeRepository.findById(id);
      if (!exists) {
        throw new Error('Tipo de evento invalido.');
      }
      return id;
    }

    const categoria = payload.categoria?.trim();
    if (categoria) {
      const found = await this.eventTypeRepository.findByName(categoria);
      if (!found) {
        throw new Error('Categoria invalida. Selecione um tipo existente.');
      }
      return found.id;
    }

    throw new Error('Categoria e obrigatoria.');
  }

  async createEvent(data: CreateEventDTO) {
    if (!data.nome || !data.descricao || !data.data) {
      throw new Error('Preencha os campos obrigatorios!');
    }

    if (!data.userId) {
      throw new Error('Usuario nao identificado!');
    }

    const eventTypeId = await this.resolveEventTypeId(data);

    if (data.subeventos && data.subeventos.length > 0) {
      for (const subevento of data.subeventos) {
        const subEventTypeId = await this.resolveEventTypeId(subevento);
        subevento.eventTypeId = subEventTypeId;
      }
    }

    let dataTratada = data.data as Date;
    if (typeof dataTratada === 'string') {
      const dateObj = new Date(dataTratada);
      if (isNaN(dateObj.getTime())) {
        throw new Error('Data invalida!');
      }
      dataTratada = dateObj;
    } else if (dataTratada instanceof Date) {
      if (isNaN(dataTratada.getTime())) {
        throw new Error('Data invalida!');
      }
    }

    return this.eventRepository.create({
      ...data,
      eventTypeId,
      data: dataTratada,
    });
  }

  async getEventById(id: string) {
    const event = await this.eventRepository.findById(id);
    if (!event) {
      throw new Error('Evento nao encontrado!');
    }
    return event;
  }

  async getEventsByUser(userId: string) {
    return this.eventRepository.findByUserId(userId);
  }

  async deleteEvent(id: string, userId: string) {
    const event = await this.eventRepository.findById(id);
    if (!event) {
      throw new Error('Evento nao encontrado!');
    }

    if (event.userId !== userId) {
      throw new Error('Voce nao tem permissao para excluir este evento!');
    }

    return this.eventRepository.deleteById(id);
  }

  async updateEvent(id: string, userId: string, data: Partial<CreateEventDTO>) {
    const event = await this.eventRepository.findById(id);
    if (!event) {
      throw new Error('Evento nao encontrado!');
    }

    if (event.userId !== userId) {
      throw new Error('Voce nao tem permissao para editar este evento!');
    }

    if (data.nome !== undefined && !data.nome)
      throw new Error('Nome e obrigatorio!');
    if (data.descricao !== undefined && !data.descricao)
      throw new Error('Descricao e obrigatoria!');

    let eventTypeId: number | undefined;
    if (data.eventTypeId !== undefined || data.categoria !== undefined) {
      const payload: { eventTypeId?: number; categoria?: string } = {};
      if (data.eventTypeId !== undefined) {
        payload.eventTypeId = data.eventTypeId;
      }
      if (data.categoria !== undefined) {
        payload.categoria = data.categoria;
      }
      eventTypeId = await this.resolveEventTypeId(payload);
    }

    let dataTratada: Date | undefined = data.data as Date | undefined;
    if (data.data && typeof data.data === 'string') {
      const dateObj = new Date(data.data);
      if (isNaN(dateObj.getTime())) {
        throw new Error('Data invalida!');
      }
      dataTratada = dateObj;
    }

    const updateData: Partial<CreateEventDTO> = {};
    if (data.nome !== undefined) updateData.nome = data.nome;
    if (data.descricao !== undefined) updateData.descricao = data.descricao;
    if (eventTypeId !== undefined) updateData.eventTypeId = eventTypeId;
    if (dataTratada !== undefined) updateData.data = dataTratada;
    if (data.logoUrl !== undefined) updateData.logoUrl = data.logoUrl;
    if (data.externalLink !== undefined)
      updateData.externalLink = data.externalLink;
    if (data.relatedLinks !== undefined)
      updateData.relatedLinks = data.relatedLinks;
    if (data.latitude !== undefined) updateData.latitude = data.latitude;
    if (data.longitude !== undefined) updateData.longitude = data.longitude;
    if (data.locationName !== undefined)
      updateData.locationName = data.locationName;

    return this.eventRepository.updateById(id, updateData);
  }

  async listLandingPageEvents(limit?: number) {
    const finalLimit = limit && limit > 0 ? limit : DEFAULT_EVENT_LIMIT;

    const events = await this.eventRepository.findAll(finalLimit);

    return events;
  }

  async listAllEventsWithFilters(filters: any, limit?: number) {
    const finalLimit = limit && limit > 0 ? limit : 50;
    return this.eventRepository.findAllWithFilters(filters, finalLimit);
  }
  async getPublicCalendarEvents(start: string, end: string) {
    const startDate = new Date(start);
    const endDate = new Date(end);
    if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
      throw new Error('Formato de data invalido.');
    }
    return this.eventRepository.findPublicByDateRange(startDate, endDate);
  }
  async searchEvents(query: string) {
    if (!query || query.trim().length < 2) {
      return [];
    }

    const term = query.trim();

    return this.eventRepository.findBySearchTerm(term, 10);
  }
}
