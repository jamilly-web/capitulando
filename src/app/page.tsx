'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Sidebar } from '@/components/dashboard/Sidebar';
import { CharactersSection } from '@/components/dashboard/CharactersSection';
import { ProjectsSection } from '@/components/dashboard/ProjectsSection';
import { TimelineSection } from '@/components/dashboard/TimelineSection';
import { UniverseSection } from '@/components/dashboard/UniverseSection';
import { WritingSpace } from '@/components/dashboard/WritingSection';
import { GoalsSection } from '@/components/dashboard/GoalsSection';
import { IdeasSection } from '@/components/dashboard/IdeasSection';
import { ProfileSection } from '@/components/dashboard/ProfileSection';
import { useActiveProfile } from '@/hooks/useActiveProfile';
import { useIsolatedStorage } from '@/hooks/useIsolatedStorage';
import {
  Sun,
  Moon,
  Feather,
  ArrowRight,
  ShieldCheck,
  BookOpen,
  Target,
  Lightbulb,
  Sparkles,
  CheckCircle2,
} from 'lucide-react';

interface Project {
  id: string;
  title: string;
  genre?: string;
  chapters?: { wordCount?: number }[];
}

interface Goal {
  id: string;
  completed: boolean;
}

interface Idea {
  id: string;
}

export default function Page() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<string>('painel');
  
  // Lê o ID do perfil e os dados do perfil autenticado
  const { activeProfileId, currentProfile } = useActiveProfile();

  // Dados isolados por utilizador para estatísticas reais
  const [projects] = useIsolatedStorage<Project[]>('projects', []);
  const [goals] = useIsolatedStorage<Goal[]>('goals', []);
  const [ideas] = useIsolatedStorage<Idea[]>('ideas', []);

  // Cálculos dinâmicos
  const totalBooks = projects.length;
  const completedGoals = goals.filter((g) => g.completed).length;
  const totalIdeas = ideas.length;
  const totalWords = projects.reduce((acc, p) => {
    const projWords = p.chapters?.reduce((sum, ch) => sum + (ch.wordCount || 0), 0) || 0;
    return acc + projWords;
  }, 0);

  // Validar sessão ao carregar a página
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const activeProfile = localStorage.getItem('capitulando_active_profile_id');
      if (!activeProfile) {
        router.push('/login');
      } else {
        setIsLoading(false);
      }
    }
  }, [router]);

  const [isDarkMode, setIsDarkMode] = useState<boolean>(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('capitulando_theme') === 'dark';
    }
    return false;
  });

  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('capitulando_theme', isDarkMode ? 'dark' : 'light');
    }
  }, [isDarkMode]);

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#F5F0E8] text-[#4B2858] font-sans">
        <p className="text-sm font-semibold animate-pulse">A carregar o seu escritório literário...</p>
      </div>
    );
  }

  const pageBackgrounds: Record<string, string> = {
    painel: isDarkMode ? 'bg-[#18121e] text-stone-100' : 'bg-[#f3ccde] text-stone-800',
    projetos: isDarkMode ? 'bg-[#18121e] text-stone-100' : 'bg-[#f3ccde] text-stone-800',
    personagens: isDarkMode ? 'bg-[#18121e] text-stone-100' : 'bg-[#f3ccde] text-stone-800',
    timeline: isDarkMode ? 'bg-[#18121e] text-stone-100' : 'bg-[#f3ccde] text-stone-800',
    universo: isDarkMode ? 'bg-[#18121e] text-stone-100' : 'bg-[#f3ccde] text-stone-800',
    escrita: isDarkMode ? 'bg-[#120e17] text-stone-100' : 'bg-[#f3ccde] text-stone-800',
    metas: isDarkMode ? 'bg-[#18121e] text-stone-100' : 'bg-[#f3ccde] text-stone-800',
    ideias: isDarkMode ? 'bg-[#18121e] text-stone-100' : 'bg-[#f3ccde] text-stone-800',
    perfil: isDarkMode ? 'bg-[#18121e] text-stone-100' : 'bg-[#f3ccde] text-stone-800',
  };

  return (
    <div className={`flex min-h-screen ${isDarkMode ? 'dark bg-[#120e17]' : 'bg-[#f3ccde]'}`}>
      <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} />

      <main
        className={`flex-1 p-6 md:p-8 space-y-6 overflow-y-auto transition-colors duration-300 ${
          pageBackgrounds[activeTab] || (isDarkMode ? 'bg-[#18121e]' : 'bg-[#ebd9c6]')
        }`}
      >
        {/* BARRA SUPERIOR */}
        <div className="flex flex-wrap justify-between items-center gap-4">
          <div className="flex items-center gap-3">
            <span className="text-[10px] font-bold uppercase tracking-wider text-[#4b1d3f] dark:text-pink-300 bg-white/60 dark:bg-[#2a2035] px-3 py-1 rounded-full border border-[#4b1d3f]/20">
              Escritório Literário
            </span>
          </div>

          <button
            onClick={() => setIsDarkMode(!isDarkMode)}
            className={`p-2.5 rounded-xl border flex items-center gap-2 text-xs font-bold transition-all shadow-xs ${
              isDarkMode
                ? 'bg-[#2a2035] text-amber-300 border-[#3d2e4d] hover:bg-[#382b47]'
                : 'bg-white text-[#4b1d3f] border-[#4b1d3f]/20 hover:bg-[#f3ccde]/40'
            }`}
            title="Alternar Modo Escuro / Claro"
          >
            {isDarkMode ? (
              <>
                <Sun size={16} className="text-amber-300" />
                <span>Modo Claro</span>
              </>
            ) : (
              <>
                <Moon size={16} className="text-[#4b1d3f]" />
                <span>Modo Escuro</span>
              </>
            )}
          </button>
        </div>

        {/* SEÇÕES ISOLADAS PELO ID DO UTILIZADOR LOGADO */}
        {activeTab === 'projetos' && <ProjectsSection key={activeProfileId} />}
        {activeTab === 'personagens' && <CharactersSection key={activeProfileId} />}
        {activeTab === 'timeline' && <TimelineSection key={activeProfileId} />}
        {activeTab === 'universo' && <UniverseSection key={activeProfileId} />}
        {activeTab === 'escrita' && <WritingSpace key={activeProfileId} />}
        {activeTab === 'metas' && <GoalsSection key={activeProfileId} />}
        {activeTab === 'ideias' && <IdeasSection key={activeProfileId} />}
        {activeTab === 'perfil' && <ProfileSection key={activeProfileId} />}

        {/* PAINEL PRINCIPAL MELHORADO */}
        {activeTab === 'painel' && (
          <div className="space-y-6">
            {/* Banner de Boas-Vindas */}
            <div className="bg-gradient-to-r from-[#fcf8f2] to-[#f3ccde]/60 dark:from-[#1f1728] dark:to-[#2a2035] border-2 border-[#4b1d3f]/20 dark:border-[#382b47] rounded-3xl p-6 md:p-8 shadow-sm flex flex-col md:flex-row justify-between items-start md:items-center gap-6 relative overflow-hidden">
              <div className="space-y-2 z-10 max-w-xl">
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/80 dark:bg-[#2a2035] text-[#4b1d3f] dark:text-pink-300 text-xs font-bold border border-[#4b1d3f]/20 shadow-xs">
                  <Sparkles size={14} />
                  <span>Sessão Privada Ativa</span>
                </div>
                <h1 className={`text-2xl md:text-3xl font-bold font-serif ${isDarkMode ? 'text-white' : 'text-stone-900'}`}>
                  Boas-vindas, {currentProfile.name}!
                </h1>
                <p className={`text-xs md:text-sm leading-relaxed ${isDarkMode ? 'text-stone-300' : 'text-stone-600'}`}>
                  O seu santuário criativo está pronto. Acompanhe o progresso das suas obras, consulte o worldbuilding ou continue a escrever o seu próximo capítulo.
                </p>
              </div>

              <button
                onClick={() => setActiveTab('escrita')}
                className="z-10 bg-[#4b1d3f] hover:bg-[#38142f] dark:bg-pink-800 dark:hover:bg-pink-900 text-white px-5 py-3 rounded-2xl text-xs font-bold flex items-center gap-2 shadow-md transition-all active:scale-95 shrink-0"
              >
                <Feather size={18} />
                <span>Continuar Escrevendo</span>
                <ArrowRight size={16} />
              </button>
            </div>

            {/* Grelha de Estatísticas Rápidas */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="bg-white dark:bg-[#1a1321] border-2 border-[#4b1d3f]/20 dark:border-[#382b47] p-5 rounded-2xl shadow-sm space-y-1">
                <div className="flex justify-between items-center text-[#4b1d3f] dark:text-pink-300">
                  <BookOpen size={20} />
                  <span className="text-[10px] font-bold uppercase tracking-wider text-stone-400">Livros</span>
                </div>
                <p className="text-2xl font-bold font-serif text-stone-900 dark:text-stone-100">{totalBooks}</p>
                <p className="text-[11px] text-stone-500">Projetos criados</p>
              </div>

              <div className="bg-white dark:bg-[#1a1321] border-2 border-[#4b1d3f]/20 dark:border-[#382b47] p-5 rounded-2xl shadow-sm space-y-1">
                <div className="flex justify-between items-center text-[#4b1d3f] dark:text-pink-300">
                  <Feather size={20} />
                  <span className="text-[10px] font-bold uppercase tracking-wider text-stone-400">Escrita</span>
                </div>
                <p className="text-2xl font-bold font-serif text-stone-900 dark:text-stone-100">{totalWords}</p>
                <p className="text-[11px] text-stone-500">Palavras guardadas</p>
              </div>

              <div className="bg-white dark:bg-[#1a1321] border-2 border-[#4b1d3f]/20 dark:border-[#382b47] p-5 rounded-2xl shadow-sm space-y-1">
                <div className="flex justify-between items-center text-[#4b1d3f] dark:text-pink-300">
                  <Target size={20} />
                  <span className="text-[10px] font-bold uppercase tracking-wider text-stone-400">Metas</span>
                </div>
                <p className="text-2xl font-bold font-serif text-stone-900 dark:text-stone-100">{completedGoals}</p>
                <p className="text-[11px] text-stone-500">Objetivos concluídos</p>
              </div>

              <div className="bg-white dark:bg-[#1a1321] border-2 border-[#4b1d3f]/20 dark:border-[#382b47] p-5 rounded-2xl shadow-sm space-y-1">
                <div className="flex justify-between items-center text-[#4b1d3f] dark:text-pink-300">
                  <Lightbulb size={20} />
                  <span className="text-[10px] font-bold uppercase tracking-wider text-stone-400">Ideias</span>
                </div>
                <p className="text-2xl font-bold font-serif text-stone-900 dark:text-stone-100">{totalIdeas}</p>
                <p className="text-[11px] text-stone-500">Notas e insights</p>
              </div>
            </div>

            {/* Secção Inferior: Projetos Recentes & Privacidade */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Projetos Recentes */}
              <div className="md:col-span-2 bg-white dark:bg-[#1a1321] border-2 border-[#4b1d3f]/20 dark:border-[#382b47] rounded-3xl p-6 shadow-sm space-y-4">
                <div className="flex justify-between items-center border-b border-[#4b1d3f]/15 dark:border-[#382b47] pb-3">
                  <h3 className="font-serif font-bold text-base text-stone-900 dark:text-stone-100 flex items-center gap-2">
                    <BookOpen size={18} className="text-[#4b1d3f] dark:text-pink-300" />
                    <span>Os Seus Livros & Projetos</span>
                  </h3>
                  <button
                    onClick={() => setActiveTab('projetos')}
                    className="text-xs font-bold text-[#4b1d3f] dark:text-pink-300 hover:underline flex items-center gap-1"
                  >
                    <span>Ver Todos</span>
                    <ArrowRight size={14} />
                  </button>
                </div>

                <div className="space-y-3">
                  {projects.length > 0 ? (
                    projects.slice(0, 3).map((proj) => (
                      <div
                        key={proj.id}
                        onClick={() => setActiveTab('escrita')}
                        className="p-4 bg-stone-50 dark:bg-[#221a2b] border border-stone-200 dark:border-[#382b47] rounded-2xl flex justify-between items-center hover:border-[#4b1d3f]/50 transition-all cursor-pointer group"
                      >
                        <div className="space-y-1">
                          <h4 className="font-serif font-bold text-sm text-stone-900 dark:text-stone-100 group-hover:text-[#4b1d3f] dark:group-hover:text-pink-300 transition-colors">
                            {proj.title}
                          </h4>
                          <span className="inline-block text-[10px] font-bold uppercase tracking-wider bg-[#f3ccde]/60 dark:bg-[#2a2035] text-[#4b1d3f] dark:text-pink-300 px-2 py-0.5 rounded">
                            {proj.genre || 'Geral'}
                          </span>
                        </div>
                        <div className="p-2 bg-white dark:bg-[#1a1321] rounded-xl text-stone-400 group-hover:text-[#4b1d3f] dark:group-hover:text-pink-300 transition-colors shadow-xs">
                          <ArrowRight size={16} />
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-8 text-stone-400 text-xs italic">
                      Nenhum livro criado ainda. Vá ao Espaço de Escrita para criar o seu primeiro livro!
                    </div>
                  )}
                </div>
              </div>

              {/* Privacidade de Dados */}
              <div className="bg-white dark:bg-[#1a1321] border-2 border-[#4b1d3f]/20 dark:border-[#382b47] rounded-3xl p-6 shadow-sm space-y-4 flex flex-col justify-between">
                <div className="space-y-3">
                  <div className="flex items-center gap-2 text-[#4b1d3f] dark:text-pink-300 border-b border-[#4b1d3f]/15 dark:border-[#382b47] pb-3">
                    <ShieldCheck size={20} />
                    <h3 className="font-serif font-bold text-base text-stone-900 dark:text-stone-100">
                      Privacidade de Dados
                    </h3>
                  </div>
                  <p className="text-xs text-stone-600 dark:text-stone-300 leading-relaxed">
                    A sua conta possui um ecossistema 100% isolado. Nenhuma alteração efetuada nesta sessão afetará outras contas do sistema.
                  </p>
                </div>

                <div className="p-3 bg-[#f3ccde]/30 dark:bg-[#221a2b] border border-[#4b1d3f]/20 dark:border-[#382b47] rounded-2xl flex items-center gap-3">
                  <div className="p-2 bg-[#f3ccde] dark:bg-[#2a2035] text-[#4b1d3f] dark:text-pink-300 rounded-xl">
                    <CheckCircle2 size={18} />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-stone-800 dark:text-stone-200">Sessão Protegida</p>
                    <span className="text-[10px] text-stone-500">Armazenamento local isolado</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}