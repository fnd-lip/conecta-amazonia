import bcrypt from 'bcryptjs';
import crypto from 'crypto';
import jwt from 'jsonwebtoken';
import AuthRepository from './auth.repository';
import { MailService } from '../../services/mail.service';
import { RegisterDTO } from './auth.types';

class AuthService {
  constructor(
    private authRepository: AuthRepository,
    private mailService: MailService
  ) {}

  async register(data: RegisterDTO) {
    const userExists = await this.authRepository.findByEmail(data.email);

    if (userExists) {
      if (!userExists.isVerified) {
        const token = crypto.randomBytes(32).toString('hex');
        const tokenHash = crypto
          .createHash('sha256')
          .update(token)
          .digest('hex');
        const expiresAt = new Date();
        expiresAt.setHours(expiresAt.getHours() + 24);
        await this.authRepository.update(userExists.id, {
          verificationToken: tokenHash,
          verificationExpires: expiresAt,
        });
        await this.mailService.sendVerificationEmail(userExists.email, token);

        return {
          message:
            'Usuário já cadastrado mas pendente. Um novo e-mail de verificação foi enviado.',
        };
      }
      throw new Error('Este e-mail já está sendo usado.');
    }

    const hashedPassword = await bcrypt.hash(data.password, 10);

    const token = crypto.randomBytes(32).toString('hex');
    const tokenHash = crypto.createHash('sha256').update(token).digest('hex');

    const expiresAt = new Date();
    expiresAt.setHours(expiresAt.getHours() + 24);

    const user = await this.authRepository.create({
      name: data.name,
      email: data.email,
      password: hashedPassword,
      isVerified: false,
      verificationToken: tokenHash,
      verificationExpires: expiresAt,
      type: {
        connect: {
          id: 4,
        },
      },
    });

    try {
      console.log(`Tentando enviar email para ${user.email}...`);
      await this.mailService.sendVerificationEmail(user.email, token);
      console.log('Email enviado/processado com sucesso.');
    } catch (error) {
      console.error('Erro fatal ao enviar e-mail:', error);
      await this.authRepository.delete(user.id);
      console.log(
        `Usuário ${user.id} deletado devido à falha no envio de e-mail.`
      );
      throw new Error('Erro ao enviar e-mail de verificação. Tente novamente.');
    }

    return {
      message: 'Cadastro realizado. Verifique seu email para ativar a conta.',
    };
  }

  async verifyEmail(token: string) {
    const tokenHash = crypto.createHash('sha256').update(token).digest('hex');

    const user = await this.authRepository.findByValidToken(tokenHash);

    if (!user) {
      throw new Error('Token inválido ou expirado');
    }
    await this.authRepository.activateUser(user.id);

    return { message: 'Email verificado com sucesso!' };
  }

  async login(email: string, password: string) {
    const user = await this.authRepository.findByEmail(email);
    if (!user) {
      throw { status: 401, message: 'Credenciais inválidas' };
    }

    const passOk = await bcrypt.compare(password, user.password);
    if (!passOk) {
      throw { status: 401, message: 'Credenciais inválidas' };
    }

    if (!user.isVerified) {
      throw {
        status: 403,
        message: 'Por favor, verifique seu e-mail antes de entrar.',
      };
    }

    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.type.label },
      process.env.JWT_SECRET!,
      { expiresIn: '2h' }
    );

    return {
      message: 'Login realizado com sucesso',
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
      },
    };
  }
}

export default AuthService;
