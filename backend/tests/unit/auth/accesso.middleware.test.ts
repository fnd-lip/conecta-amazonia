import { authorize } from '../../../src/middlewares/acesso.middleware';

describe('authorize middleware', () => {
  it('permite usuário com role correta', () => {
    const middleware = authorize(['gestor local']);

    const req: any = { user: { role: 'gestor local' } };
    const res: any = {};
    const next = jest.fn();

    middleware(req, res, next);

    expect(next).toHaveBeenCalled();
  });

  it('bloqueia usuário com role errada', () => {
    const middleware = authorize(['gestor local']);

    const req: any = { user: { role: 'viewer' } };

    const res: any = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };
    const next = jest.fn();

    middleware(req, res, next);

    expect(res.status).toHaveBeenCalledWith(403);
    expect(next).not.toHaveBeenCalled();
  });
});
