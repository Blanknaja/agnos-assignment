"use client";

import React from "react";

export const Footer: React.FC = () => {
  const currentYear = new Date().getFullYear();
  
  return (
    <footer className="w-full bg-white border-t border-gray-100 py-6 px-4 md:px-8 shrink-0">
      <div className="max-w-7xl mx-auto text-center">
        <p className="text-[10px] md:text-xs font-black uppercase tracking-[0.3em] text-gray-400">
          © {currentYear} Agnos assignment
        </p>
      </div>
    </footer>
  );
};
