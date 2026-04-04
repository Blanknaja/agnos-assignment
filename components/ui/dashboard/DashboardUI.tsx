"use client";

import React from "react";
import { motion } from "framer-motion";

/**
 * --- FILTER BUTTON ---
 */
interface FilterBtnProps {
  label: string;
  active: boolean;
  onClick: () => void;
  color?: "blue" | "yellow" | "green";
}

export const FilterBtn: React.FC<FilterBtnProps> = ({
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

/**
 * --- PREVIEW SECTION (GROUPING) ---
 */
interface PreviewSectionProps {
  title: string;
  children: React.ReactNode;
}

export const PreviewSection: React.FC<PreviewSectionProps> = ({ title, children }) => (
  <div className="space-y-6 text-gray-900">
    <h4 className="text-[10px] font-black text-gray-300 uppercase tracking-[0.4em] border-b border-gray-50 pb-4">
      {title}
    </h4>
    <div className="grid grid-cols-2 gap-x-8 gap-y-8">{children}</div>
  </div>
);

/**
 * --- DATA LABEL (FIELD DISPLAY) ---
 */
interface DataLabelProps {
  label: string;
  value: string | undefined;
  isFull?: boolean;
  active?: boolean;
}

export const DataLabel: React.FC<DataLabelProps> = ({
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
