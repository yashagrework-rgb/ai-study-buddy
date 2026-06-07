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
  ChevronRight,
  Sun,
  Moon
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
const AppLayout = ({ children, user, onLogout, theme, setTheme }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const location = useLocation();

  const navigation = [
    { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
    { name: 'Notes', href: '/notes', icon: BookOpen },
    { name: 'Summarise Notes', href: '/chat', icon: MessageSquareCode },
    { name: 'Generate Quiz', href: '/quiz', icon: BrainCircuit },
    { name: 'Quiz Results', href: '/results', icon: BarChart3 },
    { name: 'Profile', href: '/profile', icon: UserIcon },
  ];

  return (
    <div className="min-h-screen bg-[#faf9f6] dark:bg-[#0c0e12] flex flex-col md:flex-row transition-colors duration-300">
      {/* Mobile Header */}
      <header className="md:hidden flex items-center justify-between px-6 py-4 bg-white dark:bg-[#13161d] border-b border-slate-200 dark:border-slate-800 z-20">
        <div className="flex items-center gap-2">
          <GraduationCap className="h-6 w-6 text-slate-800 dark:text-slate-200" />
          <span className="font-bold text-lg tracking-tight text-slate-900 dark:text-white">StudyBuddy</span>
        </div>
        <button onClick={() => setSidebarOpen(!sidebarOpen)} className="p-1 rounded-md text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-white">
          {sidebarOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>
      </header>

      {/* Sidebar Navigation */}
      <aside className={`
        fixed inset-y-0 left-0 w-64 bg-white dark:bg-[#13161d] border-r border-slate-200 dark:border-slate-800 flex flex-col justify-between z-30 transition-transform duration-300 transform
        md:translate-x-0 md:static md:h-screen
        ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>
        <div>
          {/* Sidebar Brand Logo */}
          <div className="hidden md:flex items-center gap-2.5 px-6 py-8">
            <div className="p-2 bg-slate-100 dark:bg-slate-800/80 rounded-lg border border-slate-200 dark:border-slate-700">
              <GraduationCap className="h-6 w-6 text-slate-700 dark:text-slate-200" />
            </div>
            <div>
              <span className="font-bold text-lg tracking-tight text-slate-900 dark:text-white block leading-none mb-1">StudyBuddy</span>
              <span className="text-[10px] text-slate-400 dark:text-slate-500 font-medium">
                Workspace
              </span>
            </div>
          </div>

          {/* User Preview */}
          <div className="px-4 mb-6 md:mt-2">
            <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-900/30 border border-slate-200 dark:border-slate-800/80 flex items-center gap-3">
              <div className="h-10 w-10 rounded-full bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-200 flex items-center justify-center font-semibold text-sm border border-slate-300 dark:border-slate-700">
                {user?.name ? user.name.charAt(0).toUpperCase() : 'U'}
              </div>
              <div className="overflow-hidden">
                <h4 className="font-semibold text-sm text-slate-800 dark:text-slate-200 truncate">{user?.name || 'Student'}</h4>
                <p className="text-xs text-slate-500 dark:text-slate-400 truncate">{user?.email || 'student@study.edu'}</p>
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
                    flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-medium transition-all duration-150
                    ${isActive 
                      ? 'bg-slate-900 text-white dark:bg-slate-800 dark:text-white shadow-sm' 
                      : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800/30'}
                  `}
                >
                  <Icon className={`h-4.5 w-4.5 ${isActive ? 'text-white' : 'text-slate-400 dark:text-slate-500'}`} />
                  {item.name}
                  {isActive && <ChevronRight className="h-4 w-4 ml-auto opacity-55" />}
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Sidebar Footer */}
        <div className="p-4 border-t border-slate-200 dark:border-slate-850">
          <button 
            type="button"
            onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
            className="flex items-center gap-3 w-full px-4 py-2.5 mb-2 rounded-lg text-sm font-medium text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800/30 transition-all duration-150"
          >
            {theme === 'dark' ? (
              <>
                <Sun className="h-4.5 w-4.5 text-amber-500" />
                Light Mode
              </>
            ) : (
              <>
                <Moon className="h-4.5 w-4.5 text-slate-500" />
                Dark Mode
              </>
            )}
          </button>
          <button 
            onClick={onLogout}
            className="flex items-center gap-3 w-full px-4 py-2.5 rounded-lg text-sm font-medium text-rose-500 dark:text-rose-400 hover:bg-rose-50/50 dark:hover:bg-rose-950/20 transition-all duration-150"
          >
            <LogOut className="h-4.5 w-4.5" />
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
  const [theme, setTheme] = useState(localStorage.getItem('theme') || 'dark');

  useEffect(() => {
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    localStorage.setItem('theme', theme);
  }, [theme]);

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
    setUser(userData);
  };

  const handleLogout = () => {
    localStorage.removeItem('user');
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
            <AppLayout user={user} onLogout={handleLogout} theme={theme} setTheme={setTheme}>
              <Dashboard user={user} />
            </AppLayout>
          </ProtectedRoute>
        } />
        <Route path="/notes" element={
          <ProtectedRoute>
            <AppLayout user={user} onLogout={handleLogout} theme={theme} setTheme={setTheme}>
              <NotesPage />
            </AppLayout>
          </ProtectedRoute>
        } />
        <Route path="/chat" element={
          <ProtectedRoute>
            <AppLayout user={user} onLogout={handleLogout} theme={theme} setTheme={setTheme}>
              <ChatPage />
            </AppLayout>
          </ProtectedRoute>
        } />
        <Route path="/quiz" element={
          <ProtectedRoute>
            <AppLayout user={user} onLogout={handleLogout} theme={theme} setTheme={setTheme}>
              <QuizPage />
            </AppLayout>
          </ProtectedRoute>
        } />
        <Route path="/results" element={
          <ProtectedRoute>
            <AppLayout user={user} onLogout={handleLogout} theme={theme} setTheme={setTheme}>
              <ResultsPage />
            </AppLayout>
          </ProtectedRoute>
        } />
        <Route path="/profile" element={
          <ProtectedRoute>
            <AppLayout user={user} onLogout={handleLogout} theme={theme} setTheme={setTheme}>
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
