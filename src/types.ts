export interface Payment {
  id: string;
  date: string;
  amount: number;
}

export interface ClientInfo {
  name: string;
  standNum: string;
  standSize: number;
  contact: string;
  propValue: number;
  startDate: string;
}

export interface SimulationConfig {
  stmtDate: string;
  annualRate: number;
  vatRate: number;
  vatDate: string;
  bookingFee: number;
  loanMonths: number;
}

export enum AccountStatus {
  ON_TRACK = 'On Track',
  BEHIND = 'Behind',
  PAID_OFF = 'Paid Off',
}

export interface LedgerEntry {
  date: string;
  details: string;
  debit: number | null;
  credit: number | null;
  balance: number;
  type: 'opening' | 'interest' | 'payment' | 'special';
}

export interface ComplianceSnapshot {
  date: string;
  n: number;
  e: number;
  p: number;
  c: number;
  paidDate?: string;
  status: AccountStatus;
}

export interface InterestSnapshot {
  month: string;
  interest: number;
  closingBalance: number;
}

export interface SimulationResult {
  ledger: LedgerEntry[];
  complianceHistory: ComplianceSnapshot[];
  monthlyInterestHistory: InterestSnapshot[];
  totalPaid: number;
  totalInterest: number;
  totalDebit: number;
  remainingBalance: number;
  minMonthlyInstalment: number;
  instalmentsDue: number;
  expectedTotal: number;
  catchUpAmount: number;
  status: AccountStatus;
  percentagePaid: number;
  revisedValue: number;
}
