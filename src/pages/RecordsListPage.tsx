import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { getAllRecords, deleteRecord } from '../db/database'
import type { RecordRow } from '../types'

export function RecordsListPage() {
  const [records, setRecords] = useState<RecordRow[]>([])
  const [loading, setLoading] = useState(true)
  const [deleteId, setDeleteId] = useState<number | null>(null)

  const loadRecords = async () => {
    try {
      const all = await getAllRecords()
      setRecords(all)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadRecords()
  }, [])

  const handleDelete = async (id: number) => {
    await deleteRecord(id)
    setDeleteId(null)
    loadRecords()
  }

  const formatDate = (isoString: string) => {
    try {
      return new Date(isoString).toLocaleDateString(undefined, {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
      })
    } catch {
      return isoString
    }
  }

  const formatDateTime = (isoString: string) => {
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

  if (loading) {
    return (
      <div className="flex items-center justify-center py-24">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
          <p className="text-sm text-muted-foreground">Loading records...</p>
        </div>
      </div>
    )
  }

  if (!records.length) {
    return (
      <div className="flex flex-col items-center justify-center py-24 text-center">
        <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mb-4">
          <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="text-primary">
            <path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z"/>
          </svg>
        </div>
        <h2 className="font-serif text-xl font-semibold mb-2">No Records Yet</h2>
        <p className="text-muted-foreground text-sm mb-6 max-w-sm">
          Create your first File of Life record to store important medical information for emergency responders.
        </p>
        <Link
          to="/new"
          className="inline-flex items-center gap-2 bg-primary text-primary-foreground px-5 py-2.5 rounded-md font-medium text-sm hover:opacity-90 transition-opacity"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M5 12h14M12 5v14"/>
          </svg>
          Create First Record
        </Link>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-serif text-2xl font-semibold">Medical Records</h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            {records.length} {records.length === 1 ? 'record' : 'records'} stored locally
          </p>
        </div>
        <Link
          to="/new"
          className="inline-flex items-center gap-2 bg-primary text-primary-foreground px-4 py-2 rounded-md font-medium text-sm hover:opacity-90 transition-opacity"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M5 12h14M12 5v14"/>
          </svg>
          New Record
        </Link>
      </div>

      {/* Desktop table */}
      <div className="hidden md:block bg-card border border-border rounded-lg shadow-sm overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border bg-muted/30">
              <th className="text-left px-4 py-3 font-medium text-muted-foreground">Name</th>
              <th className="text-left px-4 py-3 font-medium text-muted-foreground">Date of Birth</th>
              <th className="text-left px-4 py-3 font-medium text-muted-foreground">Phone</th>
              <th className="text-left px-4 py-3 font-medium text-muted-foreground">Last Updated</th>
              <th className="text-left px-4 py-3 font-medium text-muted-foreground">History</th>
              <th className="text-right px-4 py-3 font-medium text-muted-foreground">Actions</th>
            </tr>
          </thead>
          <tbody>
            {records.map((record, idx) => (
              <tr
                key={record.id}
                className={`border-b border-border last:border-0 hover:bg-muted/20 transition-colors ${idx % 2 === 0 ? '' : 'bg-muted/10'}`}
              >
                <td className="px-4 py-3 font-medium">
                  {record.data.name || <span className="text-muted-foreground italic">Unnamed</span>}
                </td>
                <td className="px-4 py-3 text-muted-foreground">
                  {record.data.dateOfBirth ? formatDate(record.data.dateOfBirth) : '—'}
                </td>
                <td className="px-4 py-3 text-muted-foreground font-mono text-xs">
                  {record.data.phone || '—'}
                </td>
                <td className="px-4 py-3 text-muted-foreground text-xs">
                  {formatDateTime(record.updated_at)}
                </td>
                <td className="px-4 py-3">
                  <span className="text-xs text-muted-foreground bg-muted px-2 py-0.5 rounded-full">
                    {record.editCount ?? 0} {record.editCount === 1 ? 'edit' : 'edits'}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <div className="flex items-center justify-end gap-1">
                    <Link
                      to={`/edit/${record.id}`}
                      className="p-1.5 rounded hover:bg-muted transition-colors text-muted-foreground hover:text-foreground"
                      title="Edit record"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z"/>
                      </svg>
                    </Link>
                    <Link
                      to={`/print/${record.id}`}
                      className="p-1.5 rounded hover:bg-muted transition-colors text-muted-foreground hover:text-foreground"
                      title="Print record"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"/>
                        <path d="M6 9V3a1 1 0 0 1 1-1h10a1 1 0 0 1 1 1v6"/>
                        <rect x="6" y="14" width="12" height="8" rx="1"/>
                      </svg>
                    </Link>
                    <button
                      onClick={() => setDeleteId(record.id)}
                      className="p-1.5 rounded hover:bg-destructive/10 transition-colors text-muted-foreground hover:text-destructive"
                      title="Delete record"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M3 6h18M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/>
                      </svg>
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Mobile cards */}
      <div className="md:hidden space-y-3">
        {records.map((record) => (
          <div key={record.id} className="bg-card border border-border rounded-lg p-4 shadow-sm">
            <div className="flex items-start justify-between mb-2">
              <div>
                <p className="font-medium">
                  {record.data.name || <span className="text-muted-foreground italic">Unnamed</span>}
                </p>
                {record.data.dateOfBirth && (
                  <p className="text-sm text-muted-foreground">DOB: {formatDate(record.data.dateOfBirth)}</p>
                )}
              </div>
              <span className="text-xs text-muted-foreground bg-muted px-2 py-0.5 rounded-full">
                {record.editCount ?? 0} edits
              </span>
            </div>
            {record.data.phone && (
              <p className="text-xs text-muted-foreground font-mono mb-2">{record.data.phone}</p>
            )}
            <p className="text-xs text-muted-foreground mb-3">Updated: {formatDateTime(record.updated_at)}</p>
            <div className="flex gap-2">
              <Link
                to={`/edit/${record.id}`}
                className="flex-1 text-center py-1.5 rounded-md bg-muted text-sm font-medium hover:bg-muted/80 transition-colors"
              >
                Edit
              </Link>
              <Link
                to={`/print/${record.id}`}
                className="flex-1 text-center py-1.5 rounded-md bg-muted text-sm font-medium hover:bg-muted/80 transition-colors"
              >
                Print
              </Link>
              <button
                onClick={() => setDeleteId(record.id)}
                className="flex-1 py-1.5 rounded-md bg-destructive/10 text-destructive text-sm font-medium hover:bg-destructive/20 transition-colors"
              >
                Delete
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Delete confirmation dialog */}
      {deleteId !== null && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
          <div className="bg-card border border-border rounded-lg shadow-xl p-6 max-w-sm w-full">
            <div className="w-10 h-10 rounded-full bg-destructive/10 flex items-center justify-center mb-4">
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-destructive">
                <path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z"/>
                <path d="M12 9v4M12 17h.01"/>
              </svg>
            </div>
            <h3 className="font-serif font-semibold text-lg mb-2">Delete Record?</h3>
            <p className="text-sm text-muted-foreground mb-6">
              This will permanently delete this medical record and all its edit history. This action cannot be undone.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setDeleteId(null)}
                className="flex-1 py-2 rounded-md border border-border bg-background text-sm font-medium hover:bg-muted transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={() => handleDelete(deleteId)}
                className="flex-1 py-2 rounded-md bg-destructive text-destructive-foreground text-sm font-medium hover:opacity-90 transition-opacity"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
