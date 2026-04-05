"use client";

import React from "react";

interface StatusIndicatorProps {
  label: string;
  value: string;
  isSubscribed: boolean;
}

export const StatusIndicator: React.FC<StatusIndicatorProps> = ({ label, value, isSubscribed }) => {
  return (
    <div className="text-right flex flex-col items-end">
      <p className="text-[8px] font-black uppercase tracking-[0.2em] text-gray-400 mb-0.5">
        {label}
      </p>
      <div className={`flex items-center font-bold text-[10px] uppercase ${isSubscribed ? 'text-green-600' : 'text-orange-500'}`}>
        <span className="relative flex h-1.5 w-1.5 mr-1.5">
          {isSubscribed && <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>}
          <span className={`relative inline-flex rounded-full h-1.5 w-1.5 ${isSubscribed ? 'bg-green-500' : 'bg-orange-500'}`}></span>
        </span>
        {value}
      </div>
    </div>
  );
};
