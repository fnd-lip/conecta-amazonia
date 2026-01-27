import prisma from '../../config/prisma';
import { CreateEventDTO } from './event.types';

type EventWithType = any;

const mapEventCategory = (event: EventWithType | null) => {
  if (!event) return event;
  const categoria = event.eventType?.nome || null;
  const mapped = { ...event, categoria };
  if (Array.isArray(event.children)) {
    mapped.children = event.children.map((child: EventWithType) =>
      mapEventCategory(child)
    );
  }
  return mapped;
};

export class EventRepository {
  async create(data: CreateEventDTO) {
    const created = await prisma.event.create({
      data: {
        nome: data.nome,
        descricao: data.descricao,
        data: new Date(data.data),
        eventTypeId: data.eventTypeId!,
        userId: data.userId!,
        parentId: data.parentId ?? null,
        logoUrl: data.logoUrl ?? null,
        externalLink: data.externalLink ?? null,
        relatedLinks: data.relatedLinks ?? [],
        latitude: data.latitude ?? null,
        longitude: data.longitude ?? null,
        locationName: data.locationName ?? null,
        ...(data.subeventos && {
          children: {
            create: data.subeventos.map((se) => ({
              nome: se.nome,
              descricao: se.descricao,
              data: new Date(se.data),
              eventTypeId: se.eventTypeId!,
              userId: data.userId!,
            })),
          },
        }),
      },
      include: {
        eventType: true,
        children: { include: { eventType: true } },
      },
    });

    return mapEventCategory(created);
  }

  async findByUserId(userId: string) {
    const events = await prisma.event.findMany({
      where: {
        userId,
        parentId: null,
      },
      include: {
        eventType: true,
        children: { include: { eventType: true } },
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

    return events.map((event) => mapEventCategory(event));
  }

  async findById(id: string) {
    const event = await prisma.event.findUnique({
      where: { id },
      include: { eventType: true, children: { include: { eventType: true } } },
    });

    return mapEventCategory(event);
  }

  async deleteById(id: string) {
    await prisma.event.deleteMany({
      where: { parentId: id },
    });

    return prisma.event.delete({
      where: { id },
    });
  }

  async updateById(id: string, data: Partial<CreateEventDTO>) {
    const updated = await prisma.event.update({
      where: { id },
      data: {
        ...(data.nome && { nome: data.nome }),
        ...(data.descricao && { descricao: data.descricao }),
        ...(data.data && { data: new Date(data.data) }),
        ...(data.eventTypeId && { eventTypeId: data.eventTypeId }),
        ...(data.logoUrl && { logoUrl: data.logoUrl }),
        ...(data.externalLink && { externalLink: data.externalLink }),
        ...(data.relatedLinks && { relatedLinks: data.relatedLinks }),
        ...(data.latitude !== undefined && { latitude: data.latitude }),
        ...(data.longitude !== undefined && { longitude: data.longitude }),
        ...(data.locationName !== undefined && {
          locationName: data.locationName,
        }),
      },
      include: {
        eventType: true,
        children: { include: { eventType: true } },
      },
    });

    return mapEventCategory(updated);
  }

  async findAll(limit: number) {
    const events = await prisma.event.findMany({
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
        data: true,
        logoUrl: true,
        latitude: true,
        longitude: true,
        locationName: true,
        eventType: { select: { nome: true } },
      },
    });

    return events.map((event) => mapEventCategory(event));
  }

  async findAllWithFilters(filters: any, limit: number = 50) {
    const events = await prisma.event.findMany({
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
        data: true,
        logoUrl: true,
        latitude: true,
        longitude: true,
        locationName: true,
        eventType: { select: { nome: true } },
      },
    });

    return events.map((event) => mapEventCategory(event));
  }

  async findPublicByDateRange(startDate: Date, endDate: Date) {
    const events = await prisma.event.findMany({
      where: {
        parentId: null,
        data: {
          gte: startDate,
          lte: endDate,
        },
      },
      orderBy: { data: 'asc' },
      include: { eventType: true },
    });

    return events.map((event) => mapEventCategory(event));
  }

  async findBySearchTerm(term: string, limit: number = 10) {
    const events = await prisma.event.findMany({
      where: {
        parentId: null,
        OR: [
          { nome: { contains: term, mode: 'insensitive' } },
          { locationName: { contains: term, mode: 'insensitive' } },
        ],
      },
      orderBy: {
        data: 'asc',
      },
      take: limit,
      select: {
        id: true,
        nome: true,
        locationName: true,
        data: true,
        logoUrl: true,
        eventType: { select: { nome: true } },
      },
    });

    return events.map((event) => mapEventCategory(event));
  }
}