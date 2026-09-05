import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Upload, X, Loader2, CheckCircle, AlertCircle, FileText, Search, 
  Activity, Database, Sparkles, ShieldCheck, Check, Calendar, 
  Building, RefreshCw, Save, AlertTriangle
} from 'lucide-react';
import { useProfile } from '../context/ProfileContext';
import type { BiomarkerRecord, ReportItem } from '../types/profile';

const steps = [
  { id: 1, label: '上傳檔案', icon: Upload },
  { id: 2, label: '辨識檢驗項目', icon: Search },
  { id: 3, label: '對照參考值', icon: Activity },
  { id: 4, label: '整合歷年資料', icon: Database },
  { id: 5, label: '產生白話解釋與行動指南', icon: Sparkles },
];

const INITIAL_OCR_DATA: BiomarkerRecord[] = [
  { biomarker_key: 'GLU_AC', display_name: '飯前血糖 (AC)', numerical_value: 110.0, unit: 'mg/dL', reference_range: '70 ~ 99', status_flag: 'WARNING' },
  { biomarker_key: 'HBA1C', display_name: '糖化血色素 (HbA1c)', numerical_value: 6.2, unit: '%', reference_range: '4.0 ~ 5.6', status_flag: 'WARNING' },
  { biomarker_key: 'CHOL', display_name: '總膽固醇 (TC)', numerical_value: 245.0, unit: 'mg/dL', reference_range: '< 200', status_flag: 'CRITICAL' },
  { biomarker_key: 'ALT', display_name: '丙胺酸轉胺酶 (ALT/GPT)', numerical_value: 74.0, unit: 'U/L', reference_range: '< 40', status_flag: 'CRITICAL' },
  { biomarker_key: 'UA', display_name: '尿酸 (UA)', numerical_value: 7.5, unit: 'mg/dL', reference_range: '3.4 ~ 7.2', status_flag: 'CRITICAL' },
  { biomarker_key: 'TG', display_name: '三酸甘油酯 (TG)', numerical_value: 145.0, unit: 'mg/dL', reference_range: '< 150', status_flag: 'NORMAL' },
  { biomarker_key: 'HDL', display_name: '高密度脂蛋白 (HDL-C)', numerical_value: 42.0, unit: 'mg/dL', reference_range: '> 40', status_flag: 'NORMAL' },
  { biomarker_key: 'LDL', display_name: '低密度脂蛋白 (LDL-C)', numerical_value: 125.0, unit: 'mg/dL', reference_range: '< 130', status_flag: 'NORMAL' },
  { biomarker_key: 'AST', display_name: '天門冬胺酸轉胺酶 (AST/GOT)', numerical_value: 38.0, unit: 'U/L', reference_range: '< 40', status_flag: 'NORMAL' },
  { biomarker_key: 'EGFR', display_name: '腎絲球過濾率 (eGFR)', numerical_value: 92.0, unit: 'mL/min', reference_range: '>= 90', status_flag: 'NORMAL' }
];

const evaluateStatus = (key: string, value: number): 'NORMAL' | 'WARNING' | 'CRITICAL' => {
  switch (key) {
    case 'GLU_AC':
      if (value < 70 || (value >= 100 && value <= 125)) return 'WARNING';
      if (value >= 126) return 'CRITICAL';
      return 'NORMAL';
    case 'HBA1C':
      if (value >= 5.7 && value <= 6.4) return 'WARNING';
      if (value >= 6.5) return 'CRITICAL';
      return 'NORMAL';
    case 'CHOL':
      if (value >= 200 && value <= 239) return 'WARNING';
      if (value >= 240) return 'CRITICAL';
      return 'NORMAL';
    case 'ALT':
      if (value > 40 && value <= 80) return 'WARNING';
      if (value > 80) return 'CRITICAL';
      return 'NORMAL';
    case 'UA':
      if (value > 7.2) return 'CRITICAL';
      return 'NORMAL';
    case 'TG':
      if (value >= 150 && value <= 199) return 'WARNING';
      if (value >= 200) return 'CRITICAL';
      return 'NORMAL';
    case 'HDL':
      if (value < 40) return 'CRITICAL';
      return 'NORMAL';
    case 'LDL':
      if (value >= 100 && value <= 129) return 'WARNING';
      if (value >= 130) return 'CRITICAL';
      return 'NORMAL';
    case 'AST':
      if (value > 40 && value <= 80) return 'WARNING';
      if (value > 80) return 'CRITICAL';
      return 'NORMAL';
    case 'EGFR':
      if (value >= 60 && value < 90) return 'WARNING';
      if (value < 60) return 'CRITICAL';
      return 'NORMAL';
    default:
      return 'NORMAL';
  }
};

const UploadPage: React.FC = () => {
  const navigate = useNavigate();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { 
    activeProfile, 
    completeFirstUploadOnboarding,
    addReportToActiveProfile 
  } = useProfile();

  // Mandatory disclaimer state required before EVERY report upload
  const [hasAgreedDisclaimerForUpload, setHasAgreedDisclaimerForUpload] = useState(false);
  const [agreedDisclaimer, setAgreedDisclaimer] = useState(false);

  // Upload & OCR states
  const [status, setStatus] = useState<'IDLE' | 'PROCESSING' | 'REVIEW' | 'ERROR'>('IDLE');
  const [currentStep, setCurrentStep] = useState(0);
  const [progress, setProgress] = useState(0);
  const [errorMsg, setErrorMsg] = useState('');

  // Calibration / Review states
  const [checkupDate, setCheckupDate] = useState('2025-03-15');
  const [institutionName, setInstitutionName] = useState('國泰綜合健檢中心');
  const [records, setRecords] = useState<BiomarkerRecord[]>(INITIAL_OCR_DATA);

  const handleDisclaimerSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!agreedDisclaimer) return;
    setHasAgreedDisclaimerForUpload(true);
    completeFirstUploadOnboarding();
  };

  const handleStartUpload = () => {
    setStatus('PROCESSING');
    setErrorMsg('');
    setCurrentStep(1);
    setProgress(0);
  };

  useEffect(() => {
    if (status !== 'PROCESSING') return;

    const interval = setInterval(() => {
      setProgress(prev => {
        const next = prev + 2;
        
        if (next === 20) setCurrentStep(2);
        if (next === 40) setCurrentStep(3);
        if (next === 60) setCurrentStep(4);
        if (next === 80) setCurrentStep(5);

        if (next >= 100) {
          clearInterval(interval);
          // Try fetching default report from backend as base or use initial
          fetch('/api/v1/reports/upload', { method: 'POST' })
            .then(res => res.json())
            .then(data => {
              if (data?.data?.records) {
                setRecords(data.data.records);
                if (data.data.checkup_date) setCheckupDate(data.data.checkup_date);
                if (data.data.institution_name) setInstitutionName(data.data.institution_name);
              }
              setStatus('REVIEW');
            })
            .catch(() => {
              // Fallback to local default
              setRecords(INITIAL_OCR_DATA);
              setStatus('REVIEW');
            });
          return 100;
        }
        return next;
      });
    }, 40); // ~2-3 seconds total

    return () => clearInterval(interval);
  }, [status]);

  const onFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      handleStartUpload();
    }
  };

  const handleValueChange = (index: number, valStr: string) => {
    const num = parseFloat(valStr);
    const updated = [...records];
    const item = updated[index];
    
    if (isNaN(num)) {
      item.numerical_value = 0;
    } else {
      item.numerical_value = num;
      item.status_flag = evaluateStatus(item.biomarker_key, num);
    }
    setRecords(updated);
  };

  const handleConfirmAndSave = () => {
    const abnormalCount = records.filter(r => r.status_flag !== 'NORMAL').length;
    const newReportId = `rep_${Date.now()}`;

    const newReport: ReportItem = {
      report_id: newReportId,
      checkup_date: checkupDate,
      institution_name: institutionName,
      total_biomarkers_found: records.length,
      abnormal_count: abnormalCount,
      records: records
    };

    addReportToActiveProfile(newReport);
    navigate(`/reports/${newReportId}`);
  };

  // 1. MANDATORY DISCLAIMER GATE (REQUIRED BEFORE EVERY REPORT UPLOAD)
  if (!hasAgreedDisclaimerForUpload) {
    return (
      <div className="page-content" style={{ display: 'flex', flexDirection: 'column', minHeight: '80vh', justifyContent: 'center' }}>
        <div className="card" style={{ padding: '24px', textAlign: 'left', border: '1px solid #bbf7d0', background: '#fff' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '14px' }}>
            <div style={{ width: '40px', height: '40px', borderRadius: '12px', background: 'var(--primary-light)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <ShieldCheck size={24} color="var(--primary)" />
            </div>
            <div>
              <h2 style={{ fontSize: '18px', margin: 0, color: 'var(--text-primary)' }}>上傳報告免責聲明</h2>
              <span style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>為確保醫療權益與保障個人隱私，每次上傳報告前請先確認</span>
            </div>
          </div>

          {/* Disclaimer Alert Box */}
          <div style={{ background: '#fefce8', border: '1px solid #fef08a', borderRadius: '14px', padding: '14px', marginBottom: '18px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#854d0e', fontWeight: '700', fontSize: '13px', marginBottom: '6px' }}>
              <AlertTriangle size={16} />
              <span>重要醫療免責與健康隱私聲明</span>
            </div>
            <ul style={{ margin: 0, paddingLeft: '18px', fontSize: '12px', color: '#713f12', lineHeight: '1.6' }}>
              <li>
                <strong>非臨床診斷用途</strong>：Healsight 提供之健檢報告視覺化、趨勢與 AI 白話指標說明均依衛福部衛教指南生成，<strong>絕不構成任何臨床醫療診斷、處方或治療依據</strong>。
              </li>
              <li>
                <strong>健康資料隱私保護</strong>：所有健檢數值與個人健康紀錄均受嚴格隱私權條款與傳輸加密規範，絕不用於未經授權之第三方行銷或非衛教用途。
              </li>
              <li>
                <strong>異常指標處置</strong>：若有明顯紅字異常或身體不適，請務必諮詢專科醫師親自診治。
              </li>
            </ul>
          </div>

          <form onSubmit={handleDisclaimerSubmit}>
            <div style={{ 
              display: 'flex', 
              alignItems: 'flex-start', 
              gap: '10px', 
              background: '#ffffff', 
              padding: '14px', 
              borderRadius: '12px', 
              marginBottom: '20px',
              border: '1px solid #d1d5db'
            }}>
              <input 
                type="checkbox" 
                id="disclaimer-check"
                checked={agreedDisclaimer}
                onChange={e => setAgreedDisclaimer(e.target.checked)}
                style={{ 
                  width: '18px', 
                  height: '18px', 
                  marginTop: '2px', 
                  accentColor: 'var(--primary)', 
                  backgroundColor: '#ffffff',
                  colorScheme: 'light',
                  cursor: 'pointer' 
                }}
              />
              <label htmlFor="disclaimer-check" style={{ fontSize: '13px', lineHeight: '1.5', color: 'var(--text-primary)', cursor: 'pointer' }}>
                我已詳閱並充分理解上述<strong>醫療免責聲明</strong>與<strong>個人健康隱私政策</strong>，同意進行本次報告上傳。
              </label>
            </div>

            <button 
              type="submit" 
              className="btn-primary" 
              disabled={!agreedDisclaimer}
              style={{
                opacity: agreedDisclaimer ? 1 : 0.5,
                cursor: agreedDisclaimer ? 'pointer' : 'not-allowed'
              }}
            >
              <Check size={18} />
              同意免責聲明並開始上傳
            </button>
          </form>
        </div>
      </div>
    );
  }

  // 2. OCR REVIEW & CALIBRATION STAGE (校對與手動修改數值)
  if (status === 'REVIEW') {
    return (
      <div className="page-content" style={{ paddingBottom: '90px' }}>
        <header style={{ textAlign: 'left', marginBottom: '20px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
            <span style={{ background: 'var(--primary-light)', color: 'var(--primary)', padding: '2px 8px', borderRadius: '12px', fontSize: '11px', fontWeight: '800' }}>
              OCR 辨識完成
            </span>
          </div>
          <h1 style={{ fontSize: '22px', margin: 0 }}>數值校對與日期確認</h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '13px', margin: '4px 0 0 0' }}>
            請檢核辨識數值與健檢日期，若有落差可直接點擊修改
          </p>
        </header>

        {/* Checkup Date & Institution Inputs */}
        <div className="card" style={{ padding: '16px', marginBottom: '20px', textAlign: 'left' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            <div>
              <label style={{ fontSize: '12px', fontWeight: '700', color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: '4px', marginBottom: '4px' }}>
                <Calendar size={13} color="var(--primary)" />
                健檢日期
              </label>
              <input 
                type="date" 
                value={checkupDate}
                onChange={e => setCheckupDate(e.target.value)}
                style={{
                  width: '100%',
                  padding: '8px 10px',
                  borderRadius: '10px',
                  border: '1.5px solid #d1d5db',
                  fontSize: '13px',
                  fontWeight: '600',
                  background: '#ffffff',
                  color: 'var(--text-primary)',
                  boxSizing: 'border-box'
                }}
              />
            </div>

            <div>
              <label style={{ fontSize: '12px', fontWeight: '700', color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: '4px', marginBottom: '4px' }}>
                <Building size={13} color="var(--primary)" />
                健檢機構
              </label>
              <input 
                type="text" 
                value={institutionName}
                onChange={e => setInstitutionName(e.target.value)}
                placeholder="例如：國泰綜合健檢中心"
                style={{
                  width: '100%',
                  padding: '8px 10px',
                  borderRadius: '10px',
                  border: '1.5px solid #d1d5db',
                  fontSize: '13px',
                  fontWeight: '600',
                  background: '#ffffff',
                  color: 'var(--text-primary)',
                  boxSizing: 'border-box'
                }}
              />
            </div>
          </div>
        </div>

        {/* Biomarkers Calibration List */}
        <section style={{ marginBottom: '20px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
            <h3 style={{ margin: 0, fontSize: '15px', textAlign: 'left' }}>
              辨識檢驗項目 ({records.length} 項)
            </h3>
            <span style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>
              可直接手動調整數值
            </span>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {records.map((item, idx) => {
              const isAbnormal = item.status_flag !== 'NORMAL';
              const isCritical = item.status_flag === 'CRITICAL';

              return (
                <div 
                  key={item.biomarker_key} 
                  className="card" 
                  style={{ 
                    padding: '12px 16px', 
                    marginBottom: 0,
                    border: isCritical ? '1.5px solid #fca5a5' : (item.status_flag === 'WARNING' ? '1.5px solid #fde047' : '1px solid #f0f0f0'),
                    background: isCritical ? '#fff5f5' : (item.status_flag === 'WARNING' ? '#fffdf0' : '#fff'),
                    textAlign: 'left'
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                    <span style={{ fontWeight: '700', fontSize: '14px' }}>{item.display_name}</span>
                    <span className={`badge badge-${item.status_flag.toLowerCase()}`} style={{ fontSize: '10px', padding: '2px 8px' }}>
                      {isCritical ? '明顯異常' : (item.status_flag === 'WARNING' ? '須留意' : '正常')}
                    </span>
                  </div>

                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>
                      參考區間：<span style={{ fontWeight: '600', color: 'var(--text-primary)' }}>{item.reference_range}</span>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <input 
                        type="number" 
                        step="0.1"
                        value={item.numerical_value}
                        onChange={e => handleValueChange(idx, e.target.value)}
                        style={{
                          width: '80px',
                          padding: '6px 8px',
                          borderRadius: '8px',
                          border: isAbnormal ? '1.5px solid var(--critical)' : '1px solid #d1d5db',
                          fontSize: '15px',
                          fontWeight: '800',
                          textAlign: 'right',
                          color: isCritical ? 'var(--critical)' : (item.status_flag === 'WARNING' ? '#b06000' : 'var(--primary)'),
                          background: 'white'
                        }}
                      />
                      <span style={{ fontSize: '12px', color: 'var(--text-secondary)', fontWeight: '600', width: '38px' }}>
                        {item.unit}
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        {/* Sticky Action Footer */}
        <div className="sticky-bottom" style={{ display: 'flex', gap: '10px' }}>
          <button 
            className="btn-outline" 
            onClick={() => setStatus('IDLE')}
            style={{ flex: 1, padding: '14px', borderRadius: '14px' }}
          >
            <RefreshCw size={16} />
            重新辨識
          </button>
          <button 
            className="btn-primary" 
            onClick={handleConfirmAndSave}
            style={{ flex: 2, padding: '14px', borderRadius: '14px' }}
          >
            <Save size={18} />
            確認並儲存報告
          </button>
        </div>
      </div>
    );
  }

  // 3. REGULAR UPLOAD & OCR STEPS
  return (
    <div className="page-content" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '80vh' }}>
      <button 
        onClick={() => navigate('/')}
        style={{ position: 'absolute', top: '16px', right: '16px', background: 'none', border: 'none', zIndex: 10, cursor: 'pointer' }}
      >
        <X size={24} color="var(--text-secondary)" />
      </button>

      {status === 'IDLE' && (
        <div style={{ textAlign: 'center', width: '100%', maxWidth: '400px' }}>
          <div style={{ width: '80px', height: '80px', background: 'var(--primary-light)', borderRadius: '24px', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 24px' }}>
            <FileText size={40} color="var(--primary)" />
          </div>
          <h1 style={{ fontSize: '24px', marginBottom: '8px' }}>上傳報告</h1>
          <p style={{ color: 'var(--text-secondary)', marginBottom: '32px', fontSize: '15px' }}>
            為【{activeProfile.name}】建立健檢數位健康紀錄
          </p>

          <input 
            type="file" 
            ref={fileInputRef} 
            style={{ display: 'none' }} 
            onChange={onFileChange}
            accept="image/*,.pdf"
          />
          
          <div 
            className="card" 
            style={{ border: '2px dashed #e0e0e0', padding: '48px 20px', cursor: 'pointer', background: '#fafafa', borderRadius: '24px' }} 
            onClick={() => fileInputRef.current?.click()}
          >
            <Upload size={32} color="var(--primary)" style={{ marginBottom: '12px', opacity: 0.5 }} />
            <p style={{ color: 'var(--primary)', fontWeight: '800', fontSize: '16px', margin: 0 }}>點擊選擇或拍攝照片</p>
            <p style={{ fontSize: '12px', color: 'var(--text-secondary)', marginTop: '8px', margin: '8px 0 0 0' }}>支援 JPG, PNG, PDF (最大 10MB)</p>
          </div>
          
          <button 
            className="btn-outline" 
            style={{ marginTop: '20px', width: '100%', background: 'white', borderColor: 'var(--primary-light)', padding: '14px' }}
            onClick={handleStartUpload}
          >
            使用範例報告體驗
          </button>

          <div style={{ marginTop: '20px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', color: 'var(--text-secondary)', fontSize: '12px' }}>
            <ShieldCheck size={14} color="var(--primary)" />
            <span>醫療級資料傳輸加密規範，嚴格守護個人健檢隱私</span>
          </div>
        </div>
      )}

      {status === 'PROCESSING' && (
        <div style={{ width: '100%', maxWidth: '400px' }}>
          <h2 style={{ fontSize: '22px', marginBottom: '32px', textAlign: 'center' }}>正在處理報告...</h2>
          
          {/* Steps List */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '18px', marginBottom: '40px' }}>
            {steps.map((s) => {
              const isActive = currentStep === s.id;
              const isDone = currentStep > s.id;
              const Icon = s.icon;
              
              return (
                <div key={s.id} style={{ display: 'flex', alignItems: 'center', gap: '16px', opacity: isActive || isDone ? 1 : 0.3, transition: 'opacity 0.3s' }}>
                  <div style={{ 
                    width: '36px', 
                    height: '36px', 
                    borderRadius: '10px', 
                    background: isDone ? 'var(--primary)' : (isActive ? 'var(--primary-light)' : '#f0f0f0'),
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    transition: 'all 0.3s'
                  }}>
                    {isDone ? <CheckCircle size={20} color="white" /> : <Icon size={18} color={isActive ? 'var(--primary)' : '#999'} />}
                  </div>
                  <span style={{ fontSize: '15px', fontWeight: isActive || isDone ? '700' : '500', color: isActive ? 'var(--primary)' : 'var(--text-primary)' }}>
                    {s.label}
                  </span>
                  {isActive && <Loader2 size={16} className="animate-spin" color="var(--primary)" style={{ marginLeft: 'auto' }} />}
                </div>
              );
            })}
          </div>

          {/* Large Progress Bar */}
          <div style={{ width: '100%', height: '8px', background: '#f0f0f0', borderRadius: '4px', overflow: 'hidden' }}>
            <div style={{ width: `${progress}%`, height: '100%', background: 'var(--primary)', transition: 'width 0.1s linear' }}></div>
          </div>
          <div style={{ textAlign: 'right', marginTop: '8px', fontSize: '12px', color: 'var(--text-secondary)', fontWeight: '600' }}>
            {progress}% 完成
          </div>
        </div>
      )}

      {status === 'ERROR' && (
        <div style={{ textAlign: 'center', width: '100%', maxWidth: '300px' }}>
          <AlertCircle size={64} color="var(--critical)" style={{ margin: '0 auto 24px' }} />
          <h2 style={{ fontSize: '20px', marginBottom: '8px' }}>發生錯誤</h2>
          <p style={{ color: 'var(--text-secondary)', marginBottom: '32px' }}>{errorMsg}</p>
          <button className="btn-primary" onClick={() => setStatus('IDLE')}>
            重新嘗試
          </button>
        </div>
      )}
      
      <style>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        .animate-spin {
          animation: spin 1.2s linear infinite;
        }
      `}</style>
    </div>
  );
};

export default UploadPage;
