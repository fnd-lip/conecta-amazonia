import { AdminRepository } from './admin.repository';

class AdminService {
  static async getAllEvents() {
    return await AdminRepository.findAllEvents();
  }

  static async getAllUsers() {
    const users = await AdminRepository.findAllUsers();
    return users.map(user => ({
      ...user,
      type: user.type.label
    }));
  }
}

export default AdminService;