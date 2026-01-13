import { Request, Response } from 'express';

import AuthService from './auth.service';
import AuthRepository from './auth.repository';

const authRepository = new AuthRepository();
const authService = new AuthService(authRepository);

class AuthController {
  async login(req: Request, res: Response) {
    try {
      const { email, password } = req.body;

      const result = await authService.login(req.body.email, req.body.password);

      return res.status(200).json(result);
    } catch (error: any) {
      return res.status(error.status || 500).json({ message: error.message });
    }
  }
}

export default new AuthController();
