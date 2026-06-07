import React from 'react';
import { Link } from 'react-router-dom';
import { 
  GraduationCap, 
  BrainCircuit, 
  BookOpen, 
  FileCheck, 
  Lock,
  ArrowRight
} from 'lucide-react';

export default function LandingPage() {
  return (
    <div className="relative min-h-screen bg-[#faf9f6] dark:bg-[#0c0e12] overflow-hidden text-slate-800 dark:text-slate-100 flex flex-col justify-between transition-colors duration-300">
      
      {/* Navbar Header */}
      <nav className="relative max-w-7xl mx-auto w-full px-6 py-6 flex items-center justify-between z-10 border-b border-slate-200/50 dark:border-slate-800/50">
        <div className="flex items-center gap-2.5">
          <div className="p-2 bg-slate-100 dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700">
            <GraduationCap className="h-6 w-6 text-slate-700 dark:text-slate-200" />
          </div>
          <span className="font-bold text-xl tracking-tight text-slate-900 dark:text-white">
            StudyBuddy
          </span>
        </div>

        <div className="flex items-center gap-4">
          <Link to="/login" className="px-4 py-2 text-sm font-medium text-slate-600 dark:text-slate-400 hover:text-slate-950 dark:hover:text-white transition-all">
            Login
          </Link>
          <Link to="/register" className="px-4 py-2 text-sm font-semibold text-white bg-slate-900 hover:bg-slate-800 dark:bg-slate-100 dark:text-slate-950 dark:hover:bg-slate-200 rounded-lg transition-all shadow-sm">
            Get Started
          </Link>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative max-w-4xl mx-auto w-full px-6 pt-20 pb-16 text-center z-10 flex flex-col items-center">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-100 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-xs text-slate-600 dark:text-slate-300 font-semibold mb-6">
          AI-Assisted Study Platform
        </div>
        
        <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight leading-tight max-w-3xl text-slate-900 dark:text-white mb-6">
          Supercharge your learning with a personalized Study Buddy
        </h1>

        <p className="text-base sm:text-lg text-slate-500 dark:text-slate-400 max-w-2xl mb-10 leading-relaxed">
          Upload notes, generate practice quizzes, track milestones, and query a dedicated study agent trained directly on your textbook materials.
        </p>

        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link to="/register" className="px-6 py-3.5 text-sm font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg transition-all flex items-center gap-2 group shadow-sm">
            Start Learning Free 
            <ArrowRight className="h-4 w-4 group-hover:translate-x-0.5 transition-transform" />
          </Link>
          <a href="#features" className="px-6 py-3.5 text-sm font-bold text-slate-700 dark:text-slate-350 bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-850 rounded-lg border border-slate-200 dark:border-slate-800 transition-all">
            Learn More
          </a>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="relative max-w-6xl mx-auto w-full px-6 py-16 z-10">
        <div className="text-center mb-12">
          <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white">Features Built for Success</h2>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-450 mt-2">Everything you need to master your exams and assignments</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          
          {/* Card 1: Notes */}
          <div className="glass-panel p-6 rounded-xl flex flex-col justify-between min-h-[200px]">
            <div>
              <div className="p-2.5 bg-slate-100 dark:bg-slate-850 w-fit rounded-lg border border-slate-200 dark:border-slate-750 mb-5">
                <BookOpen className="h-5 w-5 text-slate-700 dark:text-slate-300" />
              </div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white mb-2">Smart Notes Keeper</h3>
              <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 leading-relaxed">
                Create, organize, and view study guides and lecture notes. Supports digital text and local document uploads.
              </p>
            </div>
          </div>

          {/* Card 2: AI Chat */}
          <div className="glass-panel p-6 rounded-xl flex flex-col justify-between min-h-[200px]">
            <div>
              <div className="p-2.5 bg-slate-100 dark:bg-slate-850 w-fit rounded-lg border border-slate-200 dark:border-slate-750 mb-5">
                <BrainCircuit className="h-5 w-5 text-slate-700 dark:text-slate-300" />
              </div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white mb-2">Contextual AI Chat</h3>
              <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 leading-relaxed">
                Ask deep conceptual questions. AI reads your selected notes to summarize theories, explain math, and draft custom plans.
              </p>
            </div>
          </div>

          {/* Card 3: Quizzes */}
          <div className="glass-panel p-6 rounded-xl flex flex-col justify-between min-h-[200px]">
            <div>
              <div className="p-2.5 bg-slate-100 dark:bg-slate-850 w-fit rounded-lg border border-slate-200 dark:border-slate-750 mb-5">
                <FileCheck className="h-5 w-5 text-slate-700 dark:text-slate-300" />
              </div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white mb-2">MCQ Quizzes</h3>
              <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 leading-relaxed">
                Generate dynamic multiple-choice assessments automatically from note pages to verify retention.
              </p>
            </div>
          </div>

        </div>
      </section>

      {/* Bottom Footer */}
      <footer className="relative border-t border-slate-200 dark:border-slate-800/80 bg-slate-100/40 dark:bg-[#07090e] py-8 z-10">
        <div className="max-w-7xl mx-auto px-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
          <div className="flex items-center gap-1.5">
            <GraduationCap className="h-4 w-4 text-slate-450" />
            <span>&copy; {new Date().getFullYear()} StudyBuddy. All rights reserved.</span>
          </div>
          <div className="flex items-center gap-4">
            <a href="#" className="hover:text-slate-800 dark:hover:text-slate-300 transition-colors">Privacy Policy</a>
            <a href="#" className="hover:text-slate-800 dark:hover:text-slate-300 transition-colors">Terms of Service</a>
            <span className="flex items-center gap-1"><Lock className="h-3 w-3" /> Secure JWT Auth</span>
          </div>
        </div>
      </footer>

    </div>
  );
}
