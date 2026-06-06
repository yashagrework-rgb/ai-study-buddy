import React, { useState, useEffect } from 'react';
import { 
  User, 
  Mail, 
  ShieldAlert, 
  BrainCircuit, 
  Clock, 
  Award, 
  LogOut,
  Calendar,
  Sparkles
} from 'lucide-react';
import api from '../services/api';

export default function ProfilePage({ user }) {
  const [progress, setProgress] = useState(null);
  const [loading, setLoading] = useState(true);
  
  const [apiKey, setApiKey] = useState('');
  const [savedKey, setSavedKey] = useState(localStorage.getItem('gemini_api_key') || '');
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  const handleSaveKey = async () => {
    if (!apiKey.trim()) {
      setErrorMsg('Please enter a valid API key.');
      return;
    }
    localStorage.setItem('gemini_api_key', apiKey.trim());
    setSavedKey(apiKey.trim());
    setSuccessMsg('Gemini API key saved successfully!');
    setErrorMsg('');
    try {
      await api.put('/api/ai/api-key', { apiKey: apiKey.trim() });
    } catch (dbErr) {
      console.error('Failed to sync API key to database:', dbErr);
    }
  };

  const handleClearKey = async () => {
    localStorage.removeItem('gemini_api_key');
    setApiKey('');
    setSavedKey('');
    setSuccessMsg('Gemini API key cleared.');
    setErrorMsg('');
    try {
      await api.put('/api/ai/api-key', { apiKey: null });
    } catch (dbErr) {
      console.error('Failed to clear API key in database:', dbErr);
    }
  };

  useEffect(() => {
    const fetchProgress = async () => {
      try {
        const response = await api.get('/api/progress');
        setProgress(response.data);
      } catch (err) {
        console.error('Error fetching progress stats', err);
      } finally {
        setLoading(false);
      }
    };

    fetchProgress();
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('user');
    window.location.href = '/login';
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-500"></div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto space-y-8 animate-fade-in">
      
      {/* Profile Card Header */}
      <div className="glass-panel p-6 rounded-3xl border border-white/5 relative overflow-hidden flex flex-col items-center text-center space-y-4 shadow-glass">
        
        {/* Glow backdrop decoration */}
        <div className="absolute top-0 left-0 w-32 h-32 rounded-full bg-primary-600/10 blur-2xl"></div>
        <div className="absolute bottom-0 right-0 w-32 h-32 rounded-full bg-indigo-600/10 blur-2xl"></div>

        {/* Big Avatar */}
        <div className="relative">
          <div className="h-24 w-24 rounded-full bg-gradient-to-tr from-primary-600 to-indigo-600 flex items-center justify-center font-bold text-white text-3xl shadow-lg border-2 border-white/10 relative z-10">
            {user?.name ? user.name.charAt(0).toUpperCase() : 'U'}
          </div>
          <div className="absolute -bottom-1 -right-1 p-1.5 bg-primary-500 rounded-full text-white border-2 border-dark-950 z-20" title="AI Co-pilot Active">
            <Sparkles className="h-4 w-4" />
          </div>
        </div>

        <div className="space-y-1 relative z-10">
          <h2 className="text-2xl font-extrabold text-white tracking-tight">{user?.name || 'Student'}</h2>
          <p className="text-xs text-primary-400 font-semibold uppercase tracking-wider flex items-center justify-center gap-1">
            Student Account
          </p>
        </div>

        <div className="w-full border-t border-white/5 pt-4 space-y-2 text-xs text-slate-400 relative z-10 flex flex-col items-center">
          <div className="flex items-center gap-2">
            <Mail className="h-4 w-4 text-slate-500" />
            <span>{user?.email || 'student@university.edu'}</span>
          </div>
          <div className="flex items-center gap-2">
            <Calendar className="h-4 w-4 text-slate-500" />
            <span>Registered as learning companion</span>
          </div>
        </div>

      </div>

      {/* Learning Achievements Section */}
      <div className="space-y-4">
        <h3 className="text-lg font-bold text-white">Learning Metrics Overview</h3>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          
          {/* Box 1 */}
          <div className="p-4 rounded-2xl bg-white/[0.01] border border-white/5 text-center space-y-1.5">
            <Clock className="h-5 w-5 text-indigo-400 mx-auto" />
            <span className="text-2xl font-bold text-white block">
              {progress ? progress.totalStudyTime : 0} mins
            </span>
            <span className="text-[10px] text-slate-500 uppercase font-semibold">Total Study Time</span>
          </div>

          {/* Box 2 */}
          <div className="p-4 rounded-2xl bg-white/[0.01] border border-white/5 text-center space-y-1.5">
            <BrainCircuit className="h-5 w-5 text-emerald-400 mx-auto" />
            <span className="text-2xl font-bold text-white block">
              {progress ? progress.quizzesCompleted : 0}
            </span>
            <span className="text-[10px] text-slate-500 uppercase font-semibold">Quizzes Taken</span>
          </div>

          {/* Box 3 */}
          <div className="p-4 rounded-2xl bg-white/[0.01] border border-white/5 text-center space-y-1.5">
            <Award className="h-5 w-5 text-amber-400 mx-auto" />
            <span className="text-2xl font-bold text-white block">
              {progress ? progress.averageScore : '0.0'}%
            </span>
            <span className="text-[10px] text-slate-500 uppercase font-semibold">Average Grade</span>
          </div>

        </div>
      </div>

      {/* Gemini API Key Configuration Section */}
      <div className="glass-panel p-6 rounded-3xl border border-white/5 space-y-4 relative overflow-hidden shadow-glass bg-white/[0.02]">
        <h3 className="text-lg font-bold text-white flex items-center gap-2">
          <Sparkles className="h-5 w-5 text-primary-400" />
          AI Co-pilot Configuration
        </h3>
        <p className="text-xs text-slate-400">
          Configure a personal Google Gemini API key to activate real, detailed, human-like answers for study lounge chats, notes summarization, dynamic MCQ quizzes, and 7-day study plans.
        </p>

        <div className="space-y-3">
          <div className="flex flex-col sm:flex-row gap-3">
            <input
              type="password"
              value={apiKey}
              onChange={(e) => {
                setApiKey(e.target.value);
                setSuccessMsg('');
                setErrorMsg('');
              }}
              placeholder={savedKey ? "••••••••••••••••••••••••••••••••" : "Enter Gemini API Key (AIzaSy...)"}
              className="flex-1 glass-input text-xs py-2 px-3 bg-black/20 border border-white/10"
            />
            
            <div className="flex gap-2">
              <button
                type="button"
                onClick={handleSaveKey}
                className="px-4 py-2 rounded-xl bg-primary-600 hover:bg-primary-500 text-white font-bold text-xs transition-all"
              >
                Save Key
              </button>
              {savedKey && (
                <button
                  type="button"
                  onClick={handleClearKey}
                  className="px-4 py-2 rounded-xl bg-rose-500/10 border border-rose-500/20 hover:bg-rose-500/20 text-xs font-semibold text-rose-400 transition-all"
                >
                  Clear
                </button>
              )}
            </div>
          </div>
          
          {successMsg && (
            <p className="text-xs text-emerald-400 font-semibold">{successMsg}</p>
          )}
          {errorMsg && (
            <p className="text-xs text-rose-400 font-semibold">{errorMsg}</p>
          )}
          
          <p className="text-[10px] text-slate-500">
            Get your free API key from <a href="https://aistudio.google.com/" target="_blank" rel="noopener noreferrer" className="text-primary-400 underline hover:text-primary-300">Google AI Studio</a>. Keys are stored safely in browser storage.
          </p>
        </div>
      </div>

      {/* Profile Logout CTA */}
      <div className="pt-2">
        <button
          onClick={handleLogout}
          className="w-full py-3.5 px-4 rounded-xl border border-rose-500/20 hover:bg-rose-500/10 text-sm font-semibold text-rose-400 hover:text-rose-300 transition-all flex items-center justify-center gap-2"
        >
          <LogOut className="h-4.5 w-4.5" />
          Logout from StudyBuddy
        </button>
      </div>

    </div>
  );
}
