'use client';

import React, { useState, useEffect, useRef } from 'react';
import {
  Feather,
  Save,
  Maximize2,
  Minimize2,
  Bold,
  Italic,
  Underline,
  Heading1,
  Heading2,
  Quote,
  List,
  Download,
  Copy,
  Check,
  Type,
  Clock,
  Sparkles,
  FileText,
  Sliders,
  Send,
  BookOpen,
  FolderOpen,
  PlusCircle,
  RefreshCw,
  X,
} from 'lucide-react';
import { useIsolatedStorage } from '@/hooks/useIsolatedStorage';

interface ContentItem {
  id: string;
  title: string;
  content: string;
  wordCount: number;
  updatedAt: string;
}

interface Project {
  id: string;
  title: string;
  genre?: string;
  chapters?: ContentItem[];
  drafts?: ContentItem[];
}

const DEFAULT_PROJECTS: Project[] = [
  { id: '1', title: 'O Guardião da Floresta', genre: 'Fantasia', chapters: [], drafts: [] },
  { id: '2', title: 'Segredos de Algures', genre: 'Mistério', chapters: [], drafts: [] },
];

export function WritingSpace() {
  const [content, setContent] = useState<string>('');
  const [title, setTitle] = useState<string>('Novo Capítulo');

  // Projetos & Estado de Edição isolados por conta
  const [projects, setProjects] = useIsolatedStorage<Project[]>('projects', DEFAULT_PROJECTS);

  const [selectedProjectId, setSelectedProjectId] = useState<string>(() => projects[0]?.id || '1');
  const [exportType, setExportType] = useState<'chapter' | 'draft'>('chapter');
  
  // ID do item que está a ser revisto/editado no momento (null = novo texto)
  const [editingItemId, setEditingItemId] = useState<string | null>(null);

  // Modal para criar novo livro
  const [isNewProjectModalOpen, setIsNewProjectModalOpen] = useState(false);
  const [newProjectTitle, setNewProjectTitle] = useState('');
  const [newProjectGenre, setNewProjectGenre] = useState('Fantasia');

  const [isSaved, setIsSaved] = useState(true);
  const [isDistractionFree, setIsDistractionFree] = useState(false);
  const [copied, setCopied] = useState(false);
  const [exportSuccess, setExportSuccess] = useState(false);

  // Tipografia e Formatação Visual
  const [fontFamily, setFontFamily] = useState<'serif' | 'sans' | 'mono'>('serif');
  const [fontSize, setFontSize] = useState<number>(18);
  const [lineHeight, setLineHeight] = useState<'relaxed' | 'loose' | 'normal'>('relaxed');
  const [showSettings, setShowSettings] = useState(false);

  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Projeto atualmente selecionado
  const currentProject = projects.find((p) => p.id === selectedProjectId) || projects[0];
  const existingItems = exportType === 'chapter' ? currentProject?.chapters || [] : currentProject?.drafts || [];

  // Auto-Save do Rascunho Temporário Isolado
  const [savedWritingSpace, setSavedWritingSpace] = useIsolatedStorage<string>('writing_space', '');
  const [savedWritingTitle, setSavedWritingTitle] = useIsolatedStorage<string>('writing_title', 'Novo Capítulo');

  useEffect(() => {
    if (savedWritingSpace && !content && !editingItemId) {
      setContent(savedWritingSpace);
    }
    if (savedWritingTitle && title === 'Novo Capítulo') {
      setTitle(savedWritingTitle);
    }
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

  // Contadores
  const wordCount = content.trim() ? content.trim().split(/\s+/).length : 0;
  const charCount = content.length;
  const paragraphCount = content.split(/\n\s*\n/).filter(Boolean).length || (content ? 1 : 0);
  const readingTime = Math.ceil(wordCount / 200);

  // Criar Novo Livro
  const handleCreateProject = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newProjectTitle.trim()) return;

    const newId = Date.now().toString();
    const newProj: Project = {
      id: newId,
      title: newProjectTitle.trim(),
      genre: newProjectGenre,
      chapters: [],
      drafts: [],
    };

    setProjects([...projects, newProj]);
    setSelectedProjectId(newId);
    setEditingItemId(null);
    setNewProjectTitle('');
    setIsNewProjectModalOpen(false);
  };

  // Carregar Texto Antigo para Revisão/Edição
  const handleLoadExistingItem = (itemId: string) => {
    if (!itemId) {
      setEditingItemId(null);
      return;
    }

    const itemToEdit = existingItems.find((i) => i.id === itemId);
    if (itemToEdit) {
      setEditingItemId(itemToEdit.id);
      setTitle(itemToEdit.title);
      setContent(itemToEdit.content);
    }
  };

  // Limpar e Começar Novo Texto
  const handleStartNewText = () => {
    setEditingItemId(null);
    setTitle('Novo Capítulo');
    setContent('');
  };

  // Guardar (Atualizar Existente ou Salvar como Novo)
  const handleExportToProject = () => {
    if (!selectedProjectId) {
      alert('Selecione um projeto para guardar.');
      return;
    }

    const updatedAt = new Date().toLocaleDateString('pt-PT');

    const updatedProjects = projects.map((p) => {
      if (p.id === selectedProjectId) {
        const targetKey = exportType === 'chapter' ? 'chapters' : 'drafts';
        const currentList = p[targetKey] || [];

        if (editingItemId) {
          const updatedList = currentList.map((item) =>
            item.id === editingItemId
              ? { ...item, title: title || 'Sem Título', content, wordCount, updatedAt }
              : item
          );
          return { ...p, [targetKey]: updatedList };
        } else {
          const newItem: ContentItem = {
            id: Date.now().toString(),
            title: title || 'Sem Título',
            content,
            wordCount,
            updatedAt,
          };
          setEditingItemId(newItem.id);
          return { ...p, [targetKey]: [...currentList, newItem] };
        }
      }
      return p;
    });

    setProjects(updatedProjects);
    setExportSuccess(true);
    setTimeout(() => setExportSuccess(false), 3000);
  };

  const applyFormatting = (prefix: string, suffix: string = prefix) => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selectedText = content.substring(start, end);

    const newText =
      content.substring(0, start) +
      prefix +
      selectedText +
      suffix +
      content.substring(end);

    setContent(newText);

    setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(start + prefix.length, end + prefix.length);
    }, 0);
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(`${title}\n\n${content}`);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    const element = document.createElement('a');
    const file = new Blob([`${title}\n\n${content}`], { type: 'text/plain;charset=utf-8' });
    element.href = URL.createObjectURL(file);
    element.download = `${title.toLowerCase().replace(/\s+/g, '_')}.txt`;
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  const fontClass = {
    serif: 'font-serif',
    sans: 'font-sans',
    mono: 'font-mono',
  }[fontFamily];

  const leadingClass = {
    normal: 'leading-normal',
    relaxed: 'leading-relaxed',
    loose: 'leading-loose',
  }[lineHeight];

  return (
    <div
      className={`transition-all duration-300 font-sans ${
        isDistractionFree
          ? 'fixed inset-0 z-50 bg-[#fdf8f2] dark:bg-[#120e17] p-6 md:p-12 overflow-y-auto'
          : 'space-y-4'
      }`}
    >
      {/* CABEÇALHO */}
      <div className="bg-[#f3ccde]/60 dark:bg-[#221a2b] p-4 md:p-5 rounded-2xl border-2 border-[#4b1d3f]/20 dark:border-[#382b47] flex flex-col md:flex-row justify-between items-start md:items-center gap-4 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-[#f3ccde] dark:bg-[#2a2035] text-[#4b1d3f] dark:text-pink-300 rounded-xl border border-[#4b1d3f]/30 dark:border-[#382b47]">
            <Feather size={26} />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-xl font-bold font-serif text-stone-900 dark:text-stone-100">
                Espaço de Escrita
              </h2>
              <span
                className={`text-[10px] px-2 py-0.5 rounded-full font-semibold border ${
                  isSaved
                    ? 'bg-emerald-100 text-emerald-800 border-emerald-300'
                    : 'bg-amber-100 text-amber-800 border-amber-300 animate-pulse'
                }`}
              >
                {isSaved ? 'Guardado' : 'A guardar...'}
              </span>
            </div>
            <p className="text-xs text-stone-600 dark:text-stone-400">
              {editingItemId
                ? 'Em modo de revisão/edição de texto antigo.'
                : 'Escreva um novo rascunho ou selecione um texto antigo para revisar.'}
            </p>
          </div>
        </div>

        {/* CONTROLES DE PROJETO, REVISÃO E SALVAMENTO */}
        <div className="flex flex-wrap items-center gap-2 w-full md:w-auto justify-end">
          
          {/* Seletor de Projeto / Novo Livro */}
          <div className="flex items-center gap-1.5 bg-white dark:bg-[#1c1524] px-3 py-1.5 rounded-xl border border-[#4b1d3f]/20 dark:border-[#382b47]">
            <BookOpen size={15} className="text-[#4b1d3f] dark:text-pink-300" />
            <select
              value={selectedProjectId}
              onChange={(e) => {
                if (e.target.value === 'new_project') {
                  setIsNewProjectModalOpen(true);
                } else {
                  setSelectedProjectId(e.target.value);
                  setEditingItemId(null);
                }
              }}
              className="bg-transparent text-xs font-bold text-stone-800 dark:text-stone-200 focus:outline-none cursor-pointer"
            >
              {projects.map((p) => (
                <option key={p.id} value={p.id} className="dark:bg-[#1c1524]">
                  {p.title}
                </option>
              ))}
              <option value="new_project" className="font-bold text-[#4b1d3f] dark:text-pink-300">
                + Criar Novo Livro...
              </option>
            </select>
          </div>

          {/* Seletor do Tipo (Capítulo / Rascunho) */}
          <div className="flex items-center gap-1 bg-white dark:bg-[#1c1524] p-1 rounded-xl border border-[#4b1d3f]/20 dark:border-[#382b47] text-xs">
            <button
              onClick={() => {
                setExportType('chapter');
                setEditingItemId(null);
              }}
              className={`px-2.5 py-1 rounded-lg font-semibold transition-colors ${
                exportType === 'chapter'
                  ? 'bg-[#4b1d3f] text-white dark:bg-pink-700'
                  : 'text-stone-600 dark:text-stone-400 hover:text-stone-900'
              }`}
            >
              Capítulo
            </button>
            <button
              onClick={() => {
                setExportType('draft');
                setEditingItemId(null);
              }}
              className={`px-2.5 py-1 rounded-lg font-semibold transition-colors ${
                exportType === 'draft'
                  ? 'bg-[#4b1d3f] text-white dark:bg-pink-700'
                  : 'text-stone-600 dark:text-stone-400 hover:text-stone-900'
              }`}
            >
              Rascunho
            </button>
          </div>

          {/* SELETOR DE TEXTOS ANTIGOS PARA REVISAR */}
          <div className="flex items-center gap-1.5 bg-white dark:bg-[#1c1524] px-3 py-1.5 rounded-xl border border-[#4b1d3f]/20 dark:border-[#382b47]">
            <FolderOpen size={15} className="text-[#4b1d3f] dark:text-pink-300" />
            <select
              value={editingItemId || ''}
              onChange={(e) => handleLoadExistingItem(e.target.value)}
              className="bg-transparent text-xs font-bold text-stone-800 dark:text-stone-200 focus:outline-none cursor-pointer max-w-[140px] truncate"
            >
              <option value="" className="dark:bg-[#1c1524]">
                -- Carregar Antigo --
              </option>
              {existingItems.map((item) => (
                <option key={item.id} value={item.id} className="dark:bg-[#1c1524]">
                  {item.title}
                </option>
              ))}
            </select>
          </div>

          {/* Botão para Criar Novo Limpo */}
          <button
            onClick={handleStartNewText}
            className="p-2.5 bg-white dark:bg-[#1c1524] hover:bg-stone-100 dark:hover:bg-[#2a2035] text-stone-700 dark:text-stone-200 rounded-xl border border-[#4b1d3f]/20 dark:border-[#382b47] text-xs font-semibold flex items-center gap-1.5 transition-colors shadow-xs"
            title="Começar um novo texto do zero"
          >
            <PlusCircle size={15} />
            <span className="hidden sm:inline">Novo</span>
          </button>

          {/* Botão de Salvar/Atualizar */}
          <button
            onClick={handleExportToProject}
            className={`px-4 py-2.5 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 shadow-sm transition-transform active:scale-95 ${
              exportSuccess
                ? 'bg-emerald-600 text-white'
                : 'bg-[#4b1d3f] hover:bg-[#38142f] dark:bg-pink-800 dark:hover:bg-pink-900 text-white'
            }`}
          >
            {exportSuccess ? (
              <Check size={16} />
            ) : editingItemId ? (
              <RefreshCw size={15} />
            ) : (
              <Send size={15} />
            )}
            <span>
              {exportSuccess
                ? 'Atualizado!'
                : editingItemId
                ? 'Atualizar Existente'
                : 'Salvar no Projeto'}
            </span>
          </button>
        </div>
      </div>

      {/* FERRAMENTAS SECUNDÁRIAS */}
      <div className="flex flex-wrap items-center justify-between gap-2 px-1">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowSettings(!showSettings)}
            className="p-2 bg-white dark:bg-[#221a2b] hover:bg-stone-100 dark:hover:bg-[#2a2035] text-stone-700 dark:text-stone-200 rounded-xl border border-[#4b1d3f]/20 dark:border-[#382b47] text-xs font-semibold flex items-center gap-1.5 transition-colors shadow-xs"
          >
            <Sliders size={15} />
            <span>Tipografia</span>
          </button>

          <button
            onClick={handleCopy}
            className="p-2 bg-white dark:bg-[#221a2b] hover:bg-stone-100 dark:hover:bg-[#2a2035] text-stone-700 dark:text-stone-200 rounded-xl border border-[#4b1d3f]/20 dark:border-[#382b47] text-xs font-semibold flex items-center gap-1.5 transition-colors shadow-xs"
          >
            {copied ? <Check size={15} className="text-emerald-600" /> : <Copy size={15} />}
            <span>{copied ? 'Copiado!' : 'Copiar'}</span>
          </button>

          <button
            onClick={handleDownload}
            className="p-2 bg-white dark:bg-[#221a2b] hover:bg-stone-100 dark:hover:bg-[#2a2035] text-stone-700 dark:text-stone-200 rounded-xl border border-[#4b1d3f]/20 dark:border-[#382b47] text-xs font-semibold flex items-center gap-1.5 transition-colors shadow-xs"
          >
            <Download size={15} />
            <span>Baixar .TXT</span>
          </button>
        </div>

        <button
          onClick={() => setIsDistractionFree(!isDistractionFree)}
          className="p-2 bg-[#f3ccde] dark:bg-[#2a2035] hover:bg-[#e9b7cd] text-[#4b1d3f] dark:text-pink-300 border border-[#4b1d3f]/30 dark:border-[#382b47] rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all shadow-xs"
        >
          {isDistractionFree ? <Minimize2 size={15} /> : <Maximize2 size={15} />}
          <span>{isDistractionFree ? 'Sair do Foco' : 'Modo Foco'}</span>
        </button>
      </div>

      {/* PAINEL TIPOGRAFIA (POP-DOWN) */}
      {showSettings && (
        <div className="bg-[#fdfbf7] dark:bg-[#1c1524] border-2 border-[#4b1d3f]/20 dark:border-[#382b47] p-4 rounded-2xl shadow-md grid grid-cols-1 md:grid-cols-3 gap-4 text-xs font-sans">
          <div>
            <label className="block font-bold text-stone-700 dark:text-stone-300 mb-1">
              Estilo de Fonte
            </label>
            <div className="flex gap-1">
              <button
                onClick={() => setFontFamily('serif')}
                className={`flex-1 py-1.5 rounded-lg border font-serif ${
                  fontFamily === 'serif'
                    ? 'bg-[#4b1d3f] text-white dark:bg-pink-700'
                    : 'bg-white dark:bg-[#2a2035] text-stone-700 dark:text-stone-200'
                }`}
              >
                Serif
              </button>
              <button
                onClick={() => setFontFamily('sans')}
                className={`flex-1 py-1.5 rounded-lg border font-sans ${
                  fontFamily === 'sans'
                    ? 'bg-[#4b1d3f] text-white dark:bg-pink-700'
                    : 'bg-white dark:bg-[#2a2035] text-stone-700 dark:text-stone-200'
                }`}
              >
                Sans
              </button>
              <button
                onClick={() => setFontFamily('mono')}
                className={`flex-1 py-1.5 rounded-lg border font-mono ${
                  fontFamily === 'mono'
                    ? 'bg-[#4b1d3f] text-white dark:bg-pink-700'
                    : 'bg-white dark:bg-[#2a2035] text-stone-700 dark:text-stone-200'
                }`}
              >
                Mono
              </button>
            </div>
          </div>

          <div>
            <label className="block font-bold text-stone-700 dark:text-stone-300 mb-1">
              Tamanho do Texto: {fontSize}px
            </label>
            <input
              type="range"
              min="14"
              max="24"
              value={fontSize}
              onChange={(e) => setFontSize(Number(e.target.value))}
              className="w-full accent-[#4b1d3f] dark:accent-pink-500 cursor-pointer"
            />
          </div>

          <div>
            <label className="block font-bold text-stone-700 dark:text-stone-300 mb-1">
              Espaçamento
            </label>
            <div className="flex gap-1">
              {(['normal', 'relaxed', 'loose'] as const).map((lh) => (
                <button
                  key={lh}
                  onClick={() => setLineHeight(lh)}
                  className={`flex-1 py-1.5 rounded-lg border capitalize ${
                    lineHeight === lh
                      ? 'bg-[#4b1d3f] text-white dark:bg-pink-700'
                      : 'bg-white dark:bg-[#2a2035] text-stone-700 dark:text-stone-200'
                  }`}
                >
                  {lh === 'normal' ? 'Normal' : lh === 'relaxed' ? 'Médio' : 'Amplo'}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ÁREA DE ESCRITA */}
      <div className="bg-[#fcf8f2] dark:bg-[#1a1321] border-2 border-[#4b1d3f]/20 dark:border-[#382b47] rounded-3xl p-6 md:p-10 shadow-sm space-y-4 relative min-h-[550px] flex flex-col justify-between">
        
        {/* FORMATAÇÃO */}
        <div className="flex flex-wrap items-center gap-1.5 pb-3 border-b border-[#4b1d3f]/15 dark:border-[#382b47] text-stone-700 dark:text-stone-300">
          <button
            onClick={() => applyFormatting('**')}
            className="p-1.5 hover:bg-[#f3ccde]/50 dark:hover:bg-[#2a2035] rounded-lg font-bold"
            title="Negrito"
          >
            <Bold size={16} />
          </button>
          <button
            onClick={() => applyFormatting('*')}
            className="p-1.5 hover:bg-[#f3ccde]/50 dark:hover:bg-[#2a2035] rounded-lg italic"
            title="Itálico"
          >
            <Italic size={16} />
          </button>
          <button
            onClick={() => applyFormatting('<u>', '</u>')}
            className="p-1.5 hover:bg-[#f3ccde]/50 dark:hover:bg-[#2a2035] rounded-lg underline"
            title="Sublinhado"
          >
            <Underline size={16} />
          </button>

          <div className="h-4 w-px bg-stone-300 dark:bg-stone-700 mx-1" />

          <button
            onClick={() => applyFormatting('# ')}
            className="p-1.5 hover:bg-[#f3ccde]/50 dark:hover:bg-[#2a2035] rounded-lg"
            title="Título (H1)"
          >
            <Heading1 size={16} />
          </button>
          <button
            onClick={() => applyFormatting('## ')}
            className="p-1.5 hover:bg-[#f3ccde]/50 dark:hover:bg-[#2a2035] rounded-lg"
            title="Subtítulo (H2)"
          >
            <Heading2 size={16} />
          </button>

          <div className="h-4 w-px bg-stone-300 dark:bg-stone-700 mx-1" />

          <button
            onClick={() => applyFormatting('> ')}
            className="p-1.5 hover:bg-[#f3ccde]/50 dark:hover:bg-[#2a2035] rounded-lg"
            title="Citação"
          >
            <Quote size={16} />
          </button>
          <button
            onClick={() => applyFormatting('- ')}
            className="p-1.5 hover:bg-[#f3ccde]/50 dark:hover:bg-[#2a2035] rounded-lg"
            title="Lista"
          >
            <List size={16} />
          </button>
        </div>

        {/* TÍTULO */}
        <div>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Título do Capítulo ou Rascunho..."
            className="w-full text-2xl md:text-3xl font-bold font-serif bg-transparent border-b border-transparent hover:border-stone-300 dark:hover:border-stone-700 focus:border-[#4b1d3f] focus:outline-none text-stone-900 dark:text-stone-100 pb-2 transition-colors placeholder:text-stone-400"
          />
        </div>

        {/* ÁREA DE TEXTO */}
        <div className="flex-grow my-2">
          <textarea
            ref={textareaRef}
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="Comece a escrever ou reescrever o seu manuscrito..."
            style={{ fontSize: `${fontSize}px` }}
            className={`w-full h-full min-h-[380px] bg-transparent resize-y focus:outline-none text-stone-800 dark:text-stone-200 placeholder:text-stone-400 ${fontClass} ${leadingClass}`}
          />
        </div>

        {/* ESTATÍSTICAS */}
        <div className="pt-4 border-t border-[#4b1d3f]/15 dark:border-[#382b47] flex flex-wrap items-center justify-between text-xs text-stone-600 dark:text-stone-400 font-medium gap-3">
          <div className="flex flex-wrap items-center gap-4">
            <span className="flex items-center gap-1.5">
              <FileText size={14} className="text-[#4b1d3f] dark:text-pink-400" />
              <strong>{wordCount}</strong> {wordCount === 1 ? 'Palavra' : 'Palavras'}
            </span>
            <span className="flex items-center gap-1.5">
              <Type size={14} className="text-[#4b1d3f] dark:text-pink-400" />
              <strong>{charCount}</strong> Caracteres
            </span>
            <span className="flex items-center gap-1.5">
              <Sparkles size={14} className="text-[#4b1d3f] dark:text-pink-400" />
              <strong>{paragraphCount}</strong> Parágrafos
            </span>
          </div>

          <div className="flex items-center gap-1.5 text-stone-500">
            <Clock size={14} />
            <span>~{readingTime} min de leitura</span>
          </div>
        </div>

      </div>

      {/* MODAL CRIAR NOVO LIVRO */}
      {isNewProjectModalOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-[#fcf8f2] dark:bg-[#18121e] border-2 border-[#4b1d3f]/30 dark:border-[#382b47] rounded-3xl p-6 w-full max-w-md shadow-2xl space-y-4">
            <div className="flex justify-between items-center border-b border-[#4b1d3f]/20 dark:border-[#382b47] pb-3">
              <h3 className="font-bold font-serif text-lg text-stone-900 dark:text-stone-100">
                Criar Novo Livro / Projeto
              </h3>
              <button
                onClick={() => setIsNewProjectModalOpen(false)}
                className="text-stone-500 hover:text-stone-900 dark:hover:text-stone-100"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleCreateProject} className="space-y-3 text-xs">
              <div>
                <label className="block font-bold text-stone-700 dark:text-stone-300 mb-1">
                  Título do Livro
                </label>
                <input
                  type="text"
                  required
                  placeholder="Ex: Crónicas do Amanhã"
                  value={newProjectTitle}
                  onChange={(e) => setNewProjectTitle(e.target.value)}
                  className="w-full p-2.5 bg-white dark:bg-[#221a2b] border border-[#4b1d3f]/30 dark:border-[#382b47] rounded-xl text-stone-800 dark:text-stone-100 focus:outline-none focus:ring-2 focus:ring-[#4b1d3f]"
                />
              </div>

              <div>
                <label className="block font-bold text-stone-700 dark:text-stone-300 mb-1">
                  Género Literário
                </label>
                <input
                  type="text"
                  required
                  placeholder="Ex: Fantasia, Mistério, Sci-Fi..."
                  value={newProjectGenre}
                  onChange={(e) => setNewProjectGenre(e.target.value)}
                  className="w-full p-2.5 bg-white dark:bg-[#221a2b] border border-[#4b1d3f]/30 dark:border-[#382b47] rounded-xl text-stone-800 dark:text-stone-100 focus:outline-none focus:ring-2 focus:ring-[#4b1d3f]"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-[#4b1d3f]/20 dark:border-[#382b47]">
                <button
                  type="button"
                  onClick={() => setIsNewProjectModalOpen(false)}
                  className="px-4 py-2 bg-stone-200 dark:bg-stone-800 text-stone-800 dark:text-stone-200 rounded-xl font-semibold"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-[#4b1d3f] hover:bg-[#38142f] dark:bg-pink-700 dark:hover:bg-pink-800 text-white rounded-xl font-bold flex items-center gap-1 shadow-sm"
                >
                  <Check size={16} /> Criar Livro
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}