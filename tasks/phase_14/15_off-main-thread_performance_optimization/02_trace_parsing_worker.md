# Task: Move Trace Parsing to Worker Thread (Sub-Epic: 15_Off-Main-Thread Performance Optimization)

## Covered Requirements
- [8_RISKS-REQ-035], [8_RISKS-REQ-128]

## 1. Initial Test Written
- [ ] Create `src/workers/__tests__/trace-parser-worker.test.ts` using Vitest.
- [ ] Write a unit test mocking `WorkerBridge` that calls `parseTrace(rawTraceJson)` and asserts it returns the correct structured `AgentTrace` object — verify the call is delegated to `WorkerBridge.post('parse-trace', ...)` and NOT executed inline.
- [ ] Write an integration test that invokes the real `trace-parser.worker.ts` script via a `WorkerPool` instance with a 500-line synthetic trace JSON string; assert the result contains the correct `steps`, `duration`, and `tokenUsage` fields.
- [ ] Write a regression test: call `parseTrace()` with malformed JSON and assert the returned `Promise` rejects with a `TraceParseError` (never crashes the main thread).
- [ ] Write a performance test using `performance.now()`: parsing a 10,000-line trace string must complete (from `WorkerBridge.post` call to resolved promise) in < 2000ms.
- [ ] Write a test that calls `parseTrace()` 50 times concurrently and verifies every promise resolves without error, confirming the pool handles bursts correctly.

## 2. Task Implementation
- [ ] Create `src/workers/trace-parser.worker.ts` — the worker script.
  - Import and re-export `parseTraceSync(raw: string): AgentTrace` from `src/tracing/trace-parser.ts` (the existing synchronous parser).
  - Wire `parentPort?.on('message', ({ id, payload }) => { ... })` to call `parseTraceSync`, then `parentPort.postMessage({ id, result })` on success or `parentPort.postMessage({ id, error: err.message })` on failure.
  - Annotate: `// [8_RISKS-REQ-035] All trace parsing runs off-main-thread`.
- [ ] Create `src/tracing/trace-parser-bridge.ts` exporting:
  ```ts
  // [8_RISKS-REQ-035] [8_RISKS-REQ-128]
  export async function parseTrace(raw: string): Promise<AgentTrace>
  ```
  This function calls `WorkerBridge.post<AgentTrace>('parse-trace', raw)` using a shared singleton `WorkerPool` scoped to `trace-parser.worker.ts` (`maxWorkers: 2`).
- [ ] Locate every call site of the existing synchronous `parseTraceSync` in the main extension host / orchestrator code. Replace each with an `await parseTrace(raw)` call from `trace-parser-bridge.ts`. Affected files are likely `src/tracing/trace-manager.ts` and `src/dashboard/trace-view.ts`.
- [ ] Ensure the singleton `WorkerPool` for trace parsing is initialized lazily on first call and registered for cleanup in `src/extension.ts` `deactivate()` via `traceParserPool.drain()`.

## 3. Code Review
- [ ] Verify that `src/tracing/trace-manager.ts` contains **zero** direct calls to `parseTraceSync` — only `await parseTrace(...)`.
- [ ] Confirm `trace-parser.worker.ts` has **no** imports from `vscode` or any VSCode-specific module.
- [ ] Verify that errors from the worker propagate as rejected `Promise`s (not unhandled rejections) and are caught at the call site with appropriate logging.
- [ ] Confirm the worker pool `maxWorkers: 2` cap is justified in a code comment (trace parsing is memory-intensive; more than 2 concurrent parsers risks OOM under the VSCode extension host).
- [ ] Verify `deactivate()` calls `drain()` and the integration test confirms no lingering worker threads remain after drain.

## 4. Run Automated Tests to Verify
- [ ] Run `pnpm test src/workers/__tests__/trace-parser-worker.test.ts` and confirm all tests pass.
- [ ] Run `pnpm test --coverage src/tracing/` and confirm coverage ≥ 85%.
- [ ] Run the full VSCode extension integration test suite: `pnpm run test:integration` — confirm no regressions in trace display functionality.

## 5. Update Documentation
- [ ] Update `docs/architecture/performance.md`: add a `### Trace Parsing` subsection documenting the worker script path, pool sizing rationale (`maxWorkers: 2`), and the `parseTrace()` public API.
- [ ] Update `docs/agent-memory/phase_14_decisions.md` with: "Trace parsing moved to `trace-parser.worker.ts` worker pool. Main thread MUST NOT call `parseTraceSync` directly after Phase 14."
- [ ] Add a `@remarks` JSDoc comment to `parseTrace()` in `trace-parser-bridge.ts` explaining the off-main-thread delegation.

## 6. Automated Verification
- [ ] Run `grep -rn "parseTraceSync" src/ --include="*.ts" | grep -v "trace-parser.ts" | grep -v "trace-parser.worker.ts" | grep -v ".test.ts"` and assert **zero** matches.
- [ ] Run `pnpm test src/workers/__tests__/trace-parser-worker.test.ts --reporter=json > /tmp/trace-parser-results.json && node -e "const r=require('/tmp/trace-parser-results.json'); if(r.numFailedTests>0) process.exit(1)"` and assert exit code 0.
