import React, { useState } from 'react';
import { Plus, Hammer, HardHat } from 'lucide-react';
import { Article, RecordType, ManufacturingRecord, Worker } from './types';

interface ManufacturingFormProps {
  articles: Article[];
  workers: Worker[];
  onSubmit: (record: ManufacturingRecord) => void;
}

const ManufacturingForm: React.FC<ManufacturingFormProps> = ({ articles, workers, onSubmit }) => {
  const [formData, setFormData] = useState({
    articleId: articles[0]?.id || '',
    workerId: '',
    quantity: 0,
    unitCost: 0,
    date: new Date().toISOString().split('T')[0],
    notes: ''
  });

  const totalCost = formData.quantity * formData.unitCost;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validation: Quantity must be a positive integer
    if (formData.quantity <= 0 || !Number.isInteger(formData.quantity)) {
      alert("Please enter a valid positive whole number for production quantity.");
      return;
    }

    // Validation: Unit cost must be non-negative
    if (isNaN(formData.unitCost) || formData.unitCost < 0) {
      alert("Please enter a valid non-negative unit cost.");
      return;
    }

    if (!formData.workerId) {
      alert("Please select a worker.");
      return;
    }

    const record: ManufacturingRecord = {
      id: Math.random().toString(36).substr(2, 9),
      type: RecordType.MANUFACTURING,
      date: formData.date,
      articleId: formData.articleId,
      workerId: formData.workerId,
      quantity: formData.quantity,
      unitCost: formData.unitCost,
      totalCost: totalCost,
      notes: formData.notes
    };

    onSubmit(record);
    setFormData(prev => ({
      ...prev,
      quantity: 0,
      unitCost: 0,
      notes: ''
    }));
  };

  return (
    <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm sticky top-8 animate-in fade-in duration-500">
      <div className="flex items-center gap-3 mb-8">
        <div className="bg-blue-600 p-2.5 rounded-xl text-white shadow-lg shadow-blue-200">
          <Hammer className="w-6 h-6" />
        </div>
        <div>
          <h3 className="text-xl font-extrabold text-slate-800">Log Production</h3>
          <p className="text-xs text-slate-400 font-bold uppercase tracking-widest">Factory Floor Update</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="space-y-1.5">
          <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-1.5">
            <HardHat className="w-3 h-3" /> Prepared By (Worker)
          </label>
          <select
            value={formData.workerId}
            required
            onChange={e => setFormData({ ...formData, workerId: e.target.value })}
            className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 outline-none focus:ring-4 focus:ring-blue-500/10 transition-all font-medium"
          >
            <option value="">Select a Worker...</option>
            {workers.map(w => (
              <option key={w.id} value={w.id}>{w.name}</option>
            ))}
          </select>
        </div>

        <div className="space-y-1.5">
          <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Prepared Article</label>
          <select
            value={formData.articleId}
            onChange={e => setFormData({ ...formData, articleId: e.target.value })}
            className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 outline-none focus:ring-4 focus:ring-blue-500/10 transition-all font-medium"
          >
            {articles.map(a => (
              <option key={a.id} value={a.id}>{a.name}</option>
            ))}
          </select>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Quantity</label>
            <input
              type="number"
              min="1"
              step="1"
              required
              value={formData.quantity || ''}
              onChange={e => setFormData({ ...formData, quantity: parseFloat(e.target.value) || 0 })}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 font-medium focus:ring-4 focus:ring-blue-500/10 outline-none"
              placeholder="Qty (Integer)"
            />
          </div>
          <div className="space-y-1.5">
            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Date</label>
            <input
              type="date"
              required
              value={formData.date}
              onChange={e => setFormData({ ...formData, date: e.target.value })}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 font-medium"
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Cost / Unit (Rs.)</label>
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 font-bold">Rs.</span>
              <input
                type="number"
                min="0"
                step="0.01"
                value={formData.unitCost || ''}
                onChange={e => setFormData({ ...formData, unitCost: parseFloat(e.target.value) || 0 })}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-12 pr-4 py-3 outline-none focus:ring-4 focus:ring-blue-500/10 transition-all font-medium"
              />
            </div>
          </div>
          <div className="flex flex-col justify-end pb-2">
            <span className="text-[10px] text-slate-400 font-bold uppercase mb-1">Total Cost</span>
            <span className="text-xl font-black text-slate-900">Rs. {totalCost.toLocaleString()}</span>
          </div>
        </div>

        <button type="submit" className="w-full bg-blue-600 hover:bg-blue-700 text-white rounded-2xl py-4 font-black transition-all shadow-lg active:scale-95 flex items-center justify-center gap-2">
          <Plus className="w-5 h-5" /> RECORD PRODUCTION
        </button>
      </form>
    </div>
  );
};

export default ManufacturingForm;