# Task: Implement Docker Container Warm Pool for Sandbox Latency Reduction (Sub-Epic: 11_Sandbox and Failure Preservation)

## Covered Requirements
- [3_MCP-RISK-301], [RISK-401]

## 1. Initial Test Written

- [ ] Write unit tests in `src/sandbox/__tests__/warm-pool.test.ts`:
  - Mock `dockerode`'s `createContainer` and `container.start()`.
  - Assert `WarmPool.initialize({ minSize: 2, image: 'devs-sandbox:latest' })` creates and starts exactly 2 containers on startup.
  - Assert `WarmPool.acquire()` returns a container within 10ms when the pool has available containers (no Docker call needed).
  - Assert `WarmPool.acquire()` blocks (or enqueues) and eventually resolves when a container is returned via `WarmPool.release(container)` after the pool is temporarily exhausted.
  - Assert `WarmPool.release(container)` resets the container (via a mock `SandboxResetter.reset(container)`) and returns it to the available pool.
  - Assert `WarmPool.drain()` stops and removes all pooled containers and resolves cleanly.
  - Assert pool size auto-scales up (creates new containers) when `pendingWaiters > 0` and `activeContainers < maxSize`.
- [ ] Write integration tests in `src/sandbox/__tests__/warm-pool.integration.test.ts` (requires Docker):
  - Initialize a pool with `minSize: 1, maxSize: 3, image: 'alpine:latest'`.
  - `acquire()` a container, run `echo hello` inside it, `release()` it.
  - Assert re-acquired container is a live container (not re-created) by checking the container ID is identical.
  - Assert total Docker `createContainer` calls equal `minSize` for the test (no extra containers created for a single acquire/release cycle).
  - Measure `acquire()` latency: assert < 50ms for a pre-warmed container vs. > 500ms for cold start.

## 2. Task Implementation

- [ ] Create `src/sandbox/warm-pool.ts` exporting the `WarmPool` class (singleton):
  ```typescript
  class WarmPool {
    static async initialize(config: WarmPoolConfig): Promise<void>
    static async acquire(): Promise<PooledContainer>
    static async release(container: PooledContainer): Promise<void>
    static async drain(): Promise<void>
    static getMetrics(): WarmPoolMetrics
  }
  ```
  - Internal state: `available: PooledContainer[]`, `inUse: Set<PooledContainer>`, `waiters: Array<(c: PooledContainer) => void>`.
  - `acquire()`: if `available.length > 0`, pop and return; else enqueue a promise resolver in `waiters` and return the promise.
  - `release(container)`: call `SandboxResetter.reset(container)` (clean working dir, reset env), then if `waiters.length > 0` dequeue and fulfill; else push to `available`.
  - Auto-scale: after `acquire()` drains the pool, if `activeContainers < maxSize`, create one additional container asynchronously and push to `available`.
- [ ] Define `WarmPoolConfig` interface in `src/sandbox/types.ts`:
  ```typescript
  interface WarmPoolConfig {
    minSize: number;       // default: 2
    maxSize: number;       // default: 5
    image: string;         // e.g., 'devs-sandbox:latest'
    idleTimeoutMs: number; // default: 300_000 (5 min) — destroy idle containers
  }
  ```
- [ ] Create `src/sandbox/sandbox-resetter.ts` exporting `SandboxResetter`:
  - `reset(container: PooledContainer): Promise<void>` — executes `rm -rf /workspace/*` inside the container and resets environment variables to the base image defaults using `container.exec(...)`.
- [ ] Create `src/sandbox/warm-pool-metrics.ts` tracking: `totalAcquires`, `cacheHits`, `cacheMisses`, `avgAcquireLatencyMs`, `currentPoolSize`, `currentInUse`. Expose via `WarmPool.getMetrics()`.
- [ ] Integrate `WarmPool` into `src/orchestration/implementation-loop.ts`: replace direct `DockerSandbox.create()` calls with `await WarmPool.acquire()` / `WarmPool.release()`.
- [ ] Initialize `WarmPool` in `src/index.ts` (application startup) using config from `devs.config.ts` field `sandbox.warmPool`.
- [ ] Implement idle container eviction: a background interval (every 60s) checks `available` containers that have been idle > `idleTimeoutMs` and destroys them if pool size > `minSize`.

## 3. Code Review

- [ ] Confirm `acquire()` is non-blocking for other concurrent tasks when the pool has capacity — pool operations must use a mutex or atomic queue, not `async_hooks` or global locks that serialize all tasks.
- [ ] Confirm `SandboxResetter.reset()` covers: clearing `/workspace`, removing any generated files, and restoring the process table (kill orphaned processes inside the container via `pkill -9 -f` or restarting container).
- [ ] Confirm `drain()` is called on process `SIGTERM` / `SIGINT` (graceful shutdown) to prevent container leaks.
- [ ] Confirm `WarmPoolMetrics` are emitted to the project's observability layer (e.g., OpenTelemetry counter/histogram) for KPI tracking per `[9_ROADMAP-REQ-047]`.
- [ ] Confirm `maxSize` is enforced: `acquire()` must never allow more than `maxSize` containers to be simultaneously in use.

## 4. Run Automated Tests to Verify

- [ ] Run: `npx vitest run src/sandbox/__tests__/warm-pool.test.ts`
- [ ] Run: `npx vitest run src/sandbox/__tests__/warm-pool.integration.test.ts`
- [ ] Run the full orchestration test suite: `npx vitest run src/orchestration/` and confirm no regressions.
- [ ] Manually verify metrics: start the application with `LOG_LEVEL=debug node dist/index.js`, trigger one task execution, and grep logs for `WarmPool metrics` output.

## 5. Update Documentation

- [ ] Add section `## Container Warm Pool` to `docs/sandbox-architecture.md`:
  - Explain the warm pool pattern and why it reduces latency.
  - Document `devs.config.ts` fields: `sandbox.warmPool.minSize`, `sandbox.warmPool.maxSize`, `sandbox.warmPool.idleTimeoutMs`.
  - Document `WarmPool.getMetrics()` and how to query metrics via the MCP `get_sandbox_metrics` tool.
- [ ] Update `docs/agent-memory/phase_13.md`: "All sandbox container provisioning goes through `WarmPool.acquire()`. Never call `DockerSandbox.create()` directly in the implementation loop. Always `WarmPool.release()` in a `finally` block."

## 6. Automated Verification

- [ ] Run `npx vitest run --reporter=json src/sandbox/__tests__/warm-pool.test.ts | jq '.numFailedTests == 0'` — assert `true`.
- [ ] Run the integration test and assert acquire latency for cache hit < 50ms: integration test must include an explicit assertion on `acquireLatencyMs < 50`.
- [ ] Run `grep -n "DockerSandbox.create" src/orchestration/implementation-loop.ts` — assert zero matches (all direct calls replaced by `WarmPool.acquire()`).
- [ ] Run `grep -n "WarmPool.release" src/orchestration/implementation-loop.ts` — assert it appears inside a `finally` block.
