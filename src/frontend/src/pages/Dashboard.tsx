import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronRight, Sparkles, Trophy, Camera, ShieldCheck } from 'lucide-react';
import { useProfile } from '../context/ProfileContext';
import type { BiomarkerRecord } from '../types/profile';
import { getProfileActions } from '../utils/actionStorage';

const Dashboard: React.FC = () => {
  const navigate = useNavigate();
  const { activeProfile } = useProfile();
  const [globalSummary, setGlobalSummary] = useState('');
  const [isExpanded, setIsExpanded] = useState(false);

  const hasReports = Boolean(activeProfile?.reports && activeProfile.reports.length > 0);
  const latestReport = hasReports ? activeProfile.reports[0] : null;

  // Actions partitioned by profile
  const actions = useMemo(() => getProfileActions(activeProfile.id), [activeProfile.id]);

  useEffect(() => {
    // If no reports uploaded for this profile, do not generate report-based summary
    if (!hasReports) return;

    // Fetch global insight
    fetch('/api/v1/insights/generate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ biomarker_key: 'GLOBAL' })
    })
      .then(res => res.json())
      .then(res => {
        if (res.data?.summary) {
          setGlobalSummary(res.data.summary);
        }
      })
      .catch(() => {
        setGlobalSummary("這次報告有指標需多加留意，建議先從日常生活習慣微調做起。");
      });
  }, [activeProfile.id, hasReports]);

  const completedCount = actions.filter(a => a.completed).length;
  const nextAction = actions.find(a => !a.completed);

  const coreMarkers = latestReport
    ? latestReport.records
        .filter((r: BiomarkerRecord) => r.status_flag !== 'NORMAL')
        .sort((a: BiomarkerRecord, b: BiomarkerRecord) => {
          const weight = (s: string) => s === 'CRITICAL' ? 2 : 1;
          return weight(b.status_flag) - weight(a.status_flag);
        })
    : [];

  // Personalized summary for the active profile
  const personalizedSummary = globalSummary
    ? `${activeProfile.name}，${globalSummary}`
    : `正在分析【${activeProfile.name}】的健康趨勢...`;

  return (
    <div className="page-content">
      {/* Integrated AI Coach Card (Insight + Progress) */}
      <div className="card" style={{ background: 'linear-gradient(135deg, #f0f9f4 0%, #e6f4ea 100%)', color: 'var(--primary)', border: '1px solid #d4edda', position: 'relative', overflow: 'hidden', padding: '0' }}>
        {/* Upper Part: AI Insight */}
        <div style={{ padding: '20px', position: 'relative', zIndex: 1 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
            <Sparkles size={18} color="var(--primary)" />
            <span style={{ fontSize: '14px', fontWeight: '700', opacity: 0.9 }}>AI 健康趨勢洞察</span>
          </div>

          {!hasReports ? (
            <div style={{ textAlign: 'left' }}>
              <p style={{ fontSize: '14px', fontWeight: '600', lineHeight: '1.6', margin: '0 0 14px 0', color: '#1b5e20' }}>
                目前尚未有【{activeProfile.name}】的檢驗紀錄，AI 無法分析健康趨勢。請先拍照或上傳健檢報告，我們將立即為您轉譯指標並生成專屬生活指引。
              </p>
              <button 
                className="btn-primary" 
                onClick={() => navigate('/upload')}
                style={{ 
                  display: 'inline-flex', 
                  alignItems: 'center', 
                  gap: '8px', 
                  padding: '8px 16px',
                  borderRadius: '20px',
                  fontWeight: 600,
                  fontSize: '13px'
                }}
              >
                <Camera size={16} />
                立即上傳檢驗紀錄
              </button>
            </div>
          ) : (
            <>
              <p className={isExpanded ? '' : 'line-clamp-4'} style={{ fontSize: '15px', fontWeight: '600', lineHeight: '1.5', margin: 0, textAlign: 'left', color: '#0d5a23' }}>
                {personalizedSummary}
              </p>

              {/* AI Educational Disclaimer */}
              <div style={{ fontSize: '11px', color: '#166534', opacity: 0.8, marginTop: '10px', textAlign: 'left', display: 'flex', alignItems: 'center', gap: '4px' }}>
                <ShieldCheck size={13} />
                <span style={{ lineHeight: '1.2' }}>免責聲明：本 AI 洞察依國健署衛教手冊生成，僅供生活型態調整參考，非醫療診斷。</span>
              </div>

              {personalizedSummary.length > 80 && (
                <button 
                  onClick={() => setIsExpanded(!isExpanded)}
                  style={{ background: 'rgba(19, 115, 51, 0.08)', border: 'none', color: 'var(--primary)', fontSize: '12px', fontWeight: '700', padding: '4px 12px', borderRadius: '20px', marginTop: '12px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px' }}
                >
                  {isExpanded ? '收起內容' : '閱讀更多'}
                  <ChevronRight size={14} style={{ transform: isExpanded ? 'rotate(-90deg)' : 'rotate(90deg)', transition: 'transform 0.3s' }} />
                </button>
              )}
            </>
          )}
        </div>

        {/* Lower Part: Action Progress */}
        <div 
          onClick={() => navigate('/actions')}
          style={{ 
            background: 'rgba(19, 115, 51, 0.05)', 
            padding: '16px 20px', 
            borderTop: '1px solid rgba(19, 115, 51, 0.1)',
            cursor: 'pointer',
            position: 'relative',
            zIndex: 1
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <Trophy size={20} color="var(--primary)" />
            <div style={{ flex: 1 }}>
              {hasReports ? (
                <>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '6px' }}>
                    <span style={{ fontSize: '12px', fontWeight: '700', opacity: 0.9 }}>改善行動達成率</span>
                    <span style={{ fontSize: '13px', fontWeight: '800' }}>{completedCount}/{actions.length}</span>
                  </div>
                  <div style={{ height: '4px', background: 'white', borderRadius: '2px', overflow: 'hidden' }}>
                    <div style={{ width: `${actions.length > 0 ? (completedCount/actions.length)*100 : 0}%`, height: '100%', background: 'var(--primary)', transition: 'width 0.5s' }}></div>
                  </div>
                  {nextAction && (
                    <div style={{ fontSize: '11px', opacity: 0.8, marginTop: '8px', fontWeight: '600', textAlign: 'left', color: 'var(--primary)' }}>
                      下一步：{nextAction.title}
                    </div>
                  )}
                </>
              ) : (
                <div style={{ textAlign: 'left' }}>
                  <span style={{ fontSize: '12px', fontWeight: '700', opacity: 0.9, display: 'block' }}>下一步該做什麼</span>
                  <span style={{ fontSize: '11px', color: '#166534', opacity: 0.85, marginTop: '2px', display: 'block' }}>
                    尚未建立檢驗紀錄。上傳報告後將為您開啟專屬日常改善微行動與追蹤指引。
                  </span>
                </div>
              )}
            </div>
            <ChevronRight size={16} style={{ color: 'var(--primary)', opacity: 0.4 }} />
          </div>
        </div>
        
        <Sparkles size={120} color="rgba(19, 115, 51, 0.03)" style={{ position: 'absolute', right: '-20px', top: '10px' }} />
      </div>

      {/* Core Markers */}
      {hasReports && latestReport ? (
        <section style={{ marginBottom: '32px', marginTop: '24px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <h3 style={{ margin: 0 }}>核心指標狀態</h3>
              <div style={{ display: 'flex', gap: '4px' }}>
                <span className="badge badge-critical" style={{ padding: '2px 8px', fontSize: '10px' }}>{latestReport.abnormal_count} 異常</span>
                <span className="badge badge-normal" style={{ padding: '2px 8px', fontSize: '10px' }}>{latestReport.total_biomarkers_found - latestReport.abnormal_count} 正常</span>
              </div>
            </div>
            <button onClick={() => navigate('/trends')} style={{ background: 'none', border: 'none', color: 'var(--primary)', fontWeight: '600', fontSize: '14px', cursor: 'pointer' }}>查看全部</button>
          </div>
          
          {coreMarkers.length > 0 ? (
            coreMarkers.map((item: BiomarkerRecord, idx: number) => (
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
                    backgroundColor: item.status_flag === 'CRITICAL' ? 'var(--critical)' : 'var(--warning)' 
                  }}></div>
                  <div>
                    <div style={{ fontWeight: '700', fontSize: '15px', textAlign: 'left' }}>{item.display_name}</div>
                    <div style={{ fontSize: '11px', color: item.status_flag === 'CRITICAL' ? 'var(--critical)' : 'var(--warning)', fontWeight: '600', marginTop: '2px', textAlign: 'left' }}>
                      {item.status_flag === 'CRITICAL' ? '明顯異常' : '須留意'}
                    </div>
                  </div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <div style={{ textAlign: 'right' }}>
                    <span style={{ fontWeight: '800', fontSize: '18px', color: item.status_flag === 'CRITICAL' ? 'var(--critical)' : 'var(--warning)' }}>{item.numerical_value}</span>
                    <span style={{ fontSize: '11px', color: 'var(--text-secondary)', marginLeft: '4px', fontWeight: '600' }}>{item.unit}</span>
                  </div>
                  <ChevronRight size={18} color="#ddd" />
                </div>
              </div>
            ))
          ) : (
            <div className="card" style={{ padding: '20px', textAlign: 'center', color: 'var(--primary)', background: 'var(--primary-light)' }}>
              🎉 太棒了！本次報告所有生理指標均在正常範圍內。
            </div>
          )}
        </section>
      ) : (
        <section style={{ marginBottom: '24px', marginTop: '24px' }}>
          <h3 style={{ marginBottom: '16px' }}>核心指標狀態</h3>
          <div className="card" style={{ textAlign: 'center', padding: '32px 20px', background: '#fcfcfc', border: '1px dashed #d0d7de' }}>
            <p style={{ color: 'var(--text-secondary)', fontSize: '13px', margin: 0 }}>
              尚未有檢驗紀錄，上傳報告後將在此突顯異常項目與重點追蹤指標。
            </p>
          </div>
        </section>
      )}

      {/* Upload New Report Action Button */}
      <section style={{ marginBottom: '24px' }}>
        <button 
          className="btn-outline" 
          onClick={() => navigate('/upload')}
          style={{ 
            width: '100%', 
            padding: '16px', 
            borderRadius: '18px', 
            background: '#fff',
            border: '1.5px solid var(--primary)',
            color: 'var(--primary)',
            boxShadow: '0 2px 8px rgba(19, 115, 51, 0.06)'
          }}
        >
          <Camera size={20} />
          <span style={{ fontSize: '15px', fontWeight: '700' }}>
            {hasReports ? '上傳新健檢報告' : '立即拍照或上傳健檢報告'}
          </span>
        </button>
      </section>
    </div>
  );
};

export default Dashboard;
