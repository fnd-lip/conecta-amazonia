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

    return events.map((event: any) => mapEventCategory(event));
  }

  async findById(id: string) {
    const event = await prisma.event.findUnique({
      where: { id },
      include: {
        eventType: true,
        children: { include: { eventType: true } },
        ticketLots: {
          where: { active: true },
          orderBy: { price: 'asc' },
        },
      },
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

    return events.map((event: any) => mapEventCategory(event));
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

    return events.map((event: any) => mapEventCategory(event));
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

    return events.map((event: any) => mapEventCategory(event));
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

    return events.map((event: any) => mapEventCategory(event));
  }

  async getEventStatistics(eventId: string) {
    const event = await prisma.event.findUnique({
      where: { id: eventId },
      include: {
        eventType: true,
        ticketLots: true,
        orders: {
          where: {
            status: 'confirmed',
          },
          include: {
            items: true,
            validations: true,
          },
        },
      },
    });

    if (!event) {
      return null;
    }

    // Calcular estatísticas
    let totalTicketsSold = 0;
    let totalRevenue = 0;
    let ticketsValidated = 0;

    // Contar tickets vendidos e receita total dos pedidos confirmados
    event.orders.forEach((order: any) => {
      order.items.forEach((item: any) => {
        totalTicketsSold += item.quantity;
        totalRevenue += item.price * item.quantity;
      });

      if (order.validations && order.validations.length > 0) {
        ticketsValidated++;
      }
    });

    // Processar lotes e calcular totais
    const ticketLots = event.ticketLots.map((lot: any) => {
      // Calcular vendidos por lote
      const soldInLot = event.orders.reduce((acc: number, order: any) => {
        const itemsInLot = order.items.filter(
          (item: any) => item.ticketLotId === lot.id
        );
        return (
          acc +
          itemsInLot.reduce((sum: number, item: any) => sum + item.quantity, 0)
        );
      }, 0);

      // lot.quantity já representa os ingressos restantes (foi decrementado na compra)
      const remainingInLot = lot.active ? lot.quantity : 0;
      const totalInLot = remainingInLot + soldInLot;

      return {
        id: lot.id,
        name: lot.name,
        price: lot.price,
        quantity: totalInLot, // Total original
        sold: soldInLot,
        remaining: remainingInLot,
        active: lot.active,
      };
    });

    // Calcular totais baseado nos lotes
    const totalTicketsAvailable = ticketLots.reduce(
      (sum: number, lot: any) => sum + lot.quantity,
      0
    );
    const ticketsRemaining = ticketLots.reduce(
      (sum: number, lot: any) => sum + lot.remaining,
      0
    );

    return {
      eventId: event.id,
      eventName: event.nome,
      eventDate: event.data,
      eventType: event.eventType.nome,
      totalTicketsAvailable,
      totalTicketsSold,
      ticketsRemaining,
      ticketsValidated,
      totalRevenue,
      totalOrders: event.orders.length,
      ticketLots,
    };
  }

  async getDailySales(eventId: string) {
    const event = await prisma.event.findUnique({
      where: { id: eventId },
      include: {
        orders: {
          where: {
            status: 'confirmed',
          },
          include: {
            items: true,
          },
          orderBy: {
            createdAt: 'asc',
          },
        },
      },
    });

    if (!event) {
      return [];
    }

    // Agrupar vendas por dia
    const salesByDay = new Map<string, { tickets: number; revenue: number }>();

    event.orders.forEach((order: any) => {
      const date = new Date(order.createdAt);
      const dateKey = date.toISOString().split('T')[0]!; // YYYY-MM-DD

      if (!salesByDay.has(dateKey)) {
        salesByDay.set(dateKey, { tickets: 0, revenue: 0 });
      }

      const dayData = salesByDay.get(dateKey)!;

      order.items.forEach((item: any) => {
        dayData.tickets += item.quantity;
        dayData.revenue += item.price * item.quantity;
      });
    });

    // Converter para array e adicionar acumulado
    let accumulated = 0;
    const dailySales = Array.from(salesByDay.entries())
      .sort((a, b) => a[0].localeCompare(b[0]))
      .map(([date, data]) => {
        accumulated += data.tickets;
        return {
          date,
          tickets: data.tickets,
          revenue: data.revenue,
          accumulated,
        };
      });

    return dailySales;
  }
}
