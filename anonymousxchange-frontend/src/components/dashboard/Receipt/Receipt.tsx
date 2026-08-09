import { Download, Printer, X } from 'lucide-react'

export interface ReceiptData {
  id: string
  reference: string | null
  type: string
  asset: string
  amount?: number | null
  rate?: number | null
  fee?: number | null
  payoutAmount?: number | null
  currency?: string | null
  status: string
  createdAt: string
  details?: Record<string, unknown> | null
}

interface ReceiptProps {
  data: ReceiptData
  onClose?: () => void
}

export default function Receipt({ data, onClose }: ReceiptProps) {
  const handlePrint = () => window.print()

  const handleDownload = () => {
    const content = `
AnonymousXchange Receipt
========================
Reference: ${data.reference || data.id}
Date: ${new Date(data.createdAt).toLocaleString()}
Type: ${data.type.replace(/_/g, ' ')}
Asset: ${data.asset}
Amount: ${data.amount ?? '—'}
Rate: ${data.rate ?? '—'}
Fee: ${data.fee ?? '—'}
Payout: ${data.payoutAmount != null ? `₦${Number(data.payoutAmount).toLocaleString()}` : '—'}
Status: ${data.status}
Currency: ${data.currency || 'NGN'}
========================
Thank you for trading with AnonymousXchange.
    `.trim()
    const blob = new Blob([content], { type: 'text/plain' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `receipt-${data.reference || data.id}.txt`
    a.click()
    URL.revokeObjectURL(url)
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm">
      <div className="relative w-full max-w-md rounded-2xl border border-white/10 bg-slate-900 shadow-2xl">
        {onClose && (
          <button type="button" onClick={onClose} className="absolute right-3 top-3 rounded-lg p-1.5 text-slate-400 hover:bg-white/10 hover:text-white">
            <X className="h-4 w-4" />
          </button>
        )}
        <div className="border-b border-white/10 px-6 py-5">
          <div className="flex items-center gap-2">
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-600 text-sm font-bold text-white">AX</span>
            <div>
              <p className="font-semibold text-white">AnonymousXchange</p>
              <p className="text-xs text-slate-400">Transaction Receipt</p>
            </div>
          </div>
        </div>
        <div className="space-y-3 px-6 py-5 text-sm">
          <Row label="Reference" value={data.reference || data.id} />
          <Row label="Date" value={new Date(data.createdAt).toLocaleString()} />
          <Row label="Type" value={data.type.replace(/_/g, ' ')} />
          <Row label="Asset" value={data.asset} />
          {data.amount != null && <Row label="Amount" value={String(data.amount)} />}
          {data.rate != null && <Row label="Rate" value={`₦${Number(data.rate).toLocaleString()}`} />}
          {data.fee != null && <Row label="Fee" value={`₦${Number(data.fee).toLocaleString()}`} />}
          {data.payoutAmount != null && (
            <Row label="Payout" value={`₦${Number(data.payoutAmount).toLocaleString()}`} highlight />
          )}
          <Row label="Status" value={data.status.replace(/_/g, ' ')} />
        </div>
        <div className="flex gap-2 border-t border-white/10 px-6 py-4">
          <button type="button" onClick={handlePrint} className="flex flex-1 items-center justify-center gap-2 rounded-xl border border-white/10 bg-white/5 py-2.5 text-sm font-medium text-white hover:bg-white/10">
            <Printer className="h-4 w-4" /> Print
          </button>
          <button type="button" onClick={handleDownload} className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-blue-600 py-2.5 text-sm font-medium text-white hover:bg-blue-500">
            <Download className="h-4 w-4" /> Download
          </button>
        </div>
      </div>
    </div>
  )
}

function Row({ label, value, highlight }: { label: string; value: string; highlight?: boolean }) {
  return (
    <div className="flex items-center justify-between gap-4">
      <span className="text-slate-400">{label}</span>
      <span className={highlight ? 'font-semibold text-emerald-400' : 'text-white'}>{value}</span>
    </div>
  )
}
