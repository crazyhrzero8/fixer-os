import type { CaseRecord } from "@/lib/ledger";

export interface CaseStore {
  get(id: string): CaseRecord | null;
  list(): { id: string; title: string; status: CaseRecord["status"] }[];
  save(record: CaseRecord): void;
}

class MemoryStore implements CaseStore {
  private cases = new Map<string, CaseRecord>();
  get(id: string) { return this.cases.get(id) ?? null; }
  list() { return [...this.cases.values()].map(({ id, title, status }) => ({ id, title, status })); }
  save(record: CaseRecord) { this.cases.set(record.id, structuredClone(record)); }
}

const store: CaseStore = new MemoryStore();
export function caseStore(): CaseStore { return store; }
