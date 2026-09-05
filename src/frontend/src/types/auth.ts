export type OAuthProvider = 'demo' | 'google' | 'apple' | 'line' | 'facebook';

export interface AuthUser {
  id: string;
  name: string;
  email: string;
  provider: OAuthProvider;
  avatar?: string;
  token?: string;
}

export interface AuthContextType {
  user: AuthUser | null;
  isAuthenticated: boolean;
  login: (provider: OAuthProvider, customInfo?: Partial<AuthUser>) => Promise<void>;
  logout: () => Promise<void>;
}
