import bcrypt from 'bcryptjs';
import { usersRepository } from './users.repository';

interface UpdateProfileDTO {
  name?: string;
  email?: string;
  password?: string;
}

class UsersService {
  async getProfile(userId: string) {
    const user = await usersRepository.findById(userId);

    if (!user) {
      throw new Error('Usuário não encontrado');
    }

    return user;
  }

  async updateProfile(userId: string, data: UpdateProfileDTO) {
    const user = await usersRepository.findById(userId);

    if (!user) {
      throw new Error('Usuário não encontrado');
    }

    if (data.email !== undefined && data.email !== user.email) {
      const emailExists = await usersRepository.findByEmail(data.email);
      if (emailExists) {
        throw new Error('Este email já está em uso');
      }
    }

    const updateData: {
      name?: string;
      email?: string;
      password?: string;
    } = {};

    if (data.name !== undefined) {
      updateData.name = data.name;
    }

    if (data.email !== undefined) {
      updateData.email = data.email;
    }

    if (data.password !== undefined) {
      updateData.password = await bcrypt.hash(data.password, 10);
    }

    return usersRepository.update(userId, updateData);
  }

  async deleteProfile(userId: string) {
    return usersRepository.delete(userId);
  }
}

export const usersService = new UsersService();
