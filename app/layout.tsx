import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "FIXER.OS — the accountability layer",
  description:
    "An independent prototype that audits government portal decisions against a tamper-evident citizen case ledger. Hackathon build; synthetic data only."
};

export default function RootLayout({
  children
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body className="antialiased">{children}</body>
    </html>
  );
}
