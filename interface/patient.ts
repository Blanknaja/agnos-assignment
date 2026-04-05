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
  /**
   * Fetches and syncs a session by ID. Called by the PatientClient page component
   * (which re-renders on URL changes) rather than from the Root Layout-level Context
   * (which does NOT re-render on same-path query param changes in Next.js App Router).
   */
  syncSession: (sid: string) => Promise<void>;
  error: string | null;
  connectionStatus: string;
}
