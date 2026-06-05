import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  Sparkles, 
  BookOpen, 
  BrainCircuit, 
  Clock, 
  Award, 
  ArrowUpRight, 
  FileText,
  UserCheck,
  TrendingUp
} from 'lucide-react';
import api from '../services/api';

export default function Dashboard({ user }) {
  const [progress, setProgress] = useState(null);
  const [notes, setNotes] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const [progressRes, notesRes] = await Promise.all([
          api.get('/api/progress'),
          api.get('/api/notes')
        ]);
        setProgress(progressRes.data);
        setNotes(notesRes.data.slice(0, 3)); // show top 3 recent notes
      } catch (err) {
        console.error('Error fetching dashboard data', err);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  const stats = [
    { 
      name: 'Total Study Time', 
      value: progress ? `${progress.totalStudyTime} mins` : '0 mins', 
      icon: Clock, 
      color: 'text-indigo-400', 
      bg: 'bg-indigo-500/10',
      desc: 'Estimated learning hours'
    },
    { 
      name: 'Quizzes Completed', 
      value: progress ? progress.quizzesCompleted : '0', 
      icon: BrainCircuit, 
      color: 'text-emerald-400', 
      bg: 'bg-emerald-500/10',
      desc: 'Knowledge checks passed'
    },
    { 
      name: 'Average Quiz Score', 
      value: progress ? `${progress.averageScore}%` : '0.0%', 
      icon: Award, 
      color: 'text-amber-400', 
      bg: 'bg-amber-500/10',
      desc: 'Success grade benchmark'
    }
  ];

  // Mock score history list for rendering SVG progress chart
  const performanceHistory = [60, 75, 70, 85, 92];

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-500"></div>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-fade-in">
      
      {/* Welcome Message Card */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-primary-900/60 to-indigo-900/40 p-8 border border-primary-500/10 shadow-glass">
        {/* Glow decoration */}
        <div className="absolute right-0 top-0 h-40 w-40 rounded-full bg-primary-500/10 blur-3xl"></div>
        
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-primary-500/10 border border-primary-500/20 text-xs text-primary-300 font-semibold mb-3">
              <Sparkles className="h-3.5 w-3.5" /> Welcome back to your dashboard
            </div>
            <h1 className="text-3xl md:text-4xl font-extrabold text-white tracking-tight mb-2">
              Ready to learn, {user?.name || 'Student'}?
            </h1>
            <p className="text-sm text-slate-300 max-w-xl">
              Track your milestones, generate targeted quizzes, and ask questions to your smart AI co-pilot about uploaded lecture materials.
            </p>
          </div>
          
          <div className="flex items-center gap-3">
            <Link 
              to="/notes" 
              className="px-5 py-3 rounded-xl bg-white/[0.04] border border-white/10 hover:border-white/20 text-sm font-semibold text-slate-200 transition-all text-center flex items-center gap-2"
            >
              <BookOpen className="h-4 w-4" /> Notes Manager
            </Link>
            <Link 
              to="/chat" 
              className="px-5 py-3 rounded-xl bg-primary-600 hover:bg-primary-500 text-sm font-semibold text-white transition-all text-center flex items-center gap-2 shadow-lg shadow-primary-600/20"
            >
              <Sparkles className="h-4 w-4" /> Ask AI Buddy
            </Link>
          </div>
        </div>
      </div>

      {/* Metrics Statistics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {stats.map((stat, idx) => {
          const Icon = stat.icon;
          return (
            <div key={idx} className="glass-panel p-6 rounded-2xl flex items-center gap-5 border border-white/5 shadow-sm">
              <div className={`p-4 rounded-2xl ${stat.bg} ${stat.color} flex-shrink-0`}>
                <Icon className="h-6 w-6" />
              </div>
              <div>
                <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block mb-1">
                  {stat.name}
                </span>
                <span className="text-2xl font-bold text-white block mb-0.5">
                  {stat.value}
                </span>
                <span className="text-xs text-slate-500">
                  {stat.desc}
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Main Grid: Performance Chart & Recent Notes */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left Side: Performance Analytics (SVG Chart) */}
        <div className="lg:col-span-2 glass-panel p-6 rounded-2xl border border-white/5">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-emerald-400" /> Score Progression
              </h3>
              <p className="text-xs text-slate-400 mt-1">Average grades from recent assessments</p>
            </div>
            <Link to="/results" className="text-xs text-primary-400 hover:text-primary-300 font-semibold flex items-center gap-1">
              All Quizzes <ArrowUpRight className="h-3.5 w-3.5" />
            </Link>
          </div>

          {/* Styled SVG Chart */}
          <div className="relative w-full h-48 bg-white/[0.01] rounded-xl border border-white/5 p-4 flex items-end">
            
            {/* Background grids */}
            <div className="absolute inset-0 flex flex-col justify-between p-4 pointer-events-none opacity-20">
              <div className="border-b border-slate-600 w-full text-[10px] text-slate-400 pb-1">100%</div>
              <div className="border-b border-slate-600 w-full text-[10px] text-slate-400 pb-1">75%</div>
              <div className="border-b border-slate-600 w-full text-[10px] text-slate-400 pb-1">50%</div>
              <div className="border-b border-slate-600 w-full text-[10px] text-slate-400 pb-1">25%</div>
              <div className="w-full text-[10px] text-slate-400">0%</div>
            </div>

            {/* SVG Plot */}
            <svg className="w-full h-32 z-10" viewBox="0 0 500 100" preserveAspectRatio="none">
              <defs>
                <linearGradient id="chart-grad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#8b5cf6" stopOpacity="0.4" />
                  <stop offset="100%" stopColor="#8b5cf6" stopOpacity="0.0" />
                </linearGradient>
              </defs>
              
              {/* Path line */}
              <path 
                d="M 10 70 L 120 50 L 230 55 L 340 30 L 480 10" 
                fill="none" 
                stroke="#8b5cf6" 
                strokeWidth="3.5"
                strokeLinecap="round"
              />

              {/* Area Under Path */}
              <path 
                d="M 10 70 L 120 50 L 230 55 L 340 30 L 480 10 L 480 100 L 10 100 Z" 
                fill="url(#chart-grad)"
              />

              {/* Grid dots */}
              <circle cx="10" cy="70" r="5" fill="#a78bfa" />
              <circle cx="120" cy="50" r="5" fill="#a78bfa" />
              <circle cx="230" cy="55" r="5" fill="#a78bfa" />
              <circle cx="340" cy="30" r="5" fill="#a78bfa" />
              <circle cx="480" cy="10" r="5" fill="#a78bfa" />
            </svg>
          </div>

          <div className="flex justify-between px-2 text-[10px] text-slate-500 font-semibold mt-3">
            <span>Quiz 1</span>
            <span>Quiz 2</span>
            <span>Quiz 3</span>
            <span>Quiz 4</span>
            <span>Latest</span>
          </div>
        </div>

        {/* Right Side: Recent Notes */}
        <div className="glass-panel p-6 rounded-2xl border border-white/5">
          <div className="flex items-center justify-between mb-5">
            <h3 className="text-lg font-bold text-white flex items-center gap-2">
              <FileText className="h-5 w-5 text-indigo-400" /> Recent Materials
            </h3>
            <Link to="/notes" className="text-xs text-primary-400 hover:text-primary-300 font-semibold flex items-center gap-1">
              Manage <ArrowUpRight className="h-3.5 w-3.5" />
            </Link>
          </div>

          <div className="space-y-3.5">
            {notes.length === 0 ? (
              <div className="text-center py-8 bg-white/[0.01] rounded-xl border border-white/5">
                <p className="text-sm text-slate-500">No notes found.</p>
                <Link to="/notes" className="text-xs text-primary-400 hover:text-primary-300 font-semibold mt-2 inline-block">
                  Add your first note
                </Link>
              </div>
            ) : (
              notes.map((note) => (
                <div key={note.id} className="p-3 rounded-xl bg-white/[0.02] border border-white/5 hover:border-white/15 transition-all flex items-center justify-between">
                  <div className="overflow-hidden">
                    <h4 className="font-semibold text-sm text-slate-200 truncate">{note.title}</h4>
                    <p className="text-xs text-slate-500 truncate mt-0.5">
                      {note.content ? note.content.substring(0, 50) + '...' : 'Empty content'}
                    </p>
                  </div>
                  <Link 
                    to="/chat" 
                    state={{ noteId: note.id }} 
                    className="p-1.5 rounded-lg bg-primary-500/10 text-primary-400 hover:bg-primary-500 hover:text-white transition-all flex-shrink-0"
                    title="Study with AI"
                  >
                    <Sparkles className="h-4 w-4" />
                  </Link>
                </div>
              ))
            )}
          </div>
        </div>

      </div>

    </div>
  );
}
