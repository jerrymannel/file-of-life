export interface EmergencyContact {
  name: string
  phone: string
  address: string
  relation: string
}

export interface Medication {
  name: string
  dosage: string
  frequency: string
}

export interface MedicalConditions {
  noKnownConditions: boolean
  alzheimers: boolean
  angina: boolean
  anxiety: boolean
  arthritis: boolean
  asthma: boolean
  atrialFibrillation: boolean
  bipolarDisorder: boolean
  bleedingDisorder: boolean
  cancer: boolean
  cardiacDysrhythmia: boolean
  congestiveHeartFailure: boolean
  coronaryArteryDisease: boolean
  copd: boolean
  clottingDisorder: boolean
  dementia: boolean
  depression: boolean
  diabetesInsulinDependent: boolean
  epilepsy: boolean
  heartValveReplacement: boolean
  hepatitisType: string
  hypoglycemia: boolean
  hypertension: boolean
  hyperthyroidism: boolean
  hypothyroidism: boolean
  kidneyDisease: boolean
  laryngectomy: boolean
  myocardialInfarction: boolean
  pacemaker: boolean
  parkinsonDisease: boolean
  pneumonia: boolean
  renalFailure: boolean
  seizureDisorder: boolean
  stroke: boolean
  tia: boolean
  tuberculosis: boolean
  other: string
}

export interface RecentSurgery {
  description: string
  date: string
}

export interface FormData {
  // Section 1: Personal Information
  name: string
  sex: 'M' | 'F' | ''
  address: string
  phone: string
  dateOfBirth: string
  reviewedMonth: string
  reviewedYear: string

  // Section 2: Emergency Contacts
  contacts: EmergencyContact[]

  // Section 3: Medical Data
  hasDNR: boolean | null
  dnrLocation: string
  specialConditions: string
  bloodThinners: boolean | null

  // Section 4: Medications
  medications: Medication[]

  // Section 5: Medical Conditions
  conditions: MedicalConditions

  // Section 6: Allergies
  noKnownAllergies: boolean
  allergies: string

  // Section 7: Physician Info
  physicianInfo: string

  // Section 8: Recent Surgery
  recentSurgeries: RecentSurgery[]

  // Section 9: Power of Attorney
  hasPowerOfAttorney: boolean | null
  powerOfAttorneyLocation: string
}

export interface RecordRow {
  id: number
  created_at: string
  updated_at: string
  data: FormData
  editCount?: number
}

export interface EditHistoryRow {
  id: number
  record_id: number
  edited_at: string
  snapshot: FormData
}

export function createDefaultFormData(): FormData {
  return {
    name: '',
    sex: '',
    address: '',
    phone: '',
    dateOfBirth: '',
    reviewedMonth: '',
    reviewedYear: '',
    contacts: [
      { name: '', phone: '', address: '', relation: '' },
    ],
    hasDNR: null,
    dnrLocation: '',
    specialConditions: '',
    bloodThinners: null,
    medications: [{ name: '', dosage: '', frequency: '' }],
    conditions: {
      noKnownConditions: false,
      alzheimers: false,
      angina: false,
      anxiety: false,
      arthritis: false,
      asthma: false,
      atrialFibrillation: false,
      bipolarDisorder: false,
      bleedingDisorder: false,
      cancer: false,
      cardiacDysrhythmia: false,
      congestiveHeartFailure: false,
      coronaryArteryDisease: false,
      copd: false,
      clottingDisorder: false,
      dementia: false,
      depression: false,
      diabetesInsulinDependent: false,
      epilepsy: false,
      heartValveReplacement: false,
      hepatitisType: '',
      hypoglycemia: false,
      hypertension: false,
      hyperthyroidism: false,
      hypothyroidism: false,
      kidneyDisease: false,
      laryngectomy: false,
      myocardialInfarction: false,
      pacemaker: false,
      parkinsonDisease: false,
      pneumonia: false,
      renalFailure: false,
      seizureDisorder: false,
      stroke: false,
      tia: false,
      tuberculosis: false,
      other: '',
    },
    noKnownAllergies: false,
    allergies: '',
    physicianInfo: '',
    recentSurgeries: [{ description: '', date: '' }],
    hasPowerOfAttorney: null,
    powerOfAttorneyLocation: '',
  }
}
