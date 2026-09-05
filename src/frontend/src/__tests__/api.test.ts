import { describe, it, expect, vi, beforeEach } from 'vitest';
import { authApi, profileApi, actionApi } from '../services/api';

describe('Frontend API Service', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it('authApi.login calls /api/v1/auth/login and returns response', async () => {
    const mockUser = { id: 'usr_demo', name: '展示使用者', email: 'demo@healsight.health', provider: 'demo' };
    const mockResponse = { code: 200, data: { user: mockUser, token: 'mock-token' } };

    globalThis.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => mockResponse
    } as any);

    const result = await authApi.login('demo');
    expect(result.data.user.provider).toBe('demo');
    expect(globalThis.fetch).toHaveBeenCalledWith(
      expect.stringContaining('/api/v1/auth/login'),
      expect.objectContaining({
        method: 'POST',
        body: JSON.stringify({ provider: 'demo' })
      })
    );
  });

  it('profileApi.getProfiles calls /api/v1/profiles', async () => {
    const mockProfiles = [{ id: 'prof_alex', name: 'Alex' }];
    globalThis.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ code: 200, data: mockProfiles })
    } as any);

    const result = await profileApi.getProfiles();
    expect(result.data).toHaveLength(1);
    expect(result.data[0].name).toBe('Alex');
  });

  it('actionApi.getSavedActions calls /api/v1/profiles/:profileId/actions', async () => {
    const mockActions = [{ id: 'act_01', title: '少喝手搖飲' }];
    globalThis.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ code: 200, data: mockActions })
    } as any);

    const result = await actionApi.getSavedActions('prof_alex');
    expect(result.data).toHaveLength(1);
    expect(result.data[0].title).toBe('少喝手搖飲');
  });
});
