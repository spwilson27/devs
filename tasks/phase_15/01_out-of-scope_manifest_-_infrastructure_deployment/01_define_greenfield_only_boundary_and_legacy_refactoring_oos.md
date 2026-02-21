# Task: Define Greenfield-Only Boundary & Legacy Refactoring Out-of-Scope Declaration (Sub-Epic: 01_Out-of-Scope Manifest - Infrastructure & Deployment)

## Covered Requirements
- [1_PRD-REQ-OOS-001]

## 1. Initial Test Written
- [ ] In `src/oos/__tests__/manifest.test.ts`, write a unit test that imports the OOS manifest module (`src/oos/manifest.ts`) and asserts:
  - The manifest exports a constant array `OUT_OF_SCOPE_ITEMS` that is non-empty.
  - The array contains an entry with `id: "1_PRD-REQ-OOS-001"`, `category: "Infrastructure & Deployment"`, `title: "Legacy System Refactoring & Migration"`, and a non-empty `rationale` string.
  - The entry's `enforcement` field is an array containing at least one string that references a guard mechanism (e.g., `"ScopeGuard"` or `"input_validator"`).
- [ ] In `src/oos/__tests__/scope-guard.test.ts`, write a unit test that imports `ScopeGuard` from `src/oos/scope-guard.ts` and asserts:
  - Calling `ScopeGuard.isOutOfScope({ type: "legacy_refactoring" })` returns `true`.
  - Calling `ScopeGuard.isOutOfScope({ type: "greenfield" })` returns `false`.
  - `ScopeGuard.getRejectionMessage("1_PRD-REQ-OOS-001")` returns a string containing the phrase "greenfield" and "out of scope".
- [ ] In `src/oos/__tests__/scope-guard.test.ts`, write an integration test asserting that if the CLI orchestrator receives a user request containing the phrase "migrate existing codebase", it calls `ScopeGuard.isOutOfScope` and the response includes the rejection message for `1_PRD-REQ-OOS-001`.

## 2. Task Implementation
- [ ] Create `src/oos/manifest.ts`:
  - Define and export a TypeScript interface `OOSEntry` with fields: `id: string`, `category: string`, `title: string`, `rationale: string`, `enforcement: string[]`.
  - Define and export a `const OUT_OF_SCOPE_ITEMS: OOSEntry[]` array.
  - Add an entry for `1_PRD-REQ-OOS-001`:
    ```typescript
    {
      id: "1_PRD-REQ-OOS-001",
      category: "Infrastructure & Deployment",
      title: "Legacy System Refactoring & Migration",
      rationale: "devs is designed exclusively for greenfield software generation. Refactoring or migrating existing codebases introduces undefined state, unpredictable dependency graphs, and scope that cannot be bounded. This is explicitly excluded to preserve the integrity of the automated pipeline.",
      enforcement: ["ScopeGuard", "input_validator", "orchestrator_preflight_check"]
    }
    ```
- [ ] Create `src/oos/scope-guard.ts`:
  - Import `OUT_OF_SCOPE_ITEMS` from `./manifest`.
  - Define a map `LEGACY_KEYWORDS: string[]` = `["migrate existing", "refactor existing", "legacy codebase", "existing project", "brownfield"]`.
  - Export a `ScopeGuard` object with:
    - `isOutOfScope(request: { type?: string; description?: string }): boolean` — returns `true` if `request.type` is in the OOS type list OR if `request.description` matches any `LEGACY_KEYWORDS`.
    - `getRejectionMessage(reqId: string): string` — looks up the `OOSEntry` by `id` and returns a formatted rejection string: `"[OOS: <id>] <title> is out of scope for devs. devs supports greenfield development only. Rationale: <rationale>"`.
- [ ] Update `src/orchestrator/preflight.ts` (or create it if absent):
  - Add a `preflightScopeCheck(userRequest: string): { allowed: boolean; message?: string }` function that uses `ScopeGuard` to validate incoming requests before the pipeline starts.
  - If not allowed, return `{ allowed: false, message: ScopeGuard.getRejectionMessage("1_PRD-REQ-OOS-001") }`.

## 3. Code Review
- [ ] Verify that `OUT_OF_SCOPE_ITEMS` is immutable (use `as const` or `Object.freeze`) to prevent runtime mutation.
- [ ] Verify `ScopeGuard` has no side effects and is a pure utility module (no I/O, no state).
- [ ] Confirm the `OOSEntry` interface is exported from `src/oos/index.ts` for clean public API surface.
- [ ] Ensure `preflightScopeCheck` is called at the top of the orchestrator entry point and that the pipeline is halted immediately on rejection — no partial execution.
- [ ] Confirm all new files have corresponding `.agent.md` documentation stubs (1:1 AOD density per `9_ROADMAP-REQ-041`).

## 4. Run Automated Tests to Verify
- [ ] Run `npm test -- --testPathPattern="src/oos"` and confirm all tests in the `oos` directory pass with zero failures.
- [ ] Run `npm test -- --testPathPattern="src/orchestrator/preflight"` and confirm preflight tests pass.
- [ ] Run `npm run lint` and confirm zero lint errors in new files.

## 5. Update Documentation
- [ ] Create `src/oos/manifest.agent.md`: Document the purpose of the OOS manifest, the `OOSEntry` interface shape, and instructions for adding new OOS entries.
- [ ] Create `src/oos/scope-guard.agent.md`: Document the `ScopeGuard` API, list of legacy keywords checked, and how to extend the keyword list.
- [ ] Update `docs/architecture/out-of-scope.md` (create if absent): Add a section "Infrastructure & Deployment Out-of-Scope Items" and list `1_PRD-REQ-OOS-001` with its full rationale.
- [ ] Update `docs/agent-memory/phase_15_decisions.md`: Record the decision that legacy refactoring is enforced at the preflight level, not merely documented.

## 6. Automated Verification
- [ ] Run `node scripts/verify-oos-manifest.js --req-id="1_PRD-REQ-OOS-001"` (create this script if absent): The script should parse `src/oos/manifest.ts`, find the entry with the matching `id`, and exit with code `0` if found and non-empty `rationale`, or code `1` with an error message if not.
- [ ] Run `npm test -- --coverage --testPathPattern="src/oos"` and confirm line coverage for `src/oos/manifest.ts` and `src/oos/scope-guard.ts` is ≥ 90%.
- [ ] In CI, assert that `grep -r "1_PRD-REQ-OOS-001" src/oos/manifest.ts` exits with code `0`.
