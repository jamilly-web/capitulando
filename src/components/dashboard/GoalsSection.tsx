'use client';

import React, { useState } from 'react';
import { Target, Plus, Edit2, Trash2, CheckCircle2, Circle, X, Check } from 'lucide-react';
import { useIsolatedStorage } from '@/hooks/useIsolatedStorage';

interface Goal {
  id: string;
  title: string;
  current: number;
  target: number;
  unit: string;
  completed: boolean;
}

export function GoalsSection() {
  const [goals, setGoals] = useIsolatedStorage<Goal[]>('goals', []);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  const initialForm = { title: '', current: 0, target: 10, unit: 'capítulos' };
  const [formData, setFormData] = useState(initialForm);

  const handleOpenModal = (goal?: Goal) => {
    if (goal) {
      setEditingId(goal.id);
      setFormData({ title: goal.title, current: goal.current, target: goal.target, unit: goal.unit });
    } else {
      setEditingId(null);
      setFormData(initialForm);
    }
    setIsModalOpen(true);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    const current = Number(formData.current) || 0;
    const target = Number(formData.target) || 1;
    const completed = current >= target;

    const newGoal: Goal = {
      id: editingId || Date.now().toString(),
      title: formData.title || 'Nova Meta',
      current,
      target,
      unit: formData.unit || 'itens',
      completed,
    };

    setGoals((prev) => editingId ? prev.map((g) => (g.id === editingId ? newGoal : g)) : [...prev, newGoal]);
    setIsModalOpen(false);
  };

  const handleDelete = (id: string) => {
    if (confirm('Tem a certeza de que deseja eliminar esta meta?')) {
      setGoals((prev) => prev.filter((g) => g.id !== id));
    }
  };

  const handleToggle = (id: string) => {
    setGoals((prev) =>
      prev.map((g) => {
        if (g.id === id) {
          const completed = !g.completed;
          return { ...g, completed, current: completed ? g.target : g.current };
        }
        return g;
      })
    );
  };

  return (
    <div className="space-y-6 font-sans">
      <div className="bg-[#f3ccde]/60 p-5 rounded-2xl border-2 border-[#4b1d3f]/20 flex justify-between items-center shadow-sm">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-[#f3ccde] text-[#4b1d3f] rounded-xl border border-[#4b1d3f]/30">
            <Target size={28} />
          </div>
          <div>
            <h2 className="text-xl font-bold font-serif text-stone-900">Metas & Desafios</h2>
            <p className="text-xs text-stone-600">Acompanhe e conquiste os seus objetivos literários.</p>
          </div>
        </div>
        <button onClick={() => handleOpenModal()} className="bg-[#4b1d3f] hover:bg-[#38142f] text-white px-4 py-2.5 rounded-xl text-xs font-bold flex items-center gap-2 shadow-sm">
          <Plus size={16} /> Nova Meta
        </button>
      </div>

      <div className="space-y-4">
        {goals.map((goal) => {
          const pct = Math.min(Math.round((goal.current / (goal.target || 1)) * 100), 100);
          return (
            <div key={goal.id} className={`bg-white border-2 rounded-2xl p-5 shadow-sm space-y-3 ${goal.completed ? 'border-emerald-600/50 bg-emerald-50/20' : 'border-[#4b1d3f]/20'}`}>
              <div className="flex justify-between items-start gap-4">
                <div className="flex items-center gap-3">
                  <button onClick={() => handleToggle(goal.id)} className="text-[#4b1d3f] hover:scale-110 transition-transform">
                    {goal.completed ? <CheckCircle2 size={24} className="text-emerald-700 fill-emerald-100" /> : <Circle size={24} className="text-stone-400" />}
                  </button>
                  <div>
                    <h3 className={`text-sm font-bold font-serif ${goal.completed ? 'line-through text-stone-400' : 'text-stone-900'}`}>{goal.title}</h3>
                    <span className="text-[10px] text-stone-500 font-medium">Progresso: {goal.current} / {goal.target} {goal.unit} ({pct}%)</span>
                  </div>
                </div>
                <div className="flex items-center gap-1">
                  <button onClick={() => handleOpenModal(goal)} className="p-1.5 text-stone-500 hover:bg-[#f3ccde]/40 rounded-lg"><Edit2 size={15} /></button>
                  <button onClick={() => handleDelete(goal.id)} className="p-1.5 text-red-500 hover:bg-red-50 rounded-lg"><Trash2 size={15} /></button>
                </div>
              </div>
              <div className="w-full h-3 bg-stone-100 rounded-full overflow-hidden border border-stone-200">
                <div className={`h-full rounded-full transition-all duration-500 ${goal.completed ? 'bg-emerald-600' : 'bg-[#4b1d3f]'}`} style={{ width: `${pct}%` }} />
              </div>
            </div>
          );
        })}

        {goals.length === 0 && (
          <div className="text-center py-12 bg-[#f3ccde]/30 rounded-3xl border-2 border-dashed border-[#4b1d3f]/30 text-stone-500 space-y-2">
            <Target size={36} className="mx-auto text-stone-400" />
            <p className="text-sm font-semibold">Nenhuma meta registada.</p>
          </div>
        )}
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-[#f3ccde] border-2 border-[#4b1d3f]/30 rounded-3xl p-6 w-full max-w-md shadow-2xl space-y-4">
            <div className="flex justify-between items-center border-b border-[#4b1d3f]/20 pb-3">
              <h3 className="font-bold font-serif text-lg text-stone-900">{editingId ? 'Editar Meta' : 'Nova Meta / Desafio'}</h3>
              <button onClick={() => setIsModalOpen(false)} className="text-stone-600 hover:text-stone-900"><X size={18} /></button>
            </div>
            <form onSubmit={handleSave} className="space-y-3 text-xs">
              <div>
                <label className="block font-bold text-stone-700 mb-1">Título da Meta</label>
                <input type="text" required placeholder="Ex: Escrever o Primeiro Capítulo" value={formData.title} onChange={(e) => setFormData({ ...formData, title: e.target.value })} className="w-full p-2.5 bg-white border border-[#4b1d3f]/30 rounded-xl" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-stone-700 mb-1">Valor Atual</label>
                  <input type="number" min="0" value={formData.current} onChange={(e) => setFormData({ ...formData, current: Number(e.target.value) })} className="w-full p-2.5 bg-white border border-[#4b1d3f]/30 rounded-xl" />
                </div>
                <div>
                  <label className="block font-bold text-stone-700 mb-1">Valor Alvo</label>
                  <input type="number" min="1" required value={formData.target} onChange={(e) => setFormData({ ...formData, target: Number(e.target.value) })} className="w-full p-2.5 bg-white border border-[#4b1d3f]/30 rounded-xl" />
                </div>
              </div>
              <div>
                <label className="block font-bold text-stone-700 mb-1">Unidade</label>
                <input type="text" placeholder="Ex: capítulos, palavras" value={formData.unit} onChange={(e) => setFormData({ ...formData, unit: e.target.value })} className="w-full p-2.5 bg-white border border-[#4b1d3f]/30 rounded-xl" />
              </div>
              <div className="flex justify-end gap-2 pt-3 border-t border-[#4b1d3f]/20">
                <button type="button" onClick={() => setIsModalOpen(false)} className="px-4 py-2 bg-stone-200 rounded-xl font-semibold">Cancelar</button>
                <button type="submit" className="px-4 py-2 bg-[#4b1d3f] text-white rounded-xl font-bold flex items-center gap-1"><Check size={16} /> Salvar Meta</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}