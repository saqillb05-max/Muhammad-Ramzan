
import React, { useState } from 'react';
import { Truck, CreditCard, Box, User } from 'lucide-react';
import { Article, RecordType, PurchaseRecord } from './types';

interface ImportFormProps {
  articles: Article[];
  onSubmit: (record: PurchaseRecord) => void;
}

const ImportForm: React.FC<ImportFormProps> = ({ articles, onSubmit }) => {
  const [formData, setFormData] = useState({
    articleId: articles[0]?.id || '',
    quantity: 0,
    unitCost: 0,
    amountPaid: 0,
    supplier: '',
    date: new Date().toISOString().split('T')[0],
    notes: ''
  });

  const totalAmount = formData.quantity * formData.unitCost;
  const balanceDue = totalAmount - formData.amountPaid;

  // Added logic to automatically determine payment status for PurchaseRecord
  const getAutoStatus = (): 'Paid' | 'Partially Paid' | 'Due' => {
    if (totalAmount <= 0) return 'Due';
    if (formData.amountPaid >= totalAmount) return 'Paid';
    if (formData.amountPaid > 0) return 'Partially Paid';
    return 'Due';
  };

  const paymentStatus = getAutoStatus();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.quantity <= 0 || formData.unitCost <= 0 || !formData.supplier) {
      alert("Please enter valid quantity, unit cost, and supplier name.");
      return;
    }

    // Fixed: Added missing paymentStatus property to satisfy PurchaseRecord interface
    const record: PurchaseRecord = {
      id: Math.random().toString(36).substr(2, 9),
      type: RecordType.PURCHASE,
      date: formData.date,
      articleId: formData.articleId,
      quantity: formData.quantity,
      unitCost: formData.unitCost,
      totalAmount: totalAmount,
      amountPaid: formData.amountPaid,
      supplier: formData.supplier,
      notes: formData.notes,
      paymentStatus: paymentStatus
    };

    onSubmit(record);
    setFormData(prev => ({
      ...prev,
      quantity: 0,
      unitCost: 0,
      amountPaid: 0,
      supplier: '',
      notes: ''
    }));
  };

  return (
    <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm sticky top-8 animate-in fade-in duration-500">
      <div className="flex items-center gap-3 mb-8">
        <div className="bg-purple-600 p-2.5 rounded-xl text-white shadow-lg shadow-purple-200">
          <Box className="w-6 h-6" />
        </div>
        <div>
          <h3 className="text-xl font-extrabold text-slate-800">Import Finished Goods</h3>
          <p className="text-xs text-slate-400 font-bold uppercase tracking-widest">External Sourcing</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="space-y-1.5">
          <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-1"><User className="w-3 h-3" /> Supplier Name</label>
          <input type="text" required placeholder="Factory Name" value={formData.supplier} onChange={e => setFormData({ ...formData, supplier: e.target.value })} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 font-medium" />
        </div>

        <div className="space-y-1.5">
          <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Article to Import</label>
          <select value={formData.articleId} onChange={e => setFormData({ ...formData, articleId: e.target.value })} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 font-medium">
            {articles.map(a => <option key={a.id} value={a.id}>{a.name}</option>)}
          </select>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Number of Articles</label>
            <input type="number" min="0" required value={formData.quantity || ''} onChange={e => setFormData({ ...formData, quantity: parseFloat(e.target.value) || 0 })} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 font-medium" />
          </div>
          <div className="space-y-1.5">
            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Unit Price (Rs.)</label>
            <input type="number" min="0" required value={formData.unitCost || ''} onChange={e => setFormData({ ...formData, unitCost: parseFloat(e.target.value) || 0 })} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 font-medium" />
          </div>
        </div>

        <div className="space-y-1.5">
          <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-1.5"><CreditCard className="w-3 h-3" /> Amount Paid (Rs.)</label>
          <div className="relative">
            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 font-bold">Rs.</span>
            <input type="number" min="0" required value={formData.amountPaid || ''} onChange={e => setFormData({ ...formData, amountPaid: parseFloat(e.target.value) || 0 })} className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-12 pr-4 py-3 font-medium" />
          </div>
        </div>

        <div className="bg-slate-900 rounded-2xl p-5 space-y-3 text-white shadow-xl">
          <div className="flex items-center justify-between opacity-60">
            <span className="text-[10px] font-bold uppercase tracking-widest">Grand Total</span>
            <span className="text-xl font-bold">Rs. {totalAmount.toLocaleString()}</span>
          </div>
          <div className="flex items-center justify-between border-t border-white/10 pt-3">
            <span className="text-[10px] font-bold uppercase text-slate-400">Balance Due</span>
            <span className={`text-2xl font-black ${balanceDue > 0 ? 'text-purple-400' : 'text-green-400'}`}>Rs. {balanceDue.toLocaleString()}</span>
          </div>
        </div>

        <button type="submit" className="w-full bg-purple-600 hover:bg-purple-700 text-white rounded-2xl py-4 font-black shadow-lg transition-transform active:scale-95">LOG IMPORT RECORD</button>
      </form>
    </div>
  );
};

export default ImportForm;
