const express = require('express');
const cors = require('cors');
const compression = require('compression');
const bodyParser = require('body-parser');
const fs = require('fs');
const path = require('path');

const app = express();
const port = 3001;

app.use(compression());
app.use(cors());
app.use(bodyParser.json());

const readJsonFile = (filename) => {
  const filePath = path.join(__dirname, 'data', filename);
  return JSON.parse(fs.readFileSync(filePath, 'utf8'));
};

// Initial Mock Database State
const DEMO_USER = {
  id: 'usr_demo',
  name: '展示使用者',
  email: 'demo@healsight.health',
  provider: 'demo',
  avatar: '👤'
};

let currentUser = DEMO_USER;

// Load initial reports for Alex from reports.json
let initialAlexReports = [];
try {
  const reportsData = readJsonFile('reports.json');
  initialAlexReports = reportsData.reports || [];
} catch (e) {
  console.error('Could not load reports.json', e);
}

// In-Memory Database for Profiles
let profiles = [
  {
    id: 'prof_alex',
    userId: 'usr_demo',
    name: 'Alex',
    gender: 'male',
    age: 33,
    relationship: '本人',
    avatarBg: '#137333',
    reports: initialAlexReports
  },
  {
    id: 'prof_mom',
    userId: 'usr_demo',
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

// In-Memory Database for Saved Micro-Actions
let profileActions = {
  'prof_alex': [
    {
      id: 'act_01',
      profileId: 'prof_alex',
      biomarkerKey: 'LIFESTYLE',
      title: '手搖飲本週改為無糖或微糖',
      categoryLabel: '飲食',
      category: 'DIET'
    },
    {
      id: 'act_02',
      profileId: 'prof_alex',
      biomarkerKey: 'LIFESTYLE',
      title: '每日增加 500cc 溫開水攝取',
      categoryLabel: '生活',
      category: 'LIFESTYLE'
    }
  ],
  'prof_mom': [
    {
      id: 'act_mom_01',
      profileId: 'prof_mom',
      biomarkerKey: 'HBA1C',
      title: '每日餐後散步 15 分鐘',
      categoryLabel: '運動',
      category: 'EXERCISE'
    }
  ]
};

// -------------------------------------------------------------
// Auth Routes
// -------------------------------------------------------------
app.post('/api/v1/auth/login', (req, res) => {
  const { provider = 'demo', email, name, avatar } = req.body;
  console.log(`POST auth/login: provider=${provider}`);

  if (provider === 'demo') {
    currentUser = { ...DEMO_USER };
  } else {
    currentUser = {
      id: `usr_${provider}_${Date.now()}`,
      name: name || `${provider.toUpperCase()} 使用者`,
      email: email || `${provider}_user@example.com`,
      provider,
      avatar: avatar || '👤'
    };
  }

  res.json({
    code: 200,
    message: 'Login successful',
    data: {
      user: currentUser,
      token: `mock-token-${currentUser.provider}-${Date.now()}`
    }
  });
});

app.get('/api/v1/auth/me', (req, res) => {
  res.json({
    code: 200,
    data: {
      user: currentUser
    }
  });
});

app.post('/api/v1/auth/logout', (req, res) => {
  currentUser = null;
  res.json({
    code: 200,
    message: 'Logged out successfully'
  });
});

// -------------------------------------------------------------
// Profile Routes
// -------------------------------------------------------------
app.get('/api/v1/profiles', (req, res) => {
  res.json({ code: 200, data: profiles });
});

app.post('/api/v1/profiles', (req, res) => {
  const { name, gender = 'female', age = 30, relationship = '家人', avatarBg } = req.body;
  const newProfile = {
    id: `prof_${Date.now()}`,
    userId: currentUser ? currentUser.id : 'usr_demo',
    name,
    gender,
    age: Number(age),
    relationship,
    avatarBg: avatarBg || (gender === 'female' ? '#d81b60' : '#1976d2'),
    reports: []
  };
  profiles.push(newProfile);
  res.status(201).json({ code: 201, data: newProfile });
});

app.get('/api/v1/profiles/:id', (req, res) => {
  const profile = profiles.find(p => p.id === req.params.id);
  if (!profile) {
    return res.status(404).json({ code: 404, message: 'Profile not found' });
  }
  res.json({ code: 200, data: profile });
});

app.put('/api/v1/profiles/:id', (req, res) => {
  const index = profiles.findIndex(p => p.id === req.params.id);
  if (index === -1) {
    return res.status(404).json({ code: 404, message: 'Profile not found' });
  }
  profiles[index] = { ...profiles[index], ...req.body };
  res.json({ code: 200, data: profiles[index] });
});

app.delete('/api/v1/profiles/:id', (req, res) => {
  profiles = profiles.filter(p => p.id !== req.params.id);
  delete profileActions[req.params.id];
  res.json({ code: 200, message: 'Profile deleted successfully' });
});

// -------------------------------------------------------------
// Report Routes
// -------------------------------------------------------------
app.get('/api/v1/profiles/:profileId/reports', (req, res) => {
  const profile = profiles.find(p => p.id === req.params.profileId);
  if (!profile) {
    return res.status(404).json({ code: 404, message: 'Profile not found' });
  }
  res.json({ code: 200, data: profile.reports || [] });
});

app.post('/api/v1/profiles/:profileId/reports', (req, res) => {
  const profile = profiles.find(p => p.id === req.params.profileId);
  if (!profile) {
    return res.status(404).json({ code: 404, message: 'Profile not found' });
  }
  const report = req.body;
  profile.reports.unshift(report);
  res.status(201).json({ code: 201, data: report });
});

app.get('/api/v1/reports/:id', (req, res) => {
  for (const p of profiles) {
    const found = p.reports.find(r => r.report_id === req.params.id);
    if (found) {
      return res.json({ code: 200, data: found });
    }
  }
  const reportsData = readJsonFile('reports.json');
  const report = reportsData.reports.find(r => r.report_id === req.params.id);
  if (!report) {
    return res.status(404).json({ code: 404, message: "Report not found" });
  }
  res.json({ code: 200, data: report });
});

app.post('/api/v1/reports/upload', (req, res) => {
  setTimeout(() => {
    const reportsData = readJsonFile('reports.json');
    res.json({
      code: 200,
      message: "Report processed successfully",
      data: reportsData.reports[0]
    });
  }, 300);
});

// -------------------------------------------------------------
// Biomarker Trends & Insights
// -------------------------------------------------------------
app.get('/api/v1/biomarkers/trends', (req, res) => {
  const { biomarker_key, profile_id } = req.query;
  const trendsData = readJsonFile('trends.json');
  const data = trendsData.trends[biomarker_key] || [];
  
  res.json({
    code: 200,
    data: {
      biomarker_key,
      display_name: biomarker_key,
      unit: "U/L",
      reference_min: 0,
      reference_max: 40,
      trend_points: data
    }
  });
});

app.post('/api/v1/insights/generate', (req, res) => {
  const { biomarker_key } = req.body;
  const insightsData = readJsonFile('insights.json');
  const insight = insightsData.insights[biomarker_key] || {
    plain_text_summary: "尚無此指標之解讀資訊。",
    risk_level_explanation: "未知",
    actionable_guidelines: [],
    disclaimer: "本內容僅供參考。"
  };

  res.json({ code: 200, data: insight });
});

// -------------------------------------------------------------
// Profile Micro-Actions Routes (Stored in Server DB)
// -------------------------------------------------------------
app.get('/api/v1/profiles/:profileId/actions', (req, res) => {
  const actions = profileActions[req.params.profileId] || [];
  res.json({ code: 200, data: actions });
});

app.post('/api/v1/profiles/:profileId/actions', (req, res) => {
  const { id = `act_${Date.now()}`, biomarkerKey = 'LIFESTYLE', title, categoryLabel = '生活', category = 'LIFESTYLE', description } = req.body;
  const action = {
    id,
    profileId: req.params.profileId,
    biomarkerKey,
    title,
    categoryLabel,
    category,
    description
  };
  if (!profileActions[req.params.profileId]) {
    profileActions[req.params.profileId] = [];
  }
  // Replace if exists, else push
  const existingIdx = profileActions[req.params.profileId].findIndex(a => a.id === id);
  if (existingIdx !== -1) {
    profileActions[req.params.profileId][existingIdx] = action;
  } else {
    profileActions[req.params.profileId].push(action);
  }
  res.status(201).json({ code: 201, data: action });
});

app.delete('/api/v1/profiles/:profileId/actions/:actionId', (req, res) => {
  if (profileActions[req.params.profileId]) {
    profileActions[req.params.profileId] = profileActions[req.params.profileId].filter(a => a.id !== req.params.actionId);
  }
  res.json({ code: 200, message: 'Action removed successfully' });
});

// Static files and Catch-all
app.use(express.static(path.join(__dirname, '../frontend/dist')));

app.use((req, res) => {
  res.sendFile(path.join(__dirname, '../frontend/dist/index.html'));
});

if (require.main === module) {
  app.listen(port, () => {
    console.log(`Unified HealSight server running at http://localhost:${port}`);
  });
}

module.exports = app;
