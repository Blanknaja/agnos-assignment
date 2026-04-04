"use client";

import React, { useState, useEffect } from "react";
import { usePatient } from "@/contexts/PatientContext";
import { Input } from "@/components/input";
import { Label } from "@/components/label";
import { Button } from "@/components/button";
import {
  AlertCircle,
  Loader2,
  ShieldCheck,
  Heart,
  User,
  Globe,
} from "lucide-react";
import { GENDER_OPTIONS, PATIENT_STATUS } from "@/const/patient";
import { motion, AnimatePresence } from "framer-motion";

export const PatientForm: React.FC = () => {
  const {
    patientState,
    updatePatientData,
    submitPatientData,
    startNewSession,
    error,
  } = usePatient();
  const { patientData } = patientState;
  const [countdown, setCountdown] = useState<number | null>(null);

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >,
  ) => {
    const { name, value } = e.target;
    updatePatientData({ [name]: value }, name);
  };

  const handleEmergencyContactChange = (
    e: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const { name, value } = e.target;
    const currentContact = patientData.emergencyContact || {
      name: "",
      relationship: "",
    };
    updatePatientData(
      {
        emergencyContact: {
          ...currentContact,
          [name]: value,
        },
      },
      `emergencyContact.${name}`,
    );
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    submitPatientData();
    setCountdown(3);
  };

  useEffect(() => {
    if (countdown === null) return;
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    } else {
      startNewSession();
    }
  }, [countdown, startNewSession]);

  return (
    <div className="relative mx-auto max-w-3xl space-y-6 text-gray-900">
      {/* Success Countdown Overlay */}
      <AnimatePresence>
        {countdown !== null && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-blue-600/90 backdrop-blur-md"
          >
            <div className="space-y-6 p-8 text-center text-white">
              <motion.div
                initial={{ scale: 0, rotate: -180 }}
                animate={{ scale: 1, rotate: 0 }}
                transition={{ type: "spring", stiffness: 200, damping: 15 }}
                className="mx-auto flex h-24 w-24 items-center justify-center rounded-3xl bg-white text-blue-600 shadow-2xl"
              >
                <ShieldCheck className="h-12 w-12" />
              </motion.div>
              <div className="space-y-1">
                <h2 className="text-2xl font-black uppercase tracking-tighter">
                  Data Received
                </h2>
                <p className="text-base font-medium text-blue-100">
                  Your information is now being processed.
                </p>
              </div>
              <div className="pt-4">
                <div className="inline-flex items-center space-x-3 bg-white/10 px-6 py-3 rounded-2xl border border-white/20">
                  <Loader2 className="h-5 w-5 animate-spin text-white" />
                  <span className="font-bold uppercase tracking-widest text-xs">
                    Form Resetting in{" "}
                    <span className="text-lg ml-1 font-mono">{countdown}</span>
                  </span>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {error && (
        <div className="flex items-center space-x-3 animate-pulse rounded-2xl border border-red-200 bg-red-50 p-4 text-red-800 shadow-lg shadow-red-900/5">
          <AlertCircle className="h-5 w-5 text-red-600" />
          <div>
            <p className="font-bold uppercase text-[10px] tracking-widest text-red-900">
              System Error
            </p>
            <p className="text-xs font-medium opacity-80">{error}</p>
          </div>
        </div>
      )}

      <form
        onSubmit={handleSubmit}
        className={`space-y-10 rounded-[2.5rem] border border-blue-50 bg-white p-8 md:p-12 shadow-2xl shadow-blue-900/5 transition-all duration-700 ${countdown !== null ? "scale-95 blur-md pointer-events-none opacity-20" : "scale-100"}`}
      >
        <div className="space-y-8">
          <div className="flex items-center space-x-3 border-b border-gray-50 pb-4">
            <div className="bg-blue-50 p-2 rounded-xl text-blue-600">
              <User className="w-5 h-5" />
            </div>
            <h2 className="text-lg md:text-xl font-black tracking-tight text-gray-900 uppercase">
              Personal <span className="text-blue-600">Profile</span>
            </h2>
          </div>

          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            <div className="space-y-2">
              <Label
                htmlFor="firstName"
                className="text-[10px] font-black uppercase tracking-widest text-gray-400 ml-1"
              >
                First Name
              </Label>
              <Input
                id="firstName"
                name="firstName"
                value={patientData.firstName}
                onChange={handleChange}
                placeholder="Ex. John"
                required
                className="h-12 px-5 rounded-xl border-2 border-gray-50 bg-gray-50/50 transition-all focus:bg-white focus:border-blue-500 focus:ring-0 font-bold text-sm"
              />
            </div>
            <div className="space-y-2">
              <Label
                htmlFor="middleName"
                className="text-[10px] font-black uppercase tracking-widest text-gray-400 ml-1"
              >
                Middle Name
              </Label>
              <Input
                id="middleName"
                name="middleName"
                value={patientData.middleName || ""}
                onChange={handleChange}
                placeholder="Optional"
                className="h-12 px-5 rounded-xl border-2 border-gray-50 bg-gray-50/50 transition-all focus:bg-white focus:border-blue-500 focus:ring-0 font-bold text-sm"
              />
            </div>
            <div className="space-y-2">
              <Label
                htmlFor="lastName"
                className="text-[10px] font-black uppercase tracking-widest text-gray-400 ml-1"
              >
                Last Name
              </Label>
              <Input
                id="lastName"
                name="lastName"
                value={patientData.lastName}
                onChange={handleChange}
                placeholder="Ex. Doe"
                required
                className="h-12 px-5 rounded-xl border-2 border-gray-50 bg-gray-50/50 transition-all focus:bg-white focus:border-blue-500 focus:ring-0 font-bold text-sm"
              />
            </div>
            <div className="space-y-2">
              <Label
                htmlFor="dateOfBirth"
                className="text-[10px] font-black uppercase tracking-widest text-gray-400 ml-1"
              >
                Date of Birth
              </Label>
              <Input
                id="dateOfBirth"
                name="dateOfBirth"
                type="date"
                value={patientData.dateOfBirth}
                onChange={handleChange}
                required
                className="h-12 px-5 rounded-xl border-2 border-gray-50 bg-gray-50/50 transition-all focus:bg-white focus:border-blue-500 focus:ring-0 font-bold text-sm"
              />
            </div>
            <div className="space-y-2">
              <Label
                htmlFor="gender"
                className="text-[10px] font-black uppercase tracking-widest text-gray-400 ml-1"
              >
                Gender
              </Label>
              <select
                id="gender"
                name="gender"
                value={patientData.gender}
                onChange={handleChange}
                className="flex h-12 w-full rounded-xl border-2 border-gray-50 bg-gray-50/50 px-5 py-2 text-sm font-bold transition-all focus:bg-white focus:border-blue-500 focus:outline-none focus:ring-0 appearance-none"
                required
              >
                <option value="">Choose Gender</option>
                {GENDER_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
            </div>
            <div className="space-y-2">
              <Label
                htmlFor="religion"
                className="text-[10px] font-black uppercase tracking-widest text-gray-400 ml-1"
              >
                Religion
              </Label>
              <Input
                id="religion"
                name="religion"
                value={patientData.religion || ""}
                onChange={handleChange}
                placeholder="Optional"
                className="h-12 px-5 rounded-xl border-2 border-gray-50 bg-gray-50/50 transition-all focus:bg-white focus:border-blue-500 focus:ring-0 font-bold text-sm"
              />
            </div>
          </div>
        </div>

        <div className="space-y-8 pt-2">
          <div className="flex items-center space-x-3 border-b border-gray-50 pb-4">
            <div className="bg-indigo-50 p-2 rounded-xl text-indigo-600">
              <Globe className="w-5 h-5" />
            </div>
            <h2 className="text-lg md:text-xl font-black tracking-tight text-gray-900 uppercase">
              Contact <span className="text-indigo-600">Methods</span>
            </h2>
          </div>

          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            <div className="space-y-2">
              <Label
                htmlFor="email"
                className="text-[10px] font-black uppercase tracking-widest text-gray-400 ml-1"
              >
                Email Address
              </Label>
              <Input
                id="email"
                name="email"
                type="email"
                value={patientData.email}
                onChange={handleChange}
                placeholder="example@mail.com"
                required
                className="h-12 px-5 rounded-xl border-2 border-gray-50 bg-gray-50/50 transition-all focus:bg-white focus:border-blue-500 focus:ring-0 font-bold text-sm"
              />
            </div>
            <div className="space-y-2">
              <Label
                htmlFor="phoneNumber"
                className="text-[10px] font-black uppercase tracking-widest text-gray-400 ml-1"
              >
                Phone Number
              </Label>
              <Input
                id="phoneNumber"
                name="phoneNumber"
                type="tel"
                value={patientData.phoneNumber}
                onChange={handleChange}
                placeholder="0xx-xxx-xxxx"
                required
                className="h-12 px-5 rounded-xl border-2 border-gray-50 bg-gray-50/50 transition-all focus:bg-white focus:border-blue-500 focus:ring-0 font-bold text-sm"
              />
            </div>
            <div className="space-y-2 md:col-span-2">
              <Label
                htmlFor="address"
                className="text-[10px] font-black uppercase tracking-widest text-gray-400 ml-1"
              >
                Residential Address
              </Label>
              <textarea
                id="address"
                name="address"
                value={patientData.address}
                onChange={handleChange}
                rows={2}
                className="flex w-full rounded-xl border-2 border-gray-50 bg-gray-50/50 px-5 py-3 text-sm font-bold transition-all focus:bg-white focus:border-blue-500 focus:outline-none focus:ring-0"
                placeholder="Enter full address here..."
                required
              />
            </div>
          </div>
        </div>

        <div className="space-y-8 pt-2">
          <div className="flex items-center space-x-3 border-b border-gray-50 pb-4">
            <div className="bg-red-50 p-2 rounded-xl text-red-600">
              <Heart className="w-5 h-5" />
            </div>
            <h2 className="text-lg md:text-xl font-black tracking-tight text-gray-900 uppercase">
              Emergency <span className="text-red-600">Contact</span>
            </h2>
          </div>

          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            <div className="space-y-2">
              <Label
                htmlFor="ecName"
                className="text-[10px] font-black uppercase tracking-widest text-gray-400 ml-1"
              >
                Contact Name
              </Label>
              <Input
                id="ecName"
                name="name"
                value={patientData.emergencyContact?.name || ""}
                onChange={handleEmergencyContactChange}
                placeholder="Full Name"
                className="h-12 px-5 rounded-xl border-2 border-gray-50 bg-gray-50/50 transition-all focus:bg-white focus:border-blue-500 focus:ring-0 font-bold text-sm"
              />
            </div>
            <div className="space-y-2">
              <Label
                htmlFor="ecRelationship"
                className="text-[10px] font-black uppercase tracking-widest text-gray-400 ml-1"
              >
                Relationship
              </Label>
              <Input
                id="ecRelationship"
                name="relationship"
                value={patientData.emergencyContact?.relationship || ""}
                onChange={handleEmergencyContactChange}
                placeholder="e.g. Sibling"
                className="h-12 px-5 rounded-xl border-2 border-gray-50 bg-gray-50/50 transition-all focus:bg-white focus:border-blue-500 focus:ring-0 font-bold text-sm"
              />
            </div>
          </div>
        </div>

        <div className="space-y-8 pt-2">
          <div className="flex items-center space-x-3 border-b border-gray-50 pb-4">
            <div className="bg-teal-50 p-2 rounded-xl text-teal-600">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <h2 className="text-lg md:text-xl font-black tracking-tight text-gray-900 uppercase">
              Identification <span className="text-teal-600">Legal</span>
            </h2>
          </div>

          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            <div className="space-y-2">
              <Label
                htmlFor="nationality"
                className="text-[10px] font-black uppercase tracking-widest text-gray-400 ml-1"
              >
                Nationality
              </Label>
              <Input
                id="nationality"
                name="nationality"
                value={patientData.nationality}
                onChange={handleChange}
                placeholder="Ex. Thai"
                required
                className="h-12 px-5 rounded-xl border-2 border-gray-50 bg-gray-50/50 transition-all focus:bg-white focus:border-blue-500 focus:ring-0 font-bold text-sm"
              />
            </div>
            <div className="space-y-2">
              <Label
                htmlFor="preferredLanguage"
                className="text-[10px] font-black uppercase tracking-widest text-gray-400 ml-1"
              >
                Preferred Language
              </Label>
              <Input
                id="preferredLanguage"
                name="preferredLanguage"
                value={patientData.preferredLanguage}
                onChange={handleChange}
                placeholder="Ex. Thai"
                required
                className="h-12 px-5 rounded-xl border-2 border-gray-50 bg-gray-50/50 transition-all focus:bg-white focus:border-blue-500 focus:ring-0 font-bold text-sm"
              />
            </div>
          </div>
        </div>

        <div className="pt-6">
          <Button
            type="submit"
            className="h-14 w-full rounded-2xl bg-blue-600 hover:bg-blue-700 text-white text-base font-black uppercase tracking-[0.2em] shadow-xl shadow-blue-600/20 cursor-pointer active:scale-[0.98] transition-all"
            size="lg"
          >
            {patientState.status === PATIENT_STATUS.SUBMITTED
              ? "Update Information"
              : "Submit Form"}
          </Button>
        </div>

        <div className="mt-2 text-center">
          <div
            className={`inline-flex items-center space-x-2 px-4 py-1.5 rounded-full transition-all duration-700 ${
              patientState.status === PATIENT_STATUS.FILLING
                ? "text-yellow-600 bg-yellow-50/50"
                : "text-green-600 bg-green-50/50"
            }`}
          >
            <span
              className={`h-1.5 w-1.5 rounded-full ${patientState.status === PATIENT_STATUS.FILLING ? "animate-pulse bg-yellow-500" : "bg-green-500"}`}
            />
            <span className="text-[9px] font-black uppercase tracking-widest">
              {patientState.status === PATIENT_STATUS.FILLING
                ? "Live Sync Active"
                : "Data Securely Saved"}
            </span>
          </div>
        </div>
      </form>
    </div>
  );
};
