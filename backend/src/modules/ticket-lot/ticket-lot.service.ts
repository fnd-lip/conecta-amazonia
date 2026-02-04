import { TicketLotRepository } from './ticket-lot.repository';
import { EventRepository } from '../event/event.repository';

export class TicketLotService {
  constructor(
    private ticketLotRepository: TicketLotRepository,
    private eventRepository: EventRepository = new EventRepository()
  ) {}

  async listLotsByEvent(eventId: string, user: { id: string; type: string }) {
    if (!eventId) throw new Error('eventId é obrigatório');
    const event = await this.eventRepository.findById(eventId);
    if (!event) throw new Error('Evento não encontrado');
    // Permite apenas se for admin ou dono do evento
    if (event.userId !== user.id && user.type !== 'admin') {
      throw new Error('Sem permissão para visualizar lotes deste evento');
    }
    return this.ticketLotRepository.findByEventId(eventId);
  }

  async createLot(
    eventId: string,
    lotData: {
      name: string;
      price: number;
      quantity: number;
      active?: boolean;
      maxPerUser?: number | null;
    },
    user: { id: string; type: string }
  ) {
    if (!eventId) throw new Error('eventId é obrigatório');
    if (!lotData.name || lotData.name.trim() === '') {
      throw new Error('Nome do lote é obrigatório');
    }
    if (
      lotData.price === undefined ||
      isNaN(lotData.price) ||
      lotData.price < 0
    ) {
      throw new Error('Preço deve ser maior ou igual a 0 (pode ser gratuito)');
    }
    if (
      lotData.quantity === undefined ||
      isNaN(lotData.quantity) ||
      lotData.quantity < 0
    ) {
      throw new Error('Quantidade deve ser maior ou igual a 0');
    }
    if (
      lotData.maxPerUser !== undefined &&
      lotData.maxPerUser !== null &&
      (isNaN(lotData.maxPerUser) || lotData.maxPerUser < 1)
    ) {
      throw new Error('Limite por usuário deve ser maior ou igual a 1');
    }
    const event = await this.eventRepository.findById(eventId);
    if (!event) throw new Error('Evento não encontrado');
    // Permite apenas se for admin ou dono do evento
    if (event.userId !== user.id && user.type !== 'admin') {
      throw new Error('Sem permissão para criar lotes neste evento');
    }
    return this.ticketLotRepository.createLot({
      ...lotData,
      eventId,
    });
  }

  async updateLot(
    lotId: string,
    data: Partial<{
      name: string;
      price: number;
      quantity: number;
      active: boolean;
      maxPerUser: number | null;
    }>,
    user: { id: string; type: string }
  ) {
    // Busca o lote e evento relacionado
    const lot = await this.ticketLotRepository.findById(lotId);
    if (!lot) throw new Error('Lote não encontrado');
    const event = await this.eventRepository.findById(lot.eventId);
    if (!event) throw new Error('Evento não encontrado');
    if (event.userId !== user.id && user.type !== 'admin') {
      throw new Error('Sem permissão para editar este lote');
    }
    // Validações
    if (data.name !== undefined && (!data.name || data.name.trim() === '')) {
      throw new Error('Nome do lote é obrigatório');
    }
    if (data.price !== undefined && (isNaN(data.price) || data.price < 0)) {
      throw new Error('Preço deve ser maior ou igual a 0');
    }
    if (
      data.quantity !== undefined &&
      (isNaN(data.quantity) || data.quantity < 0)
    ) {
      throw new Error('Quantidade deve ser maior ou igual a 0');
    }
    if (
      data.maxPerUser !== undefined &&
      data.maxPerUser !== null &&
      (isNaN(data.maxPerUser) || data.maxPerUser < 1)
    ) {
      throw new Error('Limite por usuário deve ser maior ou igual a 1');
    }
    return this.ticketLotRepository.updateLot(lotId, data);
  }

  async deleteLot(lotId: string, user: { id: string; type: string }) {
    const lot = await this.ticketLotRepository.findById(lotId);
    if (!lot) throw new Error('Lote não encontrado');
    const event = await this.eventRepository.findById(lot.eventId);
    if (!event) throw new Error('Evento não encontrado');
    if (event.userId !== user.id && user.type !== 'admin') {
      throw new Error('Sem permissão para remover este lote');
    }
    return this.ticketLotRepository.deleteLot(lotId);
  }
}

export default new TicketLotService(new TicketLotRepository());
