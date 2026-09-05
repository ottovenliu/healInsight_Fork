import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ChevronLeft, TrendingUp, AlertTriangle } from 'lucide-react';
import { useProfile } from '../context/ProfileContext';
import type { BiomarkerRecord, ReportItem } from '../types/profile';

const ReportDetail: React.FC = () => {
  const { reportId } = useParams();
  const navigate = useNavigate();
  const { profiles } = useProfile();
  const [report, setReport] = useState<ReportItem | null>(null);

  useEffect(() => {
    // Check local profile reports first
    const allLocalReports = profiles.flatMap(p => p.reports);
    const found = allLocalReports.find(r => r.report_id === reportId);
    if (found) {
      setReport(found);
      return;
    }

    // Fetch from backend fallback
    fetch(`/api/v1/reports/${reportId}`)
      .then(res => res.json())
      .then(res => {
        if (res?.data) setReport(res.data);
      })
      .catch(err => console.error('Error fetching report', err));
  }, [reportId, profiles]);

  if (!report) return <div className="page-content">載入中...</div>;

  const markersWithTrends = ['ALT', 'TG', 'UA', 'GLU_AC', 'HBA1C'];

  const getStatusWeight = (status: string) => {
    if (status === 'CRITICAL') return 2;
    if (status === 'WARNING') return 1;
    return 0;
  };

  const sortRecords = (a: BiomarkerRecord, b: BiomarkerRecord) => {
    // 1. Severity first
    const severityDiff = getStatusWeight(b.status_flag) - getStatusWeight(a.status_flag);
    if (severityDiff !== 0) return severityDiff;

    // 2. Trend availability second
    const aHasTrend = markersWithTrends.includes(a.biomarker_key);
    const bHasTrend = markersWithTrends.includes(b.biomarker_key);
    if (aHasTrend && !bHasTrend) return -1;
    if (!aHasTrend && bHasTrend) return 1;
    return 0;
  };

  const abnormalRecords = [...report.records]
    .filter(r => r.status_flag !== 'NORMAL')
    .sort(sortRecords);
    
  const normalRecords = [...report.records]
    .filter(r => r.status_flag === 'NORMAL')
    .sort(sortRecords);

  return (
    <div className="page-content" style={{ paddingBottom: '32px' }}>
      <header style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '24px' }}>
        <button onClick={() => navigate('/')} className="btn-back">
          <ChevronLeft size={24} />
        </button>
        <div style={{ display: 'flex', gap: '1em', alignItems: 'baseline' }}>
          <h2 style={{ fontSize: '18px', margin: 0 }}>報告詳情</h2>
          <p style={{ fontSize: '12px', color: 'var(--text-secondary)', margin: 0 }}>
            {report.checkup_date} | {report.institution_name}
          </p>
        </div>
      </header>

      <section style={{ marginBottom: '24px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
          <AlertTriangle size={20} color="var(--critical)" />
          <h3 style={{ fontSize: '16px', margin: 0 }}>待關注異常指標 ({abnormalRecords.length})</h3>
        </div>
        {abnormalRecords.map((record, idx) => (
          <div 
            key={idx} 
            className="card" 
            style={{ 
              borderColor: record.status_flag === 'CRITICAL' ? 'var(--critical)' : 'var(--warning)',
              background: record.status_flag === 'CRITICAL' ? '#fff8f7' : '#fffdf5',
              cursor: 'pointer'
            }}
            onClick={() => navigate(`/trends/${record.biomarker_key}`)}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
              <span style={{ fontWeight: 'bold' }}>{record.display_name}</span>
              <span className={`badge badge-${record.status_flag.toLowerCase()}`}>
                {record.status_flag === 'CRITICAL' ? '明顯異常' : '須留意'}
              </span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
              <div>
                <span style={{ fontSize: '24px', fontWeight: 'bold', color: record.status_flag === 'CRITICAL' ? 'var(--critical)' : 'var(--warning)' }}>
                  {record.numerical_value}
                </span>
                <span style={{ fontSize: '12px', color: 'var(--text-secondary)', marginLeft: '4px' }}>{record.unit}</span>
              </div>
              <div style={{ textAlign: 'right' }}>
                <p style={{ fontSize: '10px', color: 'var(--text-secondary)', margin: 0 }}>標準值</p>
                <p style={{ fontSize: '12px', fontWeight: '500', margin: 0 }}>{record.reference_range}</p>
              </div>
            </div>
            <div style={{ marginTop: '12px', display: 'flex', alignItems: 'center', gap: '4px', color: 'var(--primary)', fontSize: '12px', fontWeight: '500' }}>
              <TrendingUp size={14} />
              <span>查看趨勢與 AI 建議</span>
            </div>
          </div>
        ))}
      </section>

      <section>
        <h3 style={{ fontSize: '16px', marginBottom: '12px', color: 'var(--text-secondary)' }}>正常指標 ({normalRecords.length})</h3>
        <div className="card" style={{ padding: '0' }}>
          {normalRecords.map((record, idx) => (
            <div key={idx} style={{ 
              display: 'flex', 
              justifyContent: 'space-between', 
              padding: '12px 16px', 
              borderBottom: idx === normalRecords.length - 1 ? 'none' : '1px solid #eee' 
            }}>
              <span style={{ fontSize: '14px' }}>{record.display_name}</span>
              <div style={{ textAlign: 'right' }}>
                <span style={{ fontSize: '14px', fontWeight: 'bold' }}>{record.numerical_value}</span>
                <span style={{ fontSize: '11px', color: 'var(--text-secondary)', marginLeft: '4px' }}>{record.unit}</span>
              </div>
            </div>
          ))}
        </div>
      </section>

      <div style={{
        marginTop: '20px',
        marginBottom: '20px',
        padding: '12px 14px',
        background: '#f9fafb',
        border: '1px solid #e5e7eb',
        borderRadius: '12px',
        fontSize: '11px',
        color: '#6b7280',
        lineHeight: '1.5',
        textAlign: 'left'
      }}>
        <strong>醫療免責聲明：</strong>本報告所有數據指標與異常標籤係依衛福部參考區間輔助對照，僅供個人日常健康生活微調參考，絕不構成臨床醫療診斷。若檢驗數值持續異常或有生理不適，請務必諮詢合格專科醫師。
      </div>
    </div>
  );
};

export default ReportDetail;
