import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  BarChart3, 
  Award, 
  Calendar, 
  BrainCircuit, 
  AlertCircle,
  FileCheck2
} from 'lucide-react';
import api from '../services/api';

export default function ResultsPage() {
  const [quizzes, setQuizzes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchResults();
  }, []);

  const fetchResults = async () => {
    try {
      const response = await api.get('/api/quiz/results');
      setQuizzes(response.data);
    } catch (err) {
      console.error(err);
      setError('Could not retrieve quiz performance records.');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-slate-500"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6 text-slate-800 dark:text-slate-200">
      
      <div>
        <h2 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white tracking-tight flex items-center gap-2">
          <BarChart3 className="h-5.5 w-5.5 text-indigo-650 dark:text-indigo-400" /> Quiz History & Metrics
        </h2>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Review your score sheets and performance timelines</p>
      </div>

      {error && (
        <div className="flex items-center gap-2.5 p-3.5 rounded-lg bg-rose-50 dark:bg-rose-955/20 border border-rose-200 dark:border-rose-900/30 text-rose-600 dark:text-rose-400 text-xs">
          <AlertCircle className="h-4 w-4 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {quizzes.length === 0 ? (
        <div className="text-center py-16 glass-panel border border-slate-200 dark:border-slate-800 rounded-xl max-w-lg mx-auto bg-white dark:bg-[#111622]">
          <BrainCircuit className="h-12 w-12 text-slate-350 dark:text-slate-650 mx-auto mb-4" />
          <h3 className="font-bold text-slate-900 dark:text-white text-base">No quiz records yet</h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Build your first AI practice quiz to test your study memory.
          </p>
          <Link
            to="/quiz"
            className="mt-5 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-xs font-semibold text-white rounded-lg transition-all inline-block shadow-sm"
          >
            Go to Quiz Room
          </Link>
        </div>
      ) : (
        
        // Results List Table/Grid
        <div className="glass-panel rounded-xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-sm bg-white dark:bg-[#111622]">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              
              <thead>
                <tr className="border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/20 text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
                  <th className="px-6 py-3.5">Quiz Title</th>
                  <th className="px-6 py-3.5">Date Completed</th>
                  <th className="px-6 py-3.5 text-center">Final Score</th>
                  <th className="px-6 py-3.5 text-right">Status</th>
                </tr>
              </thead>

              <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-xs sm:text-sm text-slate-600 dark:text-slate-300">
                {quizzes.map((quiz) => (
                  <tr key={quiz.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-900/10 transition-all">
                    
                    {/* Title */}
                    <td className="px-6 py-4 font-semibold text-slate-850 dark:text-slate-200 flex items-center gap-3">
                      <div className="p-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 border border-slate-200 dark:border-slate-700">
                        <FileCheck2 className="h-4 w-4" />
                      </div>
                      <span className="truncate max-w-[240px]" title={quiz.title}>{quiz.title}</span>
                    </td>

                    {/* Date */}
                    <td className="px-6 py-4">
                      <span className="flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-450">
                        <Calendar className="h-4 w-4" />
                        {new Date(quiz.createdAt).toLocaleDateString()}
                      </span>
                    </td>

                    {/* Score */}
                    <td className="px-6 py-4 text-center">
                      <span className={`
                        px-2 py-1 rounded-md text-xs font-bold inline-block w-14 border
                        ${quiz.score >= 80 
                          ? 'bg-emerald-50 border-emerald-200 text-emerald-700 dark:bg-emerald-950/20 dark:border-emerald-900/30 dark:text-emerald-400' 
                          : quiz.score >= 60 
                          ? 'bg-indigo-50 border-indigo-200 text-indigo-700 dark:bg-indigo-950/20 dark:border-indigo-900/30 dark:text-indigo-400' 
                          : 'bg-rose-50 border-rose-200 text-rose-700 dark:bg-rose-950/20 dark:border-rose-900/30 dark:text-rose-455'}
                      `}>
                        {quiz.score}%
                      </span>
                    </td>

                    {/* Status */}
                    <td className="px-6 py-4 text-right">
                      <span className="inline-flex items-center gap-1.5 text-xs text-slate-455 dark:text-slate-450 font-medium">
                        Completed <Award className="h-3.5 w-3.5 text-amber-500" />
                      </span>
                    </td>

                  </tr>
                ))}
              </tbody>

            </table>
          </div>
        </div>
      )}

    </div>
  );
}
