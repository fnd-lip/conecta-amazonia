import * as z from 'zod';

export interface Inscription {
  id: string;
  title: string;
  date: string;
  location: string;
  status: 'confirmed' | 'pending';
}

export interface UserData {
  id: string;
  name: string;
  email: string;
  typeId: number;
  // O backend json-server costuma devolver inscrições se configurado,
  // senão precisaremos buscar separado. Vou assumir que vem junto por enquanto.
  inscriptions?: Inscription[];
}

export const profileSchema = z.object({
  name: z.string().min(3, 'Nome deve ter pelo menos 3 caracteres'),
  email: z.string().email('Email inválido'),
  password: z
    .string()
    .min(6, 'Senha deve ter no mínimo 6 caracteres')
    .optional()
    .or(z.literal('')),
});

export type ProfileFormData = z.infer<typeof profileSchema>;
