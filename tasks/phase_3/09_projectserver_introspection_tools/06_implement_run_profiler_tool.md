# Task: Implement run_profiler Tool (Sub-Epic: 09_ProjectServer Introspection Tools)

## Covered Requirements
- [2_TAS-REQ-010], [1_PRD-REQ-SYS-004], [1_PRD-REQ-OBS-005], [1_PRD-REQ-NEED-DOMAIN-02]

## 1. Initial Test Written
- [ ] Create `packages/mcp-server/src/projectserver/__tests__/run-profiler.test.ts`.
- [ ] Mock `child_process.spawn`, Node's `v8.writeHeapSnapshot` / `inspector` module, and a `ProfilerAdapter` interface.
- [ ] Write unit tests for `runProfiler(params: { target: string; durationMs?: number; metrics: Array<"cpu" | "memory" | "heap"> })`:
  - `metrics: ["cpu"]` — spawns the target process with `--inspect` flag, starts CPU profiling for `durationMs` (default 5000 ms), stops profiling, and returns `ProfilerResult { ok: true, cpuProfile: { ... }, memoryTrace: undefined, heapSnapshot: undefined }`.
  - `metrics: ["memory"]` — collects RSS/heapUsed/heapTotal via periodic sampling (every 100 ms) for `durationMs` ms and returns `ProfilerResult { ok: true, memoryTrace: [{ timestamp, rss, heapUsed, heapTotal }], cpuProfile: undefined, heapSnapshot: undefined }`.
  - `metrics: ["heap"]` — writes a V8 heap snapshot and returns `ProfilerResult { ok: true, heapSnapshot: { path: string, sizeBytes: number }, cpuProfile: undefined, memoryTrace: undefined }`.
  - `metrics: ["cpu", "memory"]` — runs both collectors concurrently and returns both fields populated.
  - `target` that cannot be resolved — returns `ProfilerResult { ok: false, error: "Target not found: ..." }`.
  - Profiler running for longer than 300 seconds — returns `ProfilerResult { ok: false, error: "Profiler timeout" }`.
- [ ] Write an integration test that profiles a small Node.js script (`fixtures/cpu-intensive.js`) and asserts the returned `cpuProfile` has `nodes` and `samples` arrays.
- [ ] All tests must fail (RED) before implementation.

## 2. Task Implementation
- [ ] Define `ProfilerResult` interface in `packages/mcp-server/src/projectserver/types/profiler.ts`:
  ```ts
  interface ProfilerResult {
    ok: boolean;
    error?: string;
    cpuProfile?: { nodes: unknown[]; samples: number[]; timeDeltas: number[] };
    memoryTrace?: Array<{ timestamp: number; rss: number; heapUsed: number; heapTotal: number }>;
    heapSnapshot?: { path: string; sizeBytes: number };
  }
  ```
  Export this type and add its `zod` schema in `packages/mcp-server/src/projectserver/types/schemas.ts`.
- [ ] Create `packages/mcp-server/src/projectserver/tools/runProfiler.ts`:
  - Export `runProfiler(params: { target: string; durationMs?: number; metrics: Array<"cpu" | "memory" | "heap"> }, deps: { projectRoot: string; profilerAdapter?: ProfilerAdapter }): Promise<ProfilerResult>`.
  - Default `durationMs` is `5000`.
  - Hard cap `durationMs` at `300_000` (300 s); return `{ ok: false, error: "Profiler timeout" }` if exceeded.
  - Validate `target` with `_pathGuard` and check file existence before spawning.
  - For `cpu`: use Node.js `inspector` module to connect to a spawned child process's inspector port; start/stop CPU profiling; return the `Profile` object.
  - For `memory`: use `setInterval` to sample `process.memoryUsage()` from the child (via IPC or inspector); clear interval after `durationMs`.
  - For `heap`: use `v8.writeHeapSnapshot(outputPath)` on the child process's inspector session; stat the output file for `sizeBytes`.
  - If multiple metrics: run them concurrently with `Promise.all`.
- [ ] Define `ProfilerAdapter` interface in `packages/mcp-server/src/projectserver/tools/ProfilerAdapter.ts` to allow mocking in tests.
- [ ] Register `run_profiler` as an MCP tool with input schema:
  ```ts
  z.object({
    target: z.string(),
    durationMs: z.number().int().min(100).max(300_000).default(5000),
    metrics: z.array(z.enum(["cpu", "memory", "heap"])).min(1)
  })
  ```

## 3. Code Review
- [ ] Verify the inspector connection uses a dynamically assigned port (port 0) to avoid conflicts with other running processes.
- [ ] Verify child process is always killed in a `finally` block to prevent zombie processes.
- [ ] Verify heap snapshot files are written to a temp directory inside `projectRoot/.devs/profiler/` and path is included in the response so callers can retrieve them via `filesystem_operation`.
- [ ] Verify `memoryTrace` samples include `timestamp: Date.now()` for each entry (monotonic timestamps).
- [ ] Verify the 300-second hard cap applies to the total profiling session, not just per-metric.
- [ ] Verify no raw process PID assumptions — use `child.pid` with null-check.

## 4. Run Automated Tests to Verify
- [ ] Run `pnpm --filter @devs/mcp-server test -- --testPathPattern="run-profiler"` and confirm all tests pass (GREEN).
- [ ] Run `pnpm --filter @devs/mcp-server tsc --noEmit`.

## 5. Update Documentation
- [ ] Append to `packages/mcp-server/src/projectserver/tools/index.agent.md`:
  - Document `run_profiler` parameters, available metrics, and how to retrieve heap snapshots via `filesystem_operation`.
  - Explain the performance bottleneck diagnosis workflow (run profiler → read snapshot → inspect state).
  - List requirement IDs: `2_TAS-REQ-010`, `1_PRD-REQ-SYS-004`, `1_PRD-REQ-OBS-005`, `1_PRD-REQ-NEED-DOMAIN-02`.
- [ ] Create `packages/mcp-server/src/projectserver/tools/ProfilerAdapter.agent.md` documenting the adapter interface.

## 6. Automated Verification
- [ ] Run `pnpm --filter @devs/mcp-server test -- --ci --testPathPattern="run-profiler"` and assert exit code `0`.
- [ ] Run `grep -n "300_000\|finally\|inspector" packages/mcp-server/src/projectserver/tools/runProfiler.ts` and confirm all three identifiers appear.
