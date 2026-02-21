# Task: Implement ScaleTrace Utility for Agent Log Archival (Sub-Epic: 15_Off-Main-Thread Performance Optimization)

## Covered Requirements
- [8_RISKS-REQ-035], [8_RISKS-REQ-128]

## 1. Initial Test Written
- [ ] Create `src/tracing/__tests__/scale-trace.test.ts` using Vitest.
- [ ] Write a unit test for `ScaleTrace.checkSize(logPath)`: mock `fs.stat` to return `{ size: 50_000_000 }` (50MB) and assert the function returns `{ shouldArchive: false, sizeBytes: 50_000_000 }`.
- [ ] Write a unit test where `fs.stat` returns `{ size: 110_000_000 }` (110MB, > 100MB threshold) and assert `{ shouldArchive: true, sizeBytes: 110_000_000 }`.
- [ ] Write an integration test that writes 101MB of synthetic JSON log entries to a temp file, calls `ScaleTrace.archive(tempLogPath, archiveDir)`, and asserts:
  - A `.json.gz` archive file exists in `archiveDir`.
  - The archive decompresses to valid JSON.
  - The original log file is truncated (size = 0) after archival.
- [ ] Write a test that confirms `ScaleTrace.archive()` runs inside a Worker Thread: mock `WorkerPool.run` and assert it is called with `'scale-trace'` task type (not executing compression on the main thread).
- [ ] Write a test asserting that if `archive()` fails (e.g., disk full), the original log file is **not** corrupted or deleted — it remains intact.
- [ ] Write a test for `ScaleTrace.watchDirectory(logDir)`: given a mock `FSWatcher`, assert a `'log-archived'` event is emitted when the log file exceeds 100MB and archival completes successfully.

## 2. Task Implementation
- [ ] Create `src/tracing/scale-trace.ts` exporting `ScaleTrace` class:
  - `checkSize(logPath: string): Promise<{ shouldArchive: boolean; sizeBytes: number }>` — uses `fs.promises.stat`. Threshold: 100MB (`100 * 1024 * 1024` bytes). Annotate: `// [8_RISKS-REQ-035] Heavy I/O operations run off-main-thread. [8_RISKS-REQ-128] Prevents log file growth from bloating extension memory`.
  - `archive(logPath: string, archiveDir: string): Promise<string>` — delegates to `WorkerBridge.post<string>('scale-trace', { logPath, archiveDir })`. Returns the path of the created archive file.
  - `watchDirectory(logDir: string): FSWatcher` — creates a `chokidar` watcher (or `fs.watch`) that checks the primary log file size every 5 minutes and triggers `archive()` when threshold exceeded. Emits `'log-archived'` with `{ archivePath }` on success.
  - Extends `EventEmitter`.
- [ ] Create `src/workers/scale-trace.worker.ts`:
  - Handle `'scale-trace'` message type with payload `{ logPath: string; archiveDir: string }`.
  - Archive algorithm:
    1. Read `logPath` as a stream.
    2. Pipe through `zlib.createGzip()`.
    3. Write to `archiveDir/<timestamp>_agent_logs.json.gz`.
    4. On successful write, truncate the original log file to 0 bytes (`fs.promises.truncate(logPath, 0)`).
    5. Post `{ id, result: archivePath }` on success.
  - Use streaming (not `readFileSync`) to avoid loading 100MB+ into worker memory at once.
  - Annotate: `// [8_RISKS-REQ-035] Log archival runs in a Worker Thread to avoid blocking the main thread`.
- [ ] Register `ScaleTrace` singleton in `src/extension.ts`; call `scaleTrace.watchDirectory(logDir)` at activation, and `scaleTrace.removeAllListeners()` at deactivation.
- [ ] Ensure the archive directory defaults to `~/.devs/archives/` and is created with `fs.promises.mkdir(..., { recursive: true })` if absent.

## 3. Code Review
- [ ] Verify `archive()` uses streaming (not `Buffer` / `readFileSync`) in the worker to handle files > 100MB without OOM risk.
- [ ] Confirm the truncation step in the worker only executes **after** the gzip write stream has closed successfully (use the `'finish'` event).
- [ ] Verify the error path: if the gzip write fails, the original log must remain intact — confirm the truncation step is inside the `'finish'` handler, not in a `finally` block.
- [ ] Confirm `watchDirectory` polling interval of 5 minutes is configurable via a `checkIntervalMs` option (default `300_000`).
- [ ] Verify `// [8_RISKS-REQ-035]` and `// [8_RISKS-REQ-128]` annotations are present on `archive()` and the worker script.
- [ ] Confirm the watcher is properly cleaned up (`.close()` called) during extension deactivation to prevent resource leaks.

## 4. Run Automated Tests to Verify
- [ ] Run `pnpm test src/tracing/__tests__/scale-trace.test.ts` and confirm all tests pass.
- [ ] Run `pnpm test --coverage src/tracing/` and confirm coverage ≥ 85%.
- [ ] Run `pnpm run test:integration` and confirm no regressions in trace logging or archival behaviour.

## 5. Update Documentation
- [ ] Add a `### ScaleTrace Log Archival` section to `docs/architecture/performance.md`, documenting the 100MB threshold, the streaming gzip algorithm, the Worker Thread delegation, and the watch interval.
- [ ] Update `docs/agent-memory/phase_14_decisions.md` with: "ScaleTrace archives `agent_logs` > 100MB to compressed `.json.gz` in `~/.devs/archives/`. Archival runs in `scale-trace.worker.ts`. Main log file is truncated (not deleted) post-archive. Watcher interval: 5 minutes."
- [ ] Add the `ScaleTrace` watchDirectory setup to the extension activation sequence documentation in `docs/architecture/extension-lifecycle.md`.

## 6. Automated Verification
- [ ] Run `pnpm test src/tracing/__tests__/scale-trace.test.ts --reporter=json > /tmp/scale-trace-results.json && node -e "const r=require('/tmp/scale-trace-results.json'); if(r.numFailedTests>0) process.exit(1)"` and assert exit code 0.
- [ ] Run `grep -n "8_RISKS-REQ-035\|8_RISKS-REQ-128" src/tracing/scale-trace.ts` and assert at least 2 annotated lines.
- [ ] Run `grep -n "WorkerBridge.post" src/tracing/scale-trace.ts` and assert at least 1 match (confirming delegation to worker thread).
