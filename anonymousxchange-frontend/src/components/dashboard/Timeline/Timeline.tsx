import { CheckCircle2, Circle, Clock, XCircle, Loader2 } from 'lucide-react'
import { cn } from '../../../utils/cn'

const STATUS_ORDER = [
  'initiated',
  'awaiting_details',
  'pending_payment',
  'processing',
  'completed',
] as const

const LABELS: Record<string, string> = {
  initiated: 'Initiated',
  awaiting_details: 'Awaiting details',
  pending_payment: 'Pending payment',
  processing: 'Processing',
  completed: 'Completed',
  failed: 'Failed',
  cancelled: 'Cancelled',
}

interface TimelineProps {
  status: string
  createdAt: string
  updatedAt?: string
  notes?: string | null
}

export default function Timeline({ status, createdAt, updatedAt, notes }: TimelineProps) {
  const isFailed = status === 'failed' || status === 'cancelled'
  const currentIdx = STATUS_ORDER.indexOf(status as (typeof STATUS_ORDER)[number])

  return (
    <div className="space-y-1">
      {STATUS_ORDER.map((step, idx) => {
        const done = !isFailed && currentIdx >= idx
        const current = !isFailed && currentIdx === idx
        const Icon = done && !current ? CheckCircle2 : current ? Loader2 : Circle

        return (
          <div key={step} className="flex gap-3">
            <div className="flex flex-col items-center">
              <Icon
                className={cn(
                  'h-5 w-5 shrink-0',
                  done && !current && 'text-emerald-400',
                  current && 'animate-spin text-blue-400',
                  !done && !current && 'text-slate-600'
                )}
              />
              {idx < STATUS_ORDER.length - 1 && (
                <div
                  className={cn(
                    'my-1 w-px flex-1 min-h-[20px]',
                    done ? 'bg-emerald-500/40' : 'bg-white/10'
                  )}
                />
              )}
            </div>
            <div className="pb-4">
              <p
                className={cn(
                  'text-sm font-medium',
                  done || current ? 'text-white' : 'text-slate-500'
                )}
              >
                {LABELS[step]}
              </p>
              {current && (
                <p className="mt-0.5 text-xs text-slate-400">
                  Updated {updatedAt ? new Date(updatedAt).toLocaleString() : '—'}
                </p>
              )}
              {idx === 0 && (
                <p className="mt-0.5 text-xs text-slate-500">
                  Started {new Date(createdAt).toLocaleString()}
                </p>
              )}
            </div>
          </div>
        )
      })}

      {isFailed && (
        <div className="flex gap-3">
          <XCircle className="h-5 w-5 text-red-400" />
          <div>
            <p className="text-sm font-medium text-red-300">{LABELS[status] || status}</p>
            {notes && <p className="mt-0.5 text-xs text-slate-400">{notes}</p>}
          </div>
        </div>
      )}
    </div>
  )
}
