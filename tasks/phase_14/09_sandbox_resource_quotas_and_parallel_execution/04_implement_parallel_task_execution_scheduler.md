# Task: Implement Parallel Task Execution Scheduler for Independent Epic Tasks (Sub-Epic: 09_Sandbox Resource Quotas and Parallel Execution)

## Covered Requirements
- [1_PRD-REQ-PERF-003]

## 1. Initial Test Written
- [ ] Create `src/orchestrator/__tests__/ParallelTaskScheduler.test.ts`.
- [ ] Write test `identifies_independent_tasks_from_dag` that:
  - Constructs a `TaskDAG` with tasks `[T1, T2, T3]` where `T3` depends on `T1` but `T2` has no dependencies.
  - Calls `ParallelTaskScheduler.getReadyTasks(dag, completedTaskIds: [])`.
  - Asserts the result is `[T1, T2]` (both tasks with no unmet dependencies).
- [ ] Write test `schedules_ready_tasks_into_sandboxes_concurrently` that:
  - Mocks `SandboxRunner.run` to return a resolved promise after 10ms.
  - Calls `scheduler.executeEpic(epicTasks, { maxParallel: 3 })`.
  - Asserts `SandboxRunner.run` was called concurrently for all independent tasks (using `Promise.all` timing).
- [ ] Write test `respects_max_parallel_limit` that:
  - Creates 5 independent tasks with `maxParallel: 2`.
  - Asserts no more than 2 `SandboxRunner.run` calls are in-flight simultaneously (use a counter incremented on start, decremented on finish).
- [ ] Write test `dependent_task_runs_only_after_dependency_completes` that:
  - Creates tasks `T1 → T2` where T2 depends on T1.
  - Asserts T2's sandbox is not started until T1's promise resolves.
- [ ] Write test `propagates_task_failure_and_cancels_dependents` that:
  - Creates tasks `T1 → T2` where T1 rejects.
  - Asserts T2 is never started and the scheduler rejects with a `TaskExecutionError` referencing T1's id.
- [ ] Confirm all tests fail (RED).

## 2. Task Implementation
- [ ] Create `src/orchestrator/ParallelTaskScheduler.ts`.
- [ ] Import `SandboxRunner`, `SandboxRunOptions` from `src/sandbox`.
- [ ] Define types:
  ```typescript
  interface ScheduledTask {
    id: string;
    dependsOn: string[];
    command: string;
    args?: string[];
    quota?: QuotaConfig;
  }
  interface EpicExecutionOptions {
    maxParallel?: number; // default: 4
    timeoutMs?: number;
  }
  ```
- [ ] Implement `static getReadyTasks(tasks: ScheduledTask[], completedIds: string[]): ScheduledTask[]`:
  - Return tasks where every `dependsOn` id is in `completedIds`.
- [ ] Implement `async executeEpic(tasks: ScheduledTask[], opts: EpicExecutionOptions = {}): Promise<void>`:
  - Use a concurrency-limited executor (e.g., a `p-limit`-style semaphore or manual implementation with a running-count counter — do NOT import external packages; implement inline).
  - Maintain `completed: Set<string>` and `failed: Set<string>`.
  - Loop: while there are unfinished tasks, pick `getReadyTasks` minus already-running/completed/failed, then dispatch up to remaining concurrency slots.
  - For each dispatched task, call `SandboxRunner.run({ sandboxId: task.id, command: task.command, ... })`.
  - On success: add to `completed`, continue loop.
  - On failure: add to `failed`; mark all transitive dependents as failed (do not start them).
  - After all dispatched promises settle, if `failed.size > 0` throw `TaskExecutionError`.
- [ ] Define `class TaskExecutionError extends Error` with `failedTaskIds: string[]` property.
- [ ] Add requirement tag: `// [1_PRD-REQ-PERF-003]`.

## 3. Code Review
- [ ] Verify the concurrency limiter is implemented without external dependencies (`p-limit` etc.) — use a simple counter pattern.
- [ ] Confirm the scheduler does not start dependent tasks if their dependency failed (transitive closure).
- [ ] Verify `getReadyTasks` is a pure function (no side effects) to make it independently testable.
- [ ] Check that the event loop is never blocked — all waits use `await` on promises, never synchronous spin-waits.
- [ ] Ensure `maxParallel` defaults to `4` to make use of typical multi-core machines without overwhelming the host.
- [ ] Confirm each sandbox gets a unique `sandboxId` (use `task.id` directly or prefix with epic id to avoid collisions).

## 4. Run Automated Tests to Verify
- [ ] Run `npx jest src/orchestrator/__tests__/ParallelTaskScheduler.test.ts --coverage` and confirm all tests GREEN with 100% branch coverage on `getReadyTasks` and `executeEpic`.
- [ ] Run the full test suite `npx jest --passWithNoTests` to confirm no regressions.

## 5. Update Documentation
- [ ] Create `src/orchestrator/orchestrator.agent.md` (or update if existing) with a section "## Parallel Execution" describing: DAG-driven task scheduling, `maxParallel` default (4), failure propagation, and the `TaskExecutionError` shape.
- [ ] Add `ParallelTaskScheduler`, `ScheduledTask`, `EpicExecutionOptions`, `TaskExecutionError` to `src/orchestrator/index.ts` exports.

## 6. Automated Verification
- [ ] Run `npx jest src/orchestrator/__tests__/ParallelTaskScheduler.test.ts --json --outputFile=test-results/parallel-scheduler.json` and verify `numFailedTests: 0`.
- [ ] Run `npx tsc --noEmit` and confirm zero TypeScript errors.
