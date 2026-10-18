import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const SITE = "https://getgainzo.vercel.app/";
const BRAND = "Get gainzo";
const DESCRIPTION =
  "Gym management software and a branded member app for Indian gyms. Members, dues, QR attendance with geofence, smart workout plans, streaks and push notifications. Free during early access.";

const geistSans = Geist({ variable: "--font-geist-sans", subsets: ["latin"] });
const geistMono = Geist_Mono({ variable: "--font-geist-mono", subsets: ["latin"] });

export const metadata: Metadata = {
  metadataBase: new URL(SITE),
  title: {
    default: `${BRAND} · Gym Management Software & Member App for Indian Gyms`,
    template: `%s · ${BRAND}`,
  },
  description: DESCRIPTION,
  keywords: [
    "gym management software", "gym app India", "gym member app", "gym attendance app", "QR attendance gym",
    "gym membership software", "fitness club software", "gym owner app", "gym CRM India", BRAND,
  ],
  applicationName: BRAND,
  alternates: { canonical: "/" },
  openGraph: {
    type: "website",
    url: SITE,
    siteName: BRAND,
    title: `${BRAND} · Your gym, your app`,
    description: DESCRIPTION,
    locale: "en_IN",
  },
  twitter: {
    card: "summary_large_image",
    title: `${BRAND} · Your gym, your app`,
    description: DESCRIPTION,
  },
  robots: { index: true, follow: true },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>{children}</body>
    </html>
  );
}