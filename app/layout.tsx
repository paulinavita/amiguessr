import type { Metadata } from "next";

import "./globals.css";

import { Toaster } from "@/components/ui/sonner";

export const metadata: Metadata = {
  title: "F2F 2025 TeamGuessr",
  description: "Upload photos, set locations and years, then play guessing rounds.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-slate-50 text-slate-900">
        {children}
        <Toaster />
      </body>
    </html>
  );
}
