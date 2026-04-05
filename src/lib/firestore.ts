import {
  collection,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  query,
  where,
  orderBy,
  getDocs,
  onSnapshot,
  Timestamp,
  serverTimestamp,
  writeBatch,
} from 'firebase/firestore';
import { db } from './firebase';
import { Transaction, Category, Currency, AccountType, TransactionType } from '@/types';

// ─── Transactions ──────────────────────────────────────────────────────────────

export interface CreateTransactionData {
  type: TransactionType;
  amount: number;
  currency: Currency;
  category: string;
  subcategory?: string | null;
  account: AccountType;
  note?: string | null;
  installments?: number | null;
  installmentNumber?: number | null;
  seriesId?: string | null;
  scheduled?: boolean;
  paid?: boolean;
  date?: Date;
}

export async function createTransaction(uid: string, data: CreateTransactionData): Promise<string> {
  const ref = collection(db, 'users', uid, 'transactions');
  const docRef = await addDoc(ref, {
    ...data,
    subcategory: data.subcategory ?? null,
    note: data.note ?? null,
    installments: data.installments ?? null,
    installmentNumber: data.installmentNumber ?? null,
    seriesId: data.seriesId ?? null,
    scheduled: data.scheduled ?? false,
    paid: data.paid ?? false,
    date: data.date ? Timestamp.fromDate(data.date) : serverTimestamp(),
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });
  return docRef.id;
}

export async function updateTransaction(
  uid: string,
  transactionId: string,
  data: Partial<CreateTransactionData>
): Promise<void> {
  const ref = doc(db, 'users', uid, 'transactions', transactionId);
  await updateDoc(ref, {
    ...data,
    updatedAt: serverTimestamp(),
  });
}

export async function deleteTransaction(uid: string, transactionId: string): Promise<void> {
  const ref = doc(db, 'users', uid, 'transactions', transactionId);
  await deleteDoc(ref);
}

export async function toggleCreditPaid(uid: string, transactionId: string, paid: boolean): Promise<void> {
  const ref = doc(db, 'users', uid, 'transactions', transactionId);
  await updateDoc(ref, { paid, updatedAt: serverTimestamp() });
}

export function subscribeToMonthTransactions(
  uid: string,
  year: number,
  month: number,
  callback: (transactions: Transaction[]) => void
): () => void {
  const startDate = new Date(year, month, 1);
  const endDate = new Date(year, month + 1, 0, 23, 59, 59);

  const q = query(
    collection(db, 'users', uid, 'transactions'),
    where('date', '>=', Timestamp.fromDate(startDate)),
    where('date', '<=', Timestamp.fromDate(endDate)),
    orderBy('date', 'desc')
  );

  return onSnapshot(q, (snapshot) => {
    const transactions: Transaction[] = snapshot.docs.map((doc) => {
      const data = doc.data();
      return {
        id: doc.id,
        type: data.type,
        amount: data.amount,
        currency: data.currency,
        category: data.category,
        subcategory: data.subcategory,
        account: data.account,
        note: data.note,
        installments: data.installments ?? null,
        installmentNumber: data.installmentNumber ?? null,
        seriesId: data.seriesId ?? null,
        scheduled: data.scheduled ?? false,
        paid: data.paid ?? false,
        date: data.date?.toDate() ?? new Date(),
        createdAt: data.createdAt?.toDate() ?? new Date(),
        updatedAt: data.updatedAt?.toDate() ?? new Date(),
      };
    });
    callback(transactions);
  });
}

export function subscribeToScheduledTransactions(
  uid: string,
  callback: (transactions: Transaction[]) => void
): () => void {
  const q = query(
    collection(db, 'users', uid, 'transactions'),
    where('scheduled', '==', true)
  );

  return onSnapshot(q, (snapshot) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const transactions: Transaction[] = snapshot.docs
      .map((doc) => {
        const data = doc.data();
        return {
          id: doc.id,
          type: data.type,
          amount: data.amount,
          currency: data.currency,
          category: data.category,
          subcategory: data.subcategory ?? null,
          account: data.account,
          note: data.note ?? null,
          installments: data.installments ?? null,
          installmentNumber: data.installmentNumber ?? null,
          seriesId: data.seriesId ?? null,
          scheduled: true,
          paid: data.paid ?? false,
          date: data.date?.toDate() ?? new Date(),
          createdAt: data.createdAt?.toDate() ?? new Date(),
          updatedAt: data.updatedAt?.toDate() ?? new Date(),
        };
      })
      .filter((t) => t.date >= today)
      .sort((a, b) => a.date.getTime() - b.date.getTime());

    callback(transactions);
  });
}

export async function deleteTransactionSeries(uid: string, seriesId: string): Promise<void> {
  const q = query(
    collection(db, 'users', uid, 'transactions'),
    where('seriesId', '==', seriesId)
  );
  const snapshot = await getDocs(q);
  if (snapshot.empty) return;
  const batch = writeBatch(db);
  snapshot.docs.forEach((d) => batch.delete(d.ref));
  await batch.commit();
}

// ─── Categories ────────────────────────────────────────────────────────────────

export function subscribeToCategories(
  uid: string,
  callback: (categories: Category[]) => void
): () => void {
  const q = query(collection(db, 'users', uid, 'categories'), orderBy('order', 'asc'));

  return onSnapshot(q, (snapshot) => {
    const categories: Category[] = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    })) as Category[];
    callback(categories);
  });
}

export async function createCategory(
  uid: string,
  data: Omit<Category, 'id'>
): Promise<string> {
  const ref = collection(db, 'users', uid, 'categories');
  const docRef = await addDoc(ref, data);
  return docRef.id;
}

export async function updateCategory(
  uid: string,
  categoryId: string,
  data: Partial<Omit<Category, 'id'>>
): Promise<void> {
  const ref = doc(db, 'users', uid, 'categories', categoryId);
  await updateDoc(ref, data);
}

export async function deleteCategory(uid: string, categoryId: string): Promise<void> {
  const ref = doc(db, 'users', uid, 'categories', categoryId);
  await deleteDoc(ref);
}

export async function markAllAccountCreditPaid(uid: string, account: AccountType): Promise<void> {
  const q = query(
    collection(db, 'users', uid, 'transactions'),
    where('account', '==', account),
    where('paid', '==', false)
  );
  const snapshot = await getDocs(q);
  if (snapshot.empty) return;
  const batch = writeBatch(db);
  snapshot.docs.forEach((d) => {
    batch.update(d.ref, { paid: true, updatedAt: serverTimestamp() });
  });
  await batch.commit();
}

export function subscribeToAllUnpaidCredit(
  uid: string,
  callback: (transactions: Transaction[]) => void
): () => void {
  // Single where clause only — avoids needing a composite Firestore index
  const q = query(
    collection(db, 'users', uid, 'transactions'),
    where('paid', '==', false)
  );

  return onSnapshot(q, (snapshot) => {
    const transactions: Transaction[] = snapshot.docs
      .map((doc) => {
        const data = doc.data();
        return {
          id: doc.id,
          type: data.type,
          amount: data.amount,
          currency: data.currency,
          category: data.category,
          subcategory: data.subcategory,
          account: data.account,
          note: data.note,
          installments: data.installments ?? null,
          installmentNumber: data.installmentNumber ?? null,
          seriesId: data.seriesId ?? null,
          scheduled: data.scheduled ?? false,
          paid: data.paid ?? false,
          date: data.date?.toDate() ?? new Date(),
          createdAt: data.createdAt?.toDate() ?? new Date(),
          updatedAt: data.updatedAt?.toDate() ?? new Date(),
        };
      })
      // Filter in JS: only unpaid credit card expenses
      .filter((t) => ['galicia_credito', 'bbva_credito', 'mercadopago_credito'].includes(t.account) && t.type === 'expense');
    callback(transactions);
  });
}

// ─── Export ────────────────────────────────────────────────────────────────────

export async function exportTransactionsCSV(uid: string): Promise<string> {
  const q = query(
    collection(db, 'users', uid, 'transactions'),
    orderBy('date', 'desc')
  );
  const snapshot = await getDocs(q);

  const rows = [
    ['Fecha', 'Tipo', 'Categoría', 'Subcategoría', 'Monto', 'Moneda', 'Cuenta', 'Nota'],
  ];

  snapshot.docs.forEach((doc) => {
    const d = doc.data();
    const date = d.date?.toDate().toLocaleDateString('es-AR') ?? '';
    rows.push([
      date,
      d.type === 'income' ? 'Ingreso' : 'Gasto',
      d.category,
      d.subcategory ?? '',
      String(d.amount),
      d.currency,
      d.account,
      d.note ?? '',
    ]);
  });

  return rows.map((row) => row.join(',')).join('\n');
}
