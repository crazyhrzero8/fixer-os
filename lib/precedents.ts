import { readFileSync } from "fs";
import path from "path";

export interface Precedent {
  id: string;
  tags: string[];
  citation: string;
  legalText: string;
}

export function getPrecedents(): Precedent[] {
  try {
    const filepath = path.join(process.cwd(), "playbooks", "precedents.json");
    return JSON.parse(readFileSync(filepath, "utf-8"));
  } catch {
    return [];
  }
}

export function getPrecedentForCase(caseKind: string, facts?: any): string {
  const precedents = getPrecedents();
  
  // Find match based on tags
  const matched = precedents.find((p) => p.tags.includes(caseKind));
  if (matched) return matched.legalText;
  
  // Fallbacks by keywords
  if (caseKind.includes("tat") || caseKind.includes("irctc") || caseKind.includes("payment")) {
    return precedents.find((p) => p.id === "rbi-tat-2019")?.legalText || "";
  }
  return precedents.find((p) => p.id === "kangra-2026")?.legalText || "";
}
