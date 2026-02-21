# Task: Implement Reviewer Agent Multi-Dimensional Audit Engine (Sub-Epic: 13_Agent Autonomy & Reviewer Intelligence)

## Covered Requirements
- [3_MCP-REQ-MET-009]

## 1. Initial Test Written

- [ ] In `packages/core/src/agents/__tests__/reviewer-audit.test.ts`, write the following tests before any implementation:
  - **Unit: Requirement Fidelity pass** — Given a `ReviewAudit` runner with a mock `task` (containing `req_id: "3_MCP-REQ-MET-008"`, `success_criteria: ["index.agent.md must be updated"]`) and a mock diff that adds `index.agent.md`, assert `checkRequirementFidelity()` returns `{ pass: true, violations: [] }`.
  - **Unit: Requirement Fidelity fail** — Given the same task but a mock diff that does NOT touch `index.agent.md`, assert `checkRequirementFidelity()` returns `{ pass: false, violations: [{ message: "Success criterion not met: index.agent.md must be updated" }] }`.
  - **Unit: TAS Compliance pass** — Given an allowed library list `["zod", "better-sqlite3"]` from the TAS, and a mock `package.json` diff that only adds `"zod"`, assert `checkTASCompliance()` returns `{ pass: true, violations: [] }`.
  - **Unit: TAS Compliance fail** — Given the same allowed list, and a mock `package.json` diff that adds `"lodash"` (not in the TAS), assert `checkTASCompliance()` returns `{ pass: false, violations: [{ message: "Unapproved library added: lodash" }] }`.
  - **Unit: Agentic Observability pass** — Given a mock diff that modifies `src/foo.ts` and also updates `src/foo.agent.md` with a valid introspection point description, assert `checkAgenticObservability()` returns `{ pass: true, violations: [] }`.
  - **Unit: Agentic Observability fail** — Given a mock diff that modifies `src/foo.ts` but does NOT touch `src/foo.agent.md`, assert `checkAgenticObservability()` returns `{ pass: false, violations: [{ message: "Module src/foo.ts modified without updating src/foo.agent.md" }] }`.
  - **Unit: Security check — hardcoded secret** — Given a mock diff that adds the line `const API_KEY = "sk-abc123"`, assert `checkSecurity()` returns `{ pass: false, violations: [{ message: "Potential hardcoded secret detected on line N" }] }`.
  - **Unit: Security check — unsafe regex** — Given a diff adding a ReDoS-vulnerable regex (e.g., `/(a+)+$/`), assert `checkSecurity()` returns a violation citing `"Potentially catastrophic backtracking regex"`.
  - **Unit: Aggregate audit** — Call `runFullAudit({ task, diff, tasConfig })`. When all four checks pass, assert the returned `AuditResult` has `overallPass: true` and `violations: []`. When any check fails, assert `overallPass: false` and the `violations` array contains entries from all failing dimensions.
  - **Integration: ReviewNode integration** — Simulate the `ReviewNode` calling `runFullAudit`. Assert that on `overallPass: false` the state machine transitions to `REVIEW_FAILED`, stores the `AuditResult` in `agent_logs`, and does NOT advance to `CommitNode`.

## 2. Task Implementation

- [ ] Create `packages/core/src/agents/reviewer-audit.ts`:
  - Define the `AuditViolation` type: `{ dimension: "fidelity" | "tas" | "observability" | "security"; message: string; line?: number }`.
  - Define `AuditResult`: `{ overallPass: boolean; violations: AuditViolation[]; timestamp: string }`.
  - Implement `checkRequirementFidelity(task: TaskDefinition, diff: GitDiff): DimensionResult`:
    - For each string in `task.success_criteria`, check whether the diff contains a file change or text change that plausibly satisfies it.
    - Use simple keyword matching on criteria text against changed file paths and added lines.
    - Return `{ pass: boolean; violations: AuditViolation[] }`.
  - Implement `checkTASCompliance(diff: GitDiff, tasConfig: TASConfig): DimensionResult`:
    - Parse any `package.json` hunk in the diff to extract added dependencies.
    - Cross-reference against `tasConfig.allowed_libraries: string[]`.
    - Flag any dependency not present in the allowed list as a violation.
  - Implement `checkAgenticObservability(diff: GitDiff): DimensionResult`:
    - For every modified `.ts` file in `src/` that is NOT a test file, assert that there is a corresponding `.agent.md` file also changed in the same diff.
    - If a `.ts` file is changed without a matching `.agent.md` hunk, add a violation.
  - Implement `checkSecurity(diff: GitDiff): DimensionResult`:
    - Scan added lines for patterns matching: high-entropy strings (API keys), common secret variable names (`API_KEY`, `SECRET`, `PASSWORD` assigned to string literals), and ReDoS-prone regex patterns (nested quantifiers).
    - Use the pre-existing `SecretMasker` pattern list from `packages/core/src/security/secret-masker.ts` as the detection source.
  - Implement `runFullAudit({ task, diff, tasConfig }: AuditInput): AuditResult`:
    - Run all four checks in sequence.
    - Aggregate violations; set `overallPass = true` only if all four pass.
    - Return the `AuditResult`.
- [ ] Integrate `runFullAudit` into the LangGraph `ReviewNode` (`packages/core/src/orchestrator/nodes/review-node.ts`):
  - After all tests pass (VERIFY gate is GREEN), call `runFullAudit`.
  - On `overallPass: false`: transition to `REVIEW_FAILED`, persist `AuditResult` to `agent_logs`, and surface violations to the user via the event bus.
  - On `overallPass: true`: advance to `CommitNode`.

## 3. Code Review

- [ ] Verify all four check functions are pure (no side effects, no I/O) — they accept only data and return results synchronously.
- [ ] Verify `checkTASCompliance` correctly handles `devDependencies` separately from `dependencies` in `package.json` diffs.
- [ ] Verify `checkAgenticObservability` excludes `*.test.ts`, `*.spec.ts`, and `*.d.ts` files from the requirement to have a corresponding `.agent.md`.
- [ ] Verify the security check does NOT produce false positives on placeholder values such as `"your-api-key-here"` or `"<your_secret>"` — these are documentation patterns, not live secrets.
- [ ] Confirm `runFullAudit` does not short-circuit on the first failure — all four dimensions MUST be evaluated independently so the full violation list is always complete.

## 4. Run Automated Tests to Verify

- [ ] Run: `cd packages/core && npm test -- --testPathPattern="reviewer-audit"` and confirm all tests pass.
- [ ] Run: `npm run lint && npx tsc --noEmit` in `packages/core` and confirm zero errors.
- [ ] Run the full suite: `npm test` from the monorepo root to confirm no regressions.

## 5. Update Documentation

- [ ] Create `packages/core/src/agents/.agent.md` documenting:
  - The `runFullAudit` function signature, inputs, and return type.
  - A description of each of the four audit dimensions and their detection logic.
  - How to extend the `checkSecurity` function with additional patterns.
- [ ] Update `docs/reviewer-agent.md` (or create it) with a section titled "Hierarchy of Concerns" describing the four audit dimensions in priority order.
- [ ] Update `.agent/index.agent.md` to register `ReviewNode` as an introspection point with the `AuditResult` schema.

## 6. Automated Verification

- [ ] Run `node scripts/verify-requirements.js --req 3_MCP-REQ-MET-009` and confirm the script reports `COVERED` by detecting all four audit dimension function names in the source.
- [ ] Run `npm run test:integration -- --grep "review-node"` and confirm the integration test that verifies `REVIEW_FAILED` state transition on audit failure passes.
