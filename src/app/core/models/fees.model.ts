export type FeeStatus = 'Paid' | 'Partial' | 'Pending';

export interface FeeRecord {
  id: string;
  studentId: string;
  studentName: string;
  program: string;
  month: string;
  amount: number;
  paid: number;
  balance: number;
  status: FeeStatus;
  dueDate: string;
  paidDate?: string;
  receiptNo?: string;
}