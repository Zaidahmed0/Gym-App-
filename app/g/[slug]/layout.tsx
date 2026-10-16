import { Suspense } from "react";

export default function GymLayout({ children }: { children: React.ReactNode }) {
  return <Suspense fallback={<main className="min-h-screen bg-black" />}>{children}</Suspense>;
}