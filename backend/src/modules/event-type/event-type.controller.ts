import { Request, Response } from 'express';
import logger from '../../config/logger';
import { EventTypeRepository } from './event-type.repository';
import { EventTypeService } from './event-type.service';

const repository = new EventTypeRepository();
const service = new EventTypeService(repository);

export class EventTypeController {
  static async list(req: Request, res: Response) {
    try {
      const types = await service.listAll();
      return res.json(types);
    } catch (error) {
      logger.error({ error }, 'Erro ao listar tipos de eventos');
      return res.status(500).json({ message: 'Erro interno do servidor' });
    }
  }

  static async create(req: Request, res: Response) {
    try {
      const { nome } = req.body;
      const created = await service.create(nome);
      return res.status(201).json(created);
    } catch (error) {
      const message =
        error instanceof Error ? error.message : 'Erro interno do servidor';
      logger.error({ error }, 'Erro ao criar tipo de evento');
      return res.status(400).json({ message });
    }
  }

  static async update(req: Request, res: Response) {
    try {
      const id = Number(req.params.id);
      const { nome } = req.body;
      const updated = await service.update(id, nome);
      return res.json(updated);
    } catch (error) {
      const message =
        error instanceof Error ? error.message : 'Erro interno do servidor';
      logger.error({ error }, 'Erro ao atualizar tipo de evento');
      return res.status(400).json({ message });
    }
  }

  static async delete(req: Request, res: Response) {
    try {
      const id = Number(req.params.id);
      await service.delete(id);
      return res.json({ message: 'Tipo de evento excluído com sucesso' });
    } catch (error) {
      const message =
        error instanceof Error ? error.message : 'Erro interno do servidor';
      logger.error({ error }, 'Erro ao excluir tipo de evento');
      return res.status(400).json({ message });
    }
  }
}
