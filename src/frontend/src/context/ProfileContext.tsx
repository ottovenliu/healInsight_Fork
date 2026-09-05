import React, { createContext, useContext, useState, useEffect } from 'react';
import type { Profile, ProfileContextType, ReportItem } from '../types/profile';
import { profileApi } from '../services/api';

const DEFAULT_PROFILES: Profile[] = [
  {
    id: 'prof_alex',
    name: 'Alex',
    gender: 'male',
    age: 33,
    relationship: '本人',
    avatarBg: '#137333',
    reports: [
      {
        report_id: 'rep_2025',
        checkup_date: '2025-03-15',
        institution_name: '國泰綜合健檢中心',
        total_biomarkers_found: 10,
        abnormal_count: 5,
        records: [
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
        ]
      },
      {
        report_id: 'rep_2024',
        checkup_date: '2024-03-12',
        institution_name: '國泰綜合健檢中心',
        total_biomarkers_found: 10,
        abnormal_count: 2,
        records: [
          { biomarker_key: 'GLU_AC', display_name: '飯前血糖 (AC)', numerical_value: 102.0, unit: 'mg/dL', reference_range: '70 ~ 99', status_flag: 'WARNING' },
          { biomarker_key: 'ALT', display_name: '丙胺酸轉胺酶 (ALT/GPT)', numerical_value: 52.0, unit: 'U/L', reference_range: '< 40', status_flag: 'WARNING' },
          { biomarker_key: 'CHOL', display_name: '總膽固醇 (TC)', numerical_value: 210.0, unit: 'mg/dL', reference_range: '< 200', status_flag: 'WARNING' }
        ]
      },
      {
        report_id: 'rep_2023',
        checkup_date: '2023-03-10',
        institution_name: '國泰綜合健檢中心',
        total_biomarkers_found: 10,
        abnormal_count: 0,
        records: [
          { biomarker_key: 'GLU_AC', display_name: '飯前血糖 (AC)', numerical_value: 95.0, unit: 'mg/dL', reference_range: '70 ~ 99', status_flag: 'NORMAL' },
          { biomarker_key: 'ALT', display_name: '丙胺酸轉胺酶 (ALT/GPT)', numerical_value: 35.0, unit: 'U/L', reference_range: '< 40', status_flag: 'NORMAL' }
        ]
      },
      {
        report_id: 'rep_2022',
        checkup_date: '2022-03-08',
        institution_name: '美兆診所',
        total_biomarkers_found: 10,
        abnormal_count: 0,
        records: [
          { biomarker_key: 'ALT', display_name: '丙胺酸轉胺酶 (ALT/GPT)', numerical_value: 28.0, unit: 'U/L', reference_range: '< 40', status_flag: 'NORMAL' }
        ]
      },
      {
        report_id: 'rep_2021',
        checkup_date: '2021-03-05',
        institution_name: '美兆診所',
        total_biomarkers_found: 10,
        abnormal_count: 0,
        records: [
          { biomarker_key: 'ALT', display_name: '丙胺酸轉胺酶 (ALT/GPT)', numerical_value: 22.0, unit: 'U/L', reference_range: '< 40', status_flag: 'NORMAL' }
        ]
      }
    ]
  },
  {
    id: 'prof_mom',
    name: '媽媽',
    gender: 'female',
    age: 65,
    relationship: '母親',
    avatarBg: '#d81b60',
    reports: [
      {
        report_id: 'rep_mom_2025',
        checkup_date: '2025-05-20',
        institution_name: '台北榮總健檢中心',
        total_biomarkers_found: 10,
        abnormal_count: 2,
        records: [
          { biomarker_key: 'HBA1C', display_name: '糖化血色素 (HbA1c)', numerical_value: 6.4, unit: '%', reference_range: '4.0 ~ 5.6', status_flag: 'WARNING' },
          { biomarker_key: 'CHOL', display_name: '總膽固醇 (TC)', numerical_value: 228.0, unit: 'mg/dL', reference_range: '< 200', status_flag: 'WARNING' },
          { biomarker_key: 'GLU_AC', display_name: '飯前血糖 (AC)', numerical_value: 98.0, unit: 'mg/dL', reference_range: '70 ~ 99', status_flag: 'NORMAL' },
          { biomarker_key: 'ALT', display_name: '丙胺酸轉胺酶 (ALT/GPT)', numerical_value: 24.0, unit: 'U/L', reference_range: '< 40', status_flag: 'NORMAL' }
        ]
      },
      {
        report_id: 'rep_mom_2024',
        checkup_date: '2024-05-18',
        institution_name: '台北榮總健檢中心',
        total_biomarkers_found: 10,
        abnormal_count: 1,
        records: [
          { biomarker_key: 'HBA1C', display_name: '糖化血色素 (HbA1c)', numerical_value: 6.1, unit: '%', reference_range: '4.0 ~ 5.6', status_flag: 'WARNING' },
          { biomarker_key: 'CHOL', display_name: '總膽固醇 (TC)', numerical_value: 195.0, unit: 'mg/dL', reference_range: '< 200', status_flag: 'NORMAL' }
        ]
      }
    ]
  }
];

const ProfileContext = createContext<ProfileContextType | undefined>(undefined);

export const ProfileProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [profiles, setProfiles] = useState<Profile[]>(() => {
    try {
      const saved = localStorage.getItem('healsight_profiles');
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.error('Error loading profiles from localStorage', e);
    }
    return DEFAULT_PROFILES;
  });

  const [activeProfileId, setActiveProfileIdState] = useState<string>(() => {
    try {
      const savedId = localStorage.getItem('healsight_active_profile_id');
      if (savedId) return savedId;
    } catch (e) {
      console.error(e);
    }
    return 'prof_alex';
  });

  const [isFirstUploadOnboarded, setIsFirstUploadOnboarded] = useState<boolean>(() => {
    try {
      return localStorage.getItem('healsight_first_upload_onboarded') === 'true';
    } catch {
      return false;
    }
  });

  // Fetch latest profiles from backend API on mount
  useEffect(() => {
    profileApi.getProfiles()
      .then(res => {
        if (res?.data && res.data.length > 0) {
          setProfiles(res.data);
        }
      })
      .catch(err => {
        console.warn('Backend API not reachable, using cached profiles:', err);
      });
  }, []);

  // Save profiles to cache whenever they change
  useEffect(() => {
    try {
      localStorage.setItem('healsight_profiles', JSON.stringify(profiles));
    } catch (e) {
      console.error('Error saving profiles to cache', e);
    }
  }, [profiles]);

  // Save activeProfileId to localStorage
  useEffect(() => {
    try {
      localStorage.setItem('healsight_active_profile_id', activeProfileId);
    } catch (e) {
      console.error('Error saving activeProfileId to localStorage', e);
    }
  }, [activeProfileId]);

  const setActiveProfileId = (id: string) => {
    if (profiles.some(p => p.id === id)) {
      setActiveProfileIdState(id);
    }
  };

  const activeProfile = profiles.find(p => p.id === activeProfileId) || profiles[0] || DEFAULT_PROFILES[0];

  const updateActiveProfile = (updates: Partial<Profile>) => {
    setProfiles(prev => prev.map(p => {
      if (p.id === activeProfile.id) {
        return { ...p, ...updates };
      }
      return p;
    }));
  };

  const addProfile = (profileData: Omit<Profile, 'id' | 'reports'>): string => {
    const newId = `prof_${Date.now()}`;
    const colors = ['#137333', '#1976d2', '#7b1fa2', '#c2185b', '#f57c00', '#00796b'];
    const randomColor = colors[Math.floor(Math.random() * colors.length)];
    
    const newProfile: Profile = {
      ...profileData,
      id: newId,
      avatarBg: profileData.avatarBg || randomColor,
      reports: []
    };

    setProfiles(prev => [...prev, newProfile]);
    setActiveProfileIdState(newId);
    return newId;
  };

  const addReportToActiveProfile = (report: ReportItem) => {
    setProfiles(prev => prev.map(p => {
      if (p.id === activeProfile.id) {
        // Prepend report (newest first)
        const filtered = p.reports.filter(r => r.report_id !== report.report_id);
        return {
          ...p,
          reports: [report, ...filtered]
        };
      }
      return p;
    }));
  };

  const completeFirstUploadOnboarding = (basicInfo?: Partial<{ name: string; gender: 'male' | 'female' | 'other'; age: number }>) => {
    if (basicInfo && Object.keys(basicInfo).length > 0) {
      updateActiveProfile(basicInfo);
    }
    setIsFirstUploadOnboarded(true);
    localStorage.setItem('healsight_first_upload_onboarded', 'true');
  };

  return (
    <ProfileContext.Provider value={{
      profiles,
      activeProfile,
      activeProfileId,
      setActiveProfileId,
      updateActiveProfile,
      addProfile,
      addReportToActiveProfile,
      isFirstUploadOnboarded,
      completeFirstUploadOnboarding
    }}>
      {children}
    </ProfileContext.Provider>
  );
};

export const useProfile = () => {
  const context = useContext(ProfileContext);
  if (!context) {
    throw new Error('useProfile must be used within a ProfileProvider');
  }
  return context;
};
