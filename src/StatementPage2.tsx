import StatementLayout from './StatementLayout';

const ledger = [
  {date: '22/04/2025', details: 'Property Value', debit: null, credit: null, balance: 29900.00},
  {date: '22/04/2025', details: 'BOOKING_FEE', debit: null, credit: 0.00, balance: 29900.00},
  {date: '22/04/2025', details: 'Instalment Payment', debit: null, credit: 1000.00, balance: 28900.00},
  {date: '30/04/2025', details: 'Interest accrued', debit: 51.38, credit: null, balance: 28951.38},
  {date: '09/05/2025', details: 'Interest accrued', debit: 57.80, credit: null, balance: 29009.18},
  {date: '09/05/2025', details: 'Instalment Payment', debit: null, credit: 1000.00, balance: 28009.18},
  {date: '31/05/2025', details: 'Interest accrued', debit: 136.93, credit: null, balance: 28146.11},
  {date: '30/06/2025', details: 'Interest accrued', debit: 186.73, credit: null, balance: 28332.84},
  {date: '24/07/2025', details: 'Interest accrued', debit: 149.38, credit: null, balance: 28482.22},
  {date: '24/07/2025', details: 'Instalment Payment', debit: null, credit: 1000.00, balance: 27482.22},
  {date: '31/07/2025', details: 'Interest accrued', debit: 42.75, credit: null, balance: 27524.97},
  {date: '31/08/2025', details: 'Interest accrued', debit: 189.32, credit: null, balance: 27714.29},
  {date: '26/09/2025', details: 'Interest accrued', debit: 158.79, credit: null, balance: 27873.08},
  {date: '26/09/2025', details: 'Instalment Payment', debit: null, credit: 1000.00, balance: 26873.08},
  {date: '30/09/2025', details: 'Interest accrued', debit: 23.89, credit: null, balance: 26896.97},
  {date: '31/10/2025', details: 'Interest accrued', debit: 185.13, credit: null, balance: 27082.09},
  {date: '29/11/2025', details: 'Interest accrued', debit: 173.18, credit: null, balance: 27255.27},
  {date: '29/11/2025', details: 'Instalment Payment', debit: null, credit: 1000.00, balance: 26255.27},
  {date: '30/11/2025', details: 'Interest accrued', debit: 5.83, credit: null, balance: 26261.11},
  {date: '31/12/2025', details: 'Interest accrued', debit: 180.87, credit: null, balance: 26441.98},
  {date: '01/01/2026', details: 'VAT Adjustment (15.5%)', debit: 108.26, credit: null, balance: 26550.24},
  {date: '31/01/2026', details: 'Interest accrued', debit: 181.62, credit: null, balance: 26731.85},
  {date: '28/02/2026', details: 'Interest accrued', debit: 164.04, credit: null, balance: 26895.89},
  {date: '28/02/2026', details: 'Instalment Payment', debit: null, credit: 500.00, balance: 26395.89},
  {date: '05/03/2026', details: 'Interest accrued', debit: 29.29, credit: null, balance: 26425.19},
  {date: '05/03/2026', details: 'Instalment Payment', debit: null, credit: 467.00, balance: 25958.19},
  {date: '31/03/2026', details: 'Interest accrued', debit: 149.98, credit: null, balance: 26108.17},
  {date: '30/04/2026', details: 'Interest accrued', debit: 173.05, credit: null, balance: 26281.22},
  {date: '30/04/2026', details: 'Instalment Payment', debit: null, credit: 500.00, balance: 25781.22},
  {date: '07/05/2026', details: 'Interest accrued', debit: 40.10, credit: null, balance: 25821.33},
];

const data = {
  standNum: '3034',
  standSize: '501 m2',
  clientName: 'Kundai Pauline Kaseke',
  clientContact: '+263774793918',
  stmtDate: '7 May 2026',
  propValue: '29,900.00',
  totalPaid: '6,467.00',
  monthlyInstalment: '466.03',
  loanStatus: 'On Track',
  revisedValue: '30,008.26',
  catchUp: '0.00',
  totalDebit: ledger.reduce((s, e) => s + (e.debit ?? 0), 0).toLocaleString('en-US', {minimumFractionDigits: 2, maximumFractionDigits: 2}),
  remainingBalance: '25,821.33',
  ledger,
};

export default function StatementPage2() {
  return <StatementLayout data={data} />;
}
