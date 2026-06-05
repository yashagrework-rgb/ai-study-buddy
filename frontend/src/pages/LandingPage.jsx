import React from 'react';
import { Link } from 'react-router-dom';
import { 
  GraduationCap, 
  BrainCircuit, 
  Sparkles, 
  BookOpen, 
  FileCheck, 
  LineChart, 
  Lock,
  ArrowRight,
  Github
} from 'lucide-react';

export default function LandingPage() {
  return (
    <div className="relative min-h-screen bg-dark-950 overflow-hidden text-slate-100 flex flex-col justify-between">
      
      {/* Decorative Blur Spheres */}
      <div className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] rounded-full bg-primary-600/10 blur-[120px] animate-pulse-slow"></div>
      <div className="absolute bottom-[-10%] right-[-10%] w-[500px] h-[500px] rounded-full bg-indigo-600/10 blur-[120px] animate-pulse-slow"></div>

      {/* Navbar Header */}
      <nav className="relative max-w-7xl mx-auto w-full px-6 py-6 flex items-center justify-between z-10">
        <div className="flex items-center gap-2.5">
          <div className="p-2 bg-primary-500/10 rounded-xl border border-primary-500/20 shadow-glass-sm">
            <GraduationCap className="h-7 w-7 text-primary-400" />
          </div>
          <span className="font-extrabold text-2xl tracking-tight bg-gradient-to-r from-white via-slate-200 to-primary-300 bg-clip-text text-transparent">
            StudyBuddy
          </span>
        </div>

        <div className="flex items-center gap-4">
          <Link to="/login" className="px-4 py-2 text-sm font-medium text-slate-300 hover:text-white transition-all">
            Login
          </Link>
          <Link to="/register" className="px-5 py-2 text-sm font-semibold text-white bg-primary-600 hover:bg-primary-500 rounded-xl border border-primary-500/30 transition-all shadow-lg shadow-primary-600/20 hover:scale-[1.02]">
            Get Started
          </Link>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative max-w-5xl mx-auto w-full px-6 pt-12 pb-16 text-center z-10 flex flex-col items-center">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full glass-panel border border-white/5 text-xs text-primary-300 font-semibold mb-6 shadow-glass-sm animate-float">
          <Sparkles className="h-3.5 w-3.5 text-primary-400" /> Powered by Google Gemini API
        </div>
        
        <h1 className="text-4xl sm:text-6xl font-black tracking-tight leading-tight max-w-4xl text-white mb-6">
          Supercharge Your Learning with <br />
          <span className="bg-gradient-to-r from-primary-400 via-indigo-300 to-emerald-400 bg-clip-text text-transparent text-glow">
            AI Study Buddy
          </span>
        </h1>

        <p className="text-lg sm:text-xl text-slate-400 max-w-2xl mb-10 leading-relaxed">
          Upload your notes, generate interactive practice quizzes, track your study milestones, and chat with a specialized AI co-pilot trained on your materials.
        </p>

        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link to="/register" className="px-8 py-4 text-base font-bold text-white bg-gradient-to-r from-primary-600 to-indigo-600 hover:from-primary-500 hover:to-indigo-500 rounded-xl transition-all shadow-xl shadow-primary-600/25 flex items-center gap-2 group hover:scale-[1.03]">
            Start Learning Free 
            <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
          </Link>
          <a href="#features" className="px-8 py-4 text-base font-bold text-slate-300 glass-panel hover:bg-white/[0.04] rounded-xl transition-all border border-white/10 hover:border-white/20">
            Learn More
          </a>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="relative max-w-6xl mx-auto w-full px-6 py-16 z-10">
        <div className="text-center mb-12">
          <h2 className="text-2xl sm:text-3xl font-extrabold text-white">Features Built for Success</h2>
          <p className="text-sm text-slate-400 mt-2">Everything you need to master your exams and assignments</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          
          {/* Card 1: Notes */}
          <div className="glass-panel glass-panel-hover p-6 rounded-2xl">
            <div className="p-3 bg-primary-500/10 w-fit rounded-xl border border-primary-500/20 mb-5">
              <BookOpen className="h-6 w-6 text-primary-400" />
            </div>
            <h3 className="text-lg font-bold text-white mb-2">Smart Notes Keeper</h3>
            <p className="text-sm text-slate-400 leading-relaxed">
              Create, organize, and view study guides and lecture notes. Supports digital text and local document uploads.
            </p>
          </div>

          {/* Card 2: AI Chat */}
          <div className="glass-panel glass-panel-hover p-6 rounded-2xl">
            <div className="p-3 bg-indigo-500/10 w-fit rounded-xl border border-indigo-500/20 mb-5">
              <BrainCircuit className="h-6 w-6 text-indigo-400" />
            </div>
            <h3 className="text-lg font-bold text-white mb-2">Contextual AI Chat</h3>
            <p className="text-sm text-slate-400 leading-relaxed">
              Ask deep conceptual questions. Gemini reads your selected notes to summarize theories, explain math, and draft custom plans.
            </p>
          </div>

          {/* Card 3: Quizzes */}
          <div className="glass-panel glass-panel-hover p-6 rounded-2xl">
            <div className="p-3 bg-emerald-500/10 w-fit rounded-xl border border-emerald-500/20 mb-5">
              <FileCheck className="h-6 w-6 text-emerald-400" />
            </div>
            <h3 className="text-lg font-bold text-white mb-2">Instant MCQ Quizzes</h3>
            <p className="text-sm text-slate-400 leading-relaxed">
              Generate dynamic multiple-choice assessments automatically from note pages to verify retention.
            </p>
          </div>

        </div>
      </section>

      {/* Bottom Footer */}
      <footer className="relative border-t border-white/5 bg-black/20 py-8 z-10">
        <div className="max-w-7xl mx-auto px-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
          <div className="flex items-center gap-1.5">
            <GraduationCap className="h-4 w-4 text-slate-400" />
            <span>&copy; {new Date().getFullYear()} AI Study Buddy. Production-Ready App.</span>
          </div>
          <div className="flex items-center gap-4">
            <a href="#" className="hover:text-slate-300">Privacy Policy</a>
            <a href="#" className="hover:text-slate-300">Terms of Service</a>
            <span className="flex items-center gap-1"><Lock className="h-3 w-3" /> Secure JWT Auth</span>
          </div>
        </div>
      </footer>

    </div>
  );
}
