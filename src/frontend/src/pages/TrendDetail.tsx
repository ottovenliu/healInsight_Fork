import React, { useState, useEffect, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ChevronLeft, Sparkles, Bookmark, Check, TrendingUp } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceArea } from 'recharts';
import { useProfile } from '../context/ProfileContext';
import { commitActionItem, removeActionItem, isActionCommitted } from '../utils/actionStorage';

interface TrendPoint {
  date: string;
  value: number;
  status: string;
}

interface InsightData {
  definition?: string;
  plain_text_summary: string;
  risk_level_explanation: string;
  actionable_guidelines: { id: string; title: string; category: string; difficulty: string }[];
  disclaimer: string;
}

const TrendDetail: React.FC = () => {
  const { biomarkerKey } = useParams();
  const navigate = useNavigate();
  const { activeProfile } = useProfile();
  const [fallbackTrendData, setFallbackTrendData] = useState<TrendPoint[]>([]);
  const [insight, setInsight] = useState<InsightData | null>(null);
  const [committedMap, setCommittedMap] = useState<Record<string, boolean>>({});
  const [showNotification, setShowNotification] = useState(false);
  const [notificationMsg, setNotificationMsg] = useState('');

  const triggerToast = (msg: string) => {
    setNotificationMsg(msg);
    setShowNotification(true);
    setTimeout(() => setShowNotification(false), 3000);
  };

  // Extract current biomarker metadata (displayName, unit, reference_range) from active profile's reports
  const currentRecord = useMemo(() => {
    if (!activeProfile?.reports) return null;
    for (const report of activeProfile.reports) {
      const match = report.records.find(r => r.biomarker_key === biomarkerKey);
      if (match) return match;
    }
    return null;
  }, [activeProfile, biomarkerKey]);

  const displayName = currentRecord?.display_name || biomarkerKey || '';
  const unit = currentRecord?.unit || '';
  const referenceRange = currentRecord?.reference_range || '';

  // Parse reference range to determine healthy green zone for the chart
  const { refMin, refMax } = useMemo(() => {
    if (!referenceRange) return { refMin: 0, refMax: 40 };

    // Format: "70 ~ 99" or "4.0 ~ 5.6" or "3.4 - 7.2"
    const rangeMatch = referenceRange.match(/([\d.]+)\s*(?:~|-)\s*([\d.]+)/);
    if (rangeMatch) {
      return { refMin: parseFloat(rangeMatch[1]), refMax: parseFloat(rangeMatch[2]) };
    }

    // Format: "< 200" or "<= 40"
    const maxMatch = referenceRange.match(/<=\s*([\d.]+)|<\s*([\d.]+)/);
    if (maxMatch) {
      return { refMin: 0, refMax: parseFloat(maxMatch[1] || maxMatch[2]) };
    }

    // Format: "> 40" or ">= 90"
    const minMatch = referenceRange.match(/>=\s*([\d.]+)|\s*>\s*([\d.]+)/);
    if (minMatch) {
      return { refMin: parseFloat(minMatch[1] || minMatch[2]), refMax: undefined };
    }

    return { refMin: 0, refMax: 40 };
  }, [referenceRange]);

  // Dynamically derive trend points from activeProfile's reports
  const profileTrendData = useMemo(() => {
    if (!biomarkerKey || !activeProfile?.reports) return [];
    const profilePoints: TrendPoint[] = [];
    const sortedReports = [...activeProfile.reports].sort(
      (a, b) => new Date(a.checkup_date).getTime() - new Date(b.checkup_date).getTime()
    );

    sortedReports.forEach(report => {
      const rec = report.records.find(r => r.biomarker_key === biomarkerKey);
      if (rec) {
        profilePoints.push({
          date: report.checkup_date,
          value: rec.numerical_value,
          status: rec.status_flag
        });
      }
    });
    return profilePoints;
  }, [biomarkerKey, activeProfile]);

  // Fallback to backend API if activeProfile has no records for this marker
  useEffect(() => {
    if (!biomarkerKey || profileTrendData.length > 0) return;

    fetch(`/api/v1/biomarkers/trends?biomarker_key=${biomarkerKey}`)
      .then(res => res.json())
      .then(res => {
        if (res?.data?.trend_points) {
          setFallbackTrendData(res.data.trend_points);
        }
      })
      .catch(() => setFallbackTrendData([]));
  }, [biomarkerKey, profileTrendData.length]);

  const trendData = profileTrendData.length > 0 ? profileTrendData : fallbackTrendData;

  // Fetch AI Insight for this biomarker and sync committed micro-actions
  useEffect(() => {
    if (!biomarkerKey) return;

    fetch('/api/v1/insights/generate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ biomarker_key: biomarkerKey })
    })
      .then(res => res.json())
      .then(res => {
        setInsight(res.data);
        if (res.data?.actionable_guidelines) {
          const map: Record<string, boolean> = {};
          res.data.actionable_guidelines.forEach((g: any) => {
            map[g.id] = isActionCommitted(activeProfile.id, biomarkerKey, g.id);
          });
          setCommittedMap(map);
        }
      })
      .catch(err => console.error('Failed to generate insights', err));
  }, [biomarkerKey, activeProfile.id]);

  const toggleAction = (action: any) => {
    if (!biomarkerKey) return;
    const isCurrentlyCommitted = !!committedMap[action.id] || isActionCommitted(activeProfile.id, biomarkerKey, action.id);
    const categoryMap: any = { 'DIET': '飲食', 'LIFESTYLE': '生活', 'SLEEP': '睡眠', 'EXERCISE': '運動' };

    if (isCurrentlyCommitted) {
      removeActionItem(activeProfile.id, biomarkerKey, action.id);
      setCommittedMap(prev => ({ ...prev, [action.id]: false }));
      triggerToast('已從改善計畫中移除');
    } else {
      commitActionItem(activeProfile.id, biomarkerKey, {
        id: action.id,
        title: action.title,
        categoryLabel: categoryMap[action.category] || '健康',
        category: action.category,
        description: action.difficulty ? `難易度: ${action.difficulty}` : undefined
      });
      setCommittedMap(prev => ({ ...prev, [action.id]: true }));
      triggerToast('已加入改善計畫，將於行動頁面顯示');
    }
  };

  return (
    <div className="page-content" style={{ paddingBottom: '32px' }}>
      <header style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <button onClick={() => navigate(-1)} className="btn-back">
            <ChevronLeft size={24} />
          </button>
          <div>
            <h2 style={{ fontSize: '18px', margin: 0 }}>{displayName} 歷史趨勢</h2>
            <p style={{ color: 'var(--text-secondary)', fontSize: '12px', margin: '2px 0 0 0', textAlign: 'left' }}>
              【{activeProfile.name}】的長期追蹤
            </p>
          </div>
        </div>
      </header>

      <section className="card" style={{ height: '250px', padding: '16px 12px 8px 0' }}>
        {trendData.length === 0 ? (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', color: 'var(--text-secondary)', padding: '0 20px' }}>
            <TrendingUp size={36} style={{ opacity: 0.4, marginBottom: '8px' }} />
            <p style={{ fontSize: '13px', margin: 0 }}>尚無【{activeProfile.name}】在此指標的歷史數據</p>
          </div>
        ) : (
          <>
            <ResponsiveContainer width="100%" height="88%">
              <LineChart data={trendData} margin={{ top: 8, right: 16, left: -10, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#eee" />
                <XAxis 
                  dataKey="date" 
                  fontSize={10} 
                  tickFormatter={(str) => str.split('-')[0] || str} 
                  axisLine={false} 
                  tickLine={false} 
                />
                <YAxis fontSize={10} axisLine={false} tickLine={false} domain={['auto', 'auto']} />
                <Tooltip 
                  formatter={(val: any) => [`${val} ${unit}`, displayName]}
                  labelFormatter={(lbl: any) => `健檢日期：${lbl}`}
                />
                {refMax !== undefined && (
                  <ReferenceArea 
                    y1={refMin ?? 0} 
                    y2={refMax} 
                    fill="#e6f4ea" 
                    fillOpacity={0.6} 
                  />
                )}
                <Line 
                  type="monotone" 
                  dataKey="value" 
                  stroke="var(--primary)" 
                  strokeWidth={3} 
                  dot={{ r: 6, fill: 'var(--primary)', strokeWidth: 2, stroke: '#fff' }} 
                  activeDot={{ r: 8 }} 
                />
              </LineChart>
            </ResponsiveContainer>
            <p style={{ fontSize: '10px', color: 'var(--text-secondary)', textAlign: 'center', margin: '4px 0 0 0' }}>
              綠色區間為健康參考值 {referenceRange ? `(${referenceRange} ${unit})` : ''}
            </p>
          </>
        )}
      </section>

      {insight && (
        <section style={{ marginBottom: '24px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px', paddingTop: '16px', color: 'var(--primary)' }}>
            <Sparkles size={20} fill="var(--secondary)" />
            <h3 style={{ fontSize: '16px', margin: 0 }}>AI 白話說明（衛教參考）</h3>
          </div>
          <div className="card" style={{ border: 'none', background: 'var(--primary-light)', position: 'relative' }}>
            {insight.definition && (
              <div style={{ fontSize: '12px', color: '#137333', fontWeight: '700', marginBottom: '12px', paddingBottom: '12px', borderBottom: '1px solid rgba(19, 115, 51, 0.15)', textAlign: 'left' }}>
                💡 衛教指標說明：{insight.definition}
              </div>
            )}
            <p style={{ fontSize: '14px', lineHeight: '1.6', margin: 0, color: '#1b5e20', textAlign: 'left' }}>
              {insight.plain_text_summary}
            </p>
            <p style={{ fontSize: '12px', fontWeight: 'bold', marginTop: '12px', color: '#1b5e20', textAlign: 'left' }}>
              健康趨勢提醒：{insight.risk_level_explanation}
            </p>

            {/* Mandatory Medical Disclaimer Banner */}
            <div style={{ 
              marginTop: '16px', 
              borderTop: '1px solid rgba(19, 115, 51, 0.2)', 
              paddingTop: '10px',
              textAlign: 'left',
              fontSize: '11px',
              lineHeight: '1.5',
              color: '#4b5563',
              background: 'rgba(255, 255, 255, 0.6)',
              borderRadius: '10px',
              padding: '8px 12px'
            }}>
              <strong style={{ display: 'block', color: '#b45309', marginBottom: '2px' }}>
                ⚠️ 醫療免責聲明：
              </strong>
              {insight.disclaimer || '本內容係依據衛福部國民健康署衛教手冊生成之生活促進指引，僅供日常健康管理參考，絕不構成任何臨床醫療診斷、處方或治療依據。若指標異常或身體不適，請務必諮詢專業醫師。'}
            </div>
          </div>
        </section>
      )}

      {insight && insight.actionable_guidelines && insight.actionable_guidelines.length > 0 && (
        <section style={{ marginBottom: '24px' }}>
          <h3 style={{ fontSize: '16px', marginBottom: '16px' }}>明天就能開始的微行動</h3>
          {insight.actionable_guidelines.map((action) => {
            const isCommitted = !!committedMap[action.id];
            
            return (
              <div 
                key={action.id} 
                className="card" 
                style={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  gap: '12px', 
                  padding: '12px 16px', 
                  marginBottom: '8px', 
                  borderColor: isCommitted ? 'var(--primary)' : '#e0e0e0', 
                  background: isCommitted ? '#f1f8e9' : 'white', 
                  cursor: 'pointer' 
                }} 
                onClick={() => toggleAction(action)}
              >
                <div style={{ width: '24px', height: '24px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Bookmark 
                    size={20} 
                    color={isCommitted ? 'var(--primary)' : '#ccc'} 
                    fill={isCommitted ? 'var(--primary)' : 'transparent'} 
                    style={{ transition: 'all 0.2s' }} 
                  />
                </div>
                <div style={{ flex: 1 }}>
                  <p style={{ fontSize: '14px', fontWeight: '500', margin: 0 }}>{action.title}</p>
                </div>
              </div>
            );
          })}
        </section>
      )}

      {showNotification && (
        <div style={{ position: 'fixed', top: '24px', left: '50%', transform: 'translateX(-50%)', background: '#323232', color: 'white', padding: '12px 24px', borderRadius: '30px', display: 'flex', alignItems: 'center', gap: '8px', boxShadow: '0 4px 12px rgba(0,0,0,0.2)', zIndex: 1000 }}>
          <Check size={16} color="#4caf50" />
          <span style={{ fontSize: '14px' }}>{notificationMsg}</span>
        </div>
      )}
    </div>
  );
};

export default TrendDetail;
