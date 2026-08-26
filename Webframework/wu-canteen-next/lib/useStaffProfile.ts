"use client";
import { useCallback, useEffect, useState } from "react";
type StaffProfile = {
  full_name: string;
  username: string;
  role: "admin" | "staff";
} | null;
export function useStaffProfile() {
  const [profile, setProfile] = useState<StaffProfile>(null);
  const [loading, setLoading] = useState(true);
  const refetch = useCallback(async () => {
    try {
      const res = await fetch("/api/auth/check", { cache: "no-store" });
      if (!res.ok) {
        setProfile(null);
        return;
      }
      const data = await res.json();
      setProfile(data.staff ?? null);
    } catch (error) {
      console.error("Failed to load staff profile:", error);
      setProfile(null);
    }
  }, []);
  useEffect(() => {
    let cancelled = false;
    (async () => {
      await refetch();
      if (!cancelled) setLoading(false);
    })();
    return () => {
      cancelled = true;
    };
  }, [refetch]);
  function clearProfile() {
    setProfile(null);
  }
  return {
    profile,
    loading,
    isAdmin: profile?.role === "admin",
    isStaff: profile !== null,
    clearProfile,
    refetch,
  };
}


