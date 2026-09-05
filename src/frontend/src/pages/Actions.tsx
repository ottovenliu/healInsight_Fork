import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  ClipboardList, CheckCircle2, Circle, Trophy, 
  Stethoscope, Calendar, ChevronRight, Check, Camera
} from 'lucide-react';
import { useProfile } from '../context/ProfileContext';
import { getProfileActions, toggleActionCompleted, type ActionItem } from '../utils/actionStorage';

const Actions: React.FC = () => {
  const navigate = useNavigate();
  const { activeProfile } = useProfile();
  const [showToast, setShowNotification] = useState(false);
  const [toastMsg, setToastMsg] = useState('');
  const [actions, setActions] = useState<ActionItem[]>([]);

  const hasReports = Boolean(activeProfile?.reports && activeProfile.reports.length > 0);
  const latestReport = hasReports ? activeProfile.reports[0] : null;

  useEffect(() => {
    // Load actions partitioned by profile from localStorage
    const profileActions = getProfileActions(activeProfile.id);
    setActions(profileActions);
  }, [activeProfile.id]);

  const triggerToast = (msg: string) => {
    setToastMsg(msg);
    setShowNotification(true);
    setTimeout(() => setShowNotification(false), 3000);
  };

  // Derive medical advices dynamically from latestReport's abnormal records
  const medicalAdvices = useMemo(() => {
    if (!latestReport) return [];

    const advices: { id: string; marker: string; time: string; dept: string; advice: string }[] = [];
    const abnormalKeys = new Set(
      latestReport.records
        .filter(r => r.status_flag !== 'NORMAL')
        .map(r => r.biomarker_key)
    );

    if (abnormalKeys.has('ALT') || abnormalKeys.has('AST')) {
      advices.push({
        id: 'med_alt',
        marker: '肝功能 (ALT/AST)',
        time: '3 個月後追蹤',
        dept: '肝膽腸胃科',
        advice: '建議攜帶歷年健檢報告供醫師對比長期數值趨勢。'
      });
    }

    if (abnormalKeys.has('CHOL') || abnormalKeys.has('LDL') || abnormalKeys.has('TG')) {
      advices.push({
        id: 'med_chol',
        marker: '血脂代謝 (總膽固醇/三酸甘油酯)',
        time: '6~12 個月後追蹤',
        dept: '心臟內科/新陳代謝科',
        advice: '請持續調整飲食型態與適度運動，複檢前一週維持清淡飲食。'
      });
    }

    if (abnormalKeys.has('GLU_AC') || abnormalKeys.has('HBA1C')) {
      advices.push({
        id: 'med_glu',
        marker: '血糖代謝 (飯前血糖/糖化血色素)',
        time: '3~6 個月後追蹤',
        dept: '新陳代謝科',
        advice: '建議定期測量血糖並監測醣類攝取，諮詢醫師評估後續檢驗。'
      });
    }

    if (abnormalKeys.has('UA')) {
      advices.push({
        id: 'med_ua',
        marker: '尿酸 (UA)',
        time: '6 個月後追蹤',
        dept: '風濕免疫科/家醫科',
        advice: '每日補充足量水分，減少高普林飲食與酒精攝取。'
      });
    }

    return advices;
  }, [latestReport]);

  const freeScreenings = [
    { title: '成人預防保健', criteria: '40–64 歲每 3 年一次', benefit: '含血糖、血脂、腎功能', eligible: activeProfile.age >= 40 && activeProfile.age <= 64 },
    { title: '大腸癌篩檢', criteria: '50–74 歲每 2 年一次', benefit: '糞便潛血檢查', eligible: activeProfile.age >= 50 && activeProfile.age <= 74 },
    { title: 'B、C 型肝炎篩檢', criteria: '45–79 歲終身一次', benefit: '免費抽血篩檢', eligible: activeProfile.age >= 45 && activeProfile.age <= 79 },
  ];

  const toggleAction = (action: ActionItem) => {
    const newCompleted = toggleActionCompleted(activeProfile.id, action.biomarkerKey, action.id);
    const updated = actions.map(a => 
      (a.id === action.id && a.biomarkerKey === action.biomarkerKey) 
        ? { ...a, completed: newCompleted } 
        : a
    );
    setActions(updated);
    if (newCompleted) {
      triggerToast('已更新進度，離目標更近一步了！');
    }
  };

  const checkupDate = latestReport?.checkup_date || '2025-03-15';
  const nextCheckupDate = useMemo(() => {
    try {
      const d = new Date(checkupDate);
      d.setFullYear(d.getFullYear() + 1);
      return d.toISOString().split('T')[0];
    } catch {
      return '2026-03-15';
    }
  }, [checkupDate]);

  const handleAddToCalendar = () => {
    const title = `${activeProfile.name} - Healsight 年度健檢預約排程`;
    const description = `上次健檢日期：${checkupDate}。\\n建議安排次年度定期健檢，追蹤各項重要生理指標。`;
    const startDate = `${nextCheckupDate.replace(/-/g, '')}T090000`;
    const endDate = `${nextCheckupDate.replace(/-/g, '')}T100000`;
    const icsContent = [
      'BEGIN:VCALENDAR',
      'VERSION:2.0',
      'PRODID:-//Healsight//Health Checkup Reminder//ZH-TW',
      'BEGIN:VEVENT',
      `SUMMARY:${title}`,
      `DESCRIPTION:${description}`,
      `DTSTART:${startDate}`,
      `DTEND:${endDate}`,
      'STATUS:CONFIRMED',
      'END:VEVENT',
      'END:VCALENDAR'
    ].join('\r\n');

    const blob = new Blob([icsContent], { type: 'text/calendar;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `healsight_checkup_${activeProfile.id}.ics`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    triggerToast('已下載健檢行事曆事件 (.ics)，可加入個人行事曆！');
  };

  const completedCount = actions.filter(a => a.completed).length;

  return (
    <div className="page-content" style={{ paddingBottom: '40px' }}>
      <header style={{ marginBottom: '24px' }}>
        <h1 style={{ margin: 0 }}>下一步該做什麼</h1>
        <p style={{ color: 'var(--text-secondary)', fontSize: '14px', marginTop: '4px' }}>
          {hasReports ? '為您整理的專屬行動指南' : `【${activeProfile.name}】的專屬行動指南`}
        </p>
      </header>

      {!hasReports ? (
        <div>
          {/* Empty state guidance card */}
          <div 
            className="card" 
            style={{ 
              textAlign: 'center', 
              padding: '48px 24px', 
              background: '#fcfcfc', 
              border: '1px dashed #d0d7de',
              marginBottom: '24px'
            }}
          >
            <ClipboardList size={48} color="var(--primary)" style={{ opacity: 0.6, marginBottom: '16px' }} />
            <h3 style={{ margin: '0 0 8px 0', fontSize: '17px', color: 'var(--text-primary)' }}>
              尚未有【{activeProfile.name}】的檢驗紀錄
            </h3>
            <p style={{ color: 'var(--text-secondary)', fontSize: '13px', maxWidth: '340px', margin: '0 auto 20px', lineHeight: 1.6 }}>
              上傳健檢報告後，系統將依據您的檢驗數據自動生成個人化的日常改善微行動、就醫複檢時程與年度健檢排程。
            </p>
            <button 
              className="btn-primary" 
              onClick={() => navigate('/upload')}
              style={{ 
                display: 'inline-flex', 
                alignItems: 'center', 
                gap: '8px', 
                padding: '12px 24px',
                borderRadius: '24px',
                fontWeight: 600,
                fontSize: '14px'
              }}
            >
              <Camera size={18} />
              立即拍照或上傳檢驗紀錄
            </button>
          </div>

          {/* 3. 你可用的免費篩檢 */}
          <section style={{ marginBottom: '32px' }}>
            <h3 style={{ marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Check size={20} color="#e91e63" />
              政府補助免費篩檢資格（依年齡）
            </h3>
            <div className="card" style={{ padding: '0', overflow: 'hidden' }}>
              {freeScreenings.map((s, idx) => (
                <div key={idx} style={{ padding: '16px 20px', borderBottom: idx === freeScreenings.length - 1 ? 'none' : '1px solid #f2f2f2', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <span style={{ fontWeight: '700', fontSize: '14px' }}>{s.title}</span>
                      {s.eligible && <span style={{ background: '#fce4ec', color: '#e91e63', fontSize: '10px', fontWeight: '800', padding: '2px 8px', borderRadius: '4px' }}>符合資格</span>}
                    </div>
                    <div style={{ fontSize: '11px', color: 'var(--text-secondary)', marginTop: '4px' }}>{s.criteria} | <span style={{ color: '#e91e63', fontWeight: '600' }}>免費</span></div>
                  </div>
                  <ChevronRight size={18} color="#ddd" />
                </div>
              ))}
            </div>
          </section>

          {/* Medical Disclaimer */}
          <div style={{
            padding: '12px 16px',
            background: '#f9fafb',
            border: '1px solid #e5e7eb',
            borderRadius: '12px',
            fontSize: '11px',
            color: '#6b7280',
            lineHeight: '1.5',
            textAlign: 'left'
          }}>
            <strong style={{ color: '#b45309', display: 'block', marginBottom: '2px' }}>
              ⚠️ 衛教免責聲明
            </strong>
            生活改善微行動與就醫建議係依據國民健康署指引整理之日常保健參考，非臨床醫療診斷或處方。上傳檢驗數據後，系統將提供專屬衛教指引。
          </div>
        </div>
      ) : (
        <>
          {/* 1. 日常改善微行動 */}
          <section style={{ marginBottom: '32px' }}>
            <h3 style={{ marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <ClipboardList size={20} color="var(--primary)" />
              日常改善微行動
            </h3>
            <div className="card" style={{ background: 'var(--primary-light)', border: 'none', display: 'flex', alignItems: 'center', gap: '16px', padding: '16px', marginBottom: '16px' }}>
              <Trophy size={24} color="var(--primary)" />
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: '12px', color: 'var(--primary)', fontWeight: '700' }}>本週完成進度</div>
                <div style={{ height: '6px', background: 'white', borderRadius: '3px', marginTop: '8px', overflow: 'hidden' }}>
                  <div style={{ width: `${actions.length > 0 ? (completedCount/actions.length)*100 : 0}%`, height: '100%', background: 'var(--primary)', transition: 'width 0.5s' }}></div>
                </div>
              </div>
              <div style={{ fontSize: '16px', fontWeight: '800', color: 'var(--primary)' }}>{completedCount}/{actions.length}</div>
            </div>

            {actions.map((action) => (
              <div 
                key={`${action.biomarkerKey}_${action.id}`} 
                className="card" 
                style={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  gap: '16px', 
                  padding: '16px 20px', 
                  marginBottom: '10px', 
                  borderColor: action.completed ? 'transparent' : '#f2f2f2',
                  background: action.completed ? '#fcfcfc' : 'white',
                  opacity: action.completed ? 0.6 : 1,
                  cursor: 'pointer'
                }}
                onClick={() => toggleAction(action)}
              >
                {action.completed ? <CheckCircle2 size={22} color="var(--primary)" /> : <Circle size={22} color="#ccc" />}
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '4px' }}>
                    <span style={{ 
                      fontSize: '10px', 
                      color: 'var(--primary)', 
                      fontWeight: '800', 
                      background: 'var(--primary-light)', 
                      padding: '1px 6px', 
                      borderRadius: '4px' 
                    }}>
                      {action.biomarkerKey === 'LIFESTYLE' ? '日常習慣' : action.biomarkerKey}
                    </span>
                    <span style={{ fontSize: '11px', color: 'var(--text-secondary)', fontWeight: '600' }}>
                      {action.categoryLabel || '健康'}
                    </span>
                  </div>
                  <div style={{ fontWeight: '600', fontSize: '14px', textDecoration: action.completed ? 'line-through' : 'none' }}>{action.title}</div>
                </div>
              </div>
            ))}

            {actions.length === 0 && (
              <div className="card" style={{ textAlign: 'center', padding: '24px 20px', background: '#fafafa', border: '1px dashed #d0d7de' }}>
                <p style={{ color: 'var(--text-secondary)', fontSize: '14px', margin: '0 0 12px 0' }}>
                  尚未加入任何微行動，可前往「指標趨勢」頁針對特定指標加入改善微行動。
                </p>
                <button 
                  className="btn-outline" 
                  onClick={() => navigate('/trends')}
                  style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', fontSize: '13px', padding: '8px 16px', borderRadius: '20px' }}
                >
                  前往指標趨勢選取
                </button>
              </div>
            )}
          </section>

          {/* 2. 就醫與複檢建議 */}
          <section style={{ marginBottom: '32px' }}>
            <h3 style={{ marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Stethoscope size={20} color="var(--primary)" />
              就醫與複檢建議
            </h3>
            {medicalAdvices.length > 0 ? (
              medicalAdvices.map((med) => (
                <div key={med.id} className="card" style={{ padding: '20px', marginBottom: '12px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
                    <div>
                      <div style={{ fontWeight: '800', fontSize: '16px', color: 'var(--text-primary)' }}>{med.marker}</div>
                      <div style={{ color: 'var(--critical)', fontSize: '13px', fontWeight: '700', marginTop: '4px' }}>{med.time}</div>
                    </div>
                    <span className="badge badge-normal" style={{ fontSize: '11px' }}>{med.dept}</span>
                  </div>
                  <p style={{ fontSize: '13px', color: 'var(--text-secondary)', lineHeight: '1.6', margin: '0 0 16px 0' }}>
                    {med.advice}
                  </p>
                  <div style={{ display: 'flex', gap: '12px' }}>
                    <button 
                      className="btn-outline"
                      onClick={() => triggerToast('已加入行事曆，將於追蹤前兩週提醒。')}
                    >
                      <Calendar size={14} />
                      加入行事曆
                    </button>
                    <button 
                      className="btn-outline"
                      onClick={() => navigate('/trends')}
                    >
                      看指標歷史趨勢
                    </button>
                  </div>
                </div>
              ))
            ) : (
              <div className="card" style={{ padding: '20px', textAlign: 'center', color: 'var(--primary)', background: 'var(--primary-light)' }}>
                🎉 本次健檢所有指標均在正常範圍，請維持良好生活作息，定期受檢即可。
              </div>
            )}
          </section>

          {/* 3. 你可用的免費篩檢 */}
          <section style={{ marginBottom: '32px' }}>
            <h3 style={{ marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Check size={20} color="#e91e63" />
              你可用的免費篩檢
            </h3>
            <div className="card" style={{ padding: '0', overflow: 'hidden' }}>
              {freeScreenings.map((s, idx) => (
                <div key={idx} style={{ padding: '16px 20px', borderBottom: idx === freeScreenings.length - 1 ? 'none' : '1px solid #f2f2f2', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <span style={{ fontWeight: '700', fontSize: '14px' }}>{s.title}</span>
                      {s.eligible && <span style={{ background: '#fce4ec', color: '#e91e63', fontSize: '10px', fontWeight: '800', padding: '2px 8px', borderRadius: '4px' }}>符合資格</span>}
                    </div>
                    <div style={{ fontSize: '11px', color: 'var(--text-secondary)', marginTop: '4px' }}>{s.criteria} | <span style={{ color: '#e91e63', fontWeight: '600' }}>免費</span></div>
                  </div>
                  <ChevronRight size={18} color="#ddd" />
                </div>
              ))}
            </div>
          </section>

          {/* 4. 年度健檢排程 (加入行事曆) */}
          <section style={{ marginBottom: '24px' }}>
            <div className="card" style={{ background: '#ffffff', border: '1px solid #e5e7eb', padding: '24px', borderRadius: '16px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '12px' }}>
                <Calendar size={20} color="var(--primary)" />
                <span style={{ fontWeight: '700', fontSize: '15px', color: 'var(--text-primary)' }}>年度健檢排程</span>
              </div>
              <p style={{ fontSize: '13px', color: 'var(--text-secondary)', lineHeight: '1.6', margin: 0 }}>
                上次健檢日期為 {checkupDate}。建議於 <span style={{ color: 'var(--primary)', fontWeight: '800' }}>{nextCheckupDate}</span> 前後安排次年度預約。
              </p>
              <p style={{ fontSize: '12px', color: 'var(--text-secondary)', opacity: 0.85, marginTop: '8px', marginBottom: '16px' }}>
                系統不發送主動推播干擾，您可一鍵將健檢預約時程直接新增至個人行事曆中。
              </p>
              <button 
                className="btn-primary"
                style={{ 
                  display: 'inline-flex', 
                  alignItems: 'center', 
                  gap: '8px', 
                  padding: '10px 18px', 
                  fontSize: '13px', 
                  borderRadius: '10px', 
                  cursor: 'pointer',
                  border: 'none',
                  background: 'var(--primary)',
                  color: 'white',
                  fontWeight: '600'
                }}
                onClick={handleAddToCalendar}
              >
                <Calendar size={16} />
                點選加入行事曆 (.ics)
              </button>
            </div>
          </section>

          {/* Disclaimer */}
          <div style={{
            padding: '12px 16px',
            background: '#f9fafb',
            border: '1px solid #e5e7eb',
            borderRadius: '12px',
            fontSize: '11px',
            color: '#6b7280',
            lineHeight: '1.5',
            textAlign: 'left'
          }}>
            <strong style={{ color: '#b45309', display: 'block', marginBottom: '2px' }}>
              ⚠️ 衛教免責聲明
            </strong>
            生活改善微行動與就醫建議係依據國民健康署指引整理之日常保健參考，非臨床醫療診斷或處方。個人身體狀況因人而異，如有不適請務必親洽專業醫師診治。
          </div>
        </>
      )}

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

export default Actions;
