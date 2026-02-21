# Task: Integrate `TieredMemoryManager` into the Agent Runtime and Validate End-to-End (Sub-Epic: 03_Tiered_Memory_Architecture)

## Covered Requirements
- [TAS-100], [1_PRD-REQ-GOAL-007], [4_USER_FEATURES-REQ-017]

## 1. Initial Test Written
- [ ] Create `packages/core/src/__tests__/integration/tiered-memory-integration.test.ts`.
- [ ] This is an **integration test** that uses real `InContextMemory` and `SqliteMediumTermMemory` (with `:memory:` SQLite) but mocks `LanceDbLongTermMemory` to avoid network/filesystem calls.
- [ ] Write tests covering the full agent task lifecycle:
  - Before a task starts: `shortTerm.snapshot()` is empty.
  - During a task: agent sets active file paths and tool outputs in `shortTerm` via `set`.
  - At task end: `manager.promote(entry, 'medium')` appends the task summary to SQLite; `manager.flush()` clears short-term memory.
  - After flush: `shortTerm.snapshot()` is empty again; `mediumTerm.query({})` returns the promoted entry.
  - Architectural decision promotion: `manager.promote(decision, 'long')` calls `longTerm.upsert` with the correct `MemoryDocument` fields.
- [ ] Write a test verifying that if `promote` throws (simulated by making the mock throw), the error propagates to the caller (not swallowed).
- [ ] All tests must fail (red) before wiring is complete.

## 2. Task Implementation
- [ ] In `packages/core/src/agent-runtime/AgentRuntime.ts` (or equivalent runtime bootstrap file):
  - Import `createTieredMemoryManager` from `@devs/memory`.
  - In the runtime initialization block, call `createTieredMemoryManager({ sqliteDb: openDatabase('.devs/state.sqlite'), lanceDbPath: '.devs/memory.lancedb' })` and assign the result to `this.memory`.
  - Expose `this.memory` as a readonly property of type `ITieredMemoryManager`.
- [ ] At the start of each task loop iteration: inject the active task's file paths and goal into `this.memory.shortTerm`.
- [ ] At the end of each successful task loop iteration:
  - Construct a `MemoryEntry` from the task summary (id: task id, content: task result summary, tags: `['task', epicId]`, createdAt: `new Date()`).
  - Call `this.memory.promote(entry, 'medium')`.
  - Call `this.memory.flush()`.
- [ ] When a task produces an architectural decision or RCA: call `this.memory.promote(decisionEntry, 'long')`.
- [ ] Ensure the `.devs/memory.lancedb` directory path is created if it does not exist (`fs.mkdirSync(..., { recursive: true })`).

## 3. Code Review
- [ ] Verify the `AgentRuntime` holds a reference to `ITieredMemoryManager` (the interface), not the concrete `TieredMemoryManager` class.
- [ ] Verify that `flush` is always called in a `finally` block (or equivalent) so short-term memory is cleared even if a task fails.
- [ ] Confirm that `promote('long')` is only called for explicitly designated architectural decisions, not for every task.
- [ ] Verify the `.devs/` directory creation logic is idempotent and uses `recursive: true` to avoid errors if the path already exists.

## 4. Run Automated Tests to Verify
- [ ] Run `npm run test --workspace=packages/core -- --testPathPattern=tiered-memory-integration`
- [ ] Confirm all integration tests pass (green).
- [ ] Run `npm run test` (full monorepo suite) and confirm no regressions.
- [ ] Run `npm run build` (full monorepo) and confirm zero TypeScript errors.

## 5. Update Documentation
- [ ] Update `packages/core/src/agent-runtime/agent-runtime.agent.md` (create if absent) to document:
  - That `AgentRuntime` owns and initializes a `TieredMemoryManager`.
  - The task lifecycle memory operations: short-term injection at task start, medium-term promotion at task end, flush after promote.
  - When long-term promotion is triggered (architectural decisions, RCAs).
  - The `.devs/` directory layout: `state.sqlite` and `memory.lancedb`.

## 6. Automated Verification
- [ ] Run `npm run test --reporter=json 2>&1 | node -e "const d=require('fs').readFileSync('/dev/stdin','utf8'); const r=JSON.parse(d); process.exit(r.numFailedTests > 0 ? 1 : 0)"` and assert exit code is `0`.
- [ ] Run `npm run build 2>&1 | grep -c "error TS"` and assert output is `0`.
- [ ] Run the CLI command `devs run --dry-run` (if available) and confirm it exits with code `0` without crashing during memory initialization.
