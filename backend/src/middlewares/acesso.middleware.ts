import { Request, Response, NextFunction } from 'express';

export function authorize(roles: string[]) {
  return (req: Request, res: Response, next: NextFunction) => {
    const user = (req as any).user;

    if (!user) {
      return res.status(401).json({ message: 'Usuário não autenticado' });
    }

    // --- DEBUG--
    console.log('--- Verificação de Acesso ---');
    console.log('Role do Usuário (Token):', user.role);
    console.log('Roles Permitidas na Rota:', roles);

    const userRoleUpper = user.role.toUpperCase();
    const allowedRolesUpper = roles.map((r) => r.toUpperCase());

    const temPermissao =
      allowedRolesUpper.includes(userRoleUpper) ||
      (userRoleUpper === 'ADMIN' &&
        allowedRolesUpper.includes('ADMINISTRADOR'));

    if (!temPermissao) {
      console.log('>> ACESSO NEGADO <<');
      return res.status(403).json({ message: 'Acesso negado' });
    }

    console.log('>> ACESSO PERMITIDO <<');
    next();
  };
}
