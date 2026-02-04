import { Router } from 'express';
import eventController from './event.controller';
import { authMiddleware } from '../../middlewares/auth.middleware';
import { upload } from '../../middlewares/upload.middleware';

const router = Router();

/**
 * @swagger
 * tags:
 *   name: Eventos
 *   description: Endpoints para gerenciamento de eventos
 */

/**
 * @swagger
 * /events:
 *   get:
 *     summary: Listar eventos públicos
 *     description: Retorna todos os eventos para exibição na landing page
 *     tags: [Eventos]
 *     security: []
 *     responses:
 *       200:
 *         description: Lista de eventos retornada com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 events:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Event'
 *       500:
 *         description: Erro interno do servidor
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *   post:
 *     summary: Criar novo evento
 *     description: Cria um novo evento (requer autenticação)
 *     tags: [Eventos]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CreateEventRequest'
 *           example:
 *             nome: "Feira Cultural"
 *             descricao: "Feira com produtos locais"
 *             data: "2025-12-25T10:00:00Z"
 *             categoria: "Feira"
 *             parentId: null
 *     responses:
 *       201:
 *         description: Evento criado com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Event'
 *       400:
 *         description: Dados de entrada inválidos
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       401:
 *         description: Token não fornecido ou inválido
 *       500:
 *         description: Erro interno do servidor
 */
router.get('/', (req, res) => eventController.listLandingPage(req, res));
router.post('/', authMiddleware, upload.single('logo'), (req, res) =>
  eventController.create(req, res)
);

/**
 * @swagger
 * /events/all:
 *   get:
 *     summary: Listar todos os eventos
 *     description: Retorna todos os eventos cadastrados no sistema. Permite filtrar por categoria e intervalo de datas.
 *     tags: [Eventos]
 *     security: []
 *     parameters:
 *       - in: query
 *         name: categoria
 *         schema:
 *           type: string
 *         description: Categoria do evento para filtrar
 *       - in: query
 *         name: dataInicio
 *         schema:
 *           type: string
 *           format: date
 *         description: Data inicial (YYYY-MM-DD) para filtrar eventos
 *       - in: query
 *         name: dataFim
 *         schema:
 *           type: string
 *           format: date
 *         description: Data final (YYYY-MM-DD) para filtrar eventos
 *     responses:
 *       200:
 *         description: Lista de todos os eventos retornada com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 events:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Event'
 */
router.get('/all', (req, res) => eventController.listAll(req, res));

/**
 * @swagger
 * /events/mine:
 *   get:
 *     summary: Listar meus eventos
 *     description: Retorna todos os eventos criados pelo usuário autenticado
 *     tags: [Eventos]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Lista de eventos do usuário
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 events:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Event'
 *       401:
 *         description: Token não fornecido ou inválido
 *       500:
 *         description: Erro interno do servidor
 */
router.get('/mine', authMiddleware, (req, res) =>
  eventController.getMine(req, res)
);

/**
 * @swagger
 * /events/{id}:
 *   get:
 *     summary: Obter evento por ID
 *     description: Retorna os detalhes de um evento específico
 *     tags: [Eventos]
 *     security: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: ID único do evento
 *     responses:
 *       200:
 *         description: Detalhes do evento
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Event'
 *       404:
 *         description: Evento não encontrado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       500:
 *         description: Erro interno do servidor
 *   put:
 *     summary: Atualizar evento
 *     description: Atualiza um evento existente (apenas o criador pode editar)
 *     tags: [Eventos]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: ID único do evento
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CreateEventRequest'
 *     responses:
 *       200:
 *         description: Evento atualizado com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Event'
 *       400:
 *         description: Dados de entrada inválidos
 *       401:
 *         description: Token não fornecido ou inválido
 *       403:
 *         description: Sem permissão para editar este evento
 *       404:
 *         description: Evento não encontrado
 *       500:
 *         description: Erro interno do servidor
 *   delete:
 *     summary: Excluir evento
 *     description: Exclui um evento (apenas o criador pode excluir)
 *     tags: [Eventos]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: ID único do evento
 *     responses:
 *       200:
 *         description: Evento excluído com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Evento excluído com sucesso"
 *       401:
 *         description: Token não fornecido ou inválido
 *       403:
 *         description: Sem permissão para excluir este evento
 *       404:
 *         description: Evento não encontrado
 *       500:
 *         description: Erro interno do servidor
 */

router.get('/search', eventController.search);
router.get('/calendar', (req, res) =>
  eventController.getPublicCalendar(req, res)
);
router.get('/:id/statistics', authMiddleware, (req, res) =>
  eventController.getStatistics(req, res)
);
router.get('/:id/daily-sales', authMiddleware, (req, res) =>
  eventController.getDailySales(req, res)
);
router.put('/:id', authMiddleware, upload.single('logo'), (req, res) =>
  eventController.update(req, res)
);
router.delete('/:id', authMiddleware, (req, res) =>
  eventController.delete(req, res)
);
router.get('/:id', (req, res) => eventController.getById(req, res));

export default router;
