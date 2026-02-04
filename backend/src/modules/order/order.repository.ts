import prisma from '../../config/prisma';

export class OrderRepository {
  async create(data: {
    userId: string;
    eventId: string;
    status: string;
    items: Array<{
      ticketLotId: string;
      quantity: number;
      price: number;
    }>;
  }) {
    return prisma.order.create({
      data: {
        userId: data.userId,
        eventId: data.eventId,
        status: data.status,
        items: {
          create: data.items,
        },
      },
      include: {
        items: {
          include: {
            ticketLot: true,
          },
        },
      },
    });
  }

  async findByUserId(userId: string) {
    return prisma.order.findMany({
      where: { userId },
      include: {
        event: true,
        items: {
          include: {
            ticketLot: true,
          },
        },
        validations: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
  }

  async findById(id: string) {
    return prisma.order.findUnique({
      where: { id },
      include: {
        event: true,
        items: {
          include: {
            ticketLot: true,
          },
        },
      },
    });
  }

  async countUserTicketsForLot(userId: string, ticketLotId: string) {
    const result = await prisma.orderItem.aggregate({
      where: {
        ticketLotId,
        order: {
          userId,
          status: { in: ['pending', 'confirmed'] },
        },
      },
      _sum: {
        quantity: true,
      },
    });
    return result._sum.quantity || 0;
  }
}

export default new OrderRepository();
