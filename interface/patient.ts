export type Gender = "Male" | "Female" | "Other" | "Prefer not to say";
export type PatientStatus = "inactive" | "actively filling" | "submitted";

export interface EmergencyContact {
  name?: string;
  relationship?: string;
}

export interface PatientData {
  id?: string;
  firstName: string;
  middleName?: string;
  lastName: string;
  dateOfBirth: string;
  gender: Gender | "";
  phoneNumber: string;
  email: string;
  address: string;
  preferredLanguage: string;
  nationality: string;
  emergencyContact?: EmergencyContact;
  religion?: string;
}

export interface PatientRealTimeState {
  sessionId: string;
  patientData: PatientData;
  status: PatientStatus;
  lastUpdated: string;
  lastChangedField?: string;
  isOnline?: boolean;
}

export interface SupabasePatientRow {
  session_id: string;
  patient_data: PatientData;
  status: PatientStatus;
  last_updated: string;
  last_changed_field?: string;
}

export interface PatientContextType {
  patientState: PatientRealTimeState;
  allPatients: (PatientRealTimeState & { isOnline?: boolean })[];
  updatePatientData: (data: Partial<PatientData>, fieldName?: string) => void;
  updateStatus: (status: PatientStatus) => void;
  submitPatientData: () => void;
  startNewSession: () => void;
  error: string | null;
}
