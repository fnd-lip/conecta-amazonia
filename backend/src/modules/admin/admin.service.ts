import { AdminRepository } from './admin.repository';

class AdminService {
  static async getAllEvents() {
    const events = await AdminRepository.findAllEvents();
    return events.map(event => ({
      ...event,
      categoria: event.eventType?.nome ?? null,
      children: Array.isArray(event.children)
        ? event.children.map(child => ({
            ...child,
            categoria: child.eventType?.nome ?? null
          }))
        : event.children
    }));
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
