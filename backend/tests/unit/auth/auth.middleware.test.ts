import { authMiddleware } from '../../../src/middlewares/auth.middleware';
import jwt from 'jsonwebtoken';
import { Request, Response, NextFunction } from 'express';

describe('authMiddleware', () => {
  const SECRET = 'testsecret';
  let originalEnv: NodeJS.ProcessEnv;

  beforeAll(() => {
    originalEnv = process.env;
    process.env.JWT_SECRET = SECRET;
  });

  afterAll(() => {
    process.env = originalEnv;
  });

  it('deve permitir acesso com token válido', () => {
    const token = jwt.sign({ id: '123', role: 'gestor' }, SECRET);

    const req = {
      headers: { authorization: `Bearer ${token}` },
    } as Request;

    const res = {} as Response;
    const next = jest.fn();

    authMiddleware(req, res, next);

    expect(next).toHaveBeenCalled();
    expect((req as any).user).toMatchObject({ id: '123', role: 'gestor' });
  });

  it('deve bloquear sem header', () => {
    const req = { headers: {} } as Request;
    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    } as unknown as Response;
    const next = jest.fn();

    authMiddleware(req, res, next);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({ message: expect.any(String) })
    );
    expect(next).not.toHaveBeenCalled();
  });

  it('deve bloquear token inválido', () => {
    const req = {
      headers: { authorization: 'Bearer token_totalmente_errado' },
    } as Request;

    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    } as unknown as Response;
    const next = jest.fn();

    authMiddleware(req, res, next);

    expect(res.status).toHaveBeenCalledWith(403);
    expect(next).not.toHaveBeenCalled();
  });
});
