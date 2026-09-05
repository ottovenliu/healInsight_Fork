import React, { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronRight, TrendingUp, Camera } from 'lucide-react';
import { useProfile } from '../context/ProfileContext';
import type { BiomarkerRecord } from '../types/profile';

interface BiomarkerTrendItem extends BiomarkerRecord {
  historyCount: number;
  latestDate: string;
}

const Trends: React.FC = () => {
  const navigate = useNavigate();
  const { activeProfile } = useProfile();

  // Compute unique biomarkers for the active profile across all reports,
  // taking the most recent report's value as the current status
  const sortedBiomarkers = useMemo(() => {
    if (!activeProfile?.reports || activeProfile.reports.length === 0) {
      return [];
    }

    // Sort reports chronological descending (latest first)
    const sortedReports = [...activeProfile.reports].sort(
      (a, b) => new Date(b.checkup_date).getTime() - new Date(a.checkup_date).getTime()
    );

    const map = new Map<string, BiomarkerTrendItem>();

    sortedReports.forEach(report => {
      report.records.forEach(rec => {
        const existing = map.get(rec.biomarker_key);
        if (!existing) {
          map.set(rec.biomarker_key, {
            ...rec,
            historyCount: 1,
            latestDate: report.checkup_date
          });
        } else {
          existing.historyCount += 1;
        }
      });
    });

    const list = Array.from(map.values());

    // Sort by severity: CRITICAL first, then WARNING, then NORMAL
    const getWeight = (s: string) => {
      if (s === 'CRITICAL') return 2;
      if (s === 'WARNING') return 1;
      return 0;
    };

    return list.sort((a, b) => getWeight(b.status_flag) - getWeight(a.status_flag));
  }, [activeProfile]);

  return (
    <div className="page-content">
      <header style={{ marginBottom: '24px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div>
            <h1 style={{ margin: 0 }}>指標趨勢</h1>
            <p style={{ color: 'var(--text-secondary)', fontSize: '14px', marginTop: '4px' }}>
              追蹤【{activeProfile.name}】的健康長期變化
            </p>
          </div>
          {sortedBiomarkers.length > 0 && (
            <span style={{ 
              fontSize: '12px', 
              color: 'var(--primary)', 
              backgroundColor: 'rgba(19, 115, 51, 0.08)',
              padding: '4px 10px',
              borderRadius: '20px',
              fontWeight: 600
            }}>
              共 {sortedBiomarkers.length} 項指標
            </span>
          )}
        </div>
      </header>

      {sortedBiomarkers.length === 0 ? (
        <div 
          className="card" 
          style={{ 
            textAlign: 'center', 
            padding: '48px 24px', 
            background: '#fcfcfc', 
            border: '1px dashed #d0d7de' 
          }}
        >
          <TrendingUp size={48} color="var(--primary)" style={{ opacity: 0.6, marginBottom: '16px' }} />
          <h3 style={{ margin: '0 0 8px 0', fontSize: '16px', color: 'var(--text-primary)' }}>
            【{activeProfile.name}】尚未有健檢報告紀錄
          </h3>
          <p style={{ color: 'var(--text-secondary)', fontSize: '13px', maxWidth: '320px', margin: '0 auto 20px', lineHeight: 1.6 }}>
            上傳或拍照健檢報告後，系統將自動提取檢驗數值，在此建立長期趨勢分析與衛教微行動。
          </p>
          <button 
            className="btn-primary" 
            onClick={() => navigate('/upload')}
            style={{ 
              display: 'inline-flex', 
              alignItems: 'center', 
              gap: '8px', 
              padding: '10px 20px',
              borderRadius: '24px',
              fontWeight: 600,
              fontSize: '14px'
            }}
          >
            <Camera size={18} />
            立即拍照或上傳報告
          </button>
        </div>
      ) : (
        <section>
          {sortedBiomarkers.map((item, idx) => (
            <div 
              key={idx} 
              className="card" 
              style={{ 
                display: 'flex', 
                justifyContent: 'space-between', 
                alignItems: 'center', 
                padding: '16px 20px', 
                marginBottom: '12px',
                cursor: 'pointer' 
              }}
              onClick={() => navigate(`/trends/${item.biomarker_key}`)}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                <div style={{ 
                  width: '10px', 
                  height: '10px', 
                  borderRadius: '50%', 
                  backgroundColor: item.status_flag === 'CRITICAL' ? 'var(--critical)' : (item.status_flag === 'WARNING' ? 'var(--warning)' : 'var(--primary)')
                }}></div>
                <div>
                  <div style={{ fontWeight: '700', fontSize: '15px', textAlign: 'left' }}>{item.display_name}</div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '4px', color: 'var(--text-secondary)', fontSize: '11px', marginTop: '2px', textAlign: 'left' }}>
                    <TrendingUp size={12} color={item.status_flag !== 'NORMAL' ? 'var(--critical)' : 'var(--primary)'} />
                    <span>{item.historyCount > 1 ? `${item.historyCount} 年數據追蹤中` : '1 次檢測紀錄'}</span>
                  </div>
                </div>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div style={{ textAlign: 'right' }}>
                  <span style={{ fontWeight: '800', fontSize: '18px', color: item.status_flag === 'CRITICAL' ? 'var(--critical)' : (item.status_flag === 'WARNING' ? 'var(--warning)' : 'var(--text-primary)') }}>{item.numerical_value}</span>
                  <span style={{ fontSize: '11px', color: 'var(--text-secondary)', marginLeft: '4px', fontWeight: '600' }}>{item.unit}</span>
                </div>
                <ChevronRight size={18} color="#ddd" />
              </div>
            </div>
          ))}
        </section>
      )}
    </div>
  );
};

export default Trends;
