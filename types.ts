
export enum RecordType {
  MANUFACTURING = 'MANUFACTURING',
  SALE = 'SALE',
  PURCHASE = 'PURCHASE',
  EXPENSE = 'EXPENSE',
  INITIAL_STOCK = 'INITIAL_STOCK',
  INITIAL_BALANCE = 'INITIAL_BALANCE',
  WORKER_PAYMENT = 'WORKER_PAYMENT'
}

export interface Article {
  id: string;
  name: string;
  unit: string;
  category: 'Roof' | 'Floor' | 'Material' | 'Imported' | 'Other';
}

export interface BaseRecord {
  id: string;
  date: string;
  articleId: string;
  quantity: number;
  notes?: string;
  customName?: string;
  specification?: string;
}

export interface ManufacturingRecord extends BaseRecord {
  type: RecordType.MANUFACTURING;
  unitCost: number; // This acts as the Labor Rate per item
  totalCost: number;
  workerId?: string;
}

export interface SaleRecord extends BaseRecord {
  type: RecordType.SALE;
  unitPrice: number;
  totalAmount: number;
  amountPaid: number;
  customer: string;
  phone?: string;
  paymentStatus: 'Paid' | 'Partially Paid' | 'Due';
}

export interface PurchaseRecord extends BaseRecord {
  type: RecordType.PURCHASE;
  unitCost: number;
  totalAmount: number;
  amountPaid: number;
  supplier: string;
  phone?: string;
  paymentStatus: 'Paid' | 'Partially Paid' | 'Due';
}

export interface ExpenseRecord {
  id: string;
  type: RecordType.EXPENSE;
  date: string;
  description: string;
  amount: number;
  notes?: string;
}

export interface InitialStockRecord extends BaseRecord {
  type: RecordType.INITIAL_STOCK;
}

export interface InitialBalanceRecord {
  id: string;
  type: RecordType.INITIAL_BALANCE;
  date: string;
  name: string;
  amount: number;
  balanceType: 'customer' | 'supplier';
  notes?: string;
}

export interface WorkerPaymentRecord {
  id: string;
  type: RecordType.WORKER_PAYMENT;
  date: string;
  workerId: string;
  amount: number;
  paymentType: 'Payment' | 'Advance';
  notes?: string;
}

export type FactoryRecord = 
  | ManufacturingRecord 
  | SaleRecord 
  | PurchaseRecord 
  | ExpenseRecord 
  | InitialStockRecord 
  | InitialBalanceRecord
  | WorkerPaymentRecord;

export interface Worker {
  id: string;
  name: string;
  phone?: string;
  joiningDate: string;
  isActive: boolean;
}

export interface WorkerPayment {
  id: string;
  workerId: string;
  date: string;
  amount: number;
  notes?: string;
}

export interface AttendanceRecord {
  id: string;
  workerId: string;
  date: string;
  status: 'present' | 'absent';
}
