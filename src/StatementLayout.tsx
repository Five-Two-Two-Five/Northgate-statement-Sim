import {Link} from 'react-router-dom';

const formatMoney = (value: number) =>
  value.toLocaleString('en-US', {minimumFractionDigits: 2, maximumFractionDigits: 2});

function InfoLine({label, value}: {label: string; value: string}) {
  return (
    <div className="flex items-baseline justify-end gap-10 text-[11px]">
      <span className="min-w-[120px] whitespace-nowrap text-right font-bold text-gray-900">{label}:</span>
      <span className="min-w-[120px] text-left font-medium text-gray-700">{value}</span>
    </div>
  );
}

function Section({title, children}: {title: string; children: React.ReactNode}) {
  return (
    <div className="mb-8">
      <h3 className="mb-4 border-b-2 border-blue-50 pb-2 text-[10px] font-black uppercase tracking-[0.2em] text-[#1e295b]">
        {title}
      </h3>
      <div className="space-y-4">{children}</div>
    </div>
  );
}

function Field({label, value}: {label: string; value: string}) {
  return (
    <div className="space-y-1">
      <label className="block text-[10px] font-bold uppercase tracking-wider text-gray-400">{label}</label>
      <div className="rounded border border-gray-200 bg-gray-50 px-3 py-1.5 text-xs font-medium">{value}</div>
    </div>
  );
}

interface LedgerRow {
  date: string;
  details: string;
  debit: number | null;
  credit: number | null;
  balance: number;
}

interface StatementData {
  standNum: string;
  standSize: string;
  clientName: string;
  clientContact: string;
  stmtDate: string;
  propValue: string;
  totalPaid: string;
  monthlyInstalment: string;
  loanStatus: string;
  revisedValue: string;
  catchUp: string;
  totalDebit: string;
  remainingBalance: string;
  ledger: LedgerRow[];
}

export default function StatementLayout({data}: {data: StatementData}) {
  return (
    <div className="min-h-screen bg-[#f7f7f5] text-[#1a1a18] selection:bg-[#1e295b]/20">
      <header className="sticky top-0 z-50 flex items-center gap-4 border-b-2 border-[#d40000] bg-[#1e295b] px-6 py-4 text-white no-print">
        <div className="flex h-8 w-8 items-center justify-center rounded-sm bg-white font-bold text-[#1e295b] shadow-sm">N</div>
        <div>
          <h1 className="text-sm font-black uppercase tracking-tight">Northgate Estates</h1>
          <p className="text-[9px] font-bold uppercase tracking-[0.3em] opacity-80">Document Simulator</p>
        </div>
        <div className="ml-auto flex items-center gap-3">
          <Link
            to="/"
            className="rounded border border-white/30 px-2 py-0.5 text-[10px] font-bold uppercase tracking-widest transition-colors hover:bg-white/10"
          >
            Simulator
          </Link>
          <Link
            to="/empty"
            className="rounded border border-white/30 px-2 py-0.5 text-[10px] font-bold uppercase tracking-widest transition-colors hover:bg-white/10"
          >
            Statement A
          </Link>
          <Link
            to="/statement-2"
            className="rounded border border-white/30 px-2 py-0.5 text-[10px] font-bold uppercase tracking-widest transition-colors hover:bg-white/10"
          >
            Statement B
          </Link>
          <div className="rounded border border-white/30 px-2 py-0.5 text-[10px] font-bold uppercase tracking-widest">
            PDF Match Pro
          </div>
        </div>
      </header>

      <div className="grid min-h-[calc(100vh-68px)] grid-cols-[360px_1fr] print:block">
      <aside className="sticky top-[68px] max-h-[calc(100vh-68px)] overflow-y-auto border-r border-gray-200 bg-white p-6 shadow-sm no-print">
        <Section title="Account Snapshot">
          <div className="space-y-3">
            <div className={`rounded border p-3 ${data.loanStatus === 'On Track' ? 'border-green-200 bg-green-50' : 'border-red-200 bg-red-50'}`}>
              <p className="text-[10px] font-bold uppercase tracking-wider text-gray-700">Status</p>
              <p className={`text-sm font-black ${data.loanStatus === 'On Track' ? 'text-green-800' : 'text-red-800'}`}>{data.loanStatus}</p>
            </div>
            <div className="rounded border border-blue-200 bg-blue-50 p-3">
              <p className="text-[10px] font-bold uppercase tracking-wider text-blue-700">Remaining</p>
              <p className="text-sm font-black text-blue-800">${data.remainingBalance}</p>
            </div>
            <div className="rounded border border-gray-200 bg-gray-50 p-3">
              <p className="text-[10px] font-bold uppercase tracking-wider text-gray-700">Total Paid</p>
              <p className="text-sm font-black text-gray-800">${data.totalPaid}</p>
            </div>
          </div>
        </Section>

        <Section title="Property Context">
          <Field label="Stand Number" value={data.standNum} />
          <Field label="Stand Size" value={data.standSize} />
          <Field label="Client Name" value={data.clientName} />
          <Field label="Client Contact" value={data.clientContact} />
        </Section>

        <Section title="Financial Summary">
          <div className="space-y-2 text-[11px]">
            <div className="flex justify-between border-b border-gray-100 pb-1">
              <span className="text-gray-500">Original Value</span>
              <span className="font-bold">${data.propValue}</span>
            </div>
            <div className="flex justify-between border-b border-gray-100 pb-1">
              <span className="text-gray-500">Revised Value</span>
              <span className="font-bold">${data.revisedValue}</span>
            </div>
            <div className="flex justify-between border-b border-gray-100 pb-1">
              <span className="text-gray-500">Monthly Instalment</span>
              <span className="font-bold">${data.monthlyInstalment}</span>
            </div>
            <div className="flex justify-between border-b border-gray-100 pb-1">
              <span className="text-gray-500">Total Debit</span>
              <span className="font-bold text-red-600">${data.totalDebit}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">Catch-up</span>
              <span className={`font-bold ${data.catchUp === '0.00' ? 'text-green-600' : 'text-red-600'}`}>${data.catchUp}</span>
            </div>
          </div>
        </Section>

        <Section title="Export">
          <button className="w-full rounded bg-[#1e295b] py-2.5 text-[10px] font-bold uppercase tracking-widest text-white shadow transition-all hover:bg-[#2a3a7b]">
            Download PDF
          </button>
        </Section>
      </aside>

      <main className="min-h-full bg-white p-12 print:p-0">
        <div className="mx-auto max-w-[820px]">
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
                  Account Statement as of: {data.stmtDate}
                </p>
                <div className="space-y-1.5">
                  <InfoLine label="Stand Number" value={data.standNum} />
                  <InfoLine label="Stand Size" value={data.standSize} />
                  <InfoLine label="Client Name" value={data.clientName} />
                  <InfoLine label="Client Contact" value={data.clientContact} />
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
                <div className="border-r border-black p-2">${data.propValue}</div>
                <div className="border-r border-black p-2">${data.totalPaid}</div>
                <div className="border-r border-black p-2">${data.monthlyInstalment}</div>
                <div className="p-2">{data.loanStatus}</div>
              </div>
              <div className="grid grid-cols-4 border border-t-0 border-black text-[11px] font-bold">
                <div className="border-r border-black bg-blue-50 p-2">Revised Property Value (USD)</div>
                <div className="border-r border-black p-2">${data.revisedValue}</div>
                <div className="border-r border-black bg-blue-50 p-2">Catch-up Amount (C)</div>
                <div className="p-2 text-red-600">${data.catchUp}</div>
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
                  {data.ledger.map((row, index) => (
                    <tr key={index} className="border-b border-black/10 last:border-b-0">
                      <td className="whitespace-nowrap border-r border-black/10 p-2 text-center">{row.date}</td>
                      <td className="border-r border-black/10 p-2">{row.details}</td>
                      <td className="border-r border-black/10 p-2 text-right font-mono">
                        {row.debit !== null ? `$${formatMoney(row.debit)}` : '-'}
                      </td>
                      <td className="border-r border-black/10 p-2 text-right font-mono">
                        {row.credit !== null ? `$${formatMoney(row.credit)}` : '-'}
                      </td>
                      <td className="p-2 text-right font-mono font-bold">${formatMoney(row.balance)}</td>
                    </tr>
                  ))}
                </tbody>
                <tfoot>
                  <tr className="border-t border-black bg-gray-50 font-bold">
                    <td colSpan={2} className="border-r border-black p-2 text-center text-[10px] uppercase tracking-widest">
                      Total Debit (USD)
                    </td>
                    <td className="border-r border-black p-2 text-right font-mono">${data.totalDebit}</td>
                    <td className="border-r border-black p-2" />
                    <td className="p-2" />
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
                  ${data.remainingBalance}
                </div>
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 border-t border-gray-100 pt-12">
              <span className="text-[10px] font-black uppercase tracking-widest text-[#1e295b]">A development by</span>
              <div className="flex items-center gap-1.5">
                <span className="text-base font-black italic tracking-tighter text-[#1e295b]">DAT VEST</span>
                <div className="h-2 w-2 animate-pulse rounded-full bg-red-600 shadow-sm shadow-red-200" />
              </div>
            </div>
          </div>

          <div className="mt-12 text-center text-[9px] font-bold uppercase tracking-widest text-gray-400">
            Document ends.
          </div>
        </div>
      </main>
      </div>
    </div>
  );
}
