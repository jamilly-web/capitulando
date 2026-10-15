'use client';

import React, { useState } from 'react';
import { Lightbulb, Plus, Trash2, Edit2, X, Check, Sparkles, BookOpen, User, Globe, ShieldAlert, BookmarkPlus } from 'lucide-react';
import { useIsolatedStorage } from '@/hooks/useIsolatedStorage';

interface Idea {
  id: string;
  projectId: string;
  content: string;
  category?: 'Geral' | 'Nomes' | 'Mundo' | 'Personagens' | 'Regras';
  createdAt: string;
}

interface ProjectMinimal {
  id: string;
  title: string;
  genre: string;
}

const DEFAULT_PROJECTS: ProjectMinimal[] = [
  { id: '1', title: 'O Guardião da Floresta', genre: 'Fantasia' },
  { id: '2', title: 'Segredos de Algures', genre: 'Mistério' },
];

const SUGGESTIONS_DATABASE: Record<string, { names: string[]; personalities: string[]; worlds: string[]; rules: string[]; }> = {
  Fantasia: {
    names: ['Aurelius Vance', 'Elowen Vale', 'Kaelen Vane', 'Thalia Solis', 'Zephyr Nightshade'],
    personalities: ['Guardião estóico com medo secreto de falhar.', 'Mago prodígio impulsivo que atua sem pensar.'],
    worlds: ['Vales Sussurrantes: Floresta onde as árvores guardam memórias.', 'Cidade de Quartzo: Fortaleza escavada numa montanha de cristais.'],
    rules: ['A magia exige um sacrifício proporcional à sua intensidade.', 'Espelhos filtram seres espirituais.'],
  },
  Mistério: {
    names: ['Inspector Arthur Pendelton', 'Clara Sterling', 'Devon Hayes', 'Sloane Vance'],
    personalities: ['Detetive metódico obcecado por pequenos detalhes.', 'Jornalista destemida em busca da verdade.'],
    worlds: ['Vila de Algures: Cidade isolada envolta em nevoeiro.', 'Hotel Beira-Mar: Edifício vitoriano abandonado.'],
    rules: ['O culpado deixa sempre um objeto pessoal no local do crime.', 'Ninguém fala sobre a noite de 1998.'],
  },
  Geral: {
    names: ['Gabriel Santos', 'Elena Rostova', 'Lucas Vane'],
    personalities: ['Idealista que tenta salvar todos.', 'Estrategista frio focado no bem maior.'],
    worlds: ['A Capital do Vale: Centro de comércio murado.', 'Distrito Esquecido: Zona industrial dominada por fações.'],
    rules: ['Toda a aliança exige um contrato assinado.', 'Segredos públicos perdem valor estratégico.'],
  },
};

export function IdeasSection() {
  const [projects] = useIsolatedStorage<ProjectMinimal[]>('projects', DEFAULT_PROJECTS);
  const [ideas, setIdeas] = useIsolatedStorage<Idea[]>('ideas', []);
  const [selectedProjectId, setSelectedProjectId] = useState(() => projects[0]?.id || '1');

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingIdeaId, setEditingIdeaId] = useState<string | null>(null);
  const [ideaContent, setIdeaContent] = useState('');
  const [ideaCategory, setIdeaCategory] = useState<Idea['category']>('Geral');
  const [currentSuggestion, setCurrentSuggestion] = useState<{ type: string; text: string } | null>(null);

  const selectedProject = projects.find((p) => p.id === selectedProjectId);
  const currentGenre = selectedProject?.genre || 'Fantasia';
  const projectIdeas = ideas.filter((i) => i.projectId === selectedProjectId);

  const handleGenerateSuggestion = (type: 'names' | 'personalities' | 'worlds' | 'rules') => {
    const db = SUGGESTIONS_DATABASE[currentGenre] || SUGGESTIONS_DATABASE['Geral'];
    const list = db[type];
    const text = list[Math.floor(Math.random() * list.length)];
    const labels: Record<string, string> = { names: 'Nome', personalities: 'Personalidade', worlds: 'Mundo / Local', rules: 'Regra' };
    setCurrentSuggestion({ type: `Sugestão de ${labels[type]}`, text });
  };

  const handleSaveSuggestionAsIdea = () => {
    if (!currentSuggestion) return;
    const newIdea: Idea = {
      id: Date.now().toString(),
      projectId: selectedProjectId,
      content: `${currentSuggestion.type}: ${currentSuggestion.text}`,
      category: 'Geral',
      createdAt: new Date().toLocaleDateString('pt-PT'),
    };
    setIdeas((prev) => [newIdea, ...prev]);
    alert('Sugestão guardada no Bloco de Ideias!');
  };

  const handleOpenModal = (idea?: Idea) => {
    if (idea) {
      setEditingIdeaId(idea.id);
      setIdeaContent(idea.content);
      setIdeaCategory(idea.category || 'Geral');
    } else {
      setEditingIdeaId(null);
      setIdeaContent('');
      setIdeaCategory('Geral');
    }
    setIsModalOpen(true);
  };

  const handleSaveIdea = (e: React.FormEvent) => {
    e.preventDefault();
    const newIdea: Idea = {
      id: editingIdeaId || Date.now().toString(),
      projectId: selectedProjectId,
      content: ideaContent,
      category: ideaCategory,
      createdAt: new Date().toLocaleDateString('pt-PT'),
    };
    setIdeas((prev) => editingIdeaId ? prev.map((i) => (i.id === editingIdeaId ? newIdea : i)) : [newIdea, ...prev]);
    setIsModalOpen(false);
  };

  return (
    <div className="space-y-6 font-sans text-stone-900 dark:text-stone-100">
      {/* CABEÇALHO */}
      <div className="bg-[#FCF8F2] dark:bg-[#1a1120] p-5 rounded-3xl border border-[#4b1d3f]/20 dark:border-[#3d224d] flex flex-col md:flex-row justify-between items-center gap-4 shadow-xs">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-[#f3ccde]/40 dark:bg-[#281832] text-[#4b1d3f] dark:text-pink-300 rounded-2xl border border-[#4b1d3f]/20 dark:border-[#3d224d]">
            <Lightbulb size={24} />
          </div>
          <div>
            <h2 className="text-xl font-bold font-serif text-stone-900 dark:text-stone-100">Bloco de Ideias & Gerador Criativo</h2>
            <p className="text-xs text-stone-600 dark:text-stone-300">Anote pensamentos e obtenha inspiração automática.</p>
          </div>
        </div>
        <div className="flex items-center gap-3 w-full md:w-auto justify-end">
          <div className="flex items-center gap-2 bg-white dark:bg-[#24172d] px-3 py-2 rounded-xl border border-[#4b1d3f]/20 dark:border-[#3d224d] shadow-xs flex-1 md:flex-none">
            <BookOpen size={16} className="text-[#4b1d3f] dark:text-pink-300" />
            <select value={selectedProjectId} onChange={(e) => setSelectedProjectId(e.target.value)} className="bg-transparent text-xs font-bold text-stone-800 dark:text-stone-100 focus:outline-none cursor-pointer">
              {projects.map((p) => <option key={p.id} value={p.id} className="bg-[#FCF8F2] dark:bg-[#24172d] text-stone-900 dark:text-stone-100">{p.title} ({p.genre || 'Fantasia'})</option>)}
            </select>
          </div>
          <button onClick={() => handleOpenModal()} className="bg-[#4b1d3f] hover:bg-[#381531] dark:bg-pink-800 dark:hover:bg-pink-700 text-white px-4 py-2.5 rounded-xl text-xs font-bold flex items-center gap-2 shadow-xs shrink-0 transition-colors">
            <Plus size={16} /> Nova Ideia
          </button>
        </div>
      </div>

      {/* GERADOR CRIATIVO */}
      <div className="bg-[#FCF8F2] dark:bg-[#1a1120] border border-[#4b1d3f]/20 dark:border-[#3d224d] rounded-3xl p-6 shadow-xs space-y-4">
        <div className="flex items-center gap-2 border-b border-[#4b1d3f]/10 dark:border-[#3d224d] pb-3">
          <Sparkles size={20} className="text-[#4b1d3f] dark:text-pink-300" />
          <h3 className="font-bold font-serif text-stone-900 dark:text-stone-100 text-base">Inspiração para o Tema ({currentGenre})</h3>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <button onClick={() => handleGenerateSuggestion('names')} className="p-3 bg-white dark:bg-[#24172d] hover:bg-[#f3ccde]/20 dark:hover:bg-[#2e1d3a] border border-[#4b1d3f]/20 dark:border-[#3d224d] rounded-2xl text-xs font-bold text-stone-800 dark:text-stone-100 flex items-center justify-center gap-2 shadow-xs transition-colors"><User size={16} className="text-[#4b1d3f] dark:text-pink-300" /> Nomes</button>
          <button onClick={() => handleGenerateSuggestion('personalities')} className="p-3 bg-white dark:bg-[#24172d] hover:bg-[#f3ccde]/20 dark:hover:bg-[#2e1d3a] border border-[#4b1d3f]/20 dark:border-[#3d224d] rounded-2xl text-xs font-bold text-stone-800 dark:text-stone-100 flex items-center justify-center gap-2 shadow-xs transition-colors"><Sparkles size={16} className="text-[#4b1d3f] dark:text-pink-300" /> Personalidade</button>
          <button onClick={() => handleGenerateSuggestion('worlds')} className="p-3 bg-white dark:bg-[#24172d] hover:bg-[#f3ccde]/20 dark:hover:bg-[#2e1d3a] border border-[#4b1d3f]/20 dark:border-[#3d224d] rounded-2xl text-xs font-bold text-stone-800 dark:text-stone-100 flex items-center justify-center gap-2 shadow-xs transition-colors"><Globe size={16} className="text-[#4b1d3f] dark:text-pink-300" /> Mundos</button>
          <button onClick={() => handleGenerateSuggestion('rules')} className="p-3 bg-white dark:bg-[#24172d] hover:bg-[#f3ccde]/20 dark:hover:bg-[#2e1d3a] border border-[#4b1d3f]/20 dark:border-[#3d224d] rounded-2xl text-xs font-bold text-stone-800 dark:text-stone-100 flex items-center justify-center gap-2 shadow-xs transition-colors"><ShieldAlert size={16} className="text-[#4b1d3f] dark:text-pink-300" /> Regras</button>
        </div>

        {currentSuggestion && (
          <div className="bg-[#f3ccde]/20 dark:bg-[#281832] border border-[#4b1d3f]/30 dark:border-[#3d224d] p-4 rounded-2xl space-y-2">
            <div className="flex justify-between items-center">
              <span className="text-[10px] font-bold uppercase tracking-wider text-[#4b1d3f] dark:text-pink-300 bg-white dark:bg-[#24172d] px-2.5 py-0.5 rounded-full border border-[#4b1d3f]/20 dark:border-[#3d224d]">{currentSuggestion.type}</span>
              <button onClick={handleSaveSuggestionAsIdea} className="text-xs font-bold text-[#4b1d3f] dark:text-pink-300 hover:opacity-80 flex items-center gap-1 bg-white dark:bg-[#24172d] px-3 py-1 rounded-xl border border-[#4b1d3f]/20 dark:border-[#3d224d] shadow-xs transition-colors"><BookmarkPlus size={14} /> Salvar</button>
            </div>
            <p className="text-xs font-serif italic text-stone-900 dark:text-stone-100 leading-relaxed">"{currentSuggestion.text}"</p>
          </div>
        )}
      </div>

      {/* LISTA DE NOTAS */}
      <div className="space-y-3">
        <h3 className="font-bold font-serif text-stone-900 dark:text-stone-100 text-lg flex items-center gap-2"><Lightbulb size={20} className="text-[#4b1d3f] dark:text-pink-300" /> Notas do Projeto ({projectIdeas.length})</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {projectIdeas.map((idea) => (
            <div key={idea.id} className="bg-[#FCF8F2] dark:bg-[#1a1120] border border-[#4b1d3f]/20 dark:border-[#3d224d] rounded-2xl p-5 shadow-xs flex flex-col justify-between space-y-3">
              <div className="flex justify-between items-start gap-2">
                <p className="text-xs text-stone-900 dark:text-stone-100 italic font-serif leading-relaxed">"{idea.content}"</p>
                <div className="flex items-center gap-1 shrink-0">
                  <button onClick={() => handleOpenModal(idea)} className="p-1 text-stone-600 dark:text-stone-300 hover:bg-[#f3ccde]/30 dark:hover:bg-[#281832] rounded-lg transition-colors"><Edit2 size={14} /></button>
                  <button onClick={() => setIdeas((prev) => prev.filter((i) => i.id !== idea.id))} className="p-1 text-red-500 hover:bg-red-100 dark:hover:bg-red-950/50 rounded-lg transition-colors"><Trash2 size={14} /></button>
                </div>
              </div>
              <div className="flex justify-between items-center text-[10px] text-stone-600 dark:text-stone-300 border-t border-[#4b1d3f]/10 dark:border-[#3d224d] pt-2">
                <span className="font-semibold text-[#4b1d3f] dark:text-pink-300">{idea.category || 'Geral'}</span>
                <span>{idea.createdAt}</span>
              </div>
            </div>
          ))}
        </div>
        {projectIdeas.length === 0 && (
          <div className="text-center py-12 bg-[#FCF8F2] dark:bg-[#1a1120] rounded-3xl border border-dashed border-[#4b1d3f]/20 dark:border-[#3d224d] text-stone-600 dark:text-stone-300 space-y-2">
            <Lightbulb size={36} className="mx-auto text-stone-400 dark:text-stone-500" />
            <p className="text-sm font-semibold">Nenhuma ideia anotada ainda.</p>
          </div>
        )}
      </div>

      {/* MODAL */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-[#FCF8F2] dark:bg-[#18121e] border border-[#4b1d3f]/30 dark:border-[#3d224d] rounded-3xl p-6 w-full max-w-md shadow-2xl space-y-4 text-stone-900 dark:text-stone-100">
            <div className="flex justify-between items-center border-b border-[#4b1d3f]/20 dark:border-[#3d224d] pb-3">
              <h3 className="font-bold font-serif text-lg">{editingIdeaId ? 'Editar Ideia' : 'Nova Ideia'}</h3>
              <button onClick={() => setIsModalOpen(false)} className="text-stone-600 dark:text-stone-300 hover:text-stone-900 dark:hover:text-stone-100"><X size={18} /></button>
            </div>
            <form onSubmit={handleSaveIdea} className="space-y-3 text-xs">
              <div>
                <label className="block font-bold text-stone-800 dark:text-stone-200 mb-1">Categoria</label>
                <select value={ideaCategory} onChange={(e) => setIdeaCategory(e.target.value as Idea['category'])} className="w-full p-2.5 bg-white dark:bg-[#221a2b] border border-stone-300 dark:border-[#3d224d] rounded-xl text-stone-900 dark:text-stone-100 focus:outline-none">
                  <option value="Geral" className="bg-white dark:bg-[#221a2b]">Geral</option>
                  <option value="Nomes" className="bg-white dark:bg-[#221a2b]">Nomes</option>
                  <option value="Mundo" className="bg-white dark:bg-[#221a2b]">Mundo / Cenário</option>
                  <option value="Personagens" className="bg-white dark:bg-[#221a2b]">Personagens</option>
                  <option value="Regras" className="bg-white dark:bg-[#221a2b]">Regras do Universo</option>
                </select>
              </div>
              <div>
                <label className="block font-bold text-stone-800 dark:text-stone-200 mb-1">Anotação / Insight</label>
                <textarea rows={4} required placeholder="Escreva o seu pensamento..." value={ideaContent} onChange={(e) => setIdeaContent(e.target.value)} className="w-full p-2.5 bg-white dark:bg-[#221a2b] border border-stone-300 dark:border-[#3d224d] rounded-xl text-stone-900 dark:text-stone-100 focus:outline-none resize-y" />
              </div>
              <div className="flex justify-end gap-2 pt-3 border-t border-[#4b1d3f]/20 dark:border-[#3d224d]">
                <button type="button" onClick={() => setIsModalOpen(false)} className="px-4 py-2 bg-stone-200 dark:bg-stone-800 text-stone-800 dark:text-stone-200 rounded-xl font-semibold">Cancelar</button>
                <button type="submit" className="px-4 py-2 bg-[#4b1d3f] dark:bg-pink-800 text-white rounded-xl font-bold flex items-center gap-1"><Check size={16} /> Guardar Ideia</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}