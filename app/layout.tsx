import type { Metadata } from "next";
import "./globals.css";
import { LangProvider } from "@/lib/i18n";

export const metadata: Metadata = {
  title: "FIXER.OS — Public Service Accountability Layer",
  description:
    "An independent prototype that audits government portal decisions against a tamper-evident citizen case ledger. Hackathon build; synthetic data only.",
  openGraph: {
    title: "FIXER.OS — nobody audits the state back",
    description: "False-rejection audits · file traceroute · rule-deadlock proofs · RBI TAT rupee clock. Synthetic-data hackathon prototype.",
    type: "website"
  },
  twitter: { card: "summary_large_image", title: "FIXER.OS", description: "The accountability layer for public-service portals." }
};

export default function RootLayout({
  children
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="antialiased"><LangProvider>{children}</LangProvider></body>
    </html>
  );
}
