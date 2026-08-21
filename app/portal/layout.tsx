import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "portal · FIXER.OS",
  description: "Independent accountability-layer prototype — synthetic data only."
};
export default function PortalLayout({ children }: { children: React.ReactNode }) {
  return children;
}
