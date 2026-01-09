
import React, { useState, useEffect, useMemo } from 'react';
import * as XLSX from 'xlsx';
import { 
  LayoutDashboard, Hammer, ShoppingCart, TrendingUp, Package, BrainCircuit,
  Menu, X, ArrowUpRight, ArrowDownRight, ClipboardList, DollarSign, Calendar,
  Filter, BarChart3, Wallet, BookOpen, Phone, ArrowRightLeft, ChevronDown,
  ChevronUp, UserCheck, Truck, CheckCircle2, ClipboardCheck, HardHat, Plus,
  Database, CloudUpload, Download, Loader2, Layers, Box, Check, Info, Settings2,
  DownloadCloud, Users, Trash2, History, Smartphone, Monitor, Apple, AlertTriangle
} from 'lucide-react';

import { 
  RecordType, FactoryRecord, Article, ManufacturingRecord, SaleRecord, 
  PurchaseRecord, Worker, WorkerPayment, AttendanceRecord, WorkerPaymentRecord
} from './types';
import { INITIAL_ARTICLES } from './constants';
import { getFactoryInsights } from './services/geminiService';
import SalesForm from './SalesForm';
import PurchaseForm from './PurchaseForm';
import ManufacturingForm from './ManufacturingForm';
import ExpenseForm from './ExpenseForm';
import OpeningBalanceForm from './OpeningBalanceForm';

const STORAGE_KEY = 'concrete_factory_records_v4';
const WORKERS_KEY = 'concrete_factory_workers_v1';

type AppTab = 'dashboard' | 'manufacturing' | 'sales' | 'purchases' | 'inventory' | 'production-report' | 'expenses' | 'ai' | 'ledger-customers' | 'ledger-suppliers' | 'ledger-unified' | 'backup' | 'opening-balances' | 'workers';

const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<AppTab>('dashboard');
  const [records, setRecords] = useState<FactoryRecord[]>([]);
  const [workers, setWorkers] = useState<Worker[]>([]);
  const [articles] = useState<Article[]>(INITIAL_ARTICLES);
  const [aiInsights, setAiInsights] = useState<string>('');
  const [isAiLoading, setIsAiLoading] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isLedgerExpanded, setIsLedgerExpanded] = useState(true);
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [isInstallable, setIsInstallable] = useState(false);
  const [showInstallGuide, setShowInstallGuide] = useState(false);
  const [isLocalFile, setIsLocalFile] = useState(false);
  
  const [lastSync] = useState<string | null>(localStorage.getItem('last_sync_time'));

  useEffect(() => {
    // Check if running via file:// protocol which prevents PWA installation
    if (window.location.protocol === 'file:') {
      setIsLocalFile(true);
    }

    const savedRecords = localStorage.getItem(STORAGE_KEY);
    const savedWorkers = localStorage.getItem(WORKERS_KEY);
    if (savedRecords) setRecords(JSON.parse(savedRecords));
    if (savedWorkers) setWorkers(JSON.parse(savedWorkers));

    const handleBeforeInstallPrompt = (e: any) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setIsInstallable(true);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    return () => window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
  }, []);

  const handleInstallClick = async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      if (outcome === 'accepted') {
        setIsInstallable(false);
        setDeferredPrompt(null);
      }
    } else {
      setShowInstallGuide(true);
    }
  };

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(records));
  }, [records]);

  useEffect(() => {
    localStorage.setItem(WORKERS_KEY, JSON.stringify(workers));
  }, [workers]);

  const addRecord = (record: FactoryRecord) => setRecords(prev => [record, ...prev]);
  const deleteRecord = (id: string) => {
    if (confirm("Are you sure you want to delete this record?")) {
      setRecords(prev => prev.filter(r => r.id !== id));
    }
  };

  const addWorker = (worker: Worker) => setWorkers(prev => [...prev, worker]);
  const deleteWorker = (id: string) => {
    if (confirm("Deleting a worker will keep their existing production records. Continue?")) {
      setRecords(prev => prev.filter(w => w.id !== id));
    }
  };
  
  const updatePayment = (recordId: string, additionalAmount: number) => {
    setRecords(prev => prev.map(r => {
      if (r.id === recordId && (r.type === RecordType.SALE || r.type === RecordType.PURCHASE)) {
        const newPaid = (r.amountPaid || 0) + additionalAmount;
        const total = r.type === RecordType.SALE ? (r as SaleRecord).totalAmount : (r as PurchaseRecord).totalAmount;
        let newStatus: 'Paid' | 'Partially Paid' | 'Due' = 'Due';
        if (newPaid >= total) newStatus = 'Paid';
        else if (newPaid > 0) newStatus = 'Partially Paid';
        return { ...r, amountPaid: newPaid, paymentStatus: newStatus };
      }
      return r;
    }));
  };

  const handleGenerateAI = async () => {
    setIsAiLoading(true);
    try {
      const insights = await getFactoryInsights(records, articles);
      setAiInsights(insights);
      setActiveTab('ai');
    } catch (error) {
      setAiInsights("AI analysis failed.");
    } finally {
      setIsAiLoading(false);
    }
  };

  const handleExportExcel = () => {
    try {
      const wb = XLSX.utils.book_new();
      const sData = records.filter(r => r.type === RecordType.SALE).map((r: any) => ({
        Date: r.date, Customer: r.customer, Article: articles.find(a => a.id === r.articleId)?.name,
        Qty: r.quantity, Total: r.totalAmount, Paid: r.amountPaid, Status: r.paymentStatus, Phone: r.phone || ''
      }));
      if (sData.length === 0) {
        alert("No sales records found to export.");
        return;
      }
      const ws = XLSX.utils.json_to_sheet(sData);
      XLSX.utils.book_append_sheet(wb, ws, 'Sales');
      XLSX.writeFile(wb, `Zaviar_Factory_Backup_${new Date().toISOString().split('T')[0]}.xlsx`);
    } catch (err) {
      console.error(err);
      alert("Failed to export data.");
    }
  };

  const stats = useMemo(() => {
    const today = new Date().toISOString().split('T')[0];
    const todayRecords = records.filter(r => r.date === today);
    return {
      manufacturingCount: todayRecords.filter(r => r.type === RecordType.MANUFACTURING).reduce((acc, r) => acc + (r as any).quantity, 0),
      salesRevenue: todayRecords.filter(r => r.type === RecordType.SALE).reduce((acc, r) => acc + (r as SaleRecord).totalAmount, 0),
      totalExpenses: todayRecords.filter(r => r.type !== RecordType.SALE).reduce((acc, r) => acc + ((r as any).totalAmount || (r as any).totalCost || (r as any).amount || 0), 0),
      transactionCount: todayRecords.length
    };
  }, [records]);

  return (
    <div className="flex flex-col md:flex-row min-h-screen bg-slate-50 text-slate-900 font-sans">
      {/* Installation Guide Modal */}
      {showInstallGuide && (
        <div className="fixed inset-0 z-[100] bg-slate-900/80 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-300">
          <div className="bg-white w-full max-w-lg rounded-[2.5rem] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300">
            <div className="p-8 bg-blue-600 text-white flex justify-between items-center">
              <div className="flex items-center gap-3">
                <Smartphone className="w-8 h-8" />
                <h3 className="text-2xl font-black">Installation Guide</h3>
              </div>
              <button onClick={() => setShowInstallGuide(false)} className="bg-white/20 p-2 rounded-full hover:bg-white/30 transition-colors">
                <X className="w-6 h-6" />
              </button>
            </div>
            <div className="p-8 space-y-8">
              <div className="flex gap-4">
                <div className="bg-blue-50 p-3 rounded-2xl h-fit shrink-0"><Smartphone className="w-6 h-6 text-blue-600" /></div>
                <div>
                  <h4 className="font-black text-slate-900 uppercase text-xs tracking-widest mb-1">For Android Users</h4>
                  <p className="text-slate-500 text-sm leading-relaxed">Tap the three dots in your browser menu and select <strong>"Install app"</strong> or <strong>"Add to Home Screen"</strong>.</p>
                </div>
              </div>
              <div className="flex gap-4">
                <div className="bg-rose-50 p-3 rounded-2xl h-fit shrink-0"><Apple className="w-6 h-6 text-rose-600" /></div>
                <div>
                  <h4 className="font-black text-slate-900 uppercase text-xs tracking-widest mb-1">For iPhone Users</h4>
                  <p className="text-slate-500 text-sm leading-relaxed">Tap the <strong>Share</strong> icon (box with upward arrow) at the bottom, then scroll and select <strong>"Add to Home Screen"</strong>.</p>
                </div>
              </div>
              <div className="flex gap-4">
                <div className="bg-slate-100 p-3 rounded-2xl h-fit shrink-0"><Monitor className="w-6 h-6 text-slate-600" /></div>
                <div>
                  <h4 className="font-black text-slate-900 uppercase text-xs tracking-widest mb-1">For Computer</h4>
                  <p className="text-slate-500 text-sm leading-relaxed">Click the <strong>Install</strong> icon in the right side of your address bar (next to the star icon).</p>
                </div>
              </div>
              <button onClick={() => setShowInstallGuide(false)} className="w-full bg-slate-900 text-white py-4 rounded-2xl font-black shadow-lg">GOT IT</button>
            </div>
          </div>
        </div>
      )}

      {/* Mobile Header */}
      <div className="md:hidden flex items-center justify-between p-4 bg-slate-900 text-white shadow-lg sticky top-0 z-50">
        <h1 className="text-xl font-bold flex items-center gap-2"><Hammer className="w-6 h-6 text-blue-400" /> Zaviar</h1>
        <div className="flex items-center gap-4">
          <button onClick={handleInstallClick} className="bg-blue-600 p-2 rounded-lg text-white">
            <DownloadCloud className="w-5 h-5" />
          </button>
          <button onClick={() => setIsSidebarOpen(!isSidebarOpen)}>{isSidebarOpen ? <X /> : <Menu />}</button>
        </div>
      </div>

      {/* Desktop Sidebar */}
      <aside className={`fixed md:static inset-0 z-40 bg-slate-900 text-slate-300 w-64 p-6 flex flex-col gap-6 transition-transform duration-300 transform ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'} md:translate-x-0 overflow-y-auto`}>
        <div className="hidden md:flex items-center gap-3 mb-2">
          <div className="bg-blue-600 p-2 rounded-lg"><Hammer className="w-6 h-6 text-white" /></div>
          <h1 className="text-lg font-bold text-white tracking-tight">Zaviar Building Material</h1>
        </div>
        
        <nav className="flex flex-col gap-1">
          <NavItem icon={<LayoutDashboard />} label="Dashboard" active={activeTab === 'dashboard'} onClick={() => {setActiveTab('dashboard'); setIsSidebarOpen(false);}} />
          <NavItem icon={<Package />} label="Inventory" active={activeTab === 'inventory'} onClick={() => {setActiveTab('inventory'); setIsSidebarOpen(false);}} />
          <NavItem icon={<ClipboardCheck />} label="Production Report" active={activeTab === 'production-report'} onClick={() => {setActiveTab('production-report'); setIsSidebarOpen(false);}} />
          <NavItem icon={<Users />} label="Workers & Payroll" active={activeTab === 'workers'} onClick={() => {setActiveTab('workers'); setIsSidebarOpen(false);}} />
          
          <div className="mt-4">
            <button onClick={() => setIsLedgerExpanded(!isLedgerExpanded)} className={`w-full flex items-center justify-between px-4 py-3 rounded-xl transition-all font-bold text-sm ${activeTab.startsWith('ledger-') ? 'text-white' : 'text-slate-500'}`}>
              <div className="flex items-center gap-3"><BookOpen className="w-5 h-5" /> <span>Ledgers</span></div>
              {isLedgerExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            </button>
            {isLedgerExpanded && (
              <div className="ml-6 mt-1 flex flex-col gap-1 border-l border-slate-800 pl-4">
                <NavItem label="Customers" active={activeTab === 'ledger-customers'} onClick={() => {setActiveTab('ledger-customers'); setIsSidebarOpen(false);}} icon={<UserCheck className="w-4 h-4" />} size="sm" />
                <NavItem label="Suppliers" active={activeTab === 'ledger-suppliers'} onClick={() => {setActiveTab('ledger-suppliers'); setIsSidebarOpen(false);}} icon={<Truck className="w-4 h-4" />} size="sm" />
                <NavItem label="Full Log" active={activeTab === 'ledger-unified'} onClick={() => {setActiveTab('ledger-unified'); setIsSidebarOpen(false);}} icon={<ArrowRightLeft className="w-4 h-4" />} size="sm" />
              </div>
            )}
          </div>

          <div className="h-px bg-slate-800 my-4 mx-2"></div>
          <NavItem icon={<Hammer />} label="Production Log" active={activeTab === 'manufacturing'} onClick={() => {setActiveTab('manufacturing'); setIsSidebarOpen(false);}} />
          <NavItem icon={<ShoppingCart />} label="Sales" active={activeTab === 'sales'} onClick={() => {setActiveTab('sales'); setIsSidebarOpen(false);}} />
          <NavItem icon={<TrendingUp />} label="Purchases" active={activeTab === 'purchases'} onClick={() => {setActiveTab('purchases'); setIsSidebarOpen(false);}} />
          <NavItem icon={<Wallet />} label="Expenses" active={activeTab === 'expenses'} onClick={() => {setActiveTab('expenses'); setIsSidebarOpen(false);}} />
          <div className="h-px bg-slate-800 my-4 mx-2"></div>
          <NavItem icon={<Settings2 />} label="Opening Balances" active={activeTab === 'opening-balances'} onClick={() => {setActiveTab('opening-balances'); setIsSidebarOpen(false);}} />
          <NavItem icon={<CloudUpload />} label="Backup" active={activeTab === 'backup'} onClick={() => {setActiveTab('backup'); setIsSidebarOpen(false);}} />
        </nav>

        <div className="mt-auto space-y-3">
          <button onClick={handleInstallClick} className="w-full flex items-center justify-center gap-2 py-3 bg-white/10 hover:bg-white/20 text-white rounded-xl font-medium shadow-sm transition-all border border-white/10">
            <DownloadCloud className="w-5 h-5" /> {isInstallable ? 'Install App' : 'App Guide'}
          </button>
          <button onClick={handleGenerateAI} disabled={isAiLoading} className="w-full flex items-center justify-center gap-2 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl font-medium disabled:opacity-50 shadow-lg transition-transform active:scale-95">
            <BrainCircuit className={isAiLoading ? 'animate-pulse' : 'w-5 h-5'} /> {isAiLoading ? 'Analyzing...' : 'AI Insights'}
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-4 md:p-10 overflow-y-auto w-full max-w-7xl mx-auto">
        <header className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-10 gap-4">
          <div><h2 className="text-3xl font-extrabold text-slate-900 tracking-tight capitalize">{activeTab.replace('-', ' ')}</h2><p className="text-slate-500 font-medium font-bold uppercase tracking-widest text-[10px]">Management Panel</p></div>
          {lastSync && <div className="bg-emerald-50 text-emerald-700 px-4 py-2 rounded-2xl text-xs font-bold flex items-center gap-2"><CheckCircle2 className="w-4 h-4" /> Cloud Synced</div>}
        </header>

        {activeTab === 'dashboard' && (
          <div className="space-y-10">
            {/* Environment Warning */}
            {isLocalFile && (
              <div className="bg-amber-50 border-2 border-amber-200 p-6 rounded-[2rem] flex items-center gap-6 animate-in slide-in-from-top-4">
                <div className="bg-amber-100 p-4 rounded-3xl text-amber-600 shrink-0">
                  <AlertTriangle className="w-8 h-8" />
                </div>
                <div>
                  <h3 className="text-lg font-black text-amber-900">App is running as a local file</h3>
                  <p className="text-amber-700 text-sm">To <strong>Install</strong> this app, you must upload it to a host like <strong>Netlify Drop</strong> or run it via a local server (like Live Server in VS Code).</p>
                </div>
              </div>
            )}

            {/* PWA Install Promotion Card */}
            {isInstallable && (
              <div className="bg-gradient-to-r from-blue-600 to-indigo-700 p-8 rounded-[2.5rem] shadow-2xl text-white flex flex-col md:flex-row items-center justify-between gap-6 animate-in zoom-in-95 duration-500">
                <div className="flex items-center gap-6">
                  <div className="bg-white/20 p-4 rounded-3xl backdrop-blur-md">
                    <Smartphone className="w-10 h-10" />
                  </div>
                  <div>
                    <h3 className="text-2xl font-black">Install Zaviar App</h3>
                    <p className="text-blue-100 font-medium opacity-90">Ready for factory use. Add to your home screen for fast offline access.</p>
                  </div>
                </div>
                <button 
                  onClick={handleInstallClick}
                  className="bg-white text-blue-700 px-10 py-4 rounded-2xl font-black shadow-xl hover:scale-105 transition-transform active:scale-95 whitespace-nowrap"
                >
                  INSTALL NOW
                </button>
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 animate-in fade-in">
              <StatCard label="Today Production" value={stats.manufacturingCount.toLocaleString()} subValue="Pieces" icon={<Hammer />} color="blue" />
              <StatCard label="Today Revenue" value={`Rs. ${stats.salesRevenue.toLocaleString()}`} subValue="Gross Sales" icon={<DollarSign />} color="emerald" />
              <StatCard label="Today Expense" value={`Rs. ${stats.totalExpenses.toLocaleString()}`} subValue="Spendings" icon={<Wallet />} color="rose" />
              <StatCard label="Daily Records" value={stats.transactionCount.toString()} subValue="Logs Saved" icon={<ClipboardList />} color="indigo" />
            </div>
          </div>
        )}

        {activeTab === 'workers' && <WorkersView workers={workers} onAddWorker={addWorker} onDeleteWorker={deleteWorker} records={records} onAddRecord={addRecord} articles={articles} />}

        {activeTab === 'inventory' && <InventoryView records={records} articles={articles} />}
        
        {activeTab === 'production-report' && <ProductionReportView records={records} articles={articles} />}

        {activeTab === 'manufacturing' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <ManufacturingForm articles={articles.filter(a => a.category !== 'Material' && a.category !== 'Imported')} workers={workers} onSubmit={addRecord} />
            <div className="lg:col-span-2"><RecordList records={records.filter(r => r.type === RecordType.MANUFACTURING)} articles={articles} onDelete={deleteRecord} onUpdatePayment={updatePayment} /></div>
          </div>
        )}

        {activeTab === 'sales' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <SalesForm articles={articles.filter(a => a.category !== 'Material')} onSubmit={addRecord} />
            <div className="lg:col-span-2"><RecordList records={records.filter(r => r.type === RecordType.SALE)} articles={articles} onDelete={deleteRecord} showFilters={true} onUpdatePayment={updatePayment} /></div>
          </div>
        )}

        {activeTab === 'purchases' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <PurchaseForm articles={articles} onSubmit={addRecord} />
            <div className="lg:col-span-2"><RecordList records={records.filter(r => r.type === RecordType.PURCHASE)} articles={articles} onDelete={deleteRecord} showFilters={true} onUpdatePayment={updatePayment} /></div>
          </div>
        )}

        {activeTab === 'expenses' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <ExpenseForm onSubmit={addRecord} />
            <div className="lg:col-span-2"><RecordList records={records.filter(r => r.type === RecordType.EXPENSE)} articles={articles} onDelete={deleteRecord} onUpdatePayment={updatePayment} /></div>
          </div>
        )}

        {activeTab === 'opening-balances' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <OpeningBalanceForm articles={articles} onSubmit={addRecord} />
            <div className="lg:col-span-2"><RecordList records={records.filter(r => r.type === RecordType.INITIAL_STOCK || r.type === RecordType.INITIAL_BALANCE)} articles={articles} onDelete={deleteRecord} onUpdatePayment={updatePayment} /></div>
          </div>
        )}

        {(activeTab === 'ledger-customers' || activeTab === 'ledger-suppliers' || activeTab === 'ledger-unified') && (
           <LedgerView activeSubView={activeTab} records={records} articles={articles} onDelete={deleteRecord} onUpdatePayment={updatePayment} />
        )}

        {activeTab === 'backup' && (
          <div className="max-w-4xl p-8 bg-white border border-slate-200 rounded-[2rem] shadow-sm">
            <h3 className="text-xl font-black mb-4">Export to Excel</h3>
            <button onClick={handleExportExcel} className="flex items-center gap-2 bg-emerald-600 text-white px-6 py-3 rounded-xl font-bold shadow-lg hover:bg-emerald-700 transition-all"><Download /> Download Sales Data</button>
          </div>
        )}

        {activeTab === 'ai' && (
          <div className="max-w-4xl mx-auto bg-white p-12 rounded-[3rem] shadow-2xl border border-slate-100 animate-in fade-in">
            <div className="flex items-center gap-4 mb-8"><div className="bg-indigo-600 p-3 rounded-2xl text-white"><BrainCircuit className="w-8 h-8" /></div><h3 className="text-3xl font-black text-slate-900">AI Audit</h3></div>
            {aiInsights ? <div className="prose prose-slate max-w-none">{aiInsights.split('\n').map((line, i) => <p key={i}>{line}</p>)}</div> : <p className="italic text-slate-400 font-bold">No insights generated yet.</p>}
          </div>
        )}
      </main>
    </div>
  );
};

const NavItem: React.FC<{ icon?: React.ReactNode, label: string, active: boolean, onClick: () => void, size?: 'sm' | 'md' }> = ({ icon, label, active, onClick, size = 'md' }) => (
  <button onClick={onClick} className={`flex items-center gap-3 px-4 py-3 rounded-2xl transition-all font-bold ${size === 'sm' ? 'text-xs' : 'text-sm'} ${active ? 'bg-blue-600 text-white shadow-xl translate-x-1' : 'text-slate-500 hover:text-white hover:bg-slate-800'}`}>
    {icon && React.isValidElement(icon) && React.cloneElement(icon as React.ReactElement<any>, { className: size === 'sm' ? 'w-4 h-4' : 'w-5 h-5' })} {label}
  </button>
);

const StatCard: React.FC<{ label: string, value: string, subValue: string, icon: React.ReactNode, color: string }> = ({ label, value, subValue, icon, color }) => (
  <div className={`bg-white p-7 rounded-[2rem] shadow-sm border border-slate-100 relative overflow-hidden group`}>
    <div className={`absolute -right-4 -top-4 opacity-10 text-${color}-600 group-hover:scale-125 transition-transform duration-500`}>{React.isValidElement(icon) && React.cloneElement(icon as React.ReactElement<any>, { className: 'w-24 h-24' })}</div>
    <div className="relative z-10">
      <div className={`w-12 h-12 rounded-2xl bg-${color}-50 text-${color}-600 flex items-center justify-center mb-6`}>{icon}</div>
      <span className="text-slate-400 text-[10px] font-black uppercase tracking-widest block mb-1">{label}</span>
      <div className="text-2xl font-black text-slate-900">{value}</div>
      <div className="text-[10px] font-bold text-slate-400 mt-1">{subValue}</div>
    </div>
  </div>
);

const ProductionReportView: React.FC<{ records: FactoryRecord[], articles: Article[] }> = ({ records, articles }) => {
  const [dateFilter, setDateFilter] = useState({ start: new Date().toISOString().split('T')[0], end: new Date().toISOString().split('T')[0] });
  const groupedProduction = useMemo(() => {
    const manufacturing = records.filter(r => r.type === RecordType.MANUFACTURING && r.date >= dateFilter.start && r.date <= dateFilter.end) as ManufacturingRecord[];
    const result: Record<string, Record<string, { quantity: number, totalCost: number, unit: string }>> = {};
    manufacturing.forEach(rec => {
      const article = articles.find(a => a.id === rec.articleId);
      if (!article) return;
      const category = article.category;
      if (!result[category]) result[category] = {};
      const itemName = rec.customName || article.name;
      if (!result[category][itemName]) result[category][itemName] = { quantity: 0, totalCost: 0, unit: article.unit };
      result[category][itemName].quantity += rec.quantity;
      result[category][itemName].totalCost += rec.totalCost;
    });
    return result;
  }, [records, articles, dateFilter]);

  return (
    <div className="space-y-8 animate-in fade-in">
      <div className="bg-white p-6 rounded-[2rem] border border-slate-200 shadow-sm flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-3"><Filter className="w-5 h-5 text-blue-600" /><h4 className="text-sm font-black text-slate-800 uppercase">Article Grouping</h4></div>
        <div className="flex items-center gap-3">
          <input type="date" value={dateFilter.start} onChange={e => setDateFilter(p => ({...p, start: e.target.value}))} className="bg-slate-50 border rounded-xl px-4 py-2 text-xs font-bold" />
          <span className="text-slate-400 text-xs font-bold uppercase">to</span>
          <input type="date" value={dateFilter.end} onChange={e => setDateFilter(p => ({...p, end: e.target.value}))} className="bg-slate-50 border rounded-xl px-4 py-2 text-xs font-bold" />
        </div>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {Object.keys(groupedProduction).sort().map(cat => (
          <div key={cat} className="bg-white rounded-[2.5rem] border border-slate-200 shadow-sm overflow-hidden flex flex-col">
            <div className="px-8 py-6 bg-slate-50 border-b border-slate-200 flex items-center justify-between"><h3 className="text-lg font-black text-slate-800 uppercase tracking-tight">{cat} Articles</h3><Layers className="w-5 h-5 text-slate-400" /></div>
            <div className="p-4 overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead><tr className="text-[10px] font-black text-slate-400 uppercase tracking-widest"><th className="px-4 py-3">Article</th><th className="px-4 py-3 text-right">Production</th><th className="px-4 py-3 text-right">Labor Cost (Rs.)</th></tr></thead>
                <tbody className="divide-y divide-slate-50">{Object.entries(groupedProduction[cat]).map(([name, data]: [string, any]) => (
                  <tr key={name} className="hover:bg-slate-50/50"><td className="px-4 py-4 font-bold">{name}</td><td className="px-4 py-4 text-right font-black text-blue-600">{data.quantity} <span className="text-[10px] opacity-40 uppercase">{data.unit}</span></td><td className="px-4 py-4 text-right font-bold text-slate-900">{data.totalCost.toLocaleString()}</td></tr>
                ))}</tbody>
                <tfoot><tr className="bg-slate-50/50 font-black"><td className="px-4 py-4 uppercase text-[10px]">Total</td><td className="px-4 py-4 text-right">{Object.values(groupedProduction[cat]).reduce((acc, curr: any) => acc + curr.quantity, 0).toLocaleString()}</td><td className="px-4 py-4 text-right">Rs. {Object.values(groupedProduction[cat]).reduce((acc, curr: any) => acc + curr.totalCost, 0).toLocaleString()}</td></tr></tfoot>
              </table>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

const InventoryView: React.FC<{ records: FactoryRecord[], articles: Article[] }> = ({ records, articles }) => {
  const inventory = useMemo(() => {
    const stockMap = new Map<string, { name: string, unit: string, quantity: number, category: string }>();
    articles.forEach(a => { if (a.id !== 'other') stockMap.set(a.id, { name: a.name, unit: a.unit, quantity: 0, category: a.category }); });
    records.forEach(r => {
      const type = r.type;
      if (type === RecordType.EXPENSE || type === RecordType.INITIAL_BALANCE || type === RecordType.WORKER_PAYMENT) return;
      const articleId = (r as any).articleId;
      const quantity = (r as any).quantity || 0;
      const customName = (r as any).customName;
      const key = articleId === 'other' ? `custom-${customName}` : articleId;
      if (!stockMap.has(key)) {
        const baseArticle = articles.find(a => a.id === articleId) || articles[0];
        stockMap.set(key, { name: customName || baseArticle.name, unit: baseArticle.unit, quantity: 0, category: baseArticle.category });
      }
      const item = stockMap.get(key)!;
      if (type === RecordType.INITIAL_STOCK || type === RecordType.MANUFACTURING || type === RecordType.PURCHASE) item.quantity += quantity;
      else if (type === RecordType.SALE) item.quantity -= quantity;
    });
    return Array.from(stockMap.values());
  }, [records, articles]);

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      {inventory.map((item, idx) => (
        <div key={idx} className={`bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm flex items-center justify-between ${item.quantity < 10 ? 'border-rose-200 bg-rose-50/10' : ''}`}>
          <div className="flex-1">
            <p className="text-[10px] font-black uppercase text-slate-400 tracking-widest line-clamp-1">{item.name}</p>
            <p className="text-3xl font-black mt-1">{item.quantity} <span className="text-xs font-medium text-slate-400 tracking-normal">{item.unit}</span></p>
          </div>
          <div className={`p-4 rounded-2xl shrink-0 ml-4 ${item.quantity < 10 ? 'bg-rose-100 text-rose-600 animate-pulse' : 'bg-blue-50 text-blue-600'}`}><Box className="w-6 h-6" /></div>
        </div>
      ))}
    </div>
  );
};

const LedgerView: React.FC<{ activeSubView: AppTab, records: any, articles: any, onDelete: any, onUpdatePayment: any }> = ({ activeSubView, records, articles, onDelete, onUpdatePayment }) => {
  const data = useMemo(() => {
    if (activeSubView === 'ledger-customers') return records.filter((r: any) => r.type === RecordType.SALE || (r.type === RecordType.INITIAL_BALANCE && r.balanceType === 'customer'));
    if (activeSubView === 'ledger-suppliers') return records.filter((r: any) => r.type === RecordType.PURCHASE || (r.type === RecordType.INITIAL_BALANCE && r.balanceType === 'supplier'));
    return records.filter((r: any) => [RecordType.SALE, RecordType.PURCHASE, RecordType.EXPENSE, RecordType.INITIAL_BALANCE, RecordType.WORKER_PAYMENT].includes(r.type));
  }, [records, activeSubView]);
  return <RecordList records={data} articles={articles} onDelete={onDelete} onUpdatePayment={onUpdatePayment} showFilters={true} />;
};

const RecordList: React.FC<{ records: any, articles: any, onDelete: any, onUpdatePayment: any, showFilters?: boolean }> = ({ records, articles, onDelete, onUpdatePayment, showFilters }) => {
  const [start, setStart] = useState('');
  const [end, setEnd] = useState('');
  const [payingRecordId, setPayingRecordId] = useState<string | null>(null);
  const [payAmount, setPayAmount] = useState<string>('');

  const filtered = useMemo(() => (!showFilters ? records : records.filter((r: any) => (!start || r.date >= start) && (!end || r.date <= end))), [records, start, end, showFilters]);
  const getStatusBadge = (r: any) => {
    if (r.type === RecordType.INITIAL_STOCK) return <span className="px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-tighter bg-slate-900 text-white">Opening Stock</span>;
    if (r.type === RecordType.INITIAL_BALANCE) return <span className="px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-tighter bg-rose-900 text-white">Opening Debt</span>;
    if (r.type === RecordType.WORKER_PAYMENT) return <span className={`px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-tighter ${r.paymentType === 'Advance' ? 'bg-amber-100 text-amber-700' : 'bg-emerald-100 text-emerald-700'}`}>{r.paymentType}</span>;
    const status = r.paymentStatus;
    if (!status) return null;
    let styles = status === 'Paid' ? 'bg-emerald-100 text-emerald-700' : status === 'Partially Paid' ? 'bg-amber-100 text-amber-700' : 'bg-rose-100 text-rose-700';
    return <span className={`px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-tighter ${styles}`}>{status}</span>;
  };

  const handleQuickPaySubmit = (record: any) => {
    const amount = parseFloat(payAmount);
    const balance = (record.totalAmount || record.totalCost || record.amount) - (record.amountPaid || 0);
    if (isNaN(amount) || amount <= 0 || amount > balance) return alert("Invalid amount.");
    onUpdatePayment(record.id, amount);
    setPayingRecordId(null);
    setPayAmount('');
  };

  return (
    <div className="bg-white rounded-[2rem] border border-slate-100 shadow-sm overflow-hidden">
        <div className="p-6 border-b border-slate-50 flex items-center justify-between"><h3 className="font-extrabold text-slate-800">History</h3>{showFilters && <div className="flex gap-2"><input type="date" value={start} onChange={e => setStart(e.target.value)} className="text-xs border rounded-lg px-2 py-1" /><input type="date" value={end} onChange={e => setEnd(e.target.value)} className="text-xs border rounded-lg px-2 py-1" /></div>}</div>
        <div className="overflow-x-auto"><table className="w-full text-left text-sm"><thead className="bg-slate-50"><tr className="text-slate-400 text-[10px] font-bold uppercase"><th className="px-6 py-4">Date</th><th className="px-6 py-4">Description</th><th className="px-6 py-4 text-right">Paid</th><th className="px-6 py-4 text-right">Balance</th><th className="px-6 py-4 text-center">X</th></tr></thead><tbody className="divide-y divide-slate-50">{filtered.map((r: any) => {
            const amount = (r.totalAmount || r.amount || r.totalCost || 0);
            const balance = amount - (r.amountPaid || 0);
            const articleName = r.customName || articles.find((a:any) => a.id === r.articleId)?.name || r.description || 'System Entry';
            const clientName = r.customer || r.supplier || r.name || 'Factory';
            return (
              <tr key={r.id} className="hover:bg-slate-50/50">
                <td className="px-6 py-4 text-slate-400">{r.date}</td>
                <td className="px-6 py-4">
                  <div className="font-bold text-slate-900">{articleName} {getStatusBadge(r)}</div>
                  <div className="text-[10px] font-black text-slate-400">{clientName}</div>
                </td>
                <td className="px-6 py-4 text-right font-black text-emerald-600">{(r.amountPaid || r.amount || 0).toLocaleString()}</td>
                <td className="px-6 py-4 text-right">
                  {balance > 0 && r.type !== RecordType.WORKER_PAYMENT && r.type !== RecordType.EXPENSE ? (
                    <div className="flex items-center justify-end gap-2">
                      <span className="font-black text-rose-600">{balance.toLocaleString()}</span>
                      {payingRecordId === r.id ? (
                        <div className="flex items-center gap-1"><input autoFocus type="number" value={payAmount} onChange={e => setPayAmount(e.target.value)} className="w-20 px-2 py-1 border rounded text-xs" /><button onClick={() => handleQuickPaySubmit(r)} className="bg-emerald-600 text-white p-1 rounded"><Check className="w-3.5 h-3.5" /></button></div>
                      ) : <button onClick={() => setPayingRecordId(r.id)} className="p-1.5 bg-rose-50 text-rose-600 rounded-lg"><Plus className="w-4 h-4" /></button>}
                    </div>
                  ) : <span className="text-slate-300">-</span>}
                </td>
                <td className="px-6 py-4 text-center"><button onClick={() => onDelete(r.id)}><X className="w-4 h-4 text-slate-300 hover:text-rose-500" /></button></td>
              </tr>
            );
          })}</tbody></table></div>
    </div>
  );
};

const WorkersView: React.FC<{ 
  workers: Worker[], 
  onAddWorker: (w: Worker) => void, 
  onDeleteWorker: (id: string) => void,
  records: FactoryRecord[],
  onAddRecord: (r: FactoryRecord) => void,
  articles: Article[]
}> = ({ workers, onAddWorker, onDeleteWorker, records, onAddRecord, articles }) => {
  const [showAddForm, setShowAddForm] = useState(false);
  const [selectedWorkerId, setSelectedWorkerId] = useState<string | null>(null);
  const [newWorker, setNewWorker] = useState({ name: '', phone: '' });
  const [paymentForm, setPaymentForm] = useState({ amount: 0, type: 'Payment' as 'Payment' | 'Advance', notes: '' });

  const workerBalances = useMemo(() => {
    return workers.map(w => {
      const manufacturing = records.filter(r => r.type === RecordType.MANUFACTURING && r.workerId === w.id) as ManufacturingRecord[];
      const totalEarned = manufacturing.reduce((acc, r) => acc + (r.totalCost || 0), 0);
      const payments = records.filter(r => r.type === RecordType.WORKER_PAYMENT && r.workerId === w.id) as WorkerPaymentRecord[];
      const totalPaid = payments.reduce((acc, r) => acc + (r.amount || 0), 0);
      return { ...w, earned: totalEarned, paid: totalPaid, balance: totalEarned - totalPaid };
    });
  }, [workers, records]);

  const handleAddWorker = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newWorker.name.trim()) return;
    onAddWorker({
      id: Math.random().toString(36).substr(2, 9),
      name: newWorker.name,
      phone: newWorker.phone,
      joiningDate: new Date().toISOString().split('T')[0],
      isActive: true
    });
    setNewWorker({ name: '', phone: '' });
    setShowAddForm(false);
  };

  const handleLogPayment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedWorkerId || paymentForm.amount <= 0) return;
    onAddRecord({
      id: Math.random().toString(36).substr(2, 9),
      type: RecordType.WORKER_PAYMENT,
      date: new Date().toISOString().split('T')[0],
      workerId: selectedWorkerId,
      amount: paymentForm.amount,
      paymentType: paymentForm.type,
      notes: paymentForm.notes
    });
    setPaymentForm({ amount: 0, type: 'Payment', notes: '' });
    alert(`${paymentForm.type} logged successfully.`);
  };

  const selectedWorkerHistory = useMemo(() => {
    if (!selectedWorkerId) return [];
    return records.filter(r => (r.type === RecordType.MANUFACTURING || r.type === RecordType.WORKER_PAYMENT) && (r as any).workerId === selectedWorkerId)
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }, [selectedWorkerId, records]);

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <h3 className="text-xl font-black text-slate-800 uppercase tracking-tight">Active Factory Staff</h3>
        <button onClick={() => setShowAddForm(!showAddForm)} className="bg-blue-600 text-white px-5 py-2.5 rounded-2xl font-bold flex items-center gap-2 shadow-lg shadow-blue-200">
          <Plus className="w-5 h-5" /> Add New Worker
        </button>
      </div>

      {showAddForm && (
        <form onSubmit={handleAddWorker} className="bg-white p-6 rounded-3xl border border-blue-100 shadow-sm flex flex-col md:flex-row gap-4 items-end animate-in slide-in-from-top-4">
          <div className="flex-1 space-y-1">
            <label className="text-[10px] font-black uppercase text-slate-400">Worker Name</label>
            <input required value={newWorker.name} onChange={e => setNewWorker({ ...newWorker, name: e.target.value })} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 outline-none focus:ring-4 focus:ring-blue-500/10" placeholder="Full Name" />
          </div>
          <div className="flex-1 space-y-1">
            <label className="text-[10px] font-black uppercase text-slate-400">Phone (Optional)</label>
            <input value={newWorker.phone} onChange={e => setNewWorker({ ...newWorker, phone: e.target.value })} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 outline-none focus:ring-4 focus:ring-blue-500/10" placeholder="Contact Number" />
          </div>
          <button type="submit" className="bg-slate-900 text-white px-8 py-2.5 rounded-xl font-black h-[46px]">SAVE WORKER</button>
        </form>
      )}

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
        <div className="space-y-4">
          {workerBalances.map(w => (
            <div key={w.id} className={`p-6 bg-white border rounded-[2rem] shadow-sm transition-all cursor-pointer ${selectedWorkerId === w.id ? 'border-blue-600 ring-4 ring-blue-500/5' : 'border-slate-100 hover:border-blue-200'}`} onClick={() => setSelectedWorkerId(w.id)}>
              <div className="flex justify-between items-start mb-4">
                <div className="flex items-center gap-3">
                  <div className="bg-blue-50 p-3 rounded-2xl text-blue-600"><Users className="w-6 h-6" /></div>
                  <div><h4 className="text-lg font-black text-slate-900">{w.name}</h4><p className="text-xs font-bold text-slate-400">{w.phone || 'No phone'}</p></div>
                </div>
                <div className="text-right">
                  <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Balance Due</span>
                  <div className={`text-2xl font-black ${w.balance > 0 ? 'text-rose-600' : 'text-emerald-600'}`}>Rs. {w.balance.toLocaleString()}</div>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4 pt-4 border-t border-slate-50">
                <div><p className="text-[9px] font-black uppercase text-slate-400">Total Earned</p><p className="font-bold text-slate-600">Rs. {w.earned.toLocaleString()}</p></div>
                <div><p className="text-[9px] font-black uppercase text-slate-400">Total Paid</p><p className="font-bold text-slate-600">Rs. {w.paid.toLocaleString()}</p></div>
              </div>
            </div>
          ))}
          {workerBalances.length === 0 && <p className="text-center py-10 text-slate-400 italic">No workers registered yet.</p>}
        </div>

        {selectedWorkerId && (
          <div className="space-y-6 animate-in fade-in">
            <div className="bg-white p-8 rounded-[2.5rem] border border-slate-200 shadow-sm">
              <div className="flex items-center justify-between mb-8">
                 <h4 className="text-xl font-black flex items-center gap-2"><Wallet className="w-6 h-6 text-emerald-600" /> Log Transaction</h4>
                 <div className="text-xs font-bold text-slate-400 uppercase tracking-widest">Logging for: {workers.find(w => w.id === selectedWorkerId)?.name}</div>
              </div>
              <form onSubmit={handleLogPayment} className="space-y-6">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Transaction Type</label>
                    <select value={paymentForm.type} onChange={e => setPaymentForm({...paymentForm, type: e.target.value as any})} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 font-medium">
                      <option value="Payment">Regular Payment</option>
                      <option value="Advance">Advance Given</option>
                    </select>
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Amount (Rs.)</label>
                    <input type="number" required min="1" value={paymentForm.amount || ''} onChange={e => setPaymentForm({...paymentForm, amount: parseFloat(e.target.value) || 0})} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 font-black text-emerald-600 outline-none" placeholder="0.00" />
                  </div>
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Notes (Optional)</label>
                  <input value={paymentForm.notes} onChange={e => setPaymentForm({...paymentForm, notes: e.target.value})} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 font-medium outline-none" placeholder="Purpose of payment..." />
                </div>
                <button type="submit" className="w-full bg-emerald-600 hover:bg-emerald-700 text-white py-4 rounded-2xl font-black shadow-lg shadow-emerald-100 transition-all">POST TRANSACTION</button>
              </form>
            </div>

            <div className="bg-white rounded-[2.5rem] border border-slate-200 shadow-sm overflow-hidden">
               <div className="p-6 bg-slate-50 border-b border-slate-100 flex items-center gap-2 font-black uppercase text-xs tracking-widest text-slate-500"><History className="w-4 h-4" /> Activity History</div>
               <div className="max-h-[400px] overflow-y-auto">
                 <table className="w-full text-left text-sm">
                   <thead className="bg-slate-50/50 text-[10px] text-slate-400 font-black uppercase"><tr className="border-b border-slate-100"><th className="px-6 py-4">Date</th><th className="px-6 py-4">Activity</th><th className="px-6 py-4 text-right">Debit</th><th className="px-6 py-4 text-right">Credit</th></tr></thead>
                   <tbody className="divide-y divide-slate-50">
                     {selectedWorkerHistory.map(rec => (
                       <tr key={rec.id} className="hover:bg-slate-50/50">
                         <td className="px-6 py-4 text-slate-400 whitespace-nowrap">{rec.date}</td>
                         <td className="px-6 py-4">
                           {rec.type === RecordType.MANUFACTURING ? (
                             <div><p className="font-bold text-slate-900">{articles.find(a => a.id === (rec as any).articleId)?.name || (rec as any).customName}</p><p className="text-[10px] text-slate-400">{rec.quantity} units @ Rs. {rec.unitCost}</p></div>
                           ) : (
                             <div><p className={`font-bold ${(rec as any).paymentType === 'Advance' ? 'text-amber-600' : 'text-emerald-600'}`}>{(rec as any).paymentType}</p>{rec.notes && <p className="text-[10px] text-slate-400 italic">{rec.notes}</p>}</div>
                           )}
                         </td>
                         <td className="px-6 py-4 text-right font-black text-slate-900">{rec.type === RecordType.MANUFACTURING ? rec.totalCost.toLocaleString() : '-'}</td>
                         <td className="px-6 py-4 text-right font-black text-emerald-600">{rec.type === RecordType.WORKER_PAYMENT ? rec.amount.toLocaleString() : '-'}</td>
                       </tr>
                     ))}
                   </tbody>
                 </table>
               </div>
            </div>
            {/* Fix: Use onDeleteWorker prop instead of undefined deleteWorker */}
            <button onClick={() => onDeleteWorker(selectedWorkerId)} className="w-full flex items-center justify-center gap-2 py-4 text-rose-600 font-bold hover:bg-rose-50 rounded-2xl transition-colors"><Trash2 className="w-5 h-5" /> Remove Worker Record</button>
          </div>
        )}
      </div>
    </div>
  );
};

export default App;
