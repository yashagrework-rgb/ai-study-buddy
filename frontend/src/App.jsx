import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Link, Navigate, useNavigate, useLocation } from 'react-router-dom';
import { 
  BookOpen, 
  MessageSquareCode, 
  BrainCircuit, 
  BarChart3, 
  User as UserIcon, 
  LogOut, 
  LayoutDashboard, 
  GraduationCap, 
  Menu, 
  X,
  Sparkles,
  ChevronRight
} from 'lucide-react';

// Import Pages
import LandingPage from './pages/LandingPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import Dashboard from './pages/Dashboard';
import NotesPage from './pages/NotesPage';
import ChatPage from './pages/ChatPage';
import QuizPage from './pages/QuizPage';
import ResultsPage from './pages/ResultsPage';
import ProfilePage from './pages/ProfilePage';

// Protected Route Component
const ProtectedRoute = ({ children }) => {
  const user = localStorage.getItem('user');
  if (!user) {
    return <Navigate to="/login" replace />;
  }
  return children;
};

// Public Route (Redirects to dashboard if logged in)
const PublicRoute = ({ children }) => {
  const user = localStorage.getItem('user');
  if (user) {
    return <Navigate to="/dashboard" replace />;
  }
  return children;
};

// Layout for Authenticated Pages
const AppLayout = ({ children, user, onLogout }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const location = useLocation();

  const navigation = [
    { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
    { name: 'Notes', href: '/notes', icon: BookOpen },
    { name: 'AI Study Chat', href: '/chat', icon: MessageSquareCode },
    { name: 'Generate Quiz', href: '/quiz', icon: BrainCircuit },
    { name: 'Quiz Results', href: '/results', icon: BarChart3 },
    { name: 'Profile', href: '/profile', icon: UserIcon },
  ];

  return (
    <div className="min-h-screen bg-dark-950 flex flex-col md:flex-row">
      {/* Mobile Header */}
      <header className="md:hidden flex items-center justify-between px-6 py-4 glass-panel border-b border-white/5 z-20">
        <div className="flex items-center gap-2">
          <GraduationCap className="h-7 w-7 text-primary-400" />
          <span className="font-bold text-xl tracking-tight text-glow text-white">StudyBuddy</span>
        </div>
        <button onClick={() => setSidebarOpen(!sidebarOpen)} className="p-1 rounded-md text-slate-400 hover:text-white">
          {sidebarOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>
      </header>

      {/* Sidebar Navigation */}
      <aside className={`
        fixed inset-y-0 left-0 w-64 glass-panel border-r border-white/5 flex flex-col justify-between z-30 transition-transform duration-300 transform
        md:translate-x-0 md:static md:h-screen
        ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>
        <div>
          {/* Sidebar Brand Logo */}
          <div className="hidden md:flex items-center gap-3 px-6 py-8">
            <div className="p-2 bg-primary-500/10 rounded-xl border border-primary-500/20 shadow-glass-sm">
              <GraduationCap className="h-8 w-8 text-primary-400" />
            </div>
            <div>
              <span className="font-bold text-xl tracking-tight text-white block">StudyBuddy</span>
              <span className="text-xs text-primary-400 flex items-center gap-1 font-semibold">
                <Sparkles className="h-3 w-3" /> AI Co-pilot
              </span>
            </div>
          </div>

          {/* User Preview */}
          <div className="px-4 mb-6 md:mt-2">
            <div className="p-4 rounded-xl bg-white/[0.02] border border-white/5 flex items-center gap-3">
              <div className="h-10 w-10 rounded-full bg-gradient-to-tr from-primary-600 to-indigo-600 flex items-center justify-center font-bold text-white shadow-md">
                {user?.name ? user.name.charAt(0).toUpperCase() : 'U'}
              </div>
              <div className="overflow-hidden">
                <h4 className="font-medium text-sm text-slate-100 truncate">{user?.name || 'Student'}</h4>
                <p className="text-xs text-slate-400 truncate">{user?.email || 'student@study.edu'}</p>
              </div>
            </div>
          </div>

          {/* Navigation Links */}
          <nav className="px-3 space-y-1">
            {navigation.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.href;
              return (
                <Link
                  key={item.name}
                  to={item.href}
                  onClick={() => setSidebarOpen(false)}
                  className={`
                    flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200
                    ${isActive 
                      ? 'bg-primary-600 text-white shadow-lg shadow-primary-600/15 border-l-4 border-primary-400' 
                      : 'text-slate-400 hover:text-white hover:bg-white/[0.03] border-l-4 border-transparent'}
                  `}
                >
                  <Icon className={`h-5 w-5 ${isActive ? 'text-white' : 'text-slate-400 group-hover:text-white'}`} />
                  {item.name}
                  {isActive && <ChevronRight className="h-4 w-4 ml-auto" />}
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Sidebar Footer */}
        <div className="p-4 border-t border-white/5">
          <button 
            onClick={onLogout}
            className="flex items-center gap-3 w-full px-4 py-3 rounded-xl text-sm font-medium text-rose-400 hover:text-white hover:bg-rose-500/10 transition-all duration-200"
          >
            <LogOut className="h-5 w-5" />
            Logout
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 overflow-y-auto max-h-screen px-6 py-8 md:px-10">
        <div className="max-w-6xl mx-auto">
          {children}
        </div>
      </main>
    </div>
  );
};

export default function App() {
  const [user, setUser] = useState(null);

  useEffect(() => {
    const savedUser = localStorage.getItem('user');
    if (savedUser) {
      try {
        setUser(JSON.parse(savedUser));
      } catch (e) {
        localStorage.removeItem('user');
      }
    }
  }, []);

  const handleLogin = (userData) => {
    localStorage.setItem('user', JSON.stringify(userData));
    if (userData.geminiApiKey) {
      localStorage.setItem('gemini_api_key', userData.geminiApiKey);
    } else {
      localStorage.removeItem('gemini_api_key');
    }
    setUser(userData);
  };

  const handleLogout = () => {
    localStorage.removeItem('user');
    localStorage.removeItem('gemini_api_key');
    localStorage.removeItem('gemini_model');
    setUser(null);
    window.location.href = '/login';
  };

  return (
    <Router>
      <Routes>
        {/* Public Routes */}
        <Route path="/" element={
          <PublicRoute>
            <LandingPage />
          </PublicRoute>
        } />
        <Route path="/login" element={
          <PublicRoute>
            <LoginPage onLogin={handleLogin} />
          </PublicRoute>
        } />
        <Route path="/register" element={
          <PublicRoute>
            <RegisterPage />
          </PublicRoute>
        } />

        {/* Protected Dashboard/App Routes */}
        <Route path="/dashboard" element={
          <ProtectedRoute>
            <AppLayout user={user} onLogout={handleLogout}>
              <Dashboard user={user} />
            </AppLayout>
          </ProtectedRoute>
        } />
        <Route path="/notes" element={
          <ProtectedRoute>
            <AppLayout user={user} onLogout={handleLogout}>
              <NotesPage />
            </AppLayout>
          </ProtectedRoute>
        } />
        <Route path="/chat" element={
          <ProtectedRoute>
            <AppLayout user={user} onLogout={handleLogout}>
              <ChatPage />
            </AppLayout>
          </ProtectedRoute>
        } />
        <Route path="/quiz" element={
          <ProtectedRoute>
            <AppLayout user={user} onLogout={handleLogout}>
              <QuizPage />
            </AppLayout>
          </ProtectedRoute>
        } />
        <Route path="/results" element={
          <ProtectedRoute>
            <AppLayout user={user} onLogout={handleLogout}>
              <ResultsPage />
            </AppLayout>
          </ProtectedRoute>
        } />
        <Route path="/profile" element={
          <ProtectedRoute>
            <AppLayout user={user} onLogout={handleLogout}>
              <ProfilePage user={user} />
            </AppLayout>
          </ProtectedRoute>
        } />

        {/* Fallback */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  );
}
