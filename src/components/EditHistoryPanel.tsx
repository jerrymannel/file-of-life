import { useState } from 'react'
import type { EditHistoryRow } from '../types'

interface EditHistoryPanelProps {
  history: EditHistoryRow[]
  collapsible?: boolean
}

export function EditHistoryPanel({ history, collapsible = false }: EditHistoryPanelProps) {
  const [isOpen, setIsOpen] = useState(!collapsible)

  const formatDate = (isoString: string) => {
    try {
      return new Date(isoString).toLocaleString(undefined, {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      })
    } catch {
      return isoString
    }
  }

  if (collapsible) {
    return (
      <div className="bg-card border border-border rounded-lg shadow-sm">
        <button
          type="button"
          onClick={() => setIsOpen((o) => !o)}
          className="w-full px-6 py-4 flex items-center justify-between text-left hover:bg-muted/30 transition-colors rounded-lg"
        >
          <div className="flex items-center gap-2">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-muted-foreground">
              <path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"/>
              <path d="M3 3v5h5"/>
              <path d="M12 7v5l4 2"/>
            </svg>
            <span className="font-medium text-sm">Edit History</span>
            <span className="text-xs text-muted-foreground bg-muted px-2 py-0.5 rounded-full">
              {history.length} {history.length === 1 ? 'save' : 'saves'}
            </span>
          </div>
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className={`text-muted-foreground transition-transform ${isOpen ? 'rotate-180' : ''}`}
          >
            <path d="m6 9 6 6 6-6"/>
          </svg>
        </button>
        {isOpen && (
          <div className="px-6 pb-4 border-t border-border pt-4">
            <HistoryList history={history} formatDate={formatDate} />
          </div>
        )}
      </div>
    )
  }

  return (
    <div>
      <h3 className="font-serif text-base font-semibold mb-3 flex items-center gap-2">
        Edit History
        <span className="text-xs font-sans font-normal text-muted-foreground bg-muted px-2 py-0.5 rounded-full">
          {history.length} {history.length === 1 ? 'save' : 'saves'}
        </span>
      </h3>
      <HistoryList history={history} formatDate={formatDate} />
    </div>
  )
}

function HistoryList({
  history,
  formatDate,
}: {
  history: EditHistoryRow[]
  formatDate: (s: string) => string
}) {
  if (!history.length) {
    return <p className="text-sm text-muted-foreground">No edit history yet.</p>
  }

  return (
    <ol className="space-y-2">
      {history.map((entry, idx) => (
        <li key={entry.id} className="flex items-center gap-3 text-sm">
          <div className="flex-shrink-0 w-5 h-5 rounded-full bg-primary/10 text-primary flex items-center justify-center text-xs font-medium">
            {history.length - idx}
          </div>
          <span className="text-foreground font-mono text-xs">{formatDate(entry.edited_at)}</span>
          {idx === 0 && (
            <span className="text-xs text-primary bg-primary/10 px-1.5 py-0.5 rounded">Latest</span>
          )}
        </li>
      ))}
    </ol>
  )
}
