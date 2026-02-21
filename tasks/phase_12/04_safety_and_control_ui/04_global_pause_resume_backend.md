# Task: Global Pause/Resume Backend State Machine (Sub-Epic: 04_Safety and Control UI)

## Covered Requirements
- [1_PRD-REQ-UI-008]

## 1. Initial Test Written
- [ ] In `packages/core/src/orchestrator/__tests__/PauseResumeController.test.ts`, write unit tests for a `PauseResumeController` class:
  - Test that initial state is `"running"`.
  - Test that calling `pause()` transitions state to `"paused"` and emits an `orchestrator:paused` event on the `EventBus` with `{ timestamp, activeAgentIds }`.
  - Test that calling `pause()` when already `"paused"` is a no-op (no duplicate event emitted).
  - Test that calling `resume()` transitions state from `"paused"` to `"running"` and emits an `orchestrator:resumed` event.
  - Test that calling `resume()` when already `"running"` is a no-op.
  - Test that when `pause()` is called, all active agent loops in the orchestrator receive a cancellation signal and stop after their current atomic step completes (not mid-step).
  - Test that agent state (current task context, memory, pending tool calls) is serialized and persisted to a `StateSnapshot` in a configured storage path when paused.
  - Test that on `resume()`, the `StateSnapshot` is read and agent loops are restarted from the persisted state.
  - Test that `getState()` returns `"running"` or `"paused"` correctly.
  - Write integration test: simulate an in-progress agent loop → call `pause()` → verify the agent completes its current atomic step and then halts → call `resume()` → verify the agent continues from where it left off.

## 2. Task Implementation
- [ ] Create `packages/core/src/orchestrator/PauseResumeController.ts`:
  - `OrchestratorState` enum: `RUNNING = "running"`, `PAUSED = "paused"`.
  - Constructor accepts `(eventBus: EventBus, stateStore: IStateStore, agentRegistry: IAgentRegistry)`.
  - `getState(): OrchestratorState`.
  - `pause(): Promise<void>`:
    - If already `"paused"`, return immediately.
    - Set internal state to `"paused"`.
    - Call `agentRegistry.signalPause()` — each agent checks this signal at its loop boundary and completes its current atomic step before stopping.
    - Await `agentRegistry.awaitAllIdle()` — waits until all agents have acknowledged the pause.
    - Serialize the current run state via `stateStore.saveSnapshot(snapshot)`.
    - Emit `orchestrator:paused` on `eventBus`.
  - `resume(): Promise<void>`:
    - If already `"running"`, return immediately.
    - Load snapshot via `stateStore.loadSnapshot()`.
    - Set internal state to `"running"`.
    - Call `agentRegistry.restoreFromSnapshot(snapshot)` and `agentRegistry.signalResume()`.
    - Emit `orchestrator:resumed` on `eventBus`.
- [ ] Define `IStateStore` interface in `packages/core/src/persistence/IStateStore.ts` with `saveSnapshot(snapshot: RunStateSnapshot): Promise<void>` and `loadSnapshot(): Promise<RunStateSnapshot | null>`.
- [ ] Implement `FileStateStore` in `packages/core/src/persistence/FileStateStore.ts` that serializes `RunStateSnapshot` as JSON to `<workspace>/.devs/state_snapshot.json`.
- [ ] Define `RunStateSnapshot` type in `packages/types/src/RunStateSnapshot.ts`: `{ pausedAt: number; activeAgents: AgentState[]; pendingTasks: TaskState[] }`.
- [ ] Expose `pause()` and `resume()` on the `Orchestrator` by delegating to the `PauseResumeController`.

## 3. Code Review
- [ ] Confirm `agentRegistry.awaitAllIdle()` has a configurable timeout (default: 30 seconds) to prevent hanging if an agent is stuck.
- [ ] Verify the `FileStateStore` write is atomic (write to a temp file then rename) to prevent partial state corruption.
- [ ] Confirm the `PauseResumeController` does not hold strong references to agent objects — use IDs and the registry for lookup.
- [ ] Ensure the `orchestrator:paused` and `orchestrator:resumed` events are emitted after the state is fully consistent (after `awaitAllIdle` and `saveSnapshot` complete).

## 4. Run Automated Tests to Verify
- [ ] Run `pnpm --filter @devs/core test -- --testPathPattern="PauseResumeController"` and confirm 0 failures.
- [ ] Run `pnpm --filter @devs/core test:coverage` and confirm `PauseResumeController.ts` and `FileStateStore.ts` have ≥ 90% branch coverage.

## 5. Update Documentation
- [ ] Create `packages/core/src/orchestrator/PauseResumeController.agent.md` documenting:
  - State machine diagram (Mermaid): `running → paused → running`.
  - The pause sequence (signal → await idle → snapshot → emit event).
  - The resume sequence (load snapshot → restore → signal resume → emit event).
  - The `RunStateSnapshot` schema.
- [ ] Create `packages/core/src/persistence/FileStateStore.agent.md` documenting the storage path and atomic write strategy.

## 6. Automated Verification
- [ ] Run `pnpm --filter @devs/core test -- --testPathPattern="PauseResumeController" --json --outputFile=/tmp/pause_resume_controller_results.json` and confirm `"numFailedTests": 0`.
- [ ] Run `grep -rn "PauseResumeController" packages/core/src/orchestrator/Orchestrator.ts` and confirm it is instantiated and wired (exit code 0).
