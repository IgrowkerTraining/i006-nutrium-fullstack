import { STORAGE_KEYS } from '../constants/routes';
import { Notification, User } from '../types';

export const storage = {
  getUser(): User | null {
    try {
      const savedUser = localStorage.getItem(STORAGE_KEYS.USER);
      return savedUser ? JSON.parse(savedUser) : null;
    } catch (error) {
      console.error('Failed to parse saved user:', error);
      return null;
    }
  },

  setUser(user: User): void {
    localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(user));
  },

  removeUser(): void {
    localStorage.removeItem(STORAGE_KEYS.USER);
  },

  getToken(): string | null {
    return localStorage.getItem(STORAGE_KEYS.TOKEN);
  },

  setToken(token: string): void {
    localStorage.setItem(STORAGE_KEYS.TOKEN, token);
  },

  removeToken(): void {
    localStorage.removeItem(STORAGE_KEYS.TOKEN);
  },

  clear(): void {
    localStorage.removeItem(STORAGE_KEYS.USER);
    localStorage.removeItem(STORAGE_KEYS.TOKEN);
  },

  // --- Notificaciones ---

  // Guarda la "foto" de cómo están las citas ahora
  setAppointmentSnapshot(userId: string, appointments: any[]): void {
    localStorage.setItem(`appointments_${userId}`, JSON.stringify(appointments));
  },

  // Lee la "foto" anterior para comparar
  getAppointmentSnapshot(userId: string): any[] {
    try {
      const data = localStorage.getItem(`appointments_${userId}`);
      return data ? JSON.parse(data) : [];
    } catch {
      return [];
    }
  },

  // Guarda las notificaciones generadas
  setNotifications(userId: string, notifications: Notification[]): void {
    localStorage.setItem(`notif_${userId}`, JSON.stringify(notifications));
  },

  // Lee las notificaciones guardadas
  getNotifications(userId: string): Notification[] {
    try {
      const data = localStorage.getItem(`notif_${userId}`);
      return data ? JSON.parse(data) : [];
    } catch {
      return [];
    }
  },
};
