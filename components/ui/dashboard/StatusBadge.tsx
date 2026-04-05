"use client";

import React from "react";
import { CheckCircle2, Activity } from "lucide-react";
import { PatientStatus } from "@/interface/patient";
import { PATIENT_STATUS } from "@/const/patient";

interface StatusBadgeProps {
  status: PatientStatus;
  progress?: number;
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({ status, progress = 0 }) => {
  if (status === PATIENT_STATUS.SUBMITTED) {
    return (
      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-black bg-green-100 text-green-800 uppercase">
        <CheckCircle2 className="w-3 h-3 mr-1" /> Submitted
      </span>
    );
  }
  
  return (
    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-black bg-yellow-100 text-yellow-800 animate-pulse uppercase">
      <Activity className="w-3 h-3 mr-1" /> Filling ({progress}%)
    </span>
  );
};
