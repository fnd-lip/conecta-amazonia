import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import AuthRepository from './auth.repository';

class AuthService {
  constructor(private authRepository: AuthRepository) {}
  async login(email: string, password: string) {
    const user = await this.authRepository.findByEmail(email);
    if (!user) {
      throw { status: 401, message: 'Credenciais inválidas' };
    }

    const passOk = await bcrypt.compare(password, user.password);
    if (!passOk) {
      throw { status: 401, message: 'Credenciais inválidas' };
    }

    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.type.label },
      process.env.JWT_SECRET!,
      { expiresIn: '2h' }
    );

    return {
      message: 'Login realizado com sucesso',
      token,
    };
  }
}

export default AuthService;
