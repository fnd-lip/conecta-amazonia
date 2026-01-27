import { Router } from 'express';
import ticketLotController from './ticket-lot.controller';
import { authMiddleware } from '../../middlewares/auth.middleware';

const router = Router();

// GET /event-ticket-lot/:eventId/tickets/lots
router.get('/:eventId/tickets/lots', authMiddleware, (req, res) =>
  ticketLotController.listLots(req, res)
);

// POST /event-ticket-lot/:eventId/tickets/lots
router.post('/:eventId/tickets/lots', authMiddleware, (req, res) =>
  ticketLotController.createLot(req, res)
);

// PUT /event-ticket-lot/tickets/lots/:lotId
router.put('/tickets/lots/:lotId', authMiddleware, (req, res) =>
  ticketLotController.updateLot(req, res)
);

// DELETE /event-ticket-lottickets/lots/:lotId
router.delete('/tickets/lots/:lotId', authMiddleware, (req, res) =>
  ticketLotController.deleteLot(req, res)
);

export default router;
