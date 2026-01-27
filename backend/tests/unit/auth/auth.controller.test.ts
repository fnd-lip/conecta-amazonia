import AuthController from '../../../src/modules/auth/auth.controller';

describe('AuthController', () => {
  let controller: AuthController;
  let service: any;

  beforeEach(() => {
    service = {
      login: jest.fn(),
      register: jest.fn(),
      verifyEmail: jest.fn(),
    };

    controller = new AuthController(service);
  });

  it('retorna 200 no login', async () => {
    service.login.mockResolvedValue({ token: 'abc' });

    const req = {
      body: { email: 'a', password: 'b' },
    } as any;

    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    } as any;

    await controller.login(req, res);

    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalled();
  });
});
