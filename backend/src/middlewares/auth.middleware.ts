import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

export function authMiddleware(
  req: Request,
  res: Response,
  next: NextFunction
) {
  const header = req.headers.authorization;

  if (!header) {
    return res.status(401).json({ message: 'Token não fornecido' });
  }

  const token = header.split(' ')[1];

  if (!token) {
    return res.status(401).json({ message: 'Token malformatado' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET as string);

    (req as any).user = decoded;
    return next();
  } catch {
    return res.status(403).json({ message: 'Token inválido ou expirado' });
  }
}
