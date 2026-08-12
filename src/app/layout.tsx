import type { Metadata } from "next";

import { ibmPlexSans } from "@/lib/fonts";

import "./globals.css";

export const metadata: Metadata = {
  title: {
    default: "PrismSek Admin",
    template: "%s · PrismSek Admin",
  },
  description: "Manage DLP policies and review analytics across your organization.",
  robots: { index: false, follow: false },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={ibmPlexSans.variable}>
      <body>{children}</body>
    </html>
  );
}
