import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronDown, Check, UserPlus, X, LogOut, UserCheck } from 'lucide-react';
import { useProfile } from '../context/ProfileContext';
import { useAuth } from '../context/AuthContext';

export const ProfileDropdown: React.FC = () => {
  const { profiles, activeProfile, setActiveProfileId, addProfile } = useProfile();
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const [isOpen, setIsOpen] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  const [newName, setNewName] = useState('');
  const [newGender, setNewGender] = useState<'male' | 'female' | 'other'>('female');
  const [newAge, setNewAge] = useState(60);
  const [newRelationship, setNewRelationship] = useState('家人');

  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSelect = (id: string) => {
    setActiveProfileId(id);
    setIsOpen(false);
  };

  const handleLogout = async () => {
    setIsOpen(false);
    await logout();
    navigate('/login');
  };

  const handleAddSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName.trim()) return;

    addProfile({
      name: newName.trim(),
      gender: newGender,
      age: Number(newAge),
      relationship: newRelationship.trim() || '家人',
      avatarBg: newGender === 'female' ? '#d81b60' : '#1976d2'
    });

    setIsModalOpen(false);
    setIsOpen(false);
    setNewName('');
  };

  const getProviderBadge = (provider?: string) => {
    switch (provider) {
      case 'google':
        return { label: 'Google', color: '#4285F4' };
      case 'apple':
        return { label: 'Apple', color: '#000000' };
      case 'line':
        return { label: 'LINE', color: '#06C755' };
      case 'facebook':
        return { label: 'Facebook', color: '#1877F2' };
      default:
        return { label: '展示帳號', color: '#137333' };
    }
  };

  const providerBadge = getProviderBadge(user?.provider);

  return (
    <div ref={dropdownRef} style={{ position: 'relative' }}>
      <button 
        onClick={() => setIsOpen(!isOpen)}
        style={{
          background: 'rgba(255, 255, 255, 0.18)',
          border: '1px solid rgba(255, 255, 255, 0.3)',
          borderRadius: '20px',
          padding: '4px 10px 4px 6px',
          color: 'white',
          display: 'flex',
          alignItems: 'center',
          gap: '6px',
          cursor: 'pointer',
          fontSize: '13px',
          fontWeight: '700',
          transition: 'all 0.2s'
        }}
      >
        <div 
          style={{
            width: '24px',
            height: '24px',
            borderRadius: '50%',
            background: activeProfile.avatarBg || 'white',
            color: 'white',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '11px',
            fontWeight: '800',
            border: '1.5px solid white'
          }}
        >
          {activeProfile.name.slice(0, 1)}
        </div>
        <span>{activeProfile.name}</span>
        <ChevronDown size={14} style={{ transform: isOpen ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s' }} />
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <div 
          style={{
            position: 'absolute',
            top: 'calc(100% + 8px)',
            right: 0,
            width: '260px',
            background: 'white',
            borderRadius: '16px',
            boxShadow: '0 10px 30px rgba(0,0,0,0.15)',
            border: '1px solid #eee',
            padding: '10px',
            zIndex: 200,
            textAlign: 'left'
          }}
        >
          {/* Profiles Section Header */}
          <div style={{ 
            padding: '4px 8px 6px 8px', 
            fontSize: '11px', 
            fontWeight: '700', 
            color: 'var(--text-secondary)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between'
          }}>
            <span>健康個人檔案列表</span>
            <span style={{ fontSize: '10px', color: '#9ca3af' }}>
              {profiles.length} 個成員
            </span>
          </div>

          {/* Profile List */}
          <div style={{ maxHeight: '180px', overflowY: 'auto', padding: '2px 0' }}>
            {profiles.map(p => {
              const isSelected = p.id === activeProfile.id;
              return (
                <div 
                  key={p.id}
                  onClick={() => handleSelect(p.id)}
                  style={{
                    padding: '8px 10px',
                    borderRadius: '10px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    cursor: 'pointer',
                    background: isSelected ? 'var(--primary-light)' : 'transparent',
                    marginBottom: '2px',
                    transition: 'background 0.15s'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <div 
                      style={{
                        width: '26px',
                        height: '26px',
                        borderRadius: '8px',
                        background: p.avatarBg || 'var(--primary)',
                        color: 'white',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '11px',
                        fontWeight: '800'
                      }}
                    >
                      {p.name.slice(0, 1)}
                    </div>
                    <div>
                      <div style={{ fontSize: '13px', fontWeight: isSelected ? '800' : '600', color: isSelected ? 'var(--primary)' : 'var(--text-primary)' }}>
                        {p.name}
                      </div>
                      <div style={{ fontSize: '10px', color: 'var(--text-secondary)' }}>
                        {p.relationship} • {p.age}歲
                      </div>
                    </div>
                  </div>
                  {isSelected && <Check size={16} color="var(--primary)" strokeWidth={3} />}
                </div>
              );
            })}
          </div>

          {/* Add Profile Button */}
          <div style={{ borderTop: '1px solid #f3f4f6', paddingTop: '6px', marginTop: '6px' }}>
            <button 
              onClick={() => { setIsOpen(false); setIsModalOpen(true); }}
              style={{
                width: '100%',
                background: 'none',
                border: 'none',
                padding: '8px 10px',
                borderRadius: '8px',
                color: 'var(--primary)',
                fontSize: '12px',
                fontWeight: '700',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                cursor: 'pointer'
              }}
            >
              <UserPlus size={14} />
              <span>新增個人/家庭成員檔案</span>
            </button>
          </div>

          {/* Visual Divider between Member Management and Account Section */}
          <div style={{
            height: '1px',
            backgroundColor: '#f3f4f6',
            margin: '4px 4px 6px 4px'
          }} />

          {/* Logged In User Info (Subtle & Compact) */}
          <div style={{
            padding: '2px 8px 4px 8px'
          }}>
            <div style={{ fontSize: '9px', fontWeight: '600', color: '#9ca3af', marginBottom: '4px', letterSpacing: '0.3px' }}>
              已登入帳號
            </div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '6px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', minWidth: 0 }}>
                <div style={{
                  width: '22px',
                  height: '22px',
                  borderRadius: '50%',
                  background: '#f3f4f6',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '11px',
                  color: '#6b7280',
                  flexShrink: 0
                }}>
                  {user?.avatar || <UserCheck size={12} color="#6b7280" />}
                </div>
                <div style={{ minWidth: 0 }}>
                  <div style={{ fontSize: '11px', fontWeight: '600', color: '#4b5563', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', lineHeight: '1.2' }}>
                    {user?.name || '展示使用者'}
                  </div>
                  <div style={{ fontSize: '10px', color: '#9ca3af', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', lineHeight: '1.2' }}>
                    {user?.email || 'demo@healsight.health'}
                  </div>
                </div>
              </div>
              <span style={{
                fontSize: '9px',
                fontWeight: '600',
                padding: '1px 5px',
                borderRadius: '4px',
                background: '#f3f4f6',
                color: '#6b7280',
                whiteSpace: 'nowrap',
                flexShrink: 0
              }}>
                {providerBadge.label}
              </span>
            </div>
          </div>

          {/* Logout Button */}
          <div style={{ borderTop: '1px solid #f3f4f6', paddingTop: '4px', marginTop: '4px' }}>
            <button 
              onClick={handleLogout}
              style={{
                width: '100%',
                background: 'none',
                border: 'none',
                padding: '8px 10px',
                borderRadius: '8px',
                color: '#dc2626',
                fontSize: '12px',
                fontWeight: '700',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                cursor: 'pointer'
              }}
            >
              <LogOut size={14} />
              <span>登出帳號</span>
            </button>
          </div>
        </div>
      )}

      {/* Add Profile Modal */}
      {isModalOpen && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(0,0,0,0.5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000,
          padding: '20px'
        }}>
          <div className="card" style={{ width: '100%', maxWidth: '380px', margin: 0, textAlign: 'left', padding: '24px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <h3 style={{ margin: 0 }}>新增個人檔案</h3>
              <button 
                onClick={() => setIsModalOpen(false)}
                style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}
              >
                <X size={20} color="var(--text-secondary)" />
              </button>
            </div>

            <p style={{ fontSize: '12px', color: 'var(--text-secondary)', marginBottom: '16px' }}>
              多成員健康紀錄獨立管理，方便隨時個別追蹤健康趨勢。
            </p>

            <form onSubmit={handleAddSubmit}>
              <div style={{ marginBottom: '12px' }}>
                <label style={{ fontSize: '12px', fontWeight: '700', color: 'var(--text-secondary)', display: 'block', marginBottom: '4px' }}>
                  姓名或暱稱
                </label>
                <input 
                  type="text" 
                  required
                  placeholder="例如：爸爸、小美"
                  value={newName}
                  onChange={e => setNewName(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '10px 12px',
                    borderRadius: '10px',
                    border: '1.5px solid #d1d5db',
                    fontSize: '14px',
                    background: '#ffffff',
                    color: 'var(--text-primary)',
                    boxSizing: 'border-box'
                  }}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '12px' }}>
                <div>
                  <label style={{ fontSize: '12px', fontWeight: '700', color: 'var(--text-secondary)', display: 'block', marginBottom: '4px' }}>
                    生理性別
                  </label>
                  <select 
                    value={newGender}
                    onChange={e => setNewGender(e.target.value as any)}
                    style={{
                      width: '100%',
                      padding: '10px 12px',
                      borderRadius: '10px',
                      border: '1.5px solid #d1d5db',
                      fontSize: '14px',
                      background: '#ffffff',
                      color: 'var(--text-primary)',
                      boxSizing: 'border-box'
                    }}
                  >
                    <option value="female">女性</option>
                    <option value="male">男性</option>
                    <option value="other">其他</option>
                  </select>
                </div>

                <div>
                  <label style={{ fontSize: '12px', fontWeight: '700', color: 'var(--text-secondary)', display: 'block', marginBottom: '4px' }}>
                    年齡 (歲)
                  </label>
                  <input 
                    type="number" 
                    min={1} 
                    max={120}
                    value={newAge}
                    onChange={e => setNewAge(Number(e.target.value))}
                    required
                    style={{
                      width: '100%',
                      padding: '10px 12px',
                      borderRadius: '10px',
                      border: '1.5px solid #d1d5db',
                      fontSize: '14px',
                      background: '#ffffff',
                      color: 'var(--text-primary)',
                      boxSizing: 'border-box'
                    }}
                  />
                </div>
              </div>

              <div style={{ marginBottom: '20px' }}>
                <label style={{ fontSize: '12px', fontWeight: '700', color: 'var(--text-secondary)', display: 'block', marginBottom: '4px' }}>
                  關係
                </label>
                <input 
                  type="text" 
                  value={newRelationship}
                  placeholder="例如：父親、伴侶、家人"
                  onChange={e => setNewRelationship(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '10px 12px',
                    borderRadius: '10px',
                    border: '1.5px solid #d1d5db',
                    fontSize: '14px',
                    background: '#ffffff',
                    color: 'var(--text-primary)',
                    boxSizing: 'border-box'
                  }}
                />
              </div>

              <div style={{ display: 'flex', gap: '8px' }}>
                <button 
                  type="submit" 
                  className="btn-primary" 
                  style={{ padding: '12px', fontSize: '14px', flex: 1, borderRadius: '12px' }}
                >
                  確認建立
                </button>
                <button 
                  type="button" 
                  className="btn-outline" 
                  onClick={() => setIsModalOpen(false)}
                  style={{ padding: '12px', fontSize: '14px', borderRadius: '12px' }}
                >
                  取消
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
