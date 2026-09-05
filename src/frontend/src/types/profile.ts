export interface BiomarkerRecord {
  biomarker_key: string;
  display_name: string;
  numerical_value: number;
  unit: string;
  reference_range: string;
  status_flag: 'NORMAL' | 'WARNING' | 'CRITICAL';
}

export interface ReportItem {
  report_id: string;
  checkup_date: string;
  institution_name: string;
  total_biomarkers_found: number;
  abnormal_count: number;
  records: BiomarkerRecord[];
}

export interface Profile {
  id: string;
  name: string;
  gender: 'male' | 'female' | 'other';
  age: number;
  relationship: string;
  avatarBg: string;
  reports: ReportItem[];
}

export interface ProfileContextType {
  profiles: Profile[];
  activeProfile: Profile;
  activeProfileId: string;
  setActiveProfileId: (id: string) => void;
  updateActiveProfile: (updates: Partial<Profile>) => void;
  addProfile: (profile: Omit<Profile, 'id' | 'reports'>) => string;
  addReportToActiveProfile: (report: ReportItem) => void;
  isFirstUploadOnboarded: boolean;
  completeFirstUploadOnboarding: (basicInfo?: Partial<{ name: string; gender: 'male' | 'female' | 'other'; age: number }>) => void;
}
