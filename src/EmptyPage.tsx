const formatMoney = (value: number) =>
  value.toLocaleString('en-US', {minimumFractionDigits: 2, maximumFractionDigits: 2});

const ledger = [
  {date: '21/05/2025', details: 'Property Value', debit: null, credit: null, balance: 43211.25},
  {date: '21/05/2025', details: 'BOOKING_FEE', debit: null, credit: 50.00, balance: 43161.25},
  {date: '31/05/2025', details: 'Interest accrued', debit: 95.91, credit: null, balance: 43257.16},
  {date: '19/06/2025', details: 'Interest accrued', debit: 182.24, credit: null, balance: 43439.40},
  {date: '19/06/2025', details: 'Instalment Payment', debit: null, credit: 15200.00, balance: 28239.40},
  {date: '30/06/2025', details: 'Interest accrued', debit: 69.03, credit: null, balance: 28308.43},
  {date: '14/07/2025', details: 'Interest accrued', debit: 87.86, credit: null, balance: 28396.29},
  {date: '14/07/2025', details: 'Instalment Payment', debit: null, credit: 700.00, balance: 27696.29},
  {date: '31/07/2025', details: 'Interest accrued', debit: 104.63, credit: null, balance: 27800.92},
  {date: '16/08/2025', details: 'Interest accrued', debit: 98.48, credit: null, balance: 27899.39},
  {date: '16/08/2025', details: 'Instalment Payment', debit: null, credit: 700.00, balance: 27199.39},
  {date: '31/08/2025', details: 'Interest accrued', debit: 90.66, credit: null, balance: 27290.06},
  {date: '19/09/2025', details: 'Interest accrued', debit: 114.84, credit: null, balance: 27404.90},
  {date: '19/09/2025', details: 'Instalment Payment', debit: null, credit: 700.00, balance: 26704.90},
  {date: '30/09/2025', details: 'Interest accrued', debit: 65.28, credit: null, balance: 26770.18},
  {date: '17/10/2025', details: 'Interest accrued', debit: 100.89, credit: null, balance: 26871.06},
  {date: '17/10/2025', details: 'Instalment Payment', debit: null, credit: 700.00, balance: 26171.06},
  {date: '31/10/2025', details: 'Interest accrued', debit: 81.42, credit: null, balance: 26252.48},
  {date: '14/11/2025', details: 'Interest accrued', debit: 81.42, credit: null, balance: 26333.90},
  {date: '14/11/2025', details: 'Instalment Payment', debit: null, credit: 800.00, balance: 25533.90},
  {date: '30/11/2025', details: 'Interest accrued', debit: 90.79, credit: null, balance: 25624.69},
  {date: '19/12/2025', details: 'Interest accrued', debit: 107.81, credit: null, balance: 25732.50},
  {date: '19/12/2025', details: 'Instalment Payment', debit: null, credit: 1000.00, balance: 24732.50},
  {date: '31/12/2025', details: 'Interest accrued', debit: 65.95, credit: null, balance: 24798.45},
  {date: '01/01/2026', details: 'VAT Adjustment (15.5%)', debit: 101.57, credit: null, balance: 24900.02},
  {date: '31/01/2026', details: 'Interest accrued', debit: 171.08, credit: null, balance: 25071.10},
  {date: '16/02/2026', details: 'Interest accrued', debit: 88.30, credit: null, balance: 25159.40},
  {date: '16/02/2026', details: 'Instalment Payment', debit: null, credit: 1000.00, balance: 24159.40},
  {date: '28/02/2026', details: 'Interest accrued', debit: 64.43, credit: null, balance: 24223.83},
  {date: '27/03/2026', details: 'Interest accrued', debit: 144.96, credit: null, balance: 24368.78},
  {date: '27/03/2026', details: 'Instalment Payment', debit: null, credit: 500.00, balance: 23868.78},
  {date: '31/03/2026', details: 'Interest accrued', debit: 21.22, credit: null, balance: 23890.00},
  {date: '17/04/2026', details: 'Interest accrued', debit: 90.17, credit: null, balance: 23980.17},
  {date: '17/04/2026', details: 'Instalment Payment', debit: null, credit: 500.00, balance: 23480.17},
  {date: '30/04/2026', details: 'Interest accrued', debit: 67.83, credit: null, balance: 23548.00},
  {date: '07/05/2026', details: 'Interest accrued', debit: 36.52, credit: null, balance: 23584.53},
];

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

export default function EmptyPage() {
  const totalDebit = ledger.reduce((sum, e) => sum + (e.debit ?? 0), 0);

  return (
    <div className="min-h-screen bg-[#f7f7f5] text-[#1a1a18] selection:bg-[#1e295b]/20">
      <header className="sticky top-0 z-50 flex items-center gap-4 border-b-2 border-[#d40000] bg-[#1e295b] px-6 py-4 text-white no-print">
        <div className="flex h-8 w-8 items-center justify-center rounded-sm bg-white font-bold text-[#1e295b] shadow-sm">N</div>
        <div>
          <h1 className="text-sm font-black uppercase tracking-tight">Northgate Estates</h1>
          <p className="text-[9px] font-bold uppercase tracking-[0.3em] opacity-80">Document Simulator</p>
        </div>
        <div className="ml-auto flex items-center gap-3">
          <a
            href="/"
            className="rounded border border-white/30 px-2 py-0.5 text-[10px] font-bold uppercase tracking-widest transition-colors hover:bg-white/10"
          >
            Simulator
          </a>
          <div className="rounded border border-white/30 px-2 py-0.5 text-[10px] font-bold uppercase tracking-widest">
            PDF Match Pro
          </div>
        </div>
      </header>

      <div className="grid min-h-[calc(100vh-68px)] grid-cols-[360px_1fr] print:block">
        <aside className="sticky top-[68px] max-h-[calc(100vh-68px)] overflow-y-auto border-r border-gray-200 bg-white p-6 shadow-sm no-print">
          <Section title="Account Snapshot">
            <div className="space-y-3">
              <div className="rounded border border-green-200 bg-green-50 p-3">
                <p className="text-[10px] font-bold uppercase tracking-wider text-green-700">Status</p>
                <p className="text-sm font-black text-green-800">On Track</p>
              </div>
              <div className="rounded border border-blue-200 bg-blue-50 p-3">
                <p className="text-[10px] font-bold uppercase tracking-wider text-blue-700">Remaining</p>
                <p className="text-sm font-black text-blue-800">$23,584.53</p>
              </div>
              <div className="rounded border border-gray-200 bg-gray-50 p-3">
                <p className="text-[10px] font-bold uppercase tracking-wider text-gray-700">Total Paid</p>
                <p className="text-sm font-black text-gray-800">$21,850.00</p>
              </div>
            </div>
          </Section>

          <Section title="Property Context">
            <Field label="Stand Number" value="3034" />
            <Field label="Stand Size" value="501 m2" />
            <Field label="Client Name" value="Kundai Pauline Kaseke" />
            <Field label="Client Contact" value="+263774793918" />
          </Section>

          <Section title="Financial Summary">
            <div className="space-y-2 text-[11px]">
              <div className="flex justify-between border-b border-gray-100 pb-1">
                <span className="text-gray-500">Original Value</span>
                <span className="font-bold">$43,211.25</span>
              </div>
              <div className="flex justify-between border-b border-gray-100 pb-1">
                <span className="text-gray-500">Revised Value</span>
                <span className="font-bold">$43,312.82</span>
              </div>
              <div className="flex justify-between border-b border-gray-100 pb-1">
                <span className="text-gray-500">Monthly Instalment</span>
                <span className="font-bold">$700.93</span>
              </div>
              <div className="flex justify-between border-b border-gray-100 pb-1">
                <span className="text-gray-500">Total Debit</span>
                <span className="font-bold text-red-600">$2,121.71</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Catch-up</span>
                <span className="font-bold text-green-600">$0.00</span>
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
                    Account Statement as of: 7 May 2026
                  </p>
                  <div className="space-y-1.5">
                    <InfoLine label="Stand Number" value="3034" />
                    <InfoLine label="Stand Size" value="501 m2" />
                    <InfoLine label="Client Name" value="Kundai Pauline Kaseke" />
                    <InfoLine label="Client Contact" value="+263774793918" />
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
                  <div className="border-r border-black p-2">$43,211.25</div>
                  <div className="border-r border-black p-2">$21,850.00</div>
                  <div className="border-r border-black p-2">$700.93</div>
                  <div className="p-2">On Track</div>
                </div>
                <div className="grid grid-cols-4 border border-t-0 border-black text-[11px] font-bold">
                  <div className="border-r border-black bg-blue-50 p-2">Revised Property Value (USD)</div>
                  <div className="border-r border-black p-2">$43,312.82</div>
                  <div className="border-r border-black bg-blue-50 p-2">Catch-up Amount (C)</div>
                  <div className="p-2 text-red-600">$0.00</div>
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
                    {ledger.map((row, index) => (
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
                      <td className="border-r border-black p-2 text-right font-mono">${formatMoney(totalDebit)}</td>
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
                    $23,584.53
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
