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
      let styleClass = "my-1 text-sm leading-relaxed";

      // Headers
      if (line.startsWith('### ')) {
        content = line.substring(4);
        styleClass = "text-base font-bold text-white mt-3 mb-1.5 border-b border-white/5 pb-1 block";
      } else if (line.startsWith('## ')) {
        content = line.substring(3);
        styleClass = "text-lg font-extrabold text-white mt-4 mb-2 block";
      } else if (line.startsWith('# ')) {
        content = line.substring(2);
        styleClass = "text-xl font-black text-white mt-4 mb-2 block";
      }
      // Bullet points
      else if (line.trim().startsWith('* ') || line.trim().startsWith('- ')) {
        content = '• ' + line.trim().substring(2);
        styleClass = "pl-4 text-sm text-slate-300 my-0.5 list-none";
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
        parts.push(<strong key={match.index} className="text-white font-semibold">{match[1]}</strong>);
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
    <div className="flex flex-col h-[82vh] max-h-[82vh]">
      
      {/* Top Header: Select Note Context */}
      <div className="glass-panel p-4 rounded-2xl border border-white/5 flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4">
        
        <div className="flex items-center gap-3">
          <div className="p-2 bg-primary-500/10 rounded-xl border border-primary-500/20 text-primary-400">
            <Bot className="h-5.5 w-5.5" />
          </div>
          <div>
            <h2 className="text-base font-bold text-white tracking-tight">AI Co-pilot Study Lounge</h2>
            <p className="text-xs text-slate-400">Select a study guide context below</p>
          </div>
        </div>

        {/* Dropdown & Quick Actions */}
        <div className="flex flex-wrap items-center gap-3">
          
          <div className="flex items-center gap-2">
            <BookOpen className="h-4 w-4 text-slate-400" />
            <select
              value={selectedNoteId}
              onChange={(e) => setSelectedNoteId(e.target.value)}
              className="glass-input py-1.5 px-3 text-xs w-48 focus:ring-0 focus:border-white/20"
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
            className="px-3.5 py-2 rounded-xl bg-white/[0.04] border border-white/10 hover:border-white/20 hover:bg-white/[0.08] text-xs font-semibold text-slate-300 transition-all flex items-center gap-1.5 disabled:opacity-45"
            title="Summarize Note"
          >
            <FileText className="h-3.5 w-3.5" /> Summarize
          </button>

          <button
            onClick={handleTriggerStudyPlan}
            disabled={!selectedNoteId || loading}
            className="px-3.5 py-2 rounded-xl bg-primary-600 hover:bg-primary-500 text-xs font-semibold text-white transition-all flex items-center gap-1.5 shadow-md shadow-primary-600/10 disabled:opacity-45"
            title="7-Day Study Plan"
          >
            <Calendar className="h-3.5 w-3.5" /> Study Plan
          </button>

          <button
            type="button"
            onClick={() => setShowSettings(!showSettings)}
            className={`px-3.5 py-2 rounded-xl border transition-all flex items-center gap-1.5 text-xs font-bold ${
              (aiProvider === 'openai' ? savedOpenAiKey : savedGeminiKey) 
                ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/20' 
                : 'bg-rose-500/10 border-rose-500/30 text-rose-400 hover:bg-rose-500/20'
            }`}
            title="Configure AI API Keys"
          >
            <Zap className="h-3.5 w-3.5 animate-pulse" />
            {(aiProvider === 'openai' ? savedOpenAiKey : savedGeminiKey) 
              ? `${aiProvider === 'openai' ? 'OpenAI' : 'Gemini'} Live` 
              : 'AI Offline'}
          </button>

        </div>

      </div>

      {showSettings && (
        <div className="glass-panel p-4 rounded-2xl border border-white/5 mb-4 space-y-4 bg-white/[0.02] shadow-lg animate-fade-in">
          {/* Provider Selector */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-white/5">
            <div className="flex items-center gap-2">
              <span className="text-xs text-slate-300 font-semibold">Active AI Provider:</span>
              <select
                value={aiProvider}
                onChange={(e) => handleSwitchProvider(e.target.value)}
                className="glass-input py-1 px-3 text-xs w-48 bg-black/20 focus:ring-0 focus:border-white/20"
              >
                <option value="gemini">Google Gemini</option>
                <option value="openai">OpenAI ChatGPT</option>
              </select>
            </div>
            <span className="text-[10px] text-slate-400 font-medium">
              {aiProvider === 'openai' ? (
                <>Get key at <a href="https://platform.openai.com/api-keys" target="_blank" rel="noopener noreferrer" className="text-primary-400 underline hover:text-primary-300">OpenAI API Keys</a></>
              ) : (
                <>Get key at <a href="https://aistudio.google.com/" target="_blank" rel="noopener noreferrer" className="text-primary-400 underline hover:text-primary-300">Google AI Studio</a></>
              )}
            </span>
          </div>

          {/* Key Configuration Inputs */}
          {aiProvider === 'openai' ? (
            <div className="space-y-3">
              <h3 className="text-xs font-bold text-white flex items-center gap-1.5">
                <Settings className="h-4 w-4 text-primary-400 animate-spin-slow" />
                OpenAI ChatGPT Co-pilot Config
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
                    className="w-full glass-input text-xs py-2 px-3 bg-black/20"
                  />
                </div>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={handleSaveOpenAiKey}
                    disabled={testingKey}
                    className="px-4 py-2 rounded-xl bg-primary-600 hover:bg-primary-500 text-white font-bold text-xs transition-all flex items-center gap-1 disabled:opacity-50"
                  >
                    {testingKey ? 'Verifying...' : 'Save Key'}
                  </button>
                  {savedOpenAiKey && (
                    <button
                      type="button"
                      onClick={handleClearOpenAiKey}
                      className="px-4 py-2 rounded-xl bg-rose-500/10 border border-rose-500/20 hover:bg-rose-500/20 text-xs font-semibold text-rose-400 transition-all"
                    >
                      Clear Key
                    </button>
                  )}
                </div>
              </div>
            </div>
          ) : (
            <div className="space-y-3">
              <h3 className="text-xs font-bold text-white flex items-center gap-1.5">
                <Settings className="h-4 w-4 text-primary-400 animate-spin-slow" />
                Google Gemini Co-pilot Config
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
                    className="w-full glass-input text-xs py-2 px-3 bg-black/20"
                  />
                </div>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={handleSaveGeminiKey}
                    disabled={testingKey}
                    className="px-4 py-2 rounded-xl bg-primary-600 hover:bg-primary-500 text-white font-bold text-xs transition-all flex items-center gap-1 disabled:opacity-50"
                  >
                    {testingKey ? 'Verifying...' : 'Save Key'}
                  </button>
                  {savedGeminiKey && (
                    <button
                      type="button"
                      onClick={handleClearGeminiKey}
                      className="px-4 py-2 rounded-xl bg-rose-500/10 border border-rose-500/20 hover:bg-rose-500/20 text-xs font-semibold text-rose-400 transition-all"
                    >
                      Clear Key
                    </button>
                  )}
                </div>
              </div>
            </div>
          )}
          
          {apiKeySuccess && (
            <p className="text-xs text-emerald-400 font-semibold flex items-center gap-1">
              <Check className="h-3.5 w-3.5" /> {apiKeySuccess}
            </p>
          )}
          {apiKeyError && (
            <p className="text-xs text-rose-400 font-semibold flex items-center gap-1">
              <AlertCircle className="h-3.5 w-3.5" /> {apiKeyError}
            </p>
          )}
          
          <p className="text-[10px] text-slate-500">
            Your key resides in browser memory and queries the API directly. It is never exposed or logged.
          </p>
        </div>
      )}

      {error && (
        <div className="flex items-center gap-2.5 p-3.5 mb-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs">
          <AlertCircle className="h-4 w-4" />
          <span>{error}</span>
        </div>
      )}

      {/* Chat Messages Box */}
      <div className="flex-1 overflow-y-auto glass-panel border border-white/5 rounded-2xl p-6 space-y-4 mb-4">
        
        {messages.map((msg, idx) => {
          const isBot = msg.sender === 'bot';
          return (
            <div key={idx} className={`flex items-start gap-3 ${isBot ? '' : 'flex-row-reverse'}`}>
              
              {/* Avatar */}
              <div className={`
                h-8.5 w-8.5 rounded-full flex items-center justify-center font-bold text-white flex-shrink-0 shadow-sm
                ${isBot 
                  ? 'bg-gradient-to-tr from-primary-600 to-indigo-600' 
                  : 'bg-gradient-to-tr from-emerald-600 to-teal-600'}
              `}>
                {isBot ? <Bot className="h-4.5 w-4.5" /> : <User className="h-4.5 w-4.5" />}
              </div>

              {/* Message Bubble */}
              <div className={`
                p-4 rounded-2xl max-w-xl text-slate-200 border text-sm leading-relaxed
                ${isBot 
                  ? 'bg-white/[0.02] border-white/5' 
                  : 'bg-primary-500/10 border-primary-500/20 text-slate-100'}
              `}>
                {isBot ? formatText(msg.text) : msg.text}
              </div>

            </div>
          );
        })}

        {/* AI Typing Indicator */}
        {loading && (
          <div className="flex items-start gap-3">
            <div className="h-8.5 w-8.5 rounded-full bg-gradient-to-tr from-primary-600 to-indigo-600 flex items-center justify-center text-white flex-shrink-0">
              <Bot className="h-4.5 w-4.5" />
            </div>
            <div className="bg-white/[0.02] border border-white/5 p-4 rounded-2xl flex items-center gap-1.5">
              <div className="w-2 h-2 rounded-full bg-slate-400 animate-bounce"></div>
              <div className="w-2 h-2 rounded-full bg-slate-400 animate-bounce" style={{ animationDelay: '0.2s' }}></div>
              <div className="w-2 h-2 rounded-full bg-slate-400 animate-bounce" style={{ animationDelay: '0.4s' }}></div>
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
          placeholder={selectedNoteId ? "Ask AI Study Buddy about this guide..." : "Ask AI Study Buddy anything..."}
          className="flex-1 glass-input focus:ring-1 focus:ring-primary-500/30"
          disabled={loading}
        />
        <button
          type="submit"
          disabled={loading || !inputMessage.trim()}
          className="px-5 py-3 rounded-xl bg-primary-600 hover:bg-primary-500 text-white font-bold flex items-center justify-center transition-all disabled:opacity-50 shadow-md shadow-primary-600/15"
        >
          <Send className="h-4.5 w-4.5" />
        </button>
      </form>

    </div>
  );
}
