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
      setError(err.response?.data?.message || err.message || 'Failed to generate quiz. Please ensure your study guide contains adequate text.');
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
    <div className="max-w-2xl mx-auto space-y-6 text-slate-800 dark:text-slate-200">
      
      {error && (
        <div className="flex items-center gap-2.5 p-3.5 rounded-lg bg-rose-50 dark:bg-rose-955/20 border border-rose-200 dark:border-rose-900/30 text-rose-600 dark:text-rose-400 text-xs sm:text-sm">
          <AlertCircle className="h-4.5 w-4.5 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Mode 1: Quiz Submission Results */}
      {quizSubmitted ? (
        <div className="glass-panel p-8 rounded-xl border border-slate-200 dark:border-slate-800 text-center space-y-6 animate-fade-in">
          
          <div className="p-3.5 bg-slate-105 dark:bg-slate-800 rounded-lg w-fit mx-auto border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300">
            <Award className="h-10 w-10" />
          </div>

          <div className="space-y-1.5">
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">Quiz Completed</h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">Your score has been registered to your profile</p>
          </div>

          {/* Clean Circular Score Indicator */}
          <div className="py-4">
            <div className="h-28 w-28 rounded-full border-2 border-indigo-650 flex flex-col items-center justify-center mx-auto bg-slate-50 dark:bg-slate-900/40 shadow-sm">
              <span className="text-2xl font-extrabold text-slate-900 dark:text-white">{scoreAchieved}%</span>
              <span className="text-[9px] text-slate-450 dark:text-slate-500 uppercase tracking-widest font-bold mt-0.5">Score</span>
            </div>
          </div>

          <div className="max-w-md mx-auto p-4 rounded-lg bg-slate-50 dark:bg-[#151b29] border border-slate-200 dark:border-slate-800 text-xs text-slate-500 dark:text-slate-400 space-y-2.5 text-left">
            <div className="flex justify-between">
              <span>Total Questions:</span>
              <span className="font-semibold text-slate-850 dark:text-slate-200">{questions.length}</span>
            </div>
            <div className="flex justify-between">
              <span>Correct Answers:</span>
              <span className="font-semibold text-emerald-600 dark:text-emerald-400">
                {Math.round((scoreAchieved / 100) * questions.length)} / {questions.length}
              </span>
            </div>
            <div className="flex justify-between">
              <span>Estimated Study Credit:</span>
              <span className="font-semibold text-indigo-600 dark:text-indigo-400">+{questions.length * 2} mins</span>
            </div>
          </div>

          <div className="flex items-center justify-center gap-3 pt-4">
            <button
              onClick={() => {
                setQuiz(null);
                setQuizSubmitted(false);
              }}
              className="px-4 py-2.5 rounded-lg bg-white hover:bg-slate-50 dark:bg-slate-900 dark:hover:bg-slate-850 border border-slate-200 dark:border-slate-800 text-xs font-semibold text-slate-700 dark:text-slate-300 transition-all shadow-sm"
            >
              Take Another Quiz
            </button>
            <button
              onClick={() => navigate('/results')}
              className="px-4 py-2.5 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-xs font-semibold text-white transition-all shadow-sm"
            >
              View History
            </button>
          </div>

        </div>
      ) : quiz ? (
        
        // Mode 2: Quiz Engine Running
        <div className="glass-panel p-6 rounded-xl border border-slate-200 dark:border-slate-800 space-y-6 animate-fade-in">
          
          {/* Header Progress indicator */}
          <div className="space-y-3">
            <div className="flex justify-between text-xs text-slate-550 dark:text-slate-400">
              <span className="font-bold text-slate-850 dark:text-slate-300 truncate max-w-[70%]">{quiz.title}</span>
              <span className="font-semibold flex-shrink-0">Question {currentQuestionIndex + 1} of {questions.length}</span>
            </div>

            {/* Progress bar */}
            <div className="w-full bg-slate-100 dark:bg-slate-850 h-1.5 rounded-full overflow-hidden">
              <div 
                className="bg-indigo-600 h-full transition-all duration-200"
                style={{ width: `${((currentQuestionIndex + 1) / questions.length) * 100}%` }}
              ></div>
            </div>
          </div>

          {/* Active Question Box */}
          <div className="p-5 rounded-lg bg-slate-50/50 dark:bg-slate-900/30 border border-slate-200 dark:border-slate-800 space-y-4">
            <h3 className="font-bold text-sm sm:text-base text-slate-850 dark:text-slate-100 flex items-start gap-2 leading-relaxed">
              <HelpCircle className="h-5 w-5 text-indigo-550 dark:text-indigo-400 flex-shrink-0 mt-0.5" />
              <span>{questions[currentQuestionIndex]?.question}</span>
            </h3>
          </div>

          {/* Options List */}
          <div className="space-y-2.5">
            {questions[currentQuestionIndex]?.options.map((option, idx) => {
              const isSelected = selectedAnswers[currentQuestionIndex] === option;
              return (
                <button
                  key={idx}
                  onClick={() => handleSelectOption(option)}
                  className={`
                    w-full text-left p-4 rounded-lg text-xs sm:text-sm transition-all border flex items-center justify-between
                    ${isSelected 
                      ? 'bg-indigo-50/50 border-indigo-550 text-indigo-750 dark:bg-indigo-950/20 dark:border-indigo-850 dark:text-indigo-300 font-semibold' 
                      : 'bg-white hover:bg-slate-50 dark:bg-slate-900 dark:hover:bg-slate-850 border-slate-200 dark:border-slate-800 text-slate-650 dark:text-slate-350'}
                  `}
                >
                  <span>{option}</span>
                  <div className={`
                    h-4 w-4 rounded-full border flex items-center justify-center flex-shrink-0
                    ${isSelected ? 'border-indigo-600 bg-indigo-600' : 'border-slate-300 dark:border-slate-700'}
                  `}>
                    {isSelected && <div className="h-1.5 w-1.5 rounded-full bg-white"></div>}
                  </div>
                </button>
              );
            })}
          </div>

          {/* Actions Next/Prev/Submit */}
          <div className="flex items-center justify-between pt-4 border-t border-slate-200 dark:border-slate-800">
            <button
              onClick={handlePrevQuestion}
              disabled={currentQuestionIndex === 0}
              className="px-3.5 py-2 text-xs font-semibold rounded-lg bg-white hover:bg-slate-50 dark:bg-slate-900 dark:hover:bg-slate-850 border border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-400 disabled:opacity-40 shadow-sm"
            >
              Previous
            </button>

            {currentQuestionIndex === questions.length - 1 ? (
              <button
                onClick={handleSubmitQuiz}
                disabled={loading}
                className="px-4 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-xs font-semibold text-white transition-all shadow-sm flex items-center gap-1.5"
              >
                {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <FileCheck className="h-4 w-4" />}
                Submit Answers
              </button>
            ) : (
              <button
                onClick={handleNextQuestion}
                disabled={!selectedAnswers[currentQuestionIndex]}
                className="px-4 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-xs font-semibold text-white transition-all shadow-sm flex items-center gap-1.5 disabled:opacity-50"
              >
                Next Question <ArrowRight className="h-4 w-4" />
              </button>
            )}
          </div>

        </div>
      ) : (
        
        // Mode 3: Quiz Setup Configuration
        <div className="glass-panel p-6 rounded-xl border border-slate-200 dark:border-slate-800 space-y-6 animate-fade-in">
          
          <div className="border-b border-slate-200 dark:border-slate-800 pb-4">
            <h2 className="text-xl font-bold text-slate-900 dark:text-white tracking-tight flex items-center gap-2">
              <BrainCircuit className="h-5.5 w-5.5 text-indigo-650 dark:text-indigo-400" /> AI Practice Exam Room
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Generate dynamic assessments to verify your note guides instantly</p>
          </div>

          <form onSubmit={handleGenerateQuiz} className="space-y-6">
            
            {/* Select Study Context */}
            <div>
              <label className="block text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-2">
                1. Select Study Material
              </label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-slate-450 dark:text-slate-500">
                  <BookOpen className="h-4.5 w-4.5" />
                </span>
                <select
                  value={selectedNoteId}
                  onChange={(e) => setSelectedNoteId(e.target.value)}
                  className="w-full glass-input pl-11 bg-white dark:bg-slate-900 border-slate-250 dark:border-slate-800 focus:ring-1 focus:ring-slate-350"
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
              <label className="block text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-2.5">
                2. Number of MCQ Questions
              </label>
              <div className="grid grid-cols-2 gap-4">
                {[5, 10].map(count => (
                  <button
                    key={count}
                    type="button"
                    onClick={() => setQuestionCount(count)}
                    className={`
                      py-3 px-4 rounded-lg border font-semibold text-xs sm:text-sm transition-all shadow-sm
                      ${questionCount === count 
                        ? 'bg-indigo-50/50 border-indigo-500 text-indigo-700 dark:bg-indigo-950/20 dark:border-indigo-850 dark:text-indigo-300' 
                        : 'bg-white hover:bg-slate-50 dark:bg-slate-900 dark:hover:bg-slate-850 border-slate-200 dark:border-slate-800 text-slate-550 dark:text-slate-400'}
                    `}
                  >
                    {count} Questions
                  </button>
                ))}
              </div>
            </div>

            {/* Submit / Generate Trigger */}
            <button
              type="submit"
              disabled={loading || notes.length === 0}
              className="w-full py-3 px-4 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-lg transition-all shadow-sm flex items-center justify-center gap-2 group disabled:opacity-50 text-sm"
            >
              {loading ? (
                <>
                  <Loader2 className="h-4.5 w-4.5 animate-spin" />
                  Generating quiz using AI...
                </>
              ) : (
                <>
                  Generate Practice Quiz
                  <ArrowRight className="h-4 w-4 group-hover:translate-x-0.5 transition-transform" />
                </>
              )}
            </button>

          </form>

        </div>
      )}

    </div>
  );
}
