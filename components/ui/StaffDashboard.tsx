"use client";

import React, { useState, useMemo } from "react";
import { usePatient } from "@/contexts/PatientContext";
import { PatientRealTimeState, PatientStatus } from "@/interface/patient";
import {
  CheckCircle2,
  BarChart3,
  ChevronRight,
  PieChart as PieIcon,
  Activity,
  BarChart as BarChartIcon,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { SearchWithButton } from "@/components/ui/searchwithbutton";
import { Pagination } from "@/components/ui/Pagination";
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip,
  BarChart,
  Bar,
  XAxis,
  CartesianGrid,
} from "recharts";
import { PATIENT_STATUS } from "@/const/patient";
import { calculateAge, calculateFormProgress } from "@/lib/utils";

const ITEMS_PER_PAGE = 8;

export const StaffDashboard: React.FC = () => {
  const { allPatients } = usePatient();
  const [selectedPatient, setSelectedPatient] =
    useState<PatientRealTimeState | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState<PatientStatus | "all">(
    "all",
  );
  const [currentPage, setCurrentPage] = useState(1);

  const filteredPatients = useMemo(() => {
    return allPatients.filter((p) => {
      const searchLower = searchTerm.toLowerCase();
      const fullName =
        `${p.patientData.firstName} ${p.patientData.lastName}`.toLowerCase();
      const email = (p.patientData.email || "").toLowerCase();
      const sid = p.sessionId.toLowerCase();

      const matchesSearch =
        fullName.includes(searchLower) ||
        email.includes(searchLower) ||
        sid.includes(searchLower);
      const matchesFilter = filterStatus === "all" || p.status === filterStatus;
      return matchesSearch && matchesFilter;
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

    const last7Days = [...Array(7)]
      .map((_, i) => {
        const d = new Date();
        d.setDate(d.getDate() - i);
        const dateStr = d.toISOString().split("T")[0];
        const count = allPatients.filter((p) =>
          p.lastUpdated.startsWith(dateStr),
        ).length;
        return {
          date: d.toLocaleDateString("en-US", { weekday: "short" }),
          count,
          fullDate: dateStr,
        };
      })
      .reverse();

    const todayCount = allPatients.filter((p) =>
      p.lastUpdated.startsWith(now.toISOString().split("T")[0]),
    ).length;
    const monthCount = allPatients.filter((p) => {
      const d = new Date(p.lastUpdated);
      return (
        d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear()
      );
    }).length;

    const genderData = [
      {
        name: "Male",
        value: allPatients.filter((p) => p.patientData.gender === "Male")
          .length,
        color: "#3b82f6",
      },
      {
        name: "Female",
        value: allPatients.filter((p) => p.patientData.gender === "Female")
          .length,
        color: "#ec4899",
      },
      {
        name: "Other",
        value: allPatients.filter((p) =>
          ["Other", "Prefer not to say"].includes(
            p.patientData.gender as string,
          ),
        ).length,
        color: "#8b5cf6",
      },
    ].filter((d) => d.value > 0);

    return { todayCount, monthCount, genderData, trendData: last7Days };
  }, [allPatients]);

  const getStatusBadge = (status: PatientStatus, lastUpdated: string) => {
    switch (status) {
      case PATIENT_STATUS.SUBMITTED:
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold bg-green-100 text-green-800">
            <CheckCircle2 className="w-3 h-3 mr-1" /> Submitted
          </span>
        );
      case PATIENT_STATUS.FILLING:
        const patient = allPatients.find((p) => p.lastUpdated === lastUpdated);
        const progress = patient
          ? calculateFormProgress(patient.patientData)
          : 0;
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold bg-yellow-100 text-yellow-800 animate-pulse">
            <Activity className="w-3 h-3 mr-1" /> Filling ({progress}%)
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold bg-gray-100 text-gray-800">
            Inactive
          </span>
        );
    }
  };

  const activeSelectedPatient =
    allPatients.find((p) => p.sessionId === selectedPatient?.sessionId) ||
    selectedPatient;

  return (
    <div className="flex flex-col h-screen bg-gray-50 overflow-hidden text-gray-900">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 px-4 md:px-8 py-4 flex items-center justify-between z-10 shrink-0">
        <div className="flex items-center space-x-3">
          <div className="bg-blue-600 p-2 rounded-lg text-white">
            <BarChart3 className="w-6 h-6" />
          </div>
          <h1 className="text-xl font-bold">
            Agnos patients{" "}
            <span className="font-normal text-gray-400">| Admin</span>
          </h1>
        </div>
        <div className="flex items-center space-x-2 md:space-x-4">
          <div className="text-right hidden md:block">
            <p className="text-xs text-gray-500 font-bold uppercase tracking-widest leading-none mb-1">
              Live Connection
            </p>
            <p className="text-sm font-black text-green-600 inline-flex items-center">
              <span className="relative flex h-2 w-2 mr-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
              </span>
              Stable
            </p>
          </div>
          <div className="h-10 w-10 rounded-full bg-blue-600 flex items-center justify-center text-white font-bold shadow-sm">
            A
          </div>
        </div>
      </header>

      <div className="flex-1 flex overflow-hidden">
        <main className="flex-1 overflow-y-auto p-4 md:p-8">
          <div className="max-w-7xl mx-auto space-y-6">
            {/* Analytics & Trends Zone */}
            <section className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2 bg-white p-6 rounded-2xl border border-gray-200 shadow-xs">
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <h3 className="font-black text-gray-800 text-sm uppercase tracking-widest flex items-center">
                      <BarChartIcon className="w-4 h-4 mr-2 text-blue-600" />{" "}
                      Daily Registration Trends
                    </h3>
                    <p className="text-xs text-gray-400 mt-1">
                      Number of new patients over the last 7 days
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-2xl font-black text-blue-600">
                      {analytics.todayCount}
                    </p>
                    <p className="text-[10px] font-bold text-gray-400 uppercase">
                      Today
                    </p>
                  </div>
                </div>
                <div className="h-48 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={analytics.trendData}>
                      <CartesianGrid
                        strokeDasharray="3 3"
                        vertical={false}
                        stroke="#f1f5f9"
                      />
                      <XAxis
                        dataKey="date"
                        axisLine={false}
                        tickLine={false}
                        tick={{
                          fontSize: 10,
                          fontWeight: "bold",
                          fill: "#94a3b8",
                        }}
                        dy={10}
                      />
                      <Tooltip
                        contentStyle={{
                          borderRadius: "12px",
                          border: "none",
                          boxShadow: "0 10px 15px -3px rgba(0,0,0,0.1)",
                        }}
                        cursor={{ fill: "#f8fafc" }}
                      />
                      <Bar
                        dataKey="count"
                        fill="#3b82f6"
                        radius={[4, 4, 0, 0]}
                        barSize={30}
                      />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>

              <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-xs flex flex-col">
                <h3 className="font-black text-gray-800 text-sm uppercase tracking-widest flex items-center mb-6">
                  <PieIcon className="w-4 h-4 mr-2 text-purple-600" /> Patient
                  Demographics
                </h3>
                <div className="flex-1 flex flex-col justify-center">
                  <div className="h-32">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={analytics.genderData}
                          innerRadius={35}
                          outerRadius={50}
                          paddingAngle={8}
                          dataKey="value"
                        >
                          {analytics.genderData.map((entry, index) => (
                            <Cell
                              key={index}
                              fill={entry.color}
                              stroke="none"
                            />
                          ))}
                        </Pie>
                        <Tooltip />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                  <div className="mt-6 space-y-2">
                    {analytics.genderData.map((g) => (
                      <div
                        key={g.name}
                        className="flex items-center justify-between text-xs font-bold text-gray-500"
                      >
                        <div className="flex items-center">
                          <span
                            className="w-2 h-2 rounded-full mr-2"
                            style={{ backgroundColor: g.color }}
                          />{" "}
                          {g.name}
                        </div>
                        <span className="text-gray-900">{g.value}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </section>

            {/* Controls */}
            <div className="bg-white p-4 rounded-xl shadow-xs border border-gray-200 flex flex-col xl:flex-row xl:items-center justify-between gap-4">
              <div className="flex items-center space-x-1 overflow-x-auto pb-2 xl:pb-0 no-scrollbar">
                <FilterBtn
                  label="All"
                  active={filterStatus === "all"}
                  onClick={() => setFilterStatus("all")}
                />
                <FilterBtn
                  label="Active"
                  active={filterStatus === PATIENT_STATUS.FILLING}
                  onClick={() => setFilterStatus(PATIENT_STATUS.FILLING)}
                  color="yellow"
                />
                <FilterBtn
                  label="Completed"
                  active={filterStatus === PATIENT_STATUS.SUBMITTED}
                  onClick={() => setFilterStatus(PATIENT_STATUS.SUBMITTED)}
                  color="green"
                />
              </div>
              <div className="w-full xl:w-96">
                <SearchWithButton
                  value={searchTerm}
                  onChange={setSearchTerm}
                  placeholder="Search name, email, or full ID..."
                />
              </div>
            </div>

            {/* Main Content (Table / Cards) */}
            <div className="space-y-4">
              <div className="hidden md:block bg-white rounded-xl shadow-xs border border-gray-200 overflow-hidden">
                <table className="min-w-full divide-y divide-gray-200 text-gray-900">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-black text-gray-400 uppercase tracking-widest">
                        Patient Details
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-black text-gray-400 uppercase tracking-widest">
                        Age
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-black text-gray-400 uppercase tracking-widest">
                        Status / Progress
                      </th>
                      <th className="px-6 py-3 text-right text-xs font-black text-gray-400 uppercase tracking-widest">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    <AnimatePresence mode="popLayout">
                      {paginatedPatients.map((p) => (
                        <motion.tr
                          key={p.sessionId}
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          className={`hover:bg-blue-50/50 transition-colors ${activeSelectedPatient?.sessionId === p.sessionId ? "bg-blue-50" : ""}`}
                        >
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center">
                              <div className="relative shrink-0">
                                <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-black border-2 border-white shadow-sm">
                                  {p.patientData.firstName?.[0] || "?"}
                                </div>
                                <div
                                  className={`absolute -bottom-0.5 -right-0.5 h-3.5 w-3.5 rounded-full border-2 border-white ${p.isOnline ? "bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.6)]" : "bg-gray-300"}`}
                                />
                              </div>
                              <div className="ml-4 truncate">
                                <div className="text-sm font-bold text-gray-900">
                                  {p.patientData.firstName ||
                                  p.patientData.lastName
                                    ? `${p.patientData.firstName} ${p.patientData.lastName}`
                                    : "Untitled Patient"}
                                </div>
                                <div className="text-[10px] text-gray-400 font-mono truncate max-w-[150px]">
                                  {p.sessionId}
                                </div>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-black">
                            <span
                              className={
                                calculateAge(p.patientData.dateOfBirth) >= 60
                                  ? "text-red-600"
                                  : "text-gray-700"
                              }
                            >
                              {calculateAge(p.patientData.dateOfBirth)} yrs
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            {getStatusBadge(p.status, p.lastUpdated)}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-right">
                            <button
                              onClick={() => setSelectedPatient(p)}
                              className="text-blue-600 hover:text-blue-900 font-black text-xs uppercase tracking-widest cursor-pointer px-3 py-2 hover:bg-blue-100 rounded-xl transition-all inline-flex items-center"
                            >
                              Live Preview{" "}
                              <ChevronRight className="w-4 h-4 ml-1" />
                            </button>
                          </td>
                        </motion.tr>
                      ))}
                    </AnimatePresence>
                  </tbody>
                </table>
              </div>

              {/* Mobile Card View */}
              <div className="md:hidden space-y-4">
                {paginatedPatients.map((p) => (
                  <div
                    key={p.sessionId}
                    className={`bg-white p-5 rounded-3xl border ${activeSelectedPatient?.sessionId === p.sessionId ? "border-blue-500 shadow-lg" : "border-gray-200"} shadow-xs`}
                    onClick={() => setSelectedPatient(p)}
                  >
                    <div className="flex justify-between items-start mb-4">
                      <div className="flex items-center">
                        <div className="relative mr-4">
                          <div className="h-14 w-14 rounded-2xl bg-blue-100 flex items-center justify-center text-blue-600 font-black text-xl">
                            {p.patientData.firstName?.[0] || "?"}
                          </div>
                          <div
                            className={`absolute -bottom-1 -right-1 h-5 w-5 rounded-full border-4 border-white ${p.isOnline ? "bg-green-500" : "bg-gray-300"}`}
                          />
                        </div>
                        <div>
                          <h4 className="font-black text-gray-900 leading-tight">
                            {p.patientData.firstName || "Untitled"}
                          </h4>
                          <p className="text-[10px] text-gray-400 font-mono mt-1 uppercase">
                            {p.sessionId.slice(-12)}
                          </p>
                        </div>
                      </div>
                      {getStatusBadge(p.status, p.lastUpdated)}
                    </div>
                    <div className="flex items-center justify-between text-[10px] font-black uppercase tracking-widest text-gray-400 border-t border-gray-50 pt-4">
                      <span>
                        Age: {calculateAge(p.patientData.dateOfBirth)}
                      </span>
                      <span className="text-blue-600">
                        Progress: {calculateFormProgress(p.patientData)}%
                      </span>
                    </div>
                  </div>
                ))}
              </div>

              {/* Pagination Controls */}
              <Pagination
                currentPage={safePage}
                totalPages={totalPages}
                onPageChange={setCurrentPage}
              />
            </div>
          </div>
        </main>

        {/* Sidebar Zone */}
        <AnimatePresence>
          {activeSelectedPatient && (
            <motion.aside
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              className="fixed md:relative inset-0 md:inset-auto w-full md:w-[480px] bg-white md:border-l border-gray-200 shadow-2xl flex flex-col z-50 overflow-hidden"
            >
              <div className="p-6 border-b border-gray-200 flex items-center justify-between shrink-0 bg-white">
                <h2 className="font-black text-gray-900 uppercase tracking-[0.3em] text-[10px]">
                  Session Live Feed
                </h2>
                <button
                  onClick={() => setSelectedPatient(null)}
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
                          {activeSelectedPatient.isOnline
                            ? "● ONLINE"
                            : "○ OFFLINE"}
                        </span>
                        <span className="text-xs font-black text-gray-400 uppercase tracking-widest">
                          Age:{" "}
                          {calculateAge(
                            activeSelectedPatient.patientData.dateOfBirth,
                          )}
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
                      active={
                        activeSelectedPatient.lastChangedField === "dateOfBirth"
                      }
                    />
                    <DataLabel
                      label="Gender"
                      value={activeSelectedPatient.patientData.gender}
                      active={
                        activeSelectedPatient.lastChangedField === "gender"
                      }
                    />
                    <DataLabel
                      label="Middle Name"
                      value={activeSelectedPatient.patientData.middleName}
                      active={
                        activeSelectedPatient.lastChangedField === "middleName"
                      }
                    />
                    <DataLabel
                      label="Religion"
                      value={activeSelectedPatient.patientData.religion}
                      active={
                        activeSelectedPatient.lastChangedField === "religion"
                      }
                    />
                    <DataLabel
                      label="Nationality"
                      value={activeSelectedPatient.patientData.nationality}
                      active={
                        activeSelectedPatient.lastChangedField === "nationality"
                      }
                    />
                    <DataLabel
                      label="Language"
                      value={
                        activeSelectedPatient.patientData.preferredLanguage
                      }
                      active={
                        activeSelectedPatient.lastChangedField ===
                        "preferredLanguage"
                      }
                    />
                  </PreviewSection>

                  <PreviewSection title="Contact Details">
                    <DataLabel
                      label="Email"
                      value={activeSelectedPatient.patientData.email}
                      active={
                        activeSelectedPatient.lastChangedField === "email"
                      }
                    />
                    <DataLabel
                      label="Phone"
                      value={activeSelectedPatient.patientData.phoneNumber}
                      active={
                        activeSelectedPatient.lastChangedField === "phoneNumber"
                      }
                    />
                    <DataLabel
                      label="Address"
                      value={activeSelectedPatient.patientData.address}
                      active={
                        activeSelectedPatient.lastChangedField === "address"
                      }
                      isFull
                    />
                  </PreviewSection>

                  <PreviewSection title="Emergency Contact">
                    <DataLabel
                      label="Contact Name"
                      value={activeSelectedPatient.patientData.emergencyContact?.name}
                      active={
                        activeSelectedPatient.lastChangedField === "emergencyContact.name"
                      }
                    />
                    <DataLabel
                      label="Relationship"
                      value={activeSelectedPatient.patientData.emergencyContact?.relationship}
                      active={
                        activeSelectedPatient.lastChangedField === "emergencyContact.relationship"
                      }
                    />
                  </PreviewSection>

                  <div className="bg-linear-to-br from-blue-600 to-blue-800 p-8 rounded-[2rem] text-white shadow-2xl shadow-blue-200 relative overflow-hidden group">
                    <div className="relative z-10">
                      <p className="text-[10px] font-black uppercase mb-6 tracking-[0.2em] opacity-70">
                        Process Integrity
                      </p>
                      <div className="flex items-end justify-between mb-3">
                        <span className="text-5xl font-black tracking-tighter">
                          {calculateFormProgress(
                            activeSelectedPatient.patientData,
                          )}
                          %
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
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

interface FilterBtnProps {
  label: string;
  active: boolean;
  onClick: () => void;
  color?: "blue" | "yellow" | "green";
}

const FilterBtn: React.FC<FilterBtnProps> = ({
  label,
  active,
  onClick,
  color = "blue",
}) => {
  const styles: Record<string, string> = {
    blue: active
      ? "bg-blue-600 text-white shadow-xl scale-105"
      : "text-gray-400 hover:text-gray-600",
    yellow: active
      ? "bg-yellow-500 text-white shadow-xl scale-105"
      : "text-gray-400 hover:text-gray-600",
    green: active
      ? "bg-green-600 text-white shadow-xl scale-105"
      : "text-gray-400 hover:text-gray-600",
  };
  return (
    <button
      onClick={onClick}
      className={`px-6 py-2.5 rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] transition-all cursor-pointer whitespace-nowrap ${styles[color]}`}
    >
      {label}
    </button>
  );
};

interface PreviewSectionProps {
  title: string;
  children: React.ReactNode;
}

const PreviewSection: React.FC<PreviewSectionProps> = ({ title, children }) => (
  <div className="space-y-6">
    <h4 className="text-[10px] font-black text-gray-300 uppercase tracking-[0.4em] border-b border-gray-50 pb-4">
      {title}
    </h4>
    <div className="grid grid-cols-2 gap-x-8 gap-y-8">{children}</div>
  </div>
);

interface DataLabelProps {
  label: string;
  value: string | undefined;
  isFull?: boolean;
  active?: boolean;
}

const DataLabel: React.FC<DataLabelProps> = ({
  label,
  value,
  isFull,
  active,
}) => (
  <div
    className={`${isFull ? "col-span-2" : ""} transition-all duration-500 p-3 rounded-2xl border border-transparent ${active ? "bg-blue-50 border-blue-100 scale-105 shadow-sm" : ""}`}
  >
    <p className="text-[10px] text-gray-400 font-black uppercase mb-2 tracking-widest">
      {label}
    </p>
    <p
      className={`text-sm font-black break-all leading-relaxed ${active ? "text-blue-700" : "text-gray-800"}`}
    >
      {value || "---"}
    </p>
    {active && (
      <motion.span
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="text-[8px] font-black text-blue-400 uppercase mt-2 block tracking-[0.2em] animate-pulse"
      >
        Live Input...
      </motion.span>
    )}
  </div>
);
