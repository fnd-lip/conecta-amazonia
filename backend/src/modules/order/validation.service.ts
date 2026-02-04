import { ValidationRepository } from './validation.repository';

export class ValidationService {
  constructor(private validationRepository: ValidationRepository) {}

  private formatOrderData(order: any) {
    return {
      id: order.id,
      eventName: order.event.nome,
      eventDate: order.event.data,
      userName: order.user.name,
      userEmail: order.user.email,
      items: order.items.map((item: any) => ({
        lotName: item.ticketLot.name,
        quantity: item.quantity,
        price: item.price,
      })),
      totalQuantity: order.items.reduce(
        (sum: number, item: any) => sum + item.quantity,
        0
      ),
      totalPrice: order.items.reduce(
        (sum: number, item: any) => sum + item.price * item.quantity,
        0
      ),
    };
  }

  async validateTicket(orderId: string, validatedBy: string) {
    if (!orderId) throw new Error('orderId é obrigatório');

    // Buscar o pedido
    const order = await this.validationRepository.findOrderById(orderId);

    if (!order) {
      throw new Error('Ingresso não encontrado');
    }

    // Verificar se o pedido está confirmado
    if (order.status !== 'confirmed') {
      throw new Error('Ingresso não está confirmado');
    }

    // Verificar se já foi validado usando o ID completo do pedido
    const alreadyValidated =
      await this.validationRepository.checkIfAlreadyValidated(order.id);

    if (alreadyValidated) {
      const error: any = new Error('Ingresso já foi validado anteriormente');
      error.order = this.formatOrderData(order);
      throw error;
    }

    // Registrar validação usando o ID completo do pedido
    const validation = await this.validationRepository.createValidation({
      orderId: order.id,
      validatedBy,
    });

    return {
      success: true,
      message: 'Ingresso validado com sucesso',
      order: this.formatOrderData(order),
      validation,
    };
  }
}

export default new ValidationService(new ValidationRepository());
