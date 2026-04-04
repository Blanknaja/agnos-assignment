import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import {
  PatientData,
  PatientRealTimeState,
  SupabasePatientRow,
} from "@/interface/patient";
import { SESSION_EXPIRY_DAYS } from "@/const/session";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const mapRecordToState = (
  record: SupabasePatientRow,
): PatientRealTimeState => ({
  sessionId: record.session_id,
  patientData: record.patient_data,
  status: record.status,
  lastUpdated: record.last_updated,
  lastChangedField: record.last_changed_field,
});

export function calculateAge(dob: string): number {
  if (!dob) return 0;
  const birthDate = new Date(dob);
  const today = new Date();
  let age = today.getFullYear() - birthDate.getFullYear();
  const m = today.getMonth() - birthDate.getMonth();
  if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
    age--;
  }
  return age;
}

export function calculateFormProgress(data: PatientData): number {
  const fields: (keyof PatientData)[] = [
    "firstName",
    "lastName",
    "dateOfBirth",
    "gender",
    "phoneNumber",
    "email",
    "address",
    "preferredLanguage",
    "nationality",
    "religion",
  ];
  const filledFields = fields.filter((field) => !!data[field]);

  let ecPoints = 0;
  if (data.emergencyContact?.name) ecPoints += 0.5;
  if (data.emergencyContact?.relationship) ecPoints += 0.5;

  const totalPossible = fields.length + 1; // +1 for Emergency Contact
  const currentTotal = filledFields.length + ecPoints;

  return Math.round((currentTotal / totalPossible) * 100);
}

export function isSessionExpired(lastUpdated: string): boolean {
  if (SESSION_EXPIRY_DAYS === null) return false;
  const lastUpdateDate = new Date(lastUpdated).getTime();
  const now = new Date().getTime();
  const expiryMs = SESSION_EXPIRY_DAYS * 24 * 60 * 60 * 1000;
  return now - lastUpdateDate > expiryMs;
}
