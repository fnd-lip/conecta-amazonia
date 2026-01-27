import AuthController from './auth.controller';
import AuthService from './auth.service';
import AuthRepository from './auth.repository';
import { MailService } from '../../services/mail.service';

export const makeAuthController = async () => {
  const authRepository = new AuthRepository();
  const mailService = new MailService();
  const authService = new AuthService(authRepository, mailService);

  return new AuthController(authService);
};
