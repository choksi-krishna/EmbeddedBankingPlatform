import type { ReactNode } from "react";
import type { Metadata } from "next";

import "@/app/globals.css";

export const metadata: Metadata = {
  title: "EmbeddyFi | Embedded Banking Platform",
  description:
    "A full-stack embedded banking platform for accounts, transfers, cards, and compliance operations.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="text-ink antialiased">
        <div className="relative min-h-screen overflow-x-hidden">
          <div className="pointer-events-none fixed inset-x-0 top-0 z-0 h-[24rem] bg-[radial-gradient(circle_at_top,rgba(15,118,110,0.12),transparent_54%),radial-gradient(circle_at_right,rgba(180,83,9,0.12),transparent_36%)]" />
          {children}
        </div>
      </body>
    </html>
  );
}
