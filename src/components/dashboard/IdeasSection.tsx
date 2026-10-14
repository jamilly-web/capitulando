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
    worlds: ['Vales Sussurrantes: Floresta onde as árvores guardam memórias.', 'Cidada de Quartzo: Fortaleza escavada numa montanha de cristais.'],
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
    <div className="space-y-6 font-sans">
      <div className="bg-[#f7eee3] p-5 rounded-2xl border-2 border-[#d8c2aa] flex flex-col md:flex-row justify-between items-center gap-4 shadow-md">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-[#ebd9c6] text-[#385338] rounded-xl border border-[#d8c2aa]"><Lightbulb size={28} /></div>
          <div>
            <h2 className="text-xl font-bold font-serif text-stone-900">Bloco de Ideias & Gerador Criativo</h2>
            <p className="text-xs text-stone-600">Anote pensamentos e obtenha inspiração automática.</p>
          </div>
        </div>
        <div className="flex items-center gap-3 w-full md:w-auto">
          <div className="flex items-center gap-2 bg-white px-3 py-2 rounded-xl border border-[#d8c2aa] shadow-sm flex-1 md:flex-none">
            <BookOpen size={16} className="text-[#385338]" />
            <select value={selectedProjectId} onChange={(e) => setSelectedProjectId(e.target.value)} className="bg-transparent text-xs font-bold text-stone-800 focus:outline-none cursor-pointer">
              {projects.map((p) => <option key={p.id} value={p.id}>{p.title} ({p.genre || 'Fantasia'})</option>)}
            </select>
          </div>
          <button onClick={() => handleOpenModal()} className="bg-[#385338] hover:bg-[#2c422c] text-white px-4 py-2.5 rounded-xl text-xs font-bold flex items-center gap-2 shadow-sm shrink-0">
            <Plus size={16} /> Nova Ideia
          </button>
        </div>
      </div>

      <div className="bg-white border-2 border-[#d8c2aa] rounded-3xl p-6 shadow-md space-y-4">
        <div className="flex items-center gap-2 border-b border-[#d8c2aa]/60 pb-3">
          <Sparkles size={20} className="text-[#385338]" />
          <h3 className="font-bold font-serif text-stone-900 text-base">Inspiração para o Tema ({currentGenre})</h3>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <button onClick={() => handleGenerateSuggestion('names')} className="p-3 bg-[#f7eee3] hover:bg-[#ebd9c6] border border-[#d8c2aa] rounded-2xl text-xs font-bold flex items-center justify-center gap-2 shadow-sm"><User size={16} className="text-[#385338]" /> Nomes</button>
          <button onClick={() => handleGenerateSuggestion('personalities')} className="p-3 bg-[#f7eee3] hover:bg-[#ebd9c6] border border-[#d8c2aa] rounded-2xl text-xs font-bold flex items-center justify-center gap-2 shadow-sm"><Sparkles size={16} className="text-[#385338]" /> Personalidade</button>
          <button onClick={() => handleGenerateSuggestion('worlds')} className="p-3 bg-[#f7eee3] hover:bg-[#ebd9c6] border border-[#d8c2aa] rounded-2xl text-xs font-bold flex items-center justify-center gap-2 shadow-sm"><Globe size={16} className="text-[#385338]" /> Mundos</button>
          <button onClick={() => handleGenerateSuggestion('rules')} className="p-3 bg-[#f7eee3] hover:bg-[#ebd9c6] border border-[#d8c2aa] rounded-2xl text-xs font-bold flex items-center justify-center gap-2 shadow-sm"><ShieldAlert size={16} className="text-[#385338]" /> Regras</button>
        </div>

        {currentSuggestion && (
          <div className="bg-amber-50 border-2 border-amber-200 p-4 rounded-2xl space-y-2">
            <div className="flex justify-between items-center">
              <span className="text-[10px] font-bold uppercase tracking-wider text-amber-900 bg-amber-200/80 px-2 py-0.5 rounded">{currentSuggestion.type}</span>
              <button onClick={handleSaveSuggestionAsIdea} className="text-xs font-bold text-[#385338] hover:text-[#2c422c] flex items-center gap-1 bg-white px-3 py-1 rounded-xl border border-[#d8c2aa] shadow-sm"><BookmarkPlus size={14} /> Salvar</button>
            </div>
            <p className="text-xs font-serif italic text-stone-800 leading-relaxed">"{currentSuggestion.text}"</p>
          </div>
        )}
      </div>

      <div className="space-y-3">
        <h3 className="font-bold font-serif text-stone-900 text-lg flex items-center gap-2"><Lightbulb size={20} className="text-[#385338]" /> Notas do Projeto ({projectIdeas.length})</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {projectIdeas.map((idea) => (
            <div key={idea.id} className="bg-[#f7eee3] border-2 border-[#d8c2aa] rounded-2xl p-5 shadow-sm flex flex-col justify-between space-y-3">
              <div className="flex justify-between items-start gap-2">
                <p className="text-xs text-stone-800 italic font-serif leading-relaxed">"{idea.content}"</p>
                <div className="flex items-center gap-1 shrink-0">
                  <button onClick={() => handleOpenModal(idea)} className="p-1 text-stone-500 hover:bg-[#ebd9c6] rounded-md"><Edit2 size={14} /></button>
                  <button onClick={() => setIdeas((prev) => prev.filter((i) => i.id !== idea.id))} className="p-1 text-red-500 hover:bg-red-100 rounded-md"><Trash2 size={14} /></button>
                </div>
              </div>
              <div className="flex justify-between items-center text-[10px] text-stone-500 border-t border-[#d8c2aa]/40 pt-2">
                <span className="font-semibold text-[#385338]">{idea.category || 'Geral'}</span>
                <span>{idea.createdAt}</span>
              </div>
            </div>
          ))}
        </div>
        {projectIdeas.length === 0 && (
          <div className="text-center py-12 bg-[#f7eee3] rounded-3xl border-2 border-dashed border-[#d8c2aa] text-stone-500 space-y-2">
            <Lightbulb size={36} className="mx-auto text-stone-400" />
            <p className="text-sm font-semibold">Nenhuma ideia anotada ainda.</p>
          </div>
        )}
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-[#f7eee3] border-2 border-[#d8c2aa] rounded-3xl p-6 w-full max-w-md shadow-2xl space-y-4">
            <div className="flex justify-between items-center border-b border-[#d8c2aa] pb-3">
              <h3 className="font-bold font-serif text-lg text-stone-900">{editingIdeaId ? 'Editar Ideia' : 'Nova Ideia'}</h3>
              <button onClick={() => setIsModalOpen(false)} className="text-stone-500"><X size={18} /></button>
            </div>
            <form onSubmit={handleSaveIdea} className="space-y-3 text-xs">
              <div>
                <label className="block font-bold text-stone-700 mb-1">Categoria</label>
                <select value={ideaCategory} onChange={(e) => setIdeaCategory(e.target.value as Idea['category'])} className="w-full p-2.5 bg-white border border-[#d8c2aa] rounded-xl">
                  <option value="Geral">Geral</option>
                  <option value="Nomes">Nomes</option>
                  <option value="Mundo">Mundo / Cenário</option>
                  <option value="Personagens">Personagens</option>
                  <option value="Regras">Regras do Universo</option>
                </select>
              </div>
              <div>
                <label className="block font-bold text-stone-700 mb-1">Anotação / Insight</label>
                <textarea rows={4} required placeholder="Escreva o seu pensamento..." value={ideaContent} onChange={(e) => setIdeaContent(e.target.value)} className="w-full p-2.5 bg-white border border-[#d8c2aa] rounded-xl" />
              </div>
              <div className="flex justify-end gap-2 pt-3 border-t border-[#d8c2aa]">
                <button type="button" onClick={() => setIsModalOpen(false)} className="px-4 py-2 bg-stone-200 rounded-xl font-semibold">Cancelar</button>
                <button type="submit" className="px-4 py-2 bg-[#385338] text-white rounded-xl font-bold flex items-center gap-1"><Check size={16} /> Guardar Ideia</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}