import type { Metadata } from "next";
import RegisterSW from "./RegisterSW";

export const metadata: Metadata = {
  title: "Gainzo · Find your gym",
  description: "Open your gym's app on Gainzo: workouts, check-ins, streaks and updates.",
  manifest: "/app.webmanifest",
};

export default function StartLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <RegisterSW />
      {children}
    </>
  );
}
