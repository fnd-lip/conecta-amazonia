import { jwtDecode } from 'jwt-decode';

interface TokenPayload {
  id: string;
  email: string;
  role: string;
  iat: number;
  exp: number;
}

export function getTokenPayload(): TokenPayload | null {
  const token = localStorage.getItem('token');
  
  if (!token) {
    return null;
  }

  try {
    return jwtDecode<TokenPayload>(token);
  } catch (error) {
    console.error('Token inválido:', error);
    localStorage.removeItem('token');
    return null;
  }
}

export function isAuthenticated(): boolean {
  const payload = getTokenPayload();
  
  if (!payload) {
    return false;
  }

  // Verificar se o token não expirou
  const currentTime = Math.floor(Date.now() / 1000);
  return payload.exp > currentTime;
}

export function isAdmin(): boolean {
  const payload = getTokenPayload();
  return payload?.role === 'Administrador';
}

export function getUserInfo(): { id: string; email: string; role: string } | null {
  const payload = getTokenPayload();
  
  if (!payload) {
    return null;
  }

  return {
    id: payload.id,
    email: payload.email,
    role: payload.role
  };
}