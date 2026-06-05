import React, { useState, useEffect } from 'react';
import { 
  FileText, 
  Plus, 
  Trash2, 
  Eye, 
  Search, 
  Sparkles,
  BookOpen,
  ArrowLeft,
  Check,
  FileUp,
  X
} from 'lucide-react';
import api from '../services/api';

export default function NotesPage() {
  const [notes, setNotes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  
  // Editor / View States
  const [viewingNote, setViewingNote] = useState(null);
  const [creatingNote, setCreatingNote] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newContent, setNewContent] = useState('');
  const [fileAttached, setFileAttached] = useState(null);

  // Success / Error messaging
  const [status, setStatus] = useState({ type: '', message: '' });

  useEffect(() => {
    fetchNotes();
  }, []);

  const fetchNotes = async () => {
    setLoading(true);
    try {
      const response = await api.get('/api/notes');
      setNotes(response.data);
    } catch (err) {
      console.error(err);
      showStatus('error', 'Failed to retrieve notes from the server.');
    } finally {
      setLoading(false);
    }
  };

  const showStatus = (type, message) => {
    setStatus({ type, message });
    setTimeout(() => setStatus({ type: '', message: '' }), 4000);
  };

  const handleCreateNote = async (e) => {
    e.preventDefault();
    if (!newTitle.trim()) {
      showStatus('error', 'Note title is required.');
      return;
    }

    try {
      const payload = {
        title: newTitle,
        content: newContent,
        fileUrl: fileAttached ? `uploads/${fileAttached.name}` : null
      };

      const response = await api.post('/api/notes', payload);
      setNotes([response.data, ...notes]);
      
      // Reset creation form
      setNewTitle('');
      setNewContent('');
      setFileAttached(null);
      setCreatingNote(false);
      showStatus('success', 'Study note saved successfully!');
    } catch (err) {
      console.error(err);
      showStatus('error', 'Failed to save note. Please try again.');
    }
  };

  const handleDeleteNote = async (id, e) => {
    e.stopPropagation();
    if (!window.confirm('Are you sure you want to delete this note?')) return;

    try {
      await api.delete(`/api/notes/${id}`);
      setNotes(notes.filter(n => n.id !== id));
      if (viewingNote?.id === id) setViewingNote(null);
      showStatus('success', 'Note removed successfully.');
    } catch (err) {
      console.error(err);
      showStatus('error', 'Could not delete note.');
    }
  };

  // Simulate file parsing to auto-populate title & content
  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      setFileAttached(file);
      setNewTitle(file.name.replace(/\.[^/.]+$/, "")); // Strip file extension
      
      const reader = new FileReader();
      reader.onload = (event) => {
        setNewContent(event.target.result || `Attached study file: ${file.name}`);
      };
      reader.readAsText(file.slice(0, 5000)); // Read first few KBs as text
      showStatus('success', `File "${file.name}" attached & parsed successfully!`);
    }
  };

  const filteredNotes = notes.filter(n => 
    n.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (n.content && n.content.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  return (
    <div className="space-y-6">
      
      {/* Alert Header */}
      {status.message && (
        <div className={`
          p-4 rounded-xl text-sm flex items-center gap-3 border shadow-sm transition-all animate-fade-in
          ${status.type === 'success' 
            ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400' 
            : 'bg-rose-500/10 border-rose-500/20 text-rose-400'}
        `}>
          {status.type === 'success' ? <Check className="h-5 w-5" /> : <X className="h-5 w-5" />}
          <span>{status.message}</span>
        </div>
      )}

      {/* Main Mode: Detail View */}
      {viewingNote ? (
        <div className="glass-panel p-6 rounded-2xl border border-white/5 space-y-6 animate-fade-in">
          
          <div className="flex items-center justify-between border-b border-white/5 pb-4">
            <button 
              onClick={() => setViewingNote(null)}
              className="px-3.5 py-1.5 rounded-lg bg-white/[0.04] border border-white/10 hover:border-white/20 text-xs text-slate-300 font-semibold flex items-center gap-2 transition-all"
            >
              <ArrowLeft className="h-4 w-4" /> Back to Notes
            </button>
            
            <div className="flex items-center gap-2">
              <span className="text-[10px] text-slate-500 font-medium">
                Created on {new Date(viewingNote.createdAt).toLocaleDateString()}
              </span>
              <button
                onClick={(e) => {
                  handleDeleteNote(viewingNote.id, e);
                }}
                className="p-2 rounded-lg bg-rose-500/10 hover:bg-rose-500 text-rose-400 hover:text-white transition-all"
                title="Delete note"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
          </div>

          <div className="space-y-4">
            <h2 className="text-2xl font-bold text-white tracking-tight">{viewingNote.title}</h2>
            
            {viewingNote.fileUrl && (
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-indigo-500/10 border border-indigo-500/20 text-xs text-indigo-400">
                <FileText className="h-4 w-4" /> File Reference: {viewingNote.fileUrl}
              </div>
            )}

            <div className="p-4 rounded-xl bg-white/[0.01] border border-white/5 whitespace-pre-wrap text-sm text-slate-300 leading-relaxed font-sans min-h-[300px]">
              {viewingNote.content || "This note has no text content."}
            </div>
          </div>

        </div>
      ) : creatingNote ? (
        
        // Mode: Create New Note Form
        <div className="glass-panel p-6 rounded-2xl border border-white/5 animate-fade-in">
          
          <div className="flex items-center justify-between border-b border-white/5 pb-4 mb-6">
            <h3 className="text-lg font-bold text-white flex items-center gap-2">
              <Plus className="h-5 w-5 text-primary-400" /> Create Study Guide
            </h3>
            <button 
              onClick={() => {
                setCreatingNote(false);
                setFileAttached(null);
              }}
              className="text-xs text-slate-400 hover:text-white"
            >
              Cancel
            </button>
          </div>

          <form onSubmit={handleCreateNote} className="space-y-5">
            
            {/* Title Input */}
            <div>
              <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
                Note Title
              </label>
              <input
                type="text"
                required
                placeholder="e.g. Introduction to Organic Chemistry"
                value={newTitle}
                onChange={(e) => setNewTitle(e.target.value)}
                className="w-full glass-input"
              />
            </div>

            {/* Simulated file upload */}
            <div>
              <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
                Parse Study PDF or Text File
              </label>
              <div className="relative border-2 border-dashed border-white/10 hover:border-primary-500/30 rounded-xl px-4 py-6 text-center cursor-pointer transition-all">
                <input
                  type="file"
                  accept=".txt,.pdf,.doc,.docx"
                  onChange={handleFileUpload}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                />
                <FileUp className="h-8 w-8 text-slate-400 mx-auto mb-2" />
                <p className="text-xs text-slate-300 font-medium">
                  {fileAttached ? `File Attached: ${fileAttached.name}` : "Click to browse or drag notes file"}
                </p>
                <p className="text-[10px] text-slate-500 mt-1">Supports TXT, PDF, DOC up to 10MB</p>
              </div>
            </div>

            {/* Note Content Textarea */}
            <div>
              <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
                Study Content / Guide text
              </label>
              <textarea
                rows="8"
                placeholder="Paste your lecture notes, copy definitions, or summaries here..."
                value={newContent}
                onChange={(e) => setNewContent(e.target.value)}
                className="w-full glass-input resize-none"
              />
            </div>

            {/* Submit buttons */}
            <div className="flex justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => {
                  setCreatingNote(false);
                  setFileAttached(null);
                }}
                className="px-4 py-2 text-sm text-slate-400 hover:text-white"
              >
                Discard
              </button>
              <button
                type="submit"
                className="px-5 py-2.5 bg-primary-600 hover:bg-primary-500 text-white rounded-xl text-sm font-semibold transition-all shadow-md shadow-primary-600/10"
              >
                Save Study Guide
              </button>
            </div>

          </form>

        </div>
      ) : (
        
        // Mode: Notes List View
        <div className="space-y-6 animate-fade-in">
          
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h2 className="text-2xl font-extrabold text-white tracking-tight flex items-center gap-2">
                <BookOpen className="h-6 w-6 text-primary-400" /> Study Guides
              </h2>
              <p className="text-xs text-slate-400 mt-1">Manage and upload your lecture references</p>
            </div>
            
            <button
              onClick={() => setCreatingNote(true)}
              className="px-5 py-2.5 rounded-xl bg-primary-600 hover:bg-primary-500 text-sm font-semibold text-white flex items-center gap-2 transition-all shadow-lg shadow-primary-600/10 self-start sm:self-auto"
            >
              <Plus className="h-4.5 w-4.5" /> Upload Note
            </button>
          </div>

          {/* Search bar */}
          <div className="relative max-w-md">
            <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-500">
              <Search className="h-4 w-4" />
            </span>
            <input
              type="text"
              placeholder="Search study titles or content..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full glass-input pl-10 py-2"
            />
          </div>

          {/* Loading indicator */}
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-primary-500"></div>
            </div>
          ) : filteredNotes.length === 0 ? (
            <div className="text-center py-16 glass-panel border border-white/5 rounded-2xl">
              <FileText className="h-12 w-12 text-slate-500 mx-auto mb-4" />
              <h3 className="font-bold text-white text-base">No notes found</h3>
              <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
                Upload lectures or type notes to train your AI co-pilot.
              </p>
              <button
                onClick={() => setCreatingNote(true)}
                className="mt-4 px-4 py-2 bg-primary-600 hover:bg-primary-500 text-xs font-semibold text-white rounded-lg transition-all"
              >
                Create First Guide
              </button>
            </div>
          ) : (
            
            // Notes Grid
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredNotes.map((note) => (
                <div 
                  key={note.id}
                  onClick={() => setViewingNote(note)}
                  className="glass-panel glass-panel-hover p-5 rounded-2xl border border-white/5 flex flex-col justify-between h-48 cursor-pointer"
                >
                  <div>
                    <div className="flex items-start justify-between gap-3 mb-2.5">
                      <h3 className="font-bold text-base text-white tracking-tight truncate flex-1" title={note.title}>
                        {note.title}
                      </h3>
                      
                      <button
                        onClick={(e) => handleDeleteNote(note.id, e)}
                        className="p-1.5 rounded-lg text-slate-500 hover:text-rose-400 hover:bg-rose-500/10 transition-all flex-shrink-0"
                        title="Delete note"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                    
                    <p className="text-xs text-slate-400 line-clamp-3 leading-relaxed">
                      {note.content || "Empty content"}
                    </p>
                  </div>

                  <div className="flex items-center justify-between border-t border-white/5 pt-3 mt-3">
                    <span className="text-[10px] text-slate-500 font-semibold">
                      {new Date(note.createdAt).toLocaleDateString()}
                    </span>
                    
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] text-primary-400 hover:text-primary-300 font-bold flex items-center gap-1">
                        <Eye className="h-3.5 w-3.5" /> View
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

        </div>
      )}

    </div>
  );
}
