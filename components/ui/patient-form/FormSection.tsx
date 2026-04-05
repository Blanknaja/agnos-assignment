"use client";

import React from "react";
import { LucideIcon } from "lucide-react";

interface FormSectionProps {
  title: string;
  subtitle: string;
  icon: LucideIcon;
  iconColorClass?: string;
  bgIconColorClass?: string;
  children: React.ReactNode;
}

export const FormSection: React.FC<FormSectionProps> = ({
  title,
  subtitle,
  icon: Icon,
  iconColorClass = "text-blue-600",
  bgIconColorClass = "bg-blue-50",
  children,
}) => {
  return (
    <div className="space-y-8">
      <div className="flex items-center space-x-3 border-b border-gray-50 pb-4">
        <div className={`${bgIconColorClass} p-2 rounded-xl ${iconColorClass}`}>
          <Icon className="w-5 h-5" />
        </div>
        <h2 className="text-lg md:text-xl font-black tracking-tight text-gray-900 uppercase">
          {title} <span className={iconColorClass}>{subtitle}</span>
        </h2>
      </div>
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        {children}
      </div>
    </div>
  );
};
