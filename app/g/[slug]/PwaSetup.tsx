"use client";

import { useEffect, useState } from "react";
import { useParams, usePathname } from "next/navigation";
import { createClient } from "@/utils/supabase/client";
import { savePushSubscription } from "./actions";

type InstallEvent = Event & { prompt: () => Promise<void>; userChoice: Promise<{ outcome: string }> };

function urlBase64ToUint8Array(base64: string) {
  const padding = "=".repeat((4 - (base64.length % 4)) % 4);
  const raw = atob((base64 + padding).replace(/-/g, "+").replace(/_/g, "/"));
  return Uint8Array.from([...raw].map((c) => c.charCodeAt(0)));
}

async function subscribeAndSave() {
  const reg = await navigator.serviceWorker.ready;
  let sub = await reg.pushManager.getSubscription();
  if (!sub) {
    sub = await reg.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: urlBase64ToUint8Array(process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY!),
    });
  }
  return savePushSubscription(sub.toJSON());
}

export default function PwaSetup() {
  const { slug } = useParams<{ slug: string }>();
  const pathname = usePathname();
  const [deferred, setDeferred] = useState<InstallEvent | null>(null);
  const [showInstall, setShowInstall] = useState(false);
  const [showPush, setShowPush] = useState(false);
  const [ios, setIos] = useState(false);
  const [themeColor, setThemeColor] = useState("#0B0B0B");
  const [pushMsg, setPushMsg] = useState("");

  useEffect(() => {
    fetch(`/g/${slug}/manifest.webmanifest`)
      .then((r) => r.json())
      .then((m) => {
        if (m?.name) document.title = m.name;
        if (m?.theme_color) setThemeColor(m.theme_color);
      })
      .catch(() => {});

    if ("serviceWorker" in navigator) {
      navigator.serviceWorker.register("/sw.js").catch(() => {});
    }

    const nav = navigator as Navigator & { standalone?: boolean };
    const standalone = window.matchMedia("(display-mode: standalone)").matches || !!nav.standalone;
    const isIos = /iphone|ipad|ipod/i.test(navigator.userAgent);
    setIos(isIos);

    if (standalone || localStorage.getItem("install-dismissed")) return;

    if (isIos) {
      const timer = setTimeout(() => setShowInstall(true), 2500);
      return () => clearTimeout(timer);
    }

    const handler = (e: Event) => {
      e.preventDefault();
      setDeferred(e as InstallEvent);
      setShowInstall(true);
    };
    window.addEventListener("beforeinstallprompt", handler);
    return () => window.removeEventListener("beforeinstallprompt", handler);
  }, [slug]);

  useEffect(() => {
    async function checkPush() {
      if (!pathname?.includes("/home")) return;
      if (!("Notification" in window) || !("PushManager" in window) || !("serviceWorker" in navigator)) return;

      const nav = navigator as Navigator & { standalone?: boolean };
      const standalone = window.matchMedia("(display-mode: standalone)").matches || !!nav.standalone;
      const isIos = /iphone|ipad|ipod/i.test(navigator.userAgent);
      if (isIos && !standalone) return;

      const { data: { user } } = await createClient().auth.getUser();
      if (!user) return;

      if (Notification.permission === "granted") {
        subscribeAndSave().catch(() => {});
        return;
      }
      if (Notification.permission === "default" && !localStorage.getItem("push-dismissed")) {
        setTimeout(() => setShowPush(true), 1500);
      }
    }
    checkPush();
  }, [pathname]);

  async function install() {
    if (!deferred) return;
    await deferred.prompt();
    await deferred.userChoice;
    setShowInstall(false);
  }

  async function enablePush() {
    setPushMsg("");
    const permission = await Notification.requestPermission();
    if (permission !== "granted") {
      setPushMsg("Notifications are blocked. You can allow them later in your phone settings.");
      setTimeout(() => setShowPush(false), 3000);
      return;
    }
    const result = await subscribeAndSave().catch(() => ({ error: "Could not turn on notifications" }));
    if (result && "error" in result && result.error) {
      setPushMsg(result.error);
      return;
    }
    setPushMsg("You're all set! 🎉");
    setTimeout(() => setShowPush(false), 1500);
  }

  return (
    <>
      <link rel="manifest" href={`/g/${slug}/manifest.webmanifest`} />
      <link rel="apple-touch-icon" href={`/g/${slug}/icon?size=180`} />
      <meta name="theme-color" content={themeColor} />
      <meta name="apple-mobile-web-app-capable" content="yes" />
      <meta name="mobile-web-app-capable" content="yes" />
      <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />

      {showPush && (
        <div className="fixed left-3 right-3 top-3 z-[75] max-w-md mx-auto p-4 rounded-2xl bg-white text-black shadow-2xl">
          <div className="flex items-center gap-3">
            <img src={`/g/${slug}/icon?size=96`} alt="" className="w-12 h-12 rounded-xl" />
            <div className="flex-1">
              <p className="text-sm font-bold">Turn on notifications</p>
              <p className="text-xs text-gray-600">Get workout reminders, gym updates and plan alerts.</p>
            </div>
          </div>
          {pushMsg ? (
            <p className="mt-3 text-sm text-center">{pushMsg}</p>
          ) : (
            <div className="mt-3 grid grid-cols-2 gap-2">
              <button onClick={() => { localStorage.setItem("push-dismissed", "1"); setShowPush(false); }}
                className="py-2 rounded-full border border-gray-300 text-sm">Not now</button>
              <button onClick={enablePush} className="py-2 rounded-full bg-black text-white text-sm font-bold">Turn on</button>
            </div>
          )}
        </div>
      )}

      {showInstall && !showPush && (
        <div className="fixed left-3 right-3 bottom-24 z-[70] max-w-md mx-auto p-3 rounded-2xl bg-white text-black shadow-2xl flex items-center gap-3">
          <img src={`/g/${slug}/icon?size=96`} alt="" className="w-12 h-12 rounded-xl" />
          <div className="flex-1">
            <p className="text-sm font-bold">Install the app</p>
            <p className="text-xs text-gray-600">
              {ios ? "Tap the Share button, then 'Add to Home Screen'" : "Add it to your home screen. Works like a real app."}
            </p>
          </div>
          {!ios && (
            <button onClick={install} className="px-4 py-2 rounded-full bg-black text-white text-sm font-bold">Install</button>
          )}
          <button onClick={() => { localStorage.setItem("install-dismissed", "1"); setShowInstall(false); }}
            className="text-gray-500 text-lg px-1" aria-label="Dismiss">✕</button>
        </div>
      )}
    </>
  );
}