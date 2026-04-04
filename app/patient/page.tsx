"use client";

import { PatientForm } from "@/components/ui/PatientForm";
import { usePatient } from "@/contexts/PatientContext";
import { Button } from "@/components/button";
import { PlusCircle, Activity } from "lucide-react";

export default function PatientPage() {
  const { patientState, startNewSession } = usePatient();

  return (
    <div className="min-h-screen bg-linear-to-b from-blue-50/50 via-white to-white text-gray-900 relative">
      <div className="absolute inset-0 z-0 opacity-20 pointer-events-none overflow-hidden">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-blue-200/30 rounded-full blur-3xl" />
        <div className="absolute bottom-[-5%] right-[-5%] w-[30%] h-[30%] bg-indigo-100/40 rounded-full blur-3xl" />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <header className="flex justify-end py-6 sticky top-0 z-20 pointer-events-none">
          <div className="bg-white/80 backdrop-blur-md border border-blue-50 p-3 md:p-4 rounded-2xl shadow-xl shadow-blue-900/5 flex items-center space-x-6 pointer-events-auto animate-in fade-in slide-in-from-top-4 duration-700">
            <div className="hidden sm:block border-r border-gray-100 pr-6">
              <div className="flex items-center space-x-2 mb-1">
                <Activity className="w-3 h-3 text-blue-500" />
                <p className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400">
                  Secure Session
                </p>
              </div>
              <p className="font-mono text-xs font-bold text-blue-600 bg-blue-50 px-2 py-1 rounded-lg">
                {patientState.sessionId || "initializing..."}
              </p>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={startNewSession}
              className="rounded-xl text-[10px] font-black uppercase cursor-pointer gap-2 tracking-widest border-blue-100 hover:bg-blue-50 text-blue-600 h-10 px-4"
            >
              <PlusCircle className="w-4 h-4" /> New Form
            </Button>
          </div>
        </header>

        <main className="py-8 md:py-16">
          <div className="text-center mb-16 space-y-4 max-w-2xl mx-auto">
            <div className="inline-flex items-center space-x-2 bg-blue-600 text-white px-4 py-1.5 rounded-full shadow-lg shadow-blue-200 animate-bounce-subtle">
              <Activity className="w-4 h-4" />
              <span className="text-[10px] font-black uppercase tracking-widest">
                Agnos Registration
              </span>
            </div>
            <h1 className="text-4xl md:text-6xl font-black text-gray-900 tracking-tighter leading-tight">
              Patient <span className="text-blue-600">Form</span>
            </h1>
            <p className="text-gray-500 font-medium text-lg leading-relaxed">
              Please provide your information. Your data is synced in real-time
              with our clinical staff.
            </p>
          </div>

          <div className="animate-in fade-in slide-in-from-bottom-8 duration-1000 delay-200">
            <PatientForm />
          </div>
        </main>

        <footer className="py-12 text-center">
          <p className="text-[10px] font-black uppercase tracking-[0.4em] text-gray-300">
            © 2024 Agnos Health Services • Confidential & Secure
          </p>
        </footer>
      </div>
    </div>
  );
}
