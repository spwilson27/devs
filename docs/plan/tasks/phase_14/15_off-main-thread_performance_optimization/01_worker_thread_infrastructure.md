# Task: Establish Worker Thread Infrastructure for Off-Main-Thread Processing (Sub-Epic: 15_Off-Main-Thread Performance Optimization)

## Covered Requirements
- [8_RISKS-REQ-035], [8_RISKS-REQ-128]

## 1. Initial Test Written
- [ ] Create `src/workers/__tests__/worker-pool.test.ts` using Vitest.
- [ ] Write a unit test that instantiates `WorkerPool` with `minWorkers: 1, maxWorkers: 4` and verifies the pool starts with the configured minimum number of idle workers.
- [ ] Write a unit test that submits a lightweight task to `WorkerPool.run()` and asserts the returned `Promise` resolves with the expected value within 500ms.
- [ ] Write a unit test that submits 10 concurrent tasks to a `WorkerPool` with `maxWorkers: 2` and verifies no more than 2 workers are ever alive simultaneously (spy on `new Worker()` call count).
- [ ] Write a unit test that calls `WorkerPool.drain()` and asserts all in-flight tasks resolve before the pool shuts down.
- [ ] Write a unit test for the `WorkerBridge` helper: calling `WorkerBridge.post(taskType, payload)` must return a typed `Promise<Result>` and the worker must receive a `{ type, id, payload }` envelope.
- [ ] Write an integration test that spawns a real worker script, sends a round-trip `ping` message, and asserts the main thread receives `pong` within 1 second.
- [ ] Write a test asserting that if a worker throws an unhandled error, the corresponding `WorkerPool.run()` promise rejects with that error and the worker is removed from the pool.

## 2. Task Implementation
- [ ] Create `src/workers/worker-pool.ts` exporting a generic `WorkerPool<TInput, TOutput>` class.
  - Constructor options: `{ scriptPath: string; minWorkers?: number; maxWorkers?: number; idleTimeoutMs?: number }`.
  - Maintain a queue of pending tasks. When a task arrives and an idle worker exists, dispatch immediately; otherwise enqueue or spawn a new worker up to `maxWorkers`.
  - Each spawned `Worker` instance receives `{ workerData: { scriptPath } }` so a thin runner can import the user script dynamically.
  - Assign each in-flight task a UUID so response messages can be matched via `{ id, result }` or `{ id, error }` envelopes.
  - Implement `drain(): Promise<void>` — resolves when the task queue is empty and all workers are idle; terminates idle workers beyond `minWorkers`.
- [ ] Create `src/workers/worker-bridge.ts` exporting `WorkerBridge` — a thin façade that wraps `WorkerPool` and provides `post<T>(type: string, payload: unknown): Promise<T>`.
- [ ] Create `src/workers/runner.ts` — the thin entry-point script that all pooled workers use. It reads `workerData.scriptPath`, dynamically imports the module, and wires `parentPort` message handling.
- [ ] Add the `"worker_threads"` import only inside `worker-pool.ts` so the module graph remains compatible with Jest/Vitest running in the main thread (use `import { Worker, isMainThread, parentPort, workerData } from 'worker_threads'`).
- [ ] Export everything from `src/workers/index.ts`.
- [ ] Annotate each public method with the requirement tag: `// [8_RISKS-REQ-035] [8_RISKS-REQ-128]`.

## 3. Code Review
- [ ] Confirm there are **no** synchronous blocking calls (e.g. `fs.readFileSync`) inside the main-thread pool management code.
- [ ] Verify `WorkerPool` uses `TypeScript` generics correctly — `run(payload: TInput): Promise<TOutput>` should be fully typed with no `any`.
- [ ] Confirm the pool does not leak worker threads: all exit paths (task success, task error, `drain`) terminate workers that exceed `minWorkers`.
- [ ] Check that the `id` correlation mechanism handles concurrent in-flight messages without collision (use `crypto.randomUUID()`).
- [ ] Ensure the worker runner (`runner.ts`) never imports VSCode APIs, keeping workers environment-agnostic.
- [ ] Verify all `// [REQ-ID]` comment annotations are present on public API surfaces.

## 4. Run Automated Tests to Verify
- [ ] Run `pnpm test src/workers/__tests__/worker-pool.test.ts` and confirm all tests pass with zero failures.
- [ ] Run `pnpm test --coverage src/workers/` and confirm line coverage ≥ 90%.
- [ ] Confirm the test suite completes in < 10 seconds wall-clock time.

## 5. Update Documentation
- [ ] Add a `## Worker Thread Infrastructure` section to `docs/architecture/performance.md` (create the file if absent) describing `WorkerPool`, `WorkerBridge`, and `runner.ts`, including a Mermaid sequence diagram showing the main-thread ↔ worker message protocol.
- [ ] Update `docs/agent-memory/phase_14_decisions.md` with an entry: "Off-main-thread strategy: WorkerPool + WorkerBridge pattern adopted. All CPU-intensive operations MUST use `WorkerBridge.post()` rather than running inline."
- [ ] Add a short usage example to `src/workers/index.ts` JSDoc comment block.

## 6. Automated Verification
- [ ] Run `pnpm test src/workers/__tests__/worker-pool.test.ts --reporter=json > /tmp/worker-pool-results.json && node -e "const r=require('/tmp/worker-pool-results.json'); if(r.numFailedTests>0) process.exit(1)"` and assert exit code 0.
- [ ] Run `grep -r "new Worker(" src/ --include="*.ts" | grep -v "worker-pool.ts" | grep -v ".test.ts"` and assert **zero** matches — confirming no code outside the pool spawns raw workers.
