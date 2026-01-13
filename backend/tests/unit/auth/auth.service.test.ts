import AuthService from '../../../src/modules/auth/auth.service';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

jest.mock('bcryptjs');
jest.mock('jsonwebtoken');

describe('AuthService', () => {
  let authService: AuthService;
  let authRepositoryMock: any;

  beforeEach(() => {
    jest.clearAllMocks();

    authRepositoryMock = {
      findByEmail: jest.fn(),
    };

    authService = new AuthService(authRepositoryMock);
  });

  it('deve gerar token se usuário existir e senha estiver correta', async () => {
    const fakeUser = {
      id: '1',
      email: 'test@test.com',
      password: 'hashedpass',
      type: { label: 'gestor local' },
    };

    authRepositoryMock.findByEmail.mockResolvedValue(fakeUser);
    (bcrypt.compare as jest.Mock).mockResolvedValue(true);
    (jwt.sign as jest.Mock).mockReturnValue('TOKEN123');

    const result = await authService.login('test@test.com', '123456');

    expect(result.token).toBe('TOKEN123');

    expect(authRepositoryMock.findByEmail).toHaveBeenCalledWith(
      'test@test.com'
    );
  });

  it('deve lançar erro se o usuário não for encontrado', async () => {
    authRepositoryMock.findByEmail.mockResolvedValue(null);

    await expect(authService.login('errado@test.com', '123')).rejects.toEqual({
      status: 401,
      message: 'Credenciais inválidas',
    });
  });

  it('deve lançar erro se a senha estiver incorreta', async () => {
    const fakeUser = { id: '1', email: 'test@test.com', password: 'hash' };
    authRepositoryMock.findByEmail.mockResolvedValue(fakeUser);
    (bcrypt.compare as jest.Mock).mockResolvedValue(false);

    await expect(
      authService.login('test@test.com', 'senhaerrada')
    ).rejects.toEqual({ status: 401, message: 'Credenciais inválidas' });
  });
});
