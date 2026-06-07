import React, { useState, useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import { 
  Sparkles, 
  Send, 
  Bot, 
  User, 
  BookOpen, 
  FileText, 
  Calendar,
  AlertCircle,
  HelpCircle,
  MessageSquare,
  Settings,
  Key,
  Check,
  Zap
} from 'lucide-react';
import api from '../services/api';
import axios from 'axios';


export default function ChatPage() {
  const location = useLocation();
  const initialNoteId = location.state?.noteId || '';

  const [notes, setNotes] = useState([]);
  const [selectedNoteId, setSelectedNoteId] = useState(initialNoteId);
  const [messages, setMessages] = useState([
    {
      sender: 'bot',
      text: "Hello! I am your AI Study Buddy. Select a study guide above to train me on your notes, or just ask any general study questions. I can explain complex terms, summarize material, or build study plans!"
    }
  ]);
  const [inputMessage, setInputMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  const [showSettings, setShowSettings] = useState(false);
  const [aiProvider, setAiProvider] = useState(localStorage.getItem('ai_provider') || 'gemini');
  const [savedGeminiKey, setSavedGeminiKey] = useState(localStorage.getItem('gemini_api_key') || '');
  const [tempGeminiKey, setTempGeminiKey] = useState(localStorage.getItem('gemini_api_key') || '');
  const [savedOpenAiKey, setSavedOpenAiKey] = useState(localStorage.getItem('openai_api_key') || '');
  const [tempOpenAiKey, setTempOpenAiKey] = useState(localStorage.getItem('openai_api_key') || '');
  const [testingKey, setTestingKey] = useState(false);
  const [apiKeySuccess, setApiKeySuccess] = useState('');
  const [apiKeyError, setApiKeyError] = useState('');

  const handleSwitchProvider = (newProvider) => {
    localStorage.setItem('ai_provider', newProvider);
    setAiProvider(newProvider);
    setApiKeySuccess('');
    setApiKeyError('');
  };

  const handleSaveGeminiKey = async () => {
    if (!tempGeminiKey.trim()) {
      setApiKeyError('Please enter a Gemini API key.');
      return;
    }
    setTestingKey(true);
    setApiKeySuccess('');
    setApiKeyError('');
    try {
      localStorage.setItem('gemini_api_key', tempGeminiKey.trim());
      localStorage.setItem('gemini_model', 'models/gemini-2.0-flash-lite');
      setSavedGeminiKey(tempGeminiKey.trim());
      setApiKeySuccess('Gemini API key saved successfully!');
      await api.put('/api/ai/api-key', { geminiApiKey: tempGeminiKey.trim() });
    } catch (err) {
      console.error(err);
      setApiKeyError('Failed to save Gemini key in database.');
    } finally {
      setTestingKey(false);
    }
  };

  const handleSaveOpenAiKey = async () => {
    if (!tempOpenAiKey.trim()) {
      setApiKeyError('Please enter an OpenAI API key.');
      return;
    }
    setTestingKey(true);
    setApiKeySuccess('');
    setApiKeyError('');
    try {
      localStorage.setItem('openai_api_key', tempOpenAiKey.trim());
      setSavedOpenAiKey(tempOpenAiKey.trim());
      setApiKeySuccess('OpenAI API key saved successfully!');
      await api.put('/api/ai/api-key', { openAiApiKey: tempOpenAiKey.trim() });
    } catch (err) {
      console.error(err);
      setApiKeyError('Failed to save OpenAI key in database.');
    } finally {
      setTestingKey(false);
    }
  };

  const handleClearGeminiKey = async () => {
    localStorage.removeItem('gemini_api_key');
    localStorage.removeItem('gemini_model');
    setSavedGeminiKey('');
    setTempGeminiKey('');
    setApiKeySuccess('Gemini API key cleared successfully.');
    try {
      await api.put('/api/ai/api-key', { geminiApiKey: null });
    } catch (dbErr) {
      console.error('Failed to clear Gemini key in database:', dbErr);
    }
  };

  const handleClearOpenAiKey = async () => {
    localStorage.removeItem('openai_api_key');
    setSavedOpenAiKey('');
    setTempOpenAiKey('');
    setApiKeySuccess('OpenAI API key cleared successfully.');
    try {
      await api.put('/api/ai/api-key', { openAiApiKey: null });
    } catch (dbErr) {
      console.error('Failed to clear OpenAI key in database:', dbErr);
    }
  };

  const chatEndRef = useRef(null);

  useEffect(() => {
    fetchNotes();
  }, []);

  useEffect(() => {
    // Auto Scroll to bottom of chat
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  const fetchNotes = async () => {
    try {
      const response = await api.get('/api/notes');
      setNotes(response.data);
    } catch (err) {
      console.error(err);
      setError('Could not retrieve study notes to choose as context.');
    }
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!inputMessage.trim() || loading) return;

    const userText = inputMessage;
    setInputMessage('');
    setError('');
    
    // Add user message to state
    setMessages(prev => [...prev, { sender: 'user', text: userText }]);
    setLoading(true);

    try {
      const payload = {
        message: userText,
        noteId: selectedNoteId ? parseInt(selectedNoteId) : null
      };

      const response = await api.post('/api/ai/chat', payload);
      setMessages(prev => [...prev, { sender: 'bot', text: response.data.response }]);
    } catch (err) {
      console.error(err);
      setError('Error communicating with AI Study Buddy. Verify server configuration.');
      setMessages(prev => [...prev, { sender: 'bot', text: "Sorry, I encountered an error. Please verify that your backend and Gemini API keys are configured." }]);
    } finally {
      setLoading(false);
    }
  };

  const handleTriggerSummary = async () => {
    if (!selectedNoteId) {
      setError('Please select a study guide first to generate a summary.');
      return;
    }

    setError('');
    setMessages(prev => [...prev, { sender: 'user', text: "Summarize this study guide for me." }]);
    setLoading(true);

    try {
      const response = await api.post('/api/ai/summarize', {
        noteId: parseInt(selectedNoteId)
      });
      setMessages(prev => [...prev, { sender: 'bot', text: response.data.response }]);
    } catch (err) {
      console.error(err);
      setError('Failed to generate summary.');
    } finally {
      setLoading(false);
    }
  };

  const handleTriggerStudyPlan = async () => {
    if (!selectedNoteId) {
      setError('Please select a study guide first to create a study plan.');
      return;
    }

    setError('');
    setMessages(prev => [...prev, { sender: 'user', text: "Build a 7-day study plan from this material." }]);
    setLoading(true);

    try {
      const response = await api.post('/api/ai/study-plan', {
        noteId: parseInt(selectedNoteId),
        durationDays: 7
      });
      setMessages(prev => [...prev, { sender: 'bot', text: response.data.response }]);
    } catch (err) {
      console.error(err);
      setError('Failed to generate study plan.');
    } finally {
      setLoading(false);
    }
  };

  // Helper to parse markdown inside chat bubbles (headers, lists, bold text)
  const formatText = (text) => {
    if (!text) return '';
    return text.split('\n').map((line, i) => {
      let content = line;
      let styleClass = "my-1 text-sm leading-relaxed text-slate-700 dark:text-slate-300";

      // Headers
      if (line.startsWith('### ')) {
        content = line.substring(4);
        styleClass = "text-base font-bold text-slate-900 dark:text-white mt-3 mb-1.5 border-b border-slate-200 dark:border-slate-850 pb-1 block";
      } else if (line.startsWith('## ')) {
        content = line.substring(3);
        styleClass = "text-lg font-extrabold text-slate-900 dark:text-white mt-4 mb-2 block";
      } else if (line.startsWith('# ')) {
        content = line.substring(2);
        styleClass = "text-xl font-black text-slate-900 dark:text-white mt-4 mb-2 block";
      }
      // Bullet points
      else if (line.trim().startsWith('* ') || line.trim().startsWith('- ')) {
        content = '• ' + line.trim().substring(2);
        styleClass = "pl-4 text-sm text-slate-600 dark:text-slate-405 my-0.5 list-none";
      }

      // Bold formatting parsing **text**
      const boldRegex = /\*\*(.*?)\*\*/g;
      const parts = [];
      let lastIndex = 0;
      let match;
      
      while ((match = boldRegex.exec(content)) !== null) {
        // Add preceding text
        if (match.index > lastIndex) {
          parts.push(content.substring(lastIndex, match.index));
        }
        // Add bolded text
        parts.push(<strong key={match.index} className="text-slate-950 dark:text-white font-semibold">{match[1]}</strong>);
        lastIndex = boldRegex.lastIndex;
      }
      
      if (lastIndex < content.length) {
        parts.push(content.substring(lastIndex));
      }

      return (
        <span key={i} className={styleClass}>
          {parts.length > 0 ? parts : content}
          <br />
        </span>
      );
    });
  };

  return (
    <div className="flex flex-col h-[82vh] max-h-[82vh] text-slate-800 dark:text-slate-200">
      
      {/* Top Header: Select Note Context */}
      <div className="glass-panel p-4 rounded-xl border border-slate-200 dark:border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4">
        
        <div className="flex items-center gap-3">
          <div className="p-2 bg-slate-100 dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300">
            <Bot className="h-5 w-5" />
          </div>
          <div>
            <h2 className="text-sm font-bold text-slate-900 dark:text-white tracking-tight">Study Chat Workspace</h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">Ask questions and review study guide context</p>
          </div>
        </div>

        {/* Dropdown & Quick Actions */}
        <div className="flex flex-wrap items-center gap-3">
          
          <div className="flex items-center gap-2">
            <BookOpen className="h-4 w-4 text-slate-455" />
            <select
              value={selectedNoteId}
              onChange={(e) => setSelectedNoteId(e.target.value)}
              className="glass-input py-1.5 px-3 text-xs w-48 focus:ring-1 focus:ring-slate-350 bg-white dark:bg-slate-900 border-slate-250 dark:border-slate-800"
            >
              <option value="">-- No Context (General) --</option>
              {notes.map(note => (
                <option key={note.id} value={note.id}>{note.title}</option>
              ))}
            </select>
          </div>

          <button
            onClick={handleTriggerSummary}
            disabled={!selectedNoteId || loading}
            className="px-3 py-1.5 rounded-lg bg-white hover:bg-slate-50 dark:bg-slate-900 dark:hover:bg-slate-850 border border-slate-200 dark:border-slate-800 text-xs font-semibold text-slate-700 dark:text-slate-300 transition-all flex items-center gap-1.5 disabled:opacity-45 shadow-sm"
            title="Summarize Note"
          >
            <FileText className="h-3.5 w-3.5 text-slate-400" /> Summarize
          </button>

          <button
            onClick={handleTriggerStudyPlan}
            disabled={!selectedNoteId || loading}
            className="px-3 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 dark:bg-slate-100 dark:text-slate-950 dark:hover:bg-slate-200 text-xs font-semibold text-white transition-all flex items-center gap-1.5 disabled:opacity-45 shadow-sm"
            title="7-Day Study Plan"
          >
            <Calendar className="h-3.5 w-3.5 opacity-80" /> Study Plan
          </button>

          <button
            type="button"
            onClick={() => setShowSettings(!showSettings)}
            className={`px-3 py-1.5 rounded-lg border transition-all flex items-center gap-1.5 text-xs font-bold ${
              (aiProvider === 'openai' ? savedOpenAiKey : savedGeminiKey) 
                ? 'bg-emerald-50 dark:bg-emerald-950/20 border-emerald-200 dark:border-emerald-900/30 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-100/50' 
                : 'bg-rose-50 dark:bg-rose-950/20 border-rose-200 dark:border-rose-900/30 text-rose-600 dark:text-rose-400 hover:bg-rose-100/50'
            }`}
            title="Configure AI API Keys"
          >
            <Settings className="h-3.5 w-3.5" />
            {(aiProvider === 'openai' ? savedOpenAiKey : savedGeminiKey) 
              ? `${aiProvider === 'openai' ? 'OpenAI' : 'Gemini'} Live` 
              : 'AI Keys Config'}
          </button>

        </div>

      </div>

      {showSettings && (
        <div className="glass-panel p-4 rounded-xl border border-slate-200 dark:border-slate-800 mb-4 space-y-4 shadow-sm animate-fade-in">
          {/* Provider Selector */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-200 dark:border-slate-800">
            <div className="flex items-center gap-2">
              <span className="text-xs text-slate-655 dark:text-slate-350 font-semibold">Active AI Provider:</span>
              <select
                value={aiProvider}
                onChange={(e) => handleSwitchProvider(e.target.value)}
                className="glass-input py-1 px-3 text-xs w-48 focus:ring-1 bg-white dark:bg-slate-900 border-slate-250 dark:border-slate-800"
              >
                <option value="gemini">Google Gemini</option>
                <option value="openai">OpenAI ChatGPT</option>
              </select>
            </div>
            <span className="text-[10px] text-slate-400 dark:text-slate-500 font-medium">
              {aiProvider === 'openai' ? (
                <>Get key at <a href="https://platform.openai.com/api-keys" target="_blank" rel="noopener noreferrer" className="text-indigo-600 dark:text-indigo-400 underline hover:opacity-80">OpenAI API Keys</a></>
              ) : (
                <>Get key at <a href="https://aistudio.google.com/" target="_blank" rel="noopener noreferrer" className="text-indigo-600 dark:text-indigo-400 underline hover:opacity-80">Google AI Studio</a></>
              )}
            </span>
          </div>

          {/* Key Configuration Inputs */}
          {aiProvider === 'openai' ? (
            <div className="space-y-3">
              <h3 className="text-xs font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                OpenAI API Key Configuration
              </h3>
              <div className="flex flex-col sm:flex-row gap-3">
                <div className="flex-1">
                  <input
                    type="password"
                    value={tempOpenAiKey}
                    onChange={(e) => {
                      setTempOpenAiKey(e.target.value);
                      setApiKeySuccess('');
                      setApiKeyError('');
                    }}
                    placeholder={savedOpenAiKey ? "••••••••••••••••••••••••••••••••" : "Enter OpenAI API Key (sk-...)"}
                    className="w-full glass-input text-xs py-2 px-3"
                  />
                </div>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={handleSaveOpenAiKey}
                    disabled={testingKey}
                    className="px-4 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs transition-all flex items-center gap-1 disabled:opacity-50"
                  >
                    {testingKey ? 'Saving...' : 'Save Key'}
                  </button>
                  {savedOpenAiKey && (
                    <button
                      type="button"
                      onClick={handleClearOpenAiKey}
                      className="px-4 py-2 rounded-lg bg-rose-50 border border-rose-200 hover:bg-rose-100 text-xs font-semibold text-rose-600 dark:bg-rose-950/20 dark:border-rose-900/30 dark:text-rose-400 transition-all"
                    >
                      Clear Key
                    </button>
                  )}
                </div>
              </div>
            </div>
          ) : (
            <div className="space-y-3">
              <h3 className="text-xs font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                Google Gemini API Key Configuration
              </h3>
              <div className="flex flex-col sm:flex-row gap-3">
                <div className="flex-1">
                  <input
                    type="password"
                    value={tempGeminiKey}
                    onChange={(e) => {
                      setTempGeminiKey(e.target.value);
                      setApiKeySuccess('');
                      setApiKeyError('');
                    }}
                    placeholder={savedGeminiKey ? "••••••••••••••••••••••••••••••••" : "Enter Gemini API Key (AIzaSy...)"}
                    className="w-full glass-input text-xs py-2 px-3"
                  />
                </div>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={handleSaveGeminiKey}
                    disabled={testingKey}
                    className="px-4 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs transition-all flex items-center gap-1 disabled:opacity-50"
                  >
                    {testingKey ? 'Saving...' : 'Save Key'}
                  </button>
                  {savedGeminiKey && (
                    <button
                      type="button"
                      onClick={handleClearGeminiKey}
                      className="px-4 py-2 rounded-lg bg-rose-50 border border-rose-200 hover:bg-rose-100 text-xs font-semibold text-rose-600 dark:bg-rose-950/20 dark:border-rose-900/30 dark:text-rose-400 transition-all"
                    >
                      Clear Key
                    </button>
                  )}
                </div>
              </div>
            </div>
          )}
          
          {apiKeySuccess && (
            <p className="text-xs text-emerald-600 dark:text-emerald-400 font-semibold flex items-center gap-1">
              <Check className="h-3.5 w-3.5" /> {apiKeySuccess}
            </p>
          )}
          {apiKeyError && (
            <p className="text-xs text-rose-600 dark:text-rose-400 font-semibold flex items-center gap-1">
              <AlertCircle className="h-3.5 w-3.5" /> {apiKeyError}
            </p>
          )}
          
          <p className="text-[10px] text-slate-455 dark:text-slate-500">
            API keys are saved in local storage to authenticate requests dynamically. They are never logged on the server.
          </p>
        </div>
      )}

      {error && (
        <div className="flex items-center gap-2.5 p-3 mb-3 rounded-lg bg-rose-50 dark:bg-rose-950/20 border border-rose-200 dark:border-rose-900/30 text-rose-600 dark:text-rose-400 text-xs">
          <AlertCircle className="h-4 w-4 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Chat Messages Box */}
      <div className="flex-1 overflow-y-auto glass-panel border border-slate-200 dark:border-slate-800 rounded-xl p-6 space-y-5 mb-4">
        
        {messages.map((msg, idx) => {
          const isBot = msg.sender === 'bot';
          return (
            <div key={idx} className={`flex items-start gap-3.5 ${isBot ? '' : 'flex-row-reverse'}`}>
              
              {/* Avatar */}
              <div className={`
                h-8 w-8 rounded-full flex items-center justify-center font-bold text-xs flex-shrink-0 border
                ${isBot 
                  ? 'bg-slate-100 border-slate-200 text-slate-700 dark:bg-slate-850 dark:border-slate-700 dark:text-slate-200' 
                  : 'bg-indigo-50 border-indigo-100 text-indigo-700 dark:bg-indigo-950/30 dark:border-indigo-900/40 dark:text-indigo-300'}
              `}>
                {isBot ? <Bot className="h-4 w-4" /> : <User className="h-4 w-4" />}
              </div>

              {/* Message Bubble */}
              <div className={`
                p-4 rounded-xl max-w-xl text-slate-800 dark:text-slate-250 border text-sm leading-relaxed
                ${isBot 
                  ? 'bg-white dark:bg-[#151b29] border-slate-250/50 dark:border-slate-800/80 shadow-sm' 
                  : 'bg-indigo-600 border-indigo-700 text-white shadow-sm'}
              `}>
                {isBot ? formatText(msg.text) : <p className="whitespace-pre-wrap">{msg.text}</p>}
              </div>

            </div>
          );
        })}

        {/* AI Typing Indicator */}
        {loading && (
          <div className="flex items-start gap-3.5">
            <div className="h-8 w-8 rounded-full bg-slate-100 border border-slate-200 text-slate-700 dark:bg-slate-850 dark:border-slate-700 dark:text-slate-200 flex items-center justify-center font-bold text-xs flex-shrink-0">
              <Bot className="h-4 w-4" />
            </div>
            <div className="bg-white dark:bg-[#151b29] border-slate-250/50 dark:border-slate-800/80 p-4 rounded-xl flex items-center gap-1.5 shadow-sm">
              <div className="w-1.5 h-1.5 rounded-full bg-slate-400 dark:bg-slate-650 animate-bounce"></div>
              <div className="w-1.5 h-1.5 rounded-full bg-slate-400 dark:bg-slate-650 animate-bounce" style={{ animationDelay: '0.15s' }}></div>
              <div className="w-1.5 h-1.5 rounded-full bg-slate-400 dark:bg-slate-650 animate-bounce" style={{ animationDelay: '0.3s' }}></div>
            </div>
          </div>
        )}

        <div ref={chatEndRef} />
      </div>

      {/* Message Input Bar */}
      <form onSubmit={handleSendMessage} className="flex gap-2">
        <input
          type="text"
          value={inputMessage}
          onChange={(e) => setInputMessage(e.target.value)}
          placeholder={selectedNoteId ? "Ask AI about this study guide..." : "Ask general study questions..."}
          className="flex-1 glass-input focus:ring-1 bg-white dark:bg-slate-900 border-slate-250 dark:border-slate-850"
          disabled={loading}
        />
        <button
          type="submit"
          disabled={loading || !inputMessage.trim()}
          className="px-4 py-2.5 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white font-semibold flex items-center justify-center transition-all disabled:opacity-50 shadow-sm"
        >
          <Send className="h-4 w-4" />
        </button>
      </form>

    </div>
  );
}
