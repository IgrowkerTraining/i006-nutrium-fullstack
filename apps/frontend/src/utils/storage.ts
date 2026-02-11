import { STORAGE_KEYS } from '../constants/routes';
import { User } from '../types';

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
};
