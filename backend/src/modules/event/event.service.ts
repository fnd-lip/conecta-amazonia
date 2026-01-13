import { EventRepository } from './event.repository';
import { CreateEventDTO } from './event.types';

const DEFAULT_EVENT_LIMIT = 4;

export class EventService {
  constructor(private eventRepository: EventRepository) {}

  async createEvent(data: CreateEventDTO) {
    if (!data.nome || !data.descricao || !data.categoria || !data.data) {
      throw new Error('Preencha os campos obrigatórios!');
    }

    if (!data.userId) {
      throw new Error('Usuário não identificado!');
    }

    let dataTratada = data.data as Date;
    if (typeof dataTratada === 'string') {
      const dateObj = new Date(dataTratada);
      if (isNaN(dateObj.getTime())) {
        throw new Error('Data inválida!');
      }
      dataTratada = dateObj;
    } else if (dataTratada instanceof Date) {
      if (isNaN(dataTratada.getTime())) {
        throw new Error('Data inválida!');
      }
    }

    return this.eventRepository.create({ ...data, data: dataTratada });
  }

  async getEventById(id: string) {
    const event = await this.eventRepository.findById(id);
    if (!event) {
      throw new Error('Evento não encontrado!');
    }
    return event;
  }

  async getEventsByUser(userId: string) {
    return this.eventRepository.findByUserId(userId);
  }

  async deleteEvent(id: string, userId: string) {
    const event = await this.eventRepository.findById(id);
    if (!event) {
      throw new Error('Evento não encontrado!');
    }

    if (event.userId !== userId) {
      throw new Error('Você não tem permissão para excluir este evento!');
    }

    return this.eventRepository.deleteById(id);
  }

  async updateEvent(id: string, userId: string, data: Partial<CreateEventDTO>) {
    const event = await this.eventRepository.findById(id);
    if (!event) {
      throw new Error('Evento não encontrado!');
    }

    if (event.userId !== userId) {
      throw new Error('Você não tem permissão para editar este evento!');
    }

    if (data.nome !== undefined && !data.nome)
      throw new Error('Nome é obrigatório!');
    if (data.descricao !== undefined && !data.descricao)
      throw new Error('Descrição é obrigatória!');
    if (data.categoria !== undefined && !data.categoria)
      throw new Error('Categoria é obrigatória!');

    let dataTratada: Date | undefined = data.data;
    if (data.data && typeof data.data === 'string') {
      const dateObj = new Date(data.data);
      if (isNaN(dateObj.getTime())) {
        throw new Error('Data inválida!');
      }
      dataTratada = dateObj;
    }

    const updateData: Partial<CreateEventDTO> = {};
    if (data.nome !== undefined) updateData.nome = data.nome;
    if (data.descricao !== undefined) updateData.descricao = data.descricao;
    if (data.categoria !== undefined) updateData.categoria = data.categoria;
    if (dataTratada !== undefined) updateData.data = dataTratada;
    if (data.logoUrl !== undefined) updateData.logoUrl = data.logoUrl;
    if (data.externalLink !== undefined)
      updateData.externalLink = data.externalLink;
    if (data.relatedLinks !== undefined)
      updateData.relatedLinks = data.relatedLinks;

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
      throw new Error('Formato de data inválido.');
    }
    return this.eventRepository.findPublicByDateRange(startDate, endDate);
  }
}
