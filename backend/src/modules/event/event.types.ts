export interface CreateEventDTO {
  nome: string;
  descricao: string;
  data: Date;
  categoria: string;
  logoUrl?: string;
  externalLink?: string;
  relatedLinks?: string[];

  userId?: string;
  parentId?: string | null;
  subeventos?: {
    nome: string;
    descricao: string;
    data: Date | string;
    categoria: string;
  }[];
}

export interface ListEventCardDTO {
  id: string;
  nome: string;
  categoria: string;
  data: Date;
}
