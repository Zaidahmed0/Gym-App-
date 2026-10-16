"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";

type InstallEvent = Event & { prompt: () => Promise<void>; userChoice: Promise<{ outcome: string }> };

export default function PwaSetup() {
  const { slug } = useParams<{ slug: string }>();
  const [deferred, setDeferred] = useState<InstallEvent | null>(null);
  const [show, setShow] = useState(false);
  const [ios, setIos] = useState(false);
  const [themeColor, setThemeColor] = useState("#0B0B0B");

  useEffect(() => {
    fetch(`/g/${slug}/manifest.webmanifest`)
      .then((r) => r.json())
      .then((m) => {
        if (m?.name) document.title = m.name;
        if (m?.theme_color) setThemeColor(m.theme_color);
      })
      .catch(() => {});

    const nav = navigator as Navigator & { standalone?: boolean };
    const standalone = window.matchMedia("(display-mode: standalone)").matches || nav.standalone;
    if (standalone || localStorage.getItem("install-dismissed")) return;

    const isIos = /iphone|ipad|ipod/i.test(navigator.userAgent);
    setIos(isIos);
    if (isIos) {
      const timer = setTimeout(() => setShow(true), 2500);
      return () => clearTimeout(timer);
    }

    const handler = (e: Event) => {
      e.preventDefault();
      setDeferred(e as InstallEvent);
      setShow(true);
    };
    window.addEventListener("beforeinstallprompt", handler);
    return () => window.removeEventListener("beforeinstallprompt", handler);
  }, [slug]);

  async function install() {
    if (!deferred) return;
    await deferred.prompt();
    await deferred.userChoice;
    setShow(false);
  }

  function dismiss() {
    localStorage.setItem("install-dismissed", "1");
    setShow(false);
  }

  return (
    <>
      <link rel="manifest" href={`/g/${slug}/manifest.webmanifest`} />
      <link rel="apple-touch-icon" href={`/g/${slug}/icon?size=180`} />
      <meta name="theme-color" content={themeColor} />
      <meta name="apple-mobile-web-app-capable" content="yes" />
      <meta name="mobile-web-app-capable" content="yes" />
      <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />

      {show && (
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
          <button onClick={dismiss} className="text-gray-500 text-lg px-1" aria-label="Dismiss">✕</button>
        </div>
      )}
    </>
  );
}