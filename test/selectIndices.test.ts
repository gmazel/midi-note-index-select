// Run with: node --experimental-strip-types test/selectIndices.test.ts
// Requires Node >= 22. No test framework needed.

import { selectIndices, validateFilter } from "../src/applyFilter.ts";

let passed = 0;
let failed = 0;

function assert(condition: boolean, label: string) {
  if (condition) {
    console.log(`  ✓  ${label}`);
    passed++;
  } else {
    console.error(`  ✗  ${label}`);
    failed++;
  }
}

function eqSet(a: Set<number>, b: number[]): boolean {
  if (a.size !== b.length) return false;
  return b.every(v => a.has(v));
}

// ── selectIndices ─────────────────────────────────────────────────────────────

console.log("\nOdd / Even");
assert(eqSet(selectIndices(6, { kind: "odd"  }), [1,3,5]),   "odd of 6");
assert(eqSet(selectIndices(6, { kind: "even" }), [2,4,6]),   "even of 6");
assert(eqSet(selectIndices(1, { kind: "odd"  }), [1]),        "odd of 1");
assert(eqSet(selectIndices(1, { kind: "even" }), []),         "even of 1");

console.log("\nEvery N");
assert(eqSet(selectIndices(16, { kind: "every", n: 2, offset: 1 }), [1,3,5,7,9,11,13,15]),  "every 2nd offset 1");
assert(eqSet(selectIndices(16, { kind: "every", n: 2, offset: 2 }), [2,4,6,8,10,12,14,16]), "every 2nd offset 2");
assert(eqSet(selectIndices(9,  { kind: "every", n: 3, offset: 1 }), [1,4,7]),                "every 3rd offset 1");
assert(eqSet(selectIndices(9,  { kind: "every", n: 3, offset: 2 }), [2,5,8]),                "every 3rd offset 2");
assert(eqSet(selectIndices(9,  { kind: "every", n: 3, offset: 3 }), [3,6,9]),                "every 3rd offset 3");
assert(eqSet(selectIndices(4,  { kind: "every", n: 1           }), [1,2,3,4]),               "every 1st = all");
assert(eqSet(selectIndices(3,  { kind: "every", n: 10          }), [1]),                     "n > total");

console.log("\nModulo");
assert(eqSet(selectIndices(9,  { kind: "modulo", mod: 3, remainder: 0 }), [3,6,9]), "mod 3 rem 0");
assert(eqSet(selectIndices(9,  { kind: "modulo", mod: 3, remainder: 1 }), [1,4,7]), "mod 3 rem 1");

console.log("\nEdge cases");
assert(eqSet(selectIndices(0,  { kind: "odd"  }), []),  "zero notes odd");
assert(eqSet(selectIndices(0,  { kind: "every", n: 2 }), []), "zero notes every");

// ── validateFilter ────────────────────────────────────────────────────────────

console.log("\nvalidateFilter");
assert(validateFilter({ kind: "every", n: 2, offset: 1  }) === null, "valid every");
assert(validateFilter({ kind: "every", n: 2, offset: 3  }) !== null, "offset > n → error");
assert(validateFilter({ kind: "every", n: 0             }) !== null, "n=0 → error");
assert(validateFilter({ kind: "modulo", mod: 3, remainder: 0 }) === null,  "valid modulo");
assert(validateFilter({ kind: "modulo", mod: 3, remainder: 3 }) !== null,  "remainder >= mod → error");
assert(validateFilter({ kind: "odd"  }) === null, "odd always valid");
assert(validateFilter({ kind: "even" }) === null, "even always valid");

// ── Summary ───────────────────────────────────────────────────────────────────

console.log(`\n${passed + failed} tests: ${passed} passed, ${failed} failed.\n`);
if (failed > 0) process.exit(1);
