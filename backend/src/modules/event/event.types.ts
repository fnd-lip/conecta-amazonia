export interface CreateEventDTO {
  nome: string;
  descricao: string;
  data: Date;
  categoria?: string;
  eventTypeId?: number;
  logoUrl?: string;
  externalLink?: string;
  relatedLinks?: string[];
  latitude?: number;
  longitude?: number;
  locationName?: string;

  userId?: string;
  parentId?: string | null;
  subeventos?: {
    nome: string;
    descricao: string;
    data: Date | string;
    categoria?: string;
    eventTypeId?: number;
  }[];
}

export interface ListEventCardDTO {
  id: string;
  nome: string;
  categoria: string;
  data: Date;
}
