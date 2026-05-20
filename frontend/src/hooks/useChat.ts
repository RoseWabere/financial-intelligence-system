"use client";
import { useState, useEffect, useCallback } from "react";
import { chatApi } from "@/lib/api";
import type { ChatMessage } from "@/types";

const SESSION_KEY = "chat_session_id";

export function useChat() {
  const [messages, setMessages]   = useState<ChatMessage[]>([]);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [loading, setLoading]     = useState(false);
  const [isOnline, setIsOnline]   = useState(true);

  // Restore session on mount
  useEffect(() => {
    const saved = localStorage.getItem(SESSION_KEY);
    if (saved) setSessionId(saved);

    const handleOnline  = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);
    setIsOnline(navigator.onLine);
    window.addEventListener("online",  handleOnline);
    window.addEventListener("offline", handleOffline);
    return () => {
      window.removeEventListener("online",  handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, []);

  const send = useCallback(async (text: string) => {
    if (!text.trim() || loading) return;

    if (!isOnline) {
      setMessages((prev) => [...prev,
        { role: "user", content: text },
        { role: "assistant", content: "You appear to be offline. Please check your connection and try again.", isError: true },
      ]);
      return;
    }

    setMessages((prev) => [...prev, { role: "user", content: text }]);
    setLoading(true);

    try {
      const data = await chatApi.send(text, sessionId);
      if (!sessionId) {
        setSessionId(data.session_id);
        localStorage.setItem(SESSION_KEY, data.session_id);
      }
      setMessages((prev) => [...prev, {
        role:       "assistant",
        content:    data.answer,
        sources:    data.sources,
        confidence: data.confidence,
      }]);
    } catch (err: unknown) {
      const isRateLimit = (err as { isRateLimit?: boolean })?.isRateLimit;
      setMessages((prev) => [...prev, {
        role:    "assistant",
        content: isRateLimit
          ? "You're sending messages too quickly. Please wait a moment and try again."
          : "Something went wrong. Please try again in a moment.",
        isError: true,
      }]);
      if (isRateLimit) {
        // Re-throw so parent can show toast
        throw err;
      }
    } finally {
      setLoading(false);
    }
  }, [loading, sessionId, isOnline]);

  const clear = useCallback(() => {
    setMessages([]);
    setSessionId(null);
    localStorage.removeItem(SESSION_KEY);
  }, []);

  return { messages, send, loading, clear, isOnline };
}
