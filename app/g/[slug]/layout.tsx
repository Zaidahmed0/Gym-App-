import { Suspense } from "react";
import PwaSetup from "./PwaSetup";
import CheckInFab from "./CheckInFab";

export default function GymLayout({ children }: { children: React.ReactNode }) {
  return (
    <Suspense fallback={<main className="min-h-screen bg-black" />}>
      <PwaSetup />
      {children}
      <CheckInFab />
    </Suspense>
  );
}