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
import { usePathname, useRouter } from "next/navigation";
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
import { mapRecordToState } from "@/lib/utils";

const PatientContext = createContext<PatientContextType | undefined>(undefined);

const PatientProviderInternal: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const pathname = usePathname();
  const router = useRouter();

  const [error, setError] = useState<string | null>(null);
  const [connectionStatus, setConnectionStatus] =
    useState<string>("CONNECTING");

  const [patientState, setPatientState] = useState<PatientRealTimeState>({
    sessionId: "",
    patientData: DEFAULT_PATIENT_DATA,
    status: PATIENT_STATUS.INACTIVE,
    lastUpdated: new Date().toISOString(),
  });

  const sessionIdRef = useRef<string>("");
  useEffect(() => {
    sessionIdRef.current = patientState.sessionId;
  }, [patientState.sessionId]);

  const [dbPatients, setDbPatients] = useState<PatientRealTimeState[]>([]);
  const [onlineUsers, setOnlineUsers] = useState<Set<string>>(new Set());
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  const getOwnedIds = useCallback((): string[] => {
    if (typeof window === "undefined") return [];
    return JSON.parse(localStorage.getItem("agnos_owned_sessions") || "[]");
  }, []);

  const addOwnedId = useCallback(
    (id: string) => {
      const owned = getOwnedIds();
      if (!owned.includes(id)) {
        localStorage.setItem(
          "agnos_owned_sessions",
          JSON.stringify([...owned, id]),
        );
      }
    },
    [getOwnedIds],
  );

  const syncSession = useCallback(
    async (sid: string) => {
      const ownedIds = getOwnedIds();

      if (!ownedIds.includes(sid)) {
        const newSid = `p_${Math.random().toString(36).substr(2, 6)}_${Date.now().toString().slice(-4)}`;
        addOwnedId(newSid);
        sessionStorage.setItem("current_sid", newSid);
        router.replace(`/patient?id=${newSid}`);
        return;
      }

      if (sid === sessionIdRef.current) return;

      setPatientState((prev) => ({
        ...prev,
        sessionId: sid,
        patientData: DEFAULT_PATIENT_DATA,
        status: PATIENT_STATUS.INACTIVE,
      }));

      const { data, error: fetchErr } = await supabase
        .from(SUPABASE_CONFIG.TABLE_NAME)
        .select("*")
        .eq("session_id", sid)
        .maybeSingle();

      if (fetchErr) {
        console.error("syncSession fetch error:", fetchErr);
        return;
      }

      if (data) {
        setPatientState(mapRecordToState(data as SupabasePatientRow));
      }
    },
    [getOwnedIds, addOwnedId, router],
  );

  useEffect(() => {
    const sid = patientState.sessionId || "monitor";

    const fetchDashboard = async () => {
      const { data } = await supabase
        .from(SUPABASE_CONFIG.TABLE_NAME)
        .select("*")
        .order("last_updated", { ascending: false });
      if (data)
        setDbPatients((data as SupabasePatientRow[]).map(mapRecordToState));
    };
    fetchDashboard();

    const channel = supabase.channel(SUPABASE_CONFIG.CHANNEL_NAME, {
      config: { presence: { key: sid } },
    });

    channel
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: SUPABASE_CONFIG.TABLE_NAME },
        (payload) => {
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
        await supabase.from(SUPABASE_CONFIG.TABLE_NAME).upsert(
          {
            session_id: state.sessionId,
            patient_data: state.patientData,
            status: state.status,
            last_updated: new Date().toISOString(),
          },
          { onConflict: "session_id" },
        );
        setError(null);
      } catch (err: unknown) {
        const message = err instanceof Error ? err.message : "Unknown error";
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
      router.push("/patient");
    }
  }, [router]);

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
        syncSession,
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
          Syncing...
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
