import prisma from '../../config/prisma';
import { CreateEventDTO } from './event.types';

export class EventRepository {
  async create(data: CreateEventDTO) {
    return prisma.event.create({
      data: {
        nome: data.nome,
        descricao: data.descricao,
        data: new Date(data.data),
        categoria: data.categoria,
        userId: data.userId!,
        parentId: data.parentId ?? null,
        logoUrl: data.logoUrl ?? null,
        externalLink: data.externalLink ?? null,
        relatedLinks: data.relatedLinks ?? [],
        ...(data.subeventos && {
          children: {
            create: data.subeventos.map((se) => ({
              nome: se.nome,
              descricao: se.descricao,
              data: new Date(se.data),
              categoria: se.categoria,
              userId: data.userId!,
            })),
          },
        }),
      },
      include: {
        children: true,
      },
    });
  }

  async findByUserId(userId: string) {
    return prisma.event.findMany({
      where: {
        userId,
        parentId: null,
      },
      include: {
        children: true,
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
      orderBy: {
        data: 'desc',
      },
    });
  }

  async findById(id: string) {
    return prisma.event.findUnique({
      where: { id },
      include: { children: true },
    });
  }

  async deleteById(id: string) {
    // Excluir subeventos primeiro (se houver)
    await prisma.event.deleteMany({
      where: { parentId: id },
    });

    // Excluir evento principal
    return prisma.event.delete({
      where: { id },
    });
  }

  async updateById(id: string, data: Partial<CreateEventDTO>) {
    return prisma.event.update({
      where: { id },
      data: {
        ...(data.nome && { nome: data.nome }),
        ...(data.descricao && { descricao: data.descricao }),
        ...(data.data && { data: new Date(data.data) }),
        ...(data.categoria && { categoria: data.categoria }),
        ...(data.logoUrl && { logoUrl: data.logoUrl }),
        ...(data.externalLink && { externalLink: data.externalLink }),
        ...(data.relatedLinks && { relatedLinks: data.relatedLinks }),
      },
      include: {
        children: true,
      },
    });
  }

  async findAll(limit: number) {
    return prisma.event.findMany({
      where: {
        parentId: null,
      },
      orderBy: {
        data: 'asc',
      },
      take: limit,
      select: {
        id: true,
        nome: true,
        categoria: true,
        data: true,
      },
    });
  }

  async findAllWithFilters(filters: any, limit: number = 50) {
    return prisma.event.findMany({
      where: {
        parentId: null,
        ...filters,
      },
      orderBy: {
        data: 'asc',
      },
      take: limit,
      select: {
        id: true,
        nome: true,
        categoria: true,
        data: true,
      },
    });
  }
  async findPublicByDateRange(startDate: Date, endDate: Date) {
    return prisma.event.findMany({
      where: {
        parentId: null,
        data: {
          gte: startDate,
          lte: endDate,
        },
      },
      orderBy: { data: 'asc' },
    });
  }
}
