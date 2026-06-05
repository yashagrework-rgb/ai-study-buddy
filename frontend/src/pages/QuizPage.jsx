import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  BrainCircuit, 
  HelpCircle, 
  ArrowRight, 
  BookOpen, 
  FileCheck, 
  AlertCircle,
  Loader2,
  CheckCircle,
  XCircle,
  Award
} from 'lucide-react';
import api from '../services/api';

export default function QuizPage() {
  const navigate = useNavigate();

  const [notes, setNotes] = useState([]);
  const [selectedNoteId, setSelectedNoteId] = useState('');
  const [questionCount, setQuestionCount] = useState(5);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Active Quiz Running States
  const [quiz, setQuiz] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState({});
  const [quizSubmitted, setQuizSubmitted] = useState(false);
  const [scoreAchieved, setScoreAchieved] = useState(0);

  useEffect(() => {
    fetchNotes();
  }, []);

  const fetchNotes = async () => {
    try {
      const response = await api.get('/api/notes');
      setNotes(response.data);
    } catch (err) {
      console.error(err);
      setError('Could not retrieve notes list to build quiz.');
    }
  };

  const handleGenerateQuiz = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    
    // Reset active quiz states
    setQuiz(null);
    setQuestions([]);
    setCurrentQuestionIndex(0);
    setSelectedAnswers({});
    setQuizSubmitted(false);

    try {
      const payload = {
        noteId: selectedNoteId ? parseInt(selectedNoteId) : null,
        questionCount: questionCount
      };

      const response = await api.post('/api/quiz/generate', payload);
      const generatedQuiz = response.data;
      
      // Parse serialized JSON questions list
      let parsedQuestions = [];
      try {
        parsedQuestions = JSON.parse(generatedQuiz.questions);
      } catch (parseErr) {
        console.error('Failed to parse quiz questions JSON string', parseErr);
        setError('The AI returned an invalid quiz structure. Please try again.');
        setLoading(false);
        return;
      }

      if (parsedQuestions.length === 0) {
        throw new Error('AI generated 0 questions');
      }

      setQuiz(generatedQuiz);
      setQuestions(parsedQuestions);
    } catch (err) {
      console.error(err);
      setError('Failed to generate quiz. Please ensure your study guide contains adequate text.');
    } finally {
      setLoading(false);
    }
  };

  const handleSelectOption = (option) => {
    setSelectedAnswers(prev => ({
      ...prev,
      [currentQuestionIndex]: option
    }));
  };

  const handleNextQuestion = () => {
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
    }
  };

  const handlePrevQuestion = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(currentQuestionIndex - 1);
    }
  };

  const handleSubmitQuiz = async () => {
    // Verify all questions are answered
    if (Object.keys(selectedAnswers).length < questions.length) {
      if (!window.confirm('You have unanswered questions. Are you sure you want to submit?')) {
        return;
      }
    }

    setLoading(true);
    setError('');

    // Calculate score
    let correctCount = 0;
    questions.forEach((q, idx) => {
      if (selectedAnswers[idx] === q.answer) {
        correctCount++;
      }
    });

    const finalScorePercent = Math.round((correctCount / questions.length) * 100);

    try {
      // Submit results to backend
      const payload = {
        quizId: quiz.id,
        score: finalScorePercent,
        studyTime: questions.length * 2 // assume ~2 minutes study time per question
      };

      await api.post('/api/quiz/submit', payload);
      setScoreAchieved(finalScorePercent);
      setQuizSubmitted(true);
    } catch (err) {
      console.error(err);
      setError('Failed to submit your quiz results to the server database.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      
      {error && (
        <div className="flex items-center gap-2.5 p-4 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400 text-sm">
          <AlertCircle className="h-5 w-5 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Mode 1: Quiz Submission Results */}
      {quizSubmitted ? (
        <div className="glass-panel p-8 rounded-3xl border border-white/5 text-center space-y-6 animate-fade-in">
          
          <div className="p-4 bg-primary-500/10 rounded-2xl w-fit mx-auto border border-primary-500/20 text-primary-400">
            <Award className="h-12 w-12" />
          </div>

          <div className="space-y-2">
            <h2 className="text-3xl font-extrabold text-white tracking-tight">Quiz Completed!</h2>
            <p className="text-sm text-slate-400">Your results have been registered to your profile progress</p>
          </div>

          {/* Large Circular Score Grid */}
          <div className="py-6">
            <div className="h-32 w-32 rounded-full border-4 border-primary-500/20 border-t-primary-500 flex flex-col items-center justify-center mx-auto bg-white/[0.01] shadow-glass-sm animate-pulse-slow">
              <span className="text-3xl font-black text-white">{scoreAchieved}%</span>
              <span className="text-[10px] text-slate-500 uppercase tracking-widest font-bold mt-1">Score</span>
            </div>
          </div>

          <div className="max-w-md mx-auto p-4 rounded-xl bg-white/[0.02] border border-white/5 text-xs text-slate-400 space-y-2.5 text-left">
            <div className="flex justify-between">
              <span>Total Questions:</span>
              <span className="font-semibold text-slate-200">{questions.length}</span>
            </div>
            <div className="flex justify-between">
              <span>Correct Answers:</span>
              <span className="font-semibold text-emerald-400">
                {Math.round((scoreAchieved / 100) * questions.length)}
              </span>
            </div>
            <div className="flex justify-between">
              <span>Time Added:</span>
              <span className="font-semibold text-indigo-400">{questions.length * 2} mins study credit</span>
            </div>
          </div>

          <div className="flex items-center justify-center gap-4 pt-4">
            <button
              onClick={() => {
                setQuiz(null);
                setQuizSubmitted(false);
              }}
              className="px-6 py-3 rounded-xl bg-white/[0.03] hover:bg-white/[0.06] border border-white/10 text-sm font-semibold text-slate-300 transition-all"
            >
              Take Another Quiz
            </button>
            <button
              onClick={() => navigate('/results')}
              className="px-6 py-3 rounded-xl bg-primary-600 hover:bg-primary-500 text-sm font-semibold text-white transition-all shadow-md shadow-primary-600/10"
            >
              View Quiz History
            </button>
          </div>

        </div>
      ) : quiz ? (
        
        // Mode 2: Quiz Engine Running
        <div className="glass-panel p-6 rounded-2xl border border-white/5 space-y-6 animate-fade-in">
          
          {/* Header Progress indicator */}
          <div className="space-y-3">
            <div className="flex justify-between text-xs text-slate-400">
              <span className="font-bold text-primary-400">{quiz.title}</span>
              <span className="font-medium">Question {currentQuestionIndex + 1} of {questions.length}</span>
            </div>

            {/* Custom progress bar */}
            <div className="w-full bg-white/5 h-2 rounded-full overflow-hidden">
              <div 
                className="bg-primary-500 h-full transition-all duration-300"
                style={{ width: `${((currentQuestionIndex + 1) / questions.length) * 100}%` }}
              ></div>
            </div>
          </div>

          {/* Active Question Box */}
          <div className="p-5 rounded-xl bg-white/[0.01] border border-white/5 space-y-4">
            <h3 className="font-bold text-base text-slate-100 flex items-start gap-2 leading-relaxed">
              <HelpCircle className="h-5 w-5 text-indigo-400 flex-shrink-0 mt-0.5" />
              <span>{questions[currentQuestionIndex]?.question}</span>
            </h3>
          </div>

          {/* Options List */}
          <div className="space-y-3">
            {questions[currentQuestionIndex]?.options.map((option, idx) => {
              const isSelected = selectedAnswers[currentQuestionIndex] === option;
              return (
                <button
                  key={idx}
                  onClick={() => handleSelectOption(option)}
                  className={`
                    w-full text-left p-4 rounded-xl text-sm transition-all border flex items-center justify-between
                    ${isSelected 
                      ? 'bg-primary-600/15 border-primary-500 text-white font-medium' 
                      : 'bg-white/[0.01] border-white/5 hover:border-white/15 text-slate-300'}
                  `}
                >
                  <span>{option}</span>
                  <div className={`
                    h-4.5 w-4.5 rounded-full border flex items-center justify-center flex-shrink-0
                    ${isSelected ? 'border-primary-400 bg-primary-500' : 'border-slate-600'}
                  `}>
                    {isSelected && <div className="h-2 w-2 rounded-full bg-white"></div>}
                  </div>
                </button>
              );
            })}
          </div>

          {/* Actions Next/Prev/Submit */}
          <div className="flex items-center justify-between pt-4 border-t border-white/5">
            <button
              onClick={handlePrevQuestion}
              disabled={currentQuestionIndex === 0}
              className="px-4 py-2 text-xs font-semibold rounded-lg bg-white/[0.02] border border-white/5 text-slate-400 hover:text-white disabled:opacity-40"
            >
              Previous
            </button>

            {currentQuestionIndex === questions.length - 1 ? (
              <button
                onClick={handleSubmitQuiz}
                disabled={loading}
                className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-xs font-semibold text-white transition-all shadow-md shadow-emerald-600/10 flex items-center gap-1.5"
              >
                {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <FileCheck className="h-4 w-4" />}
                Submit Quiz
              </button>
            ) : (
              <button
                onClick={handleNextQuestion}
                disabled={!selectedAnswers[currentQuestionIndex]}
                className="px-5 py-2.5 rounded-xl bg-primary-600 hover:bg-primary-500 text-xs font-semibold text-white transition-all shadow-md shadow-primary-600/10 flex items-center gap-1.5 disabled:opacity-50"
              >
                Next Question <ArrowRight className="h-4 w-4" />
              </button>
            )}
          </div>

        </div>
      ) : (
        
        // Mode 3: Quiz Setup Configuration
        <div className="glass-panel p-6 rounded-2xl border border-white/5 space-y-6 animate-fade-in">
          
          <div className="border-b border-white/5 pb-4">
            <h2 className="text-2xl font-extrabold text-white tracking-tight flex items-center gap-2">
              <BrainCircuit className="h-6 w-6 text-primary-400" /> AI Practice Exam Room
            </h2>
            <p className="text-xs text-slate-400 mt-1">Generate dynamic checks on note guides instantly</p>
          </div>

          <form onSubmit={handleGenerateQuiz} className="space-y-6">
            
            {/* Select Study Context */}
            <div>
              <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
                1. Select Study Material
              </label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-slate-500">
                  <BookOpen className="h-5 w-5" />
                </span>
                <select
                  value={selectedNoteId}
                  onChange={(e) => setSelectedNoteId(e.target.value)}
                  className="w-full glass-input pl-11"
                  required
                >
                  <option value="">-- Select Note Context --</option>
                  {notes.map(note => (
                    <option key={note.id} value={note.id}>{note.title}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Select Question Count */}
            <div>
              <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2.5">
                2. Number of MCQ Questions
              </label>
              <div className="grid grid-cols-2 gap-4">
                {[5, 10].map(count => (
                  <button
                    key={count}
                    type="button"
                    onClick={() => setQuestionCount(count)}
                    className={`
                      py-3.5 px-4 rounded-xl border font-bold text-sm transition-all
                      ${questionCount === count 
                        ? 'bg-primary-600/15 border-primary-500 text-white' 
                        : 'bg-white/[0.01] border-white/5 hover:border-white/15 text-slate-400'}
                    `}
                  >
                    {count} MCQs
                  </button>
                ))}
              </div>
            </div>

            {/* Submit / Generate Trigger */}
            <button
              type="submit"
              disabled={loading || notes.length === 0}
              className="w-full py-3.5 px-4 bg-gradient-to-r from-primary-600 to-indigo-600 hover:from-primary-500 hover:to-indigo-500 text-white font-bold rounded-xl transition-all shadow-lg shadow-primary-600/20 flex items-center justify-center gap-2 group disabled:opacity-50"
            >
              {loading ? (
                <>
                  <Loader2 className="h-5 w-5 animate-spin" />
                  Generating quiz using Gemini...
                </>
              ) : (
                <>
                  Generate Quiz
                  <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
                </>
              )}
            </button>

          </form>

        </div>
      )}

    </div>
  );
}
