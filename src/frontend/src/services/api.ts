import type { AuthUser, OAuthProvider } from '../types/auth';
import type { Profile, ReportItem } from '../types/profile';

const API_BASE_URL = typeof window !== 'undefined' && window.location.port === '5173'
  ? 'http://localhost:3001/api/v1'
  : '/api/v1';

async function request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const url = `${API_BASE_URL}${endpoint}`;
  const headers = {
    'Content-Type': 'application/json',
    ...(options.headers || {})
  };

  const response = await fetch(url, { ...options, headers });
  if (!response.ok) {
    const errorBody = await response.text();
    throw new Error(`API error [${response.status}]: ${errorBody}`);
  }
  return response.json();
}

// ------------------------------------------------------------------
// Auth API
// ------------------------------------------------------------------
export const authApi = {
  async login(provider: OAuthProvider, customInfo?: Partial<AuthUser>): Promise<{ code: number; message: string; data: { user: AuthUser; token: string } }> {
    return request('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ provider, ...customInfo })
    });
  },

  async getMe(): Promise<{ code: number; data: { user: AuthUser } }> {
    return request('/auth/me');
  },

  async logout(): Promise<{ code: number; message: string }> {
    return request('/auth/logout', { method: 'POST' });
  }
};

// ------------------------------------------------------------------
// Profiles API
// ------------------------------------------------------------------
export const profileApi = {
  async getProfiles(): Promise<{ code: number; data: Profile[] }> {
    return request('/profiles');
  },

  async getProfile(id: string): Promise<{ code: number; data: Profile }> {
    return request(`/profiles/${id}`);
  },

  async createProfile(data: { name: string; gender: 'male' | 'female' | 'other'; age: number; relationship: string; avatarBg?: string }): Promise<{ code: number; data: Profile }> {
    return request('/profiles', {
      method: 'POST',
      body: JSON.stringify(data)
    });
  },

  async updateProfile(id: string, data: Partial<Profile>): Promise<{ code: number; data: Profile }> {
    return request(`/profiles/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data)
    });
  },

  async deleteProfile(id: string): Promise<{ code: number; message: string }> {
    return request(`/profiles/${id}`, { method: 'DELETE' });
  }
};

// ------------------------------------------------------------------
// Reports & Biomarkers API
// ------------------------------------------------------------------
export const reportApi = {
  async getProfileReports(profileId: string): Promise<{ code: number; data: ReportItem[] }> {
    return request(`/profiles/${profileId}/reports`);
  },

  async addProfileReport(profileId: string, report: ReportItem): Promise<{ code: number; data: ReportItem }> {
    return request(`/profiles/${profileId}/reports`, {
      method: 'POST',
      body: JSON.stringify(report)
    });
  },

  async getReportById(reportId: string): Promise<{ code: number; data: ReportItem }> {
    return request(`/reports/${reportId}`);
  },

  async uploadReport(formData?: FormData): Promise<{ code: number; message: string; data: ReportItem }> {
    return request('/reports/upload', {
      method: 'POST',
      body: formData ? JSON.stringify({}) : JSON.stringify({})
    });
  },

  async getBiomarkerTrends(biomarkerKey: string, profileId?: string): Promise<{ code: number; data: any }> {
    const query = profileId ? `?biomarker_key=${biomarkerKey}&profile_id=${profileId}` : `?biomarker_key=${biomarkerKey}`;
    return request(`/biomarkers/trends${query}`);
  },

  async generateInsight(biomarkerKey: string): Promise<{ code: number; data: any }> {
    return request('/insights/generate', {
      method: 'POST',
      body: JSON.stringify({ biomarker_key: biomarkerKey })
    });
  }
};

// ------------------------------------------------------------------
// Micro-Actions API (Stored in Server DB)
// ------------------------------------------------------------------
export interface SavedActionItem {
  id: string;
  profileId: string;
  biomarkerKey: string;
  title: string;
  categoryLabel: string;
  category?: string;
  description?: string;
}

export const actionApi = {
  async getSavedActions(profileId: string): Promise<{ code: number; data: SavedActionItem[] }> {
    return request(`/profiles/${profileId}/actions`);
  },

  async saveAction(profileId: string, action: Partial<SavedActionItem>): Promise<{ code: number; data: SavedActionItem }> {
    return request(`/profiles/${profileId}/actions`, {
      method: 'POST',
      body: JSON.stringify(action)
    });
  },

  async deleteAction(profileId: string, actionId: string): Promise<{ code: number; message: string }> {
    return request(`/profiles/${profileId}/actions/${actionId}`, {
      method: 'DELETE'
    });
  }
};
