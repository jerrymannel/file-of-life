import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { getRecord, getEditHistory } from '../db/database'
import type { RecordRow, EditHistoryRow, FormData } from '../types'
import { EditHistoryPanel } from '../components/EditHistoryPanel'

const CONDITION_LABELS: Array<[keyof FormData['conditions'], string]> = [
  ['alzheimers', "Alzheimer's"],
  ['angina', 'Angina'],
  ['anxiety', 'Anxiety'],
  ['arthritis', 'Arthritis'],
  ['asthma', 'Asthma'],
  ['atrialFibrillation', 'Atrial Fibrillation'],
  ['bipolarDisorder', 'Bipolar Disorder'],
  ['bleedingDisorder', 'Bleeding Disorder'],
  ['cancer', 'Cancer'],
  ['cardiacDysrhythmia', 'Cardiac Dysrhythmia'],
  ['clottingDisorder', 'Clotting Disorder'],
  ['congestiveHeartFailure', 'Congestive Heart Failure'],
  ['copd', 'COPD'],
  ['coronaryArteryDisease', 'Coronary Artery Disease'],
  ['dementia', 'Dementia'],
  ['depression', 'Depression'],
  ['diabetesInsulinDependent', 'Diabetes (Insulin Dep.)'],
  ['epilepsy', 'Epilepsy'],
  ['heartValveReplacement', 'Heart Valve Replacement'],
  ['hypoglycemia', 'Hypoglycemia'],
  ['hypertension', 'Hypertension'],
  ['hyperthyroidism', 'Hyperthyroidism'],
  ['hypothyroidism', 'Hypothyroidism'],
  ['kidneyDisease', 'Kidney Disease'],
  ['laryngectomy', 'Laryngectomy'],
  ['myocardialInfarction', 'MI (Heart Attack)'],
  ['pacemaker', 'Pacemaker'],
  ['parkinsonDisease', "Parkinson's Disease"],
  ['pneumonia', 'Pneumonia'],
  ['renalFailure', 'Renal Failure'],
  ['seizureDisorder', 'Seizure Disorder'],
  ['stroke', 'Stroke'],
  ['tia', 'TIA (Mini Stroke)'],
  ['tuberculosis', 'Tuberculosis'],
]

type ConditionBoolKey = {
  [K in keyof FormData['conditions']]: FormData['conditions'][K] extends boolean ? K : never
}[keyof FormData['conditions']]

function PrintField({ label, value }: { label: string; value: string | null | undefined }) {
  if (!value) return null
  return (
    <div className="mb-1">
      <span className="font-semibold text-[9px] uppercase tracking-wide text-gray-500">{label}: </span>
      <span className="text-[10px] text-gray-900">{value}</span>
    </div>
  )
}

function PrintRow({ children }: { children: React.ReactNode }) {
  return <div className="flex gap-1 items-start mb-0.5">{children}</div>
}

function PrintYesNo({ label, value }: { label: string; value: boolean | null }) {
  return (
    <PrintRow>
      <span className="font-semibold text-[9px] uppercase tracking-wide text-gray-500">{label}:</span>
      <span className="text-[10px] text-gray-900">
        {value === null ? '—' : value ? 'Yes' : 'No'}
      </span>
    </PrintRow>
  )
}

export function PrintPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const recordId = id ? parseInt(id, 10) : null

  const [record, setRecord] = useState<RecordRow | null>(null)
  const [editHistory, setEditHistory] = useState<EditHistoryRow[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!recordId) { navigate('/'); return }
    const load = async () => {
      try {
        const rec = await getRecord(recordId)
        if (!rec) { navigate('/'); return }
        setRecord(rec)
        const history = await getEditHistory(recordId)
        setEditHistory(history)
      } catch (err) {
        setError(String(err))
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [recordId, navigate])

  const formatDate = (isoString: string) => {
    if (!isoString) return ''
    try { return new Date(isoString).toLocaleDateString() } catch { return isoString }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-24">
        <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>
      </div>
    )
  }

  if (error || !record) {
    return <div className="text-destructive p-4">{error || 'Record not found.'}</div>
  }

  const d = record.data
  const activeConditions = CONDITION_LABELS.filter(([key]) => {
    const boolKey = key as ConditionBoolKey
    return d.conditions[boolKey]
  })

  const activeMeds = d.medications.filter((m) => m.name.trim())

  return (
    <>
      {/* Screen controls - hidden during print */}
      <div className="no-print mb-6 flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="font-serif text-2xl font-semibold">Print Preview</h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            {d.name} — A5 Landscape Layout
          </p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={() => navigate(`/edit/${recordId}`)}
            className="inline-flex items-center gap-2 border border-border px-4 py-2 rounded-md font-medium text-sm hover:bg-muted transition-colors"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z"/>
            </svg>
            Edit
          </button>
          <button
            onClick={() => window.print()}
            className="inline-flex items-center gap-2 bg-primary text-primary-foreground px-5 py-2.5 rounded-md font-medium text-sm hover:opacity-90 transition-opacity"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"/>
              <path d="M6 9V3a1 1 0 0 1 1-1h10a1 1 0 0 1 1 1v6"/>
              <rect x="6" y="14" width="12" height="8" rx="1"/>
            </svg>
            Print (A5 Landscape)
          </button>
        </div>
      </div>

      {/* Screen preview of print layout */}
      <div className="no-print bg-card border border-border rounded-lg p-4 mb-6 overflow-x-auto">
        <p className="text-xs text-muted-foreground mb-3">Preview (actual print may differ slightly)</p>
        <div className="max-w-2xl mx-auto border border-border rounded shadow-sm bg-white text-black p-4" style={{ minWidth: 500 }}>
          <PrintContent d={d} activeConditions={activeConditions} activeMeds={activeMeds} formatDate={formatDate} />
        </div>
      </div>

      {/* Edit history panel */}
      <EditHistoryPanel history={editHistory} />

      {/* Actual print content - only visible when printing */}
      <div className="print-only hidden">
        <PrintContent d={d} activeConditions={activeConditions} activeMeds={activeMeds} formatDate={formatDate} />
      </div>
    </>
  )
}

interface PrintContentProps {
  d: FormData
  activeConditions: Array<[keyof FormData['conditions'], string]>
  activeMeds: FormData['medications']
  formatDate: (s: string) => string
}

function PrintContent({ d, activeConditions, activeMeds, formatDate }: PrintContentProps) {
  return (
    <div className="print-content" style={{ fontFamily: 'Arial, sans-serif', fontSize: '10px', color: '#111' }}>
      {/* Header */}
      <div style={{ borderBottom: '2px solid #E85D04', marginBottom: '6px', paddingBottom: '4px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <div>
            <div style={{ fontSize: '14px', fontWeight: 700, color: '#E85D04' }}>FILE OF LIFE</div>
            <div style={{ fontSize: '8px', color: '#666', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Frisco Texas Fire Department</div>
          </div>
          <div style={{ textAlign: 'right' }}>
            <div style={{ fontSize: '12px', fontWeight: 700 }}>{d.name || '____________________'}</div>
            <div style={{ fontSize: '9px', color: '#555' }}>
              {d.sex && <span>Sex: {d.sex} &nbsp;</span>}
              {d.dateOfBirth && <span>DOB: {formatDate(d.dateOfBirth)} &nbsp;</span>}
              {d.phone && <span>Ph: {d.phone}</span>}
            </div>
            {d.address && <div style={{ fontSize: '9px', color: '#555' }}>{d.address}</div>}
            {(d.reviewedMonth || d.reviewedYear) && (
              <div style={{ fontSize: '8px', color: '#888' }}>Reviewed: {d.reviewedMonth} {d.reviewedYear}</div>
            )}
          </div>
        </div>
      </div>

      {/* Two column layout */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
        {/* LEFT COLUMN */}
        <div>
          {/* Emergency Contacts */}
          <PrintBlock title="Emergency Contacts">
            {d.contacts.map((c, idx) => {
              if (!c.name && !c.phone) return null
              return (
                <div key={idx} style={{ marginBottom: '4px' }}>
                  <div style={{ fontSize: '9px', fontWeight: 600, color: '#444' }}>Contact {idx + 1}</div>
                  {c.name && <div style={{ fontSize: '10px' }}>{c.name}{c.relation && ` (${c.relation})`}</div>}
                  {c.phone && <div style={{ fontSize: '9px', color: '#555' }}>{c.phone}</div>}
                  {c.address && <div style={{ fontSize: '9px', color: '#666' }}>{c.address}</div>}
                </div>
              )
            })}
          </PrintBlock>

          {/* Medical Data */}
          <PrintBlock title="Medical Data">
            <PrintYesNo label="DNR" value={d.hasDNR} />
            {d.hasDNR && d.dnrLocation && <PrintField label="DNR Location" value={d.dnrLocation} />}
            <PrintYesNo label="Blood Thinners" value={d.bloodThinners} />
            {d.specialConditions && <PrintField label="Special Conditions" value={d.specialConditions} />}
          </PrintBlock>

          {/* Medications */}
          {activeMeds.length > 0 && (
            <PrintBlock title="Current Medications">
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '9px' }}>
                <thead>
                  <tr style={{ borderBottom: '1px solid #ddd' }}>
                    <th style={{ textAlign: 'left', padding: '1px 2px', fontSize: '8px', color: '#666', fontWeight: 600, textTransform: 'uppercase' }}>Medication</th>
                    <th style={{ textAlign: 'left', padding: '1px 2px', fontSize: '8px', color: '#666', fontWeight: 600, textTransform: 'uppercase' }}>Dosage</th>
                    <th style={{ textAlign: 'left', padding: '1px 2px', fontSize: '8px', color: '#666', fontWeight: 600, textTransform: 'uppercase' }}>Frequency</th>
                  </tr>
                </thead>
                <tbody>
                  {activeMeds.map((med, idx) => (
                    <tr key={idx} style={{ borderBottom: '1px solid #f0f0f0' }}>
                      <td style={{ padding: '1px 2px' }}>{med.name}</td>
                      <td style={{ padding: '1px 2px' }}>{med.dosage}</td>
                      <td style={{ padding: '1px 2px' }}>{med.frequency}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </PrintBlock>
          )}
        </div>

        {/* RIGHT COLUMN */}
        <div>
          {/* Medical Conditions */}
          <PrintBlock title="Medical Conditions">
            {d.conditions.noKnownConditions ? (
              <div style={{ fontSize: '10px', fontStyle: 'italic', color: '#666' }}>No Known Conditions</div>
            ) : (
              <>
                {activeConditions.length > 0 ? (
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1px' }}>
                    {activeConditions.map(([key, label]) => (
                      <div key={key} style={{ fontSize: '9px', display: 'flex', alignItems: 'center', gap: '3px' }}>
                        <span style={{ color: '#E85D04', fontWeight: 700 }}>✓</span> {label}
                      </div>
                    ))}
                    {d.conditions.hepatitisType && (
                      <div style={{ fontSize: '9px', display: 'flex', alignItems: 'center', gap: '3px' }}>
                        <span style={{ color: '#E85D04', fontWeight: 700 }}>✓</span> Hepatitis {d.conditions.hepatitisType}
                      </div>
                    )}
                  </div>
                ) : (
                  <div style={{ fontSize: '9px', color: '#888', fontStyle: 'italic' }}>None checked</div>
                )}
                {d.conditions.other && d.conditions.other.trim() && (
                  <div style={{ fontSize: '9px', marginTop: '2px' }}>
                    <span style={{ fontWeight: 600 }}>Other:</span> {d.conditions.other.trim()}
                  </div>
                )}
              </>
            )}
          </PrintBlock>

          {/* Allergies */}
          <PrintBlock title="Allergies">
            {d.noKnownAllergies ? (
              <div style={{ fontSize: '10px', fontStyle: 'italic', color: '#666' }}>No Known Allergies</div>
            ) : (
              <div style={{ fontSize: '10px', whiteSpace: 'pre-wrap' }}>
                {d.allergies || <span style={{ color: '#999', fontStyle: 'italic' }}>Not specified</span>}
              </div>
            )}
          </PrintBlock>

          {/* Physician */}
          {d.physicianInfo && (
            <PrintBlock title="Physician Information">
              <div style={{ fontSize: '10px', whiteSpace: 'pre-wrap' }}>{d.physicianInfo}</div>
            </PrintBlock>
          )}

          {/* Recent Surgeries */}
          {d.recentSurgeries.some((s) => s.description.trim()) && (
            <PrintBlock title="Recent Surgeries / Procedures">
              {d.recentSurgeries
                .filter((s) => s.description.trim())
                .map((s, idx) => (
                  <div key={idx} style={{ marginBottom: '2px' }}>
                    <span style={{ fontSize: '10px' }}>{s.description}</span>
                    {s.date && <span style={{ fontSize: '9px', color: '#666' }}> — {formatDate(s.date)}</span>}
                  </div>
                ))}
            </PrintBlock>
          )}

          {/* Power of Attorney */}
          <PrintBlock title="Power of Attorney (Healthcare)">
            <PrintYesNo label="Has POA" value={d.hasPowerOfAttorney} />
            {d.hasPowerOfAttorney && d.powerOfAttorneyLocation && (
              <PrintField label="Location" value={d.powerOfAttorneyLocation} />
            )}
          </PrintBlock>
        </div>
      </div>
    </div>
  )
}

function PrintBlock({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div style={{ marginBottom: '6px', borderLeft: '2px solid #E85D04', paddingLeft: '4px' }}>
      <div style={{ fontSize: '8px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', color: '#E85D04', marginBottom: '2px' }}>
        {title}
      </div>
      {children}
    </div>
  )
}
