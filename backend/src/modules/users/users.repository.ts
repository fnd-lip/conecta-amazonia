import prisma from '../../config/prisma';
import { Prisma } from '@prisma/client';

class UsersRepository {
  findById(id: string) {
    return prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        name: true,
        email: true,
      },
    });
  }

  findByEmail(email: string) {
    return prisma.user.findUnique({
      where: { email },
    });
  }

  update(
    id: string,
    data: {
      name?: string;
      email?: string;
      password?: string;
    }
  ) {
    return prisma.user.update({
      where: { id },
      data,
      select: {
        id: true,
        name: true,
        email: true,
      },
    });
  }

  delete(id: string) {
    return prisma.user.delete({
      where: { id },
    });
  }
}

export const usersRepository = new UsersRepository();
