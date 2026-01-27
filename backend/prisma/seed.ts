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

  await prisma.eventType.createMany({
    data: [
      { nome: 'cultura' },
      { nome: 'turismo' },
      { nome: 'gastronomia' },
      { nome: 'festividade' },
      { nome: 'aventura' },
    ],
    skipDuplicates: true,
  });
  const eventTypes = await prisma.eventType.findMany();
  const eventTypeMap = eventTypes.reduce(
    (acc, type) => {
      acc[type.nome.toLowerCase()] = type.id;
      return acc;
    },
    {} as Record<string, number>
  );

  await prisma.event.deleteMany({
    where: {
      nome: { not: { contains: '2026' } },
    },
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
      isVerified: true,
      verificationToken: null,
      verificationExpires: null,
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
      isVerified: true,
      verificationToken: null,
      verificationExpires: null,
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

  // --- Eventos Reais Amazônicos ---

  // 1. Festival Folclórico de Parintins (Boi-Bumbá)
  await prisma.event.upsert({
    where: { nome: 'Festival Folclórico de Parintins 2026' },
    update: {
      logoUrl:
        'https://upload.wikimedia.org/wikipedia/commons/6/63/Boi_Bumb%C3%A1_Caprichoso_em_Evolu%C3%A7%C3%A3o.jpg',
    },
    create: {
      nome: 'Festival Folclórico de Parintins 2026',
      descricao:
        'O maior festival folclórico a céu aberto do mundo, disputado pelos bois Garantido (vermelho) e Caprichoso (azul).',
      data: new Date('2026-06-26T20:00:00Z'),
      eventTypeId: eventTypeMap['cultura']!,
      userId: gestorUser.id,
      latitude: -2.6288,
      longitude: -56.7324,
      locationName: 'Bumbódromo, Parintins, AM',
      logoUrl:
        'https://upload.wikimedia.org/wikipedia/commons/6/63/Boi_Bumb%C3%A1_Caprichoso_em_Evolu%C3%A7%C3%A3o.jpg',
      externalLink: 'https://www.festivaldeparintins.com.br',
      relatedLinks: [
        'https://www.instagram.com/parintinsloficial',
        'https://www.facebook.com/boi.garantido',
        'https://www.facebook.com/boicaprichoso',
      ],
    },
  });

  // 2. Festival de Cirandas de Manacapuru
  await prisma.event.upsert({
    where: { nome: 'Festival de Cirandas de Manacapuru 2026' },
    update: {
      logoUrl:
        'https://upload.wikimedia.org/wikipedia/commons/a/ae/Ciranda_Flor_Matizada_2025_-_Apresenta%C3%A7%C3%A3o.jpg',
    },
    create: {
      nome: 'Festival de Cirandas de Manacapuru 2026',
      descricao:
        'Tradicional disputa de cirandas entre Flor Matizada, Guerreiros Mura e Tradicional no Parque do Ingá.',
      data: new Date('2026-08-28T19:00:00Z'),
      eventTypeId: eventTypeMap['cultura']!,
      userId: gestorUser2.id,
      latitude: -3.2996,
      longitude: -60.6211,
      locationName: 'Parque do Ingá, Manacapuru, AM',
      logoUrl:
        'https://upload.wikimedia.org/wikipedia/commons/a/ae/Ciranda_Flor_Matizada_2025_-_Apresenta%C3%A7%C3%A3o.jpg',
      externalLink: 'https://manacapuru.am.gov.br',
      relatedLinks: ['https://www.instagram.com/cirandasdemanacapuru'],
    },
  });

  // 3. Festa do Guaraná (Maués)
  await prisma.event.upsert({
    where: { nome: 'Festa do Guaraná 2026' },
    update: {
      logoUrl:
        'https://upload.wikimedia.org/wikipedia/commons/9/9b/Flickr_-_ggallice_-_Guarana.jpg',
    },
    create: {
      nome: 'Festa do Guaraná 2026',
      descricao:
        'Celebração da colheita do guaraná, fruto típico da região, com shows, lendas e atrações culturais na "Terra do Guaraná".',
      data: new Date('2026-11-28T18:00:00Z'),
      eventTypeId: eventTypeMap['festividade']!,
      userId: gestorUser.id,
      latitude: -3.3836,
      longitude: -57.7186,
      locationName: 'Praia da Ponta da Maresia, Maués, AM',
      logoUrl:
        'https://upload.wikimedia.org/wikipedia/commons/9/9b/Flickr_-_ggallice_-_Guarana.jpg',
      externalLink: 'https://maues.am.gov.br',
      relatedLinks: ['https://pt.wikipedia.org/wiki/Festa_do_Guaraná'],
    },
  });

  // 4. FECANI (Itacoatiara)
  await prisma.event.upsert({
    where: { nome: 'FECANI 2026' },
    update: {
      logoUrl:
        'https://upload.wikimedia.org/wikipedia/commons/5/51/Itacoatiara%2C_Amazonas.jpg',
    },
    create: {
      nome: 'FECANI 2026',
      descricao:
        'Festival da Canção de Itacoatiara. O maior festival de música da região Norte, revelando talentos e promovendo a cultura.',
      data: new Date('2026-09-04T20:00:00Z'),
      eventTypeId: eventTypeMap['cultura']!,
      userId: gestorUser2.id,
      latitude: -3.1431,
      longitude: -58.4442,
      locationName: 'Centro de Eventos Juracema Holanda, Itacoatiara, AM',
      logoUrl:
        'https://upload.wikimedia.org/wikipedia/commons/5/51/Itacoatiara%2C_Amazonas.jpg',
      externalLink: 'http://www.fecani.com.br',
      relatedLinks: ['https://www.facebook.com/fecanioficial'],
    },
  });

  // 5. Festival do Peixe Ornamental (Barcelos)
  await prisma.event.upsert({
    where: { nome: 'Festival do Peixe Ornamental 2026' },
    update: {
      logoUrl:
        'https://upload.wikimedia.org/wikipedia/commons/5/51/Ornamental_fish%2C_Newcastle_-_geograph.org.uk_-_1265078.jpg',
    },
    create: {
      nome: 'Festival do Peixe Ornamental 2026',
      descricao:
        'Evento que celebra a diversidade de peixes ornamentais e a cultura de Barcelos, com disputas entre os grupos Acará-Disco e Cardinal.',
      data: new Date('2026-01-28T19:00:00Z'),
      eventTypeId: eventTypeMap['turismo']!, // Ou Festividade
      userId: gestorUser.id,
      latitude: -0.9753,
      longitude: -62.9248,
      locationName: 'Piabódromo, Barcelos, AM',
      logoUrl:
        'https://upload.wikimedia.org/wikipedia/commons/5/51/Ornamental_fish%2C_Newcastle_-_geograph.org.uk_-_1265078.jpg',
      externalLink: 'https://barcelos.am.gov.br',
      relatedLinks: ['https://www.instagram.com/festivaldopeixeornamental'],
    },
  });

  // 6. Manaus Passo a Paço
  await prisma.event.upsert({
    where: { nome: 'Manaus Passo a Paço 2026' },
    update: {
      logoUrl:
        'https://upload.wikimedia.org/wikipedia/commons/7/7f/Centro_Historico_de_Manaus.jpg',
    },
    create: {
      nome: 'Manaus Passo a Paço 2026',
      descricao:
        'Maior festival de artes integradas da Amazônia, ocupando o centro histórico de Manaus com música, gastronomia e arte.',
      data: new Date('2026-09-05T16:00:00Z'),
      eventTypeId: eventTypeMap['gastronomia']!, // Forte apelo gastronômico também
      userId: gestorUser2.id,
      latitude: -3.1303,
      longitude: -60.0234,
      locationName: 'Centro Histórico, Manaus, AM',
      logoUrl:
        'https://upload.wikimedia.org/wikipedia/commons/7/7f/Centro_Historico_de_Manaus.jpg',
      externalLink: 'https://manauscult.manaus.am.gov.br',
      relatedLinks: ['https://www.instagram.com/manauscult'],
    },
  });

  // 7. Festival de Tribos de Juruti (embora seja PA, é muito próximo e relevante na cultura amazônica, mas vamos focar em AM. Vamos substituir por outro do AM)
  // Vamos usar: Festejo de São Benedito (Itacoatiara) ou Carnaboi?
  // Vamos de: Carnaboi 2026
  await prisma.event.upsert({
    where: { nome: 'Carnaboi 2026' },
    update: {
      logoUrl:
        'https://upload.wikimedia.org/wikipedia/commons/0/06/Bumba_Boi_Maranhao.jpg',
    },
    create: {
      nome: 'Carnaboi 2026',
      descricao: 'A união do ritmo do boi-bumbá com a folia do carnaval.',
      data: new Date('2026-02-14T18:00:00Z'),
      eventTypeId: eventTypeMap['festividade']!,
      userId: gestorUser.id,
      latitude: -3.0882,
      longitude: -60.0182,
      locationName: 'Sambódromo, Manaus, AM',
      logoUrl:
        'https://upload.wikimedia.org/wikipedia/commons/0/06/Bumba_Boi_Maranhao.jpg',
      externalLink: 'https://cultura.am.gov.br',
      relatedLinks: [],
    },
  });

  // 8. Jungle Adventure Marathon (Exemplo de Aventura)
  await prisma.event.upsert({
    where: { nome: 'Jungle Marathon 2026' },
    update: {
      logoUrl:
        'https://upload.wikimedia.org/wikipedia/commons/2/25/Moray_Coast_Trail_running_through_Roseisle_Forest_-_geograph.org.uk_-_6405273.jpg',
    },
    create: {
      nome: 'Jungle Marathon 2026',
      descricao:
        'Maratona extrema na selva amazônica, desafiando os limites dos participantes em trilhas selvagens.',
      data: new Date('2026-10-10T06:00:00Z'),
      eventTypeId: eventTypeMap['aventura']!,
      userId: gestorUser2.id,
      latitude: -2.55, // Aproximado para Tapajós/Santarém area ou Floresta Nacional (se fosse PA) mas adaptando para contexto AM:
      longitude: -60.0, // Colocando genérico perto de Presidente Figueiredo
      locationName: 'Presidente Figueiredo, AM',
      logoUrl:
        'https://upload.wikimedia.org/wikipedia/commons/2/25/Moray_Coast_Trail_running_through_Roseisle_Forest_-_geograph.org.uk_-_6405273.jpg',
      externalLink: 'https://junglemarathon.uk',
      relatedLinks: [],
    },
  });

  // 9. Festival Amazonas de Ópera
  await prisma.event.upsert({
    where: { nome: 'Festival Amazonas de Ópera 2026' },
    update: {
      logoUrl:
        'https://upload.wikimedia.org/wikipedia/commons/3/31/Amazon_Theatre%2C_Teatro_Amazonas._Manaus%2C_Brazil._03.jpg',
    },
    create: {
      nome: 'Festival Amazonas de Ópera 2026',
      descricao: 'Festival de ópera realizado no Teatro Amazonas, em Manaus.',
      data: new Date('2026-04-15T20:00:00Z'),
      eventTypeId: eventTypeMap['cultura']!,
      userId: gestorUser.id,
      latitude: -3.1303,
      longitude: -60.0234,
      locationName: 'Teatro Amazonas, Manaus, AM',
      logoUrl:
        'https://upload.wikimedia.org/wikipedia/commons/3/31/Amazon_Theatre%2C_Teatro_Amazonas._Manaus%2C_Brazil._03.jpg',
      externalLink:
        'https://pt.wikipedia.org/wiki/Festival_Amazonas_de_%C3%93pera',
      relatedLinks: [],
    },
  });

  // 10. Festival Amazonas de Jazz
  await prisma.event.upsert({
    where: { nome: 'Festival Amazonas de Jazz 2026' },
    update: {
      logoUrl:
        'https://upload.wikimedia.org/wikipedia/commons/e/ea/Interior_of_Teatro_Amazonas%2C_Manaus%2C_Brazil_07.jpg',
    },
    create: {
      nome: 'Festival Amazonas de Jazz 2026',
      descricao: 'Festival de música realizado no Teatro Amazonas, em Manaus.',
      data: new Date('2026-07-10T20:00:00Z'),
      eventTypeId: eventTypeMap['cultura']!,
      userId: gestorUser.id,
      latitude: -3.1303,
      longitude: -60.0234,
      locationName: 'Teatro Amazonas, Manaus, AM',
      logoUrl:
        'https://upload.wikimedia.org/wikipedia/commons/e/ea/Interior_of_Teatro_Amazonas%2C_Manaus%2C_Brazil_07.jpg',
      externalLink: 'https://pt.wikipedia.org/wiki/Festival_Amazonas_de_Jazz',
      relatedLinks: [],
    },
  });

  // 11. Amazonas Film Festival
  await prisma.event.upsert({
    where: { nome: 'Amazonas Film Festival 2026' },
    update: {
      logoUrl:
        'https://upload.wikimedia.org/wikipedia/commons/4/42/Noite_no_Teatro_Amazonas_%28cropped%29.jpg',
    },
    create: {
      nome: 'Amazonas Film Festival 2026',
      descricao: 'Festival de cinema realizado no Teatro Amazonas, em Manaus.',
      data: new Date('2026-11-05T19:00:00Z'),
      eventTypeId: eventTypeMap['cultura']!,
      userId: gestorUser2.id,
      latitude: -3.1303,
      longitude: -60.0234,
      locationName: 'Teatro Amazonas, Manaus, AM',
      logoUrl:
        'https://upload.wikimedia.org/wikipedia/commons/4/42/Noite_no_Teatro_Amazonas_%28cropped%29.jpg',
      externalLink: 'https://pt.wikipedia.org/wiki/Amazonas_Film_Festival',
      relatedLinks: [],
    },
  });

  // 12. Festival de Teatro da Amazônia
  await prisma.event.upsert({
    where: { nome: 'Festival de Teatro da Amazônia 2026' },
    update: {
      logoUrl:
        'https://upload.wikimedia.org/wikipedia/commons/9/95/Interior_of_Teatro_Amazonas%2C_Manaus%2C_Brazil_01.jpg',
    },
    create: {
      nome: 'Festival de Teatro da Amazônia 2026',
      descricao: 'Festival de teatro realizado em Manaus.',
      data: new Date('2026-10-08T20:00:00Z'),
      eventTypeId: eventTypeMap['cultura']!,
      userId: gestorUser2.id,
      latitude: -3.1303,
      longitude: -60.0234,
      locationName: 'Teatro Amazonas, Manaus, AM',
      logoUrl:
        'https://upload.wikimedia.org/wikipedia/commons/9/95/Interior_of_Teatro_Amazonas%2C_Manaus%2C_Brazil_01.jpg',
      externalLink:
        'https://pt.wikipedia.org/wiki/Festival_de_Teatro_da_Amaz%C3%B4nia',
      relatedLinks: [],
    },
  });

  // 13. Festival Breves Cenas de Teatro
  await prisma.event.upsert({
    where: { nome: 'Festival Breves Cenas de Teatro 2026' },
    update: {
      logoUrl:
        'https://upload.wikimedia.org/wikipedia/commons/d/d7/Amazon_Theatre%2C_Teatro_Amazonas._Manaus%2C_Brazil._04.jpg',
    },
    create: {
      nome: 'Festival Breves Cenas de Teatro 2026',
      descricao: 'Festival nacional de teatro realizado em Manaus.',
      data: new Date('2026-03-12T19:30:00Z'),
      eventTypeId: eventTypeMap['cultura']!,
      userId: gestorUser.id,
      latitude: -3.1303,
      longitude: -60.0234,
      locationName: 'Manaus, AM',
      logoUrl:
        'https://upload.wikimedia.org/wikipedia/commons/d/d7/Amazon_Theatre%2C_Teatro_Amazonas._Manaus%2C_Brazil._04.jpg',
      externalLink:
        'https://pt.wikipedia.org/wiki/Festival_Breves_Cenas_de_Teatro',
      relatedLinks: [],
    },
  });

  // 14. Bienal do Livro do Amazonas
  await prisma.event.upsert({
    where: { nome: 'Bienal do Livro do Amazonas 2026' },
    update: {
      logoUrl:
        'https://upload.wikimedia.org/wikipedia/commons/c/c5/BibliotecaPublicaAmazonas_01.JPG',
    },
    create: {
      nome: 'Bienal do Livro do Amazonas 2026',
      descricao:
        'Bienal literária com encontros, debates e programação cultural em Manaus.',
      data: new Date('2026-09-20T18:00:00Z'),
      eventTypeId: eventTypeMap['cultura']!,
      userId: gestorUser2.id,
      latitude: -3.1312,
      longitude: -60.0231,
      locationName: 'Biblioteca Pública do Amazonas, Manaus, AM',
      logoUrl:
        'https://upload.wikimedia.org/wikipedia/commons/c/c5/BibliotecaPublicaAmazonas_01.JPG',
      externalLink: 'https://pt.wikipedia.org/wiki/Bienal_do_Livro_do_Amazonas',
      relatedLinks: [],
    },
  });

  // 15. Semana do Quadrinho Nacional de Manaus
  await prisma.event.upsert({
    where: { nome: 'Semana do Quadrinho Nacional de Manaus 2026' },
    update: {
      logoUrl:
        'https://upload.wikimedia.org/wikipedia/commons/8/87/Semana_do_Quadrinho_Nacional_de_Manaus.png',
    },
    create: {
      nome: 'Semana do Quadrinho Nacional de Manaus 2026',
      descricao:
        'Evento dedicado aos quadrinhos brasileiros e artistas locais.',
      data: new Date('2026-04-22T10:00:00Z'),
      eventTypeId: eventTypeMap['cultura']!,
      userId: gestorUser.id,
      latitude: -3.1312,
      longitude: -60.0231,
      locationName: 'Manaus, AM',
      logoUrl:
        'https://upload.wikimedia.org/wikipedia/commons/8/87/Semana_do_Quadrinho_Nacional_de_Manaus.png',
      externalLink:
        'https://pt.wikipedia.org/wiki/Semana_do_Quadrinho_Nacional_de_Manaus',
      relatedLinks: [],
    },
  });

  // 16. Festival da Cunhã
  await prisma.event.upsert({
    where: { nome: 'Festival da Cunhã 2026' },
    update: {
      logoUrl:
        'https://upload.wikimedia.org/wikipedia/commons/f/f5/FestivalDaCunh%C3%A3-logo.png',
    },
    create: {
      nome: 'Festival da Cunhã 2026',
      descricao:
        'Festival de música realizado na Arena da Amazônia, em Manaus.',
      data: new Date('2026-05-09T20:00:00Z'),
      eventTypeId: eventTypeMap['festividade']!,
      userId: gestorUser2.id,
      latitude: -3.0831,
      longitude: -60.028,
      locationName: 'Arena da Amazônia, Manaus, AM',
      logoUrl:
        'https://upload.wikimedia.org/wikipedia/commons/f/f5/FestivalDaCunh%C3%A3-logo.png',
      externalLink: 'https://pt.wikipedia.org/wiki/Festival_da_Cunh%C3%A3',
      relatedLinks: [],
    },
  });

  // 17. Carnaval de Manaus
  await prisma.event.upsert({
    where: { nome: 'Carnaval de Manaus 2026' },
    update: {
      logoUrl:
        'https://upload.wikimedia.org/wikipedia/commons/3/31/Samb%C3%B3dromo-de-Manaus.png',
    },
    create: {
      nome: 'Carnaval de Manaus 2026',
      descricao:
        'Festa popular com desfiles de escolas de samba no Sambódromo de Manaus.',
      data: new Date('2026-02-13T22:00:00Z'),
      eventTypeId: eventTypeMap['festividade']!,
      userId: gestorUser.id,
      latitude: -3.0882,
      longitude: -60.0182,
      locationName: 'Sambódromo de Manaus, Manaus, AM',
      logoUrl:
        'https://upload.wikimedia.org/wikipedia/commons/3/31/Samb%C3%B3dromo-de-Manaus.png',
      externalLink: 'https://pt.wikipedia.org/wiki/Carnaval_de_Manaus',
      relatedLinks: [],
    },
  });

  // 18. Festa de Nossa Senhora do Carmo de Parintins
  await prisma.event.upsert({
    where: { nome: 'Festa de Nossa Senhora do Carmo de Parintins 2026' },
    update: {
      logoUrl:
        'https://upload.wikimedia.org/wikipedia/commons/e/eb/IGREJA_NO_FESTIVAL_DE_PARINTINS_NO_AMAZONAS%2C_BRASIL.jpg',
    },
    create: {
      nome: 'Festa de Nossa Senhora do Carmo de Parintins 2026',
      descricao:
        'Tradicional festa religiosa realizada em Parintins no mês de julho.',
      data: new Date('2026-07-16T18:00:00Z'),
      eventTypeId: eventTypeMap['festividade']!,
      userId: gestorUser2.id,
      latitude: -2.6288,
      longitude: -56.7324,
      locationName: 'Parintins, AM',
      logoUrl:
        'https://upload.wikimedia.org/wikipedia/commons/e/eb/IGREJA_NO_FESTIVAL_DE_PARINTINS_NO_AMAZONAS%2C_BRASIL.jpg',
      externalLink:
        'https://pt.wikipedia.org/wiki/Festa_de_Nossa_Senhora_do_Carmo_de_Parintins',
      relatedLinks: [],
    },
  });

  // 19. Festa de Santo Antônio de Borba
  await prisma.event.upsert({
    where: { nome: 'Festa de Santo Antônio de Borba 2026' },
    update: {
      logoUrl:
        'https://upload.wikimedia.org/wikipedia/commons/a/ae/Borba_-_Amazonas_-_Igreja.jpg',
    },
    create: {
      nome: 'Festa de Santo Antônio de Borba 2026',
      descricao:
        'Festa religiosa tradicional realizada em Borba no mês de junho.',
      data: new Date('2026-06-13T18:00:00Z'),
      eventTypeId: eventTypeMap['festividade']!,
      userId: gestorUser.id,
      latitude: -4.3915,
      longitude: -59.5932,
      locationName: 'Borba, AM',
      logoUrl:
        'https://upload.wikimedia.org/wikipedia/commons/a/ae/Borba_-_Amazonas_-_Igreja.jpg',
      externalLink:
        'https://pt.wikipedia.org/wiki/Festa_de_Santo_Ant%C3%B4nio_de_Borba',
      relatedLinks: [],
    },
  });
  // 20. Feira Internacional de Gastronomia Amazônica
  await prisma.event.upsert({
    where: { nome: 'Feira Internacional de Gastronomia Amazônica 2026' },
    update: {
      logoUrl:
        'https://upload.wikimedia.org/wikipedia/commons/c/cb/Mercado_Municipal_Adolpho_Lisboa%2C_Manaus%2C_Brazil_03.jpg',
    },
    create: {
      nome: 'Feira Internacional de Gastronomia Amazônica 2026',
      descricao:
        'Feira gastronômica com chefs, produtores e programação cultural em Manaus.',
      data: new Date('2026-10-03T18:00:00Z'),
      eventTypeId: eventTypeMap['gastronomia']!,
      userId: gestorUser.id,
      latitude: -3.1312,
      longitude: -60.0231,
      locationName: 'Manaus, AM',
      logoUrl:
        'https://upload.wikimedia.org/wikipedia/commons/c/cb/Mercado_Municipal_Adolpho_Lisboa%2C_Manaus%2C_Brazil_03.jpg',
      externalLink:
        'https://g1.globo.com/am/amazonas/noticia/2025/10/03/feira-internacional-de-gastronomia-amazonica-comeca-nesta-sexta-feira-3-em-manaus-confira-a-programacao.ghtml',
      relatedLinks: [],
    },
  });

  // 21. Festival Gastronômico de Parintins
  await prisma.event.upsert({
    where: { nome: 'Festival Gastronômico de Parintins 2026' },
    update: {
      logoUrl:
        'https://upload.wikimedia.org/wikipedia/commons/c/c4/Mercado_Municipal_Adolpho_Lisboa%2C_Manaus%2C_Brazil_07.jpg',
    },
    create: {
      nome: 'Festival Gastronômico de Parintins 2026',
      descricao:
        'Festival anual que valoriza a culinária local e o turismo em Parintins.',
      data: new Date('2026-06-12T18:00:00Z'),
      eventTypeId: eventTypeMap['gastronomia']!,
      userId: gestorUser2.id,
      latitude: -2.6288,
      longitude: -56.7324,
      locationName: 'Parintins, AM',
      logoUrl:
        'https://upload.wikimedia.org/wikipedia/commons/c/c4/Mercado_Municipal_Adolpho_Lisboa%2C_Manaus%2C_Brazil_07.jpg',
      externalLink:
        'https://www.panoramaparintins.com/2025/11/festival-gastronomico-de-parintins.html',
      relatedLinks: [],
    },
  });

  // 22. Festa do Cupuaçu de Presidente Figueiredo
  await prisma.event.upsert({
    where: { nome: 'Festa do Cupuaçu de Presidente Figueiredo 2026' },
    update: {
      logoUrl:
        'https://upload.wikimedia.org/wikipedia/commons/0/0b/Cupuacu_fruit_opened.jpg',
    },
    create: {
      nome: 'Festa do Cupuaçu de Presidente Figueiredo 2026',
      descricao:
        'Festa tradicional com gastronomia regional e atrações culturais em Presidente Figueiredo.',
      data: new Date('2026-07-31T18:00:00Z'),
      eventTypeId: eventTypeMap['gastronomia']!,
      userId: gestorUser.id,
      latitude: -2.55,
      longitude: -60.0,
      locationName: 'Presidente Figueiredo, AM',
      logoUrl:
        'https://upload.wikimedia.org/wikipedia/commons/0/0b/Cupuacu_fruit_opened.jpg',
      externalLink:
        'https://www.presidentefigueiredo.am.gov.br/programacao-festa-cupuacu-presidente-figueiredo/',
      relatedLinks: [],
    },
  });

  // 23. Festa Cultural do Açaí de Codajás
  await prisma.event.upsert({
    where: { nome: 'Festa Cultural do Açaí de Codajás 2026' },
    update: {
      logoUrl:
        'https://upload.wikimedia.org/wikipedia/commons/e/e5/Acai-complt4.JPG',
    },
    create: {
      nome: 'Festa Cultural do Açaí de Codajás 2026',
      descricao:
        'Celebração do açaí com gastronomia, concursos e programação cultural em Codajás.',
      data: new Date('2026-05-02T18:00:00Z'),
      eventTypeId: eventTypeMap['gastronomia']!,
      userId: gestorUser2.id,
      latitude: -3.83,
      longitude: -62.06,
      locationName: 'Codajás, AM',
      logoUrl:
        'https://upload.wikimedia.org/wikipedia/commons/e/e5/Acai-complt4.JPG',
      externalLink:
        'https://www.culturaamazonica.com.br/2025/04/29/codajas-se-prepara-para-34a-festa-cultural-do-acai-com-shows-ao-vivo-e-escolha-da-rainha/',
      relatedLinks: [],
    },
  });

  // 24. Festa da Castanha de Tefé
  await prisma.event.upsert({
    where: { nome: 'Festa da Castanha de Tefé 2026' },
    update: {
      logoUrl:
        'https://upload.wikimedia.org/wikipedia/commons/d/d6/Bertholletia_excelsa_seeds_closeup.jpg',
    },
    create: {
      nome: 'Festa da Castanha de Tefé 2026',
      descricao:
        'Evento gastronômico e cultural que celebra a castanha em Tefé.',
      data: new Date('2026-05-01T18:00:00Z'),
      eventTypeId: eventTypeMap['gastronomia']!,
      userId: gestorUser.id,
      latitude: -3.354,
      longitude: -64.711,
      locationName: 'Tefé, AM',
      logoUrl:
        'https://upload.wikimedia.org/wikipedia/commons/d/d6/Bertholletia_excelsa_seeds_closeup.jpg',
      externalLink:
        'https://mercadizar.com/entretenimento/festa-da-castanha-de-tefe-celebra-22a-edicao-com-atracoes-nacionais/',
      relatedLinks: [],
    },
  });

  // 25. Festival do Jaraqui de Manaus
  await prisma.event.upsert({
    where: { nome: 'Festival do Jaraqui de Manaus 2026' },
    update: {
      logoUrl:
        'https://upload.wikimedia.org/wikipedia/commons/3/3b/Jaraqui_da_Amaz%C3%B4nia.jpg',
    },
    create: {
      nome: 'Festival do Jaraqui de Manaus 2026',
      descricao:
        'Festival gastronômico que celebra o jaraqui com pratos típicos e atrações culturais.',
      data: new Date('2026-09-13T18:00:00Z'),
      eventTypeId: eventTypeMap['gastronomia']!,
      userId: gestorUser2.id,
      latitude: -3.1303,
      longitude: -60.0234,
      locationName: 'Manaus, AM',
      logoUrl:
        'https://upload.wikimedia.org/wikipedia/commons/3/3b/Jaraqui_da_Amaz%C3%B4nia.jpg',
      externalLink:
        'https://www.valoramazonico.com/2025/09/03/festival-do-jaraqui-celebra-tradicao-e-identidade-amazonica-em-manaus/',
      relatedLinks: [],
    },
  });

  // 26. Festival do Tucunaré de Nhamundá
  await prisma.event.upsert({
    where: { nome: 'Festival do Tucunaré de Nhamundá 2026' },
    update: {
      logoUrl:
        'https://upload.wikimedia.org/wikipedia/commons/a/a1/Tucunar%C3%A9_%28Peacock_Bass%29_%2820750719960%29.jpg',
    },
    create: {
      nome: 'Festival do Tucunaré de Nhamundá 2026',
      descricao:
        'Festival tradicional que celebra o tucunaré e movimenta o turismo local em Nhamundá.',
      data: new Date('2026-04-03T18:00:00Z'),
      eventTypeId: eventTypeMap['gastronomia']!,
      userId: gestorUser.id,
      latitude: -2.19,
      longitude: -56.71,
      locationName: 'Nhamundá, AM',
      logoUrl:
        'https://upload.wikimedia.org/wikipedia/commons/a/a1/Tucunar%C3%A9_%28Peacock_Bass%29_%2820750719960%29.jpg',
      externalLink:
        'https://agroflorestamazonia.com/noticias-recentes/festival-do-tucunare-em-nhamunda-celebra-cultura-turismo-e-economia-local/',
      relatedLinks: [],
    },
  });

  // 27. Festival Amazonas de Turismo
  await prisma.event.upsert({
    where: { nome: 'Festival Amazonas de Turismo 2026' },
    update: {
      logoUrl:
        'https://upload.wikimedia.org/wikipedia/commons/7/7f/Centro_Historico_de_Manaus.jpg',
    },
    create: {
      nome: 'Festival Amazonas de Turismo 2026',
      descricao:
        'Festival que promove negócios, capacitação e visibilidade para o turismo no Amazonas.',
      data: new Date('2026-09-24T09:00:00Z'),
      eventTypeId: eventTypeMap['turismo']!,
      userId: gestorUser2.id,
      latitude: -3.1303,
      longitude: -60.0234,
      locationName: 'Manaus, AM',
      logoUrl:
        'https://upload.wikimedia.org/wikipedia/commons/7/7f/Centro_Historico_de_Manaus.jpg',
      externalLink:
        'https://www.amazonastur.am.gov.br/amazonastur-lanca-1o-festival-amazonas-de-turismo-em-celebracao-as-atividades-e-aos-profissionais-do-setor/',
      relatedLinks: [],
    },
  });

  // 28. Conta Amazonas
  await prisma.event.upsert({
    where: { nome: 'Conta Amazonas 2026' },
    update: {
      logoUrl:
        'https://upload.wikimedia.org/wikipedia/commons/a/a6/Teatro_Amazonas_Atualmente_01.jpg',
    },
    create: {
      nome: 'Conta Amazonas 2026',
      descricao:
        'Evento de negócios e networking para o setor de turismo do Amazonas.',
      data: new Date('2026-05-16T09:00:00Z'),
      eventTypeId: eventTypeMap['turismo']!,
      userId: gestorUser.id,
      latitude: -3.1303,
      longitude: -60.0234,
      locationName: 'Manaus, AM',
      logoUrl:
        'https://upload.wikimedia.org/wikipedia/commons/a/a6/Teatro_Amazonas_Atualmente_01.jpg',
      externalLink:
        'https://visitemanaus.com/noticias-manaus/conta-amazonas-2025-e-iii-festival-amazonas-de-turismo/',
      relatedLinks: [],
    },
  });

  // 29. Panavueiro Fest Parintins
  await prisma.event.upsert({
    where: { nome: 'Panavueiro Fest Parintins 2026' },
    update: {
      logoUrl:
        'https://upload.wikimedia.org/wikipedia/commons/5/50/Festival_de_Parintins_%2841707374220%29.jpg',
    },
    create: {
      nome: 'Panavueiro Fest Parintins 2026',
      descricao:
        'Programação turística com shows e transmissão das apresentações do Festival de Parintins.',
      data: new Date('2026-06-24T20:00:00Z'),
      eventTypeId: eventTypeMap['turismo']!,
      userId: gestorUser2.id,
      latitude: -2.6288,
      longitude: -56.7324,
      locationName: 'Parintins, AM',
      logoUrl:
        'https://upload.wikimedia.org/wikipedia/commons/5/50/Festival_de_Parintins_%2841707374220%29.jpg',
      externalLink:
        'https://www.amazonastur.am.gov.br/festival-de-parintins-2025-panavueiro-fest-tem-programacao-com-shows-e-transmissao-das-apresentacoes-de-caprichoso-e-garantido/',
      relatedLinks: [],
    },
  });

  // 30. 10ª Edição Trail Run Extreme
  await prisma.event.upsert({
    where: { nome: '10ª Edição Trail Run Extreme 2026' },
    update: {
      logoUrl:
        'https://upload.wikimedia.org/wikipedia/commons/a/a9/Trail_Running.jpg',
    },
    create: {
      nome: '10ª Edição Trail Run Extreme 2026',
      descricao:
        'Prova de corrida em trilha com percursos de 21km, 10km e 5km.',
      data: new Date('2026-01-11T06:00:00Z'),
      eventTypeId: eventTypeMap['aventura']!,
      userId: gestorUser.id,
      latitude: -3.1303,
      longitude: -60.0234,
      locationName: 'Manaus, AM',
      logoUrl:
        'https://upload.wikimedia.org/wikipedia/commons/a/a9/Trail_Running.jpg',
      externalLink:
        'https://corridasemaratonas.com.br/corridas/10a-edicao-trail-run-extreme/',
      relatedLinks: [],
    },
  });

  // 31. 22ª Maratona Kids - Corrida de Obstáculos
  await prisma.event.upsert({
    where: { nome: '22ª Maratona Kids - Corrida de Obstáculos 2026' },
    update: {
      logoUrl:
        'https://upload.wikimedia.org/wikipedia/commons/4/44/2018_Orizaba_Running_race_19.jpg',
    },
    create: {
      nome: '22ª Maratona Kids - Corrida de Obstáculos 2026',
      descricao:
        'Corrida com obstáculos voltada para o público infantil em Manaus.',
      data: new Date('2026-01-25T08:00:00Z'),
      eventTypeId: eventTypeMap['aventura']!,
      userId: gestorUser2.id,
      latitude: -3.1303,
      longitude: -60.0234,
      locationName: 'Manaus, AM',
      logoUrl:
        'https://upload.wikimedia.org/wikipedia/commons/4/44/2018_Orizaba_Running_race_19.jpg',
      externalLink:
        'https://corridasemaratonas.com.br/corridas/22a-maratona-kids-corrida-de-obstaculos/',
      relatedLinks: [],
    },
  });

  // 32. Live! Run XP
  await prisma.event.upsert({
    where: { nome: 'Live! Run XP Manaus 2026' },
    update: {
      logoUrl:
        'https://upload.wikimedia.org/wikipedia/commons/f/f5/2018_Orizaba_Running_race_30.jpg',
    },
    create: {
      nome: 'Live! Run XP Manaus 2026',
      descricao: 'Corrida de rua com percurso de 6km em Manaus.',
      data: new Date('2026-03-15T06:30:00Z'),
      eventTypeId: eventTypeMap['aventura']!,
      userId: gestorUser.id,
      latitude: -3.1303,
      longitude: -60.0234,
      locationName: 'Manaus, AM',
      logoUrl:
        'https://upload.wikimedia.org/wikipedia/commons/f/f5/2018_Orizaba_Running_race_30.jpg',
      externalLink: 'https://corridasemaratonas.com.br/corridas/live-run-xp/',
      relatedLinks: [],
    },
  });

  // 33. Circuito das Estações - Outono
  await prisma.event.upsert({
    where: { nome: 'Circuito das Estações - Outono 2026' },
    update: {
      logoUrl:
        'https://upload.wikimedia.org/wikipedia/commons/c/c7/2018_Orizaba_Running_race_35.jpg',
    },
    create: {
      nome: 'Circuito das Estações - Outono 2026',
      descricao:
        'Etapa Outono do Circuito das Estações com percursos de 13km, 10km e 5km.',
      data: new Date('2026-04-26T06:00:00Z'),
      eventTypeId: eventTypeMap['aventura']!,
      userId: gestorUser2.id,
      latitude: -3.1303,
      longitude: -60.0234,
      locationName: 'Manaus, AM',
      logoUrl:
        'https://upload.wikimedia.org/wikipedia/commons/c/c7/2018_Orizaba_Running_race_35.jpg',
      externalLink:
        'https://corridasemaratonas.com.br/corridas/circuito-das-estacoes-outono/',
      relatedLinks: [],
    },
  });

  // 34. Circuito das Estações - Inverno
  await prisma.event.upsert({
    where: { nome: 'Circuito das Estações - Inverno 2026' },
    update: {
      logoUrl:
        'https://upload.wikimedia.org/wikipedia/commons/7/78/2018_Orizaba_Running_race_46.jpg',
    },
    create: {
      nome: 'Circuito das Estações - Inverno 2026',
      descricao:
        'Etapa Inverno do Circuito das Estações com percursos de 15km, 10km e 5km.',
      data: new Date('2026-06-14T06:00:00Z'),
      eventTypeId: eventTypeMap['aventura']!,
      userId: gestorUser.id,
      latitude: -3.1303,
      longitude: -60.0234,
      locationName: 'Manaus, AM',
      logoUrl:
        'https://upload.wikimedia.org/wikipedia/commons/7/78/2018_Orizaba_Running_race_46.jpg',
      externalLink:
        'https://corridasemaratonas.com.br/corridas/circuito-das-estacoes-inverno/',
      relatedLinks: [],
    },
  });

  // 35. Night Run Manaus
  await prisma.event.upsert({
    where: { nome: 'Night Run Manaus 2026' },
    update: {
      logoUrl:
        'https://upload.wikimedia.org/wikipedia/commons/b/b5/Chris_Lohner%2C_Vienna_Night_Run_2009.jpg',
    },
    create: {
      nome: 'Night Run Manaus 2026',
      descricao: 'Corrida noturna com percursos de 10km e 5km em Manaus.',
      data: new Date('2026-06-27T22:00:00Z'),
      eventTypeId: eventTypeMap['aventura']!,
      userId: gestorUser2.id,
      latitude: -3.1303,
      longitude: -60.0234,
      locationName: 'Manaus, AM',
      logoUrl:
        'https://upload.wikimedia.org/wikipedia/commons/b/b5/Chris_Lohner%2C_Vienna_Night_Run_2009.jpg',
      externalLink:
        'https://corridasemaratonas.com.br/corridas/night-run-2026/',
      relatedLinks: [],
    },
  });

  // 36. Circuito das Estações - Primavera
  await prisma.event.upsert({
    where: { nome: 'Circuito das Estações - Primavera 2026' },
    update: {
      logoUrl:
        'https://upload.wikimedia.org/wikipedia/commons/5/5d/September_2002%2C_Running_race_in_Rennes.jpg',
    },
    create: {
      nome: 'Circuito das Estações - Primavera 2026',
      descricao:
        'Etapa Primavera do Circuito das Estações com percursos de 18km, 10km e 5km.',
      data: new Date('2026-08-23T06:00:00Z'),
      eventTypeId: eventTypeMap['aventura']!,
      userId: gestorUser.id,
      latitude: -3.1303,
      longitude: -60.0234,
      locationName: 'Manaus, AM',
      logoUrl:
        'https://upload.wikimedia.org/wikipedia/commons/5/5d/September_2002%2C_Running_race_in_Rennes.jpg',
      externalLink:
        'https://corridasemaratonas.com.br/corridas/circuito-das-estacoes-primavera-7/',
      relatedLinks: [],
    },
  });

  // 37. III Corrida Sauim-de-Coleira
  await prisma.event.upsert({
    where: { nome: 'III Corrida Sauim-de-Coleira 2026' },
    update: {
      logoUrl:
        'https://upload.wikimedia.org/wikipedia/commons/c/c7/2018_Orizaba_Running_race_35.jpg',
    },
    create: {
      nome: 'III Corrida Sauim-de-Coleira 2026',
      descricao:
        'Corrida que promove a conservação do sauim-de-coleira em Manaus.',
      data: new Date('2026-10-24T06:00:00Z'),
      eventTypeId: eventTypeMap['aventura']!,
      userId: gestorUser2.id,
      latitude: -3.1303,
      longitude: -60.0234,
      locationName: 'Manaus, AM',
      logoUrl:
        'https://upload.wikimedia.org/wikipedia/commons/c/c7/2018_Orizaba_Running_race_35.jpg',
      externalLink:
        'https://corridasemaratonas.com.br/corridas/iii-corrida-sauim-de-coleira/',
      relatedLinks: [],
    },
  });

  // 38. Circuito das Estações - Verão
  await prisma.event.upsert({
    where: { nome: 'Circuito das Estações - Verão 2026' },
    update: {
      logoUrl:
        'https://upload.wikimedia.org/wikipedia/commons/f/f5/2018_Orizaba_Running_race_30.jpg',
    },
    create: {
      nome: 'Circuito das Estações - Verão 2026',
      descricao:
        'Etapa Verão do Circuito das Estações com percursos de 10km e 5km.',
      data: new Date('2026-11-08T06:00:00Z'),
      eventTypeId: eventTypeMap['aventura']!,
      userId: gestorUser.id,
      latitude: -3.1303,
      longitude: -60.0234,
      locationName: 'Manaus, AM',
      logoUrl:
        'https://upload.wikimedia.org/wikipedia/commons/f/f5/2018_Orizaba_Running_race_30.jpg',
      externalLink:
        'https://corridasemaratonas.com.br/corridas/circuito-das-estacoes-verao-17/',
      relatedLinks: [],
    },
  });

  // 39. Copa Brasil de Pesca Esportiva
  await prisma.event.upsert({
    where: { nome: 'Copa Brasil de Pesca Esportiva 2026' },
    update: {
      logoUrl:
        'https://upload.wikimedia.org/wikipedia/commons/9/95/Peacock_Bass_Fishing.jpg',
    },
    create: {
      nome: 'Copa Brasil de Pesca Esportiva 2026',
      descricao:
        'Competição de pesca esportiva realizada em Barcelos, no Rio Negro.',
      data: new Date('2026-09-06T07:00:00Z'),
      eventTypeId: eventTypeMap['aventura']!,
      userId: gestorUser2.id,
      latitude: -0.9753,
      longitude: -62.9248,
      locationName: 'Praia Grande, Barcelos, AM',
      logoUrl:
        'https://upload.wikimedia.org/wikipedia/commons/9/95/Peacock_Bass_Fishing.jpg',
      externalLink: 'https://aep-am.org.br/copa-brasil-de-pesca-esportiva/',
      relatedLinks: [],
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
