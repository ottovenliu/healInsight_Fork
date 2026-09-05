import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  User, Edit3, ShieldCheck, ChevronRight, Plus, Camera, 
  Check, X, Users, Calendar, AlertCircle
} from 'lucide-react';
import { useProfile } from '../context/ProfileContext';

const ProfilePage: React.FC = () => {
  const navigate = useNavigate();
  const { 
    profiles, 
    activeProfile, 
    setActiveProfileId, 
    updateActiveProfile, 
    addProfile 
  } = useProfile();

  const [isEditing, setIsEditing] = useState(false);
  const [editName, setEditName] = useState(activeProfile.name);
  const [editGender, setEditGender] = useState(activeProfile.gender);
  const [editAge, setEditAge] = useState(activeProfile.age);
  const [editRelationship, setEditRelationship] = useState(activeProfile.relationship);

  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [newName, setNewName] = useState('');
  const [newGender, setNewGender] = useState<'male' | 'female' | 'other'>('female');
  const [newAge, setNewAge] = useState(60);
  const [newRelationship, setNewRelationship] = useState('家人');

  const [toastMsg, setToastMsg] = useState('');
  const [showToast, setShowToast] = useState(false);

  const triggerToast = (msg: string) => {
    setToastMsg(msg);
    setShowToast(true);
    setTimeout(() => setShowToast(false), 3000);
  };

  const handleStartEdit = () => {
    setEditName(activeProfile.name);
    setEditGender(activeProfile.gender);
    setEditAge(activeProfile.age);
    setEditRelationship(activeProfile.relationship);
    setIsEditing(true);
  };

  const handleSaveEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editName.trim()) return;

    updateActiveProfile({
      name: editName.trim(),
      gender: editGender,
      age: Number(editAge),
      relationship: editRelationship.trim() || '本人'
    });
    setIsEditing(false);
    triggerToast('個人資料已更新並保存至本地');
  };

  const handleAddProfile = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName.trim()) return;

    addProfile({
      name: newName.trim(),
      gender: newGender,
      age: Number(newAge),
      relationship: newRelationship.trim() || '家人',
      avatarBg: newGender === 'female' ? '#d81b60' : '#1976d2'
    });
    setIsAddModalOpen(false);
    setNewName('');
    triggerToast(`已成功建立「${newName}」的獨立健康檔案`);
  };

  const genderLabels = {
    male: '男',
    female: '女',
    other: '其他'
  };

  return (
    <div className="page-content" style={{ paddingBottom: '60px' }}>
      <header style={{ marginBottom: '20px' }}>
        <h1 style={{ margin: 0 }}>個人檔案中心</h1>
        <p style={{ color: 'var(--text-secondary)', fontSize: '14px', margin: '4px 0 0 0' }}>
          個人健檢檔案與報告總管
        </p>
      </header>

      {/* Privacy Assurance Banner */}
      <div 
        className="card" 
        style={{ 
          background: 'linear-gradient(135deg, #f0fdf4 0%, #e6f4ea 100%)', 
          border: '1px solid #bbf7d0',
          padding: '14px 16px',
          marginBottom: '20px',
          display: 'flex',
          gap: '12px',
          alignItems: 'flex-start'
        }}
      >
        <ShieldCheck size={22} color="var(--primary)" style={{ flexShrink: 0, marginTop: '2px' }} />
        <div style={{ flex: 1, fontSize: '12px', lineHeight: '1.6', color: '#166534', textAlign: 'left' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '2px', flexWrap: 'wrap', gap: '4px' }}>
            <strong style={{ fontSize: '13px' }}>
              健康資料隱私保護・多成員獨立管理
            </strong>
          </div>
          為保障您的健康隱私，系統採用企業級傳輸加密與嚴格隱私防護規範，支援家庭多成員檔案獨立管理，確保醫療資訊安全。
        </div>
      </div>

      {/* 1. 個人資訊區域 (Personal Info Area) */}
      <section className="card" style={{ padding: '20px', marginBottom: '24px', position: 'relative' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <User size={18} color="var(--primary)" />
            <h3 style={{ margin: 0, fontSize: '16px' }}>個人基本資訊</h3>
          </div>
          {!isEditing && (
            <button 
              onClick={handleStartEdit}
              style={{
                background: 'rgba(19, 115, 51, 0.08)',
                border: 'none',
                color: 'var(--primary)',
                fontSize: '12px',
                fontWeight: '700',
                padding: '6px 12px',
                borderRadius: '20px',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '4px'
              }}
            >
              <Edit3 size={13} />
              編輯資訊
            </button>
          )}
        </div>

        {!isEditing ? (
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '16px' }}>
              <div 
                style={{ 
                  width: '56px', 
                  height: '56px', 
                  borderRadius: '18px', 
                  background: activeProfile.avatarBg || 'var(--primary)', 
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: 'center',
                  color: 'white',
                  fontWeight: '800',
                  fontSize: '22px',
                  boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
                }}
              >
                {activeProfile.name.slice(0, 1)}
              </div>
              <div style={{ flex: 1, textAlign: 'left' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <h2 style={{ margin: 0, fontSize: '20px' }}>{activeProfile.name}</h2>
                  <span 
                    style={{ 
                      background: 'var(--primary-light)', 
                      color: 'var(--primary)', 
                      fontSize: '11px', 
                      fontWeight: '700', 
                      padding: '2px 8px', 
                      borderRadius: '12px' 
                    }}
                  >
                    {activeProfile.relationship}
                  </span>
                </div>
                <div style={{ color: 'var(--text-secondary)', fontSize: '13px', marginTop: '4px' }}>
                  生理性別：{genderLabels[activeProfile.gender]} • 年齡：{activeProfile.age} 歲
                </div>
              </div>
            </div>

            <div style={{ 
              display: 'grid', 
              gridTemplateColumns: 'repeat(3, 1fr)', 
              gap: '8px', 
              background: '#f9fafb', 
              padding: '12px', 
              borderRadius: '14px',
              textAlign: 'center'
            }}>
              <div>
                <span style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>累計報告</span>
                <div style={{ fontSize: '16px', fontWeight: '800', color: 'var(--text-primary)', marginTop: '2px' }}>
                  {activeProfile.reports.length} 份
                </div>
              </div>
              <div>
                <span style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>最近健檢</span>
                <div style={{ fontSize: '13px', fontWeight: '700', color: 'var(--text-primary)', marginTop: '4px' }}>
                  {activeProfile.reports[0]?.checkup_date || '尚無紀錄'}
                </div>
              </div>
              <div>
                <span style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>異常指標</span>
                <div style={{ fontSize: '16px', fontWeight: '800', color: (activeProfile.reports[0]?.abnormal_count || 0) > 0 ? 'var(--critical)' : 'var(--primary)', marginTop: '2px' }}>
                  {activeProfile.reports[0]?.abnormal_count ?? 0} 項
                </div>
              </div>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSaveEdit} style={{ textAlign: 'left' }}>
            <div style={{ marginBottom: '12px' }}>
              <label style={{ fontSize: '12px', fontWeight: '700', color: 'var(--text-secondary)', display: 'block', marginBottom: '4px' }}>
                個人暱稱
              </label>
              <input 
                type="text" 
                value={editName}
                onChange={e => setEditName(e.target.value)}
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

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '12px' }}>
              <div>
                <label style={{ fontSize: '12px', fontWeight: '700', color: 'var(--text-secondary)', display: 'block', marginBottom: '4px' }}>
                  生理性別
                </label>
                <select 
                  value={editGender}
                  onChange={e => setEditGender(e.target.value as any)}
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
                  <option value="male">男性</option>
                  <option value="female">女性</option>
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
                  value={editAge}
                  onChange={e => setEditAge(Number(e.target.value))}
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

            <div style={{ marginBottom: '16px' }}>
              <label style={{ fontSize: '12px', fontWeight: '700', color: 'var(--text-secondary)', display: 'block', marginBottom: '4px' }}>
                身份 / 關係備註
              </label>
              <input 
                type="text" 
                value={editRelationship}
                placeholder="例如：本人、母親、父親、伴侶"
                onChange={e => setEditRelationship(e.target.value)}
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
                style={{ padding: '10px 16px', fontSize: '14px', flex: 1, borderRadius: '12px' }}
              >
                <Check size={16} />
                儲存變更
              </button>
              <button 
                type="button" 
                className="btn-outline" 
                onClick={() => setIsEditing(false)}
                style={{ padding: '10px 16px', fontSize: '14px', borderRadius: '12px' }}
              >
                取消
              </button>
            </div>
          </form>
        )}
      </section>

      {/* 2. 切換多個個人檔案 (Switch Profiles) */}
      <section style={{ marginBottom: '28px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Users size={18} color="var(--primary)" />
            <h3 style={{ margin: 0, fontSize: '16px' }}>切換個人檔案</h3>
          </div>
          <button 
            onClick={() => setIsAddModalOpen(true)}
            style={{
              background: 'none',
              border: 'none',
              color: 'var(--primary)',
              fontSize: '13px',
              fontWeight: '700',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '4px'
            }}
          >
            <Plus size={16} />
            新增檔案
          </button>
        </div>

        <div style={{ display: 'flex', gap: '10px', overflowX: 'auto', paddingBottom: '4px' }}>
          {profiles.map(p => {
            const isCurrent = p.id === activeProfile.id;
            return (
              <div 
                key={p.id}
                onClick={() => setActiveProfileId(p.id)}
                style={{
                  minWidth: '130px',
                  padding: '12px 14px',
                  borderRadius: '16px',
                  background: isCurrent ? '#f0f9f4' : 'white',
                  border: isCurrent ? '2px solid var(--primary)' : '1px solid #e5e7eb',
                  cursor: 'pointer',
                  textAlign: 'left',
                  transition: 'all 0.2s',
                  flexShrink: 0
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
                  <div 
                    style={{ 
                      width: '24px', 
                      height: '24px', 
                      borderRadius: '8px', 
                      background: p.avatarBg || 'var(--primary)', 
                      color: 'white', 
                      fontSize: '11px', 
                      fontWeight: '800', 
                      display: 'flex', 
                      alignItems: 'center', 
                      justifyContent: 'center' 
                    }}
                  >
                    {p.name.slice(0, 1)}
                  </div>
                  <div style={{ fontWeight: '700', fontSize: '14px', color: isCurrent ? 'var(--primary)' : 'var(--text-primary)' }}>
                    {p.name}
                  </div>
                </div>
                <div style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>
                  {p.relationship} • {p.age}歲
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* 3. 我的報告櫃 (Condensed Cabinet) */}
      <section style={{ marginBottom: '24px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Calendar size={18} color="var(--primary)" />
              <h3 style={{ margin: 0, fontSize: '16px' }}>我的報告櫃</h3>
              <span 
                style={{ 
                  background: 'var(--primary-light)', 
                  color: 'var(--primary)', 
                  fontSize: '11px', 
                  fontWeight: '800', 
                  padding: '2px 8px', 
                  borderRadius: '12px' 
                }}
              >
                {activeProfile.reports.length} 份
              </span>
            </div>
          </div>
        </div>

        {activeProfile.reports.length > 0 ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {activeProfile.reports.map((rep) => {
              const yearShort = rep.checkup_date.slice(2, 4);
              const yearFull = rep.checkup_date.slice(0, 4);
              const monthDay = rep.checkup_date.slice(5).replace('-', '.');

              return (
                <div 
                  key={rep.report_id}
                  className="card" 
                  style={{ 
                    padding: '12px 16px', 
                    display: 'flex',
                    alignItems: 'center',
                    gap: '12px',
                    background: '#fff', 
                    cursor: 'pointer',
                    marginBottom: 0,
                    border: '1px solid #f0f0f0',
                    transition: 'transform 0.15s, box-shadow 0.15s'
                  }}
                  onClick={() => navigate(`/reports/${rep.report_id}`)}
                >
                  <div style={{ 
                    fontSize: '18px', 
                    fontWeight: '900', 
                    color: '#9ca3af', 
                    width: '26px', 
                    textAlign: 'center',
                    letterSpacing: '-0.5px'
                  }}>
                    {yearShort}
                  </div>
                  <div style={{ flex: 1, textAlign: 'left' }}>
                    <div style={{ fontWeight: '700', fontSize: '14px', color: 'var(--text-primary)' }}>
                      {yearFull} 年度健檢報告
                    </div>
                    <div style={{ fontSize: '11px', color: 'var(--text-secondary)', marginTop: '2px' }}>
                      {rep.institution_name} • {monthDay}
                    </div>
                  </div>
                  <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
                    <div style={{ textAlign: 'right', display: 'flex', gap: '6px' }}>
                      {rep.abnormal_count > 0 ? (
                        <span style={{ 
                          background: 'var(--critical-light)', 
                          color: 'var(--critical)', 
                          fontSize: '11px', 
                          fontWeight: '800', 
                          padding: '3px 8px', 
                          borderRadius: '6px', 
                          whiteSpace: 'nowrap' 
                        }}>
                          {rep.abnormal_count} 異常
                        </span>
                      ) : (
                        <span style={{ 
                          background: 'var(--primary-light)', 
                          color: 'var(--primary)', 
                          fontSize: '11px', 
                          fontWeight: '800', 
                          padding: '3px 8px', 
                          borderRadius: '6px', 
                          whiteSpace: 'nowrap' 
                        }}>
                          全數正常
                        </span>
                      )}
                      <span style={{ 
                        background: '#f3f4f6', 
                        color: 'var(--text-secondary)', 
                        fontSize: '11px', 
                        fontWeight: '700', 
                        padding: '3px 8px', 
                        borderRadius: '6px', 
                        whiteSpace: 'nowrap' 
                      }}>
                        {rep.total_biomarkers_found - rep.abnormal_count} 正常
                      </span>
                    </div>
                    <ChevronRight size={16} color="#bbb" />
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div 
            className="card" 
            style={{ 
              padding: '32px 16px', 
              textAlign: 'center', 
              background: '#f9fafb',
              border: '1.5px dashed #d1d5db'
            }}
          >
            <AlertCircle size={32} color="var(--text-secondary)" style={{ opacity: 0.5, marginBottom: '8px' }} />
            <p style={{ margin: 0, fontWeight: '700', color: 'var(--text-primary)' }}>尚無健檢報告</p>
            <p style={{ margin: '4px 0 16px 0', fontSize: '12px', color: 'var(--text-secondary)' }}>
              上傳後將自動以高密度報告櫃分類存放
            </p>
          </div>
        )}

        <div style={{ marginTop: '16px' }}>
          <button 
            className="btn-outline" 
            onClick={() => navigate('/upload')}
            style={{ 
              width: '100%', 
              padding: '14px', 
              borderRadius: '16px', 
              background: '#fcfcfc',
              borderColor: 'var(--primary)',
              color: 'var(--primary)'
            }}
          >
            <Camera size={18} />
            <span>上傳新健檢報告</span>
          </button>
        </div>
      </section>

      {/* Add Profile Modal */}
      {isAddModalOpen && (
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
              <h3 style={{ margin: 0 }}>新增個人/家庭成員檔案</h3>
              <button 
                onClick={() => setIsAddModalOpen(false)}
                style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}
              >
                <X size={20} color="var(--text-secondary)" />
              </button>
            </div>

            <p style={{ fontSize: '12px', color: 'var(--text-secondary)', marginBottom: '16px' }}>
              所有檔案資料獨立維護，方便個別追蹤健康趨勢與歷史報告。
            </p>

            <form onSubmit={handleAddProfile}>
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
                  placeholder="例如：父親、女兒、長輩"
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
                  建立個人檔案
                </button>
                <button 
                  type="button" 
                  className="btn-outline" 
                  onClick={() => setIsAddModalOpen(false)}
                  style={{ padding: '12px', fontSize: '14px', borderRadius: '12px' }}
                >
                  取消
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Toast */}
      {showToast && (
        <div style={{ 
          position: 'fixed', 
          top: '24px', 
          left: '50%', 
          transform: 'translateX(-50%)', 
          background: '#323232', 
          color: 'white', 
          padding: '12px 24px', 
          borderRadius: '30px', 
          display: 'flex', 
          alignItems: 'center', 
          gap: '8px',
          boxShadow: '0 4px 12px rgba(0,0,0,0.2)',
          zIndex: 1000
        }}>
          <Check size={16} color="#4caf50" />
          <span style={{ fontSize: '14px' }}>{toastMsg}</span>
        </div>
      )}
    </div>
  );
};

export default ProfilePage;
