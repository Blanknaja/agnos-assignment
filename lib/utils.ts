import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import { PatientData } from "@/interface/patient";
import { SESSION_EXPIRY_DAYS } from "@/const/session";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

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
  ];
  const filledFields = fields.filter((field) => !!data[field]);
  return Math.round((filledFields.length / fields.length) * 100);
}

/**
 * Checks if a session has expired based on lastUpdated timestamp.
 * SESSION_EXPIRY_DAYS is defined in @/const/patient.ts
 *
 * Usage examples for SESSION_EXPIRY_DAYS:
 * - 1          : Expires after 24 hours
 * - 1/24       : Expires after 1 hour (0.0416)
 * - 1/(24*60)  : Expires after 1 minute
 */
export function isSessionExpired(lastUpdated: string): boolean {
  if (SESSION_EXPIRY_DAYS === null) return false;

  const lastUpdateDate = new Date(lastUpdated).getTime();
  const now = new Date().getTime();

  const expiryMs = SESSION_EXPIRY_DAYS * 24 * 60 * 60 * 1000;

  return now - lastUpdateDate > expiryMs;
}
