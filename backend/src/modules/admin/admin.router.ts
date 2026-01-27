import { Router } from 'express';
import { AdminController } from './admin.controller';
import { EventTypeController } from '../event-type/event-type.controller';
import { authMiddleware } from '../../middlewares/auth.middleware';
import { authorize } from '../../middlewares/acesso.middleware';

const router = Router();

/**
 * @swagger
 * tags:
 *   name: Administração
 *   description: Endpoints exclusivos para administradores
 */

// Protege todas as rotas com autenticação e role admin
router.use(authMiddleware);
router.use(authorize(['Administrador']));

/**
 * @swagger
 * /admin/events:
 *   get:
 *     summary: Listar todos os eventos (Admin)
 *     description: Retorna todos os eventos do sistema (apenas administradores)
 *     tags: [Administração]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Lista completa de eventos
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Event'
 *       401:
 *         description: Token não fornecido ou inválido
 *       403:
 *         description: Acesso negado - apenas administradores
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             example:
 *               message: "Acesso negado"
 *       500:
 *         description: Erro interno do servidor
 */
router.get('/events', AdminController.getAllEvents);

/**
 * @swagger
 * /admin/users:
 *   get:
 *     summary: Listar todos os usuários (Admin)
 *     description: Retorna todos os usuários do sistema (apenas administradores)
 *     tags: [Administração]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Lista completa de usuários
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/User'
 *       401:
 *         description: Token não fornecido ou inválido
 *       403:
 *         description: Acesso negado - apenas administradores
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             example:
 *               message: "Acesso negado"
 *       500:
 *         description: Erro interno do servidor
 */
router.get('/users', AdminController.getAllUsers);

router.get('/event-types', EventTypeController.list);
router.post('/event-types', EventTypeController.create);
router.put('/event-types/:id', EventTypeController.update);
router.delete('/event-types/:id', EventTypeController.delete);

export default router;
