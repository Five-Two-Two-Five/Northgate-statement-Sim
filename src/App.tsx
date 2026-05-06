import {AnimatePresence, motion} from 'motion/react';
import {FileSpreadsheet, LayoutDashboard, Printer, Trash2} from 'lucide-react';
import {type ReactNode, useMemo, useState} from 'react';
import ExcelJS from 'exceljs';
import {
  AccountStatus,
  type ClientInfo,
  type ComplianceSnapshot,
  type InterestSnapshot,
  type LedgerEntry,
  type Payment,
  type SimulationConfig,
  type SimulationResult,
} from './types';

const DEFAULT_CLIENT: ClientInfo = {
  name: 'Rumbidzai Gadaga',
  standNum: '5034',
  standSize: 400,
  contact: '0779601234',
  propValue: 29900,
  startDate: '2025-04-22',
};

const DEFAULT_CONFIG: SimulationConfig = {
  stmtDate: '2026-05-05',
  annualRate: 8,
  vatRate: 15.5,
  vatDate: '2026-01-01',
  bookingFee: 0,
  loanMonths: 78,
};

const DEFAULT_PAYMENTS: Payment[] = [
  {id: '1', date: '2025-04-22', amount: 1000},
  {id: '2', date: '2025-05-09', amount: 1000},
  {id: '3', date: '2025-07-24', amount: 1000},
  {id: '4', date: '2025-09-26', amount: 1000},
  {id: '5', date: '2025-11-29', amount: 1000},
  {id: '6', date: '2026-02-28', amount: 500},
  {id: '7', date: '2026-03-05', amount: 467},
];

type Event =
  | {type: 'payment'; amount: number}
  | {type: 'vat'};

const formatMoney = (value: number) =>
  value.toLocaleString('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });

const parseISODate = (value: string) => new Date(`${value}T00:00:00`);

const toISODate = (date: Date) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

const formatDisplayDate = (value: string) => {
  const [year, month, day] = value.split('-');
  return `${day}/${month}/${year}`;
};

const buildAlignedDate = (year: number, month: number, day: number) => {
  const result = new Date(year, month, day);
  if (result.getDate() !== day) {
    return new Date(result.getFullYear(), result.getMonth(), 0);
  }
  return result;
};

const monthsElapsed = (startValue: string, statementValue: string) => {
  const startDate = parseISODate(startValue);
  const endDate = parseISODate(statementValue);
  const dueDay = startDate.getDate();

  let count = 0;
  // Start counting from 1 month after the start date
  let current = buildAlignedDate(startDate.getFullYear(), startDate.getMonth() + 1, dueDay);

  while (current <= endDate) {
    count += 1;
    current = buildAlignedDate(current.getFullYear(), current.getMonth() + 1, dueDay);
  }

  return count;
};

const getMonthLabel = (date: Date) =>
  date.toLocaleDateString('en-US', {
    month: 'short',
    year: 'numeric',
  });

const INTEREST_DAY_BASIS = 360;

const calculateMonthlyInstalment = (principal: number, annualRatePercent: number, loanMonths: number) => {
  if (principal <= 0 || loanMonths <= 0) {
    return null;
  }

  if (annualRatePercent === 0) {
    return Number((principal / loanMonths).toFixed(2));
  }

  const monthlyRate = annualRatePercent / 100 / 12;
  const growthFactor = Math.pow(1 + monthlyRate, loanMonths);
  const payment = principal * ((monthlyRate * growthFactor) / (growthFactor - 1));

  return Number(payment.toFixed(2));
};

export default function App() {
  const [client, setClient] = useState(DEFAULT_CLIENT);
  const [config, setConfig] = useState(DEFAULT_CONFIG);
  const [payments, setPayments] = useState<Payment[]>(DEFAULT_PAYMENTS);
  const [newPayment, setNewPayment] = useState({
    date: DEFAULT_CLIENT.startDate,
    amount: 1000,
  });

  const addPayment = () => {
    if (!newPayment.date || newPayment.amount <= 0) {
      return;
    }

    const payment: Payment = {
      id: crypto.randomUUID(),
      date: newPayment.date,
      amount: newPayment.amount,
    };

    setPayments((current) => [...current, payment].sort((left, right) => left.date.localeCompare(right.date)));
  };

  const removePayment = (id: string) => {
    setPayments((current) => current.filter((payment) => payment.id !== id));
  };

  const clearPayments = () => {
    setPayments([]);
  };

  const resetPayments = () => {
    setPayments(DEFAULT_PAYMENTS);
  };

  const exportToExcel = async () => {
    if (!result) return;

    const workbook = new ExcelJS.Workbook();
    const summarySheet = workbook.addWorksheet('Summary');
    const ledgerSheet = workbook.addWorksheet('Ledger');

    // Styling Constants
    const primaryBlue = '1E295B';
    const accentRed = 'D40000';
    const lightBlue = 'EBF0FF';

    // 1. SUMMARY SHEET SETUP
    summarySheet.getColumn('A').width = 35;
    summarySheet.getColumn('B').width = 30;

    // Header
    const titleCell = summarySheet.getCell('A1');
    titleCell.value = 'NORTHGATE ESTATES - ACCOUNT SIMULATION';
    titleCell.font = { name: 'Arial Black', size: 14, color: { argb: primaryBlue } };
    summarySheet.mergeCells('A1:B1');

    summarySheet.getCell('A2').value = 'Exported on:';
    summarySheet.getCell('B2').value = new Date().toLocaleString();

    // Section: Input Parameters
    const inputStart = 4;
    const inputHeader = summarySheet.getCell(`A${inputStart}`);
    inputHeader.value = 'INPUT PARAMETERS (EDITABLE)';
    inputHeader.font = { bold: true, color: { argb: 'FFFFFF' } };
    inputHeader.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: primaryBlue } };
    summarySheet.mergeCells(`A${inputStart}:B${inputStart}`);

    const inputs = [
      ['Client Name', client.name],
      ['Start Date', client.startDate], // B6
      ['Statement Date', config.stmtDate], // B7
      ['Original Property Value', client.propValue], // B8
      ['Annual Interest Rate %', config.annualRate / 100], // B9
      ['Loan Duration (Months)', config.loanMonths], // B10
      ['New VAT Rate %', config.vatRate / 100], // B11
      ['VAT Change Date', config.vatDate], // B12
    ];

    inputs.forEach((input, i) => {
      const row = summarySheet.getRow(inputStart + 1 + i);
      row.getCell(1).value = input[0];
      row.getCell(2).value = input[1];
      if (typeof input[1] === 'number') {
        if (input[0].includes('%')) {
          row.getCell(2).numFmt = '0.00%';
        } else {
          row.getCell(2).numFmt = '"$"#,##0.00';
        }
      }
      row.getCell(1).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'F9FAFB' } };
    });

    // Section: Live Calculations
    const calcStart = 14;
    const calcHeader = summarySheet.getCell(`A${calcStart}`);
    calcHeader.value = 'LIVE CALCULATIONS';
    calcHeader.font = { bold: true, color: { argb: 'FFFFFF' } };
    calcHeader.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: accentRed } };
    summarySheet.mergeCells(`A${calcStart}:B${calcStart}`);

    const calculations = [
      ['Monthly Instalment (M)', { formula: 'ROUND(PMT(B9/12, B10, -B8), 2)' }], // B15
      ['Instalments Due (N)', { formula: 'DATEDIF(B6, B7, "m")' }], // B16
      ['Expected Total (E = N * M)', { formula: 'B15 * B16' }], // B17
      ['Total Paid (P)', { formula: 'SUM(Ledger!D:D)' }], // B18
      ['Catch-up Amount (E - P)', { formula: 'MAX(0, B17 - B18)' }], // B19
      ['VAT Adjustment Amount', { formula: 'ROUND(((B8-SUMIFS(Ledger!D:D, Ledger!A:A, "<="&B6))/1.15) * (B11 - 0.15), 2)' }], // B20
      ['Revised Property Value', { formula: 'B8 + B20' }], // B21
      ['Remaining Balance', { formula: 'B21 + SUM(Ledger!C:C) - SUM(Ledger!D:D)' }], // B22
    ];

    calculations.forEach((calc, i) => {
      const row = summarySheet.getRow(calcStart + 1 + i);
      row.getCell(1).value = calc[0];
      row.getCell(2).value = calc[1];
      row.getCell(2).numFmt = '"$"#,##0.00';
      if (calc[0].includes('(N)')) row.getCell(2).numFmt = '0';
      row.getCell(1).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: lightBlue } };
      if (calc[0].includes('Catch-up')) {
        row.getCell(2).font = { bold: true, color: { argb: accentRed } };
      }
    });

    // 2. LEDGER SHEET SETUP
    ledgerSheet.columns = [
      { header: 'Date', key: 'date', width: 15 },
      { header: 'Details', key: 'details', width: 40 },
      { header: 'Debit (+)', key: 'debit', width: 18 },
      { header: 'Credit (-)', key: 'credit', width: 18 },
      { header: 'Running Balance', key: 'balance', width: 22 },
    ];

    // Style Ledger Header
    ledgerSheet.getRow(1).eachCell((cell) => {
      cell.font = { bold: true, color: { argb: 'FFFFFF' } };
      cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: primaryBlue } };
      cell.alignment = { horizontal: 'center' };
    });

    result.ledger.forEach((entry, idx) => {
      const rowNum = idx + 2;
      const row = ledgerSheet.addRow({
        date: entry.date,
        details: entry.details,
        debit: entry.debit ?? 0,
        credit: entry.credit ?? 0,
      });

      // Balance Formula
      if (idx === 0) {
        row.getCell(5).value = entry.balance;
      } else {
        row.getCell(5).value = { formula: `E${rowNum - 1}+C${rowNum}-D${rowNum}` };
      }

      // Formatting
      row.getCell(1).alignment = { horizontal: 'center' };
      row.getCell(3).numFmt = '"$"#,##0.00';
      row.getCell(4).numFmt = '"$"#,##0.00';
      row.getCell(5).numFmt = '"$"#,##0.00';
      row.getCell(5).font = { bold: true };

      // Zebra Striping
      if (idx % 2 === 0) {
        row.eachCell((cell) => {
          cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'F9FAFB' } };
        });
      }
    });

    // Generate and download file
    const buffer = await workbook.xlsx.writeBuffer();
    const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
    const url = window.URL.createObjectURL(blob);
    const anchor = document.createElement('a');
    anchor.href = url;
    anchor.download = `Northgate_Statement_${client.name.replace(/\s+/g, '_')}.xlsx`;
    anchor.click();
    window.URL.revokeObjectURL(url);
  };

  const result = useMemo<SimulationResult | null>(() => {
    const {propValue, startDate} = client;
    const {stmtDate, annualRate, vatRate, vatDate, bookingFee, loanMonths} = config;

    if (!startDate || !stmtDate || propValue <= 0 || loanMonths <= 0) {
      return null;
    }

    const start = parseISODate(startDate);
    const end = parseISODate(stmtDate);

    if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime()) || start > end) {
      return null;
    }

    const annualRateDecimal = annualRate / 100;
    const vatRateDecimal = vatRate / 100;
    const dailyRate = annualRateDecimal / INTEREST_DAY_BASIS;
    const dueDay = start.getDate();
    const minimumInstalment = calculateMonthlyInstalment(propValue, annualRate, loanMonths);
    const instalmentsDue = monthsElapsed(startDate, stmtDate);

    if (minimumInstalment === null) {
      return null;
    }

    let balance = propValue;
    let totalPaid = 0;
    let totalInterest = 0;
    let vatApplied = false;
    let accruedInterest = 0;

    const ledger: LedgerEntry[] = [
      {
        date: startDate,
        details: 'Property value',
        debit: null,
        credit: null,
        balance: propValue,
        type: 'opening',
      },
    ];

    if (bookingFee > 0) {
      balance = Number((balance - bookingFee).toFixed(2));
      ledger.push({
        date: startDate,
        details: 'Booking fee',
        debit: null,
        credit: bookingFee,
        balance,
        type: 'opening',
      });
    } else {
      ledger.push({
        date: startDate,
        details: 'BOOKING_FEE',
        debit: null,
        credit: 0,
        balance,
        type: 'opening',
      });
    }

    const eventMap: Record<string, Event[]> = {};
    payments
      .filter((payment) => payment.date >= startDate && payment.date <= stmtDate)
      .forEach((payment) => {
        eventMap[payment.date] ??= [];
        eventMap[payment.date].push({type: 'payment', amount: payment.amount});
      });

    if (vatDate && vatDate >= startDate && vatDate <= stmtDate) {
      eventMap[vatDate] ??= [];
      eventMap[vatDate].push({type: 'vat'});
    }

    const paidBeforeVat = payments
      .filter((payment) => payment.date < vatDate)
      .reduce((sum, payment) => sum + payment.amount, 0);
    const remainingPrincipalAtVat = Math.max(0, propValue - paidBeforeVat);
    const vatAdjustment =
      vatDate && vatDate >= startDate && vatDate <= stmtDate
        ? Number(((remainingPrincipalAtVat / 1.15) * (vatRateDecimal - 0.15)).toFixed(2))
        : 0;

    const monthlyInterestHistory: InterestSnapshot[] = [];
    const complianceHistory: ComplianceSnapshot[] = [];
    const instalmentPaidDates: Record<number, string> = {};

    let currentDate = start;

    while (currentDate <= end) {
      const dateKey = toISODate(currentDate);

      if (eventMap[dateKey]) {
        for (const event of eventMap[dateKey]) {
          if (event.type === 'payment') {
            balance = Number((balance - event.amount).toFixed(2));
            totalPaid += event.amount;

            ledger.push({
              date: dateKey,
              details: 'Instalment Payment',
              debit: null,
              credit: event.amount,
              balance,
              type: 'payment',
            });

            for (let instalmentNumber = 1; instalmentNumber <= 240; instalmentNumber += 1) {
              if (!instalmentPaidDates[instalmentNumber]) {
                const requiredPaid = Number((instalmentNumber * minimumInstalment).toFixed(2));
                if (totalPaid >= requiredPaid) {
                  instalmentPaidDates[instalmentNumber] = dateKey;
                }
              }
            }
          }

          if (event.type === 'vat' && !vatApplied) {
            balance = Number((balance + vatAdjustment).toFixed(2));
            ledger.push({
              date: dateKey,
              details: `VAT Adjustment (${(vatRateDecimal * 100).toFixed(1)}%)`,
              debit: vatAdjustment,
              credit: null,
              balance,
              type: 'special',
            });
            vatApplied = true;
          }
        }
      }

      if (vatDate === dateKey && !vatApplied) {
        balance = Number((balance + vatAdjustment).toFixed(2));
        ledger.push({
          date: dateKey,
          details: `VAT Adjustment (${(vatRateDecimal * 100).toFixed(1)}%)`,
          debit: vatAdjustment,
          credit: null,
          balance,
          type: 'special',
        });
        vatApplied = true;
      }

      accruedInterest += balance * dailyRate;

      const nextDay = new Date(currentDate.getFullYear(), currentDate.getMonth(), currentDate.getDate() + 1);
      const isMonthEnd = nextDay.getMonth() !== currentDate.getMonth();
      const isStatementDay = currentDate.getTime() === end.getTime();

      if (isMonthEnd || isStatementDay) {
        const roundedInterest = Number(accruedInterest.toFixed(2));
        if (roundedInterest > 0) {
          balance = Number((balance + roundedInterest).toFixed(2));
          totalInterest += roundedInterest;
          ledger.push({
            date: dateKey,
            details: 'Interest accrued',
            debit: roundedInterest,
            credit: null,
            balance,
            type: 'interest',
          });
          monthlyInterestHistory.push({
            month: getMonthLabel(currentDate),
            interest: roundedInterest,
            closingBalance: balance,
          });
        }
        accruedInterest = 0;
      }

      currentDate = nextDay;
    }

    for (let instalmentNumber = 1; instalmentNumber <= instalmentsDue; instalmentNumber += 1) {
      // First instalment (n=1) is due 1 month after the start date
      const dueDate = buildAlignedDate(start.getFullYear(), start.getMonth() + instalmentNumber, dueDay);
      const dueDateKey = toISODate(dueDate);
      const expectedPaid = Number((instalmentNumber * minimumInstalment).toFixed(2));
      const paidByDueDate = payments
        .filter((payment) => payment.date <= dueDateKey)
        .reduce((sum, payment) => sum + payment.amount, 0);
      const catchUp = Number(Math.max(0, expectedPaid - paidByDueDate).toFixed(2));

      complianceHistory.push({
        date: dueDateKey,
        n: instalmentNumber,
        e: expectedPaid,
        p: paidByDueDate,
        c: catchUp,
        paidDate: instalmentPaidDates[instalmentNumber],
        status: catchUp === 0 ? AccountStatus.ON_TRACK : AccountStatus.BEHIND,
      });
    }

    const expectedTotal = Number((instalmentsDue * minimumInstalment).toFixed(2));
    const catchUpAmount = Number(Math.max(0, expectedTotal - totalPaid).toFixed(2));
    const isPaidOff = balance <= 0;
    const isOnTrack = catchUpAmount === 0;

    let status = AccountStatus.BEHIND;
    if (isPaidOff) {
      status = AccountStatus.PAID_OFF;
    } else if (isOnTrack) {
      status = AccountStatus.ON_TRACK;
    }

    return {
      ledger,
      complianceHistory,
      monthlyInterestHistory,
      totalPaid,
      totalInterest,
      totalDebit: ledger.reduce((sum, entry) => sum + (entry.debit ?? 0), 0),
      remainingBalance: Math.max(0, balance),
      minMonthlyInstalment: minimumInstalment,
      instalmentsDue,
      expectedTotal,
      catchUpAmount,
      status,
      percentagePaid: Math.max(0, Math.min(100, (totalPaid / propValue) * 100)),
      revisedValue: Number((propValue + vatAdjustment).toFixed(2)),
    };
  }, [client, config, payments]);

  return (
    <div className="min-h-screen bg-[#f7f7f5] text-[#1a1a18] selection:bg-[#1e295b]/20">
      <header className="sticky top-0 z-50 flex items-center gap-4 border-b-2 border-[#d40000] bg-[#1e295b] px-6 py-4 text-white no-print">
        <div className="flex h-8 w-8 items-center justify-center rounded-sm bg-white font-bold text-[#1e295b] shadow-sm">
          N
        </div>
        <div>
          <h1 className="text-sm font-black uppercase tracking-tight">Northgate Estates</h1>
          <p className="text-[9px] font-bold uppercase tracking-[0.3em] opacity-80">Document Simulator</p>
        </div>
        <div className="ml-auto rounded border border-white/30 px-2 py-0.5 text-[10px] font-bold uppercase tracking-widest">
          PDF Match Pro
        </div>
      </header>

      <div className="grid min-h-[calc(100vh-68px)] grid-cols-[360px_1fr] print:block">
        <aside className="sticky top-[68px] max-h-[calc(100vh-68px)] overflow-y-auto border-r border-gray-200 bg-white p-6 shadow-sm no-print">
          <Section title="Property Context">
            <Field label="Client Name">
              <input value={client.name} onChange={(event) => setClient({...client, name: event.target.value})} />
            </Field>
            <div className="grid grid-cols-2 gap-3">
              <Field label="Stand No.">
                <input
                  value={client.standNum}
                  onChange={(event) => setClient({...client, standNum: event.target.value})}
                />
              </Field>
              <Field label="Size (m2)">
                <input
                  type="number"
                  value={client.standSize}
                  onChange={(event) => setClient({...client, standSize: Number(event.target.value)})}
                />
              </Field>
            </div>
            <Field label="Client Contact">
              <input value={client.contact} onChange={(event) => setClient({...client, contact: event.target.value})} />
            </Field>
            <div className="grid grid-cols-2 gap-3">
              <Field label="Original Value">
                <input
                  type="number"
                  value={client.propValue}
                  onChange={(event) => setClient({...client, propValue: Number(event.target.value)})}
                />
              </Field>
              <Field label="Loan Months">
                <input
                  type="number"
                  min="1"
                  value={config.loanMonths}
                  onChange={(event) => setConfig({...config, loanMonths: Number(event.target.value)})}
                />
              </Field>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <Field label="Start Date">
                <input
                  type="date"
                  value={client.startDate}
                  onChange={(event) => {
                    const startDate = event.target.value;
                    setClient({...client, startDate});
                    setNewPayment((current) => ({...current, date: startDate}));
                  }}
                />
              </Field>
              <Field label="Statement Date">
                <input
                  type="date"
                  value={config.stmtDate}
                  onChange={(event) => setConfig({...config, stmtDate: event.target.value})}
                />
              </Field>
            </div>
          </Section>

          <Section title="Financial Logic">
            <div className="grid grid-cols-2 gap-3">
              <Field label="Interest %">
                <input
                  type="number"
                  step="0.01"
                  value={config.annualRate}
                  onChange={(event) => setConfig({...config, annualRate: Number(event.target.value)})}
                />
              </Field>
              <Field label="VAT %">
                <input
                  type="number"
                  step="0.1"
                  value={config.vatRate}
                  onChange={(event) => setConfig({...config, vatRate: Number(event.target.value)})}
                />
              </Field>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <Field label="VAT Date">
                <input
                  type="date"
                  value={config.vatDate}
                  onChange={(event) => setConfig({...config, vatDate: event.target.value})}
                />
              </Field>
              <Field label="Booking Fee">
                <input
                  type="number"
                  value={config.bookingFee}
                  onChange={(event) => setConfig({...config, bookingFee: Number(event.target.value)})}
                />
              </Field>
            </div>
          </Section>

          <Section title="Payment Capture">
            <div className="rounded border border-dashed border-gray-200 bg-gray-50 p-3">
              <h4 className="mb-3 text-[10px] font-bold uppercase text-gray-500">Quick Add Payment</h4>
              <div className="mb-3 grid grid-cols-2 gap-3">
                <Field label="Date">
                  <input
                    type="date"
                    value={newPayment.date}
                    onChange={(event) => setNewPayment({...newPayment, date: event.target.value})}
                  />
                </Field>
                <Field label="Amount">
                  <input
                    type="number"
                    value={newPayment.amount}
                    onChange={(event) => setNewPayment({...newPayment, amount: Number(event.target.value)})}
                  />
                </Field>
              </div>
              <button
                onClick={addPayment}
                className="w-full rounded bg-[#1e295b] py-1.5 text-[10px] font-bold text-white transition-all hover:bg-blue-800"
              >
                ADD ENTRY
              </button>
            </div>
          </Section>

          <Section title="Active Payments">
            <div className="mb-3 flex items-center justify-between">
              <h4 className="text-[10px] font-bold uppercase tracking-widest text-[#1e295b]">
                Entry Log ({payments.length})
              </h4>
              <button
                onClick={clearPayments}
                className="text-[10px] font-bold uppercase tracking-widest text-red-600 hover:underline"
              >
                Clear All
              </button>
            </div>

            <div className="max-h-[220px] space-y-2 overflow-y-auto pr-1">
              <AnimatePresence>
                {payments.map((payment, index) => (
                  <motion.div
                    key={payment.id}
                    initial={{opacity: 0, x: -10}}
                    animate={{opacity: 1, x: 0}}
                    exit={{opacity: 0, x: 10}}
                    className="group flex items-center gap-2 border-b border-gray-100 py-1.5"
                  >
                    <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-blue-50 text-[10px] font-bold text-[#1e295b]">
                      {index + 1}
                    </span>
                    <span className="flex-1 font-mono text-[11px] text-gray-600">{formatDisplayDate(payment.date)}</span>
                    <span className="font-mono text-[11px] font-bold text-blue-900">${formatMoney(payment.amount)}</span>
                    <button
                      onClick={() => removePayment(payment.id)}
                      className="rounded p-1 text-red-600 opacity-0 transition-opacity hover:bg-red-50 group-hover:opacity-100"
                      aria-label={`Remove payment ${index + 1}`}
                    >
                      <Trash2 size={12} />
                    </button>
                  </motion.div>
                ))}
              </AnimatePresence>
              {payments.length === 0 ? (
                <p className="py-4 text-center text-[10px] italic text-gray-400">No entries recorded</p>
              ) : null}
            </div>
          </Section>

          <div className="space-y-3 pt-6">
            <button
              onClick={exportToExcel}
              className="flex w-full items-center justify-center gap-2 rounded bg-[#1e295b] py-3 text-xs font-bold uppercase tracking-widest text-white shadow-lg transition-all hover:bg-[#2a3a7b] hover:shadow-blue-200"
            >
              <FileSpreadsheet size={16} /> Export to Excel
            </button>
            <button
              onClick={() => window.print()}
              className="flex w-full items-center justify-center gap-2 rounded bg-[#d40000] py-3 text-xs font-bold uppercase tracking-widest text-white shadow-lg transition-all hover:shadow-red-200"
            >
              <Printer size={16} /> Export Statement
            </button>
            <button
              onClick={resetPayments}
              className="w-full rounded border border-red-200 bg-white py-1.5 text-[10px] font-bold text-red-600 transition-all hover:bg-red-50"
            >
              FACTORY RESET PAYMENTS
            </button>
          </div>
        </aside>

        <main className="min-h-full bg-white p-12 print:p-0">
          <div className="mx-auto max-w-[820px] print:max-w-none">
            {result ? (
              <div className="space-y-10">
                <div className="flex items-start justify-between">
                  <div className="flex flex-col items-center">
                    <div className="relative mb-4">
                      <div className="flex h-20 w-20 rotate-45 items-center justify-center border-[3px] border-[#1e295b] bg-white">
                        <div className="flex -rotate-45 flex-col items-center">
                          <span className="mb-0.5 text-3xl font-black leading-none text-[#1e295b]">N</span>
                          <div className="mt-1 h-1.5 w-1.5 rotate-45 bg-[#1e295b]" />
                        </div>
                      </div>
                    </div>
                    <div className="text-center">
                      <h2 className="text-xs font-black uppercase tracking-[0.25em] text-[#1e295b]">Northgate</h2>
                      <p className="-mt-0.5 text-[9px] font-bold uppercase tracking-[0.1em] text-[#1e295b]">Estates</p>
                      <p className="mt-2 font-serif text-[11px] italic font-medium text-[#1e295b]">Beyond a home!</p>
                    </div>
                  </div>

                  <div className="mt-6 space-y-1 text-right">
                    <p className="mb-4 text-[13px] font-bold text-[#d40000]">
                      Account Statement as of:{' '}
                      {parseISODate(config.stmtDate).toLocaleDateString('en-GB', {
                        day: 'numeric',
                        month: 'long',
                        year: 'numeric',
                      })}
                    </p>
                    <div className="space-y-1.5">
                      <PDFInfoLine label="Stand Number" value={client.standNum} />
                      <PDFInfoLine label="Stand Size" value={`${client.standSize} m2`} />
                      <PDFInfoLine label="Client Name" value={client.name} />
                      <PDFInfoLine label="Client Contact" value={client.contact} />
                    </div>
                  </div>
                </div>

                <div className="overflow-hidden">
                  <div className="grid grid-cols-4 border border-black text-[10px] font-bold">
                    <div className="border-r border-black p-2">Original Property Value (Incl. VAT)</div>
                    <div className="border-r border-black p-2">Total Amount Paid (USD)</div>
                    <div className="border-r border-black p-2">Monthly Instalment (Minimum)</div>
                    <div className="p-2">Loan Status</div>
                  </div>
                  <div className="grid grid-cols-4 border border-t-0 border-black text-[11px] font-bold">
                    <div className="border-r border-black p-2">{formatMoney(client.propValue)}</div>
                    <div className="border-r border-black p-2">{formatMoney(result.totalPaid)}</div>
                    <div className="border-r border-black p-2">{formatMoney(result.minMonthlyInstalment)}</div>
                    <div className="p-2">{result.status}</div>
                  </div>
                  <div className="grid grid-cols-4 border border-t-0 border-black text-[11px] font-bold">
                    <div className="border-r border-black bg-blue-50 p-2">Revised Property Value (USD)</div>
                    <div className="border-r border-black p-2">{formatMoney(result.revisedValue)}</div>
                    <div className="border-r border-black bg-blue-50 p-2">Catch-up Amount (C)</div>
                    <div className="p-2 text-red-600">{formatMoney(result.catchUpAmount)}</div>
                  </div>
                </div>

                <div className="overflow-hidden border border-black bg-white">
                  <table className="w-full border-collapse text-[11px]">
                    <thead>
                      <tr className="border-b border-black font-bold">
                        <th className="w-24 border-r border-black p-2 text-center">Date</th>
                        <th className="border-r border-black p-2 text-left">Details</th>
                        <th className="w-24 border-r border-black p-2 text-right">Debit (USD)</th>
                        <th className="w-24 border-r border-black p-2 text-right">Credit (USD)</th>
                        <th className="w-32 p-2 text-right">Running Balance</th>
                      </tr>
                    </thead>
                    <tbody>
                      {result.ledger.map((row, index) => (
                        <tr key={`${row.date}-${row.details}-${index}`} className="border-b border-black/10 last:border-b-0">
                          <td className="whitespace-nowrap border-r border-black/10 p-2 text-center">
                            {formatDisplayDate(row.date)}
                          </td>
                          <td className="border-r border-black/10 p-2">{row.details}</td>
                          <td className="border-r border-black/10 p-2 text-right font-mono">
                            {row.debit !== null ? formatMoney(row.debit) : '-'}
                          </td>
                          <td className="border-r border-black/10 p-2 text-right font-mono">
                            {row.credit !== null ? formatMoney(row.credit) : '-'}
                          </td>
                          <td className="p-2 text-right font-mono font-bold">{formatMoney(row.balance)}</td>
                        </tr>
                      ))}
                    </tbody>
                    <tfoot>
                      <tr className="border-t border-black bg-gray-50 font-bold">
                        <td colSpan={2} className="border-r border-black p-2 text-center text-[10px] uppercase tracking-widest">
                          Total Debit (USD)
                        </td>
                        <td className="border-r border-black p-2 text-right font-mono">
                          {formatMoney(result.totalDebit)}
                        </td>
                        <td className="border-r border-black p-2"></td>
                        <td className="p-2"></td>
                      </tr>
                    </tfoot>
                  </table>
                </div>

                <div className="flex flex-col items-center py-6">
                  <div className="w-full max-w-[420px] border-2 border-black shadow-sm">
                    <div className="border-b-2 border-black bg-gray-50 p-2.5 text-center text-[11px] font-black uppercase tracking-[0.2em]">
                      Amount Remaining (USD)
                    </div>
                    <div className="p-6 text-center font-mono text-3xl font-black tracking-tighter">
                      {formatMoney(result.remainingBalance)}
                    </div>
                  </div>
                </div>

                <div className="no-break flex items-center justify-end gap-3 border-t border-gray-100 pt-12">
                  <span className="text-[10px] font-black uppercase tracking-widest text-[#1e295b]">A development by</span>
                  <div className="flex items-center gap-1.5">
                    <span className="text-base font-black italic tracking-tighter text-[#1e295b]">DAT VEST</span>
                    <div className="h-2 w-2 animate-pulse rounded-full bg-red-600 shadow-sm shadow-red-200" />
                  </div>
                </div>

                <div className="mt-10 border-t-4 border-double border-gray-200 pt-20 print:break-before-page">
                  <div className="mb-8 flex items-center gap-4">
                    <div className="flex h-12 w-12 items-center justify-center rounded bg-[#1e295b] font-bold text-white">
                      N
                    </div>
                    <div>
                      <h2 className="text-xl font-black uppercase tracking-tight text-[#1e295b]">
                        Calculation Breakdown
                      </h2>
                      <p className="text-[10px] font-bold uppercase tracking-widest text-gray-500">
                        Document Audit Trail and Financial Logic
                      </p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 gap-6">
                    <div className="grid grid-cols-2 gap-4">
                      <BreakdownCard
                        title="M - Min. Monthly Instalment"
                        formula="P x ((r x (1 + r)^n) / ((1 + r)^n - 1))"
                        logic="Standard amortized payment using original property value, monthly rate, and manual loan months."
                        result={`$${formatMoney(result.minMonthlyInstalment)}`}
                      />
                      <BreakdownCard
                        title="N - Instalments Due"
                        formula="Count(due-day milestones between start and statement date)"
                        logic={`Due dates follow the ${dueDaySuffix(client.startDate)} day of each month from ${formatDisplayDate(
                          client.startDate,
                        )}.`}
                        result={`${result.instalmentsDue}`}
                      />
                      <BreakdownCard
                        title="E - Expected Total"
                        formula="N x M"
                        logic="The minimum cumulative amount that should have been paid by the statement date."
                        result={`$${formatMoney(result.expectedTotal)}`}
                      />
                      <BreakdownCard
                        title="P - Total Paid"
                        formula="Sum(approved payments)"
                        logic="Aggregate of all recorded instalment payments captured in the schedule."
                        result={`$${formatMoney(result.totalPaid)}`}
                      />
                    </div>

                    <div className="rounded-lg bg-[#1e295b] p-6 text-white shadow-inner">
                      <div className="flex items-center justify-between">
                        <div>
                          <h4 className="mb-1 text-[10px] font-bold uppercase tracking-[0.2em] opacity-70">
                            C - Catch-up Requirement
                          </h4>
                          <p className="mb-2 text-xs italic opacity-60">C = max(0, E - P)</p>
                          <p className="max-w-md text-[11px] leading-relaxed">
                            This figure shows the immediate shortfall needed to bring the account back into compliance.
                          </p>
                        </div>
                        <div className="text-right">
                          <span className="font-mono text-4xl font-black tracking-tighter">
                            ${formatMoney(result.catchUpAmount)}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="mt-6 overflow-hidden border border-black">
                      <div className="bg-[#1e295b] p-2.5 text-center text-[10px] font-black uppercase tracking-[0.2em] text-white">
                        Compliance Audit Trail - Instalment Log
                      </div>
                      <table className="w-full border-collapse bg-white text-left text-[11px]">
                        <thead className="border-b border-black bg-gray-100 font-bold">
                          <tr>
                            <th className="border-r border-black/10 p-2">Due Date</th>
                            <th className="border-r border-black/10 p-2 text-center">N</th>
                            <th className="border-r border-black/10 p-2 text-right">E (Expected)</th>
                            <th className="border-r border-black/10 p-2 text-right">P (Paid)</th>
                            <th className="border-r border-black/10 p-2 text-right">C (Catch-up)</th>
                            <th className="border-r border-black/10 p-2 text-center">Date Paid</th>
                            <th className="p-2 text-center">Status</th>
                          </tr>
                        </thead>
                        <tbody>
                          {result.complianceHistory.map((snapshot, index) => (
                            <tr key={`${snapshot.date}-${index}`} className="border-b border-black/5 transition-colors hover:bg-blue-50/30">
                              <td className="border-r border-black/10 p-2 text-center font-mono">
                                {formatDisplayDate(snapshot.date)}
                              </td>
                              <td className="border-r border-black/10 p-2 text-center font-bold text-[#1e295b]">
                                {snapshot.n}
                              </td>
                              <td className="border-r border-black/10 p-2 text-right font-mono">
                                ${formatMoney(snapshot.e)}
                              </td>
                              <td className="border-r border-black/10 p-2 text-right font-mono text-blue-800">
                                ${formatMoney(snapshot.p)}
                              </td>
                              <td
                                className={`border-r border-black/10 p-2 text-right font-mono font-bold ${
                                  snapshot.c > 0 ? 'text-red-600' : 'text-green-600'
                                }`}
                              >
                                ${formatMoney(snapshot.c)}
                              </td>
                              <td className="border-r border-black/10 p-2 text-center font-mono text-gray-500">
                                {snapshot.paidDate ? formatDisplayDate(snapshot.paidDate) : '-'}
                              </td>
                              <td className="p-2 text-center">
                                <span
                                  className={`rounded border px-1.5 py-0.5 text-[9px] font-bold uppercase ${
                                    snapshot.status === AccountStatus.ON_TRACK
                                      ? 'border-green-200 bg-green-50 text-green-700'
                                      : 'border-red-200 bg-red-50 text-red-700'
                                  }`}
                                >
                                  {snapshot.status === AccountStatus.ON_TRACK ? 'O/T' : 'BHD'}
                                </span>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                      <div className="border-t border-black/5 bg-gray-50 p-3 text-center text-[10px] italic text-gray-400">
                        * Calculations refresh instantly as statement inputs and payments change.
                      </div>
                    </div>

                    <div className="mt-6 overflow-hidden border border-black">
                      <div className="bg-[#1e295b] p-2.5 text-center text-[10px] font-black uppercase tracking-[0.2em] text-white">
                        Monthly Interest Accrual Summary
                      </div>
                      <table className="w-full border-collapse bg-white text-left text-[11px] text-gray-700">
                        <thead className="border-b border-black bg-gray-100 font-bold text-gray-900">
                          <tr>
                            <th className="border-r border-black/10 p-2">Period (Month-End)</th>
                            <th className="border-r border-black/10 p-2 text-right">Interest Accrued</th>
                            <th className="p-2 text-right">Running Balance</th>
                          </tr>
                        </thead>
                        <tbody>
                          {result.monthlyInterestHistory.map((snapshot, index) => (
                            <tr key={`${snapshot.month}-${index}`} className="border-b border-black/5">
                              <td className="border-r border-black/10 p-2 font-bold">{snapshot.month}</td>
                              <td className="border-r border-black/10 p-2 text-right font-mono text-red-600">
                                ${formatMoney(snapshot.interest)}
                              </td>
                              <td className="p-2 text-right font-mono font-bold">
                                ${formatMoney(snapshot.closingBalance)}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                        <tfoot className="border-t border-black bg-gray-50 font-bold">
                          <tr>
                            <td className="border-r border-black/10 p-2">TOTAL INTEREST</td>
                            <td className="border-r border-black/10 p-2 text-right font-mono text-red-600">
                              ${formatMoney(result.totalInterest)}
                            </td>
                            <td className="p-2 text-right font-mono">${formatMoney(result.remainingBalance)}</td>
                          </tr>
                        </tfoot>
                      </table>
                    </div>

                    <div className="grid grid-cols-1 gap-4">
                      <div className="rounded-sm border border-black p-4">
                        <h4 className="mb-3 text-xs font-black uppercase tracking-widest text-[#1e295b]">
                          VAT Adjustment Logic
                        </h4>
                        <div className="space-y-2 text-[11px] leading-relaxed">
                          <p>For active accounts during a VAT rate change, the remaining principal is adjusted using:</p>
                          <code className="block border border-dashed bg-gray-50 p-2 font-bold text-blue-900">
                            VAT Adjustment = ((Remaining Principal / 1.15) x (New VAT Rate - 15%))
                          </code>
                          <p className="pt-2">
                            Principal at Adjustment:{' '}
                            <span className="font-bold underline">${formatMoney(remainingPrincipal(client, config, payments))}</span>
                          </p>
                          <p>
                            Adjustment Applied:{' '}
                            <span className="font-bold text-red-600">${formatMoney(result.revisedValue - client.propValue)}</span>
                          </p>
                        </div>
                      </div>

                      <div className="rounded-sm border border-black p-4">
                        <h4 className="mb-3 text-xs font-black uppercase tracking-widest text-[#1e295b]">
                          Interest Methodology
                        </h4>
                        <div className="space-y-2 text-[11px] leading-relaxed">
                          <p>Interest follows the daily reducing balance method:</p>
                          <ul className="list-disc pl-5">
                            <li>Closing Balance (day x) x (system rate / 360) = daily interest.</li>
                            <li>Daily interest accrues through the month and is capitalised at month-end.</li>
                            <li>Payments reduce principal immediately, lowering future interest exposure.</li>
                          </ul>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="mt-12 text-center text-[9px] font-bold uppercase tracking-widest text-gray-400">
                    Document ends.
                  </div>
                </div>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-32 text-gray-300">
                <LayoutDashboard size={64} className="mb-4 opacity-10" />
                <p className="text-xs font-bold uppercase tracking-widest">Awaiting Simulation Parameters</p>
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}

function Section({title, children}: {title: string; children: ReactNode}) {
  return (
    <div className="mb-8">
      <h3 className="mb-4 border-b-2 border-blue-50 pb-2 text-[10px] font-black uppercase tracking-[0.2em] text-[#1e295b]">
        {title}
      </h3>
      <div className="space-y-4">{children}</div>
    </div>
  );
}

function Field({label, children}: {label: string; children: ReactNode}) {
  return (
    <div className="space-y-1">
      <label className="block text-[10px] font-bold uppercase tracking-wider text-gray-400">{label}</label>
      <div className="[&>input]:w-full [&>input]:rounded [&>input]:border [&>input]:border-gray-200 [&>input]:bg-gray-50 [&>input]:px-3 [&>input]:py-1.5 [&>input]:text-xs [&>input]:font-medium [&>input]:transition-all [&>input]:focus:border-[#1e295b] [&>input]:focus:outline-none [&>input]:focus:ring-2 [&>input]:focus:ring-blue-100">
        {children}
      </div>
    </div>
  );
}

function PDFInfoLine({label, value}: {label: string; value: string}) {
  return (
    <div className="flex items-baseline justify-end gap-10 text-[11px]">
      <span className="min-w-[120px] whitespace-nowrap text-right font-bold text-gray-900">{label}:</span>
      <span className="min-w-[120px] text-left font-medium text-gray-700">{value}</span>
    </div>
  );
}

function BreakdownCard({
  title,
  formula,
  logic,
  result,
}: {
  title: string;
  formula: string;
  logic: string;
  result: string;
}) {
  return (
    <div className="rounded-sm border border-black bg-white p-4 transition-shadow hover:shadow-md">
      <h4 className="mb-1 text-[10px] font-black uppercase tracking-widest text-gray-400">{title}</h4>
      <div className="mb-2 font-mono text-xl font-black text-[#1e295b]">{result}</div>
      <div className="mt-4 space-y-1 border-t border-gray-100 pt-4">
        <p className="text-[10px] font-mono text-gray-400">Formula: {formula}</p>
        <p className="text-[11px] leading-tight text-gray-600">{logic}</p>
      </div>
    </div>
  );
}

function dueDaySuffix(startDate: string) {
  const day = parseISODate(startDate).getDate();
  const mod10 = day % 10;
  const mod100 = day % 100;

  if (mod10 === 1 && mod100 !== 11) return `${day}st`;
  if (mod10 === 2 && mod100 !== 12) return `${day}nd`;
  if (mod10 === 3 && mod100 !== 13) return `${day}rd`;
  return `${day}th`;
}

function remainingPrincipal(client: ClientInfo, config: SimulationConfig, payments: Payment[]) {
  const paidBeforeVat = payments
    .filter((payment) => payment.date < config.vatDate)
    .reduce((sum, payment) => sum + payment.amount, 0);

  return Math.max(0, client.propValue - paidBeforeVat);
}
