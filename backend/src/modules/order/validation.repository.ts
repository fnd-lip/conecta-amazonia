import prisma from '../../config/prisma';

export class ValidationRepository {
  async findOrderById(orderId: string) {
    // Tenta buscar primeiro pelo ID exato
    let order = await prisma.order.findUnique({
      where: { id: orderId },
      include: {
        event: true,
        user: true,
        items: {
          include: {
            ticketLot: true,
          },
        },
      },
    });

    // Se não encontrou e o código tem 8 caracteres (código curto), busca por início do ID
    if (!order && orderId.length === 8) {
      // Usa raw query para buscar com LIKE
      const orders = await prisma.$queryRaw<any[]>`
        SELECT * FROM "Order" 
        WHERE "id" LIKE ${orderId + '%'} 
        LIMIT 1
      `;

      if (orders.length > 0) {
        // Busca o pedido completo com as relações
        order = await prisma.order.findUnique({
          where: { id: orders[0].id },
          include: {
            event: true,
            user: true,
            items: {
              include: {
                ticketLot: true,
              },
            },
          },
        });
      }
    }

    return order;
  }

  async createValidation(data: {
    orderId: string;
    validatedBy: string;
  }) {
    return await prisma.ticketValidation.create({
      data: {
        orderId: data.orderId,
        validatedBy: data.validatedBy,
      },
    });
  }

  async checkIfAlreadyValidated(orderId: string) {
    const validation = await prisma.ticketValidation.findUnique({
      where: { orderId },
    });
    return validation !== null;
  }
}

export default new ValidationRepository();
