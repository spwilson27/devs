# Task: Implement Shadow Requirement Detector (Sub-Epic: 13_Agent Autonomy & Reviewer Intelligence)

## Covered Requirements
- [3_MCP-REQ-MET-010]

## 1. Initial Test Written

- [ ] In `packages/core/src/agents/__tests__/shadow-requirement.test.ts`, write the following tests before any implementation:
  - **Unit: No shadow — all additions are covered** — Given a `GitDiff` where the added source function `calculateDiscount()` is also referenced in an added test line in the diff and maps to the task's `req_id`, assert `detectShadowRequirements({ diff, task })` returns `{ pass: true, shadows: [] }`.
  - **Unit: Shadow detected — untested new function** — Given a `GitDiff` that adds a new exported function `applyPromoCode()` in `src/pricing.ts` with no corresponding new test file hunk or test reference in the diff, assert `detectShadowRequirements` returns `{ pass: false, shadows: [{ symbol: "applyPromoCode", file: "src/pricing.ts", reason: "No test coverage found in diff" }] }`.
  - **Unit: Shadow detected — untracked requirement** — Given a `GitDiff` that adds a new route `POST /admin/reset` in `src/routes.ts`, and the task definition does NOT contain `POST /admin/reset` in any `req_id` or success criteria, assert a shadow entry with `reason: "No requirement mapping found"`.
  - **Unit: Shadow detected — new dependency with no task reference** — Given a diff that adds `"bcrypt": "^5.0.0"` to `package.json` but no task success criterion mentions `bcrypt`, assert a shadow entry `{ symbol: "bcrypt", file: "package.json", reason: "Dependency added without requirement mapping" }`.
  - **Unit: No shadow — test file additions are exempt** — Given a diff that only adds lines to `src/__tests__/pricing.test.ts`, assert `{ pass: true, shadows: [] }` (new tests without new source are never shadows).
  - **Unit: No shadow — documentation-only additions** — Given a diff that only adds lines to `.agent.md` or `README.md` files, assert `{ pass: true, shadows: [] }`.
  - **Integration: ReviewNode integration** — In the `ReviewNode`, when `detectShadowRequirements` returns `pass: false`, assert the `AuditResult` gains a violation in the `"shadow_requirement"` dimension, `overallPass` is `false`, and the shadow symbol list is logged to `agent_logs`.

## 2. Task Implementation

- [ ] Create `packages/core/src/agents/shadow-requirement.ts`:
  - Define `ShadowEntry`: `{ symbol: string; file: string; reason: string }`.
  - Define `ShadowDetectionResult`: `{ pass: boolean; shadows: ShadowEntry[] }`.
  - Implement `detectShadowRequirements({ diff, task }: ShadowDetectionInput): ShadowDetectionResult`:
    1. **Parse added symbols**: Extract all new exported functions, classes, and routes from the diff's added lines. Use a regex-based heuristic:
       - TypeScript exports: `/^export (function|class|const|async function) (\w+)/`.
       - Express/Fastify routes: `/\.(get|post|put|delete|patch)\(['"]([^'"]+)['"]/`.
    2. **Check test coverage in diff**: For each extracted symbol, check if the symbol name appears in any added line within a `*.test.ts` or `*.spec.ts` hunk in the same diff. If absent, flag as `"No test coverage found in diff"`.
    3. **Check requirement mapping**: For each extracted symbol, check if the symbol name or route path appears in `task.success_criteria` or `task.description`. If absent, flag as `"No requirement mapping found"`.
    4. **Check new dependencies**: Parse any `package.json` hunk for added entries under `dependencies` or `devDependencies`. For each added package, verify it is mentioned in `task.success_criteria` or `task.description`. If absent, flag as `"Dependency added without requirement mapping"`.
    5. **Exempt patterns**: Skip symbols in `*.test.ts`, `*.spec.ts`, `*.d.ts`, `*.agent.md`, and `*.md` files.
    6. Return `{ pass: shadows.length === 0, shadows }`.
- [ ] Add `"shadow_requirement"` as a new violation dimension in `AuditViolation` (`packages/core/src/agents/reviewer-audit.ts`) so the existing audit engine can include shadow detections.
- [ ] Call `detectShadowRequirements` from `runFullAudit` in `packages/core/src/agents/reviewer-audit.ts` as a fifth dimension named `shadow`. Convert `ShadowEntry[]` to `AuditViolation[]` with `dimension: "shadow_requirement"`.
- [ ] Ensure the `ReviewNode` records shadow symbols in `agent_logs` for post-hoc analysis — store the `ShadowDetectionResult` JSON in `agent_logs.payload` under key `shadow_detection`.

## 3. Code Review

- [ ] Verify the regex for TypeScript export extraction does NOT match re-exports (`export { foo } from "./bar"`) — re-exports of external symbols are not scope creep.
- [ ] Verify the route extraction covers all HTTP verbs and both Express and Fastify calling conventions (`app.get` vs `router.get` vs `fastify.get`).
- [ ] Verify that internal (non-exported) helper functions are NOT flagged — only `export`ed symbols are considered public surface area subject to review.
- [ ] Confirm the exemption list for file patterns is defined as a constant array (e.g., `SHADOW_EXEMPT_GLOBS`) so it is easy to extend without modifying business logic.
- [ ] Confirm `detectShadowRequirements` is pure — accepts only serializable data, performs no I/O, and is independently testable.

## 4. Run Automated Tests to Verify

- [ ] Run: `cd packages/core && npm test -- --testPathPattern="shadow-requirement"` and confirm all tests pass.
- [ ] Run: `npm run lint && npx tsc --noEmit` in `packages/core` and confirm zero errors.
- [ ] Run the full suite: `npm test` from the monorepo root to confirm no regressions.

## 5. Update Documentation

- [ ] Create or update `packages/core/src/agents/.agent.md` with a section for `detectShadowRequirements`:
  - Document the detection algorithm (3 checks: test coverage, requirement mapping, dependency mapping).
  - Document the `SHADOW_EXEMPT_GLOBS` constant and how to extend it.
  - Document the `ShadowDetectionResult` schema.
- [ ] Add a `## Shadow Requirement Detection` section to `docs/reviewer-agent.md` explaining the risk and mitigation strategy.
- [ ] Update `.agent/index.agent.md` to note that the `ReviewNode` now includes shadow detection in its audit output.

## 6. Automated Verification

- [ ] Run `node scripts/verify-requirements.js --req 3_MCP-REQ-MET-010` and confirm the script reports `COVERED` by detecting `detectShadowRequirements` in the source and its integration in `runFullAudit`.
- [ ] Run `npm run test:integration -- --grep "shadow-requirement"` to confirm the integration test that triggers `REVIEW_FAILED` on shadow detection passes end-to-end.
