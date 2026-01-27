import prisma from '../../config/prisma';
import { Prisma } from '@prisma/client';

class AuthRepository {
  async create(data: Prisma.UserCreateInput) {
    return prisma.user.create({
      data,
    });
  }

  async findByEmail(email: string) {
    return prisma.user.findUnique({
      where: { email },
      include: { type: true },
    });
  }

  async update(userId: string, data: any) {
    return await prisma.user.update({
      where: { id: userId },
      data,
    });
  }

  async findByValidToken(tokenHash: string) {
    console.log('REPO: Buscando no banco pelo hash:', tokenHash);

    const user = await prisma.user.findFirst({
      where: {
        verificationToken: tokenHash,
        verificationExpires: {
          gt: new Date(),
        },
      },
    });

    console.log(
      'REPO: Resultado da busca:',
      user
        ? `Usuário ${user.email} encontrado`
        : 'Nenhum usuário encontrado (ou token expirado)'
    );

    return user;
  }

  async activateUser(userId: string) {
    console.log(`REPO: Ativando usuário ${userId}...`);
    return prisma.user.update({
      where: { id: userId },
      data: {
        isVerified: true,
        verificationToken: null,
        verificationExpires: null,
      },
    });
  }

  async delete(userId: string) {
    return await prisma.user.delete({
      where: { id: userId },
    });
  }
}

export default AuthRepository;
