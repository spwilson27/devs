# Task: Investigate and Resolve Shared Memory Architecture Decision (Sub-Epic: 13_User_Directive_and_Feedback)

## Covered Requirements
- [3_MCP-UNKNOWN-501]

## 1. Initial Test Written
- [ ] In `packages/memory/src/__tests__/sharedMemory.test.ts`, write tests that document the chosen architecture decision regardless of which path is taken:
  - **If shared memory IS supported:**
    - Test `SharedMemoryService.getSharedMemory(userId: string, query: string): Promise<MemoryResult[]>`:
      - Assert that results are scoped to `userId` namespace (not project-specific).
      - Assert that vectors from `projectId="project-A"` and `projectId="project-B"` are both returned when querying under the same `userId`.
      - Assert that vectors from a different `userId` are NOT returned.
    - Test `SharedMemoryService.writeSharedMemory(userId, content, vector)`:
      - Assert record is written with correct `userId` and `scope: "shared"`.
  - **If shared memory is NOT supported (decision: isolated per-project):**
    - Test that `MemoryService.search(query, { projectId })` returns ONLY records matching that `projectId`.
    - Test that attempting to search across multiple `projectId`s throws a `CrossProjectMemoryError`.
    - Document the rationale via a `DECISION.md` in `packages/memory/`.
  - Write the tests to reflect the decision made during implementation (see Task Implementation below).

## 2. Task Implementation
- [ ] **Architectural Decision (spike):** Review the LanceDB schema defined in Phase 4 and evaluate:
  - Does the current `user_feedback` and vector memory schema include a `userId` field?
  - Would adding a `userId`-scoped namespace require schema migration for existing tables?
  - Is there a clear use case for shared UI library preferences across projects within the devs MVP scope?
- [ ] **Record Decision** in `docs/architecture/shared-memory-decision.md`:
  - Document the question: "Should devs support shared memory across projects for the same user?"
  - Document the chosen answer with rationale (recommended default: **Not supported in MVP**; each project has an isolated LanceDB store at `.devs/<projectId>/memory.lancedb`).
  - Document the path to enable it in a future phase (add `userId` namespace field to schema + `SharedMemoryService`).
- [ ] **If decision is NO (recommended for MVP):**
  - Update `packages/memory/src/vectorStore.ts` (or equivalent) to enforce that all LanceDB queries include a `projectId` filter.
  - Add a guard in `MemoryService` that throws `CrossProjectMemoryError` if a caller attempts to search without a `projectId`.
  - Export `CrossProjectMemoryError` from `packages/memory/src/errors.ts`.
- [ ] **If decision is YES:**
  - Add `userId: string` and `scope: "project" | "shared"` fields to the LanceDB vector schema.
  - Implement `SharedMemoryService` in `packages/memory/src/sharedMemory.ts` with `writeSharedMemory` and `getSharedMemory` methods scoped to `userId`.
  - Register the new service in `packages/memory/src/index.ts`.

## 3. Code Review
- [ ] Verify the architectural decision is recorded in `docs/architecture/shared-memory-decision.md` with a date and clear rationale.
- [ ] Verify that whichever path was chosen, the LanceDB schema changes (if any) are declared in the single shared schema constant file.
- [ ] Verify that cross-project memory access is provably impossible in the MVP path (projectId filter is non-optional).
- [ ] Verify that the `CrossProjectMemoryError` (or `SharedMemoryService`) is fully covered by the tests written in Step 1.
- [ ] Verify no residual TODO or FIXME comments remain in new code.

## 4. Run Automated Tests to Verify
- [ ] Run `pnpm --filter @devs/memory test` and confirm all shared memory architecture tests pass with 0 failures.
- [ ] Run `pnpm lint` and confirm no linting errors.
- [ ] If schema changes were made, run `pnpm --filter @devs/memory test:integration` to validate LanceDB table creation with the new schema.

## 5. Update Documentation
- [ ] Ensure `docs/architecture/shared-memory-decision.md` is committed and references `[3_MCP-UNKNOWN-501]`.
- [ ] Update `packages/memory/README.md` with a note under "Project Isolation" explaining that memory is scoped per-project (or per-user if shared is enabled) and referencing the architecture decision doc.
- [ ] Update agent memory file `.devs/memory/decisions.md` with entry: `[3_MCP-UNKNOWN-501] Decision: [Chosen answer]. Rationale: [summary from architecture doc]. Future path: [brief note].`

## 6. Automated Verification
- [ ] Run `pnpm --filter @devs/memory test 2>&1 | grep -E "PASS|FAIL"` and assert output contains only `PASS`.
- [ ] Assert `docs/architecture/shared-memory-decision.md` exists and contains the string `[3_MCP-UNKNOWN-501]` (verifiable with `grep -q "3_MCP-UNKNOWN-501" docs/architecture/shared-memory-decision.md && echo FOUND`).
- [ ] Assert CI pipeline (`pnpm ci`) exits with code 0.
