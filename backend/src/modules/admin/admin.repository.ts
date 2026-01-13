import prisma from '../../config/prisma';

export class AdminRepository {
  static async findAllEvents() {
    return await prisma.event.findMany({
      include: {
        user: {
          select: {
            name: true
          }
        },
        children: true
      },
      orderBy: {
        createdAt: 'desc'
      }
    });
  }

  static async findAllUsers() {
    return await prisma.user.findMany({
      select: {
        id: true,
        name: true,
        email: true,
        type: {
          select: {
            label: true
          }
        },
        createdAt: true,
        updatedAt: true
      },
      orderBy: {
        createdAt: 'desc'
      }
    });
  }
}