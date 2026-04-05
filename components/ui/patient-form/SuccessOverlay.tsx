"use client";

import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ShieldCheck, Loader2 } from "lucide-react";

interface SuccessOverlayProps {
  isVisible: boolean;
  countdown: number | null;
}

export const SuccessOverlay: React.FC<SuccessOverlayProps> = ({
  isVisible,
  countdown,
}) => {
  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-blue-600/90 backdrop-blur-md"
        >
          <div className="space-y-8 p-8 text-center text-white">
            <motion.div
              initial={{ scale: 0, rotate: -180 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ type: "spring", stiffness: 200, damping: 15 }}
              className="mx-auto flex h-32 w-32 items-center justify-center rounded-[2.5rem] bg-white text-blue-600 shadow-2xl"
            >
              <ShieldCheck className="h-16 w-16" />
            </motion.div>
            <div className="space-y-2">
              <h2 className="text-4xl font-black uppercase tracking-tighter">
                Securely Transmitted
              </h2>
              <p className="text-xl font-medium text-blue-100">
                We have received your information.
              </p>
            </div>
            <div className="pt-8">
              <div className="inline-flex items-center space-x-4 bg-white/10 px-8 py-4 rounded-3xl border border-white/20">
                <Loader2 className="h-6 w-6 animate-spin text-white" />
                <span className="font-black uppercase tracking-widest text-sm">
                  Refreshing Portal in{" "}
                  <span className="text-2xl ml-2 font-mono">{countdown}</span>
                </span>
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
