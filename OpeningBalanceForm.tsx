
import React, { useState } from 'react';
import { Database, Package, UserCheck, Truck, Plus } from 'lucide-react';
import { Article, RecordType, FactoryRecord } from './types';

interface OpeningBalanceFormProps {
  articles: Article[];
  onSubmit: (record: FactoryRecord) => void;
}

const OpeningBalanceForm: React.FC<OpeningBalanceFormProps> = ({ articles, onSubmit }) => {
  const [activeSubTab, setActiveSubTab] = useState<'stock' | 'customer' | 'supplier'>('stock');
  
  const [stockData, setStockData] = useState({
    articleId: articles[0]?.id || '',
    quantity: 0,
    date: new Date().toISOString().split('T')[0],
  });

  const [balanceData, setBalanceData] = useState({
    name: '',
    amount: 0,
    date: new Date().toISOString().split('T')[0],
    notes: ''
  });

  const handleStockSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (stockData.quantity <= 0) return alert("Enter valid quantity");
    
    onSubmit({
      id: `init-stock-${Math.random().toString(36).substr(2, 9)}`,
      type: RecordType.INITIAL_STOCK,
      articleId: stockData.articleId,
      quantity: stockData.quantity,
      date: stockData.date,
      notes: 'Initial opening stock'
    });
    setStockData(prev => ({ ...prev, quantity: 0 }));
  };

  const handleBalanceSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (balanceData.amount <= 0 || !balanceData.name) return alert("Enter valid name and amount");
    
    onSubmit({
      id: `init-bal-${Math.random().toString(36).substr(2, 9)}`,
      type: RecordType.INITIAL_BALANCE,
      date: balanceData.date,
      name: balanceData.name,
      amount: balanceData.amount,
      balanceType: activeSubTab === 'customer' ? 'customer' : 'supplier',
      notes: balanceData.notes || `Opening balance for ${activeSubTab}`
    });
    setBalanceData({ name: '', amount: 0, date: new Date().toISOString().split('T')[0], notes: '' });
  };

  return (
    <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm sticky top-8 animate-in fade-in">
      <div className="flex items-center gap-3 mb-8">
        <div className="bg-slate-800 p-2.5 rounded-xl text-white shadow-lg">
          <Database className="w-6 h-6" />
        </div>
        <div>
          <h3 className="text-xl font-extrabold text-slate-800">Opening Balances</h3>
          <p className="text-xs text-slate-400 font-bold uppercase tracking-widest">Initial System Setup</p>
        </div>
      </div>

      <div className="flex p-1 bg-slate-100 rounded-2xl mb-8">
        <button 
          onClick={() => setActiveSubTab('stock')}
          className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-xs font-black transition-all ${activeSubTab === 'stock' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
        >
          <Package className="w-3.5 h-3.5" /> STOCK
        </button>
        <button 
          onClick={() => setActiveSubTab('customer')}
          className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-xs font-black transition-all ${activeSubTab === 'customer' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
        >
          <UserCheck className="w-3.5 h-3.5" /> CUSTOMER
        </button>
        <button 
          onClick={() => setActiveSubTab('supplier')}
          className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-xs font-black transition-all ${activeSubTab === 'supplier' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
        >
          <Truck className="w-3.5 h-3.5" /> SUPPLIER
        </button>
      </div>

      {activeSubTab === 'stock' ? (
        <form onSubmit={handleStockSubmit} className="space-y-6">
          <div className="space-y-1.5">
            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Select Article</label>
            <select 
              value={stockData.articleId} 
              onChange={e => setStockData({ ...stockData, articleId: e.target.value })}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 font-medium outline-none"
            >
              {articles.map(a => <option key={a.id} value={a.id}>{a.name}</option>)}
            </select>
          </div>
          <div className="space-y-1.5">
            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Existing Quantity</label>
            <input 
              type="number" 
              required 
              value={stockData.quantity || ''} 
              onChange={e => setStockData({ ...stockData, quantity: parseFloat(e.target.value) || 0 })}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 font-medium outline-none focus:ring-4 focus:ring-slate-900/5" 
              placeholder="e.g. 500" 
            />
          </div>
          <button type="submit" className="w-full bg-slate-900 text-white rounded-2xl py-4 font-black flex items-center justify-center gap-2 shadow-lg active:scale-95 transition-all">
            <Plus className="w-5 h-5" /> INITIALIZE STOCK
          </button>
        </form>
      ) : (
        <form onSubmit={handleBalanceSubmit} className="space-y-6">
          <div className="space-y-1.5">
            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{activeSubTab === 'customer' ? 'Customer' : 'Supplier'} Name</label>
            <input 
              type="text" 
              required 
              value={balanceData.name} 
              onChange={e => setBalanceData({ ...balanceData, name: e.target.value })}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 font-medium outline-none" 
              placeholder={`Enter ${activeSubTab} name`} 
            />
          </div>
          <div className="space-y-1.5">
            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Existing Amount Due (Rs.)</label>
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 font-bold text-xs">Rs.</span>
              <input 
                type="number" 
                required 
                value={balanceData.amount || ''} 
                onChange={e => setBalanceData({ ...balanceData, amount: parseFloat(e.target.value) || 0 })}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-10 pr-4 py-3 font-black text-rose-600 outline-none" 
              />
            </div>
          </div>
          <button type="submit" className="w-full bg-slate-900 text-white rounded-2xl py-4 font-black flex items-center justify-center gap-2 shadow-lg active:scale-95 transition-all">
            <Plus className="w-5 h-5" /> INITIALIZE BALANCE
          </button>
        </form>
      )}
      
      <div className="mt-8 p-4 bg-amber-50 rounded-2xl border border-amber-100">
        <p className="text-[10px] text-amber-700 font-medium leading-relaxed">
          <strong>Note:</strong> Opening balances should only be entered once during initial app setup to match your manual registers.
        </p>
      </div>
    </div>
  );
};

export default OpeningBalanceForm;
