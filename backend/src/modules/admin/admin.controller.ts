import { Request, Response } from 'express';
import AdminService from './admin.service';
import logger from '../../config/logger';

export class AdminController {
  static async getAllEvents(req: Request, res: Response) {
    try {
      const events = await AdminService.getAllEvents();
      res.json(events);
    } catch (error) {
      logger.error({ error }, 'Erro ao buscar eventos');
      res.status(500).json({ message: 'Erro interno do servidor' });
    }
  }

  static async getAllUsers(req: Request, res: Response) {
    try {
      const users = await AdminService.getAllUsers();
      res.json(users);
    } catch (error) {
      logger.error({ error }, 'Erro ao buscar usuários');
      res.status(500).json({ message: 'Erro interno do servidor' });
    }
  }
}