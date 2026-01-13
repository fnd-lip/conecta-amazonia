import prisma from '../../config/prisma';
import { User } from '@prisma/client';

class AuthRepository {
  async findByEmail(email: string) {
    return prisma.user.findUnique({
      where: { email },
      include: {
        type: true,
      },
    });
  }
}

export default AuthRepository;
