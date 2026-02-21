# Task: Implement the Flight Recorder and Real-Time Trace Log Writer (Sub-Epic: 10_Observability & Real-Time Tracing)

## Covered Requirements
- [1_PRD-REQ-OBS-003], [1_PRD-REQ-NEED-DEVS-01]

## 1. Initial Test Written

- [ ] In `packages/core/src/observability/__tests__/flight-recorder.test.ts`, write tests for `FlightRecorder`:
  - Test that `FlightRecorder.getInstance()` returns a singleton across multiple calls.
  - Test that `record(envelope: SAOPEnvelope)` appends a newline-delimited JSON (NDJSON) entry to `.devs/trace.log` within 50 ms of being called (use a temp directory fixture).
  - Test that each written line is valid JSON and round-trips back to an identical `SAOPEnvelope` object after `JSON.parse`.
  - Test that the log file is created if it does not exist, and is appended to (not overwritten) if it does exist.
  - Test that calling `record()` concurrently with 100 rapid calls does not corrupt the file (no interleaved partial lines).
  - Test that `FlightRecorder.flush()` returns a `Promise<void>` that resolves only after all pending writes are persisted (verified by checking file size after await).
  - Test that if the `.devs/` directory does not exist, `FlightRecorder` creates it automatically.
  - Test that `record()` does not throw when `stdout`/`stderr` fields in the envelope observation contain binary-encoded Base64 strings.

## 2. Task Implementation

- [ ] Create `packages/core/src/observability/flight-recorder.ts`:
  - Implement the `FlightRecorder` class as a thread-safe singleton using a module-level `let instance` pattern.
  - Constructor accepts `logDir: string` (default: `path.join(process.cwd(), '.devs')`) and `logFileName: string` (default: `'trace.log'`).
  - On instantiation, create `logDir` recursively via `fs.mkdirSync(logDir, { recursive: true })`.
  - Open a `fs.createWriteStream(logPath, { flags: 'a', encoding: 'utf8' })` for appending.
  - Implement `record(envelope: SAOPEnvelope): void`:
    - Serialize `envelope` to JSON: `JSON.stringify(envelope) + '\n'`.
    - Write to the stream using `stream.write(line)`.
    - If write returns `false` (backpressure), push the next write onto an internal queue awaited on the `'drain'` event (implement a `WriteQueue` using `async-mutex` or a simple `Promise` chain to prevent interleaving).
  - Implement `async flush(): Promise<void>`:
    - Drain the internal write queue.
    - Return a promise that resolves on the stream `'finish'` event after calling `stream.end()` – or, if keeping the stream open, use a `Promise` that resolves once the last queued write is confirmed.
  - Implement `close(): Promise<void>` that calls `stream.end()` and resolves on `'close'`.
  - Export `getFlightRecorder(logDir?: string): FlightRecorder` factory that returns the singleton, initializing it lazily.
- [ ] Export from `packages/core/src/observability/index.ts`.

## 3. Code Review

- [ ] Confirm the write queue prevents any two `JSON.stringify` outputs from being interleaved in the log file under concurrent access.
- [ ] Confirm the stream is opened with `flags: 'a'` (append mode), never `'w'`.
- [ ] Confirm `FlightRecorder` does not import from `@devs/sandbox` or `@devs/vscode` (no circular deps).
- [ ] Confirm the log path is resolved relative to the project root, not the package root, to ensure `.devs/trace.log` always lands at the workspace root.
- [ ] Confirm `flush()` is safe to call multiple times without throwing.

## 4. Run Automated Tests to Verify

- [ ] Run `pnpm --filter @devs/core test -- --testPathPattern=flight-recorder` and confirm all tests pass with exit code 0.
- [ ] Run `pnpm --filter @devs/core tsc --noEmit` to confirm no TypeScript compile errors.

## 5. Update Documentation

- [ ] Add JSDoc comments to `FlightRecorder` class, `record()`, `flush()`, and `close()` methods.
- [ ] In `docs/agent-memory/observability.md` (create if absent), document the `.devs/trace.log` format: NDJSON, one `SAOPEnvelope` per line, UTF-8, append-only.
- [ ] Update `docs/agent-memory/observability.md` with a note that `1_PRD-REQ-OBS-003` is satisfied by this component and that ALL agent-to-agent communications (satisfying `1_PRD-REQ-NEED-DEVS-01`) flow through `FlightRecorder`.
- [ ] Add `.devs/trace.log` to the root `.gitignore` if not already present.

## 6. Automated Verification

- [ ] Run `pnpm --filter @devs/core test -- --coverage --testPathPattern=flight-recorder` and assert line coverage ≥ 95% for `flight-recorder.ts`.
- [ ] Execute the following integration smoke test script and confirm it exits 0:
  ```bash
  node -e "
  const {getFlightRecorder} = require('./packages/core/dist/observability');
  const os = require('os'), path = require('path'), fs = require('fs');
  const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'fr-test-'));
  const fr = getFlightRecorder(tmp);
  const env = {type:'thought', turn_index:1, payload:{analysis:{reasoning_chain:'test'}}, timestamp_ns:'0'};
  fr.record(env);
  fr.flush().then(() => {
    const lines = fs.readFileSync(path.join(tmp,'trace.log'),'utf8').trim().split('\n');
    console.assert(lines.length === 1, 'Expected 1 line');
    console.assert(JSON.parse(lines[0]).type === 'thought', 'Expected thought type');
    console.log('PASS');
  });
  "
  ```
