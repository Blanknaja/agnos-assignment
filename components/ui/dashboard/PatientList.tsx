"use client";

import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { CheckCircle2, Activity, ChevronRight } from "lucide-react";
import { PatientRealTimeState, PatientStatus } from "@/interface/patient";
import { PATIENT_STATUS } from "@/const/patient";
import { calculateAge, calculateFormProgress } from "@/lib/utils";

interface PatientListProps {
  patients: PatientRealTimeState[];
  activeSelectedId?: string;
  onSelect: (patient: PatientRealTimeState) => void;
}

export const PatientList: React.FC<PatientListProps> = ({
  patients,
  activeSelectedId,
  onSelect,
}) => {
  const getStatusBadge = (status: PatientStatus, patientData: any) => {
    if (status === PATIENT_STATUS.SUBMITTED) {
      return (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-black bg-green-100 text-green-800 uppercase">
          <CheckCircle2 className="w-3 h-3 mr-1" /> Submitted
        </span>
      );
    }
    const progress = calculateFormProgress(patientData);
    return (
      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-black bg-yellow-100 text-yellow-800 animate-pulse uppercase">
        <Activity className="w-3 h-3 mr-1" /> Filling ({progress}%)
      </span>
    );
  };

  return (
    <>
      <div className="hidden md:block bg-white rounded-3xl shadow-xs border border-gray-200 overflow-hidden text-gray-900">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50/50">
            <tr>
              <th className="px-6 py-4 text-left text-[10px] font-black text-gray-400 uppercase tracking-widest">
                Patient
              </th>
              <th className="px-6 py-4 text-left text-[10px] font-black text-gray-400 uppercase tracking-widest">
                Age / Info
              </th>
              <th className="px-6 py-4 text-left text-[10px] font-black text-gray-400 uppercase tracking-widest">
                Sync Status
              </th>
              <th className="px-6 py-4 text-right text-[10px] font-black text-gray-400 uppercase tracking-widest">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-100">
            <AnimatePresence mode="popLayout">
              {patients.map((p) => (
                <motion.tr
                  key={p.sessionId}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className={`hover:bg-blue-50/30 transition-colors ${activeSelectedId === p.sessionId ? "bg-blue-50/50" : ""}`}
                >
                  <td className="px-6 py-4">
                    <div className="flex items-center">
                      <div className="relative shrink-0">
                        <div className="h-10 w-10 rounded-2xl bg-blue-100 flex items-center justify-center text-blue-600 font-black border-2 border-white shadow-sm text-sm">
                          {p.patientData.firstName?.[0] || "?"}
                        </div>
                        <div
                          className={`absolute -bottom-1 -right-1 h-4 w-4 rounded-full border-2 border-white ${p.isOnline ? "bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.6)]" : "bg-gray-300"}`}
                        />
                      </div>
                      <div className="ml-4 truncate max-w-[200px]">
                        <div className="text-sm font-black text-gray-900 truncate">
                          {p.patientData.firstName || p.patientData.lastName
                            ? `${p.patientData.firstName} ${p.patientData.lastName}`
                            : "Untitled Patient"}
                        </div>
                        <div className="text-[9px] text-gray-400 font-mono truncate">
                          {p.sessionId}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-xs font-black text-gray-700">
                      {calculateAge(p.patientData.dateOfBirth)} yrs
                    </div>
                    <div className="text-[9px] text-gray-400 font-bold uppercase">
                      {p.patientData.preferredLanguage || "No Language"}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    {getStatusBadge(p.status, p.patientData)}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <button
                      onClick={() => onSelect(p)}
                      className="text-blue-600 hover:text-blue-900 font-black text-[10px] uppercase tracking-widest cursor-pointer px-4 py-2 hover:bg-blue-100 rounded-xl transition-all inline-flex items-center"
                    >
                      Inspect <ChevronRight className="w-3 h-3 ml-1" />
                    </button>
                  </td>
                </motion.tr>
              ))}
            </AnimatePresence>
          </tbody>
        </table>
      </div>

      <div className="md:hidden space-y-4">
        {patients.map((p) => (
          <div
            key={p.sessionId}
            className={`bg-white p-5 rounded-[2rem] border ${activeSelectedId === p.sessionId ? "border-blue-500 shadow-lg" : "border-gray-200"} shadow-xs`}
            onClick={() => onSelect(p)}
          >
            <div className="flex justify-between items-start mb-4">
              <div className="flex items-center">
                <div className="relative mr-4 shrink-0">
                  <div className="h-14 w-14 rounded-2xl bg-blue-100 flex items-center justify-center text-blue-600 font-black text-xl">
                    {p.patientData.firstName?.[0] || "?"}
                  </div>
                  <div
                    className={`absolute -bottom-1 -right-1 h-5 w-5 rounded-full border-4 border-white ${p.isOnline ? "bg-green-500" : "bg-gray-300"}`}
                  />
                </div>
                <div className="truncate max-w-[150px]">
                  <h4 className="font-black text-gray-900 leading-tight truncate">
                    {p.patientData.firstName || "Untitled"}
                  </h4>
                  <p className="text-[9px] text-gray-400 font-mono mt-1 uppercase truncate">
                    {p.sessionId}
                  </p>
                </div>
              </div>
              {getStatusBadge(p.status, p.patientData)}
            </div>
            <div className="flex items-center justify-between text-[9px] font-black uppercase tracking-widest text-gray-400 border-t border-gray-50 pt-4">
              <span>Age: {calculateAge(p.patientData.dateOfBirth)}</span>
              <span className="text-blue-600">
                Progress: {calculateFormProgress(p.patientData)}%
              </span>
            </div>
          </div>
        ))}
      </div>
    </>
  );
};
