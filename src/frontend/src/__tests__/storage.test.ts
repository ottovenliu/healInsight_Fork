import { describe, it, expect, beforeEach } from 'vitest';

class LocalStorageMock {
  private store: Record<string, string> = {};
  getItem(key: string) {
    return this.store[key] !== undefined ? this.store[key] : null;
  }
  setItem(key: string, value: string) {
    this.store[key] = String(value);
  }
  removeItem(key: string) {
    delete this.store[key];
  }
  clear() {
    this.store = {};
  }
}

if (typeof globalThis.localStorage === 'undefined') {
  (globalThis as any).localStorage = new LocalStorageMock();
}

import {
  getStoredAuthUser,
  setStoredAuthUser,
  clearStoredAuthUser,
  DEMO_AUTH_USER
} from '../utils/authStorage';
import {
  getWeeklyActionCompletion,
  toggleWeeklyActionCompletion
} from '../utils/weeklyActionStorage';

describe('Auth Storage Utility', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('returns null when no auth user is stored', () => {
    expect(getStoredAuthUser()).toBeNull();
  });

  it('stores and retrieves authenticated user session', () => {
    setStoredAuthUser(DEMO_AUTH_USER);
    const user = getStoredAuthUser();
    expect(user).not.toBeNull();
    expect(user?.provider).toBe('demo');
    expect(user?.name).toBe('展示使用者');
  });

  it('clears authenticated user session on logout', () => {
    setStoredAuthUser(DEMO_AUTH_USER);
    clearStoredAuthUser();
    expect(getStoredAuthUser()).toBeNull();
  });
});

describe('Weekly Micro-Action Local Storage Utility', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('tracks weekly completions locally by profile and action ID', () => {
    const profileId = 'prof_alex';
    const actionId = 'act_01';

    // Initially false
    expect(getWeeklyActionCompletion(profileId, actionId)).toBe(false);

    // Toggle to true
    const newState = toggleWeeklyActionCompletion(profileId, actionId);
    expect(newState).toBe(true);
    expect(getWeeklyActionCompletion(profileId, actionId)).toBe(true);

    // Toggle back to false
    const toggledAgain = toggleWeeklyActionCompletion(profileId, actionId);
    expect(toggledAgain).toBe(false);
    expect(getWeeklyActionCompletion(profileId, actionId)).toBe(false);
  });

  it('isolates weekly completion states between different profiles', () => {
    toggleWeeklyActionCompletion('prof_alex', 'act_diet');
    expect(getWeeklyActionCompletion('prof_alex', 'act_diet')).toBe(true);
    expect(getWeeklyActionCompletion('prof_mom', 'act_diet')).toBe(false);
  });
});
