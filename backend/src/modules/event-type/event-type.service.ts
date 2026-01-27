import { EventTypeRepository } from './event-type.repository';

export class EventTypeService {
  constructor(private repository: EventTypeRepository) {}

  async listAll() {
    return this.repository.findAll();
  }

  async create(nome: string) {
    const normalized = nome?.trim();
    if (!normalized) {
      throw new Error('Nome do tipo de evento e obrigatorio.');
    }

    const exists = await this.repository.existsByName(normalized);
    if (exists) {
      throw new Error('Ja existe um tipo de evento com esse nome.');
    }

    return this.repository.create(normalized);
  }

  async update(id: number, nome: string) {
    if (!Number.isFinite(id)) {
      throw new Error('ID invalido.');
    }

    const normalized = nome?.trim();
    if (!normalized) {
      throw new Error('Nome do tipo de evento e obrigatorio.');
    }

    const exists = await this.repository.findByName(normalized);
    if (exists && exists.id !== id) {
      throw new Error('Ja existe um tipo de evento com esse nome.');
    }

    return this.repository.update(id, normalized);
  }

  async delete(id: number) {
    if (!Number.isFinite(id)) {
      throw new Error('ID invalido.');
    }

    const usageCount = await this.repository.countEventsByTypeId(id);
    if (usageCount > 0) {
      throw new Error(
        'Nao e possivel excluir este tipo porque ha eventos vinculados.'
      );
    }

    return this.repository.delete(id);
  }
}
