import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  BarChart3, 
  Award, 
  Calendar, 
  ChevronRight, 
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
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-500"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      
      <div>
        <h2 className="text-2xl font-extrabold text-white tracking-tight flex items-center gap-2">
          <BarChart3 className="h-6 w-6 text-primary-400" /> Quiz History & Metrics
        </h2>
        <p className="text-xs text-slate-400 mt-1">Review your score sheets and performance timelines</p>
      </div>

      {error && (
        <div className="flex items-center gap-2.5 p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs">
          <AlertCircle className="h-4 w-4" />
          <span>{error}</span>
        </div>
      )}

      {quizzes.length === 0 ? (
        <div className="text-center py-16 glass-panel border border-white/5 rounded-2xl max-w-xl mx-auto">
          <BrainCircuit className="h-12 w-12 text-slate-500 mx-auto mb-4" />
          <h3 className="font-bold text-white text-base">No quiz records yet</h3>
          <p className="text-xs text-slate-400 mt-1">
            Build your first AI practice quiz to test your study memory.
          </p>
          <Link
            to="/quiz"
            className="mt-5 px-5 py-2.5 bg-primary-600 hover:bg-primary-500 text-xs font-semibold text-white rounded-xl transition-all inline-block shadow-md shadow-primary-600/10"
          >
            Go to Quiz Room
          </Link>
        </div>
      ) : (
        
        // Results List Table/Grid
        <div className="glass-panel rounded-2xl border border-white/5 overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              
              <thead>
                <tr className="border-b border-white/5 bg-white/[0.01] text-xs font-semibold text-slate-400 uppercase tracking-wider">
                  <th className="px-6 py-4">Quiz Title</th>
                  <th className="px-6 py-4">Date Completed</th>
                  <th className="px-6 py-4 text-center">Final Score</th>
                  <th className="px-6 py-4 text-right">Status</th>
                </tr>
              </thead>

              <tbody className="divide-y divide-white/5 text-sm text-slate-300">
                {quizzes.map((quiz) => (
                  <tr key={quiz.id} className="hover:bg-white/[0.01] transition-all">
                    
                    {/* Title */}
                    <td className="px-6 py-4 font-semibold text-white flex items-center gap-3">
                      <div className="p-2 rounded-lg bg-indigo-500/10 border border-indigo-500/20 text-indigo-400">
                        <FileCheck2 className="h-4.5 w-4.5" />
                      </div>
                      <span className="truncate max-w-[240px]" title={quiz.title}>{quiz.title}</span>
                    </td>

                    {/* Date */}
                    <td className="px-6 py-4">
                      <span className="flex items-center gap-1.5 text-xs text-slate-400">
                        <Calendar className="h-4 w-4" />
                        {new Date(quiz.createdAt).toLocaleDateString()}
                      </span>
                    </td>

                    {/* Score */}
                    <td className="px-6 py-4 text-center">
                      <span className={`
                        px-2.5 py-1.5 rounded-lg text-xs font-bold inline-block w-16
                        ${quiz.score >= 80 
                          ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' 
                          : quiz.score >= 60 
                          ? 'bg-indigo-500/10 text-indigo-400 border border-indigo-500/20' 
                          : 'bg-rose-500/10 text-rose-400 border border-rose-500/20'}
                      `}>
                        {quiz.score}%
                      </span>
                    </td>

                    {/* Status */}
                    <td className="px-6 py-4 text-right">
                      <span className="inline-flex items-center gap-1.5 text-xs text-slate-400">
                        Completed <Award className="h-4 w-4 text-amber-400" />
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
