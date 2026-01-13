import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function seed() {
  await prisma.userType.createMany({
    data: [
      { id: 1, label: 'Administrador' },
      { id: 2, label: 'Gestor local' },
      { id: 3, label: 'Prestador de servico' },
      { id: 4, label: 'Turista' },
    ],
    skipDuplicates: true,
  });

  // Criar usuário administrador
  const adminUser = await prisma.user.upsert({
    where: { email: 'admin@teste.com' },
    update: {},
    create: {
      name: 'Administrador',
      email: 'admin@teste.com',
      password: bcrypt.hashSync('123456', 10),
      typeId: 1,
    },
  });

  const gestorUser = await prisma.user.upsert({
    where: { email: 'gestor@teste.com' },
    update: {},
    create: {
      name: 'Gestor Local',
      email: 'gestor@teste.com',
      password: bcrypt.hashSync('123456', 10),
      typeId: 2,
    },
  });

  const gestorUser2 = await prisma.user.upsert({
    where: { email: 'gestor2@teste.com' },
    update: {},
    create: {
      name: 'Outro Gestor',
      email: 'gestor2@teste.com',
      password: bcrypt.hashSync('123456', 10),
      typeId: 2,
    },
  });

  const semanaCultural = await prisma.event.upsert({
    where: { nome: 'Semana Cultural' },
    update: {},
    create: {
      nome: 'Semana Cultural',
      descricao: 'Eventos culturais diversos',
      data: new Date('2025-11-20'),
      categoria: 'cultura',
      userId: gestorUser.id,
      externalLink: 'https://semanacultural.com.br',
      relatedLinks: [
        'https://instagram.com/semanacultural',
        'https://facebook.com/semanacultural',
      ],
    },
  });

  await prisma.event.upsert({
    where: { nome: 'Oficina de dança' },
    update: {},
    create: {
      nome: 'Oficina de dança',
      descricao: 'Dança regional',
      data: new Date('2025-11-21'),
      categoria: 'cultura',
      parentId: semanaCultural.id,
      userId: gestorUser.id,
      externalLink: 'https://oficinadanca.com.br',
      relatedLinks: ['https://youtube.com/oficinadanca'],
    },
  });

  await prisma.event.upsert({
    where: { nome: 'Feira de alimentos' },
    update: {},
    create: {
      nome: 'Feira de alimentos',
      descricao: 'Comidas tradicionais',
      data: new Date('2025-11-22'),
      categoria: 'gastronomia',
      parentId: semanaCultural.id,
      userId: gestorUser.id,
      externalLink: 'https://feiradealimentos.com.br',
      relatedLinks: ['https://instagram.com/feiradealimentos'],
    },
  });

  // Eventos do segundo gestor
  const festivaAmazonia = await prisma.event.upsert({
    where: { nome: 'Festival da Amazônia' },
    update: {},
    create: {
      nome: 'Festival da Amazônia',
      descricao: 'Festival regional da Amazônia',
      data: new Date('2025-12-15'),
      categoria: 'festividade',
      userId: gestorUser2.id,
      externalLink: 'https://festivalamazonia.com.br',
      relatedLinks: [
        'https://facebook.com/festivalamazonia',
        'https://youtube.com/festivalamazonia',
      ],
    },
  });

  await prisma.event.upsert({
    where: { nome: 'Mostra de Artesanato' },
    update: {},
    create: {
      nome: 'Mostra de Artesanato',
      descricao: 'Exposição de artesanato local',
      data: new Date('2025-12-16'),
      categoria: 'cultura',
      parentId: festivaAmazonia.id,
      userId: gestorUser2.id,
      externalLink: 'https://mostradeartesanato.com.br',
      relatedLinks: ['https://instagram.com/mostradeartesanato'],
    },
  });

  await prisma.event.upsert({
    where: { nome: 'Trilha Ecológica' },
    update: {},
    create: {
      nome: 'Trilha Ecológica',
      descricao: 'Caminhada pela natureza com guia especializado',
      data: new Date('2025-12-20'),
      categoria: 'turismo',
      userId: gestorUser.id,
      externalLink: 'https://trilhaecologica.com.br',
      relatedLinks: ['https://instagram.com/trilhaecologica'],
    },
  });

  await prisma.event.upsert({
    where: { nome: 'Show de Música Regional' },
    update: {},
    create: {
      nome: 'Show de Música Regional',
      descricao: 'Apresentação de artistas locais',
      data: new Date('2025-12-25'),
      categoria: 'festividade',
      userId: gestorUser2.id,
      externalLink: 'https://showmusicaregional.com.br',
      relatedLinks: [
        'https://youtube.com/showmusicaregional',
        'https://spotify.com/showmusicaregional',
      ],
    },
  });

  await prisma.event.upsert({
    where: { nome: 'Passeio de Barco' },
    update: {},
    create: {
      nome: 'Passeio de Barco',
      descricao: 'Passeio pelos rios da região',
      data: new Date('2025-12-28'),
      categoria: 'turismo',
      userId: gestorUser.id,
      externalLink: 'https://passeiobarco.com.br',
      relatedLinks: ['https://instagram.com/passeiobarco'],
    },
  });

  await prisma.event.upsert({
    where: { nome: 'Workshop de Culinária Típica' },
    update: {},
    create: {
      nome: 'Workshop de Culinária Típica',
      descricao: 'Aprenda a preparar pratos tradicionais',
      data: new Date('2026-01-05'),
      categoria: 'gastronomia',
      userId: gestorUser2.id,
      externalLink: 'https://workshopculinaria.com.br',
      relatedLinks: [
        'https://instagram.com/workshopculinaria',
        'https://youtube.com/workshopculinaria',
      ],
    },
  });

  await prisma.event.upsert({
    where: { nome: 'Exposição de Fotografia' },
    update: {},
    create: {
      nome: 'Exposição de Fotografia',
      descricao: 'Fotos da fauna e flora regional',
      data: new Date('2026-01-10'),
      categoria: 'cultura',
      userId: gestorUser.id,
      externalLink: 'https://exposicaofotografia.com.br',
      relatedLinks: ['https://facebook.com/exposicaofotografia'],
    },
  });

  await prisma.event.upsert({
    where: { nome: 'Circuito de Cachoeiras' },
    update: {},
    create: {
      nome: 'Circuito de Cachoeiras',
      descricao: 'Visita guiada às cachoeiras da região',
      data: new Date('2026-01-15'),
      categoria: 'turismo',
      userId: gestorUser2.id,
      externalLink: 'https://circuitocachoeiras.com.br',
      relatedLinks: ['https://instagram.com/circuitocachoeiras'],
    },
  });

  await prisma.event.upsert({
    where: { nome: 'Festival Gastronômico' },
    update: {},
    create: {
      nome: 'Festival Gastronômico',
      descricao: 'Degustação de pratos típicos da região',
      data: new Date('2026-01-20'),
      categoria: 'gastronomia',
      userId: gestorUser.id,
      externalLink: 'https://festivalgastronomico.com.br',
      relatedLinks: [
        'https://instagram.com/festivalgastronomico',
        'https://facebook.com/festivalgastronomico',
      ],
    },
  });

  console.log('Seed executado com sucesso!');
  console.log(`Admin: ${adminUser.email}`);
  console.log(`Usuário 1: ${gestorUser.email}`);
  console.log(`Usuário 2: ${gestorUser2.email}`);
  console.log(`Eventos criados para ambos usuários`);
}

seed()
  .catch((err) => console.error('❌ Erro no seed:', err))
  .finally(() => prisma.$disconnect());
