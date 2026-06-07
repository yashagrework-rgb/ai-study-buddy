import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  BookOpen, 
  BrainCircuit, 
  Clock, 
  Award, 
  ArrowUpRight, 
  FileText,
  TrendingUp,
  ChevronRight
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
      color: 'text-indigo-600 dark:text-indigo-400', 
      bg: 'bg-indigo-50 dark:bg-indigo-950/20 border border-indigo-100 dark:border-indigo-900/30',
      desc: 'Estimated learning hours'
    },
    { 
      name: 'Quizzes Completed', 
      value: progress ? progress.quizzesCompleted : '0', 
      icon: BrainCircuit, 
      color: 'text-emerald-600 dark:text-emerald-400', 
      bg: 'bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-100 dark:border-emerald-900/30',
      desc: 'Knowledge checks passed'
    },
    { 
      name: 'Average Quiz Score', 
      value: progress ? `${progress.averageScore}%` : '0.0%', 
      icon: Award, 
      color: 'text-amber-600 dark:text-amber-400', 
      bg: 'bg-amber-50 dark:bg-amber-950/20 border border-amber-100 dark:border-amber-900/30',
      desc: 'Success grade benchmark'
    }
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-slate-500"></div>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-fade-in">
      
      {/* Welcome Message Card */}
      <div className="p-8 rounded-xl bg-white dark:bg-[#111622] border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <span className="text-[10px] font-bold tracking-wider text-indigo-650 dark:text-indigo-400 uppercase block mb-1">
            Workspace Dashboard
          </span>
          <h1 className="text-2xl md:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight mb-2">
            Welcome back, {user?.name || 'Student'}
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 max-w-xl">
            Upload notes, generate practice tests, and ask conceptual questions to your study helper.
          </p>
        </div>
        
        <div className="flex items-center gap-3">
          <Link 
            to="/notes" 
            className="px-4 py-2 bg-white hover:bg-slate-50 dark:bg-slate-900 dark:hover:bg-slate-850 text-slate-700 dark:text-slate-250 border border-slate-200 dark:border-slate-800 text-xs font-semibold rounded-lg transition-all flex items-center gap-1.5"
          >
            <BookOpen className="h-4 w-4 text-slate-400" /> Notes Manager
          </Link>
          <Link 
            to="/chat" 
            className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold rounded-lg transition-all flex items-center gap-1.5 shadow-sm"
          >
            Ask AI Buddy
          </Link>
        </div>
      </div>

      {/* Metrics Statistics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {stats.map((stat, idx) => {
          const Icon = stat.icon;
          return (
            <div key={idx} className="glass-panel p-6 rounded-xl flex items-center gap-5 border border-slate-200 dark:border-slate-800 shadow-sm">
              <div className={`p-3.5 rounded-lg ${stat.bg} ${stat.color} flex-shrink-0`}>
                <Icon className="h-5.5 w-5.5" />
              </div>
              <div>
                <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider block mb-1">
                  {stat.name}
                </span>
                <span className="text-2xl font-bold text-slate-900 dark:text-white block mb-0.5">
                  {stat.value}
                </span>
                <span className="text-xs text-slate-500 dark:text-slate-400">
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
        <div className="lg:col-span-2 glass-panel p-6 rounded-xl border border-slate-200 dark:border-slate-800">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-indigo-550 dark:text-indigo-400" /> Score Progression
              </h3>
              <p className="text-xs text-slate-450 dark:text-slate-500 mt-1">Average grades from recent assessments</p>
            </div>
            <Link to="/results" className="text-xs text-indigo-600 dark:text-indigo-400 hover:underline font-semibold flex items-center gap-1">
              All Quizzes <ArrowUpRight className="h-3.5 w-3.5" />
            </Link>
          </div>

          {/* Styled SVG Chart */}
          <div className="relative w-full h-48 bg-slate-50/50 dark:bg-slate-900/20 rounded-lg border border-slate-200 dark:border-slate-800/80 p-4 flex items-end">
            
            {/* Background grids */}
            <div className="absolute inset-0 flex flex-col justify-between p-4 pointer-events-none">
              <div className="border-b border-slate-200/80 dark:border-slate-800/50 w-full text-[9px] text-slate-400 dark:text-slate-600 pb-1">100%</div>
              <div className="border-b border-slate-200/80 dark:border-slate-800/50 w-full text-[9px] text-slate-400 dark:text-slate-600 pb-1">75%</div>
              <div className="border-b border-slate-200/80 dark:border-slate-800/50 w-full text-[9px] text-slate-400 dark:text-slate-600 pb-1">50%</div>
              <div className="border-b border-slate-200/80 dark:border-slate-800/50 w-full text-[9px] text-slate-400 dark:text-slate-600 pb-1">25%</div>
              <div className="w-full text-[9px] text-slate-400 dark:text-slate-600">0%</div>
            </div>

            {/* SVG Plot */}
            <svg className="w-full h-32 z-10" viewBox="0 0 500 100" preserveAspectRatio="none">
              <defs>
                <linearGradient id="chart-grad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#6366f1" stopOpacity="0.2" />
                  <stop offset="100%" stopColor="#6366f1" stopOpacity="0.0" />
                </linearGradient>
              </defs>
              
              {/* Path line */}
              <path 
                d="M 10 70 L 120 50 L 230 55 L 340 30 L 480 10" 
                fill="none" 
                stroke="#6366f1" 
                strokeWidth="2.5"
                strokeLinecap="round"
              />

              {/* Area Under Path */}
              <path 
                d="M 10 70 L 120 50 L 230 55 L 340 30 L 480 10 L 480 100 L 10 100 Z" 
                fill="url(#chart-grad)"
              />

              {/* Grid dots */}
              <circle cx="10" cy="70" r="4.5" fill="#6366f1" stroke="#ffffff" strokeWidth="1.5" />
              <circle cx="120" cy="50" r="4.5" fill="#6366f1" stroke="#ffffff" strokeWidth="1.5" />
              <circle cx="230" cy="55" r="4.5" fill="#6366f1" stroke="#ffffff" strokeWidth="1.5" />
              <circle cx="340" cy="30" r="4.5" fill="#6366f1" stroke="#ffffff" strokeWidth="1.5" />
              <circle cx="480" cy="10" r="4.5" fill="#6366f1" stroke="#ffffff" strokeWidth="1.5" />
            </svg>
          </div>

          <div className="flex justify-between px-2 text-[10px] text-slate-450 dark:text-slate-500 font-semibold mt-3">
            <span>Quiz 1</span>
            <span>Quiz 2</span>
            <span>Quiz 3</span>
            <span>Quiz 4</span>
            <span>Latest</span>
          </div>
        </div>

        {/* Right Side: Recent Notes */}
        <div className="glass-panel p-6 rounded-xl border border-slate-200 dark:border-slate-800">
          <div className="flex items-center justify-between mb-5">
            <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <FileText className="h-5 w-5 text-indigo-500 dark:text-indigo-400" /> Recent Materials
            </h3>
            <Link to="/notes" className="text-xs text-indigo-600 dark:text-indigo-400 hover:underline font-semibold flex items-center gap-1">
              Manage <ArrowUpRight className="h-3.5 w-3.5" />
            </Link>
          </div>

          <div className="space-y-3">
            {notes.length === 0 ? (
              <div className="text-center py-8 bg-slate-50/50 dark:bg-slate-900/30 rounded-lg border border-slate-200 dark:border-slate-800">
                <p className="text-xs text-slate-500 dark:text-slate-400">No notes found.</p>
                <Link to="/notes" className="text-xs text-indigo-600 dark:text-indigo-400 hover:underline font-semibold mt-2 inline-block">
                  Add your first note
                </Link>
              </div>
            ) : (
              notes.map((note) => (
                <div key={note.id} className="p-3 rounded-lg bg-slate-50 dark:bg-[#151b29] border border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 transition-all flex items-center justify-between">
                  <div className="overflow-hidden pr-2">
                    <h4 className="font-semibold text-xs sm:text-sm text-slate-800 dark:text-slate-200 truncate">{note.title}</h4>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate mt-0.5">
                      {note.content ? note.content.substring(0, 55) + '...' : 'Empty content'}
                    </p>
                  </div>
                  <Link 
                    to="/chat" 
                    state={{ noteId: note.id }} 
                    className="p-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-750 text-slate-600 dark:text-slate-350 transition-all flex-shrink-0"
                    title="Study note"
                  >
                    <ChevronRight className="h-4 w-4" />
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
