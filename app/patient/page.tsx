import PatientClient from "./PatientClient";

export const metadata = {
  title: "Patient Registration | Agnos Health",
  description: "Register as a patient and sync your data in real-time.",
};

export default function PatientPage() {
  return <PatientClient />;
}
