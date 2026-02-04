import { Router } from 'express';
import orderController from './order.controller';
import { authMiddleware } from '../../middlewares/auth.middleware';
import { authorize } from '../../middlewares/acesso.middleware';

const router = Router();

// Criar novo pedido
router.post('/', authMiddleware, (req, res) =>
  orderController.createOrder(req, res)
);

// Listar pedidos do usuário
router.get('/', authMiddleware, (req, res) =>
  orderController.getUserOrders(req, res)
);

// Buscar pedido específico
router.get('/:orderId', authMiddleware, (req, res) =>
  orderController.getOrderById(req, res)
);

// Validar ingresso (apenas gestores e admins)
router.post(
  '/validate',
  authMiddleware,
  authorize(['Gestor local', 'Administrador']),
  (req, res) => orderController.validateTicket(req, res)
);

export default router;
