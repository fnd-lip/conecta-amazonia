import bcrypt from 'bcryptjs';
import AuthService from '../../../src/modules/auth/auth.service'

describe('AuthService - login', () => {
  beforeAll(() => {
    process.env.JWT_SECRET = 'test-secret';
  });

  it('deve logar com credenciais válidas', async () => {
    const authRepository = {
      findByEmail: jest.fn(),
    } as any;

    const mailService = {} as any;

    const authService = new AuthService(authRepository, mailService);

    const hashedPassword = await bcrypt.hash('123', 10);

    authRepository.findByEmail.mockResolvedValue({
      id: 1,
      email: 'teste@email.com',
      password: hashedPassword,
      type: { label: 'USER' },
    });

    const result = await authService.login('teste@email.com', '123');

    expect(result.token).toBeDefined();
    expect(result.message).toBe('Login realizado com sucesso');
  });
});
