import type { Metadata } from "next";
import Link from "next/link";
import RegisterSW from "./RegisterSW";

const BRAND = "Gainzo";
const ACCENT = "#D4F75C";

export const metadata: Metadata = {
  title: `${BRAND} · Get the app`,
  description: "Your gym's workouts, streaks and check-in on your phone.",
  manifest: "/app.webmanifest",
};

export default function DownloadPage() {
  return (
    <main className="min-h-screen bg-black text-white px-6 py-12 flex flex-col">
      <RegisterSW />
      <div className="max-w-md w-full mx-auto">
        <Link href="/" className="inline-block text-xl font-black px-3 py-1 -rotate-2 text-black" style={{ background: ACCENT }}>{BRAND}</Link>

        <h1 className="mt-10 text-6xl font-black leading-[0.9]">GET THE<br /><span style={{ color: ACCENT }}>APP.</span></h1>
        <p className="mt-4 text-gray-400">Your workouts, streaks and gym check-in, right on your home screen.</p>

        <div className="mt-10 p-6 rounded-3xl bg-zinc-900">
          <p className="text-sm text-gray-400">Android</p>
          <a href="/downloads/gympulse.apk" download className="mt-3 block w-full py-4 text-center font-black text-black text-lg" style={{ background: ACCENT }}>
            DOWNLOAD APK
          </a>
          <ol className="mt-5 grid gap-2 text-sm text-gray-300 list-decimal list-inside">
            <li>Tap Download APK and open the file</li>
            <li>If asked, tap Settings and allow &ldquo;Install unknown apps&rdquo;</li>
            <li>Tap Install, open the app and log in</li>
          </ol>
        </div>

        <div className="mt-4 p-6 rounded-3xl bg-zinc-900">
          <p className="text-sm text-gray-400">iPhone</p>
          <ol className="mt-3 grid gap-2 text-sm text-gray-300 list-decimal list-inside">
            <li>Open your gym link in Safari</li>
            <li>Tap the Share button at the bottom</li>
            <li>Tap &ldquo;Add to Home Screen&rdquo;, then Add</li>
          </ol>
        </div>

        <Link href="/login" className="mt-6 block text-center text-sm text-gray-400 underline underline-offset-4">
          Or just log in from your browser →
        </Link>
      </div>
    </main>
  );
}