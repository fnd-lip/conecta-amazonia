import { Request, Response } from 'express';
import { usersService } from './users.service';

class UsersController {
  async me(req: Request, res: Response) {
    try {
      const userFromToken = (req as any).user;

      const userId = userFromToken?.userId || userFromToken?.id;

      if (!userId) {
        return res
          .status(400)
          .json({ error: 'ID do usuário não encontrado no token' });
      }

      const userProfile = await usersService.getProfile(userId);
      return res.json(userProfile);
    } catch (error) {
      console.error('Erro em /users/me:', error);
      return res.status(404).json({ error: 'Usuário não encontrado.' });
    }
  }

  async update(req: Request, res: Response) {
    try {
      const userFromToken = (req as any).user;

      const userId = userFromToken?.userId || userFromToken?.id;

      if (!userId) {
        return res
          .status(400)
          .json({ error: 'ID do usuário não encontrado no token' });
      }

      const { name, email, password } = req.body;

      const user = await usersService.updateProfile(userId, {
        name,
        email,
        password,
      });

      return res.json(user);
    } catch (error: any) {
      console.error('Erro em /users/update:', error);
      return res.status(400).json({ error: error.message });
    }
  }

  async delete(req: Request, res: Response) {
    try {
      const userFromToken = (req as any).user;

      const userId = userFromToken?.userId || userFromToken?.id;

      if (!userId) {
        return res
          .status(400)
          .json({ error: 'ID do usuário não encontrado no token' });
      }

      await usersService.deleteProfile(userId);
      return res.status(204).send();
    } catch (error: any) {
      console.error('Erro em /users/delete:', error);
      return res
        .status(500)
        .json({ error: error.message || 'Erro ao excluir conta.' });
    }
  }
}

export const usersController = new UsersController();
