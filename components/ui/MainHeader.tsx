"use client";

import React, { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { usePatient } from "@/contexts/PatientContext";
import { Button } from "@/components/button";
import {
  Menu,
  X,
  LayoutDashboard,
  UserCircle,
  Home,
  ChevronRight,
  Activity,
  PlusCircle,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export const MainHeader: React.FC = () => {
  const pathname = usePathname();
  const { patientState, startNewSession, connectionStatus } = usePatient();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const isStaff = pathname.includes("/staff-view");
  const isPatient = pathname.includes("/patient");
  const isHome = pathname === "/";

  const toggleMenu = () => setIsMenuOpen(!isMenuOpen);

  return (
    <>
      <header className="sticky top-0 z-40 w-full bg-white/80 backdrop-blur-md border-b border-blue-50 px-4 md:px-8 py-3">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Link href="/" onClick={() => setIsMenuOpen(false)}>
              <Image
                src="/image/agnos-logo-with-text.svg"
                alt="Agnos Logo"
                width={100}
                height={32}
                priority
                className="cursor-pointer hover:opacity-80 transition-opacity"
                style={{ height: "auto" }}
              />

            </Link>
          </div>

          <div className="flex items-center space-x-3 md:space-x-6">
            {!isHome && (
              <div className="hidden sm:flex flex-col items-end border-r border-gray-100 pr-4">
                <p className="text-[8px] font-black uppercase tracking-[0.2em] text-gray-400 mb-0.5">
                  {isPatient ? "Session ID" : "Live Sync"}
                </p>
                <div
                  className={`flex items-center font-bold text-[10px] uppercase ${connectionStatus === "SUBSCRIBED" ? "text-green-600" : "text-orange-500"}`}
                >
                  {isPatient
                    ? patientState.sessionId || "..."
                    : connectionStatus}
                </div>
              </div>
            )}

            <button
              onClick={toggleMenu}
              className="relative p-2 rounded-xl bg-gray-50 hover:bg-blue-50 text-gray-600 hover:text-blue-600 transition-all cursor-pointer"
            >
              {!isMenuOpen && (
                <span className="absolute top-0 right-0 flex h-2.5 w-2.5 -mt-0.5 -mr-0.5">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-blue-600"></span>
                </span>
              )}
              {isMenuOpen ? (
                <X className="w-6 h-6" />
              ) : (
                <Menu className="w-6 h-6" />
              )}
            </button>
          </div>
        </div>
      </header>

      <AnimatePresence>
        {isMenuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="fixed inset-0 z-30 bg-white pt-24 px-6"
          >
            <div className="max-w-2xl mx-auto space-y-12">
              <div className="space-y-4">
                <p className="text-[10px] font-black uppercase tracking-[0.3em] text-blue-600 ml-1">
                  Menu Navigation
                </p>
                <nav className="space-y-2">
                  <MenuLink
                    href="/"
                    icon={<Home className="w-5 h-5" />}
                    label="Home"
                    active={isHome}
                    onClick={toggleMenu}
                  />
                  <MenuLink
                    href="/patient"
                    icon={<UserCircle className="w-5 h-5" />}
                    label="Patient Form"
                    active={isPatient}
                    onClick={toggleMenu}
                    target="_blank"
                  />
                  <MenuLink
                    href="/staff-view"
                    icon={<LayoutDashboard className="w-5 h-5" />}
                    label="Staff Dashboard"
                    active={isStaff}
                    onClick={toggleMenu}
                    target="_blank"
                  />
                </nav>
              </div>

              {isPatient && (
                <div className="pt-8 border-t border-gray-100">
                  <Button
                    variant="outline"
                    onClick={() => {
                      startNewSession();
                      toggleMenu();
                    }}
                    className="w-full h-14 rounded-2xl font-black uppercase tracking-widest text-xs gap-3 border-blue-100 text-blue-600"
                  >
                    <PlusCircle className="w-5 h-5" /> Start New Form
                  </Button>
                </div>
              )}

              <div className="pt-12 text-center">
                <div className="inline-flex items-center space-x-2 text-gray-300">
                  <Activity className="w-4 h-4" />
                  <span className="text-[10px] font-black uppercase tracking-widest">
                    Agnos Health
                  </span>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

interface MenuLinkProps {
  href: string;
  icon: React.ReactNode;
  label: string;
  active: boolean;
  onClick: () => void;
  target?: string;
}

const MenuLink = ({
  href,
  icon,
  label,
  active,
  onClick,
  target,
}: MenuLinkProps) => (
  <Link
    href={href}
    target={target}
    onClick={onClick}
    className={`flex items-center justify-between p-6 rounded-3xl transition-all group ${
      active
        ? "bg-blue-600 text-white shadow-xl shadow-blue-200"
        : "bg-gray-50 hover:bg-blue-50 text-gray-600"
    }`}
  >
    <div className="flex items-center space-x-4">
      <div className={active ? "text-white" : "text-blue-600"}>{icon}</div>
      <span className="text-lg font-black uppercase tracking-tighter">
        {label}
      </span>
    </div>
    <ChevronRight
      className={`w-5 h-5 transition-transform group-hover:translate-x-1 ${active ? "text-white/50" : "text-gray-300"}`}
    />
  </Link>
);
