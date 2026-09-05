# Healsight 原型系統規格說明書 (Prototype Specification)

| 文件版本 | 發布日期 | 文件狀態 | 作者 / 角色 |
| :--- | :--- | :--- | :--- |
| `v1.2.0-Prototype` | 2026-09-03 | Active | Antigravity Pair Programmer |

---

## 1. 原型概覽 (Prototype Overview)
本文件詳細定義了 **Healsight Web Prototype** 的實作規格。此原型旨在驗證「健康決策夥伴」之願景，重點在於資訊視覺化的清晰度、AI 驅動的衛教洞察力、嚴格的個人健康資料隱私保護以及可落地的健康管理行動。它作為核心使用者旅程（從 OAuth 登入、報告辨識校對、多個人檔案切換、趨勢追蹤到生活改善）的高擬真展示。

## 2. 資訊架構 (Information Architecture)

應用程式採用 **App-Shell 佈局**，具備持久性的頂部標題列 (Header) 與底部導覽列 (Bottom Navigation)。未認證訪客將自動導向至獨立登入頁面。

### 2.1 導覽與路由
- **登入頁 (`/login`)**：提供 Google, Apple, LINE, Facebook 4 大主流 OAuth 快速登入，並提供顯著的一鍵「使用展示帳號登入 (Demo Account)」按鈕，點擊後直接進入首頁。未登入狀態訪問受保護頁面將自動重定向至此。
- **首頁 (`/`)**：展示當前 Profile 之健康摘要、個人化 AI 教練卡、核心指標狀態以及上傳新健檢報告按鈕。
- **趨勢 (`/trends`)**：完整指標列表，並附帶趨勢增減指示。
- **行動 (`/actions`)**：管理生活改善微行動、就醫建議與免費篩檢福利。
- **我的 / 檔案中心 (`/profile`)**：多個人檔案管理、個人資訊編輯以及高密度水平佈局的「我的報告櫃 (Condensed Cabinet)」。
- **上傳 (`/upload`)**：每次上傳報告前免責聲明（確認同意醫療免責與健康隱私聲明）、5 階段辨識動畫，以及 OCR 後之快速校對與手動數值修改。
- **報告詳情 (`/reports/:reportId`)**：單次年度健檢報告的詳細數據拆解與免責聲明。
- **指標趨勢詳情 (`/trends/:biomarkerKey`)**：特定指標的 5 年歷史折線圖與非診斷型深度衛教解讀。

---

## 3. 核心功能與 UI 元件

### 3.1 登入與身份認證 (`/login`)
- **手機框架模擬 (App Container)**：
  - 登入頁面同樣置於 `.app-container` 內，在桌面環境下呈現一致的行動手機外框、圓角與陰影模擬，確保整體視覺與操作體驗連貫。
- **OAuth 多方登入支援**：
  - 支援 Google、Apple、LINE、Facebook 4 大社群與平台登入圖示與按鈕。
  - 點擊按鈕呼叫後端登入 API，並即時建立使用者 Session。
- **展示帳號一鍵體驗按鈕 (Demo Login Button)**：
  - 配置於 OAuth 登入清單下方，採用高對比品牌綠色漸層按鈕：`「使用展示帳號登入」`。
  - 點擊後無需任何註冊流程，直接寫入展示 Session 並無縫進入首頁 (`/`)，方便即刻體驗完整多成員健檢與 AI 洞察功能。
- **資料安全與隱私防護宣告**：
  - 底部呈現傳輸加密與醫療個人健康隱私安全說明。

### 3.2 持久化 App Shell 與右上角選單
- **頂部 Header**：
  - 左側：品牌 Logo (HeartPulse 圖示) 與深綠色 "Healsight" 文字。
  - 右側：**Profile 下拉選單 (Profile & Account Dropdown)**：
    1. **個人檔案列表 (多成員)**：列出該帳號下的所有健康個人檔案（如：Alex 本人、媽媽 等），標註年齡、關係與作用中選取狀態（Checkmark），支援一鍵即時切換。
    2. **新增檔案按鈕**：`「+ 新增個人/家庭成員檔案」`，開啟白底輸入表單彈窗。
    3. **已登入的使用者資訊**：呈現目前登入者頭像、使用者名稱（如：展示使用者、Google 使用者）、電子信箱，以及第三方 OAuth 登入來源標籤（Google / Apple / LINE / Facebook / 展示帳號）。
    4. **登出按鈕 (Log Out)**：底部提供顯著的紅色 `「登出帳號」` 按鈕，點擊後清除登入 Session 並自動重定向回 `/login` 頁面。
- **底部導覽列 (Bottom Navigation)**：
  - 4 大頁籤：**首頁** (`Home`)、**趨勢** (`TrendingUp`)、**行動** (`ClipboardList`)、**我的** (`User`)。
  - 登入頁面上自動隱藏 Header 與 Bottom Navigation。

### 3.3 我的 (檔案中心 / Profile Center - `/profile`)
- **健康隱私防護機制**：
  - 採用企業級資料加密與隱私規範，多成員個人檔案及健檢報告均具備完善的存取控管。
- **個人資訊區域**：
  - 顯示個人暱稱 (Nickname)、生理性別 (Gender)、年齡 (Age) 與身份關係標籤。
  - 支援「編輯個人資訊」互動表單，輸入框均為白底，可即時修改並保存。
- **多 Profile 切換與新增**：
  - 水平滾動卡片展示所有成員檔案（例如：Alex 本人、媽媽 等）。
  - 提供「+ 新增個人檔案」彈窗，輸入框均為白底 (`#ffffff`)，輸入暱稱、性別、年齡與關係即時建立獨立健康紀錄。
- **我的報告櫃 (Condensed Cabinet)**：
  - 採用高密度水平佈局 (Condensed Horizontal Layout)。
  - 每列直觀呈現年份縮寫大字 (如 '25')、報告標題、健檢機構與檢驗日期。
  - 右側標註「X 異常」(紅色 Badge) 與「Y 正常」(綠/灰 Badge)，點擊直達該份報告詳情。
  - 底部配置「+ 上傳新健檢報告」主按鈕。

### 3.4 每次上傳報告前免責聲明 (Mandatory Disclaimer Gate Before Every Upload)
- 使用者每次點擊上傳或進入 `/upload` 流程前，系統強制展示「上傳報告免責聲明」閘道：
  1. **醫療免責聲明**：明示系統僅提供衛教與生活型態參考，非臨床醫療診斷；異常需由合格醫師診斷。
  2. **健康資料隱私保護**：所有健檢數值與個人健康紀錄均受嚴格隱私權條款與傳輸加密規範，絕不用於未經授權之第三方行銷或非衛教用途。
  3. **授權核取方塊**：「我已詳閱並充分理解上述醫療免責聲明與個人健康隱私政策，同意進行本次報告上傳。」
  - 勾選同意後方可解鎖檔案拖曳與相機拍照上傳流程。每次重新上傳皆需再次確認。
- **輸入元件與核取方塊樣式規範**：「新增個人檔案」、免責聲明核取方塊 (`#disclaimer-check`) 與全站表單/彈窗之輸入框（`<input>`、`<select>`、`<textarea>`）全數設定 `color-scheme: light !important` 並規範純白底色 (`#ffffff`)，杜絕深色主題下核取方塊底色反黑問題，確保視覺清爽與高對比易讀性。

### 3.5 OCR 後快速校對與手動修改數值 (Calibration & Manual Editing)
- 模擬 5 階段（上傳 > 辨識 > 對照 > 整合 > 洞察）動畫完成後，進入**校對模式 (Review Stage)**，而非直接跳轉：
  - **健檢日期輸入**：支援手動輸入或使用日期選擇器修改實際健檢日期 (`checkup_date`)。
  - **健檢機構輸入**：支援填寫或修改檢驗單位名稱 (`institution_name`)。
  - **指標快速校對列表**：列出辨識出之指標名稱、參考區間，並提供各指標數值的 `<input>` 輸入框。
  - **動態狀態評估**：使用者修改數值時，系統即時重新計算並更新狀態標籤（正常 / 須留意 / 明顯異常）。
  - **確認儲存**：點擊「確認無誤並儲存報告」將自動生成新報告紀錄，儲存至當前 Profile 的報告櫃，並導向報告詳情頁。

### 3.6 AI 指標說明非診斷化與免責聲明 (Non-diagnostic AI & Disclaimers)
- **避免診斷用語**：
  - 嚴格禁用「用來診斷某疾病」、「代表器官受損病變」等確定性醫學診斷詞彙。
  - 轉譯為生活型態與代謝機能詞彙（如：「評估血糖代謝狀態與胰島素機能平衡之參考指標」、「反映近期身體作息與代謝負荷」）。
- **強制醫療免責聲明**：
  - 在首頁 AI 教練卡下方標註衛教免責條款。
  - 在指標趨勢詳情 (`TrendDetail`) 之「AI 白話解讀」區塊下方，配置高可見度警示外框，標註：
    > ⚠️ **醫療免責聲明**：本 AI 指標說明係依據衛福部國民健康署衛教手冊生成之生活促進指引，僅供日常健康管理參考，絕不構成任何臨床醫療診斷、處方或治療依據。若指標異常或身體不適，請務必諮詢專業醫師。
  - 報告詳情頁底部亦常駐免責提醒。

### 3.7 整合式 AI 教練卡片 (Dashboard)
- 依據當前選取之 Profile 顯示專屬稱謂與健康摘要。
- 顯示異常指標數量與教練式白話建議，支援展開全文與免責提醒。
- 微行動進度條與下一步任務即時提醒。

### 3.8 核心指標狀態 (Core Markers)
- 依嚴重程度排序（明顯異常 > 須留意 > 正常）。
- 即時連動當前 Profile 最新報告之生理數值。

### 3.9 行動中心 (Action Hub / Actions Page)
- **日常改善微行動**：
  - 微行動定義與儲存由伺服器資料庫維護（依 `profileId` 關聯）。
  - 使用者每週各項微行動的完成勾選狀態由前端本機儲存 (`healsight_weekly_action_completions`) 獨立追蹤，支援多成員獨立勾選與即時每週進度計算。
- **就醫與複檢建議**：呈現追蹤科別、建議時程與就醫叮嚀。
- **年度健檢排程 (加入行事曆)**：系統**不發送主動推播通知**打擾使用者，改為提供「點選加入行事曆」按鈕，產生標準 `.ics` 檔案供使用者直接加入 Google / Apple / Outlook 行事曆。
- **你可用的免費篩檢**：年齡與資格規則比對（如成人健檢、BC肝篩檢）。
- **衛教免責提示**：常駐日常保健非醫療處方之宣告。

---

## 4. UI/UX 視覺規範

### 4.1 視覺識別 (Visual Identity)
- **品牌主色**：深綠色 (`#137333`)。
- **異常標示 (Critical)**：紅色 (`#d93025`)。
- **留意標示 (Warning)**：琥珀/橘色 (`#f9ab00`)。
- **表面顏色**：AI 洞察卡片採用柔和綠色漸層，內容卡片純白，桌面版背景採用淺黑/深灰 App-Shell 襯底。

### 4.2 字體排版 (Typography)
- **字體系列**：Inter, system-ui, -apple-system, sans-serif。
- **層級設定**：標題使用粗體 (#111827)，高對比度確保年長與各族群易讀性。

### 4.3 佈局與互動
- **行動優先 (Mobile-First)**：桌面版居中限制於 `480px` 容器內；行動版全螢幕適配。
- **互動回饋**：個人檔案切換即時連動、校對即時重新計算區間、全域 Toast 提示。

---

## 5. 正式 Production 資料存放與技術規格 (Data Storage & Architecture Specification)

系統採用清晰的客戶端與伺服器端資料劃分標準：

### 5.1 伺服器資料庫 (Server Database)
生產環境伺服器資料庫集中持久化管理下列使用者與機敏健康資料：
1. **使用者 OAuth 登入資訊** (`users`)：使用者唯一識別碼、第三方 OAuth 提供者 (`google` / `apple` / `line` / `facebook` / `demo`)、Email、名稱、頭像。
2. **個人檔案 (Profiles)**：支援多個人/家庭成員檔案 (`profiles`)，每個使用者可建立並關聯多個 Profile（如：本人、母親、父親、伴侶）。
3. **歷年健檢指標紀錄** (`reports`, `biomarker_records`)：各年度之健檢日期、檢驗單位、各指標數值、單位、參考區間與異常狀態標記。
4. **AI 健康趨勢洞察** (`trend_insights`)：AI 教練依據歷年連續數據生成之綜合健康總結。
5. **指標 AI 白話解釋** (`biomarker_explanations`)：依衛福部指引產生之非診斷型成因釋義與生活改善導引。
6. **已儲存的日常改善微行動** (`saved_actions`)：使用者為各 Profile 收藏與建立之微行動清單。

### 5.2 瀏覽器儲存 (LocalStorage / IndexedDB)
瀏覽器端僅負責快取輕量設定與每週即時互動狀態：
1. **Storage Schema 版本控制** (`healsight_storage_version`)：追蹤客戶端儲存格式版本（基準版本為 `1`），負責漸進式版本遷移。
2. **已登入的使用者資訊** (`healsight_auth_user`)：保存當前登入者之 Session、使用者 Token 與基本識別。
3. **每週完成的「日常改善微行動」狀態** (`healsight_weekly_action_completions`)：
   - 依照 `[profileId][actionId] = boolean` 鍵值結構存取每週打卡核取狀態，與不同成員隔離。

### 5.3 後端 RESTful API 規格 (API Specifications)

前端透過統一 API 介面與後端通訊：

#### 認證 (Auth)
- `POST /api/v1/auth/login`：以 OAuth 提供者或展示帳號登入，回傳 `user` 與 `token`。
- `GET /api/v1/auth/me`：獲取當前認證使用者資料。
- `POST /api/v1/auth/logout`：登出當前帳號。

#### 個人檔案 (Profiles)
- `GET /api/v1/profiles`：取得登入使用者名下的所有個人/家庭成員檔案清單。
- `POST /api/v1/profiles`：新增成員個人檔案（姓名、性別、年齡、關係、頭像底色）。
- `GET /api/v1/profiles/:id`：取得特定個人檔案詳細資料。
- `PUT /api/v1/profiles/:id`：修改特定成員基本資訊。
- `DELETE /api/v1/profiles/:id`：刪除成員檔案。

#### 健檢報告與指標 (Reports & Biomarkers)
- `GET /api/v1/profiles/:profileId/reports`：取得該成員歷年健檢報告。
- `POST /api/v1/profiles/:profileId/reports`：新增健檢報告至該成員。
- `GET /api/v1/reports/:id`：獲取指定單份報告完整指標數據。
- `POST /api/v1/reports/upload`：上傳影像並模擬 OCR 擷取。
- `GET /api/v1/biomarkers/trends`：獲取特定指標跨年度歷史折線數據。
- `POST /api/v1/insights/generate`：獲取 AI 白話指標解釋與衛教洞察。

#### 日常改善微行動 (Micro-Actions)
- `GET /api/v1/profiles/:profileId/actions`：取得該成員已儲存的日常改善微行動清單。
- `POST /api/v1/profiles/:profileId/actions`：為該成員新增或收藏微行動項目。
- `DELETE /api/v1/profiles/:profileId/actions/:actionId`：自成員微行動庫中移除項目。
