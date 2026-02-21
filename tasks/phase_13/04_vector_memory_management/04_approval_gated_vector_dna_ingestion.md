# Task: Implement Approval-Gated Vector DNA Ingestion to Prevent Context Poisoning (Sub-Epic: 04_Vector Memory Management)

## Covered Requirements
- [3_MCP-RISK-503]

## 1. Initial Test Written
- [ ] Create `src/memory/__tests__/VectorIngestion.context-poisoning.test.ts`.
- [ ] Write a unit test `ingest_blocksUnapprovedTask_throwsContextPoisoningError` that:
  1. Creates a mock task object with `status: "InProgress"`.
  2. Calls `VectorDNA.ingest(task)`.
  3. Asserts the call throws a `ContextPoisoningError` with message containing `"Only Approved tasks may be ingested"`.
  4. Asserts that the mock `LanceDBAdapter.insert` was NOT called.
- [ ] Write a unit test `ingest_allowsApprovedTask_callsLanceDBInsert` that:
  1. Creates a mock task with `status: "Approved"`.
  2. Calls `VectorDNA.ingest(task)`.
  3. Asserts `LanceDBAdapter.insert` was called exactly once with the correct embedding payload.
- [ ] Write a unit test `ingestDecision_blocksUnverifiedDecision_throwsContextPoisoningError` that:
  1. Creates an architectural decision object with `verified: false`.
  2. Calls `VectorDNA.ingestDecision(decision)`.
  3. Asserts a `ContextPoisoningError` is thrown.
- [ ] Write a unit test `ingestDecision_allowsVerifiedDecision_callsLanceDBInsert` that passes a decision with `verified: true` and asserts `LanceDBAdapter.insert` is called.
- [ ] Write an integration test `ingest_integration_onlyApprovedRowsInLanceDB` that:
  1. Ingests 3 tasks: 1 `Approved`, 1 `Verified`, 1 `InProgress`.
  2. Queries LanceDB directly.
  3. Asserts exactly 2 rows exist (the Approved and Verified tasks) and the InProgress task is absent.

## 2. Task Implementation
- [ ] Create `src/memory/VectorDNA.ts`.
- [ ] Define and export the `VectorDNA` class with the following methods:
  ```typescript
  export class VectorDNA {
    static async ingest(task: Task): Promise<void>
    static async ingestDecision(decision: ArchitecturalDecision): Promise<void>
  }
  ```
- [ ] Define and export `ContextPoisoningError extends Error` in `src/memory/errors.ts` (create if not exists).
- [ ] Implement `ingest(task)`:
  1. Check `task.status`. Allowed values: `"Approved"`, `"Verified"`. Reject all other statuses by throwing `ContextPoisoningError`.
  2. Generate the embedding for `task.summary` using the `EmbeddingService` (existing service from earlier phases).
  3. Call `LanceDBAdapter.insert` with the embedding vector and metadata: `{ task_id: task.id, epic_id: task.epicId, status: task.status, created_at_task_id: task.id }`.
- [ ] Implement `ingestDecision(decision)`:
  1. Check `decision.verified === true`. If not, throw `ContextPoisoningError`.
  2. Generate the embedding for `decision.summary`.
  3. Call `LanceDBAdapter.insert` with metadata: `{ decision_id: decision.id, epic_id: decision.epicId, verified: true, created_at_task_id: decision.taskId }`.
- [ ] Update all existing call sites that previously inserted directly into LanceDB for tasks or decisions to route through `VectorDNA.ingest` / `VectorDNA.ingestDecision` instead.
- [ ] Export `VectorDNA` and `ContextPoisoningError` from `src/memory/index.ts`.

## 3. Code Review
- [ ] Verify the status allowlist (`"Approved"`, `"Verified"`) is defined as a `const` array or TypeScript union type — not hardcoded inline strings — to make future status additions explicit.
- [ ] Verify `ContextPoisoningError` extends `Error` and sets `this.name = "ContextPoisoningError"` for proper `instanceof` checks.
- [ ] Verify `VectorDNA` does NOT call the embedding service or LanceDB when the status check fails (guard clause first, then embed).
- [ ] Verify there is no code path where an unapproved item can be inserted into LanceDB, including edge cases (null status, undefined status, empty string).
- [ ] Confirm all prior direct LanceDB insert call sites for tasks/decisions have been removed or replaced with `VectorDNA` calls — run `grep -rn "LanceDBAdapter.insert" src/` and manually verify each remaining call is intentional.

## 4. Run Automated Tests to Verify
- [ ] Run `npm test -- --testPathPattern="VectorIngestion.context-poisoning"` from the project root.
- [ ] All tests in `src/memory/__tests__/VectorIngestion.context-poisoning.test.ts` must pass with exit code 0.
- [ ] Run the full memory and orchestrator test suites to confirm no regressions:
  ```
  npm test -- --testPathPattern="src/memory|src/orchestrator"
  ```
- [ ] Confirm test coverage for `src/memory/VectorDNA.ts` is ≥ 95% (all branches, including the error paths).

## 5. Update Documentation
- [ ] Create `src/memory/VectorDNA.agent.md` documenting:
  - Purpose: Single ingestion gate for the Vector DNA store; prevents context poisoning.
  - The status allowlist (`"Approved"`, `"Verified"`) and what each means.
  - The `ContextPoisoningError` error type and how calling agents should handle it.
  - The instruction: "Never call `LanceDBAdapter.insert` directly for task or decision data — always route through `VectorDNA`."
- [ ] Update `docs/architecture/vector-memory.md` with a "Context Poisoning Prevention" section describing the ingestion gate pattern.
- [ ] Update `docs/agent-guidelines.md` with a rule: "All vector memory writes for tasks and architectural decisions MUST use `VectorDNA.ingest` or `VectorDNA.ingestDecision`."

## 6. Automated Verification
- [ ] Run `npm test -- --testPathPattern="VectorIngestion.context-poisoning" --coverage --coverageReporters=text` and assert ≥ 95% coverage on `VectorDNA.ts`.
- [ ] Run `grep -rn "LanceDBAdapter.insert" src/ | grep -v "VectorDNA\|test\|spec\|agent.md"` and assert the output is empty (no unauthorized direct inserts remain).
- [ ] Run `npm run build` and confirm zero TypeScript compilation errors.
- [ ] Run the integration test in isolation: `npm run test:integration -- --testPathPattern="VectorIngestion.context-poisoning"` and confirm the correct row count in the ephemeral LanceDB instance.
