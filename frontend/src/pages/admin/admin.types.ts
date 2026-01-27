export interface Event {
  id: string;
  nome: string;
  descricao: string;
  data: string;
  categoria: string;
  parentId?: string | null;
  user: {
    name: string;
  };
  children?: Event[];
}

export interface User {
  id: string;
  name: string;
  email: string;
  type: string;
  createdAt: string;
}

export interface EventType {
  id: number;
  nome: string;
}

export type AdminTab = 'eventos' | 'usuarios' | 'tipos';
