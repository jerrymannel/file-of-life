import { useEffect, useRef, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { getRecord, saveRecord, updateRecord, getEditHistory } from '../db/database'
import { createDefaultFormData } from '../types'
import type { FormData, EditHistoryRow, EmergencyContact } from '../types'
import { FormSection } from '../components/FormSection'
import { InputField, TextareaField, PhoneInput, formatPhone } from '../components/InputField'
import { CheckboxField } from '../components/CheckboxField'
import { EditHistoryPanel } from '../components/EditHistoryPanel'

const MONTHS = [
  'January','February','March','April','May','June',
  'July','August','September','October','November','December',
]

const CONDITION_LABELS: Array<[keyof FormData['conditions'], string]> = [
  ['noKnownConditions', 'No Known Conditions'],
  ['alzheimers', "Alzheimer's Disease"],
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
  ['diabetesInsulinDependent', 'Diabetes (Insulin Dependent)'],
  ['epilepsy', 'Epilepsy'],
  ['heartValveReplacement', 'Heart Valve Replacement'],
  ['hypoglycemia', 'Hypoglycemia'],
  ['hypertension', 'Hypertension'],
  ['hyperthyroidism', 'Hyperthyroidism'],
  ['hypothyroidism', 'Hypothyroidism'],
  ['kidneyDisease', 'Kidney Disease'],
  ['laryngectomy', 'Laryngectomy'],
  ['myocardialInfarction', 'Myocardial Infarction (MI)'],
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

export function FormPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const isEditing = Boolean(id)
  const recordId = id ? parseInt(id, 10) : null

  const [formData, setFormData] = useState<FormData>(createDefaultFormData)
  const [editHistory, setEditHistory] = useState<EditHistoryRow[]>([])
  const [loading, setLoading] = useState(isEditing)
  const [saving, setSaving] = useState(false)
  const [lastSaved, setLastSaved] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const topRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!isEditing || !recordId) return
    const load = async () => {
      try {
        const record = await getRecord(recordId)
        if (!record) {
          navigate('/')
          return
        }
        setFormData(record.data)
        setLastSaved(record.updated_at)
        const history = await getEditHistory(recordId)
        setEditHistory(history)
      } catch (err) {
        setError(String(err))
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [isEditing, recordId, navigate])

  const updateField = <K extends keyof FormData>(key: K, value: FormData[K]) => {
    setFormData((prev) => ({ ...prev, [key]: value }))
  }

  const updateContact = (idx: number, field: keyof EmergencyContact, value: string) => {
    setFormData((prev) => {
      const contacts = [...prev.contacts]
      contacts[idx] = { ...contacts[idx], [field]: value }
      return { ...prev, contacts }
    })
  }

  const addContact = () => {
    setFormData((prev) => ({
      ...prev,
      contacts: [...prev.contacts, { name: '', phone: '', address: '', relation: '' }],
    }))
  }

  const removeContact = (idx: number) => {
    setFormData((prev) => {
      if (prev.contacts.length <= 1) return prev
      return { ...prev, contacts: prev.contacts.filter((_, i) => i !== idx) }
    })
  }

  const updateMedication = (idx: number, field: keyof FormData['medications'][0], value: string) => {
    setFormData((prev) => {
      const medications = [...prev.medications]
      medications[idx] = { ...medications[idx], [field]: value }
      return { ...prev, medications }
    })
  }

  const addMedication = () => {
    setFormData((prev) => ({
      ...prev,
      medications: [...prev.medications, { name: '', dosage: '', frequency: '' }],
    }))
  }

  const removeMedication = (idx: number) => {
    setFormData((prev) => {
      if (prev.medications.length <= 1) return prev
      const medications = prev.medications.filter((_, i) => i !== idx)
      return { ...prev, medications }
    })
  }

  const updateCondition = (key: ConditionBoolKey, value: boolean) => {
    setFormData((prev) => {
      if (key === 'noKnownConditions' && value) {
        // Clear everything else when "no known conditions" is selected
        const cleared = Object.fromEntries(
          Object.keys(prev.conditions).map((k) => [k, typeof prev.conditions[k as keyof typeof prev.conditions] === 'boolean' ? false : ''])
        ) as unknown as typeof prev.conditions
        return { ...prev, conditions: { ...cleared, noKnownConditions: true } }
      }
      return { ...prev, conditions: { ...prev.conditions, [key]: value } }
    })
  }

  const updateConditionText = (key: 'hepatitisType' | 'other', value: string) => {
    setFormData((prev) => ({
      ...prev,
      conditions: { ...prev.conditions, [key]: value },
    }))
  }

  const updateSurgery = (idx: number, field: keyof FormData['recentSurgeries'][0], value: string) => {
    setFormData((prev) => {
      const recentSurgeries = [...prev.recentSurgeries]
      recentSurgeries[idx] = { ...recentSurgeries[idx], [field]: value }
      return { ...prev, recentSurgeries }
    })
  }

  const addSurgery = () => {
    setFormData((prev) => ({
      ...prev,
      recentSurgeries: [...prev.recentSurgeries, { description: '', date: '' }],
    }))
  }

  const removeSurgery = (idx: number) => {
    setFormData((prev) => {
      if (prev.recentSurgeries.length <= 1) return prev
      const recentSurgeries = prev.recentSurgeries.filter((_, i) => i !== idx)
      return { ...prev, recentSurgeries }
    })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    setError(null)
    try {
      if (isEditing && recordId) {
        await updateRecord(recordId, formData)
      } else {
        await saveRecord(formData)
      }
      navigate('/')
    } catch (err) {
      setError(String(err))
    } finally {
      setSaving(false)
    }
  }

  const formatDateTime = (isoString: string) => {
    try {
      return new Date(isoString).toLocaleString()
    } catch {
      return isoString
    }
  }

  const selectClass = 'border border-input rounded-md px-3 py-2 bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-ring/50 transition-shadow'
  const inputClass = 'border border-input rounded-md px-3 py-2 bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-ring/50 transition-shadow'

  if (loading) {
    return (
      <div className="flex items-center justify-center py-24">
        <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>
      </div>
    )
  }

  const SaveButton = () => (
    <button
      type="submit"
      disabled={saving}
      className="inline-flex items-center gap-2 bg-primary text-primary-foreground px-5 py-2.5 rounded-md font-medium text-sm hover:opacity-90 transition-opacity disabled:opacity-60"
    >
      {saving ? (
        <>
          <div className="w-4 h-4 border-2 border-primary-foreground/40 border-t-primary-foreground rounded-full animate-spin"></div>
          Saving...
        </>
      ) : (
        <>
          <svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M15.2 3a2 2 0 0 1 1.4.6l3.8 3.8a2 2 0 0 1 .6 1.4V19a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2z"/>
            <path d="M17 21v-7a1 1 0 0 0-1-1H8a1 1 0 0 0-1 1v7"/>
            <path d="M7 3v4a1 1 0 0 0 1 1h7"/>
          </svg>
          {isEditing ? 'Save Changes' : 'Save Record'}
        </>
      )}
    </button>
  )

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div ref={topRef} className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="font-serif text-2xl font-semibold">
            {isEditing ? 'Edit Record' : 'New Medical Record'}
          </h1>
          {lastSaved && (
            <p className="text-xs text-muted-foreground mt-0.5">
              Last saved: {formatDateTime(lastSaved)}
            </p>
          )}
        </div>
        <div className="flex items-center gap-3">
          {isEditing && (
            <a
              href={`/print/${recordId}`}
              onClick={(e) => { e.preventDefault(); navigate(`/print/${recordId}`) }}
              className="inline-flex items-center gap-2 border border-border px-4 py-2 rounded-md font-medium text-sm hover:bg-muted transition-colors"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"/>
                <path d="M6 9V3a1 1 0 0 1 1-1h10a1 1 0 0 1 1 1v6"/>
                <rect x="6" y="14" width="12" height="8" rx="1"/>
              </svg>
              Print
            </a>
          )}
          <SaveButton />
        </div>
      </div>

      {error && (
        <div className="bg-destructive/10 border border-destructive/30 text-destructive rounded-md px-4 py-3 text-sm">
          {error}
        </div>
      )}

      {/* Section 1: Personal Information */}
      <FormSection title="Personal Information">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <InputField
            label="Full Name"
            id="name"
            value={formData.name}
            onChange={(v) => updateField('name', v)}
            placeholder="First and last name"
            required
            className="lg:col-span-2"
          />
          <div className="flex flex-col gap-1">
            <label className="text-sm font-medium text-muted-foreground">Sex</label>
            <select
              value={formData.sex}
              onChange={(e) => updateField('sex', e.target.value as FormData['sex'])}
              className={selectClass}
            >
              <option value="">— Select —</option>
              <option value="M">Male</option>
              <option value="F">Female</option>
            </select>
          </div>
          <InputField
            label="Address"
            id="address"
            value={formData.address}
            onChange={(v) => updateField('address', v)}
            placeholder="Street, City, State ZIP"
            className="lg:col-span-2"
          />
          <PhoneInput
            label="Phone Number"
            id="phone"
            value={formData.phone}
            onChange={(v) => updateField('phone', v)}
          />
          <InputField
            label="Date of Birth"
            id="dateOfBirth"
            value={formData.dateOfBirth}
            onChange={(v) => updateField('dateOfBirth', v)}
            type="date"
          />
          <div className="flex flex-col gap-1">
            <label className="text-sm font-medium text-muted-foreground">Reviewed Month</label>
            <select
              value={formData.reviewedMonth}
              onChange={(e) => updateField('reviewedMonth', e.target.value)}
              className={selectClass}
            >
              <option value="">— Month —</option>
              {MONTHS.map((m) => (
                <option key={m} value={m}>{m}</option>
              ))}
            </select>
          </div>
          <InputField
            label="Reviewed Year"
            id="reviewedYear"
            value={formData.reviewedYear}
            onChange={(v) => updateField('reviewedYear', v)}
            placeholder="2024"
            type="number"
          />
        </div>
      </FormSection>

      {/* Section 2: Emergency Contacts */}
      <FormSection title="Emergency Contacts">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {formData.contacts.map((contact, idx) => (
            <div key={idx} className="rounded-lg border border-border bg-card flex flex-col shadow-sm">
              <div className="flex items-center justify-between px-4 py-2.5 bg-muted/50 border-b border-border rounded-t-lg">
                <span className="text-sm font-semibold text-foreground">Contact {idx + 1}</span>
                {formData.contacts.length > 1 && (
                  <button
                    type="button"
                    onClick={() => removeContact(idx)}
                    className="p-1 rounded text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors"
                    aria-label={`Remove contact ${idx + 1}`}
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M18 6 6 18M6 6l12 12"/>
                    </svg>
                  </button>
                )}
              </div>
              <div className="p-4 flex flex-col gap-3 flex-1">
                <div className="flex flex-col gap-1">
                  <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Name</label>
                  <input
                    type="text"
                    value={contact.name}
                    onChange={(e) => updateContact(idx, 'name', e.target.value)}
                    placeholder="Full name"
                    className={inputClass + ' w-full'}
                    aria-label={`Contact ${idx + 1} name`}
                  />
                </div>
                <div className="flex flex-col gap-1">
                  <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Phone</label>
                  <input
                    type="tel"
                    inputMode="numeric"
                    value={contact.phone}
                    onChange={(e) => updateContact(idx, 'phone', formatPhone(e.target.value))}
                    placeholder="(555) 000-0000"
                    className={inputClass + ' w-full'}
                    aria-label={`Contact ${idx + 1} phone`}
                  />
                </div>
                <div className="flex flex-col gap-1">
                  <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Address</label>
                  <input
                    type="text"
                    value={contact.address}
                    onChange={(e) => updateContact(idx, 'address', e.target.value)}
                    placeholder="Street, City, State"
                    className={inputClass + ' w-full'}
                    aria-label={`Contact ${idx + 1} address`}
                  />
                </div>
                <div className="flex flex-col gap-1">
                  <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Relation</label>
                  <input
                    type="text"
                    value={contact.relation}
                    onChange={(e) => updateContact(idx, 'relation', e.target.value)}
                    placeholder="e.g., Spouse, Child"
                    className={inputClass + ' w-full'}
                    aria-label={`Contact ${idx + 1} relation`}
                  />
                </div>
              </div>
            </div>
          ))}
          <div className="rounded-lg border border-dashed border-border flex items-center justify-center min-h-[180px]">
            <button
              type="button"
              onClick={addContact}
              className="flex flex-col items-center gap-2 text-sm text-muted-foreground hover:text-primary transition-colors p-6"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M5 12h14M12 5v14"/>
              </svg>
              Add Contact
            </button>
          </div>
        </div>
      </FormSection>

      {/* Section 3: Medical Data */}
      <FormSection title="Medical Data">
        <div className="space-y-5">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div className="flex flex-col gap-2">
              <p className="text-sm font-medium text-muted-foreground">Do Not Resuscitate (DNR)?</p>
              <div className="flex gap-4">
                {[{ label: 'Yes', val: true }, { label: 'No', val: false }].map(({ label, val }) => (
                  <label key={label} className="flex items-center gap-2 cursor-pointer">
                    <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center transition-all ${formData.hasDNR === val ? 'border-primary' : 'border-input'}`}>
                      {formData.hasDNR === val && <div className="w-2 h-2 rounded-full bg-primary" />}
                    </div>
                    <input
                      type="radio"
                      className="sr-only"
                      checked={formData.hasDNR === val}
                      onChange={() => updateField('hasDNR', val)}
                    />
                    <span className="text-sm">{label}</span>
                  </label>
                ))}
              </div>
            </div>
            <InputField
              label="DNR Location"
              id="dnrLocation"
              value={formData.dnrLocation}
              onChange={(v) => updateField('dnrLocation', v)}
              placeholder="Where is the DNR document located?"
            />
          </div>
          <TextareaField
            label="Special Conditions / Notes"
            id="specialConditions"
            value={formData.specialConditions}
            onChange={(v) => updateField('specialConditions', v)}
            placeholder="Any special medical conditions or important notes..."
            rows={3}
          />
          <div className="flex flex-col gap-2">
            <p className="text-sm font-medium text-muted-foreground">Currently taking blood thinners?</p>
            <div className="flex gap-4">
              {[{ label: 'Yes', val: true }, { label: 'No', val: false }].map(({ label, val }) => (
                <label key={label} className="flex items-center gap-2 cursor-pointer">
                  <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center transition-all ${formData.bloodThinners === val ? 'border-primary' : 'border-input'}`}>
                    {formData.bloodThinners === val && <div className="w-2 h-2 rounded-full bg-primary" />}
                  </div>
                  <input
                    type="radio"
                    className="sr-only"
                    checked={formData.bloodThinners === val}
                    onChange={() => updateField('bloodThinners', val)}
                  />
                  <span className="text-sm">{label}</span>
                </label>
              ))}
            </div>
          </div>
        </div>
      </FormSection>

      {/* Section 4: Medications */}
      <FormSection title="Current Medications">
        <div className="rounded-lg border border-border overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-muted/50 border-b border-border">
                <th className="px-4 py-2.5 text-left text-xs font-medium text-muted-foreground uppercase tracking-wide">Medication / Name</th>
                <th className="px-4 py-2.5 text-left text-xs font-medium text-muted-foreground uppercase tracking-wide w-36">Dosage</th>
                <th className="px-4 py-2.5 text-left text-xs font-medium text-muted-foreground uppercase tracking-wide w-40">Frequency</th>
                <th className="w-10" />
              </tr>
            </thead>
            <tbody>
              {formData.medications.map((med, idx) => (
                <tr key={idx} className="border-b border-border last:border-0">
                  <td className="px-3 py-1.5">
                    <input
                      type="text"
                      value={med.name}
                      onChange={(e) => updateMedication(idx, 'name', e.target.value)}
                      placeholder="Medication name"
                      className={inputClass + ' w-full'}
                      aria-label={`Medication ${idx + 1} name`}
                    />
                  </td>
                  <td className="px-3 py-1.5">
                    <input
                      type="text"
                      value={med.dosage}
                      onChange={(e) => updateMedication(idx, 'dosage', e.target.value)}
                      placeholder="e.g., 10mg"
                      className={inputClass + ' w-full'}
                      aria-label={`Medication ${idx + 1} dosage`}
                    />
                  </td>
                  <td className="px-3 py-1.5">
                    <input
                      type="text"
                      value={med.frequency}
                      onChange={(e) => updateMedication(idx, 'frequency', e.target.value)}
                      placeholder="e.g., Twice daily"
                      className={inputClass + ' w-full'}
                      aria-label={`Medication ${idx + 1} frequency`}
                    />
                  </td>
                  <td className="px-2 py-1.5 text-center">
                    <button
                      type="button"
                      onClick={() => removeMedication(idx)}
                      disabled={formData.medications.length <= 1}
                      className="p-1.5 rounded text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                      aria-label="Remove medication"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M18 6 6 18M6 6l12 12"/>
                      </svg>
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <button
          type="button"
          onClick={addMedication}
          className="mt-3 inline-flex items-center gap-2 text-sm text-primary hover:text-primary/80 font-medium transition-colors"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M5 12h14M12 5v14"/>
          </svg>
          Add Medication
        </button>
      </FormSection>

      {/* Section 5: Medical Conditions */}
      <FormSection title="Medical Conditions">
        {(() => {
          const noKnown = formData.conditions.noKnownConditions
          return (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-6 gap-y-3">
              {CONDITION_LABELS.map(([key, label]) => {
                if (key === 'hepatitisType' || key === 'other') return null
                const boolKey = key as ConditionBoolKey
                const isNoKnownKey = boolKey === 'noKnownConditions'
                return (
                  <CheckboxField
                    key={key}
                    id={`condition-${key}`}
                    label={label}
                    checked={formData.conditions[boolKey] as boolean}
                    onChange={(v) => updateCondition(boolKey, v)}
                    disabled={!isNoKnownKey && noKnown}
                  />
                )
              })}
              {/* Hepatitis with inline type input */}
              <div className="flex items-center gap-2">
                <CheckboxField
                  id="condition-hepatitis"
                  label="Hepatitis Type"
                  checked={formData.conditions.hepatitisType !== ''}
                  onChange={(v) => updateConditionText('hepatitisType', v ? 'A' : '')}
                  disabled={noKnown}
                />
                {formData.conditions.hepatitisType !== '' && !noKnown && (
                  <input
                    type="text"
                    value={formData.conditions.hepatitisType}
                    onChange={(e) => updateConditionText('hepatitisType', e.target.value)}
                    placeholder="A/B/C"
                    maxLength={1}
                    className="w-14 border border-input rounded px-2 py-1 text-sm bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-ring/50"
                    aria-label="Hepatitis type"
                  />
                )}
              </div>
              {/* Other with text input */}
              <div className="flex items-center gap-2 sm:col-span-2 lg:col-span-1">
                <CheckboxField
                  id="condition-other"
                  label="Other:"
                  checked={formData.conditions.other !== ''}
                  onChange={(v) => updateConditionText('other', v ? ' ' : '')}
                  disabled={noKnown}
                />
                {formData.conditions.other !== '' && !noKnown && (
                  <input
                    type="text"
                    value={formData.conditions.other.trim()}
                    onChange={(e) => updateConditionText('other', e.target.value || ' ')}
                    placeholder="Specify..."
                    className="flex-1 border border-input rounded px-2 py-1 text-sm bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-ring/50"
                    aria-label="Other condition"
                  />
                )}
              </div>
            </div>
          )
        })()}
      </FormSection>

      {/* Section 6: Allergies */}
      <FormSection title="Allergies">
        <div className="space-y-4">
          <CheckboxField
            id="noKnownAllergies"
            label="No Known Allergies"
            checked={formData.noKnownAllergies}
            onChange={(v) => updateField('noKnownAllergies', v)}
          />
          {!formData.noKnownAllergies && (
            <TextareaField
              label="Known Allergies"
              id="allergies"
              value={formData.allergies}
              onChange={(v) => updateField('allergies', v)}
              placeholder="List all known allergies, including drug, food, and environmental..."
              rows={3}
            />
          )}
        </div>
      </FormSection>

      {/* Section 7: Physician Info */}
      <FormSection title="Physician / Doctor Information">
        <TextareaField
          label="Physician Information"
          id="physicianInfo"
          value={formData.physicianInfo}
          onChange={(v) => updateField('physicianInfo', v)}
          placeholder="Name, clinic, address, phone number..."
          rows={3}
        />
      </FormSection>

      {/* Section 8: Recent Surgery */}
      <FormSection title="Recent Surgeries / Procedures">
        <div className="space-y-4">
          {formData.recentSurgeries.map((surgery, idx) => (
            <div key={idx} className="rounded-lg border border-border bg-muted/30 overflow-hidden">
              <div className="flex items-center justify-between px-4 py-2 bg-muted/50 border-b border-border">
                <span className="text-sm font-medium">Surgery / Procedure {idx + 1}</span>
                {formData.recentSurgeries.length > 1 && (
                  <button
                    type="button"
                    onClick={() => removeSurgery(idx)}
                    className="p-1 rounded text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors"
                    aria-label={`Remove surgery ${idx + 1}`}
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M18 6 6 18M6 6l12 12"/>
                    </svg>
                  </button>
                )}
              </div>
              <table className="w-full text-sm">
                <tbody>
                  <tr>
                    <td className="px-4 py-2 text-muted-foreground font-medium w-28 bg-muted/20">Description</td>
                    <td className="px-3 py-1.5">
                      <input
                        type="text"
                        value={surgery.description}
                        onChange={(e) => updateSurgery(idx, 'description', e.target.value)}
                        placeholder="Surgery or procedure name"
                        className={inputClass + ' w-full'}
                        aria-label={`Surgery ${idx + 1} description`}
                      />
                    </td>
                    <td className="px-4 py-2 text-muted-foreground font-medium w-16 bg-muted/20 border-l border-border">Date</td>
                    <td className="px-3 py-1.5 w-44">
                      <input
                        type="date"
                        value={surgery.date}
                        onChange={(e) => updateSurgery(idx, 'date', e.target.value)}
                        className={inputClass + ' w-full'}
                        aria-label={`Surgery ${idx + 1} date`}
                      />
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          ))}
          <button
            type="button"
            onClick={addSurgery}
            className="inline-flex items-center gap-2 text-sm text-primary hover:text-primary/80 font-medium transition-colors"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M5 12h14M12 5v14"/>
            </svg>
            Add Surgery / Procedure
          </button>
        </div>
      </FormSection>

      {/* Section 9: Power of Attorney */}
      <FormSection title="Power of Attorney (Healthcare)">
        <div className="space-y-4">
          <div className="flex flex-col gap-2">
            <p className="text-sm font-medium text-muted-foreground">Do you have a Healthcare Power of Attorney?</p>
            <div className="flex gap-4">
              {[{ label: 'Yes', val: true }, { label: 'No', val: false }].map(({ label, val }) => (
                <label key={label} className="flex items-center gap-2 cursor-pointer">
                  <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center transition-all ${formData.hasPowerOfAttorney === val ? 'border-primary' : 'border-input'}`}>
                    {formData.hasPowerOfAttorney === val && <div className="w-2 h-2 rounded-full bg-primary" />}
                  </div>
                  <input
                    type="radio"
                    className="sr-only"
                    checked={formData.hasPowerOfAttorney === val}
                    onChange={() => updateField('hasPowerOfAttorney', val)}
                  />
                  <span className="text-sm">{label}</span>
                </label>
              ))}
            </div>
          </div>
          {formData.hasPowerOfAttorney && (
            <InputField
              label="Power of Attorney Document Location"
              id="powerOfAttorneyLocation"
              value={formData.powerOfAttorneyLocation}
              onChange={(v) => updateField('powerOfAttorneyLocation', v)}
              placeholder="Where is the document located?"
            />
          )}
        </div>
      </FormSection>

      {/* Edit History (collapsible, only when editing) */}
      {isEditing && editHistory.length > 0 && (
        <EditHistoryPanel history={editHistory} collapsible />
      )}

      {/* Bottom save bar */}
      <div className="sticky bottom-0 no-print bg-card/90 backdrop-blur-sm border-t border-border -mx-4 px-4 py-4 flex items-center justify-between gap-4">
        {lastSaved && (
          <p className="text-xs text-muted-foreground">
            Last saved: {formatDateTime(lastSaved)}
          </p>
        )}
        <div className={`flex gap-3 ${lastSaved ? '' : 'ml-auto'}`}>
          <button
            type="button"
            onClick={() => navigate('/')}
            className="px-4 py-2 rounded-md border border-border bg-background text-sm font-medium hover:bg-muted transition-colors"
          >
            Cancel
          </button>
          <SaveButton />
        </div>
      </div>
    </form>
  )
}
