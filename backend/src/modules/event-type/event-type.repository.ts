import prisma from '../../config/prisma';

export class EventTypeRepository {
  async findAll() {
    return prisma.eventType.findMany({
      orderBy: { nome: 'asc' },
    });
  }

  async findById(id: number) {
    return prisma.eventType.findUnique({
      where: { id },
    });
  }

  async findByName(nome: string) {
    return prisma.eventType.findFirst({
      where: {
        nome: {
          equals: nome,
          mode: 'insensitive',
        },
      },
    });
  }

  async existsByName(nome: string) {
    const existing = await this.findByName(nome);
    return Boolean(existing);
  }

  async countEventsByTypeId(eventTypeId: number) {
    return prisma.event.count({
      where: { eventTypeId },
    });
  }

  async create(nome: string) {
    return prisma.eventType.create({
      data: { nome },
    });
  }

  async update(id: number, nome: string) {
    return prisma.eventType.update({
      where: { id },
      data: { nome },
    });
  }

  async delete(id: number) {
    return prisma.eventType.delete({
      where: { id },
    });
  }
}
