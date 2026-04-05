"use client";

import React, { useState, useMemo } from "react";
import { usePatient } from "@/contexts/PatientContext";
import { PatientRealTimeState, PatientStatus } from "@/interface/patient";
import { PATIENT_STATUS } from "@/const/patient";
import {
  getAgeGroupData,
  getLanguageData,
  calculateAverageProgress,
} from "@/lib/utils";

import { AnalyticsSection } from "./dashboard/AnalyticsSection";
import { FilterBtn } from "./dashboard/DashboardUI";
import { SearchWithButton } from "@/components/ui/searchwithbutton";
import { PatientList } from "./dashboard/PatientList";
import { PatientSidebar } from "./dashboard/PatientSidebar";
import { Pagination } from "@/components/ui/Pagination";
import { AnimatePresence } from "framer-motion";

const ITEMS_PER_PAGE = 8;

type DashboardFilter = "all" | "active" | PatientStatus;

export const StaffDashboard: React.FC = () => {
  const { allPatients } = usePatient();
  const [selectedPatient, setSelectedPatient] =
    useState<PatientRealTimeState | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState<DashboardFilter>("all");
  const [currentPage, setCurrentPage] = useState(1);

  const handleSearchChange = (value: string) => {
    setSearchTerm(value);
    setCurrentPage(1);
  };

  const handleFilterChange = (status: DashboardFilter) => {
    setFilterStatus(status);
    setCurrentPage(1);
  };

  const filteredPatients = useMemo(() => {
    const results = allPatients.filter((p) => {
      const searchLower = searchTerm.toLowerCase();
      const fullName =
        `${p.patientData.firstName} ${p.patientData.lastName}`.toLowerCase();
      const email = (p.patientData.email || "").toLowerCase();
      const sid = p.sessionId.toLowerCase();

      const matchesSearch =
        fullName.includes(searchLower) ||
        email.includes(searchLower) ||
        sid.includes(searchLower);

      let matchesFilter = true;
      if (filterStatus === "active") {
        matchesFilter = p.isOnline === true;
      } else if (filterStatus !== "all") {
        matchesFilter = p.status === filterStatus;
      }

      return matchesSearch && matchesFilter;
    });

    return [...results].sort((a, b) => {
      if (a.isOnline && !b.isOnline) return -1;
      if (!a.isOnline && b.isOnline) return 1;

      return (
        new Date(b.lastUpdated).getTime() - new Date(a.lastUpdated).getTime()
      );
    });
  }, [allPatients, searchTerm, filterStatus]);

  const totalPages = Math.ceil(filteredPatients.length / ITEMS_PER_PAGE);
  const safePage = Math.min(Math.max(1, currentPage), Math.max(1, totalPages));
  const paginatedPatients = useMemo(() => {
    const start = (safePage - 1) * ITEMS_PER_PAGE;
    return filteredPatients.slice(start, start + ITEMS_PER_PAGE);
  }, [filteredPatients, safePage]);

  const analytics = useMemo(() => {
    const now = new Date();
    const todayStr = now.toISOString().split("T")[0];
    return {
      todayCount: allPatients.filter((p) => p.lastUpdated.startsWith(todayStr))
        .length,
      avgProgress: calculateAverageProgress(
        allPatients.filter((p) => p.status === PATIENT_STATUS.FILLING),
      ),
      ageGroupData: getAgeGroupData(allPatients),
      languageData: getLanguageData(allPatients),
      trendData: [...Array(7)]
        .map((_, i) => {
          const d = new Date();
          d.setDate(d.getDate() - i);
          const ds = d.toISOString().split("T")[0];
          return {
            date: d.toLocaleDateString("en-US", { weekday: "short" }),
            count: allPatients.filter((p) => p.lastUpdated.startsWith(ds))
              .length,
          };
        })
        .reverse(),
    };
  }, [allPatients]);

  const activeSelectedPatient =
    allPatients.find((p) => p.sessionId === selectedPatient?.sessionId) ||
    selectedPatient;

  return (
    <>
      <main className="flex-1 overflow-y-auto p-4 md:p-8 h-full">
        <div className="max-w-7xl mx-auto space-y-8 pb-20 text-gray-900">
          <AnalyticsSection analytics={analytics} />

          <div className="space-y-4 text-gray-900">
            <div className="bg-white p-4 rounded-2xl shadow-xs border border-gray-200 flex flex-col xl:flex-row xl:items-center justify-between gap-4">
              <div className="flex items-center space-x-1 overflow-x-auto no-scrollbar text-gray-900">
                <FilterBtn
                  label="All"
                  active={filterStatus === "all"}
                  onClick={() => handleFilterChange("all")}
                />

                <FilterBtn
                  label="Active"
                  active={filterStatus === "active"}
                  onClick={() => handleFilterChange("active")}
                  color="green"
                />

                <FilterBtn
                  label="Filling"
                  active={filterStatus === PATIENT_STATUS.FILLING}
                  onClick={() => handleFilterChange(PATIENT_STATUS.FILLING)}
                  color="yellow"
                />
                <FilterBtn
                  label="Completed"
                  active={filterStatus === PATIENT_STATUS.SUBMITTED}
                  onClick={() => handleFilterChange(PATIENT_STATUS.SUBMITTED)}
                  color="blue"
                />
              </div>
              <div className="w-full xl:w-96 text-gray-900">
                <SearchWithButton
                  value={searchTerm}
                  onChange={handleSearchChange}
                  placeholder="Contain search: name, email, id..."
                />
              </div>
            </div>

            <PatientList
              patients={paginatedPatients}
              activeSelectedId={activeSelectedPatient?.sessionId}
              onSelect={setSelectedPatient}
            />

            <Pagination
              currentPage={safePage}
              totalPages={totalPages}
              onPageChange={setCurrentPage}
            />
          </div>
        </div>
      </main>

      <AnimatePresence>
        {activeSelectedPatient && (
          <PatientSidebar
            activeSelectedPatient={activeSelectedPatient}
            onClose={() => setSelectedPatient(null)}
          />
        )}
      </AnimatePresence>
    </>
  );
};
