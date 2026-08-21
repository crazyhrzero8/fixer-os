import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "fixer · FIXER.OS",
  description: "Independent accountability-layer prototype — synthetic data only."
};
export default function FixerLayout({ children }: { children: React.ReactNode }) {
  return children;
}
