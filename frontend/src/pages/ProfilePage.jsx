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
  
  const [geminiKey, setGeminiKey] = useState('');
  const [savedGeminiKey, setSavedGeminiKey] = useState(localStorage.getItem('gemini_api_key') || '');
  const [geminiSuccessMsg, setGeminiSuccessMsg] = useState('');
  const [geminiErrorMsg, setGeminiErrorMsg] = useState('');
  
  const [openAiKey, setOpenAiKey] = useState('');
  const [savedOpenAiKey, setSavedOpenAiKey] = useState(localStorage.getItem('openai_api_key') || '');
  const [openAiSuccessMsg, setOpenAiSuccessMsg] = useState('');
  const [openAiErrorMsg, setOpenAiErrorMsg] = useState('');

  const handleSaveGeminiKey = async () => {
    if (!geminiKey.trim()) {
      setGeminiErrorMsg('Please enter a valid Gemini API key.');
      return;
    }
    localStorage.setItem('gemini_api_key', geminiKey.trim());
    setSavedGeminiKey(geminiKey.trim());
    setGeminiSuccessMsg('Gemini API key saved successfully!');
    setGeminiErrorMsg('');
    try {
      await api.put('/api/ai/api-key', { geminiApiKey: geminiKey.trim() });
    } catch (dbErr) {
      console.error('Failed to sync Gemini API key to database:', dbErr);
      setGeminiErrorMsg('Failed to sync Gemini API key to database.');
    }
  };

  const handleClearGeminiKey = async () => {
    localStorage.removeItem('gemini_api_key');
    setGeminiKey('');
    setSavedGeminiKey('');
    setGeminiSuccessMsg('Gemini API key cleared.');
    setGeminiErrorMsg('');
    try {
      await api.put('/api/ai/api-key', { geminiApiKey: null });
    } catch (dbErr) {
      console.error('Failed to clear Gemini API key in database:', dbErr);
    }
  };

  const handleSaveOpenAiKey = async () => {
    if (!openAiKey.trim()) {
      setOpenAiErrorMsg('Please enter a valid OpenAI API key.');
      return;
    }
    localStorage.setItem('openai_api_key', openAiKey.trim());
    setSavedOpenAiKey(openAiKey.trim());
    setOpenAiSuccessMsg('OpenAI API key saved successfully!');
    setOpenAiErrorMsg('');
    try {
      await api.put('/api/ai/api-key', { openAiApiKey: openAiKey.trim() });
    } catch (dbErr) {
      console.error('Failed to sync OpenAI API key to database:', dbErr);
      setOpenAiErrorMsg('Failed to sync OpenAI API key to database.');
    }
  };

  const handleClearOpenAiKey = async () => {
    localStorage.removeItem('openai_api_key');
    setOpenAiKey('');
    setSavedOpenAiKey('');
    setOpenAiSuccessMsg('OpenAI API key cleared.');
    setOpenAiErrorMsg('');
    try {
      await api.put('/api/ai/api-key', { openAiApiKey: null });
    } catch (dbErr) {
      console.error('Failed to clear OpenAI API key in database:', dbErr);
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

      {/* AI Co-pilot Configuration Section */}
      <div className="glass-panel p-6 rounded-3xl border border-white/5 space-y-6 relative overflow-hidden shadow-glass bg-white/[0.02]">
        <h3 className="text-lg font-bold text-white flex items-center gap-2">
          <Sparkles className="h-5 w-5 text-primary-400" />
          AI Co-pilot Configuration
        </h3>
        <p className="text-xs text-slate-400">
          Configure personal API keys to activate real, detailed, human-like answers for study lounge chats, notes summarization, dynamic MCQ quizzes, and 7-day study plans.
        </p>

        {/* Gemini Panel */}
        <div className="p-4 rounded-2xl bg-white/[0.01] border border-white/5 space-y-3">
          <div className="flex items-center justify-between">
            <h4 className="text-sm font-bold text-white">Google Gemini API</h4>
            <span className="text-[10px] text-slate-500">
              Get key at <a href="https://aistudio.google.com/" target="_blank" rel="noopener noreferrer" className="text-primary-400 underline hover:text-primary-300">Google AI Studio</a>
            </span>
          </div>
          <div className="flex flex-col sm:flex-row gap-3">
            <input
              type="password"
              value={geminiKey}
              onChange={(e) => {
                setGeminiKey(e.target.value);
                setGeminiSuccessMsg('');
                setGeminiErrorMsg('');
              }}
              placeholder={savedGeminiKey ? "••••••••••••••••••••••••••••••••" : "Enter Gemini API Key (AIzaSy...)"}
              className="flex-1 glass-input text-xs py-2 px-3 bg-black/20 border border-white/10"
            />
            
            <div className="flex gap-2">
              <button
                type="button"
                onClick={handleSaveGeminiKey}
                className="px-4 py-2 rounded-xl bg-primary-600 hover:bg-primary-500 text-white font-bold text-xs transition-all"
              >
                Save Key
              </button>
              {savedGeminiKey && (
                <button
                  type="button"
                  onClick={handleClearGeminiKey}
                  className="px-4 py-2 rounded-xl bg-rose-500/10 border border-rose-500/20 hover:bg-rose-500/20 text-xs font-semibold text-rose-400 transition-all"
                >
                  Clear
                </button>
              )}
            </div>
          </div>
          {geminiSuccessMsg && <p className="text-xs text-emerald-400 font-semibold">{geminiSuccessMsg}</p>}
          {geminiErrorMsg && <p className="text-xs text-rose-400 font-semibold">{geminiErrorMsg}</p>}
        </div>

        {/* OpenAI Panel */}
        <div className="p-4 rounded-2xl bg-white/[0.01] border border-white/5 space-y-3">
          <div className="flex items-center justify-between">
            <h4 className="text-sm font-bold text-white">OpenAI ChatGPT API</h4>
            <span className="text-[10px] text-slate-500">
              Get key at <a href="https://platform.openai.com/api-keys" target="_blank" rel="noopener noreferrer" className="text-primary-400 underline hover:text-primary-300">OpenAI API Keys</a>
            </span>
          </div>
          <div className="flex flex-col sm:flex-row gap-3">
            <input
              type="password"
              value={openAiKey}
              onChange={(e) => {
                setOpenAiKey(e.target.value);
                setOpenAiSuccessMsg('');
                setOpenAiErrorMsg('');
              }}
              placeholder={savedOpenAiKey ? "••••••••••••••••••••••••••••••••" : "Enter OpenAI API Key (sk-...)"}
              className="flex-1 glass-input text-xs py-2 px-3 bg-black/20 border border-white/10"
            />
            
            <div className="flex gap-2">
              <button
                type="button"
                onClick={handleSaveOpenAiKey}
                className="px-4 py-2 rounded-xl bg-primary-600 hover:bg-primary-500 text-white font-bold text-xs transition-all"
              >
                Save Key
              </button>
              {savedOpenAiKey && (
                <button
                  type="button"
                  onClick={handleClearOpenAiKey}
                  className="px-4 py-2 rounded-xl bg-rose-500/10 border border-rose-500/20 hover:bg-rose-500/20 text-xs font-semibold text-rose-400 transition-all"
                >
                  Clear
                </button>
              )}
            </div>
          </div>
          {openAiSuccessMsg && <p className="text-xs text-emerald-400 font-semibold">{openAiSuccessMsg}</p>}
          {openAiErrorMsg && <p className="text-xs text-rose-400 font-semibold">{openAiErrorMsg}</p>}
        </div>

        <p className="text-[10px] text-slate-500">
          Keys are stored safely in browser storage and synchronized to your account database.
        </p>
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
