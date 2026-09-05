import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { HeartPulse, Sparkles, ShieldCheck, ArrowRight } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import type { OAuthProvider } from '../types/auth';

export const Login: React.FC = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [loadingProvider, setLoadingProvider] = useState<OAuthProvider | null>(null);

  const handleOAuthLogin = async (provider: OAuthProvider, displayName?: string) => {
    setLoadingProvider(provider);
    try {
      await login(provider, displayName ? { name: displayName } : undefined);
      navigate('/');
    } catch (err) {
      console.error('Login failed:', err);
    } finally {
      setLoadingProvider(null);
    }
  };

  const handleDemoLogin = async () => {
    setLoadingProvider('demo');
    try {
      await login('demo');
      navigate('/');
    } catch (err) {
      console.error('Demo login failed:', err);
    } finally {
      setLoadingProvider(null);
    }
  };

  return (
    <div style={{
      height: '100%',
      width: '100%',
      overflowY: 'auto',
      display: 'flex',
      flexDirection: 'column',
      padding: '24px 16px',
      background: 'linear-gradient(180deg, #f0fdf4 0%, #ffffff 60%, #f9fafb 100%)',
      boxSizing: 'border-box'
    }}>
      <div style={{
        margin: 'auto',
        width: '100%',
        maxWidth: '420px',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center'
      }}>
        {/* Brand Header */}
        <div style={{ textAlign: 'center', marginBottom: '28px' }}>
          <div style={{
            display: 'inline-flex',
            position: 'relative',
            alignItems: 'center',
            justifyContent: 'center',
            width: '56px',
            height: '56px',
            borderRadius: '16px',
            background: 'linear-gradient(135deg, #137333 0%, #1e8e3e 100%)',
            boxShadow: '0 8px 20px rgba(19, 115, 51, 0.25)',
            marginBottom: '12px'
          }}>
            <HeartPulse size={28} color="white" strokeWidth={2.5} />
            <Sparkles size={14} style={{ position: 'absolute', top: '-4px', right: '-4px' }} fill="#ffd700" color="#ffd700" />
          </div>
          <h1 style={{
            fontSize: '24px',
            fontWeight: '800',
            color: '#137333',
            margin: '0 0 6px 0',
            letterSpacing: '-0.5px'
          }}>
            Healsight
          </h1>
          <p style={{
            fontSize: '13px',
            color: '#4b5563',
            margin: '0 0 4px 0',
            fontWeight: '600'
          }}>
            健檢報告翻譯官・健康趨勢管家
          </p>
          <p style={{
            fontSize: '11px',
            color: '#9ca3af',
            margin: 0
          }}>
            跨院數據彙整 • AI 白話解讀 • 個人化改善指南
          </p>
        </div>

        {/* Login Card */}
        <div className="card" style={{
          width: '100%',
          padding: '24px',
          boxSizing: 'border-box',
          boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.08), 0 8px 10px -6px rgba(0, 0, 0, 0.04)',
          borderRadius: '20px'
        }}>
          <div style={{ marginBottom: '20px', textAlign: 'center' }}>
            <h2 style={{ fontSize: '18px', fontWeight: '800', margin: '0 0 4px 0', color: '#111827' }}>
              歡迎使用 Healsight
            </h2>
            <p style={{ fontSize: '12px', color: '#6b7280', margin: 0 }}>
              支援多元快速登入，無縫同步健康紀錄
            </p>
          </div>

          {/* OAuth Buttons Grid */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '20px' }}>
            {/* Google */}
            <button
              type="button"
              onClick={() => handleOAuthLogin('google', 'Google 使用者')}
              disabled={loadingProvider !== null}
              style={{
                width: '100%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '12px',
                padding: '11px 16px',
                borderRadius: '12px',
                border: '1.5px solid #e5e7eb',
                background: '#ffffff',
                color: '#374151',
                fontSize: '14px',
                fontWeight: '600',
                cursor: 'pointer',
                transition: 'all 0.2s',
                boxShadow: '0 1px 2px rgba(0,0,0,0.04)'
              }}
            >
              <svg width="18" height="18" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.66-5.17 3.66-9.17z"/>
                <path fill="#34A853" d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.25v3.15C3.26 21.36 7.33 24 12 24z"/>
                <path fill="#FBBC05" d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.25C.45 8.16 0 9.97 0 12s.45 3.84 1.25 5.42l4.03-3.15z"/>
                <path fill="#EA4335" d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.33 0 3.26 2.64 1.25 6.58l4.03 3.15c.95-2.83 3.6-4.98 6.72-4.98z"/>
              </svg>
              <span>{loadingProvider === 'google' ? '登入中...' : '使用 Google 帳號登入'}</span>
            </button>

            {/* Apple */}
            <button
              type="button"
              onClick={() => handleOAuthLogin('apple', 'Apple 使用者')}
              disabled={loadingProvider !== null}
              style={{
                width: '100%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '12px',
                padding: '11px 16px',
                borderRadius: '12px',
                border: '1.5px solid #000000',
                background: '#000000',
                color: '#ffffff',
                fontSize: '14px',
                fontWeight: '600',
                cursor: 'pointer',
                transition: 'all 0.2s'
              }}
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="white">
                <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M15.97 6.37c.62-.77 1.05-1.84.93-2.92-.93.04-2.02.63-2.66 1.4-.56.65-.99 1.74-.86 2.8 1.04.08 2.03-.54 2.59-1.28"/>
              </svg>
              <span>{loadingProvider === 'apple' ? '登入中...' : '使用 Apple 帳號登入'}</span>
            </button>

            {/* LINE */}
            <button
              type="button"
              onClick={() => handleOAuthLogin('line', 'LINE 使用者')}
              disabled={loadingProvider !== null}
              style={{
                width: '100%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '12px',
                padding: '11px 16px',
                borderRadius: '12px',
                border: '1.5px solid #06C755',
                background: '#06C755',
                color: '#ffffff',
                fontSize: '14px',
                fontWeight: '600',
                cursor: 'pointer',
                transition: 'all 0.2s'
              }}
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="white">
                <path d="M24 10.304c0-5.369-5.383-9.738-12-9.738-6.616 0-12 4.369-12 9.738 0 4.814 4.269 8.846 10.038 9.608.391.084.922.258 1.057.592.122.303.079.778.039 1.085l-.171 1.027c-.053.303-.242 1.186 1.039.646 1.281-.54 6.911-4.069 9.428-6.967 1.739-1.907 2.57-3.841 2.57-5.993z"/>
              </svg>
              <span>{loadingProvider === 'line' ? '登入中...' : '使用 LINE 帳號登入'}</span>
            </button>

            {/* Facebook */}
            <button
              type="button"
              onClick={() => handleOAuthLogin('facebook', 'Facebook 使用者')}
              disabled={loadingProvider !== null}
              style={{
                width: '100%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '12px',
                padding: '11px 16px',
                borderRadius: '12px',
                border: '1.5px solid #1877F2',
                background: '#1877F2',
                color: '#ffffff',
                fontSize: '14px',
                fontWeight: '600',
                cursor: 'pointer',
                transition: 'all 0.2s'
              }}
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="white">
                <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
              </svg>
              <span>{loadingProvider === 'facebook' ? '登入中...' : '使用 Facebook 帳號登入'}</span>
            </button>
          </div>

          {/* Divider */}
          <div style={{
            position: 'relative',
            textAlign: 'center',
            margin: '20px 0',
            borderTop: '1px solid #e5e7eb'
          }}>
            <span style={{
              position: 'relative',
              top: '-10px',
              background: '#ffffff',
              padding: '0 12px',
              fontSize: '11px',
              fontWeight: '700',
              color: '#9ca3af'
            }}>
              或快速體驗
            </span>
          </div>

          {/* Demo Account Button */}
          <button
            type="button"
            onClick={handleDemoLogin}
            disabled={loadingProvider !== null}
            style={{
              width: '100%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
              padding: '14px 18px',
              borderRadius: '14px',
              border: 'none',
              background: 'linear-gradient(135deg, #137333 0%, #1e8e3e 100%)',
              color: '#ffffff',
              fontSize: '15px',
              fontWeight: '700',
              cursor: 'pointer',
              boxShadow: '0 4px 12px rgba(19, 115, 51, 0.3)',
              transition: 'all 0.2s'
            }}
          >
            <span>{loadingProvider === 'demo' ? '進入中...' : '使用展示帳號登入'}</span>
            <ArrowRight size={18} />
          </button>
          <div style={{ textAlign: 'center', marginTop: '8px' }}>
            <span style={{ fontSize: '11px', color: '#137333', fontWeight: '600' }}>
              ✓ 免註冊一鍵進入 • 體驗完整多成員健檢與 AI 分析
            </span>
          </div>
        </div>

        {/* Security & Privacy Note */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '6px',
          marginTop: '20px',
          color: '#6b7280',
          fontSize: '11px',
          textAlign: 'center'
        }}>
          <ShieldCheck size={14} color="#137333" />
          <span>醫療級資料傳輸加密規範 • 嚴格保障個人健檢隱私</span>
        </div>
      </div>
    </div>
  );
};

export default Login;
