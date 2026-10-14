'use client';

import React, { useState, useEffect, useRef } from 'react';
import {
  Feather, Save, Maximize2, Minimize2, Bold, Italic, Underline, Heading1, Heading2,
  Quote, List, Download, Copy, Check, Type, Clock, Sparkles, FileText, Sliders,
  Send, BookOpen, FolderOpen, PlusCircle, RefreshCw, X
} from 'lucide-react';
import { useIsolatedStorage } from '@/hooks/useIsolatedStorage';

interface ContentItem { id: string; title: string; content: string; wordCount: number; updatedAt: string; }
interface Project { id: string; title: string; genre?: string; chapters?: ContentItem[]; drafts?: ContentItem[]; }

const DEFAULT_PROJECTS: Project[] = [
  { id: '1', title: 'O Guardião da Floresta', genre: 'Fantasia', chapters: [], drafts: [] },
  { id: '2', title: 'Segredos de Algures', genre: 'Mistério', chapters: [], drafts: [] },
];

export function WritingSpace() {
  const [content, setContent] = useState('');
  const [title, setTitle] = useState('Novo Capítulo');
  const [projects, setProjects] = useIsolatedStorage<Project[]>('projects', DEFAULT_PROJECTS);
  const [selectedProjectId, setSelectedProjectId] = useState(() => projects[0]?.id || '1');
  const [exportType, setExportType] = useState<'chapter' | 'draft'>('chapter');
  const [editingItemId, setEditingItemId] = useState<string | null>(null);

  const [isNewProjectModalOpen, setIsNewProjectModalOpen] = useState(false);
  const [newProjectTitle, setNewProjectTitle] = useState('');
  const [newProjectGenre, setNewProjectGenre] = useState('Fantasia');

  const [isSaved, setIsSaved] = useState(true);
  const [isDistractionFree, setIsDistractionFree] = useState(false);
  const [copied, setCopied] = useState(false);
  const [exportSuccess, setExportSuccess] = useState(false);

  const [fontFamily, setFontFamily] = useState<'serif' | 'sans' | 'mono'>('serif');
  const [fontSize, setFontSize] = useState(18);
  const [lineHeight, setLineHeight] = useState<'relaxed' | 'loose' | 'normal'>('relaxed');
  const [showSettings, setShowSettings] = useState(false);

  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const currentProject = projects.find((p) => p.id === selectedProjectId) || projects[0];
  const existingItems = exportType === 'chapter' ? currentProject?.chapters || [] : currentProject?.drafts || [];

  const [savedWritingSpace, setSavedWritingSpace] = useIsolatedStorage<string>('writing_space', '');
  const [savedWritingTitle, setSavedWritingTitle] = useIsolatedStorage<string>('writing_title', 'Novo Capítulo');

  useEffect(() => {
    if (savedWritingSpace && !content && !editingItemId) setContent(savedWritingSpace);
    if (savedWritingTitle && title === 'Novo Capítulo') setTitle(savedWritingTitle);
  }, []);

  useEffect(() => {
    setIsSaved(false);
    const timer = setTimeout(() => {
      setSavedWritingSpace(content);
      setSavedWritingTitle(title);
      setIsSaved(true);
    }, 800);
    return () => clearTimeout(timer);
  }, [content, title]);

  const wordCount = content.trim() ? content.trim().split(/\s+/).length : 0;
  const charCount = content.length;
  const paragraphCount = content.split(/\n\s*\n/).filter(Boolean).length || (content ? 1 : 0);
  const readingTime = Math.ceil(wordCount / 200);

  const handleCreateProject = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newProjectTitle.trim()) return;
    const newId = Date.now().toString();
    const newProj: Project = { id: newId, title: newProjectTitle.trim(), genre: newProjectGenre, chapters: [], drafts: [] };
    setProjects([...projects, newProj]);
    setSelectedProjectId(newId);
    setEditingItemId(null);
    setNewProjectTitle('');
    setIsNewProjectModalOpen(false);
  };

  const handleLoadExistingItem = (itemId: string) => {
    if (!itemId) { setEditingItemId(null); return; }
    const item = existingItems.find((i) => i.id === itemId);
    if (item) { setEditingItemId(item.id); setTitle(item.title); setContent(item.content); }
  };

  const handleExportToProject = () => {
    if (!selectedProjectId) return alert('Selecione um projeto.');
    const updatedAt = new Date().toLocaleDateString('pt-PT');
    const targetKey = exportType === 'chapter' ? 'chapters' : 'drafts';

    const updated = projects.map((p) => {
      if (p.id === selectedProjectId) {
        const list = p[targetKey] || [];
        if (editingItemId) {
          return { ...p, [targetKey]: list.map((i) => i.id === editingItemId ? { ...i, title: title || 'Sem Título', content, wordCount, updatedAt } : i) };
        } else {
          const newItem: ContentItem = { id: Date.now().toString(), title: title || 'Sem Título', content, wordCount, updatedAt };
          setEditingItemId(newItem.id);
          return { ...p, [targetKey]: [...list, newItem] };
        }
      }
      return p;
    });

    setProjects(updated);
    setExportSuccess(true);
    setTimeout(() => setExportSuccess(false), 3000);
  };

  const applyFormatting = (prefix: string, suffix = prefix) => {
    const ta = textareaRef.current;
    if (!ta) return;
    const { selectionStart: start, selectionEnd: end } = ta;
    const newText = content.substring(0, start) + prefix + content.substring(start, end) + suffix + content.substring(end);
    setContent(newText);
    setTimeout(() => { ta.focus(); ta.setSelectionRange(start + prefix.length, end + prefix.length); }, 0);
  };

  return (
    <div className={`transition-all duration-300 font-sans ${isDistractionFree ? 'fixed inset-0 z-50 bg-[#fdf8f2] dark:bg-[#120e17] p-6 md:p-12 overflow-y-auto' : 'space-y-4'}`}>
      <div className="bg-[#f3ccde]/60 dark:bg-[#221a2b] p-4 md:p-5 rounded-2xl border-2 border-[#4b1d3f]/20 dark:border-[#382b47] flex flex-col md:flex-row justify-between items-center gap-4 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-[#f3ccde] dark:bg-[#2a2035] text-[#4b1d3f] dark:text-pink-300 rounded-xl border border-[#4b1d3f]/30"><Feather size={26} /></div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-xl font-bold font-serif text-stone-900 dark:text-stone-100">Espaço de Escrita</h2>
              <span className={`text-[10px] px-2 py-0.5 rounded-full font-semibold border ${isSaved ? 'bg-emerald-100 text-emerald-800 border-emerald-300' : 'bg-amber-100 text-amber-800 animate-pulse'}`}>{isSaved ? 'Guardado' : 'A guardar...'}</span>
            </div>
            <p className="text-xs text-stone-600 dark:text-stone-400">{editingItemId ? 'A rever texto antigo.' : 'Escreva um novo rascunho.'}</p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2 w-full md:w-auto justify-end">
          <div className="flex items-center gap-1.5 bg-white dark:bg-[#1c1524] px-3 py-1.5 rounded-xl border border-[#4b1d3f]/20">
            <BookOpen size={15} className="text-[#4b1d3f] dark:text-pink-300" />
            <select value={selectedProjectId} onChange={(e) => e.target.value === 'new' ? setIsNewProjectModalOpen(true) : (setSelectedProjectId(e.target.value), setEditingItemId(null))} className="bg-transparent text-xs font-bold text-stone-800 dark:text-stone-200 focus:outline-none cursor-pointer">
              {projects.map((p) => <option key={p.id} value={p.id} className="dark:bg-[#1c1524]">{p.title}</option>)}
              <option value="new" className="font-bold text-[#4b1d3f]">+ Criar Novo Livro...</option>
            </select>
          </div>

          <div className="flex items-center gap-1 bg-white dark:bg-[#1c1524] p-1 rounded-xl border border-[#4b1d3f]/20 text-xs">
            <button onClick={() => { setExportType('chapter'); setEditingItemId(null); }} className={`px-2.5 py-1 rounded-lg font-semibold ${exportType === 'chapter' ? 'bg-[#4b1d3f] text-white dark:bg-pink-700' : 'text-stone-600 dark:text-stone-400'}`}>Capítulo</button>
            <button onClick={() => { setExportType('draft'); setEditingItemId(null); }} className={`px-2.5 py-1 rounded-lg font-semibold ${exportType === 'draft' ? 'bg-[#4b1d3f] text-white dark:bg-pink-700' : 'text-stone-600 dark:text-stone-400'}`}>Rascunho</button>
          </div>

          <div className="flex items-center gap-1.5 bg-white dark:bg-[#1c1524] px-3 py-1.5 rounded-xl border border-[#4b1d3f]/20">
            <FolderOpen size={15} className="text-[#4b1d3f] dark:text-pink-300" />
            <select value={editingItemId || ''} onChange={(e) => handleLoadExistingItem(e.target.value)} className="bg-transparent text-xs font-bold text-stone-800 dark:text-stone-200 focus:outline-none max-w-[120px] truncate">
              <option value="">-- Carregar Antigo --</option>
              {existingItems.map((i) => <option key={i.id} value={i.id}>{i.title}</option>)}
            </select>
          </div>

          <button onClick={() => { setEditingItemId(null); setTitle('Novo Capítulo'); setContent(''); }} className="p-2.5 bg-white dark:bg-[#1c1524] text-stone-700 dark:text-stone-200 rounded-xl border border-[#4b1d3f]/20 text-xs font-semibold flex items-center gap-1.5" title="Novo"><PlusCircle size={15} /></button>

          <button onClick={handleExportToProject} className={`px-4 py-2.5 rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-sm ${exportSuccess ? 'bg-emerald-600 text-white' : 'bg-[#4b1d3f] dark:bg-pink-800 text-white'}`}>
            {exportSuccess ? <Check size={16} /> : editingItemId ? <RefreshCw size={15} /> : <Send size={15} />}
            <span>{exportSuccess ? 'Atualizado!' : editingItemId ? 'Atualizar' : 'Salvar'}</span>
          </button>
        </div>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-2 px-1">
        <div className="flex items-center gap-2">
          <button onClick={() => setShowSettings(!showSettings)} className="p-2 bg-white dark:bg-[#221a2b] text-stone-700 dark:text-stone-200 rounded-xl border border-[#4b1d3f]/20 text-xs font-semibold flex items-center gap-1.5"><Sliders size={15} /> Tipografia</button>
          <button onClick={() => { navigator.clipboard.writeText(`${title}\n\n${content}`); setCopied(true); setTimeout(() => setCopied(false), 2000); }} className="p-2 bg-white dark:bg-[#221a2b] text-stone-700 dark:text-stone-200 rounded-xl border border-[#4b1d3f]/20 text-xs font-semibold flex items-center gap-1.5">{copied ? <Check size={15} className="text-emerald-600" /> : <Copy size={15} />} {copied ? 'Copiado!' : 'Copiar'}</button>
          <button onClick={() => { const el = document.createElement('a'); el.href = URL.createObjectURL(new Blob([`${title}\n\n${content}`], { type: 'text/plain;charset=utf-8' })); el.download = `${title.toLowerCase().replace(/\s+/g, '_')}.txt`; el.click(); }} className="p-2 bg-white dark:bg-[#221a2b] text-stone-700 dark:text-stone-200 rounded-xl border border-[#4b1d3f]/20 text-xs font-semibold flex items-center gap-1.5"><Download size={15} /> Baixar .TXT</button>
        </div>
        <button onClick={() => setIsDistractionFree(!isDistractionFree)} className="p-2 bg-[#f3ccde] dark:bg-[#2a2035] text-[#4b1d3f] dark:text-pink-300 border border-[#4b1d3f]/30 rounded-xl text-xs font-bold flex items-center gap-1.5">{isDistractionFree ? <Minimize2 size={15} /> : <Maximize2 size={15} />} {isDistractionFree ? 'Sair do Foco' : 'Modo Foco'}</button>
      </div>

      {showSettings && (
        <div className="bg-[#fdfbf7] dark:bg-[#1c1524] border-2 border-[#4b1d3f]/20 dark:border-[#382b47] p-4 rounded-2xl shadow-md grid grid-cols-1 md:grid-cols-3 gap-4 text-xs font-sans">
          <div>
            <label className="block font-bold text-stone-700 dark:text-stone-300 mb-1">Fonte</label>
            <div className="flex gap-1">
              {(['serif', 'sans', 'mono'] as const).map((f) => (
                <button key={f} onClick={() => setFontFamily(f)} className={`flex-1 py-1.5 rounded-lg border font-${f} ${fontFamily === f ? 'bg-[#4b1d3f] text-white dark:bg-pink-700' : 'bg-white dark:bg-[#2a2035] text-stone-700 dark:text-stone-200'}`}>{f}</button>
              ))}
            </div>
          </div>
          <div>
            <label className="block font-bold text-stone-700 dark:text-stone-300 mb-1">Tamanho: {fontSize}px</label>
            <input type="range" min="14" max="24" value={fontSize} onChange={(e) => setFontSize(Number(e.target.value))} className="w-full accent-[#4b1d3f] cursor-pointer" />
          </div>
          <div>
            <label className="block font-bold text-stone-700 dark:text-stone-300 mb-1">Espaçamento</label>
            <div className="flex gap-1">
              {(['normal', 'relaxed', 'loose'] as const).map((lh) => (
                <button key={lh} onClick={() => setLineHeight(lh)} className={`flex-1 py-1.5 rounded-lg border capitalize ${lineHeight === lh ? 'bg-[#4b1d3f] text-white dark:bg-pink-700' : 'bg-white dark:bg-[#2a2035] text-stone-700 dark:text-stone-200'}`}>{lh}</button>
              ))}
            </div>
          </div>
        </div>
      )}

      <div className="bg-[#fcf8f2] dark:bg-[#1a1321] border-2 border-[#4b1d3f]/20 dark:border-[#382b47] rounded-3xl p-6 md:p-10 shadow-sm space-y-4 relative min-h-[550px] flex flex-col justify-between">
        <div className="flex flex-wrap items-center gap-1.5 pb-3 border-b border-[#4b1d3f]/15 dark:border-[#382b47] text-stone-700 dark:text-stone-300">
          <button onClick={() => applyFormatting('**')} className="p-1.5 hover:bg-[#f3ccde]/50 rounded-lg font-bold"><Bold size={16} /></button>
          <button onClick={() => applyFormatting('*')} className="p-1.5 hover:bg-[#f3ccde]/50 rounded-lg italic"><Italic size={16} /></button>
          <button onClick={() => applyFormatting('<u>', '</u>')} className="p-1.5 hover:bg-[#f3ccde]/50 rounded-lg underline"><Underline size={16} /></button>
          <div className="h-4 w-px bg-stone-300 dark:bg-stone-700 mx-1" />
          <button onClick={() => applyFormatting('# ')} className="p-1.5 hover:bg-[#f3ccde]/50 rounded-lg"><Heading1 size={16} /></button>
          <button onClick={() => applyFormatting('## ')} className="p-1.5 hover:bg-[#f3ccde]/50 rounded-lg"><Heading2 size={16} /></button>
          <div className="h-4 w-px bg-stone-300 dark:bg-stone-700 mx-1" />
          <button onClick={() => applyFormatting('> ')} className="p-1.5 hover:bg-[#f3ccde]/50 rounded-lg"><Quote size={16} /></button>
          <button onClick={() => applyFormatting('- ')} className="p-1.5 hover:bg-[#f3ccde]/50 rounded-lg"><List size={16} /></button>
        </div>

        <div>
          <input type="text" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Título..." className="w-full text-2xl md:text-3xl font-bold font-serif bg-transparent border-b border-transparent hover:border-stone-300 focus:border-[#4b1d3f] focus:outline-none text-stone-900 dark:text-stone-100 pb-2 transition-colors" />
        </div>

        <div className="flex-grow my-2">
          <textarea ref={textareaRef} value={content} onChange={(e) => setContent(e.target.value)} placeholder="Comece a escrever..." style={{ fontSize: `${fontSize}px` }} className={`w-full h-full min-h-[380px] bg-transparent resize-y focus:outline-none text-stone-800 dark:text-stone-200 font-${fontFamily} leading-${lineHeight}`} />
        </div>

        <div className="pt-4 border-t border-[#4b1d3f]/15 dark:border-[#382b47] flex flex-wrap items-center justify-between text-xs text-stone-600 dark:text-stone-400 font-medium gap-3">
          <div className="flex flex-wrap items-center gap-4">
            <span className="flex items-center gap-1.5"><FileText size={14} className="text-[#4b1d3f] dark:text-pink-400" /> <strong>{wordCount}</strong> Palavras</span>
            <span className="flex items-center gap-1.5"><Type size={14} className="text-[#4b1d3f] dark:text-pink-400" /> <strong>{charCount}</strong> Caracteres</span>
            <span className="flex items-center gap-1.5"><Sparkles size={14} className="text-[#4b1d3f] dark:text-pink-400" /> <strong>{paragraphCount}</strong> Parágrafos</span>
          </div>
          <div className="flex items-center gap-1.5 text-stone-500"><Clock size={14} /> <span>~{readingTime} min de leitura</span></div>
        </div>
      </div>

      {isNewProjectModalOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-[#fcf8f2] dark:bg-[#18121e] border-2 border-[#4b1d3f]/30 dark:border-[#382b47] rounded-3xl p-6 w-full max-w-md shadow-2xl space-y-4">
            <div className="flex justify-between items-center border-b border-[#4b1d3f]/20 pb-3">
              <h3 className="font-bold font-serif text-lg text-stone-900 dark:text-stone-100">Criar Novo Livro</h3>
              <button onClick={() => setIsNewProjectModalOpen(false)} className="text-stone-500"><X size={18} /></button>
            </div>
            <form onSubmit={handleCreateProject} className="space-y-3 text-xs">
              <div>
                <label className="block font-bold text-stone-700 dark:text-stone-300 mb-1">Título</label>
                <input type="text" required placeholder="Ex: Crónicas" value={newProjectTitle} onChange={(e) => setNewProjectTitle(e.target.value)} className="w-full p-2.5 bg-white dark:bg-[#221a2b] border rounded-xl text-stone-800 dark:text-stone-100" />
              </div>
              <div>
                <label className="block font-bold text-stone-700 dark:text-stone-300 mb-1">Género</label>
                <input type="text" required placeholder="Ex: Fantasia" value={newProjectGenre} onChange={(e) => setNewProjectGenre(e.target.value)} className="w-full p-2.5 bg-white dark:bg-[#221a2b] border rounded-xl text-stone-800 dark:text-stone-100" />
              </div>
              <div className="flex justify-end gap-2 pt-3 border-t border-[#4b1d3f]/20">
                <button type="button" onClick={() => setIsNewProjectModalOpen(false)} className="px-4 py-2 bg-stone-200 dark:bg-stone-800 text-stone-800 dark:text-stone-200 rounded-xl font-semibold">Cancelar</button>
                <button type="submit" className="px-4 py-2 bg-[#4b1d3f] text-white rounded-xl font-bold flex items-center gap-1"><Check size={16} /> Criar Livro</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}