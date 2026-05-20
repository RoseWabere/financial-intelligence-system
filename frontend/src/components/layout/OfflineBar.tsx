"use client";
import { useEffect, useState } from "react";

export default function OfflineBar() {
  const [offline, setOffline] = useState(false);

  useEffect(() => {
    setOffline(!navigator.onLine);
    window.addEventListener("online",  () => setOffline(false));
    window.addEventListener("offline", () => setOffline(true));
  }, []);

  if (!offline) return null;
  return (
    <div className="offline-bar">
      <i className="fas fa-wifi-slash mr-2" />
      No internet connection — showing cached data where available
    </div>
  );
}
