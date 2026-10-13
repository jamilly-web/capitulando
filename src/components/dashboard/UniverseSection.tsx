'use client';

import React, { useState } from 'react';
import {
  Globe,
  Plus,
  Search,
  MapPin,
  Sparkles,
  BookMarked,
  Shield,
  Edit2,
  Trash2,
  X,
  Check,
  BookOpen,
} from 'lucide-react';
import { useIsolatedStorage } from '@/hooks/useIsolatedStorage';

interface UniverseConcept {
  id: string;
  projectId: string;
  title: string;
  category: 'Local' | 'Regra de Magia' | 'Lore / História' | 'Organização';
  region?: string;
  description: string;
  notes?: string;
  imageUrl?: string;
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

// Conceitos padrão removidos para iniciar vazio por conta
const DEFAULT_CONCEPTS: UniverseConcept[] = [];

export function UniverseSection() {
  // Carrega projetos e conceitos isolados da conta ativa
  const [projects] = useIsolatedStorage<ProjectMinimal[]>('projects', DEFAULT_PROJECTS);
  const [concepts, setConcepts] = useIsolatedStorage<UniverseConcept[]>('universe_concepts', DEFAULT_CONCEPTS);

  const [selectedProjectId, setSelectedProjectId] = useState<string>(
    () => projects[0]?.id || '1'
  );

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('Todos');

  // Modais
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [viewingConcept, setViewingConcept] = useState<UniverseConcept | null>(null);

  // Formulário
  const [formData, setFormData] = useState<Omit<UniverseConcept, 'id' | 'projectId'>>({
    title: '',
    category: 'Local',
    region: 'Geral',
    description: '',
    notes: '',
    imageUrl: '',
  });

  // Filtragem
  const filteredConcepts = concepts.filter((item) => {
    const matchesProject = (item.projectId || '1') === selectedProjectId;
    const matchesSearch =
      item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (item.region && item.region.toLowerCase().includes(searchQuery.toLowerCase()));
    const matchesCategory =
      selectedCategory === 'Todos' || item.category === selectedCategory;

    return matchesProject && matchesSearch && matchesCategory;
  });

  // Ações CRUD
  const handleOpenCreate = () => {
    setEditingId(null);
    setFormData({
      title: '',
      category: 'Local',
      region: 'Geral',
      description: '',
      notes: '',
      imageUrl: '',
    });
    setIsModalOpen(true);
  };

  const handleOpenEdit = (concept: UniverseConcept, e: React.MouseEvent) => {
    e.stopPropagation();
    setEditingId(concept.id);
    setFormData({
      title: concept.title,
      category: concept.category,
      region: concept.region || '',
      description: concept.description,
      notes: concept.notes || '',
      imageUrl: concept.imageUrl || '',
    });
    setIsModalOpen(true);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();

    if (editingId) {
      setConcepts((prev) =>
        prev.map((c) =>
          c.id === editingId
            ? { ...c, ...formData, projectId: selectedProjectId }
            : c
        )
      );
    } else {
      const newConcept: UniverseConcept = {
        id: Date.now().toString(),
        projectId: selectedProjectId,
        ...formData,
      };
      setConcepts((prev) => [newConcept, ...prev]);
    }

    setIsModalOpen(false);
  };

  const handleDelete = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (confirm('Tem a certeza de que deseja eliminar este conceito?')) {
      setConcepts((prev) => prev.filter((c) => c.id !== id));
      if (viewingConcept?.id === id) setViewingConcept(null);
    }
  };

  const categories = [
    'Todos',
    'Local',
    'Regra de Magia',
    'Lore / História',
    'Organização',
  ];

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'Local':
        return <MapPin size={14} />;
      case 'Regra de Magia':
        return <Sparkles size={14} />;
      case 'Lore / História':
        return <BookMarked size={14} />;
      case 'Organização':
        return <Shield size={14} />;
      default:
        return <Globe size={14} />;
    }
  };

  return (
    <div className="space-y-6 font-sans">
      {/* CABEÇALHO */}
      <div className="bg-[#f3ccde]/60 dark:bg-[#221a2b] p-5 rounded-2xl border-2 border-[#4b1d3f]/20 dark:border-[#382b47] flex flex-col md:flex-row justify-between items-start md:items-center gap-4 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-[#f3ccde] dark:bg-[#2a2035] text-[#4b1d3f] dark:text-pink-300 rounded-xl border border-[#4b1d3f]/30">
            <Globe size={28} />
          </div>
          <div>
            <h2 className="text-xl font-bold font-serif text-stone-900 dark:text-stone-100">
              Universo & Ambientação
            </h2>
            <p className="text-xs text-stone-600 dark:text-stone-400">
              Worldbuilding, regras de magia, locais importantes e conceitos do seu mundo.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3 w-full md:w-auto">
          {/* Seletor do Projeto */}
          <div className="flex items-center gap-2 bg-white dark:bg-[#1c1524] px-3 py-2 rounded-xl border border-[#4b1d3f]/20 dark:border-[#382b47] shadow-xs flex-1 md:flex-none">
            <BookOpen size={16} className="text-[#4b1d3f] dark:text-pink-300" />
            <select
              value={selectedProjectId}
              onChange={(e) => setSelectedProjectId(e.target.value)}
              className="bg-transparent text-xs font-bold text-stone-800 dark:text-stone-200 focus:outline-none cursor-pointer"
            >
              {projects.map((p) => (
                <option key={p.id} value={p.id} className="dark:bg-[#1c1524]">
                  {p.title}
                </option>
              ))}
            </select>
          </div>

          <button
            onClick={handleOpenCreate}
            className="bg-[#4b1d3f] hover:bg-[#38142f] dark:bg-pink-800 dark:hover:bg-pink-900 text-white px-4 py-2.5 rounded-xl text-xs font-bold flex items-center justify-center gap-2 shadow-sm transition-transform active:scale-95 shrink-0"
          >
            <Plus size={16} />
            <span>Novo Local / Regra</span>
          </button>
        </div>
      </div>

      {/* BARRA DE PESQUISA & FILTROS DE CATEGORIA */}
      <div className="bg-white dark:bg-[#1a1321] border-2 border-[#4b1d3f]/20 dark:border-[#382b47] rounded-2xl p-4 shadow-sm flex flex-col md:flex-row justify-between items-center gap-4">
        {/* Pesquisa */}
        <div className="relative w-full md:w-80">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-400" />
          <input
            type="text"
            placeholder="Pesquisar local ou regra..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-2 bg-stone-50 dark:bg-[#221a2b] border border-stone-200 dark:border-[#382b47] rounded-xl text-xs text-stone-800 dark:text-stone-100 focus:outline-none focus:ring-2 focus:ring-[#4b1d3f]"
          />
        </div>

        {/* Categorias */}
        <div className="flex flex-wrap items-center gap-1.5 w-full md:w-auto overflow-x-auto pb-1 md:pb-0">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap flex items-center gap-1.5 ${
                selectedCategory === cat
                  ? 'bg-[#4b1d3f] text-white dark:bg-pink-800'
                  : 'bg-stone-100 dark:bg-[#221a2b] text-stone-600 dark:text-stone-300 hover:bg-stone-200'
              }`}
            >
              {getCategoryIcon(cat)}
              <span>{cat}</span>
            </button>
          ))}
        </div>
      </div>

      {/* GRELHA DE CARTÕES DO UNIVERSO */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
        {filteredConcepts.map((item) => (
          <div
            key={item.id}
            onClick={() => setViewingConcept(item)}
            className="bg-white dark:bg-[#1a1321] border-2 border-[#4b1d3f]/20 dark:border-[#382b47] rounded-3xl overflow-hidden shadow-sm hover:shadow-md transition-all cursor-pointer group flex flex-col justify-between"
          >
            {/* Imagem de Capa */}
            {item.imageUrl ? (
              <div className="h-44 w-full relative overflow-hidden bg-stone-100 dark:bg-stone-800">
                <img
                  src={item.imageUrl}
                  alt={item.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
                <span className="absolute top-3 left-3 text-[10px] font-bold uppercase tracking-wider bg-[#4b1d3f]/90 text-white px-2.5 py-1 rounded-lg backdrop-blur-xs flex items-center gap-1 shadow-sm">
                  {getCategoryIcon(item.category)}
                  <span>{item.category}</span>
                </span>
              </div>
            ) : (
              <div className="h-28 w-full bg-gradient-to-br from-[#f3ccde]/50 to-[#4b1d3f]/20 dark:from-[#221a2b] dark:to-[#382b47] p-4 flex items-end">
                <span className="text-[10px] font-bold uppercase tracking-wider bg-[#4b1d3f] text-white px-2.5 py-1 rounded-lg flex items-center gap-1">
                  {getCategoryIcon(item.category)}
                  <span>{item.category}</span>
                </span>
              </div>
            )}

            {/* Conteúdo do Cartão */}
            <div className="p-5 space-y-3 flex-grow flex flex-col justify-between">
              <div className="space-y-2">
                <div className="flex justify-between items-start gap-2">
                  <h3 className="font-serif font-bold text-base text-stone-900 dark:text-stone-100 group-hover:text-[#4b1d3f] dark:group-hover:text-pink-300 transition-colors">
                    {item.title}
                  </h3>
                  <div className="flex items-center gap-1 shrink-0">
                    <button
                      onClick={(e) => handleOpenEdit(item, e)}
                      className="p-1 text-stone-400 hover:text-stone-800 dark:hover:text-stone-200 rounded-md hover:bg-stone-100 dark:hover:bg-[#221a2b]"
                      title="Editar"
                    >
                      <Edit2 size={14} />
                    </button>
                    <button
                      onClick={(e) => handleDelete(item.id, e)}
                      className="p-1 text-red-400 hover:text-red-600 rounded-md hover:bg-red-50 dark:hover:bg-red-950/30"
                      title="Eliminar"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>

                {item.region && (
                  <span className="inline-block text-[10px] font-bold uppercase tracking-wider text-[#4b1d3f] dark:text-pink-300 bg-[#f3ccde]/40 dark:bg-[#221a2b] px-2 py-0.5 rounded border border-[#4b1d3f]/10">
                    Região/Tipo: {item.region}
                  </span>
                )}

                <p className="text-xs text-stone-600 dark:text-stone-300 leading-relaxed line-clamp-3">
                  {item.description}
                </p>
              </div>

              {item.notes && (
                <p className="text-[11px] text-stone-500 italic border-t border-stone-100 dark:border-stone-800 pt-2 font-serif">
                  <strong>Nota:</strong> {item.notes}
                </p>
              )}
            </div>
          </div>
        ))}
      </div>

      {filteredConcepts.length === 0 && (
        <div className="text-center py-16 bg-[#f3ccde]/20 dark:bg-[#1a1321] rounded-3xl border-2 border-dashed border-[#4b1d3f]/20 dark:border-[#382b47] text-stone-500 space-y-2">
          <Globe size={40} className="mx-auto text-stone-400" />
          <p className="text-sm font-semibold">Nenhum conceito encontrado.</p>
          <p className="text-xs text-stone-400">
            Adicione um novo local ou regra para expandir o worldbuilding do seu projeto.
          </p>
        </div>
      )}

      {/* MODAL DE VISUALIZAÇÃO DETALHADA */}
      {viewingConcept && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-[#fcf8f2] dark:bg-[#18121e] border-2 border-[#4b1d3f]/30 dark:border-[#382b47] rounded-3xl overflow-hidden w-full max-w-2xl shadow-2xl space-y-4 max-h-[90vh] flex flex-col">
            {viewingConcept.imageUrl && (
              <div className="h-56 w-full relative">
                <img
                  src={viewingConcept.imageUrl}
                  alt={viewingConcept.title}
                  className="w-full h-full object-cover"
                />
                <button
                  onClick={() => setViewingConcept(null)}
                  className="absolute top-3 right-3 p-2 bg-black/50 hover:bg-black/70 text-white rounded-full transition-colors"
                >
                  <X size={18} />
                </button>
              </div>
            )}

            <div className="p-6 md:p-8 space-y-4 overflow-y-auto">
              <div className="flex justify-between items-start gap-4 border-b border-[#4b1d3f]/15 dark:border-[#382b47] pb-3">
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider bg-[#4b1d3f] text-white px-2.5 py-0.5 rounded">
                    {viewingConcept.category}
                  </span>
                  <h2 className="text-2xl font-serif font-bold text-stone-900 dark:text-stone-100 mt-2">
                    {viewingConcept.title}
                  </h2>
                </div>

                {!viewingConcept.imageUrl && (
                  <button
                    onClick={() => setViewingConcept(null)}
                    className="p-1.5 text-stone-500 hover:text-stone-900 dark:hover:text-stone-100"
                  >
                    <X size={20} />
                  </button>
                )}
              </div>

              {viewingConcept.region && (
                <p className="text-xs text-stone-500 font-semibold">
                  <strong>Região / Tipo:</strong> {viewingConcept.region}
                </p>
              )}

              <div className="space-y-2">
                <h4 className="text-xs font-bold uppercase text-stone-500">Descrição</h4>
                <p className="text-sm font-serif text-stone-800 dark:text-stone-200 leading-relaxed whitespace-pre-wrap">
                  {viewingConcept.description}
                </p>
              </div>

              {viewingConcept.notes && (
                <div className="p-4 bg-[#f3ccde]/30 dark:bg-[#221a2b] border border-[#4b1d3f]/20 rounded-2xl space-y-1">
                  <h4 className="text-xs font-bold text-[#4b1d3f] dark:text-pink-300">
                    Notas Adicionais
                  </h4>
                  <p className="text-xs italic text-stone-700 dark:text-stone-300 font-serif">
                    {viewingConcept.notes}
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* MODAL CRIAR / EDITAR CONCEITO */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-[#fcf8f2] dark:bg-[#18121e] border-2 border-[#4b1d3f]/30 dark:border-[#382b47] rounded-3xl p-6 w-full max-w-lg shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center border-b border-[#4b1d3f]/20 dark:border-[#382b47] pb-3">
              <h3 className="font-bold font-serif text-lg text-stone-900 dark:text-stone-100">
                {editingId ? 'Editar Elemento do Universo' : 'Novo Elemento do Universo'}
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-stone-500 hover:text-stone-900 dark:hover:text-stone-100"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSave} className="space-y-3 text-xs">
              <div>
                <label className="block font-bold text-stone-700 dark:text-stone-300 mb-1">
                  Nome do Local / Regra / Conceito
                </label>
                <input
                  type="text"
                  required
                  placeholder="Ex: Floresta dos Espelhos, Ordem dos Arcanos..."
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="w-full p-2.5 bg-white dark:bg-[#221a2b] border border-[#4b1d3f]/30 dark:border-[#382b47] rounded-xl text-stone-800 dark:text-stone-100 focus:outline-none focus:ring-2 focus:ring-[#4b1d3f]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-stone-700 dark:text-stone-300 mb-1">
                    Categoria
                  </label>
                  <select
                    value={formData.category}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        category: e.target.value as UniverseConcept['category'],
                      })
                    }
                    className="w-full p-2.5 bg-white dark:bg-[#221a2b] border border-[#4b1d3f]/30 dark:border-[#382b47] rounded-xl text-stone-800 dark:text-stone-100 focus:outline-none focus:ring-2 focus:ring-[#4b1d3f]"
                  >
                    <option value="Local">Local</option>
                    <option value="Regra de Magia">Regra de Magia</option>
                    <option value="Lore / História">Lore / História</option>
                    <option value="Organização">Organização</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-stone-700 dark:text-stone-300 mb-1">
                    Região / Escala
                  </label>
                  <input
                    type="text"
                    placeholder="Ex: Norte, Global, Reino do Sul"
                    value={formData.region}
                    onChange={(e) => setFormData({ ...formData, region: e.target.value })}
                    className="w-full p-2.5 bg-white dark:bg-[#221a2b] border border-[#4b1d3f]/30 dark:border-[#382b47] rounded-xl text-stone-800 dark:text-stone-100 focus:outline-none focus:ring-2 focus:ring-[#4b1d3f]"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-stone-700 dark:text-stone-300 mb-1">
                  URL da Imagem de Capa (Opcional)
                </label>
                <input
                  type="url"
                  placeholder="https://exemplo.com/imagem.jpg"
                  value={formData.imageUrl}
                  onChange={(e) => setFormData({ ...formData, imageUrl: e.target.value })}
                  className="w-full p-2.5 bg-white dark:bg-[#221a2b] border border-[#4b1d3f]/30 dark:border-[#382b47] rounded-xl text-stone-800 dark:text-stone-100 focus:outline-none focus:ring-2 focus:ring-[#4b1d3f]"
                />
              </div>

              <div>
                <label className="block font-bold text-stone-700 dark:text-stone-300 mb-1">
                  Descrição do Conceito
                </label>
                <textarea
                  rows={4}
                  required
                  placeholder="Descreva a história, geografia ou funcionamento..."
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full p-2.5 bg-white dark:bg-[#221a2b] border border-[#4b1d3f]/30 dark:border-[#382b47] rounded-xl text-stone-800 dark:text-stone-100 focus:outline-none focus:ring-2 focus:ring-[#4b1d3f]"
                />
              </div>

              <div>
                <label className="block font-bold text-stone-700 dark:text-stone-300 mb-1">
                  Notas / Segredos do Autor
                </label>
                <input
                  type="text"
                  placeholder="Detalhes adicionais para o desenvolvimento da trama..."
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  className="w-full p-2.5 bg-white dark:bg-[#221a2b] border border-[#4b1d3f]/30 dark:border-[#382b47] rounded-xl text-stone-800 dark:text-stone-100 focus:outline-none focus:ring-2 focus:ring-[#4b1d3f]"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-[#4b1d3f]/20 dark:border-[#382b47]">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 bg-stone-200 dark:bg-stone-800 text-stone-800 dark:text-stone-200 rounded-xl font-semibold"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-[#4b1d3f] hover:bg-[#38142f] dark:bg-pink-700 dark:hover:bg-pink-800 text-white rounded-xl font-bold flex items-center gap-1 shadow-sm"
                >
                  <Check size={16} /> Guardar Conceito
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}