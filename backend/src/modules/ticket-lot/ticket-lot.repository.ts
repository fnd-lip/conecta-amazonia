import prisma from '../../config/prisma';

export class TicketLotRepository {
  async findByEventId(eventId: string) {
    return prisma.ticketLot.findMany({
      where: { eventId },
      include: { orders: true },
    });
  }

  async createLot(data: {
    name: string;
    price: number;
    quantity: number;
    eventId: string;
    active?: boolean;
  }) {
    return prisma.ticketLot.create({
      data: {
        name: data.name,
        price: data.price,
        quantity: data.quantity,
        eventId: data.eventId,
        active: data.active ?? true,
      },
    });
  }

  async updateLot(
    lotId: string,
    data: Partial<{
      name: string;
      price: number;
      quantity: number;
      active: boolean;
    }>
  ) {
    return prisma.ticketLot.update({
      where: { id: lotId },
      data,
    });
  }

  async findById(lotId: string) {
    return prisma.ticketLot.findUnique({ where: { id: lotId } });
  }

  async deleteLot(lotId: string) {
    return prisma.ticketLot.delete({ where: { id: lotId } });
  }
}

export default new TicketLotRepository();
