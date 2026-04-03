"use client";

import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  useRef,
  Suspense,
} from "react";
import { usePathname, useRouter } from "next/navigation";
import {
  PatientData,
  PatientRealTimeState,
  PatientStatus,
} from "@/interface/patient";
import { supabase } from "@/lib/supabase";
import {
  DEFAULT_PATIENT_DATA,
  PATIENT_STATUS,
  SESSION_EXPIRY_DAYS,
} from "@/const/patient";
import { RealtimeChannel } from "@supabase/supabase-js";

interface PatientContextType {
  patientState: PatientRealTimeState;
  allPatients: (PatientRealTimeState & { isOnline?: boolean })[];
  updatePatientData: (data: Partial<PatientData>, fieldName?: string) => void;
  updateStatus: (status: PatientStatus) => void;
  submitPatientData: () => void;
  startNewSession: () => void;
  error: string | null;
}

const PatientContext = createContext<PatientContextType | undefined>(undefined);

const PatientProviderInternal: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const pathname = usePathname();
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);

  const [patientState, setPatientState] = useState<PatientRealTimeState>({
    sessionId: "",
    patientData: DEFAULT_PATIENT_DATA,
    status: PATIENT_STATUS.INACTIVE,
    lastUpdated: new Date().toISOString(),
  });

  const [allPatients, setAllPatients] = useState<
    (PatientRealTimeState & { isOnline?: boolean })[]
  >([]);
  const [onlineUsers, setOnlineUsers] = useState<Set<string>>(new Set());

  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const channelRef = useRef<RealtimeChannel | null>(null);

  // Helper to check if session is expired
  const isSessionExpired = (lastUpdated: string) => {
    if (SESSION_EXPIRY_DAYS === null) return false;
    const expiryMs = SESSION_EXPIRY_DAYS * 24 * 60 * 60 * 1000;
    const diff = new Date().getTime() - new Date(lastUpdated).getTime();
    return diff > expiryMs;
  };

  // 1. Session ID Management & Data Recovery
  useEffect(() => {
    if (typeof window === "undefined") return;
    const urlParams = new URLSearchParams(window.location.search);
    let sid = urlParams.get("id");

    const initialize = async () => {
      // Logic to find the best SID
      if (!sid) {
        sid = sessionStorage.getItem("current_sid");
        if (!sid && pathname === "/patient") {
          sid = `p_${Math.random().toString(36).substr(2, 6)}_${Date.now().toString().slice(-4)}`;
          sessionStorage.setItem("current_sid", sid);
        }
        if (sid) {
          window.history.replaceState(
            null,
            "",
            `${window.location.pathname}?id=${sid}`,
          );
        }
      }

      if (sid) {
        setPatientState((prev) => ({ ...prev, sessionId: sid as string }));
        const { data } = await supabase
          .from("patients")
          .select("*")
          .eq("session_id", sid)
          .maybeSingle();

        if (data) {
          // CHECK EXPIRATION
          if (isSessionExpired(data.last_updated)) {
            console.log("Session expired, starting fresh.");
            // If expired, clear and let it generate a new one on next cycle or wait
            sessionStorage.removeItem("current_sid");
            window.location.href = "/patient";
            return;
          }

          setPatientState({
            sessionId: data.session_id,
            patientData: data.patient_data as PatientData,
            status: data.status as PatientStatus,
            lastUpdated: data.last_updated,
          });
        }
      }
    };

    initialize();
  }, [pathname]);

  useEffect(() => {
    const sid = patientState.sessionId || "staff-monitor";

    supabase
      .from("patients")
      .select("*")
      .order("last_updated", { ascending: false })
      .then(({ data }) => {
        if (data)
          setAllPatients(
            data.map((item) => ({
              sessionId: item.session_id,
              patientData: item.patient_data as PatientData,
              status: item.status as PatientStatus,
              lastUpdated: item.last_updated,
              lastChangedField: item.last_changed_field,
            })),
          );
      });

    const channel = supabase.channel("hospital-main-v13", {
      config: { presence: { key: sid } },
    });

    channel
      .on("broadcast", { event: "typing" }, ({ payload }) => {
        setAllPatients((prev) => {
          const idx = prev.findIndex((p) => p.sessionId === payload.sessionId);
          if (idx !== -1) {
            const upd = [...prev];
            upd[idx] = { ...upd[idx], ...payload };
            return upd;
          }
          return [payload, ...prev];
        });
      })
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "patients" },
        (payload) => {
          if (payload.eventType === "DELETE") {
            setAllPatients((prev) =>
              prev.filter(
                (p) => p.sessionId !== (payload.old as any).session_id,
              ),
            );
            return;
          }
          const newData = payload.new as any;
          const mapped = {
            sessionId: newData.session_id,
            patientData: newData.patient_data as PatientData,
            status: newData.status as PatientStatus,
            lastUpdated: newData.last_updated,
            lastChangedField: newData.last_changed_field,
          };
          setAllPatients((prev) => {
            const idx = prev.findIndex((p) => p.sessionId === mapped.sessionId);
            if (idx !== -1) {
              const upd = [...prev];
              upd[idx] = { ...upd[idx], ...mapped };
              return upd;
            }
            return [mapped, ...prev];
          });
        },
      )
      .on("presence", { event: "sync" }, () => {
        setOnlineUsers(new Set(Object.keys(channel.presenceState())));
      })
      .subscribe(async (status) => {
        if (
          status === "SUBSCRIBED" &&
          pathname === "/patient" &&
          patientState.sessionId
        ) {
          await channel.track({ online_at: new Date().toISOString() });
        }
      });

    channelRef.current = channel;
    return () => {
      if (channelRef.current) supabase.removeChannel(channelRef.current);
    };
  }, [patientState.sessionId, pathname]);

  const syncChanges = useCallback(async (state: PatientRealTimeState) => {
    if (!state.sessionId || !channelRef.current) return;

    channelRef.current.send({
      type: "broadcast",
      event: "typing",
      payload: state,
    });

    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    timeoutRef.current = setTimeout(async () => {
      try {
        await supabase.from("patients").upsert(
          {
            session_id: state.sessionId,
            patient_data: state.patientData,
            status: state.status,
            last_updated: new Date().toISOString(),
            last_changed_field: state.lastChangedField,
          },
          { onConflict: "session_id" },
        );
      } catch (err: any) {
        setError(`Sync error: ${err.message}`);
      }
    }, 500);
  }, []);

  const updatePatientData = useCallback(
    (data: Partial<PatientData>, fieldName?: string) => {
      setPatientState((prev) => {
        const newState = {
          ...prev,
          patientData: { ...prev.patientData, ...data },
          status: PATIENT_STATUS.FILLING,
          lastUpdated: new Date().toISOString(),
          lastChangedField: fieldName,
        };
        syncChanges(newState);
        return newState;
      });
    },
    [syncChanges],
  );

  const updateStatus = useCallback(
    (status: PatientStatus) => {
      setPatientState((prev) => {
        const newState = {
          ...prev,
          status,
          lastUpdated: new Date().toISOString(),
        };
        syncChanges(newState);
        return newState;
      });
    },
    [syncChanges],
  );

  const submitPatientData = useCallback(() => {
    setPatientState((prev) => {
      const newState = {
        ...prev,
        status: PATIENT_STATUS.SUBMITTED,
        lastUpdated: new Date().toISOString(),
        lastChangedField: undefined,
      };
      syncChanges(newState);
      return newState;
    });
  }, [syncChanges]);

  const startNewSession = useCallback(() => {
    if (typeof window !== "undefined") {
      sessionStorage.removeItem("current_sid");
      window.location.href = "/patient";
    }
  }, []);

  return (
    <PatientContext.Provider
      value={{
        patientState,
        allPatients: allPatients.map((p) => ({
          ...p,
          isOnline: onlineUsers.has(p.sessionId),
        })),
        updatePatientData,
        updateStatus,
        submitPatientData,
        startNewSession,
        error,
      }}
    >
      {children}
    </PatientContext.Provider>
  );
};

export const PatientProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  return (
    <Suspense
      fallback={
        <div className="flex items-center justify-center h-screen bg-white text-blue-600 font-bold">
          Connecting to Health Services...
        </div>
      }
    >
      <PatientProviderInternal>{children}</PatientProviderInternal>
    </Suspense>
  );
};

export const usePatient = () => {
  const context = useContext(PatientContext);
  if (!context)
    throw new Error("usePatient must be used within PatientProvider");
  return context;
};
