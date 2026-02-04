import { API_URL } from '../config/api';

export function apiUrl(path: string) {
  return path.startsWith('http') ? path : `${API_URL}${path.startsWith('/') ? '' : '/'}${path}`;
}
