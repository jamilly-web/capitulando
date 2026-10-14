'use client';

import React, { useState } from 'react';
import { Calendar, Plus, Edit2, Trash2, X, Check, User, BookOpen, Clock } from 'lucide-react';
import { useIsolatedStorage } from '@/hooks/useIsolatedStorage';

interface TimelineEvent {
  id: string; projectId: string; yearOrDate: string; title: string; characters: string; description: string;
}

interface ProjectMinimal { id: string; title: string; }

const DEFAULT_PROJECTS: ProjectMinimal[] = [
  { id: '1', title: 'O Guardião da Floresta' },
  { id: '2', title: 'Segredos de Algures' },
];

export function TimelineSection() {
  const [projects] = useIsolatedStorage<ProjectMinimal[]>('projects', DEFAULT_PROJECTS);
  const [events, setEvents] = useIsolatedStorage<TimelineEvent[]>('timeline_events', []);
  const [selectedProjectId, setSelectedProjectId] = useState(() => projects[0]?.id || '1');

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingEventId, setEditingEventId] = useState<string | null>(null);

  const initialForm = { yearOrDate: 'Ano 1050', title: '', characters: '', description: '' };
  const [formData, setFormData] = useState(initialForm);

  const projectEvents = events.filter((e) => (e.projectId || '1') === selectedProjectId);
  const selectedProject = projects.find((p) => p.id === selectedProjectId);

  const handleOpenModal = (event?: TimelineEvent) => {
    if (event) {
      setEditingEventId(event.id);
      setFormData({ yearOrDate: event.yearOrDate, title: event.title, characters: event.characters, description: event.description });
    } else {
      setEditingEventId(null);
      setFormData(initialForm);
    }
    setIsModalOpen(true);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    const newEvent: TimelineEvent = {
      id: editingEventId || Date.now().toString(),
      projectId: selectedProjectId,
      yearOrDate: formData.yearOrDate || 'Sem data',
      title: formData.title || 'Evento sem título',
      characters: formData.characters || 'Geral',
      description: formData.description || '',
    };
    setEvents((prev) => editingEventId ? prev.map((item) => (item.id === editingEventId ? newEvent : item)) : [newEvent, ...prev]);
    setIsModalOpen(false);
  };

  return (
    <div className="space-y-6 font-sans">
      <div className="bg-[#f7eee3] p-5 rounded-2xl border-2 border-[#d8c2aa] flex flex-col md:flex-row justify-between items-center gap-4 shadow-md">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-[#ebd9c6] text-[#385338] rounded-xl border border-[#d8c2aa]"><Calendar size={28} /></div>
          <div>
            <h2 className="text-xl font-bold font-serif text-stone-900">Linha do Tempo & Idades</h2>
            <p className="text-xs text-stone-600">Organize os eventos cronológicos por projeto.</p>
          </div>
        </div>

        <div className="flex items-center gap-3 w-full md:w-auto">
          <div className="flex items-center gap-2 bg-white px-3 py-2 rounded-xl border border-[#d8c2aa] shadow-sm flex-1 md:flex-none">
            <BookOpen size={16} className="text-[#385338]" />
            <select value={selectedProjectId} onChange={(e) => setSelectedProjectId(e.target.value)} className="bg-transparent text-xs font-bold text-stone-800 focus:outline-none cursor-pointer">
              {projects.map((p) => <option key={p.id} value={p.id}>{p.title}</option>)}
            </select>
          </div>
          <button onClick={() => handleOpenModal()} className="bg-[#385338] hover:bg-[#2c422c] text-white px-4 py-2.5 rounded-xl text-xs font-bold flex items-center gap-2 shadow-sm shrink-0">
            <Plus size={16} /> Novo Evento
          </button>
        </div>
      </div>

      <div className="relative pl-6 space-y-6 before:absolute before:left-2.5 before:top-3 before:bottom-3 before:w-1 before:bg-[#385338]/40">
        {projectEvents.map((event) => (
          <div key={event.id} className="relative group">
            <div className="absolute -left-[19px] top-6 w-4 h-4 rounded-full bg-[#385338] border-2 border-white shadow-sm group-hover:scale-125 transition-transform" />
            <div className="bg-[#f7eee3] border-2 border-[#d8c2aa] rounded-2xl p-5 shadow-sm space-y-2">
              <div className="flex justify-between items-start gap-4">
                <div>
                  <span className="text-xs font-bold text-[#385338] block mb-1">{event.yearOrDate}</span>
                  <h3 className="text-lg font-bold font-serif text-stone-900">{event.title}</h3>
                </div>
                <div className="flex items-center gap-1">
                  <button onClick={() => handleOpenModal(event)} className="p-1.5 text-stone-600 hover:bg-[#ebd9c6] rounded-lg"><Edit2 size={15} /></button>
                  <button onClick={() => confirm('Excluir evento?') && setEvents((prev) => prev.filter((i) => i.id !== event.id))} className="p-1.5 text-red-600 hover:bg-red-100 rounded-lg"><Trash2 size={15} /></button>
                </div>
              </div>

              {event.characters && (
                <div className="flex items-center gap-1.5 text-xs text-stone-600">
                  <User size={14} className="text-[#385338]" />
                  <span><strong>Personagens:</strong> {event.characters}</span>
                </div>
              )}

              <p className="text-xs text-stone-700 leading-relaxed pt-1 border-t border-[#d8c2aa]/40">{event.description}</p>
            </div>
          </div>
        ))}

        {projectEvents.length === 0 && (
          <div className="bg-[#f7eee3] border-2 border-dashed border-[#d8c2aa] rounded-2xl p-10 text-center text-stone-500 space-y-2">
            <Clock size={36} className="mx-auto text-stone-400" />
            <p className="text-sm font-semibold">Nenhum evento registrado para "{selectedProject?.title}".</p>
          </div>
        )}
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-[#f7eee3] border-2 border-[#d8c2aa] rounded-3xl p-6 w-full max-w-lg shadow-2xl space-y-4">
            <div className="flex justify-between items-center border-b border-[#d8c2aa] pb-3">
              <h3 className="font-bold font-serif text-lg text-stone-900">{editingEventId ? 'Editar Evento' : 'Novo Evento'}</h3>
              <button onClick={() => setIsModalOpen(false)} className="text-stone-500"><X size={18} /></button>
            </div>

            <form onSubmit={handleSave} className="space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-stone-700 mb-1">Ano / Data / Época</label>
                  <input type="text" required value={formData.yearOrDate} onChange={(e) => setFormData({ ...formData, yearOrDate: e.target.value })} className="w-full p-2.5 bg-white border border-[#d8c2aa] rounded-xl" />
                </div>
                <div>
                  <label className="block font-bold text-stone-700 mb-1">Título do Evento</label>
                  <input type="text" required value={formData.title} onChange={(e) => setFormData({ ...formData, title: e.target.value })} className="w-full p-2.5 bg-white border border-[#d8c2aa] rounded-xl" />
                </div>
              </div>

              <div>
                <label className="block font-bold text-stone-700 mb-1">Personagens Envolvidos</label>
                <input type="text" value={formData.characters} onChange={(e) => setFormData({ ...formData, characters: e.target.value })} className="w-full p-2.5 bg-white border border-[#d8c2aa] rounded-xl" />
              </div>

              <div>
                <label className="block font-bold text-stone-700 mb-1">Descrição</label>
                <textarea rows={4} required value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })} className="w-full p-2.5 bg-white border border-[#d8c2aa] rounded-xl" />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-[#d8c2aa]">
                <button type="button" onClick={() => setIsModalOpen(false)} className="px-4 py-2 bg-stone-200 rounded-xl font-semibold">Cancelar</button>
                <button type="submit" className="px-4 py-2 bg-[#385338] text-white rounded-xl font-bold flex items-center gap-1"><Check size={16} /> Salvar Evento</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}