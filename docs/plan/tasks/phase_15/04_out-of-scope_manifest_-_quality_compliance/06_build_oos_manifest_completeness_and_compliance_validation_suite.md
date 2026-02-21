# Task: Build OOS Manifest Completeness & Compliance Validation Suite (Sub-Epic: 04_Out-of-Scope Manifest - Quality & Compliance)

## Covered Requirements
- [1_PRD-REQ-OOS-008], [1_PRD-REQ-OOS-012], [1_PRD-REQ-OOS-013], [1_PRD-REQ-OOS-014], [1_PRD-REQ-OOS-018]

## 1. Initial Test Written
- [ ] Create a test file at `src/oos/__tests__/oos-manifest-completeness.test.ts`.
- [ ] Write a test that imports the full `OOS_MANIFEST` array and asserts that ALL of the following IDs are present: `"1_PRD-REQ-OOS-008"`, `"1_PRD-REQ-OOS-012"`, `"1_PRD-REQ-OOS-013"`, `"1_PRD-REQ-OOS-014"`, `"1_PRD-REQ-OOS-018"`.
- [ ] Write a schema validation test that iterates every entry in `OOS_MANIFEST` and asserts each entry conforms to the `OosEntry` TypeScript interface (all required fields present, all string fields non-empty, `futureConsideration` is boolean or non-empty string).
- [ ] Write a test asserting that `OOS_MANIFEST` has no duplicate `id` values.
- [ ] Write a test asserting that the `OOS_MANIFEST` is exported from the barrel file `src/oos/index.ts`.
- [ ] Create a test file at `src/oos/__tests__/oos-runtime-guard.test.ts`.
- [ ] Write an integration test that calls a utility function `assertNotOos(featureId: string)` (to be implemented) and verifies:
  - When called with `"1_PRD-REQ-OOS-008"`, it throws `OosViolationError`.
  - When called with `"1_PRD-REQ-OOS-012"`, it throws `OosViolationError`.
  - When called with `"1_PRD-REQ-OOS-013"`, it throws `OosViolationError`.
  - When called with `"1_PRD-REQ-OOS-014"`, it throws `OosViolationError`.
  - When called with `"1_PRD-REQ-OOS-018"`, it throws `OosViolationError`.
  - When called with an in-scope feature ID (e.g., `"IN-SCOPE-001"`), it does NOT throw.
- [ ] Write a test asserting `scripts/verify-oos-manifest.js` exits with code `0` when the manifest is complete and code `1` when a required entry is missing (use a mock manifest or a test fixture).

## 2. Task Implementation
- [ ] Define the `OosEntry` TypeScript interface in `src/oos/types.ts`:
  ```typescript
  export interface OosEntry {
    id: string;
    name: string;
    description: string;
    rationale: string;
    futureConsideration: boolean | string;
  }
  ```
- [ ] Ensure `src/oos/oos-manifest.ts` imports and uses `OosEntry` to type its `OOS_MANIFEST` array: `export const OOS_MANIFEST: OosEntry[] = [...]`.
- [ ] Implement the `assertNotOos(featureId: string): void` utility in `src/oos/runtime-guard.ts`:
  ```typescript
  import { OOS_MANIFEST } from "./oos-manifest";
  import { OosViolationError } from "../errors/oos-violation-error";

  export function assertNotOos(featureId: string): void {
    const entry = OOS_MANIFEST.find((e) => e.id === featureId);
    if (entry) {
      throw new OosViolationError(featureId, `Feature "${entry.name}" (${featureId}) is explicitly out of scope: ${entry.description}`);
    }
  }
  ```
- [ ] Export `assertNotOos` from `src/oos/index.ts`.
- [ ] Finalize `scripts/verify-oos-manifest.js` to:
  1. Require the compiled `OOS_MANIFEST` (from `dist/oos/oos-manifest.js` or via `ts-node`).
  2. Define the required IDs: `["1_PRD-REQ-OOS-008", "1_PRD-REQ-OOS-012", "1_PRD-REQ-OOS-013", "1_PRD-REQ-OOS-014", "1_PRD-REQ-OOS-018"]`.
  3. Check each required ID is present in the manifest with all fields non-empty.
  4. Log `✅ OOS Manifest verified` on success or `❌ Missing/invalid OOS entry: {id}` on failure.
  5. Exit with code `0` on full success, `1` if any check fails.
- [ ] Wire `scripts/verify-oos-manifest.js` into the project's `package.json` scripts as `"verify:oos": "node scripts/verify-oos-manifest.js"`.

## 3. Code Review
- [ ] Verify `OosEntry` interface is defined once in `src/oos/types.ts` and imported everywhere — no inline redefinition.
- [ ] Confirm `OOS_MANIFEST` is statically typed as `OosEntry[]` — TypeScript must catch any missing fields at compile time.
- [ ] Verify `assertNotOos` has no side effects other than potentially throwing — it must be a pure guard with no logging or state mutation.
- [ ] Ensure `scripts/verify-oos-manifest.js` is runnable in CI without requiring a full application server startup (it should be a lightweight standalone script).
- [ ] Confirm there are no duplicate export names in `src/oos/index.ts`.
- [ ] Verify the `OosViolationError` constructor signature matches usage in `assertNotOos` and all other call sites throughout the codebase.

## 4. Run Automated Tests to Verify
- [ ] Run `npm test -- --testPathPattern=oos-manifest-completeness` and confirm all completeness assertions pass.
- [ ] Run `npm test -- --testPathPattern=oos-runtime-guard` and confirm all `assertNotOos` tests pass.
- [ ] Run `npm run verify:oos` and confirm it exits with code `0`.
- [ ] Run `npm test` (full suite) and confirm zero regressions.
- [ ] Run `npx tsc --noEmit` (or project equivalent) and confirm no TypeScript errors from the new types.

## 5. Update Documentation
- [ ] Update `docs/oos/README.md` with a top-level section `## OOS Manifest Structure` documenting the `OosEntry` interface fields and their purpose.
- [ ] Add a section `## Runtime Guard: assertNotOos` explaining how and where to use the guard function in the codebase.
- [ ] Update `docs/agent-memory/phase_15.agent.md` to record: "The `OOS_MANIFEST` is the single source of truth for all out-of-scope boundaries. Use `assertNotOos(id)` to programmatically enforce OOS constraints at runtime. The manifest is verified in CI via `npm run verify:oos`."
- [ ] Ensure `package.json` `scripts` section is documented in `docs/development/scripts.md` (or equivalent) with an entry for `verify:oos`.

## 6. Automated Verification
- [ ] Run `npm run verify:oos` in CI and confirm exit code `0`.
- [ ] Run `npx tsc --noEmit` in CI and confirm zero TypeScript errors.
- [ ] Run the full test suite in CI (`npm test`) and confirm all tests pass with zero failures.
- [ ] Add a CI gate: if `npm run verify:oos` exits with code `1`, the CI build must fail. Verify this gate is present in the CI config (e.g., `.github/workflows/ci.yml`).
