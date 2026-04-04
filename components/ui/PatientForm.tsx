"use client";

import React, { useState, useEffect } from "react";
import { usePatient } from "@/contexts/PatientContext";
import { Input } from "@/components/input";
import { Label } from "@/components/label";
import { Button } from "@/components/button";
import { CheckCircle2, PlusCircle, AlertCircle, Loader2 } from "lucide-react";
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
            className="fixed inset-0 z-50 flex items-center justify-center bg-white/90 backdrop-blur-sm"
          >
            <div className="space-y-6 p-8 text-center">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: "spring", stiffness: 200, damping: 20 }}
                className="mx-auto flex h-24 w-24 items-center justify-center rounded-full bg-green-100 text-green-600"
              >
                <CheckCircle2 className="h-12 w-12" />
              </motion.div>
              <h2 className="text-3xl font-black text-gray-900">
                Submission Successful!
              </h2>
              <p className="text-lg font-medium text-gray-500">
                Your data has been securely synced with our staff.
              </p>
              <div className="pt-4">
                <div className="inline-flex items-center space-x-3 rounded-2xl bg-gray-100 px-6 py-3">
                  <Loader2 className="h-5 w-5 animate-spin text-blue-600" />
                  <span className="font-bold text-gray-700">
                    Resetting form in{" "}
                    <span className="text-xl text-blue-600">{countdown}</span>
                    ...
                  </span>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {error && (
        <div className="flex items-center space-x-3 animate-pulse rounded-xl border border-red-200 bg-red-50 p-4 text-red-800">
          <AlertCircle className="h-6 w-6 text-red-600" />
          <div>
            <p className="font-bold">Connection Issue</p>
            <p className="text-sm">{error}</p>
          </div>
        </div>
      )}

      <div className="flex items-center justify-between rounded-xl border border-gray-100 bg-white p-4 shadow-xs">
        <div>
          <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400">
            Active Session
          </p>
          <p className="font-mono text-sm text-blue-600">
            {patientState.sessionId}
          </p>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={startNewSession}
          className="rounded-xl text-[10px] font-bold uppercase cursor-pointer gap-2 tracking-widest"
        >
          <PlusCircle className="h-4 w-4" /> New Form
        </Button>
      </div>

      <form
        onSubmit={handleSubmit}
        className={`space-y-8 rounded-[2rem] border border-gray-100 bg-white p-8 shadow-xl transition-all duration-500 ${countdown !== null ? "scale-95 blur-xs pointer-events-none opacity-20" : ""}`}
      >
        <div className="space-y-6">
          <h2 className="border-b border-gray-50 pb-4 text-2xl font-black uppercase tracking-tighter text-gray-900">
            Personal Information
          </h2>
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            <div className="space-y-2">
              <Label
                htmlFor="firstName"
                className="text-[10px] font-bold uppercase tracking-widest text-gray-400"
              >
                First Name
              </Label>
              <Input
                id="firstName"
                name="firstName"
                value={patientData.firstName}
                onChange={handleChange}
                placeholder="John"
                required
                className="rounded-xl border-none bg-gray-50 transition-all focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div className="space-y-2">
              <Label
                htmlFor="middleName"
                className="text-[10px] font-bold uppercase tracking-widest text-gray-400"
              >
                Middle Name (Optional)
              </Label>
              <Input
                id="middleName"
                name="middleName"
                value={patientData.middleName || ""}
                onChange={handleChange}
                placeholder="Quincy"
                className="rounded-xl border-none bg-gray-50 transition-all focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div className="space-y-2">
              <Label
                htmlFor="lastName"
                className="text-[10px] font-bold uppercase tracking-widest text-gray-400"
              >
                Last Name
              </Label>
              <Input
                id="lastName"
                name="lastName"
                value={patientData.lastName}
                onChange={handleChange}
                placeholder="Doe"
                required
                className="rounded-xl border-none bg-gray-50 transition-all focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div className="space-y-2">
              <Label
                htmlFor="dateOfBirth"
                className="text-[10px] font-bold uppercase tracking-widest text-gray-400"
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
                className="rounded-xl border-none bg-gray-50 transition-all focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div className="space-y-2">
              <Label
                htmlFor="gender"
                className="text-[10px] font-bold uppercase tracking-widest text-gray-400"
              >
                Gender
              </Label>
              <select
                id="gender"
                name="gender"
                value={patientData.gender}
                onChange={handleChange}
                className="flex h-10 w-full rounded-xl border-none bg-gray-50 px-3 py-2 text-sm transition-all focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-blue-500"
                required
              >
                <option value="">Select Gender</option>
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
                className="text-[10px] font-bold uppercase tracking-widest text-gray-400"
              >
                Religion (Optional)
              </Label>
              <Input
                id="religion"
                name="religion"
                value={patientData.religion || ""}
                onChange={handleChange}
                placeholder="Buddhist / Christian / Islam"
                className="rounded-xl border-none bg-gray-50 transition-all focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
        </div>

        <div className="space-y-6 pt-4">
          <h2 className="border-b border-gray-50 pb-4 text-2xl font-black uppercase tracking-tighter text-gray-900">
            Contact Channels
          </h2>
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            <div className="space-y-2">
              <Label
                htmlFor="email"
                className="text-[10px] font-bold uppercase tracking-widest text-gray-400"
              >
                Email Address
              </Label>
              <Input
                id="email"
                name="email"
                type="email"
                value={patientData.email}
                onChange={handleChange}
                placeholder="john.doe@example.com"
                required
                className="rounded-xl border-none bg-gray-50 transition-all focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div className="space-y-2">
              <Label
                htmlFor="phoneNumber"
                className="text-[10px] font-bold uppercase tracking-widest text-gray-400"
              >
                Phone Number
              </Label>
              <Input
                id="phoneNumber"
                name="phoneNumber"
                type="tel"
                value={patientData.phoneNumber}
                onChange={handleChange}
                placeholder="081-234-5678"
                required
                className="rounded-xl border-none bg-gray-50 transition-all focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div className="space-y-2 md:col-span-2">
              <Label
                htmlFor="address"
                className="text-[10px] font-bold uppercase tracking-widest text-gray-400"
              >
                Permanent Address
              </Label>
              <textarea
                id="address"
                name="address"
                value={patientData.address}
                onChange={handleChange}
                rows={3}
                className="flex w-full rounded-xl border-none bg-gray-50 px-3 py-2 text-sm transition-all focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-blue-500"
                placeholder="123 Street, City, Zip Code"
                required
              />
            </div>
          </div>
        </div>

        <div className="space-y-6 pt-4">
          <h2 className="border-b border-gray-50 pb-4 text-2xl font-black uppercase tracking-tighter text-gray-900">
            Emergency Contact (Optional)
          </h2>
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            <div className="space-y-2">
              <Label
                htmlFor="ecName"
                className="text-[10px] font-bold uppercase tracking-widest text-gray-400"
              >
                Contact Name
              </Label>
              <Input
                id="ecName"
                name="name"
                value={patientData.emergencyContact?.name || ""}
                onChange={handleEmergencyContactChange}
                placeholder="Jane Doe"
                className="rounded-xl border-none bg-gray-50 transition-all focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div className="space-y-2">
              <Label
                htmlFor="ecRelationship"
                className="text-[10px] font-bold uppercase tracking-widest text-gray-400"
              >
                Relationship
              </Label>
              <Input
                id="ecRelationship"
                name="relationship"
                value={patientData.emergencyContact?.relationship || ""}
                onChange={handleEmergencyContactChange}
                placeholder="Spouse / Parent / Sibling"
                className="rounded-xl border-none bg-gray-50 transition-all focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
        </div>

        <div className="space-y-6 pt-4">
          <h2 className="border-b border-gray-50 pb-4 text-2xl font-black uppercase tracking-tighter text-gray-900">
            Legal & Nationality
          </h2>
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            <div className="space-y-2">
              <Label
                htmlFor="nationality"
                className="text-[10px] font-bold uppercase tracking-widest text-gray-400"
              >
                Nationality
              </Label>
              <Input
                id="nationality"
                name="nationality"
                value={patientData.nationality}
                onChange={handleChange}
                placeholder="Thai"
                required
                className="rounded-xl border-none bg-gray-50 transition-all focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div className="space-y-2">
              <Label
                htmlFor="preferredLanguage"
                className="text-[10px] font-bold uppercase tracking-widest text-gray-400"
              >
                Preferred Language
              </Label>
              <Input
                id="preferredLanguage"
                name="preferredLanguage"
                value={patientData.preferredLanguage}
                onChange={handleChange}
                placeholder="Thai / English"
                required
                className="rounded-xl border-none bg-gray-50 transition-all focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
        </div>

        <div className="pt-8">
          <Button
            type="submit"
            className="h-14 w-full rounded-2xl font-black uppercase shadow-lg shadow-blue-100 cursor-pointer tracking-[0.2em]"
            size="lg"
          >
            {patientState.status === PATIENT_STATUS.SUBMITTED
              ? "Update Registration"
              : "Finalize & Submit"}
          </Button>
        </div>

        <div className="mt-4 text-center">
          <div
            className={`inline-flex items-center space-x-2 rounded-full border px-4 py-2 transition-all duration-500 ${
              patientState.status === PATIENT_STATUS.FILLING
                ? "border-yellow-100 bg-yellow-50 text-yellow-700"
                : "border-green-100 bg-green-50 text-green-700"
            }`}
          >
            <span
              className={`h-2 w-2 rounded-full ${patientState.status === PATIENT_STATUS.FILLING ? "animate-pulse bg-yellow-500" : "bg-green-500"}`}
            />
            <span className="text-[10px] font-black uppercase tracking-widest">
              {patientState.status === PATIENT_STATUS.FILLING
                ? "Live Sync Active"
                : "Security Verified & Saved"}
            </span>
          </div>
        </div>
      </form>
    </div>
  );
};
