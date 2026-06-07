import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { GraduationCap, Mail, Lock, AlertCircle, Loader2, ArrowRight } from 'lucide-react';
import api from '../services/api';

export default function LoginPage({ onLogin }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  useEffect(() => {
    if (searchParams.get('expired')) {
      setError('Your session has expired. Please log in again.');
    }
  }, [searchParams]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await api.post('/api/auth/login', { email, password });
      onLogin(response.data);
      navigate('/dashboard');
    } catch (err) {
      console.error(err);
      const msg = err.response?.data?.message || 
                  (typeof err.response?.data?.error === 'object' ? err.response?.data?.error?.message : err.response?.data?.error) || 
                  err.message || 
                  'Login failed. Please check your credentials and try again.';
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#faf9f6] dark:bg-[#0c0e12] px-4 relative overflow-hidden transition-colors duration-300">
      
      <div className="w-full max-w-md z-10">
        
        {/* Logo Header */}
        <div className="text-center mb-8">
          <Link to="/" className="inline-flex items-center gap-2 mb-4">
            <div className="p-2.5 bg-slate-100 dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 shadow-sm">
              <GraduationCap className="h-6 w-6 text-slate-800 dark:text-slate-200" />
            </div>
          </Link>
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">Welcome back</h2>
          <p className="text-xs text-slate-500 dark:text-slate-455 mt-1.5">Sign in to your StudyBuddy workspace</p>
        </div>

        {/* Login Box */}
        <div className="glass-panel p-8 rounded-xl">
          
          {error && (
            <div className="flex items-center gap-3 p-3.5 mb-6 rounded-lg bg-rose-50 dark:bg-rose-950/20 border border-rose-200 dark:border-rose-900/30 text-rose-600 dark:text-rose-455 text-xs sm:text-sm">
              <AlertCircle className="h-4.5 w-4.5 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            
            {/* Email Field */}
            <div>
              <label className="block text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-2">
                Email Address
              </label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-slate-450 dark:text-slate-500">
                  <Mail className="h-4.5 w-4.5" />
                </span>
                <input
                  type="email"
                  required
                  placeholder="name@university.edu"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full glass-input pl-11"
                />
              </div>
            </div>

            {/* Password Field */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="block text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
                  Password
                </label>
              </div>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-slate-450 dark:text-slate-500">
                  <Lock className="h-4.5 w-4.5" />
                </span>
                <input
                  type="password"
                  required
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full glass-input pl-11"
                />
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 px-4 font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg transition-all flex items-center justify-center gap-2 group disabled:opacity-50 text-sm shadow-sm"
            >
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Logging in...
                </>
              ) : (
                <>
                  Sign In
                  <ArrowRight className="h-4 w-4 group-hover:translate-x-0.5 transition-transform" />
                </>
              )}
            </button>

          </form>

          {/* Redirect to Register */}
          <div className="mt-8 pt-6 border-t border-slate-200 dark:border-slate-800/80 text-center text-xs text-slate-500">
            Don't have an account?{' '}
            <Link to="/register" className="font-semibold text-indigo-600 dark:text-indigo-400 hover:underline">
              Create account
            </Link>
          </div>

        </div>

      </div>
    </div>
  );
}
