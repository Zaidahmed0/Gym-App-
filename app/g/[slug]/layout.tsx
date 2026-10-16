import { Suspense } from "react";
import PwaSetup from "./PwaSetup";

export default function GymLayout({ children }: { children: React.ReactNode }) {
  return (
    <Suspense fallback={<main className="min-h-screen bg-black" />}>
      <PwaSetup />
      {children}
    </Suspense>
  );
}