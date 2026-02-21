# Task: Implement Background Process Manager for Long-Running Distributed Tasks (Sub-Epic: 14_Multi-Agent & Distributed Execution)

## Covered Requirements
- [3_MCP-UNKNOWN-302]

## 1. Initial Test Written
- [ ] In `packages/core/src/orchestration/__tests__/background-process-manager.test.ts`, write the following tests:
  - Test that `BackgroundProcessManager.start(processSpec)` returns a unique `process_id` (UUID) and stores the process with `status: 'running'`.
  - Test that `getStatus(processId)` returns the current `BackgroundProcessRecord` including `status`, `startedAt`, `nodeId`, and `progress`.
  - Test that `getStatus` for an unknown `processId` returns `undefined`.
  - Test that `update(processId, { progress, status })` updates the record; confirm that invalid status transitions (e.g., `'completed'` → `'running'`) throw a `InvalidStatusTransitionError`.
  - Test that `complete(processId, result)` sets `status: 'completed'`, `completedAt: Date`, and stores `result`.
  - Test that `fail(processId, error)` sets `status: 'failed'`, `completedAt: Date`, and stores the error message.
  - Test that `listBySession(sessionId)` returns all processes (completed, running, failed) for a given `sessionId`.
  - Test that starting a process on `nodeId: 'node-2'` while another process `nodeId: 'node-1'` is running for the same `sessionId` is allowed (multi-node support).

## 2. Task Implementation
- [ ] Create `packages/core/src/orchestration/background-process-manager.ts`:
  - Define `BackgroundProcessSpec`: `{ sessionId: string; nodeId: string; description: string; metadata?: Record<string, unknown> }`.
  - Define `BackgroundProcessRecord`: `{ processId: string; sessionId: string; nodeId: string; description: string; status: 'running' | 'completed' | 'failed'; progress: number; startedAt: Date; completedAt?: Date; result?: unknown; error?: string; metadata?: Record<string, unknown> }`.
  - Implement `BackgroundProcessManager` class:
    - Internal `Map<string, BackgroundProcessRecord>`.
    - `start(spec: BackgroundProcessSpec): string` — generates UUID, creates record with `status: 'running'`, `progress: 0`, `startedAt: new Date()`, returns `processId`.
    - `getStatus(processId: string): BackgroundProcessRecord | undefined`.
    - `update(processId: string, patch: { progress?: number; status?: 'running' }): void` — throws `ProcessNotFoundError` if unknown; throws `InvalidStatusTransitionError` if status in record is terminal (`'completed'` or `'failed'`).
    - `complete(processId: string, result?: unknown): void` — sets `status: 'completed'`, `completedAt`, `result`, `progress: 100`.
    - `fail(processId: string, error: string): void` — sets `status: 'failed'`, `completedAt`, `error`.
    - `listBySession(sessionId: string): BackgroundProcessRecord[]`.
- [ ] Add `ProcessNotFoundError` and `InvalidStatusTransitionError` to `packages/core/src/orchestration/errors.ts`.
- [ ] Export all types, class, and errors from `packages/core/src/index.ts`.
- [ ] Expose a MCP tool `get_background_process_status` in `packages/core/src/mcp/tools/background-process-tools.ts` that accepts `{ process_id: string }` and returns the serialized `BackgroundProcessRecord` (or a not-found error).

## 3. Code Review
- [ ] Verify that `complete` and `fail` are idempotent: calling them twice on the same `processId` does not throw but logs a warning.
- [ ] Confirm `InvalidStatusTransitionError` includes both the current status and the attempted transition in its message.
- [ ] Ensure the `nodeId` field in `BackgroundProcessRecord` is immutable after creation (not modifiable via `update`).
- [ ] Verify that `listBySession` returns a new array (not the internal collection) to prevent external mutation.

## 4. Run Automated Tests to Verify
- [ ] Run `pnpm --filter @devs/core test -- --testPathPattern background-process-manager` and confirm all tests pass.
- [ ] Run coverage: `pnpm --filter @devs/core test -- --coverage --testPathPattern background-process-manager` and confirm ≥ 90% line coverage for `background-process-manager.ts`.

## 5. Update Documentation
- [ ] Create or append to `packages/core/src/orchestration/README.md` with a "Background Process Manager" section describing:
  - The purpose (tracking long-running processes like DB migrations across multiple nodes).
  - The lifecycle state machine: `running → completed | failed`.
  - The MCP tool `get_background_process_status` and its input/output schema.
- [ ] Update `index.agent.md` to record that agents performing long-running operations MUST register them with `BackgroundProcessManager.start()` and update progress via `update()`.

## 6. Automated Verification
- [ ] Run `pnpm --filter @devs/core build` (exit code 0).
- [ ] Run `pnpm --filter @devs/core test` (exit code 0).
- [ ] Run `pnpm --filter @devs/core tsc --noEmit` (exit code 0).
