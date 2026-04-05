import { Suspense } from "react";
import PatientClientWrapper from "./PatientClientWrapper";

export const metadata = {
  title: "Patient Registration | Agnos Health",
  description: "Register as a patient and sync your data in real-time.",
};

export default async function PatientPage({
  searchParams,
}: {
  searchParams: Promise<{ id?: string }>;
}) {
  const { id } = await searchParams;

  return (
    <Suspense
      fallback={
        <div className="flex items-center justify-center h-screen bg-white text-blue-600 font-bold">
          Loading...
        </div>
      }
    >
      <PatientClientWrapper sessionId={id} />
    </Suspense>
  );
}
