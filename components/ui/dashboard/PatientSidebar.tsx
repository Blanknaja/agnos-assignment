"use client";

import React from "react";
import { motion } from "framer-motion";
import { Activity } from "lucide-react";
import { PatientRealTimeState } from "@/interface/patient";
import { calculateAge, calculateFormProgress } from "@/lib/utils";
import { PreviewSection, DataLabel } from "./DashboardUI";

interface PatientSidebarProps {
  activeSelectedPatient: PatientRealTimeState | null;
  onClose: () => void;
}

export const PatientSidebar: React.FC<PatientSidebarProps> = ({
  activeSelectedPatient,
  onClose,
}) => {
  if (!activeSelectedPatient) return null;

  return (
    <motion.aside
      initial={{ x: "100%" }}
      animate={{ x: 0 }}
      exit={{ x: "100%" }}
      className="fixed inset-y-0 right-0 w-full md:w-[480px] bg-white border-l border-gray-200 shadow-2xl flex flex-col z-50 overflow-hidden text-gray-900"
    >
      <div className="p-6 border-b border-gray-200 flex items-center justify-between shrink-0 bg-white">
        <h2 className="font-black text-gray-900 uppercase tracking-[0.3em] text-[10px]">
          Session Live Feed
        </h2>
        <button
          onClick={onClose}
          className="text-gray-400 hover:text-gray-600 cursor-pointer p-2 rounded-full hover:bg-gray-100"
        >
          ✕
        </button>
      </div>
      <div className="flex-1 overflow-y-auto p-8 space-y-12">
        <div className="flex flex-col items-center text-center space-y-6">
          <div className="relative">
            <div className="h-32 w-32 rounded-[2.5rem] bg-blue-600 flex items-center justify-center text-white text-6xl font-black shadow-2xl shadow-blue-200 animate-in zoom-in duration-500">
              {activeSelectedPatient.patientData.firstName?.[0] || "P"}
            </div>
            <div
              className={`absolute -bottom-1 -right-1 h-10 w-10 rounded-full border-8 border-white ${activeSelectedPatient.isOnline ? "bg-green-500 shadow-lg" : "bg-gray-300"}`}
            />
          </div>
          <div>
            <h3 className="text-3xl font-black text-gray-900 leading-tight">
              {activeSelectedPatient.patientData.firstName}{" "}
              {activeSelectedPatient.patientData.lastName || "---"}
            </h3>
            <div className="flex flex-col items-center mt-3 space-y-3">
              <div className="flex items-center space-x-3">
                <span
                  className={`text-[10px] font-black px-4 py-1.5 rounded-full shadow-xs ${activeSelectedPatient.isOnline ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-500"}`}
                >
                  {activeSelectedPatient.isOnline ? "● ONLINE" : "○ OFFLINE"}
                </span>
                <span className="text-xs font-black text-gray-400 uppercase tracking-widest">
                  Age:{" "}
                  {calculateAge(activeSelectedPatient.patientData.dateOfBirth)}
                </span>
              </div>
              <p className="text-[10px] text-gray-300 font-mono break-all px-12 tracking-tighter">
                ID: {activeSelectedPatient.sessionId}
              </p>
            </div>
          </div>
        </div>

        <div className="space-y-10">
          <PreviewSection title="Personal Profile">
            <DataLabel
              label="Birth Date"
              value={activeSelectedPatient.patientData.dateOfBirth}
              active={activeSelectedPatient.lastChangedField === "dateOfBirth"}
            />
            <DataLabel
              label="Gender"
              value={activeSelectedPatient.patientData.gender}
              active={activeSelectedPatient.lastChangedField === "gender"}
            />
            <DataLabel
              label="Middle Name"
              value={activeSelectedPatient.patientData.middleName}
              active={activeSelectedPatient.lastChangedField === "middleName"}
            />
            <DataLabel
              label="Religion"
              value={activeSelectedPatient.patientData.religion}
              active={activeSelectedPatient.lastChangedField === "religion"}
            />
            <DataLabel
              label="Nationality"
              value={activeSelectedPatient.patientData.nationality}
              active={activeSelectedPatient.lastChangedField === "nationality"}
            />
            <DataLabel
              label="Language"
              value={activeSelectedPatient.patientData.preferredLanguage}
              active={
                activeSelectedPatient.lastChangedField === "preferredLanguage"
              }
            />
          </PreviewSection>

          <PreviewSection title="Contact Details">
            <DataLabel
              label="Email"
              value={activeSelectedPatient.patientData.email}
              active={activeSelectedPatient.lastChangedField === "email"}
            />
            <DataLabel
              label="Phone"
              value={activeSelectedPatient.patientData.phoneNumber}
              active={activeSelectedPatient.lastChangedField === "phoneNumber"}
            />
            <DataLabel
              label="Address"
              value={activeSelectedPatient.patientData.address}
              active={activeSelectedPatient.lastChangedField === "address"}
              isFull
            />
          </PreviewSection>

          <PreviewSection title="Emergency Contact">
            <DataLabel
              label="Contact Name"
              value={activeSelectedPatient.patientData.emergencyContact?.name}
              active={
                activeSelectedPatient.lastChangedField ===
                "emergencyContact.name"
              }
            />
            <DataLabel
              label="Relationship"
              value={
                activeSelectedPatient.patientData.emergencyContact?.relationship
              }
              active={
                activeSelectedPatient.lastChangedField ===
                "emergencyContact.relationship"
              }
            />
          </PreviewSection>

          <div className="bg-linear-to-br from-blue-600 to-blue-800 p-8 rounded-[2.5rem] text-white shadow-2xl shadow-blue-200 relative overflow-hidden group">
            <div className="relative z-10">
              <p className="text-[10px] font-black uppercase mb-6 tracking-[0.2em] opacity-70">
                Process Integrity
              </p>
              <div className="flex items-end justify-between mb-3">
                <span className="text-3xl md:text-5xl font-black tracking-tighter">
                  {calculateFormProgress(activeSelectedPatient.patientData)}%
                </span>
                <span className="text-[10px] font-black uppercase tracking-widest opacity-70 mb-2">
                  Syncing Encrypted
                </span>
              </div>
              <div className="h-2.5 bg-white/20 rounded-full overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{
                    width: `${calculateFormProgress(activeSelectedPatient.patientData)}%`,
                  }}
                  className="h-full bg-white shadow-[0_0_15px_rgba(255,255,255,0.8)]"
                />
              </div>
            </div>
            <Activity className="absolute -bottom-6 -right-6 w-40 h-40 text-white/10 group-hover:scale-110 transition-transform duration-700" />
          </div>
        </div>
      </div>
    </motion.aside>
  );
};
