import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { getRecord, getEditHistory } from '../db/database'
import type { RecordRow, EditHistoryRow, FormData } from '../types'

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

  const formatDateTime = (isoString: string) => {
    if (!isoString) return ''
    try { return new Date(isoString).toLocaleString() } catch { return isoString }
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
  const activeMeds = d.medications.filter((m) => m.name.trim())
  const checkedConditions = CONDITION_LABELS.filter(([key]) => Boolean(d.conditions[key as keyof typeof d.conditions]))

  return (
    <>
      {/* ── SCREEN VIEW (hidden when printing) ── */}
      <div className="no-print space-y-6">
        {/* Header bar */}
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div>
            <h1 className="font-serif text-2xl font-semibold">{d.name || 'Unnamed Record'}</h1>
            <p className="text-sm text-muted-foreground mt-0.5">
              {d.dateOfBirth && <>DOB: {formatDate(d.dateOfBirth)} &nbsp;·&nbsp;</>}
              {d.sex && <>Sex: {d.sex} &nbsp;·&nbsp;</>}
              {d.phone && <>Ph: {d.phone}</>}
            </p>
          </div>
          <div className="flex gap-3">
            <button
              onClick={() => navigate(`/edit/${recordId}`)}
              className="inline-flex items-center gap-2 border border-border px-4 py-2 rounded-md font-medium text-sm hover:bg-muted transition-colors"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z" />
              </svg>
              Edit
            </button>
            <button
              onClick={() => window.print()}
              className="inline-flex items-center gap-2 bg-primary text-primary-foreground px-5 py-2.5 rounded-md font-medium text-sm hover:opacity-90 transition-opacity"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2" />
                <path d="M6 9V3a1 1 0 0 1 1-1h10a1 1 0 0 1 1 1v6" />
                <rect x="6" y="14" width="12" height="8" rx="1" />
              </svg>
              Print (A5)
            </button>
          </div>
        </div>

        {/* Personal + Emergency Contacts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Section title="Personal Information">
            <Row label="Address" value={d.address} />
            {d.reviewedMonth && <Row label="Last Reviewed" value={`${d.reviewedMonth} ${d.reviewedYear}`} />}
          </Section>

          <Section title="Emergency Contacts">
            {d.contacts.length === 0 || d.contacts.every(c => !c.name && !c.phone) ? (
              <p className="text-sm text-muted-foreground italic">None added</p>
            ) : (
              d.contacts.filter(c => c.name || c.phone).map((c, i) => (
                <div key={i} className="mb-3 last:mb-0">
                  <p className="text-sm font-medium">{c.name}{c.relation && <span className="text-muted-foreground font-normal"> ({c.relation})</span>}</p>
                  {c.phone && <p className="text-sm text-muted-foreground">{c.phone}</p>}
                  {c.address && <p className="text-sm text-muted-foreground">{c.address}</p>}
                </div>
              ))
            )}
          </Section>
        </div>

        {/* Medical Data */}
        <Section title="Medical Data">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <YesNoCard label="DNR" value={d.hasDNR} />
            <YesNoCard label="Blood Thinners" value={d.bloodThinners} />
          </div>
          {d.dnrLocation && <Row label="DNR Location" value={d.dnrLocation} />}
          {d.specialConditions && <Row label="Special Conditions" value={d.specialConditions} />}
        </Section>

        {/* Medical Conditions */}
        <Section title="Medical Conditions">
          {d.conditions.noKnownConditions ? (
            <p className="text-sm italic text-muted-foreground">No Known Medical Conditions</p>
          ) : (
            <>
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-x-4 gap-y-2">
                {CONDITION_LABELS.map(([key, label]) => {
                  const checked = Boolean(d.conditions[key as keyof typeof d.conditions])
                  return (
                    <div key={key} className={`flex items-center gap-2 text-sm ${checked ? 'text-foreground' : 'text-muted-foreground/40'}`}>
                      <span className={`text-base leading-none font-bold ${checked ? 'text-primary' : 'text-muted-foreground/30'}`}>
                        {checked ? '✓' : '□'}
                      </span>
                      {label}
                    </div>
                  )
                })}
                {/* Hepatitis */}
                <div className={`flex items-center gap-2 text-sm ${d.conditions.hepatitisType ? 'text-foreground' : 'text-muted-foreground/40'}`}>
                  <span className={`text-base leading-none font-bold ${d.conditions.hepatitisType ? 'text-primary' : 'text-muted-foreground/30'}`}>
                    {d.conditions.hepatitisType ? '✓' : '□'}
                  </span>
                  Hepatitis{d.conditions.hepatitisType ? ` (${d.conditions.hepatitisType})` : ''}
                </div>
              </div>
              {d.conditions.other?.trim() && (
                <p className="text-sm mt-3"><span className="font-medium">Other:</span> {d.conditions.other.trim()}</p>
              )}
            </>
          )}
        </Section>

        {/* Medications */}
        <Section title="Current Medications">
          {activeMeds.length === 0 ? (
            <p className="text-sm text-muted-foreground italic">None recorded</p>
          ) : (
            <table className="w-full text-sm border-collapse">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-left py-1.5 pr-4 text-xs font-medium text-muted-foreground uppercase tracking-wide">Medication</th>
                  <th className="text-left py-1.5 pr-4 text-xs font-medium text-muted-foreground uppercase tracking-wide">Dosage</th>
                  <th className="text-left py-1.5 text-xs font-medium text-muted-foreground uppercase tracking-wide">Frequency</th>
                </tr>
              </thead>
              <tbody>
                {activeMeds.map((m, i) => (
                  <tr key={i} className="border-b border-border/50">
                    <td className="py-1.5 pr-4">{m.name}</td>
                    <td className="py-1.5 pr-4">{m.dosage}</td>
                    <td className="py-1.5">{m.frequency}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </Section>

        {/* Allergies */}
        <Section title="Allergies">
          {d.noKnownAllergies
            ? <p className="text-sm italic text-muted-foreground">No Known Allergies</p>
            : <p className="text-sm whitespace-pre-wrap">{d.allergies || <span className="italic text-muted-foreground">Not specified</span>}</p>
          }
        </Section>

        {/* Physician */}
        {d.physicianInfo && (
          <Section title="Physician Information">
            <p className="text-sm whitespace-pre-wrap">{d.physicianInfo}</p>
          </Section>
        )}

        {/* Recent Surgeries */}
        {d.recentSurgeries.some(s => s.description.trim()) && (
          <Section title="Recent Surgeries / Procedures">
            {d.recentSurgeries.filter(s => s.description.trim()).map((s, i) => (
              <div key={i} className="flex items-baseline gap-3 text-sm mb-1">
                <span>{s.description}</span>
                {s.date && <span className="text-muted-foreground text-xs">{formatDate(s.date)}</span>}
              </div>
            ))}
          </Section>
        )}

        {/* Power of Attorney */}
        <Section title="Power of Attorney (Healthcare)">
          <div className="flex items-center gap-4">
            <YesNoCard label="Has POA" value={d.hasPowerOfAttorney} />
          </div>
          {d.hasPowerOfAttorney && d.powerOfAttorneyLocation && (
            <Row label="Location" value={d.powerOfAttorneyLocation} />
          )}
        </Section>

        {/* Edit History */}
        {editHistory.length > 0 && (
          <Section title={`Edit History (${editHistory.length})`}>
            <div className="space-y-1">
              {editHistory.map((h, i) => (
                <p key={i} className="text-sm text-muted-foreground">
                  #{editHistory.length - i} &mdash; {formatDateTime(h.edited_at)}
                </p>
              ))}
            </div>
          </Section>
        )}
      </div>

      {/* ── PRINT ONLY (hidden on screen, rendered when printing) ── */}
      <div className="print-only hidden">
        <PrintContent d={d} activeMeds={activeMeds} checkedConditions={checkedConditions} formatDate={formatDate} />
      </div>
    </>
  )
}

/* ── Screen helper components ── */

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="bg-card border border-border rounded-lg p-5">
      <h2 className="font-serif text-base font-semibold mb-3 pb-2 border-b border-border">{title}</h2>
      {children}
    </div>
  )
}

function Row({ label, value }: { label: string; value: string }) {
  if (!value) return null
  return (
    <div className="flex gap-2 text-sm mb-1.5">
      <span className="text-muted-foreground min-w-28 shrink-0">{label}:</span>
      <span className="text-foreground">{value}</span>
    </div>
  )
}

function YesNoCard({ label, value }: { label: string; value: boolean | null }) {
  return (
    <div className="flex flex-col gap-0.5">
      <span className="text-xs text-muted-foreground uppercase tracking-wide">{label}</span>
      <span className={`text-sm font-semibold ${value === true ? 'text-primary' : value === false ? 'text-muted-foreground' : 'text-muted-foreground'}`}>
        {value === null ? '—' : value ? 'Yes' : 'No'}
      </span>
    </div>
  )
}

/* ── Print layout (A5, 2-column) ── */

interface PrintContentProps {
  d: FormData
  activeMeds: FormData['medications']
  checkedConditions: Array<[keyof FormData['conditions'], string]>
  formatDate: (s: string) => string
}

function PrintContent({ d, activeMeds, checkedConditions, formatDate }: PrintContentProps) {
  return (
    <div style={{ fontFamily: 'Arial, sans-serif', fontSize: '10px', color: '#111', width: '100%' }}>
      {/* Header */}
      <div style={{ borderBottom: '2px solid #E85D04', marginBottom: '6px', paddingBottom: '4px', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
          <div style={{ fontSize: '14px', fontWeight: 700, color: '#E85D04' }}>FILE OF LIFE</div>
          <div style={{ fontSize: '8px', color: '#666', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Frisco Texas Fire Department</div>
        </div>
        <div style={{ textAlign: 'right' }}>
          <div style={{ fontSize: '12px', fontWeight: 700 }}>{d.name || '____________________'}</div>
          <div style={{ fontSize: '9px', color: '#555' }}>
            {d.sex && <span>Sex: {d.sex}&nbsp;&nbsp;</span>}
            {d.dateOfBirth && <span>DOB: {formatDate(d.dateOfBirth)}&nbsp;&nbsp;</span>}
            {d.phone && <span>Ph: {d.phone}</span>}
          </div>
          {d.address && <div style={{ fontSize: '9px', color: '#555' }}>{d.address}</div>}
          {(d.reviewedMonth || d.reviewedYear) && (
            <div style={{ fontSize: '8px', color: '#888' }}>Reviewed: {d.reviewedMonth} {d.reviewedYear}</div>
          )}
        </div>
      </div>

      {/* Two-column body */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
        {/* LEFT */}
        <div>
          <PBlock title="Emergency Contacts">
            {d.contacts.filter(c => c.name || c.phone).length === 0
              ? <div style={{ fontSize: '9px', color: '#888', fontStyle: 'italic' }}>None</div>
              : d.contacts.filter(c => c.name || c.phone).map((c, i) => (
                <div key={i} style={{ marginBottom: '3px' }}>
                  <div style={{ fontWeight: 600 }}>{c.name}{c.relation && ` (${c.relation})`}</div>
                  {c.phone && <div style={{ color: '#555' }}>{c.phone}</div>}
                  {c.address && <div style={{ color: '#666', fontSize: '8.5px' }}>{c.address}</div>}
                </div>
              ))
            }
          </PBlock>

          <PBlock title="Medical Data">
            <PYesNo label="DNR" value={d.hasDNR} />
            {d.hasDNR && d.dnrLocation && <PField label="DNR Location" value={d.dnrLocation} />}
            <PYesNo label="Blood Thinners" value={d.bloodThinners} />
            {d.specialConditions && <PField label="Special Conditions" value={d.specialConditions} />}
          </PBlock>

          {activeMeds.length > 0 && (
            <PBlock title="Current Medications">
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ borderBottom: '1px solid #ddd' }}>
                    <th style={{ textAlign: 'left', padding: '1px 2px', fontSize: '7.5px', color: '#666', fontWeight: 600, textTransform: 'uppercase' }}>Medication</th>
                    <th style={{ textAlign: 'left', padding: '1px 2px', fontSize: '7.5px', color: '#666', fontWeight: 600, textTransform: 'uppercase' }}>Dosage</th>
                    <th style={{ textAlign: 'left', padding: '1px 2px', fontSize: '7.5px', color: '#666', fontWeight: 600, textTransform: 'uppercase' }}>Frequency</th>
                  </tr>
                </thead>
                <tbody>
                  {activeMeds.map((m, i) => (
                    <tr key={i} style={{ borderBottom: '1px solid #f0f0f0' }}>
                      <td style={{ padding: '1px 2px' }}>{m.name}</td>
                      <td style={{ padding: '1px 2px' }}>{m.dosage}</td>
                      <td style={{ padding: '1px 2px' }}>{m.frequency}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </PBlock>
          )}

          {d.physicianInfo && (
            <PBlock title="Physician Information">
              <div style={{ whiteSpace: 'pre-wrap' }}>{d.physicianInfo}</div>
            </PBlock>
          )}
        </div>

        {/* RIGHT */}
        <div>
          <PBlock title="Medical Conditions">
            {d.conditions.noKnownConditions ? (
              <div style={{ fontStyle: 'italic', color: '#666' }}>No Known Medical Conditions</div>
            ) : checkedConditions.length === 0 && !d.conditions.hepatitisType ? (
              <div style={{ fontStyle: 'italic', color: '#888' }}>None checked</div>
            ) : (
              <>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1px 4px' }}>
                  {checkedConditions.map(([key, label]) => (
                    <div key={key} style={{ display: 'flex', alignItems: 'center', gap: '3px', fontSize: '8.5px' }}>
                      <span style={{ color: '#E85D04', fontWeight: 700 }}>✓</span> {label}
                    </div>
                  ))}
                  {d.conditions.hepatitisType && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '3px', fontSize: '8.5px' }}>
                      <span style={{ color: '#E85D04', fontWeight: 700 }}>✓</span> Hepatitis ({d.conditions.hepatitisType})
                    </div>
                  )}
                </div>
                {d.conditions.other?.trim() && (
                  <div style={{ marginTop: '3px', fontSize: '8.5px' }}>
                    <span style={{ fontWeight: 600 }}>Other:</span> {d.conditions.other.trim()}
                  </div>
                )}
              </>
            )}
          </PBlock>

          <PBlock title="Allergies">
            {d.noKnownAllergies
              ? <div style={{ fontStyle: 'italic', color: '#666' }}>No Known Allergies</div>
              : <div style={{ whiteSpace: 'pre-wrap' }}>{d.allergies || <span style={{ color: '#999', fontStyle: 'italic' }}>Not specified</span>}</div>
            }
          </PBlock>

          {d.recentSurgeries.some(s => s.description.trim()) && (
            <PBlock title="Recent Surgeries / Procedures">
              {d.recentSurgeries.filter(s => s.description.trim()).map((s, i) => (
                <div key={i} style={{ marginBottom: '2px' }}>
                  {s.description}
                  {s.date && <span style={{ color: '#666', fontSize: '8.5px' }}> — {formatDate(s.date)}</span>}
                </div>
              ))}
            </PBlock>
          )}

          <PBlock title="Power of Attorney (Healthcare)">
            <PYesNo label="Has POA" value={d.hasPowerOfAttorney} />
            {d.hasPowerOfAttorney && d.powerOfAttorneyLocation && (
              <PField label="Location" value={d.powerOfAttorneyLocation} />
            )}
          </PBlock>
        </div>
      </div>
    </div>
  )
}

function PBlock({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div style={{ marginBottom: '7px', borderLeft: '2px solid #E85D04', paddingLeft: '5px' }}>
      <div style={{ fontSize: '7.5px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.07em', color: '#E85D04', marginBottom: '2px' }}>
        {title}
      </div>
      <div style={{ fontSize: '9px' }}>{children}</div>
    </div>
  )
}

function PField({ label, value }: { label: string; value: string }) {
  if (!value) return null
  return (
    <div style={{ marginBottom: '1px' }}>
      <span style={{ fontWeight: 600, color: '#555' }}>{label}: </span>
      {value}
    </div>
  )
}

function PYesNo({ label, value }: { label: string; value: boolean | null }) {
  return (
    <div style={{ marginBottom: '1px' }}>
      <span style={{ fontWeight: 600, color: '#555' }}>{label}: </span>
      {value === null ? '—' : value ? 'Yes' : 'No'}
    </div>
  )
}
