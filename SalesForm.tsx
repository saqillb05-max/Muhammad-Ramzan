
import React, { useState } from 'react';
import { ShoppingCart, CreditCard, Phone, User, CheckCircle2, AlertCircle, Clock, Info } from 'lucide-react';
import { Article, RecordType, SaleRecord } from './types';

interface SalesFormProps {
  articles: Article[];
  onSubmit: (record: SaleRecord) => void;
}

const SalesForm: React.FC<SalesFormProps> = ({ articles, onSubmit }) => {
  const [formData, setFormData] = useState({
    articleId: articles[0]?.id || '',
    customName: '',
    specification: '',
    quantity: 0,
    unitPrice: 0,
    amountPaid: 0,
    customer: '',
    phone: '',
    date: new Date().toISOString().split('T')[0],
    notes: ''
  });

  const totalAmount = Number((formData.quantity * formData.unitPrice).toFixed(2));
  const balanceDue = Number((totalAmount - formData.amountPaid).toFixed(2));
  const isOther = formData.articleId === 'other';

  const getAutoStatus = (): 'Paid' | 'Partially Paid' | 'Due' => {
    if (totalAmount <= 0) return 'Due';
    if (formData.amountPaid >= totalAmount) return 'Paid';
    if (formData.amountPaid > 0) return 'Partially Paid';
    return 'Due';
  };

  const paymentStatus = getAutoStatus();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (formData.quantity <= 0) {
      alert("Please enter a valid quantity.");
      return;
    }

    if (isOther && !formData.customName.trim()) {
      alert("Please specify the item name.");
      return;
    }

    if (!formData.customer.trim()) {
      alert("Please enter a customer name.");
      return;
    }

    const record: SaleRecord = {
      id: Math.random().toString(36).substr(2, 9),
      type: RecordType.SALE,
      date: formData.date,
      articleId: formData.articleId,
      customName: isOther ? formData.customName : undefined,
      specification: formData.specification,
      quantity: formData.quantity,
      unitPrice: formData.unitPrice,
      totalAmount,
      amountPaid: formData.amountPaid,
      customer: formData.customer,
      phone: formData.phone,
      notes: formData.notes,
      paymentStatus: paymentStatus
    };

    onSubmit(record);
    
    setFormData(prev => ({
      ...prev,
      customName: '',
      specification: '',
      quantity: 0,
      unitPrice: 0,
      amountPaid: 0,
      customer: '',
      phone: '',
      notes: ''
    }));
  };

  const getStatusIcon = () => {
    switch (paymentStatus) {
      case 'Paid': return <CheckCircle2 className="w-4 h-4 text-emerald-500" />;
      case 'Partially Paid': return <Clock className="w-4 h-4 text-amber-500" />;
      case 'Due': return <AlertCircle className="w-4 h-4 text-rose-500" />;
    }
  };

  const getStatusStyles = () => {
    switch (paymentStatus) {
      case 'Paid': return 'bg-emerald-50 border-emerald-200 text-emerald-700';
      case 'Partially Paid': return 'bg-amber-50 border-amber-200 text-amber-700';
      case 'Due': return 'bg-rose-50 border-rose-200 text-rose-700';
    }
  };

  return (
    <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm sticky top-8 animate-in fade-in">
      <div className="flex items-center gap-3 mb-8">
        <div className="bg-emerald-600 p-2.5 rounded-xl text-white shadow-lg shadow-emerald-200">
          <ShoppingCart className="w-6 h-6" />
        </div>
        <div>
          <h3 className="text-xl font-extrabold text-slate-800">New Sale Invoice</h3>
          <p className="text-xs text-slate-400 font-bold uppercase tracking-widest">Billing & Logistics</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="space-y-1.5">
          <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-1">
            <User className="w-3 h-3" /> Customer Details
          </label>
          <div className="grid grid-cols-1 gap-3">
            <input 
              type="text" 
              required 
              value={formData.customer} 
              onChange={e => setFormData({ ...formData, customer: e.target.value })} 
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 font-medium focus:ring-4 focus:ring-emerald-500/10 outline-none" 
              placeholder="Customer Full Name" 
            />
            <div className="relative">
              <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input 
                type="tel" 
                value={formData.phone} 
                onChange={e => setFormData({ ...formData, phone: e.target.value })} 
                className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-11 pr-4 py-3 font-medium outline-none focus:ring-4 focus:ring-emerald-500/10" 
                placeholder="Phone (Optional)" 
              />
            </div>
          </div>
        </div>

        <div className="space-y-1.5">
          <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Product & Quantity</label>
          <div className="space-y-3">
            <select 
              value={formData.articleId} 
              onChange={e => setFormData({ ...formData, articleId: e.target.value })} 
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 font-medium"
            >
              {articles.map(a => <option key={a.id} value={a.id}>{a.name} ({a.unit})</option>)}
            </select>

            {isOther && (
              <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl space-y-4 animate-in slide-in-from-top-2">
                <div className="space-y-1">
                   <label className="text-[9px] font-black text-slate-400 uppercase">Specific Item Name</label>
                   <input 
                     type="text" 
                     value={formData.customName} 
                     onChange={e => setFormData({ ...formData, customName: e.target.value })} 
                     className="w-full bg-white border border-slate-200 rounded-lg px-3 py-2 text-sm font-bold" 
                     placeholder="e.g. Special Finish Tiles..."
                   />
                </div>
                <div className="space-y-1">
                   <label className="text-[9px] font-black text-slate-400 uppercase">Specification / Details</label>
                   <div className="relative">
                     <Info className="absolute left-3 top-3 w-3.5 h-3.5 text-slate-300" />
                     <input 
                       type="text" 
                       value={formData.specification} 
                       onChange={e => setFormData({ ...formData, specification: e.target.value })} 
                       className="w-full bg-white border border-slate-200 rounded-lg pl-9 pr-3 py-2 text-sm" 
                       placeholder="e.g. Blue tint, Matte finish..."
                     />
                   </div>
                </div>
              </div>
            )}

            <div className="grid grid-cols-2 gap-4">
              <input 
                type="number" 
                required 
                min="1"
                value={formData.quantity || ''} 
                onChange={e => setFormData({ ...formData, quantity: parseFloat(e.target.value) || 0 })} 
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 font-medium focus:ring-4 focus:ring-emerald-500/10 outline-none" 
                placeholder="Qty" 
              />
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 font-bold text-xs">Rs.</span>
                <input 
                  type="number" 
                  required 
                  min="0"
                  step="0.01"
                  value={formData.unitPrice || ''} 
                  onChange={e => setFormData({ ...formData, unitPrice: parseFloat(e.target.value) || 0 })} 
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-10 pr-4 py-3 font-medium focus:ring-4 focus:ring-emerald-500/10 outline-none" 
                  placeholder="Price" 
                />
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-1.5">
              <CreditCard className="w-3 h-3" /> Amount Paid (Rs.)
            </label>
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 font-bold text-xs">Rs.</span>
              <input 
                type="number" 
                required 
                min="0"
                max={totalAmount}
                step="0.01"
                value={formData.amountPaid || ''} 
                onChange={e => setFormData({ ...formData, amountPaid: parseFloat(e.target.value) || 0 })} 
                className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-10 pr-4 py-3 font-black text-emerald-600 focus:ring-4 focus:ring-emerald-500/10 outline-none" 
              />
            </div>
          </div>
          <div className="space-y-1.5">
            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Payment Status</label>
            <div className={`flex items-center gap-2 w-full border rounded-xl px-4 py-3 font-bold text-sm transition-colors ${getStatusStyles()}`}>
              {getStatusIcon()}
              <span className="w-full">{paymentStatus}</span>
            </div>
          </div>
        </div>

        <div className="bg-slate-900 rounded-3xl p-6 text-white shadow-xl">
           <div className="flex justify-between items-center opacity-50 mb-2">
              <span className="text-[10px] font-bold uppercase tracking-widest">Total Bill</span>
              <span className="text-lg font-bold">Rs. {totalAmount.toLocaleString()}</span>
           </div>
           <div className="flex justify-between items-center border-t border-white/10 pt-3">
              <span className="text-xs font-bold text-slate-400">Balance Due</span>
              <span className={`text-3xl font-black ${balanceDue > 0 ? 'text-rose-400' : 'text-emerald-400'}`}>
                Rs. {balanceDue.toLocaleString()}
              </span>
           </div>
        </div>

        <button type="submit" className="w-full bg-emerald-600 hover:bg-emerald-700 text-white rounded-2xl py-4 font-black shadow-lg shadow-emerald-100 transition-all active:scale-95">
          SAVE INVOICE
        </button>
      </form>
    </div>
  );
};

export default SalesForm;
