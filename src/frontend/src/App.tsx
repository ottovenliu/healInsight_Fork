import { BrowserRouter as Router, Routes, Route, NavLink, Navigate, useLocation } from 'react-router-dom';
import { Home, TrendingUp, ClipboardList, User, HeartPulse, Sparkles } from 'lucide-react';
import Dashboard from './pages/Dashboard';
import UploadPage from './pages/UploadPage';
import ReportDetail from './pages/ReportDetail';
import TrendDetail from './pages/TrendDetail';
import Trends from './pages/Trends';
import Actions from './pages/Actions';
import ProfilePage from './pages/Profile';
import Login from './pages/Login';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ProfileProvider } from './context/ProfileContext';
import { ProfileDropdown } from './components/ProfileDropdown';
import './App.css';

const Header = () => (
  <header className="app-header">
    <div className="logo-container">
      <div className="logo-icon-wrapper">
        <div className="logo-icon">
          <HeartPulse size={16} color="white" strokeWidth={3} />
        </div>
        <Sparkles size={10} className="logo-sparkle" fill="#ffd700" color="#ffd700" />
      </div>
      <span className="logo-text">Healsight</span>
    </div>
    <div style={{ marginLeft: 'auto' }}>
      <ProfileDropdown />
    </div>
  </header>
);

const BottomNav = () => (
  <nav className="bottom-nav">
    <NavLink to="/" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
      <Home size={22} />
      <span>首頁</span>
    </NavLink>
    <NavLink to="/trends" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
      <TrendingUp size={22} />
      <span>趨勢</span>
    </NavLink>
    <NavLink to="/actions" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
      <ClipboardList size={22} />
      <span>行動</span>
    </NavLink>
    <NavLink to="/profile" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
      <User size={22} />
      <span>我的</span>
    </NavLink>
  </nav>
);

const AppRoutes = () => {
  const { isAuthenticated } = useAuth();
  const location = useLocation();

  if (location.pathname === '/login') {
    return (
      <div className="app-container">
        <Routes>
          <Route path="/login" element={isAuthenticated ? <Navigate to="/" replace /> : <Login />} />
          <Route path="*" element={<Navigate to={isAuthenticated ? "/" : "/login"} replace />} />
        </Routes>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return (
    <div className="app-container">
      <Header />
      <main className="main-content">
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/trends" element={<Trends />} />
          <Route path="/upload" element={<UploadPage />} />
          <Route path="/actions" element={<Actions />} />
          <Route path="/profile" element={<ProfilePage />} />
          <Route path="/reports/:reportId" element={<ReportDetail />} />
          <Route path="/trends/:biomarkerKey" element={<TrendDetail />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>
      <BottomNav />
    </div>
  );
};

function App() {
  return (
    <Router>
      <AuthProvider>
        <ProfileProvider>
          <AppRoutes />
        </ProfileProvider>
      </AuthProvider>
    </Router>
  );
}

export default App;
