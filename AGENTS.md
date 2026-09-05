# Agent Development Guide (AGENTS.md)

This document provides technical context for AI agents working on the Healsight project.

## Project Overview
Healsight is a health data visualization and lifestyle action platform. It uses a decoupled architecture with a React frontend and a Node.js mock backend.

## Architecture & Data Flow

- **Frontend (`src/frontend`)**: 
  - Entry point: `src/main.tsx`
  - Routes: Defined in `src/App.tsx` using `react-router-dom`:
    - 登入頁: `/login` (OAuth + Demo account)
    - 4 大頁籤: 首頁 `/`, 趨勢 `/trends`, 行動 `/actions`, 我的 `/profile`
    - 子頁面: 上傳 `/upload`, 報告詳情 `/reports/:reportId`, 指標趨勢詳情 `/trends/:biomarkerKey`
  - State Management: Uses React Context (`AuthContext`, `ProfileContext`) and clean storage partitioning.
  - API Communication: Communicates with backend endpoints via `src/frontend/src/services/api.ts` (Port 3001 in dev).
- **Backend (`src/backend`)**:
  - Entry point: `index.js`
  - RESTful APIs for Auth, Profiles, Reports, Biomarker Trends, AI Insights, and Micro-Actions.
  - Middleware: CORS, compression, body-parser.

## Production Data Partitioning Standard (正式 Production 資料存放規格)

- **伺服器資料庫 (Server Database)**:
  1. 使用者 OAuth 登入資訊 (`users`)：第三方平台授權 ID、提供者 (Google, Apple, LINE, Facebook, Demo)、Email、名稱、頭像。
  2. 個人檔案 (`profiles`)：支援單一使用者關聯多個個人/家庭成員檔案（本人、父母、伴侶等）。
  3. 歷年健檢指標紀錄 (`reports`, `biomarker_records`)：各年度之健檢日期、檢驗機構、數值、單位、參考區間與異常標籤。
  4. AI 健康趨勢洞察 (`trend_insights`)：由 AI 教練彙整跨年度數據生成之綜合健康分析。
  5. 指標 AI 白話解釋 (`biomarker_explanations`)：衛福部指引轉譯之生活型態成因與非診斷型衛教解讀。
  6. 已儲存的日常改善微行動 (`saved_actions`)：使用者為各成員建立或收藏的健康改善微行動。
- **瀏覽器 localStorage / IndexedDB (Client Storage)**:
  1. Storage Scheme 版本控制 (`healsight_storage_version`)：追蹤客戶端架構版本（基準版本 `1`），執行漸進式遷移。
  2. 已登入的使用者資訊 (`healsight_auth_user`)：保存當前登入者之 Session、權限 Token 與使用者識別。
  3. 每週完成的「日常改善微行動」狀態 (`healsight_weekly_action_completions`)：
     - 採 `[profileId][actionId] = boolean` 鍵值結構存取每週打卡核取狀態，各成員獨立隔離。

## Directory Structure

```text
healsight/
├── README.md               # User documentation
├── AGENTS.md               # AI Agent documentation (this file)
├── .agent/                 # Specifications and design docs
│   ├── spec.md             # Full product and system specification
│   └── spec_prototype.md   # Prototype system specification
└── src/
    ├── backend/            # Express mock server
    │   ├── data/           # Mock JSON data (reports, trends, insights)
    │   ├── test/           # Backend automated test suite (node:test)
    │   └── index.js        # Server entry point & REST APIs
    └── frontend/           # React/Vite/TS application
        ├── src/            # Application source code
        │   ├── assets/     # Static assets (images, icons)
        │   ├── components/ # Shared UI components (ProfileDropdown, etc.)
        │   ├── context/    # React Context (AuthContext, ProfileContext)
        │   ├── pages/      # Page-level components (Login, Dashboard, Trends, Actions, Profile, UploadPage, ReportDetail, TrendDetail)
        │   ├── services/   # Frontend API client (api.ts)
        │   ├── types/      # TypeScript interfaces and types (auth, profile)
        │   ├── utils/      # Storage utilities (authStorage, weeklyActionStorage, storageMigration)
        │   ├── __tests__/  # Frontend automated test suite (Vitest)
        │   └── App.tsx     # Root component, auth routing & navigation
        └── index.html      # HTML template
```

## Development Workflow

### Commands
| Command | Location | Description |
| :--- | :--- | :--- |
| `node index.js` | `src/backend` | Starts the mock API server on port 3001. |
| `npm test` | `src/backend` | Runs native backend automated test suite (`node --test`). |
| `npm run dev` | `src/frontend` | Starts the Vite dev server. |
| `npm test` | `src/frontend` | Runs frontend unit test suite (`vitest run`). |
| `npm run build` | `src/frontend` | Compiles TS and builds the production bundle. |
| `npm run lint` | `src/frontend` | Runs `oxlint` for code quality checks. |

### Coding Standards
- **TypeScript**: Strict type checking is preferred. Avoid `any`. Use type-only imports when importing types.
- **Styling**: Use Vanilla CSS with variables defined in `index.css`. Follow the mobile-first approach (max-width: 480px for the app shell on desktop).
- **React**: Use functional components and hooks. React 19 features are supported.
- **Icons**: Use `lucide-react`.

## Key Design Specs
Reference `.agent/spec_prototype.md` for visual identity (colors, fonts) and core feature requirements.
- **Primary Green**: `#137333`
- **Critical Red**: `#d93025`
- **Warning Amber**: `#f9ab00`

## Implementation Details
- **OAuth 快速登入與展示帳號一鍵體驗 (`/login`)**:
  - 提供 Google, Apple, LINE, Facebook 4 大主流社群登入圖示與按鈕。
  - 顯著的「使用展示帳號登入」綠色漸層按鈕，點擊後免註冊即可一鍵進入首頁體驗完整健康管理功能。
  - 未認證訪客訪問受保護路由時，將自動重定向至 `/login`；在 `/login` 頁面自動隱藏 Header 與 Bottom Navigation。
  - 登入頁面同樣採用 `.app-container` 手機外框容器，確保在桌面與行動環境具備一致的手機框架模擬視覺。
- **主畫面右上角帳號與個人檔案選單 (Profile & User Dropdown)**:
  - 展開後垂直清晰呈現架構：
    1. **個人檔案列表 (多成員)**：列出該帳號下的所有成員個人檔案（如：Alex、媽媽 等），標註年齡、關係與作用中勾選狀態（Checkmark），支援一鍵切換。
    2. **新增成員按鈕**：「+ 新增個人/家庭成員檔案」白底輸入彈窗。
    3. **已登入的使用者資訊**：呈現目前登入者頭像、使用者名稱、電子信箱與 OAuth 來源標籤（Google / Apple / LINE / Facebook / 展示帳號）。
    4. **登出按鈕**：「登出帳號」按鈕（清除 Session 並重定向回 `/login`）。
- **後端 RESTful API 規格**:
  - **Auth**: `POST /api/v1/auth/login`, `GET /api/v1/auth/me`, `POST /api/v1/auth/logout`
  - **Profiles**: `GET /api/v1/profiles`, `POST /api/v1/profiles`, `PUT /api/v1/profiles/:id`, `DELETE /api/v1/profiles/:id`
  - **Reports & Biomarkers**: `GET /api/v1/profiles/:profileId/reports`, `POST /api/v1/profiles/:profileId/reports`, `GET /api/v1/reports/:id`, `POST /api/v1/reports/upload`, `GET /api/v1/biomarkers/trends`, `POST /api/v1/insights/generate`
  - **Micro-Actions**: `GET /api/v1/profiles/:profileId/actions`, `POST /api/v1/profiles/:profileId/actions`, `DELETE /api/v1/profiles/:profileId/actions/:actionId`
- **Bottom Navigation**: 4-tab App Shell layout:
  1. 首頁 (Dashboard, `/`)
  2. 趨勢 (Trends, `/trends`)
  3. 行動 (Action Hub, `/actions`)
  4. 我的 (Profile / 檔案中心, `/profile`)
- **檔案中心 (我的 / Profile Page)**:
  - **個人資訊區域**: Displays nickname, biological gender, and age with inline editing capabilities.
  - **我的報告櫃 (Condensed Cabinet)**: High-density horizontal layout intuitively presenting annual checkup reports, institutions, dates, and normal/abnormal badge counts.
- **Mandatory Disclaimer Before Every Upload (每次上傳報告前免責聲明)**:
  - Before uploading any health report, users must view and agree to the comprehensive medical disclaimer and personal health privacy terms (每次上傳報告前皆須確認同意). The gate focuses strictly on disclaimer consent. Basic profile information (nickname, gender, age) is managed independently in the Profile page (我的).
- **Form Input & Checkbox White Background Standard (輸入元件與核取方塊純白底色規範)**:
  - All input fields, selects, textareas, and checkboxes across "新增個人檔案" (Add Profile modal), inline profile editors, disclaimer checks, and calibration screens are styled with `color-scheme: light !important` and explicit white background (`#ffffff`) for optimal contrast and clean readability, preventing native dark-mode inversion on dark OS/browser themes.
- **Calendar Integration for Annual Health Checkup (年度健檢預約排程加入行事曆)**:
  - System does not send proactive push reminders or intrusive alerts.
  - Instead, provides a user-initiated "點選加入行事曆" action button in the Action Hub (`/actions`) that generates and downloads an `.ics` calendar event file (`healsight_checkup_2026.ics`) for Google Calendar, Apple Calendar, and Outlook.
- **OCR Calibration & Manual Editing**:
  - Post-OCR processing does not instantly redirect; instead, it presents a verification screen allowing users to calibrate/edit numerical values, adjust the checkup date (`健檢日期`), and specify the health checkup institution.
  - Status flags (`NORMAL`, `WARNING`, `CRITICAL`) update in real time as values are modified.
- **AI Metric Explanation & Non-diagnostic Policy**:
  - All AI explanations avoid diagnostic terminology (e.g. framing indicators around metabolic load and lifestyle factors rather than definitive clinical diagnoses).
  - Prominent medical disclaimers are rendered alongside all AI-generated insights across Dashboard, TrendDetail, and ReportDetail views.
- **LocalStorage Version Control & Migration Mechanism (LocalStorage 版本管控與遷移機制)**:
  - Centralized schema versioning managed via `src/frontend/src/utils/storageMigration.ts` with `healsight_storage_version` (baseline: `CURRENT_STORAGE_VERSION = 1`).
  - Executed at client initialization (`src/main.tsx`) before the React component tree mounts.
  - **Unversioned Clear Rule (未含版本自動清空機制)**: If `healsight_storage_version` is absent or invalid, the system automatically clears all existing `localStorage` data and initializes the schema version, ensuring no legacy or corrupted schema conflicts.
  - **Sequential Migrations (漸進式遷移)**: When `storedVersion < CURRENT_STORAGE_VERSION`, registered migrations are sequentially invoked in ascending order, progressively persisting each migration step.
- **Profile-Driven Biomarker Trends (指標趨勢與歷史數據多檔案連動)**:
  - The Trends page (`/trends`) and TrendDetail page (`/trends/:biomarkerKey`) dynamically derive records and historical trend curves directly from the active profile's checkup reports (`activeProfile.reports`).
  - Switching between different family members (e.g., Alex vs. 媽媽) immediately refreshes the biomarker list, severity sorting, history counts, reference ranges, and trend charts.
  - Profiles with no checkup reports gracefully present an empty-state card with an upload action button.
- **Empty Checkup State & Upload Guidance (無檢驗紀錄之引導狀態規範)**:
  - When an active profile has no uploaded checkup records (`activeProfile.reports.length === 0`):
  - **首頁「AI 健康趨勢洞察」與「下一步該做什麼」**: 抑制報告分析與假數據進度條，顯示對應的引導文案（提示為當前成員建立第一份報告以啟動 AI 分析與個人化指引），並提供顯著的「立即拍照或上傳檢驗紀錄」行動按鈕。
  - **行動指南頁「下一步該做什麼」(`/actions`)**: 隱藏基於特定異常項目的就醫複檢與固定日程排程，轉為呈現上傳引導卡片，讓使用者快速進入拍照上傳流程，同時保留常態性之公費篩檢資格。
