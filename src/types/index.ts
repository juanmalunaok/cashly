export type Currency = 'ARS' | 'USD';
export type TransactionType = 'income' | 'expense';
export type AccountType = 'mercadopago' | 'galicia' | 'bbva' | 'efectivo';

export interface Transaction {
  id: string;
  type: TransactionType;
  amount: number;
  currency: Currency;
  category: string;
  subcategory: string | null;
  account: AccountType;
  note: string | null;
  date: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface Category {
  id: string;
  name: string;
  icon: string;
  type: TransactionType;
  order: number;
  subcategories: string[] | null;
  color: string | null;
}

export interface UserSettings {
  defaultCurrency: Currency;
  defaultAccount: AccountType;
}

export interface UserProfile {
  uid: string;
  displayName: string | null;
  email: string | null;
  defaultCurrency: Currency;
  createdAt: Date;
  settings: UserSettings;
}

export interface DolarBlueRate {
  compra: number;
  venta: number;
  fechaActualizacion: string;
}

export interface MonthlySummary {
  totalIncomeARS: number;
  totalExpenseARS: number;
  totalIncomeUSD: number;
  totalExpenseUSD: number;
  balanceARS: number;
  balanceUSD: number;
}

export interface CategoryBreakdown {
  categoryId: string;
  categoryName: string;
  categoryIcon: string;
  totalARS: number;
  totalUSD: number;
}

export const DEFAULT_CATEGORIES: Omit<Category, 'id'>[] = [
  // Gastos
  { name: 'Comida', icon: '🍔', type: 'expense', order: 0, subcategories: null, color: null },
  { name: 'Transporte', icon: '🚌', type: 'expense', order: 1, subcategories: null, color: null },
  { name: 'Entretenimiento', icon: '🎬', type: 'expense', order: 2, subcategories: null, color: null },
  {
    name: 'Casa',
    icon: '🏠',
    type: 'expense',
    order: 3,
    subcategories: ['Alquiler', 'Expensas', 'ABL', 'Luz', 'Flow', 'PS Plus'],
    color: null,
  },
  { name: 'Servicios', icon: '📄', type: 'expense', order: 4, subcategories: null, color: null },
  { name: 'Salud', icon: '💊', type: 'expense', order: 5, subcategories: null, color: null },
  { name: 'Ropa', icon: '👕', type: 'expense', order: 6, subcategories: null, color: null },
  { name: 'Otro gasto', icon: '➕', type: 'expense', order: 7, subcategories: null, color: null },
  // Ingresos
  { name: 'Farmacia', icon: '💊', type: 'income', order: 8, subcategories: null, color: null },
  { name: 'DevJuan', icon: '💼', type: 'income', order: 9, subcategories: null, color: null },
  { name: 'Otro ingreso', icon: '➕', type: 'income', order: 10, subcategories: null, color: null },
];

export const ACCOUNT_LABELS: Record<AccountType, string> = {
  mercadopago: 'MercadoPago',
  galicia: 'Galicia',
  bbva: 'BBVA',
  efectivo: 'Efectivo',
};

export const ACCOUNT_OPTIONS: { value: AccountType; label: string }[] = [
  { value: 'mercadopago', label: 'MercadoPago' },
  { value: 'galicia', label: 'Galicia' },
  { value: 'bbva', label: 'BBVA' },
  { value: 'efectivo', label: 'Efectivo' },
];
