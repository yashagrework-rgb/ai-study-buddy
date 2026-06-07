import React, { useState, useEffect } from 'react';
import { 
  User, 
  Mail, 
  BrainCircuit, 
  Clock, 
  Award, 
  LogOut,
  Calendar
} from 'lucide-react';
import api from '../services/api';

export default function ProfilePage({ user }) {
  const [progress, setProgress] = useState(null);
  const [loading, setLoading] = useState(true);
  


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
        <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-slate-500"></div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto space-y-8 animate-fade-in text-slate-800 dark:text-slate-200">
      
      {/* Profile Card Header */}
      <div className="glass-panel p-6 rounded-xl border border-slate-200 dark:border-slate-800 flex flex-col items-center text-center space-y-4 shadow-sm bg-white dark:bg-[#111622]">
        
        {/* Big Avatar */}
        <div className="relative">
          <div className="h-24 w-24 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 flex items-center justify-center font-bold text-3xl border border-slate-250 dark:border-slate-700 shadow-sm">
            {user?.name ? user.name.charAt(0).toUpperCase() : 'U'}
          </div>
        </div>

        <div className="space-y-1 relative z-10">
          <h2 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white tracking-tight">{user?.name || 'Student'}</h2>
          <p className="text-[10px] text-indigo-650 dark:text-indigo-400 font-bold uppercase tracking-wider">
            Student Account
          </p>
        </div>

        <div className="w-full border-t border-slate-200 dark:border-slate-800 pt-4 space-y-2 text-xs text-slate-500 dark:text-slate-400 flex flex-col items-center">
          <div className="flex items-center gap-2">
            <Mail className="h-4 w-4 text-slate-400" />
            <span>{user?.email || 'student@university.edu'}</span>
          </div>
          <div className="flex items-center gap-2">
            <Calendar className="h-4 w-4 text-slate-400" />
            <span>Registered as workspace member</span>
          </div>
        </div>

      </div>

      {/* Learning Achievements Section */}
      <div className="space-y-3">
        <h3 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider text-slate-400 dark:text-slate-500 text-[10px]">Learning Metrics Overview</h3>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          
          {/* Box 1 */}
          <div className="p-4 rounded-lg bg-slate-50 dark:bg-[#151b29] border border-slate-200 dark:border-slate-850 text-center space-y-1.5 shadow-sm">
            <Clock className="h-5 w-5 text-indigo-600 dark:text-indigo-400 mx-auto" />
            <span className="text-xl font-bold text-slate-900 dark:text-white block">
              {progress ? progress.totalStudyTime : 0} mins
            </span>
            <span className="text-[10px] text-slate-450 dark:text-slate-500 uppercase font-semibold">Total Study Time</span>
          </div>

          {/* Box 2 */}
          <div className="p-4 rounded-lg bg-slate-50 dark:bg-[#151b29] border border-slate-200 dark:border-slate-850 text-center space-y-1.5 shadow-sm">
            <BrainCircuit className="h-5 w-5 text-emerald-600 dark:text-emerald-400 mx-auto" />
            <span className="text-xl font-bold text-slate-900 dark:text-white block">
              {progress ? progress.quizzesCompleted : 0}
            </span>
            <span className="text-[10px] text-slate-455 dark:text-slate-500 uppercase font-semibold">Quizzes Taken</span>
          </div>

          {/* Box 3 */}
          <div className="p-4 rounded-lg bg-slate-50 dark:bg-[#151b29] border border-slate-200 dark:border-slate-850 text-center space-y-1.5 shadow-sm">
            <Award className="h-5 w-5 text-amber-600 dark:text-amber-400 mx-auto" />
            <span className="text-xl font-bold text-slate-900 dark:text-white block">
              {progress ? progress.averageScore : '0.0'}%
            </span>
            <span className="text-[10px] text-slate-455 dark:text-slate-500 uppercase font-semibold">Average Grade</span>
          </div>

        </div>
      </div>


      {/* Profile Logout CTA */}
      <div className="pt-2">
        <button
          onClick={handleLogout}
          className="w-full py-2.5 px-4 rounded-lg border border-rose-205 hover:bg-rose-50 text-rose-600 dark:border-rose-900/30 dark:hover:bg-rose-950/20 dark:text-rose-400 text-xs sm:text-sm font-semibold transition-all flex items-center justify-center gap-2"
        >
          <LogOut className="h-4.5 w-4.5" />
          Logout from StudyBuddy
        </button>
      </div>

    </div>
  );
}
