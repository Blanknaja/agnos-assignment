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

  const totalPossible = fields.length + 1;
  const currentTotal = filledFields.length + ecPoints;

  return Math.round((currentTotal / totalPossible) * 100);
}

export const getAgeGroupData = (patients: PatientRealTimeState[]) => {
  const groups = {
    Kids: 0,
    Teens: 0,
    Adults: 0,
    Seniors: 0,
  };

  patients.forEach((p) => {
    const age = calculateAge(p.patientData.dateOfBirth);
    if (age <= 12) groups.Kids++;
    else if (age <= 19) groups.Teens++;
    else if (age <= 59) groups.Adults++;
    else groups.Seniors++;
  });

  return [
    { name: "Kids (0-12)", value: groups.Kids, color: "#60a5fa" },
    { name: "Teens (13-19)", value: groups.Teens, color: "#34d399" },
    { name: "Adults (20-59)", value: groups.Adults, color: "#fbbf24" },
    { name: "Seniors (60+)", value: groups.Seniors, color: "#f87171" },
  ].filter((g) => g.value > 0);
};

export const getLanguageData = (patients: PatientRealTimeState[]) => {
  const langMap: Record<string, number> = {};
  patients.forEach((p) => {
    const lang = p.patientData.preferredLanguage || "Unknown";
    langMap[lang] = (langMap[lang] || 0) + 1;
  });

  return Object.entries(langMap)
    .map(([name, value]) => ({ name, value }))
    .sort((a, b) => b.value - a.value)
    .slice(0, 5); // Top 5 languages
};

export const calculateAverageProgress = (patients: PatientRealTimeState[]) => {
  if (patients.length === 0) return 0;
  const totalProgress = patients.reduce(
    (acc, p) => acc + calculateFormProgress(p.patientData),
    0,
  );
  return Math.round(totalProgress / patients.length);
};

export function isSessionExpired(lastUpdated: string): boolean {
  if (SESSION_EXPIRY_DAYS === null) return false;
  const lastUpdateDate = new Date(lastUpdated).getTime();
  const now = new Date().getTime();
  const expiryMs = SESSION_EXPIRY_DAYS * 24 * 60 * 60 * 1000;
  return now - lastUpdateDate > expiryMs;
}
