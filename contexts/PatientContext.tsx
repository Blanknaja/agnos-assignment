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
import { usePathname } from "next/navigation";
import {
  PatientData,
  PatientRealTimeState,
  PatientStatus,
} from "@/interface/patient";
import { supabase } from "@/lib/supabase";
import { DEFAULT_PATIENT_DATA, PATIENT_STATUS } from "@/const/patient";
import { RealtimeChannel } from "@supabase/supabase-js";

interface PatientContextType {
  patientState: PatientRealTimeState;
  allPatients: (PatientRealTimeState & { isOnline?: boolean })[];
  updatePatientData: (data: Partial<PatientData>) => void;
  updateStatus: (status: PatientStatus) => void;
  submitPatientData: () => void;
  error: string | null;
}

const PatientContext = createContext<PatientContextType | undefined>(undefined);

const PatientProviderInternal: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const pathname = usePathname();
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

  useEffect(() => {
    if (typeof window === "undefined") return;

    const init = async () => {
      const urlParams = new URLSearchParams(window.location.search);
      let sid = urlParams.get("id");

      if (!sid && pathname === "/patient") {
        sid = `p_${Math.random().toString(36).substr(2, 6)}_${Date.now().toString().slice(-4)}`;
        window.history.replaceState(
          null,
          "",
          `${window.location.pathname}?id=${sid}`,
        );
      }

      if (sid) {
        setPatientState((prev) => ({ ...prev, sessionId: sid as string }));
        const { data } = await supabase
          .from("patients")
          .select("*")
          .eq("session_id", sid)
          .maybeSingle();
        if (data) {
          setPatientState({
            sessionId: data.session_id,
            patientData: data.patient_data as PatientData,
            status: data.status as PatientStatus,
            lastUpdated: data.last_updated,
          });
        }
      }
    };
    init();
  }, [pathname]);

  useEffect(() => {
    if (!patientState.sessionId && pathname !== "/staff-view") return;

    if (channelRef.current) {
      supabase.removeChannel(channelRef.current);
    }

    const sid = patientState.sessionId || "staff-session";
    const channel = supabase.channel("hospital-main-hub", {
      config: { presence: { key: sid } },
    });

    channel
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "patients" },
        (payload) => {
          setAllPatients((prev) => {
            if (payload.eventType === "DELETE")
              return prev.filter(
                (p) => p.sessionId !== (payload.old as any).session_id,
              );
            const newData = payload.new as any;
            const mapped: PatientRealTimeState = {
              sessionId: newData.session_id,
              patientData: newData.patient_data as PatientData,
              status: newData.status as PatientStatus,
              lastUpdated: newData.last_updated,
            };
            const idx = prev.findIndex((p) => p.sessionId === mapped.sessionId);
            if (idx !== -1) {
              const upd = [...prev];
              upd[idx] = mapped;
              return upd;
            }
            return [mapped, ...prev];
          });
        },
      )
      .on("presence", { event: "sync" }, () => {
        const state = channel.presenceState();
        const onlineIds = new Set(Object.keys(state));
        setOnlineUsers(onlineIds);
      })
      .subscribe(async (status) => {
        if (status === "SUBSCRIBED") {
          // ONLY Track if on /patient page
          if (pathname === "/patient" && patientState.sessionId) {
            await channel.track({
              online_at: new Date().toISOString(),
              user_agent: window.navigator.userAgent,
            });
          }
        }
      });

    channelRef.current = channel;

    const fetchInitial = async () => {
      const { data } = await supabase
        .from("patients")
        .select("*")
        .order("last_updated", { ascending: false });
      if (data)
        setAllPatients(
          data.map((item) => ({
            sessionId: item.session_id,
            patientData: item.patient_data as PatientData,
            status: item.status as PatientStatus,
            lastUpdated: item.last_updated,
          })),
        );
    };
    fetchInitial();

    return () => {
      if (channelRef.current) {
        supabase.removeChannel(channelRef.current);
        channelRef.current = null;
      }
    };
  }, [patientState.sessionId, pathname]);

  const syncToSupabase = useCallback(async (state: PatientRealTimeState) => {
    if (!state.sessionId) return;
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    timeoutRef.current = setTimeout(async () => {
      try {
        await supabase.from("patients").upsert(
          {
            session_id: state.sessionId,
            patient_data: state.patientData,
            status: state.status,
            last_updated: new Date().toISOString(),
          },
          { onConflict: "session_id" },
        );
      } catch (err: any) {
        setError(`Sync error: ${err.message}`);
      }
    }, 300);
  }, []);

  const updatePatientData = useCallback(
    (data: Partial<PatientData>) => {
      setPatientState((prev) => {
        const newState = {
          ...prev,
          patientData: { ...prev.patientData, ...data },
          status: PATIENT_STATUS.FILLING,
          lastUpdated: new Date().toISOString(),
        };
        syncToSupabase(newState);
        return newState;
      });
    },
    [syncToSupabase],
  );

  const updateStatus = useCallback(
    (status: PatientStatus) => {
      setPatientState((prev) => {
        const newState = {
          ...prev,
          status,
          lastUpdated: new Date().toISOString(),
        };
        syncToSupabase(newState);
        return newState;
      });
    },
    [syncToSupabase],
  );

  const submitPatientData = useCallback(() => {
    setPatientState((prev) => {
      const newState = {
        ...prev,
        status: PATIENT_STATUS.SUBMITTED,
        lastUpdated: new Date().toISOString(),
      };
      syncToSupabase(newState);
      return newState;
    });
  }, [syncToSupabase]);

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
          Connecting...
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
