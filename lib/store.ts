import type { CaseRecord } from "@/lib/ledger";
import { getMongoDb } from "./mongodb";

export interface CaseStore {
  get(id: string): Promise<CaseRecord | null>;
  list(): Promise<{ id: string; title: string; status: CaseRecord["status"] }[]>;
  save(record: CaseRecord): Promise<void>;
}

let seedCallback: (() => CaseRecord[]) | null = null;
export function registerSeeds(cb: () => CaseRecord[]) {
  seedCallback = cb;
}
export function getSeeds(): CaseRecord[] {
  return seedCallback ? seedCallback() : [];
}

class MemoryStore implements CaseStore {
  private cases = new Map<string, CaseRecord>();
  private seeded = false;

  private ensureSeeded() {
    if (this.seeded) return;
    const seeds = getSeeds();
    if (seeds.length === 0) return;
    for (const seed of seeds) {
      this.cases.set(seed.id, structuredClone(seed));
    }
    this.seeded = true;
  }

  async get(id: string) {
    this.ensureSeeded();
    return this.cases.get(id) ?? null;
  }

  async list() {
    this.ensureSeeded();
    return [...this.cases.values()].map(({ id, title, status }) => ({ id, title, status }));
  }

  async save(record: CaseRecord) {
    this.ensureSeeded();
    this.cases.set(record.id, structuredClone(record));
  }
}

class MongoStore implements CaseStore {
  private seeded = false;

  private async getDb() {
    return await getMongoDb();
  }

  private async ensureSeeded() {
    if (this.seeded) return;
    const db = await this.getDb();
    if (!db) return;
    const collection = db.collection("cases");
    const count = await collection.countDocuments();
    if (count === 0) {
      const seeds = getSeeds();
      if (seeds.length === 0) return; // Seeds not registered yet, try again later
      await collection.insertMany(seeds.map(s => ({ ...s, _id: s.id as any })));
    }
    this.seeded = true;
  }

  async get(id: string): Promise<CaseRecord | null> {
    await this.ensureSeeded();
    const db = await this.getDb();
    if (!db) return null;
    const doc = await db.collection("cases").findOne({ id });
    if (!doc) return null;
    const { _id, ...rest } = doc;
    return rest as unknown as CaseRecord;
  }

  async list(): Promise<{ id: string; title: string; status: CaseRecord["status"] }[]> {
    await this.ensureSeeded();
    const db = await this.getDb();
    if (!db) return [];
    const docs = await db.collection("cases").find({}, { projection: { id: 1, title: 1, status: 1 } }).toArray();
    return docs.map(doc => ({ id: doc.id, title: doc.title, status: doc.status }));
  }

  async save(record: CaseRecord): Promise<void> {
    await this.ensureSeeded();
    const db = await this.getDb();
    if (!db) return;
    await db.collection("cases").updateOne(
      { id: record.id },
      { $set: record },
      { upsert: true }
    );
  }
}

const mongoStore = new MongoStore();
const memoryStore = new MemoryStore();

export function caseStore(): CaseStore {
  return process.env.MONGODB_URI ? mongoStore : memoryStore;
}
