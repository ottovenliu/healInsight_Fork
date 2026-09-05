import type { AuthUser } from '../types/auth';

export const AUTH_USER_STORAGE_KEY = 'healsight_auth_user';

export const DEMO_AUTH_USER: AuthUser = {
  id: 'usr_demo',
  name: '展示使用者',
  email: 'demo@healsight.health',
  provider: 'demo',
  avatar: '👤',
  token: 'mock-demo-token-12345'
};

export const getStoredAuthUser = (): AuthUser | null => {
  try {
    const raw = localStorage.getItem(AUTH_USER_STORAGE_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as AuthUser;
  } catch (err) {
    console.error('Failed to parse auth user from localStorage:', err);
    return null;
  }
};

export const setStoredAuthUser = (user: AuthUser): void => {
  try {
    localStorage.setItem(AUTH_USER_STORAGE_KEY, JSON.stringify(user));
  } catch (err) {
    console.error('Failed to save auth user to localStorage:', err);
  }
};

export const clearStoredAuthUser = (): void => {
  try {
    localStorage.removeItem(AUTH_USER_STORAGE_KEY);
  } catch (err) {
    console.error('Failed to clear auth user from localStorage:', err);
  }
};
