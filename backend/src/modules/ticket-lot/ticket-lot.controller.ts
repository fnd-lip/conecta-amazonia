import { Request, Response } from 'express';
import ticketLotService from './ticket-lot.service';

export class TicketLotController {
  async listLots(req: Request, res: Response) {
    try {
      const { eventId } = req.params;
      const user = (req as any).user;
      if (!eventId) {
        return res.status(400).json({ error: 'eventId é obrigatório' });
      }
      const lots = await ticketLotService.listLotsByEvent(eventId, user);
      return res.status(200).json(lots);
    } catch (err: any) {
      return res.status(403).json({ error: err.message || 'Sem permissão' });
    }
  }

  async createLot(req: Request, res: Response) {
    try {
      const { eventId } = req.params;
      const { name, price, quantity, active, maxPerUser } = req.body;
      const user = (req as any).user;
      if (!eventId) {
        return res.status(400).json({ error: 'eventId é obrigatório' });
      }
      const lot = await ticketLotService.createLot(
        eventId,
        { name, price, quantity, active, maxPerUser },
        user
      );
      return res.status(201).json(lot);
    } catch (err: any) {
      return res.status(403).json({ error: err.message || 'Sem permissão' });
    }
  }

  async updateLot(req: Request, res: Response) {
    try {
      const { lotId } = req.params;
      const user = (req as any).user;
      const { name, price, quantity, active, maxPerUser } = req.body;
      if (!lotId) {
        return res.status(400).json({ error: 'lotId é obrigatório' });
      }
      const updated = await ticketLotService.updateLot(
        lotId,
        { name, price, quantity, active, maxPerUser },
        user
      );
      return res.status(200).json(updated);
    } catch (err: any) {
      return res.status(403).json({ error: err.message || 'Sem permissão' });
    }
  }

  async deleteLot(req: Request, res: Response) {
    try {
      const { lotId } = req.params;
      const user = (req as any).user;
      if (!lotId) {
        return res.status(400).json({ error: 'lotId é obrigatório' });
      }
      await ticketLotService.deleteLot(lotId, user);
      return res.status(200).json({ message: 'Lote removido com sucesso' });
    } catch (err: any) {
      return res.status(403).json({ error: err.message || 'Sem permissão' });
    }
  }
}

export default new TicketLotController();
