import { jwtDecode } from 'jwt-decode';

interface TokenPayload {
  id: string;
  email: string;
  role: string;
  iat: number;
  exp: number;
}

// 1. Pega o token bruto
export function getToken(): string | null {
  return localStorage.getItem('token');
}

// 2. Decodifica o token com segurança
export function getTokenPayload(): TokenPayload | null {
  const token = getToken();
  if (!token) return null;

  try {
    return jwtDecode<TokenPayload>(token);
  } catch (error) {
    console.error('Token inválido detectado no utils:', error);
    localStorage.removeItem('token');
    return null;
  }
}

// 3. Verifica se está logado e se o token não expirou
export function isAuthenticated(): boolean {
  const payload = getTokenPayload();
  if (!payload) return false;

  const currentTime = Math.floor(Date.now() / 1000);
  return payload.exp > currentTime;
}

// 4. Função Genérica (O motor por trás das outras)
export function hasRole(roleToCheck: string): boolean {
  const payload = getTokenPayload();

  if (!payload || !payload.role) {
    return false;
  }

  const normalizedUserRole = payload.role.trim().toUpperCase();
  const normalizedCheckRole = roleToCheck.trim().toUpperCase();

  return normalizedUserRole === normalizedCheckRole;
}

export function isAdmin(): boolean {
  return hasRole('ADMIN') || hasRole('ADMINISTRADOR');
}

export function isGestor(): boolean {
  return hasRole('GESTOR');
}

export function isTurista(): boolean {
  return hasRole('TURISTA');
}

export function getUserInfo() {
  const payload = getTokenPayload();
  if (!payload) return null;
  return {
    id: payload.id,
    email: payload.email,
    role: payload.role,
  };
}
