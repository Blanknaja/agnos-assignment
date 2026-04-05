"use client";

import { useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { PatientForm } from "@/components/ui/PatientForm";
import { usePatient } from "@/contexts/PatientContext";
import { Activity } from "lucide-react";

interface PatientClientWrapperProps {
  sessionId: string | undefined;
}

export default function PatientClientWrapper({
  sessionId,
}: PatientClientWrapperProps) {
  const router = useRouter();
  const { syncSession } = usePatient();
  const lastSyncedId = useRef<string | null>(null);

  useEffect(() => {
    if (!sessionId) {
      const newSid = `p_${Math.random().toString(36).substr(2, 6)}_${Date.now().toString().slice(-4)}`;
      router.replace(`/patient?id=${newSid}`);
      return;
    }

    if (sessionId === lastSyncedId.current) return;

    lastSyncedId.current = sessionId;
    syncSession(sessionId);
  }, [sessionId, syncSession, router]);

  return (
    <div className="min-h-full bg-linear-to-b from-blue-50/50 via-white to-white text-gray-900 relative">
      <div className="absolute inset-0 z-0 opacity-20 pointer-events-none overflow-hidden">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-blue-200/30 rounded-full blur-3xl" />
        <div className="absolute bottom-[-5%] right-[-5%] w-[30%] h-[30%] bg-indigo-100/40 rounded-full blur-3xl" />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <main className="py-12 md:py-20">
          <div className="text-center mb-12 md:mb-16 space-y-4 max-w-2xl mx-auto">
            <div className="inline-flex items-center space-x-2 bg-blue-600 text-white px-4 py-1.5 rounded-full shadow-lg shadow-blue-200">
              <Activity className="w-4 h-4" />
              <span className="text-[10px] font-black uppercase tracking-widest text-white">
                Agnos Registration
              </span>
            </div>
            <h1 className="text-4xl md:text-6xl font-black text-gray-900 tracking-tighter leading-tight">
              Patient <span className="text-blue-600">Form</span>
            </h1>
          </div>

          <div className="animate-in fade-in slide-in-from-bottom-8 duration-1000 delay-200">
            <PatientForm />
          </div>
        </main>
      </div>
    </div>
  );
}
