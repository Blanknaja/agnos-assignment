"use client";

import React from "react";
import { BarChart3 } from "lucide-react";
import { usePatient } from "@/contexts/PatientContext";

export const DashboardHeader: React.FC = () => {
  const { connectionStatus } = usePatient();

  return (
    <header className="bg-white border-b border-gray-200 px-4 md:px-8 py-4 flex items-center justify-between z-10 shrink-0">
      <div className="flex items-center space-x-3">
        <div className="bg-blue-600 p-2 rounded-xl text-white shadow-lg shadow-blue-100">
          <BarChart3 className="w-6 h-6" />
        </div>
        <h1 className="text-xl font-black tracking-tighter text-gray-900">
          Agnos{" "}
          <span className="text-blue-600 font-medium">Staff Dashboard</span>
        </h1>
      </div>
      <div className="flex items-center space-x-4">
        <div className="text-right hidden sm:block">
          <p className="text-[10px] text-gray-400 font-black uppercase tracking-[0.2em] leading-none mb-1 text-right">
            System Status
          </p>
          <div
            className={`flex items-center justify-end font-black text-sm uppercase ${
              connectionStatus === "SUBSCRIBED"
                ? "text-green-600"
                : "text-orange-500 animate-pulse"
            }`}
          >
            <span className="relative flex h-2 w-2 mr-2">
              {connectionStatus === "SUBSCRIBED" && (
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
              )}
              <span
                className={`relative inline-flex rounded-full h-2 w-2 ${
                  connectionStatus === "SUBSCRIBED"
                    ? "bg-green-500"
                    : "bg-orange-500"
                }`}
              ></span>
            </span>
            {connectionStatus === "SUBSCRIBED" ? "Live Sync" : connectionStatus}
          </div>
        </div>
        <div className="h-10 w-10 rounded-2xl bg-gray-900 flex items-center justify-center text-white font-black shadow-sm">
          A
        </div>
      </div>
    </header>
  );
};
