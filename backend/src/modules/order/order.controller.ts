import { Request, Response } from 'express';
import orderService from './order.service';
import validationService from './validation.service';

export class OrderController {
  async createOrder(req: Request, res: Response) {
    try {
      const user = (req as any).user;
      const { eventId, items } = req.body;

      if (!user || !user.id) {
        return res.status(401).json({ error: 'Usuário não autenticado' });
      }

      const order = await orderService.createOrder({ eventId, items }, user);
      return res.status(201).json(order);
    } catch (err: any) {
      return res
        .status(400)
        .json({ error: err.message || 'Erro ao criar pedido' });
    }
  }

  async getUserOrders(req: Request, res: Response) {
    try {
      const user = (req as any).user;

      if (!user || !user.id) {
        return res.status(401).json({ error: 'Usuário não autenticado' });
      }

      const orders = await orderService.getUserOrders(user.id);
      return res.status(200).json(orders);
    } catch (err: any) {
      return res
        .status(400)
        .json({ error: err.message || 'Erro ao buscar pedidos' });
    }
  }

  async getOrderById(req: Request, res: Response) {
    try {
      const user = (req as any).user;
      const { orderId } = req.params;

      if (!user || !user.id) {
        return res.status(401).json({ error: 'Usuário não autenticado' });
      }

      if (!orderId) {
        return res.status(400).json({ error: 'orderId é obrigatório' });
      }

      const order = await orderService.getOrderById(orderId, user.id);
      return res.status(200).json(order);
    } catch (err: any) {
      return res
        .status(400)
        .json({ error: err.message || 'Erro ao buscar pedido' });
    }
  }

  async validateTicket(req: Request, res: Response) {
    try {
      const user = (req as any).user;
      const { orderId } = req.body;

      if (!user || !user.id) {
        return res.status(401).json({ error: 'Usuário não autenticado' });
      }

      if (!orderId) {
        return res.status(400).json({ error: 'orderId é obrigatório' });
      }

      const result = await validationService.validateTicket(orderId, user.id);
      return res.status(200).json(result);
    } catch (err: any) {
      // Se for erro de "já validado", retorna com os dados do pedido
      if (err.message?.includes('já foi validado') && err.order) {
        return res.status(400).json({
          success: false,
          error: err.message,
          order: err.order,
          alreadyValidated: true,
        });
      }

      return res.status(400).json({
        success: false,
        error: err.message || 'Erro ao validar ingresso',
      });
    }
  }
}

export default new OrderController();
