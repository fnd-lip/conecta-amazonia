import { OrderRepository } from './order.repository';
import { TicketLotRepository } from '../ticket-lot/ticket-lot.repository';
import prisma from '../../config/prisma';

export class OrderService {
  constructor(
    private orderRepository: OrderRepository,
    private ticketLotRepository: TicketLotRepository = new TicketLotRepository()
  ) {}

  async createOrder(
    data: {
      eventId: string;
      items: Array<{
        ticketLotId: string;
        quantity: number;
      }>;
    },
    user: { id: string }
  ) {
    if (!data.eventId) throw new Error('eventId é obrigatório');
    if (!data.items || data.items.length === 0) {
      throw new Error('Selecione pelo menos um ingresso');
    }

    // Validar cada item e preparar dados
    const orderItems: Array<{
      ticketLotId: string;
      quantity: number;
      price: number;
    }> = [];

    for (const item of data.items) {
      const ticketLot = await this.ticketLotRepository.findById(
        item.ticketLotId
      );

      if (!ticketLot) {
        throw new Error(`Lote de ingresso não encontrado: ${item.ticketLotId}`);
      }

      if (!ticketLot.active) {
        throw new Error(`Lote ${ticketLot.name} não está ativo`);
      }

      if (item.quantity <= 0) {
        throw new Error('Quantidade deve ser maior que zero');
      }

      if (item.quantity > ticketLot.quantity) {
        throw new Error(
          `Quantidade solicitada para ${ticketLot.name} excede a disponível`
        );
      }

      // Verificar limite por usuário
      const maxPerUser = (ticketLot as any).maxPerUser;
      if (maxPerUser) {
        const userPreviousPurchases =
          await this.orderRepository.countUserTicketsForLot(
            user.id,
            item.ticketLotId
          );

        const totalForUser = userPreviousPurchases + item.quantity;

        if (totalForUser > maxPerUser) {
          throw new Error(
            `Você já atingiu o limite de ${maxPerUser} ingressos para ${ticketLot.name} (você já possui ${userPreviousPurchases})`
          );
        }
      }

      orderItems.push({
        ticketLotId: item.ticketLotId,
        quantity: item.quantity,
        price: ticketLot.price,
      });
    }

    // Criar pedido e atualizar quantidades em uma transação
    const order = await prisma.$transaction(async (tx) => {
      // Criar o pedido
      const newOrder = await tx.order.create({
        data: {
          userId: user.id,
          eventId: data.eventId,
          status: 'confirmed',
          items: {
            create: orderItems,
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

      // Atualizar quantidades de ingressos
      for (const item of orderItems) {
        await tx.ticketLot.update({
          where: { id: item.ticketLotId },
          data: {
            quantity: {
              decrement: item.quantity,
            },
          },
        });
      }

      return newOrder;
    });

    return order;
  }

  async getUserOrders(userId: string) {
    return this.orderRepository.findByUserId(userId);
  }

  async getOrderById(orderId: string, userId: string) {
    const order = await this.orderRepository.findById(orderId);
    if (!order) throw new Error('Pedido não encontrado');
    if (order.userId !== userId) {
      throw new Error('Sem permissão para visualizar este pedido');
    }
    return order;
  }
}

export default new OrderService(new OrderRepository());
