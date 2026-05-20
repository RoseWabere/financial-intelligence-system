"use client";
import { useState, useEffect } from "react";
import { directoryApi } from "@/lib/api";
import type { Investment, Provider } from "@/types";

function tryCache<T>(key: string): T | null {
  try { return JSON.parse(localStorage.getItem(key) ?? "null"); } catch { return null; }
}
function setCache(key: string, val: unknown) {
  try { localStorage.setItem(key, JSON.stringify(val)); } catch {}
}

export function useInvestments(params: Record<string, unknown> = {}) {
  const cacheKey = `inv_${JSON.stringify(params)}`;
  const [data,    setData]    = useState<Investment[]>(tryCache<Investment[]>(cacheKey) ?? []);
  const [loading, setLoading] = useState(!data.length);
  const [error,   setError]   = useState<string | null>(null);

  useEffect(() => {
    setLoading(true);
    setError(null);
    directoryApi.investments(params)
      .then((res) => { setData(res); setCache(cacheKey, res); })
      .catch(() => setError("Could not load investments. Showing cached data."))
      .finally(() => setLoading(false));
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [cacheKey]);

  return { data, loading, error };
}

export function useProviders(params: Record<string, unknown> = {}) {
  const cacheKey = `prov_${JSON.stringify(params)}`;
  const [data,    setData]    = useState<Provider[]>(tryCache<Provider[]>(cacheKey) ?? []);
  const [loading, setLoading] = useState(!data.length);
  const [error,   setError]   = useState<string | null>(null);

  useEffect(() => {
    setLoading(true);
    setError(null);
    directoryApi.providers(params)
      .then((res) => { setData(res); setCache(cacheKey, res); })
      .catch(() => setError("Could not load providers. Showing cached data."))
      .finally(() => setLoading(false));
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [cacheKey]);

  return { data, loading, error };
}
