'use client';

import React, { useState } from 'react';
import {
  Search, Plus, Edit2, Trash2, Calendar, Ruler, Weight, Sparkles, Smile, Frown, Quote, Star, Paperclip, X, Check, Heart, Users, ArrowRight, BookOpen,
} from 'lucide-react';
import { useIsolatedStorage } from '@/hooks/useIsolatedStorage';

interface Character {
  id: string; projectId: string; name: string; role: 'Protagonista' | 'Aliado' | 'Antagonista' | 'Secundário';
  age: number; height: string; weight: string; zodiac: string; mbti: string; imageUrl?: string;
  appearance: string[]; likes: string[]; dislikes: string[]; drinks: string[]; motto: string; shortNote: string;
}

interface Relationship {
  id: string; projectId: string; character1Id: string; character2Id: string; type: string; description: string;
}

interface ProjectMinimal { id: string; title: string; }

const DEFAULT_PROJECTS: ProjectMinimal[] = [
  { id: '1', title: 'O Guardião da Floresta' },
  { id: '2', title: 'Segredos de Algures' },
];

export function CharactersSection() {
  const [activeTab, setActiveTab] = useState<'characters' | 'relationships'>('characters');
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('Todos');

  const [projects] = useIsolatedStorage<ProjectMinimal[]>('projects', DEFAULT_PROJECTS);
  const [characters, setCharacters] = useIsolatedStorage<Character[]>('characters', []);
  const [relationships, setRelationships] = useIsolatedStorage<Relationship[]>('relationships', []);
  const [selectedProjectId, setSelectedProjectId] = useState(() => projects[0]?.id || '1');

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [isRelModalOpen, setIsRelModalOpen] = useState(false);
  const [editingRelId, setEditingRelId] = useState<string | null>(null);

  const initialCharData = { name: '', role: 'Protagonista' as Character['role'], age: 20, height: '', weight: '', zodiac: '', mbti: '', imageUrl: '', appearance: '', likes: '', dislikes: '', drinks: '', motto: '', shortNote: '' };
  const [formData, setFormData] = useState(initialCharData);
  const [relFormData, setRelFormData] = useState({ character1Id: '', character2Id: '', type: '', description: '' });

  const currentChars = characters.filter((c) => (c.projectId || '1') === selectedProjectId);
  const currentRels = relationships.filter((r) => (r.projectId || '1') === selectedProjectId);

  const handleOpenCharModal = (char?: Character) => {
    if (char) {
      setEditingId(char.id);
      setFormData({ ...char, appearance: char.appearance.join(', '), likes: char.likes.join(', '), dislikes: char.dislikes.join(', '), drinks: char.drinks.join(', '), imageUrl: char.imageUrl || '' });
    } else {
      setEditingId(null);
      setFormData(initialCharData);
    }
    setIsModalOpen(true);
  };

  const handleSaveChar = (e: React.FormEvent) => {
    e.preventDefault();
    const splitArr = (str: string) => str ? str.split(',').map((s) => s.trim()).filter(Boolean) : [];
    const formatted: Character = {
      ...formData,
      id: editingId || Date.now().toString(),
      projectId: selectedProjectId,
      name: formData.name || 'Sem nome',
      age: Number(formData.age) || 0,
      imageUrl: formData.imageUrl || undefined,
      appearance: splitArr(formData.appearance),
      likes: splitArr(formData.likes),
      dislikes: splitArr(formData.dislikes),
      drinks: splitArr(formData.drinks),
    };
    setCharacters((prev) => editingId ? prev.map((c) => c.id === editingId ? formatted : c) : [formatted, ...prev]);
    setIsModalOpen(false);
  };

  const handleDeleteChar = (id: string) => {
    if (confirm('Tem a certeza que deseja eliminar esta ficha?')) {
      setCharacters((prev) => prev.filter((c) => c.id !== id));
      setRelationships((prev) => prev.filter((r) => r.character1Id !== id && r.character2Id !== id));
    }
  };

  const handleOpenRelModal = (rel?: Relationship) => {
    if (rel) {
      setEditingRelId(rel.id);
      setRelFormData({ character1Id: rel.character1Id, character2Id: rel.character2Id, type: rel.type, description: rel.description });
    } else {
      setEditingRelId(null);
      setRelFormData({ character1Id: currentChars[0]?.id || '', character2Id: currentChars[1]?.id || currentChars[0]?.id || '', type: '', description: '' });
    }
    setIsRelModalOpen(true);
  };

  const handleSaveRel = (e: React.FormEvent) => {
    e.preventDefault();
    if (!relFormData.character1Id || !relFormData.character2Id) return alert('Selecione dois personagens válidos.');
    const newRel: Relationship = { ...relFormData, id: editingRelId || Date.now().toString(), projectId: selectedProjectId, type: relFormData.type || 'Indefinido' };
    setRelationships((prev) => editingRelId ? prev.map((r) => r.id === editingRelId ? newRel : r) : [newRel, ...prev]);
    setIsRelModalOpen(false);
  };

  const filteredChars = currentChars.filter((c) => c.name.toLowerCase().includes(search.toLowerCase()) && (filter === 'Todos' || c.role === filter));

  return (
    <div className="space-y-6 font-sans">
      <div className="flex flex-col md:flex-row md:items-center justify-between border-b-2 border-[#d8c2aa] pb-2 gap-4">
        <div className="flex gap-4">
          <button onClick={() => setActiveTab('characters')} className={`pb-2 px-3 font-bold text-sm flex items-center gap-2 border-b-4 -mb-[10px] ${activeTab === 'characters' ? 'border-[#32005c] text-[#385338]' : 'border-transparent text-stone-500'}`}>
            <Users size={18} /> <span>Fichas ({currentChars.length})</span>
          </button>
          <button onClick={() => setActiveTab('relationships')} className={`pb-2 px-3 font-bold text-sm flex items-center gap-2 border-b-4 -mb-[10px] ${activeTab === 'relationships' ? 'border-[#32005c] text-[#385338]' : 'border-transparent text-stone-500'}`}>
            <Heart size={18} /> <span>Relacionamentos ({currentRels.length})</span>
          </button>
        </div>
        <div className="flex items-center gap-2 bg-[#f7eee3] px-3 py-1.5 rounded-xl border border-[#d8c2aa]">
          <BookOpen size={16} className="text-[#385338]" /> <span className="text-xs font-medium text-stone-600">Projeto:</span>
          <select value={selectedProjectId} onChange={(e) => setSelectedProjectId(e.target.value)} className="bg-transparent text-xs font-bold focus:outline-none cursor-pointer">
            {projects.map((p) => <option key={p.id} value={p.id}>{p.title}</option>)}
          </select>
        </div>
      </div>

      {activeTab === 'characters' && (
        <>
          <div className="bg-[#FAE6FA] p-4 rounded-2xl border-2 border-[#32005c] flex flex-col md:flex-row gap-4 items-center justify-between shadow-md">
            <div className="relative w-full md:w-80">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-400" size={18} />
              <input type="text" placeholder="Pesquisar ficha..." value={search} onChange={(e) => setSearch(e.target.value)} className="w-full pl-10 pr-4 py-2 bg-white/50 border border-[#32005c] rounded-xl text-xs" />
            </div>
            <div className="flex flex-wrap gap-2">
              {['Todos', 'Protagonista', 'Aliado', 'Antagonista', 'Secundário'].map((cat) => (
                <button key={cat} onClick={() => setFilter(cat)} className={`px-3 py-1.5 rounded-lg text-xs font-semibold ${filter === cat ? 'bg-[#32005c] text-white' : 'bg-[#FAE6FA]/60 text-stone-700'}`}>{cat}</button>
              ))}
            </div>
            <button onClick={() => handleOpenCharModal()} className="bg-[#32005c] text-white px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2"><Plus size={16} /> Criar Ficha</button>
          </div>

          <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
            {filteredChars.map((char) => (
              <div key={char.id} className="relative bg-[#FAE6FA] border-2 border-[#32005c] rounded-3xl p-6 shadow-lg space-y-6">
                <div className="absolute top-4 right-4 flex gap-2">
                  <button onClick={() => handleOpenCharModal(char)} className="p-1.5 bg-[#f3ccde] rounded-lg border border-[#d8c2aa]"><Edit2 size={15} /></button>
                  <button onClick={() => handleDeleteChar(char.id)} className="p-1.5 bg-[#f3ccde] text-red-600 rounded-lg border border-[#d8c2aa]"><Trash2 size={15} /></button>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-12 gap-6 items-start pt-2">
                  <div className="sm:col-span-5 flex flex-col items-center">
                    <div className="relative p-2 bg-[#f7eee3] border-2 border-[#d8c2aa] rounded-2xl w-full max-w-[200px]">
                      <Paperclip size={20} className="absolute -top-3 left-1/2 -translate-x-1/2 text-stone-500" />
                      <div className="aspect-[3/4] w-full rounded-xl overflow-hidden bg-stone-200 border border-[#d8c2aa]">
                        {char.imageUrl ? <img src={char.imageUrl} alt={char.name} className="w-full h-full object-cover" /> : <div className="w-full h-full flex items-center justify-center text-xs text-stone-400">Sem foto</div>}
                      </div>
                      <div className="mt-2 text-center"><span className="px-2.5 py-0.5 text-[10px] font-bold bg-[#32005c] text-white rounded-full">{char.role}</span></div>
                    </div>
                  </div>
                  <div className="sm:col-span-7 space-y-4">
                    <h3 className="text-2xl font-bold font-serif">{char.name}</h3>
                    <div className="grid grid-cols-2 gap-2 text-xs bg-[#f3ccde]/70 p-3 rounded-xl border border-[#32005c]">
                      <span><Calendar size={14} className="inline mr-1 text-[#385338]" /> {char.age} anos</span>
                      <span><Ruler size={14} className="inline mr-1 text-[#385338]" /> {char.height}</span>
                      <span><Weight size={14} className="inline mr-1 text-[#385338]" /> {char.weight}</span>
                      <span><Star size={14} className="inline mr-1 text-[#385338]" /> {char.zodiac}</span>
                      <span className="col-span-2 pt-1 border-t border-[#d8c2aa]/40"><Sparkles size={14} className="inline mr-1 text-[#385338]" /> MBTI: {char.mbti}</span>
                    </div>
                  </div>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                  <div className="bg-[#f3ccde]/50 p-3 rounded-xl border border-[#32005c]"><h4 className="font-bold mb-1">Aparência</h4><p className="text-stone-600">{char.appearance.join(', ')}</p></div>
                  <div className="bg-[#f3ccde]/50 p-3 rounded-xl border border-[#32005c] space-y-2">
                    <div><h4 className="font-bold">Gosta</h4><p className="text-stone-600">{char.likes.join(', ')}</p></div>
                    <div><h4 className="font-bold text-red-700">Não Gosta</h4><p className="text-stone-600">{char.dislikes.join(', ')}</p></div>
                  </div>
                </div>
                <div className="text-xs space-y-2">
                  <div className="bg-amber-50 p-3 rounded-xl border border-amber-200 text-amber-900"><strong>Nota:</strong> {char.shortNote}</div>
                  {char.motto && <div className="italic text-stone-600 bg-[#f3ccde]/40 p-2.5 rounded-xl border border-[#32005c]/60"><Quote size={14} className="inline mr-1 text-[#385338]" />"{char.motto}"</div>}
                </div>
              </div>
            ))}
          </div>
        </>
      )}

      {activeTab === 'relationships' && (
        <div className="space-y-6">
          <div className="bg-[#FAE6FA] p-4 rounded-2xl border-2 border-[#32005c] flex justify-between items-center shadow-md">
            <div><h3 className="font-bold text-base">Mapa de Relacionamentos</h3></div>
            <button onClick={() => handleOpenRelModal()} disabled={currentChars.length < 2} className="bg-[#32005c] disabled:opacity-50 text-white px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2"><Plus size={16} /> Adicionar Relacionamento</button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {currentRels.map((rel) => {
              const c1 = currentChars.find((c) => c.id === rel.character1Id);
              const c2 = currentChars.find((c) => c.id === rel.character2Id);
              if (!c1 || !c2) return null;
              return (
                <div key={rel.id} className="bg-white border-2 border-[#32005c] rounded-2xl p-5 shadow-md relative space-y-3">
                  <div className="absolute top-3 right-3 flex gap-1">
                    <button onClick={() => handleOpenRelModal(rel)} className="p-1 text-stone-500"><Edit2 size={14} /></button>
                    <button onClick={() => setRelationships((prev) => prev.filter((r) => r.id !== rel.id))} className="p-1 text-red-500"><Trash2 size={14} /></button>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="text-center w-24"><span className="text-xs font-bold block truncate">{c1.name}</span></div>
                    <div className="flex-1 text-center"><span className="px-2 py-0.5 bg-[#FAE6FA] border border-[#32005c] rounded-full text-[10px] font-bold text-[#32005c]">{rel.type}</span></div>
                    <div className="text-center w-24"><span className="text-xs font-bold block truncate">{c2.name}</span></div>
                  </div>
                  {rel.description && <p className="text-xs text-stone-600 bg-[#FAE6FA]/50 p-2 rounded-xl">{rel.description}</p>}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Modal Ficha */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-[#f5f5f5] border-2 border-[#32005c] rounded-3xl p-6 w-full max-w-xl max-h-[90vh] overflow-y-auto space-y-4">
            <div className="flex justify-between items-center border-b border-[#32005c] pb-2"><h3 className="font-bold text-lg">{editingId ? 'Editar Ficha' : 'Criar Nova Ficha'}</h3><button onClick={() => setIsModalOpen(false)}><X size={18} /></button></div>
            <form onSubmit={handleSaveChar} className="space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-2">
                <input type="text" placeholder="Nome" required value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} className="p-2 border border-[#32005c] rounded-lg" />
                <select value={formData.role} onChange={(e) => setFormData({ ...formData, role: e.target.value as Character['role'] })} className="p-2 border border-[#32005c] rounded-lg">
                  {['Protagonista', 'Aliado', 'Antagonista', 'Secundário'].map((r) => <option key={r} value={r}>{r}</option>)}
                </select>
              </div>
              <div className="grid grid-cols-3 gap-2">
                <input type="number" placeholder="Idade" value={formData.age} onChange={(e) => setFormData({ ...formData, age: Number(e.target.value) })} className="p-2 border border-[#32005c] rounded-lg" />
                <input type="text" placeholder="Altura" value={formData.height} onChange={(e) => setFormData({ ...formData, height: e.target.value })} className="p-2 border border-[#32005c] rounded-lg" />
                <input type="text" placeholder="Peso" value={formData.weight} onChange={(e) => setFormData({ ...formData, weight: e.target.value })} className="p-2 border border-[#32005c] rounded-lg" />
              </div>
              <div className="grid grid-cols-2 gap-2">
                <input type="text" placeholder="Signo" value={formData.zodiac} onChange={(e) => setFormData({ ...formData, zodiac: e.target.value })} className="p-2 border border-[#32005c] rounded-lg" />
                <input type="text" placeholder="MBTI" value={formData.mbti} onChange={(e) => setFormData({ ...formData, mbti: e.target.value })} className="p-2 border border-[#32005c] rounded-lg" />
              </div>
              <input type="text" placeholder="URL da Imagem" value={formData.imageUrl} onChange={(e) => setFormData({ ...formData, imageUrl: e.target.value })} className="w-full p-2 border border-[#32005c] rounded-lg" />
              <input type="text" placeholder="Aparência (separada por vírgulas)" value={formData.appearance} onChange={(e) => setFormData({ ...formData, appearance: e.target.value })} className="w-full p-2 border border-[#32005c] rounded-lg" />
              <div className="grid grid-cols-2 gap-2">
                <input type="text" placeholder="Gosta (vírgulas)" value={formData.likes} onChange={(e) => setFormData({ ...formData, likes: e.target.value })} className="p-2 border border-[#32005c] rounded-lg" />
                <input type="text" placeholder="Não Gosta (vírgulas)" value={formData.dislikes} onChange={(e) => setFormData({ ...formData, dislikes: e.target.value })} className="p-2 border border-[#32005c] rounded-lg" />
              </div>
              <input type="text" placeholder="Lema" value={formData.motto} onChange={(e) => setFormData({ ...formData, motto: e.target.value })} className="w-full p-2 border border-[#32005c] rounded-lg" />
              <textarea placeholder="Nota Rápida" rows={2} value={formData.shortNote} onChange={(e) => setFormData({ ...formData, shortNote: e.target.value })} className="w-full p-2 border border-[#32005c] rounded-lg" />
              <div className="flex justify-end gap-2 pt-2 border-t border-[#d8c2aa]">
                <button type="button" onClick={() => setIsModalOpen(false)} className="px-4 py-2 bg-stone-200 rounded-xl">Cancelar</button>
                <button type="submit" className="px-4 py-2 bg-[#32005c] text-white rounded-xl font-bold">Guardar</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Relacionamento */}
      {isRelModalOpen && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-[#f5f5f5] border-2 border-[#32005c] rounded-3xl p-6 w-full max-w-md space-y-4">
            <div className="flex justify-between items-center border-b border-[#d8c2aa] pb-2"><h3 className="font-bold text-lg">{editingRelId ? 'Editar Relacionamento' : 'Novo Relacionamento'}</h3><button onClick={() => setIsRelModalOpen(false)}><X size={18} /></button></div>
            <form onSubmit={handleSaveRel} className="space-y-3 text-xs">
              <select value={relFormData.character1Id} onChange={(e) => setRelFormData({ ...relFormData, character1Id: e.target.value })} className="w-full p-2 border border-[#32005c] rounded-lg">
                {currentChars.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
              <select value={relFormData.character2Id} onChange={(e) => setRelFormData({ ...relFormData, character2Id: e.target.value })} className="w-full p-2 border border-[#32005c] rounded-lg">
                {currentChars.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
              <input type="text" placeholder="Tipo de Ligação" required value={relFormData.type} onChange={(e) => setRelFormData({ ...relFormData, type: e.target.value })} className="w-full p-2 border border-[#32005c] rounded-lg" />
              <textarea placeholder="Descrição" rows={2} value={relFormData.description} onChange={(e) => setRelFormData({ ...relFormData, description: e.target.value })} className="w-full p-2 border border-[#32005c] rounded-lg" />
              <div className="flex justify-end gap-2 pt-2 border-t border-[#d8c2aa]">
                <button type="button" onClick={() => setIsRelModalOpen(false)} className="px-4 py-2 bg-stone-200 rounded-xl">Cancelar</button>
                <button type="submit" className="px-4 py-2 bg-[#32005c] text-white rounded-xl font-bold">Guardar</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}