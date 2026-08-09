const DEFAULT_SUGGESTIONS = [
  'Sell my Apple Gift Card',
  'Buy a Steam Gift Card',
  'What’s today’s USDT buy & sell rate?',
  'I want to sell Bitcoin',
  'Buy USDT with Naira',
  'Sell Discord Nitro gift',
  'Track my last transaction',
]

interface SuggestionsProps {
  onSelect: (text: string) => void
  items?: string[]
}

export default function Suggestions({
  onSelect,
  items = DEFAULT_SUGGESTIONS,
}: SuggestionsProps) {
  return (
    <div className="flex flex-wrap justify-center gap-2 px-4 pb-3">
      {items.map((item) => (
        <button
          key={item}
          type="button"
          onClick={() => onSelect(item)}
          className="rounded-full border border-white/10 bg-white/5 px-3.5 py-1.5 text-xs font-medium text-slate-300 transition hover:border-blue-500/40 hover:bg-blue-500/10 hover:text-blue-300"
        >
          {item}
        </button>
      ))}
    </div>
  )
}
