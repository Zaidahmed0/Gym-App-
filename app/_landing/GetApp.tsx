"use client";

import { Download } from "lucide-react";

const APK = "/downloads/gympulse.apk";

function handleClick(e: React.MouseEvent<HTMLAnchorElement>) {
  const isAndroid = /android/i.test(navigator.userAgent);
  if (!isAndroid) {
    e.preventDefault();
    window.location.href = "/download";
  }
}

export function GetAppLink({ className = "", children }: { className?: string; children: React.ReactNode }) {
  return (
    <a href={APK} download onClick={handleClick} className={className}>
      {children}
    </a>
  );
}

export function FloatingGetApp() {
  return (
    <a href={APK} download onClick={handleClick}
      className="md:hidden fixed bottom-4 inset-x-4 z-[60] py-4 flex items-center justify-center gap-2 font-black text-black shadow-2xl"
      style={{ background: "#D4F75C" }}>
      <Download size={18} /> GET THE APP
    </a>
  );
}