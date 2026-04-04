"use client";

import { Activity } from "lucide-react";
import { motion } from "framer-motion";

export default function HomeClient() {
  return (
    <main className="flex-1 flex flex-col items-center justify-center p-6 text-center relative overflow-hidden bg-white">
      <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-blue-50 rounded-full blur-[120px] pointer-events-none opacity-60" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-indigo-50 rounded-full blur-[100px] pointer-events-none opacity-40" />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        className="max-w-4xl w-full space-y-10 relative z-10"
      >
        <div className="inline-flex items-center space-x-2 bg-blue-50 text-blue-600 px-4 py-2 rounded-2xl border border-blue-100 shadow-sm mb-4">
          <Activity className="w-4 h-4 animate-pulse" />
          <span className="text-[10px] font-black uppercase tracking-[0.2em]">
            Next Gen Health care
          </span>
        </div>

        <div className="space-y-6">
          <h1 className="text-5xl md:text-7xl font-black text-gray-900 tracking-tighter leading-[0.85] flex flex-col">
            <span>Intelligent</span>
            <span className="text-blue-600 font-medium">Healthcare</span>
          </h1>
          <h2 className="text-2xl md:text-4xl font-bold text-gray-400 tracking-tight">
            Caring for you, anytime, anywhere.
          </h2>
          <p className="text-lg md:text-xl text-gray-500 max-w-2xl mx-auto font-medium leading-relaxed mt-8">
            We develop the future of medical services, believing that universal
            access to high-quality healthcare is the key to elevating quality of
            life for everyone.
          </p>
        </div>

        <div className="pt-16 animate-bounce">
          <p className="text-[10px] font-black uppercase tracking-[0.3em] text-blue-600/40">
            Open menu to explore
          </p>
        </div>
      </motion.div>
    </main>
  );
}
