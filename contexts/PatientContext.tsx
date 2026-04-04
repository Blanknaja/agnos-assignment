"use client";

import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  useRef,
  Suspense,
  useMemo,
} from "react";
import { usePathname } from "next/navigation";
import {
  PatientData,
  PatientRealTimeState,
  PatientStatus,
  PatientContextType,
  SupabasePatientRow,
} from "@/interface/patient";
import { supabase } from "@/lib/supabase";
import { DEFAULT_PATIENT_DATA, PATIENT_STATUS } from "@/const/patient";
import { SUPABASE_CONFIG } from "@/const/supabase";
import { RealtimePostgresChangesPayload } from "@supabase/supabase-js";
import { mapRecordToState } from "@/lib/utils";

const PatientContext = createContext<PatientContextType | undefined>(undefined);

const PatientProviderInternal: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const pathname = usePathname();
  const [error, setError] = useState<string | null>(null);
  const [connectionStatus, setConnectionStatus] =
    useState<string>("CONNECTING");

  const [patientState, setPatientState] = useState<PatientRealTimeState>({
    sessionId: "",
    patientData: DEFAULT_PATIENT_DATA,
    status: PATIENT_STATUS.INACTIVE,
    lastUpdated: new Date().toISOString(),
  });

  const [dbPatients, setDbPatients] = useState<PatientRealTimeState[]>([]);
  const [onlineUsers, setOnlineUsers] = useState<Set<string>>(new Set());
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  const initializeSession = useCallback(async () => {
    if (typeof window === "undefined") return;
    const urlParams = new URLSearchParams(window.location.search);
    let sid = urlParams.get("id");

    if (!sid && pathname === "/patient") {
      sid = `p_${Math.random().toString(36).substr(2, 6)}_${Date.now().toString().slice(-4)}`;
      sessionStorage.setItem("current_sid", sid);
      window.history.replaceState(
        null,
        "",
        `${window.location.pathname}?id=${sid}`,
      );
    }

    if (sid) {
      setPatientState((prev) => ({ ...prev, sessionId: sid as string }));
      supabase
        .from(SUPABASE_CONFIG.TABLE_NAME)
        .select("*")
        .eq("session_id", sid)
        .maybeSingle()
        .then(({ data }) => {
          if (data) {
            setPatientState(mapRecordToState(data as SupabasePatientRow));
          }
        });
    }
  }, [pathname]);

  useEffect(() => {
    initializeSession();
  }, [initializeSession]);

  useEffect(() => {
    const sid = patientState.sessionId || "monitor";

    // Initial load for dashboard
    const fetchInitialData = async () => {
      const { data, error: fetchErr } = await supabase
        .from(SUPABASE_CONFIG.TABLE_NAME)
        .select("*")
        .order("last_updated", { ascending: false });

      if (fetchErr) console.error("Fetch Error:", fetchErr);
      if (data) {
        setDbPatients((data as SupabasePatientRow[]).map(mapRecordToState));
      }
    };
    fetchInitialData();

    const channel = supabase.channel(SUPABASE_CONFIG.CHANNEL_NAME, {
      config: { presence: { key: sid } },
    });

    channel
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: SUPABASE_CONFIG.TABLE_NAME },
        (payload: RealtimePostgresChangesPayload<SupabasePatientRow>) => {
          if (payload.eventType === "DELETE") {
            const deletedId = (payload.old as Partial<SupabasePatientRow>)
              .session_id;
            setDbPatients((prev) =>
              prev.filter((p) => p.sessionId !== deletedId),
            );
            return;
          }

          const newData = payload.new as SupabasePatientRow;
          if (!newData?.session_id) return;

          const mapped = mapRecordToState(newData);
          setDbPatients((prev) => {
            const exists = prev.some((p) => p.sessionId === mapped.sessionId);
            return exists
              ? prev.map((p) => (p.sessionId === mapped.sessionId ? mapped : p))
              : [mapped, ...prev];
          });
        },
      )
      .on("presence", { event: "sync" }, () => {
        setOnlineUsers(new Set(Object.keys(channel.presenceState())));
      });

    channel.subscribe(async (status) => {
      setConnectionStatus(status);

      if (
        status === "SUBSCRIBED" &&
        pathname === "/patient" &&
        patientState.sessionId
      ) {
        await channel.track({ online_at: new Date().toISOString() });
      }
    });

    return () => {
      supabase.removeChannel(channel);
    };
  }, [patientState.sessionId, pathname]);

  const syncToSupabase = useCallback(async (state: PatientRealTimeState) => {
    if (!state.sessionId) return;

    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    timeoutRef.current = setTimeout(async () => {
      try {
        const { error: syncErr } = await supabase
          .from(SUPABASE_CONFIG.TABLE_NAME)
          .upsert(
            {
              session_id: state.sessionId,
              patient_data: state.patientData,
              status: state.status,
              last_updated: new Date().toISOString(),
            },
            { onConflict: "session_id" },
          );
        if (syncErr) throw syncErr;
        setError(null);
      } catch (err: unknown) {
        const message = err instanceof Error ? err.message : String(err);
        setError(`Sync error: ${message}`);
      }
    }, 200);
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
      if (typeof window !== "undefined")
        sessionStorage.removeItem("current_sid");
      return newState;
    });
  }, [syncToSupabase]);

  const startNewSession = useCallback(() => {
    if (typeof window !== "undefined") {
      sessionStorage.removeItem("current_sid");
      window.location.href = "/patient";
    }
  }, []);

  const finalPatients = useMemo(() => {
    return dbPatients.map((p) => ({
      ...p,
      isOnline: onlineUsers.has(p.sessionId),
    }));
  }, [dbPatients, onlineUsers]);

  return (
    <PatientContext.Provider
      value={{
        patientState,
        allPatients: finalPatients,
        updatePatientData,
        updateStatus,
        submitPatientData,
        startNewSession,
        error,
        connectionStatus,
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
