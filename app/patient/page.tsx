import { PatientForm } from "@/components/ui/PatientForm";

export default function PatientPage() {
  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-extrabold text-gray-900 tracking-tight">
            Patient Registration
          </h1>
          <p className="mt-4 text-lg text-gray-600 italic">
            Please fill in your information carefully. Your data is synced in
            real-time with our staff.
          </p>
        </div>
        <PatientForm />
      </div>
    </div>
  );
}
