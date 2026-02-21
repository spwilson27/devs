# Task: Implement Documentation Drift Detection and Auto-Sync for Agent-Oriented Docs (Sub-Epic: 17_Infrastructure Risk Mitigation)

## Covered Requirements
- [RISK-602]

## 1. Initial Test Written
- [ ] Create `src/docs/__tests__/driftDetector.test.ts` with Vitest.
- [ ] Write a unit test `computeDocHash_returnsStableHashForContent` that calls `computeDocHash(content: string)` with fixed content and asserts the returned SHA-256 hex string is deterministic.
- [ ] Write a unit test `detectDrift_noDriftWhenHashMatches` that seeds a mock `doc_hashes` SQLite table with the current hash of a module's `.agent.md` file and asserts `detectDrift(modulePath)` returns `{ drifted: false }`.
- [ ] Write a unit test `detectDrift_reportsDriftOnMismatch` that seeds an outdated hash and modifies the file content, then asserts `detectDrift(modulePath)` returns `{ drifted: true, modulePath, expectedHash, actualHash }`.
- [ ] Write a unit test `driftDetector_scanDirectory_findsAllAgentMdFiles` that creates a mock directory tree with `.agent.md` files at varying depths and asserts `scanForAgentDocs(rootDir)` returns all their paths.
- [ ] Write an integration test `orchestrator_blockCommitOnDocDrift` using a mock LangGraph node: after a task's code-change commits, inject a documentation-drifted module and assert the `DocumentationVerifierNode` emits `DOC_DRIFT_DETECTED` and routes to the documentation update step before allowing the commit.

## 2. Task Implementation
- [ ] Create `src/docs/driftDetector.ts` exporting:
  - `computeDocHash(content: string): string` — SHA-256 hex digest of the content string.
  - `scanForAgentDocs(rootDir: string): string[]` — recursively finds all `*.agent.md` files under `rootDir`.
  - `detectDrift(modulePath: string, stateManager: StateManager): DriftResult` — reads the `.agent.md` file adjacent to `modulePath`, computes its hash, compares against the stored hash in `state.sqlite`.
  - `recordDocHash(modulePath: string, hash: string, stateManager: StateManager): void` — upserts the hash into the `doc_hashes` table.
- [ ] Create DB migration `src/db/migrations/<timestamp>_create_doc_hashes.ts` creating table `doc_hashes(module_path TEXT PRIMARY KEY, hash TEXT NOT NULL, updated_at INTEGER NOT NULL)`.
- [ ] Create `src/docs/DocumentationVerifierNode.ts` as a LangGraph node:
  - On entry: collect all files changed by the completed task.
  - For each changed file, call `detectDrift` on the co-located `.agent.md`.
  - If any drift is detected, emit `DOC_DRIFT_DETECTED` and route the graph to an `UpdateDocumentationNode` step.
  - After docs are updated, call `recordDocHash` for each updated file and route to commit.
- [ ] Integrate `DocumentationVerifierNode` into `OrchestrationGraph` between `ReviewerNode` and `CommitNode`.
- [ ] Add a `devs docs:check` CLI command (`src/cli/commands/docsCheck.ts`) that runs `scanForAgentDocs` + `detectDrift` for all modules and prints a drift report.

## 3. Code Review
- [ ] Verify `driftDetector.ts` has no I/O side effects in `computeDocHash` — it must be a pure function.
- [ ] Confirm `DocumentationVerifierNode` handles the edge case where a changed file has no adjacent `.agent.md` (should warn, not fail).
- [ ] Ensure the DB migration uses `CREATE TABLE IF NOT EXISTS` for idempotency.
- [ ] Verify `devs docs:check` exits with code `1` when drift is found (for CI pipeline integration).

## 4. Run Automated Tests to Verify
- [ ] Run `pnpm vitest run src/docs/__tests__/driftDetector.test.ts` and confirm all tests pass.
- [ ] Run `pnpm vitest run --reporter=verbose` for the full suite and verify no regressions.

## 5. Update Documentation
- [ ] Create `src/docs/docs.agent.md` describing the drift detection architecture, hash storage schema, and the `DocumentationVerifierNode` integration point.
- [ ] Update `docs/architecture/documentation-management.md` with a Mermaid sequence diagram for the documentation verification step in the TDD cycle.
- [ ] Update `CHANGELOG.md`: `feat(docs): documentation drift detection and auto-sync gate [RISK-602]`.

## 6. Automated Verification
- [ ] Run `pnpm vitest run --reporter=json --outputFile=test-results/doc-drift.json` and assert exit code is `0`.
- [ ] Execute `node scripts/verify_test_results.js test-results/doc-drift.json` and confirm all tests show `status: "passed"`.
- [ ] Run `pnpm devs docs:check` on the repository itself and confirm exit code `0` (no drift in the codebase after this task's doc updates).
