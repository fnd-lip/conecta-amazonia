import { Request, Response } from 'express';
import AuthService from './auth.service';

class AuthController {
  constructor(private authService: AuthService) {}

  async register(req: Request, res: Response) {
    try {
      const result = await this.authService.register(req.body);
      return res.status(201).json(result);
    } catch (error: any) {
      return res.status(400).json({ error: error.message });
    }
  }

  async verifyEmail(req: Request, res: Response) {
    try {
      const { token } = req.body;

      if (!token || typeof token !== 'string') {
        return res.status(400).json({ message: 'Token inválido' });
      }

      await this.authService.verifyEmail(token);

      return res.status(200).json({
        message: 'Email verificado com sucesso',
      });
    } catch (error: any) {
      return res.status(400).json({ message: error.message });
    }
  }

  async login(req: Request, res: Response) {
    try {
      const result = await this.authService.login(
        req.body.email,
        req.body.password
      );

      return res.status(200).json(result);
    } catch (error: any) {
      return res.status(error.status || 500).json({ message: error.message });
    }
  }
}

export default AuthController;
