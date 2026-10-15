'use client';

import React, { useState } from 'react';
import { BookOpen, FileText, FileCode, Trash2, Eye, X, Edit3, BookOpenCheck } from 'lucide-react';
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
  genre: string;
  description: string;
  progress: number;
  chapters: ContentItem[];
  drafts: ContentItem[];
}

const DEFAULT_PROJECTS: Project[] = [
  { id: '1', title: 'O Guardião da Floresta', genre: 'Fantasia', description: 'Uma jornada mágica sobre segredos antigos e guardiões da natureza.', progress: 60, chapters: [], drafts: [] },
  { id: '2', title: 'Segredos de Algures', genre: 'Mistério', description: 'Investigação em uma cidade isolada onde nada é o que parece.', progress: 25, chapters: [], drafts: [] },
];

export function ProjectsSection() {
  const [projects, setProjects] = useIsolatedStorage<Project[]>('projects', DEFAULT_PROJECTS);
  const [activeTabMap, setActiveTabMap] = useState<Record<string, 'chapters' | 'drafts'>>({});
  const [readingItem, setReadingItem] = useState<{ projectId: string; type: 'chapters' | 'drafts'; item: ContentItem } | null>(null);
  const [isEditingMode, setIsEditingMode] = useState(false);
  const [editTitle, setEditTitle] = useState('');
  const [editContent, setEditContent] = useState('');

  const handleDeleteItem = (projectId: string, itemId: string, type: 'chapters' | 'drafts', e: React.MouseEvent) => {
    e.stopPropagation();
    if (confirm('Tem a certeza de que deseja eliminar este item?')) {
      setProjects((prev) => prev.map((p) => p.id === projectId ? { ...p, [type]: p[type].filter((i) => i.id !== itemId) } : p));
    }
  };

  const handleOpenReader = (projectId: string, type: 'chapters' | 'drafts', item: ContentItem) => {
    setReadingItem({ projectId, type, item });
    setEditTitle(item.title);
    setEditContent(item.content);
    setIsEditingMode(false);
  };

  const handleSaveEditedItem = (e: React.FormEvent) => {
    e.preventDefault();
    if (!readingItem) return;
    const { projectId, type, item } = readingItem;
    const wordCount = editContent.trim() ? editContent.trim().split(/\s+/).length : 0;
    const updatedAt = new Date().toLocaleDateString('pt-PT');

    setProjects((prev) =>
      prev.map((p) => p.id === projectId ? { ...p, [type]: p[type].map((i) => i.id === item.id ? { ...i, title: editTitle, content: editContent, wordCount, updatedAt } : i) } : p)
    );

    setReadingItem({ projectId, type, item: { ...item, title: editTitle, content: editContent, wordCount, updatedAt } });
    setIsEditingMode(false);
  };

  return (
    <div className="space-y-6 font-sans">
      {/* CABEÇALHO DA SECÇÃO */}
      <div className="bg-[#fcf8f2] dark:bg-[#1a1120] p-5 rounded-3xl border border-[#4b1d3f]/20 dark:border-[#2e1d3a] flex justify-between items-center shadow-xs transition-colors duration-300">
        <div className="flex items-center gap-3.5">
          <div className="p-3 bg-[#f3ccde]/40 dark:bg-[#281832] text-[#4b1d3f] dark:text-pink-300 rounded-2xl border border-[#4b1d3f]/20 dark:border-[#3d224d]">
            <BookOpen size={24} />
          </div>
          <div>
            <h2 className="text-xl font-bold font-serif text-stone-900 dark:text-stone-100">Projetos & Livros</h2>
            <p className="text-xs text-stone-600 dark:text-stone-400">Gerencie capítulos e rascunhos no seu ambiente privado.</p>
          </div>
        </div>
      </div>

      {/* GRELHA DE CARDS DE PROJETOS */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {projects.map((project) => {
          const activeSubTab = activeTabMap[project.id] || 'chapters';
          const itemsList = activeSubTab === 'chapters' ? project.chapters || [] : project.drafts || [];

          return (
            <div key={project.id} className="bg-[#fcf8f2] dark:bg-[#1a1120] border border-[#4b1d3f]/20 dark:border-[#2e1d3a] rounded-3xl p-6 shadow-xs space-y-4 transition-colors duration-300">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider bg-[#4b1d3f] dark:bg-[#831843] text-white px-2.5 py-1 rounded-md inline-block">
                  {project.genre}
                </span>
                <h3 className="text-lg font-bold font-serif text-stone-900 dark:text-stone-100 mt-2.5">{project.title}</h3>
              </div>

              {project.description && (
                <p className="text-xs text-stone-600 dark:text-stone-400 italic font-serif">"{project.description}"</p>
              )}

              {/* ABAS CAPÍTULOS / RASCUNHOS */}
              <div className="flex border-b border-stone-200 dark:border-[#2e1d3a] text-xs font-bold pt-1">
                <button 
                  onClick={() => setActiveTabMap({ ...activeTabMap, [project.id]: 'chapters' })} 
                  className={`pb-2.5 px-3 border-b-2 flex items-center gap-1.5 transition-colors ${
                    activeSubTab === 'chapters' 
                      ? 'border-[#4b1d3f] dark:border-pink-400 text-[#4b1d3f] dark:text-pink-300' 
                      : 'border-transparent text-stone-500 dark:text-stone-400 hover:text-stone-800 dark:hover:text-stone-200'
                  }`}
                >
                  <FileText size={14} /> Capítulos ({project.chapters?.length || 0})
                </button>

                <button 
                  onClick={() => setActiveTabMap({ ...activeTabMap, [project.id]: 'drafts' })} 
                  className={`pb-2.5 px-3 border-b-2 flex items-center gap-1.5 transition-colors ${
                    activeSubTab === 'drafts' 
                      ? 'border-[#4b1d3f] dark:border-pink-400 text-[#4b1d3f] dark:text-pink-300' 
                      : 'border-transparent text-stone-500 dark:text-stone-400 hover:text-stone-800 dark:hover:text-stone-200'
                  }`}
                >
                  <FileCode size={14} /> Rascunhos ({project.drafts?.length || 0})
                </button>
              </div>

              {/* CONTEÚDO DOS CAPÍTULOS / RASCUNHOS */}
              <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
                {itemsList.map((item) => (
                  <div 
                    key={item.id} 
                    onClick={() => handleOpenReader(project.id, activeSubTab, item)} 
                    className="p-3 bg-white dark:bg-[#24172d] hover:bg-[#f3ccde]/30 dark:hover:bg-[#2d1c38] border border-stone-200 dark:border-[#382245] rounded-2xl flex justify-between items-center text-xs cursor-pointer group transition-colors"
                  >
                    <div>
                      <h4 className="font-bold text-stone-800 dark:text-stone-200 group-hover:text-[#4b1d3f] dark:group-hover:text-pink-300 transition-colors">{item.title}</h4>
                      <p className="text-[10px] text-stone-500 dark:text-stone-400">{item.wordCount} palavras • {item.updatedAt}</p>
                    </div>
                    <div className="flex items-center gap-1">
                      <button onClick={(e) => { e.stopPropagation(); handleOpenReader(project.id, activeSubTab, item); }} className="p-1.5 text-stone-400 hover:text-[#4b1d3f] dark:hover:text-pink-300"><Eye size={15} /></button>
                      <button onClick={(e) => handleDeleteItem(project.id, item.id, activeSubTab, e)} className="p-1.5 text-red-400 hover:text-red-500"><Trash2 size={15} /></button>
                    </div>
                  </div>
                ))}
                
                {itemsList.length === 0 && (
                  <p className="text-center text-xs text-stone-400 dark:text-stone-400 py-6 italic font-serif">
                    Nenhum {activeSubTab === 'chapters' ? 'capítulo' : 'rascunho'} guardado.
                  </p>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* MODAL DE LEITURA / EDIÇÃO */}
      {readingItem && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-xs z-50 flex items-center justify-center p-4 md:p-8">
          <div className="bg-[#fcf8f2] dark:bg-[#1a1120] border border-[#4b1d3f]/30 dark:border-[#2e1d3a] rounded-3xl p-6 md:p-10 w-full max-w-3xl shadow-2xl space-y-6 max-h-[92vh] flex flex-col relative text-stone-900 dark:text-stone-100">
            <div className="flex justify-between items-center border-b border-[#4b1d3f]/20 dark:border-[#2e1d3a] pb-4">
              <div className="flex items-center gap-2.5">
                <BookOpenCheck size={22} className="text-[#4b1d3f] dark:text-pink-300" />
                <span className="text-xs uppercase tracking-wider font-bold text-stone-500 dark:text-stone-400">Modo Leitura</span>
              </div>
              <div className="flex items-center gap-2">
                <button 
                  onClick={() => setIsEditingMode(!isEditingMode)} 
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 border transition-colors ${
                    isEditingMode 
                      ? 'bg-amber-100 dark:bg-amber-950 text-amber-900 dark:text-amber-200 border-amber-300 dark:border-amber-800' 
                      : 'bg-stone-100 dark:bg-[#281832] text-stone-700 dark:text-stone-300 border-stone-200 dark:border-[#3d224d]'
                  }`}
                >
                  <Edit3 size={14} /> <span>{isEditingMode ? 'Ver Leitor' : 'Editar'}</span>
                </button>
                <button onClick={() => setReadingItem(null)} className="p-1.5 text-stone-400 hover:text-stone-900 dark:hover:text-stone-100 rounded-lg"><X size={20} /></button>
              </div>
            </div>

            {!isEditingMode ? (
              <div className="flex-grow overflow-y-auto space-y-4 pr-2 pl-1 py-2">
                <h2 className="text-2xl md:text-3xl font-serif font-bold text-stone-900 dark:text-stone-100 text-center pb-2 border-b border-stone-200 dark:border-[#2e1d3a]">{readingItem.item.title}</h2>
                <div className="font-serif text-base md:text-lg text-stone-800 dark:text-stone-200 leading-relaxed whitespace-pre-wrap pt-2">{readingItem.item.content}</div>
              </div>
            ) : (
              <form onSubmit={handleSaveEditedItem} className="flex-grow flex flex-col space-y-4 overflow-y-auto">
                <div>
                  <label className="block font-bold text-xs text-stone-700 dark:text-stone-300 mb-1">Título</label>
                  <input 
                    type="text" 
                    required 
                    value={editTitle} 
                    onChange={(e) => setEditTitle(e.target.value)} 
                    className="w-full p-2.5 bg-white dark:bg-[#24172d] border border-stone-300 dark:border-[#382245] rounded-xl text-stone-800 dark:text-stone-100 font-serif font-bold text-sm focus:outline-none focus:ring-2 focus:ring-[#4b1d3f]" 
                  />
                </div>
                <div className="flex-grow flex flex-col">
                  <label className="block font-bold text-xs text-stone-700 dark:text-stone-300 mb-1">Conteúdo</label>
                  <textarea 
                    rows={10} 
                    required 
                    value={editContent} 
                    onChange={(e) => setEditContent(e.target.value)} 
                    className="w-full p-3 bg-white dark:bg-[#24172d] border border-stone-300 dark:border-[#382245] rounded-xl text-stone-800 dark:text-stone-200 font-serif text-sm leading-relaxed focus:outline-none focus:ring-2 focus:ring-[#4b1d3f]" 
                  />
                </div>
                <div className="flex justify-end gap-2 pt-2">
                  <button type="button" onClick={() => setIsEditingMode(false)} className="px-4 py-2 bg-stone-200 dark:bg-[#281832] text-stone-800 dark:text-stone-200 rounded-xl text-xs font-semibold">Cancelar</button>
                  <button type="submit" className="px-4 py-2 bg-[#4b1d3f] dark:bg-pink-800 text-white rounded-xl text-xs font-bold">Guardar</button>
                </div>
              </form>
            )}

            <div className="pt-3 border-t border-[#4b1d3f]/20 dark:border-[#2e1d3a] flex justify-between items-center text-xs text-stone-500 dark:text-stone-400">
              <span>{readingItem.item.wordCount} palavras</span>
              <span>Guardado a {readingItem.item.updatedAt}</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}