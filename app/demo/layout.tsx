import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "demo · FIXER.OS",
  description: "Independent accountability-layer prototype — synthetic data only."
};
export default function DemoLayout({ children }: { children: React.ReactNode }) {
  return children;
}
