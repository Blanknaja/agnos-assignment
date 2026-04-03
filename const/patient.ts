import { Gender, PatientStatus } from "@/interface/patient";

export const PATIENT_STATUS: Record<string, PatientStatus> = {
  INACTIVE: "inactive",
  FILLING: "actively filling",
  SUBMITTED: "submitted",
};

export const GENDER_OPTIONS: { label: string; value: Gender }[] = [
  { label: "Male", value: "Male" },
  { label: "Female", value: "Female" },
  { label: "Other", value: "Other" },
  { label: "Prefer not to say", value: "Prefer not to say" },
];

export const DEFAULT_PATIENT_DATA = {
  firstName: "",
  lastName: "",
  dateOfBirth: "",
  gender: "" as Gender | "",
  phoneNumber: "",
  email: "",
  address: "",
  preferredLanguage: "",
  nationality: "",
};
