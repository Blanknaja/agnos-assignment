"use client";

import React from "react";
import Link from "next/link";
import { ChevronRight } from "lucide-react";

interface MenuLinkProps {
  href: string;
  icon: React.ReactNode;
  label: string;
  active: boolean;
  onClick: () => void;
  target?: string;
}

export const MenuLink: React.FC<MenuLinkProps> = ({
  href,
  icon,
  label,
  active,
  onClick,
  target,
}) => (
  <Link 
    href={href} 
    target={target}
    onClick={onClick}
    className={`flex items-center justify-between p-6 rounded-3xl transition-all group ${
      active ? 'bg-blue-600 text-white shadow-xl shadow-blue-200' : 'bg-gray-50 hover:bg-blue-50 text-gray-600'
    }`}
  >
    <div className="flex items-center space-x-4">
      <div className={active ? 'text-white' : 'text-blue-600'}>{icon}</div>
      <span className="text-lg font-black uppercase tracking-tighter">{label}</span>
    </div>
    <ChevronRight className={`w-5 h-5 transition-transform group-hover:translate-x-1 ${active ? 'text-white/50' : 'text-gray-300'}`} />
  </Link>
);
