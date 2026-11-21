import type { Metadata } from "next";
import "./globals.css";
export const metadata: Metadata = {
  title: "AETHER — Reality is yours to rewrite",
  description:
    "A local-first creative studio for interactive portals, real-time worlds and gesture magic.",
  other: { "page-type": "software", "site-kind": "software" },
};
export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" data-type="software">
      <body>{children}</body>
    </html>
  );
}
