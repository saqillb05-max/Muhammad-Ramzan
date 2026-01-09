
import React, { useState } from 'react';
import { Plus, Receipt, CreditCard } from 'lucide-react';
import { RecordType, ExpenseRecord } from './types';

interface ExpenseFormProps {
  onSubmit: (record: ExpenseRecord) => void;
}

const ExpenseForm: React.FC<ExpenseFormProps> = ({ onSubmit }) => {
  const [formData, setFormData] = useState({
    description: '',
    amount: 0,
    date: new Date().toISOString().split('T')[0],
    notes: ''
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.description || formData.amount <= 0) {
      alert("Please enter a valid description and amount.");
      return;
    }

    const record: ExpenseRecord = {
      id: Math.random().toString(36).substr(2, 9),
      type: RecordType.EXPENSE,
      date: formData.date,
      description: formData.description,
      amount: formData.amount,
      notes: formData.notes
    };

    onSubmit(record);
    setFormData(prev => ({
      ...prev,
      description: '',
      amount: 0,
      notes: ''
    }));
  };

  return (
    <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm sticky top-8 animate-in fade-in duration-500">
      <div className="flex items-center gap-3 mb-8">
        <div className="bg-rose-600 p-2.5 rounded-xl text-white shadow-lg shadow-rose-200">
          <Receipt className="w-6 h-6" />
        </div>
        <div>
          <h3 className="text-xl font-extrabold text-slate-800">Log Expense</h3>
          <p className="text-xs text-slate-400 font-bold uppercase tracking-widest">General Spending</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="space-y-1.5">
          <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Expense Details</label>
          <input type="text" required placeholder="Electricity bill, labor..." value={formData.description} onChange={e => setFormData({ ...formData, description: e.target.value })} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 font-medium" />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-1.5"><CreditCard className="w-3 h-3" /> Amount (Rs.)</label>
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 font-bold">Rs.</span>
              <input type="number" min="0.01" step="any" required value={formData.amount || ''} onChange={e => setFormData({ ...formData, amount: parseFloat(e.target.value) || 0 })} className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-12 pr-4 py-3 font-medium" />
            </div>
          </div>
          <div className="space-y-1.5">
            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Date</label>
            <input type="date" required value={formData.date} onChange={e => setFormData({ ...formData, date: e.target.value })} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 font-medium" />
          </div>
        </div>

        <button type="submit" className="w-full bg-rose-600 hover:bg-rose-700 text-white rounded-2xl py-4 font-black transition-all shadow-lg flex items-center justify-center gap-2">
          <Plus className="w-5 h-5" /> RECORD EXPENSE
        </button>
      </form>
    </div>
  );
};

export default ExpenseForm;
