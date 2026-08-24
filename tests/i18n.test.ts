import assert from "node:assert/strict";
import { test } from "node:test";

const { DICT } = require("../lib/i18n.tsx");

function flatten(obj: Record<string, unknown>, prefix = ""): string[] {
  return Object.entries(obj).flatMap(([key, value]) => {
    const path = prefix ? `${prefix}.${key}` : key;
    if (value && typeof value === "object" && !Array.isArray(value)) return flatten(value as Record<string, unknown>, path);
    return [path];
  });
}

test("hindi dictionary covers every english key (full-site i18n parity)", () => {
  const enKeys = flatten(DICT.en).sort();
  const hiKeys = flatten(DICT.hi).sort();
  const missingInHi = enKeys.filter((k) => !hiKeys.includes(k));
  const missingInEn = hiKeys.filter((k) => !enKeys.includes(k));
  assert.deepEqual(missingInHi, [], `keys missing in Hindi: ${missingInHi.join(", ")}`);
  assert.deepEqual(missingInEn, [], `keys missing in English: ${missingInEn.join(", ")}`);
});

test("array-valued keys match in length across languages", () => {
  for (const key of ["chips", "honestItems", "diffItems"] as const) {
    assert.equal((DICT.hi[key] as unknown[]).length, (DICT.en[key] as unknown[]).length, `length mismatch on ${key}`);
  }
});

test("critical journey strings are non-empty in both languages", () => {
  const critical = ["heroTitle", "evalDesc", "consoleRunStep", "fixTitle", "trHead", "slaClock", "footBottom", "safetyBody"] as const;
  for (const key of critical) {
    assert.ok(String(DICT.en[key]).length > 3, `en ${key} empty`);
    assert.ok(String(DICT.hi[key]).length > 3, `hi ${key} empty`);
  }
});
