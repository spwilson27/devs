# Task: Implement Windowing Store & Chunk Trimming (Sub-Epic: 59_Log_Windowing_Core)

## Covered Requirements
- [6_UI_UX_ARCH-REQ-046], [6_UI_UX_ARCH-REQ-047]

## 1. Initial Test Written
- [ ] Create unit tests at tests/webview/console/windowingStore.test.ts covering the following cases (use Jest/Vitest):
  - append(entry) adds new LogEntry objects in chronological order and increments sequence counter.
  - When more than 500 lines are appended, the store trims oldest entries so store.length <= 500 and preserves order.
  - getWindow(startTs,endTs) returns the correct subset for boundary conditions (exact timestamp matches, no results, single-line windows).
  - getAround(seq, before, after) returns exactly before+after+1 entries and handles out-of-bounds gracefully.
  - Concurrent append + getWindow: simulate interleaved appends and queries and assert deterministic responses.

## 2. Task Implementation
- [ ] Implement a robust, well-typed WindowingStore at src/webview/console/windowingStore.ts with these concrete details:
  - Exported API (TypeScript):
    - append(entry: LogEntry): void
    - getWindow(startTs:number,endTs:number): LogEntry[]
    - getAround(seq:number,before:number,after:number): LogEntry[]
    - setMaxLines(n:number): void (default 500)
  - Internals:
    - Use a circular buffer or deque (array with head/tail indices) to implement O(1) append and O(k) window retrieval for contiguous ranges.
    - Maintain a monotonically increasing seq counter per entry and use it as the canonical sort key.
    - Implement an efficient trim() routine that only updates head pointer and reclaims memory when necessary.
  - Persist non-critical snapshot via vscode.getState on a snapshot interval (e.g., every 5 seconds) but do NOT make persistence blocking for stream ingestion.
  - Add JSDoc comments explaining invariants and complexity.

## 3. Code Review
- [ ] PR review checklist:
  - Verify complexity claims in comments match implementation.
  - Confirm no full-array copies are performed on each append.
  - Confirm default maxLines is set to 500 and is configurable through setMaxLines for tests.
  - Confirm all exported functions have unit tests and edge cases covered.

## 4. Run Automated Tests to Verify
- [ ] Run unit tests: e.g., npm test -- tests/webview/console/windowingStore.test.ts or the project's equivalent. All new unit tests must pass after implementation.

## 5. Update Documentation
- [ ] Update docs/phase_11/59_log_windowing_core/design.md to include the WindowingStore data-structure choice, memory characteristics, and example usage snippets.

## 6. Automated Verification
- [ ] Add a micro-benchmark script scripts/phase_11/bench-windowing.js that:
  - Appends 100k synthetic logs at high speed.
  - Asserts memory usage and live store length (store.length === 500), and that getWindow returns expected tail entries.
  - The CI job can run the benchmark with node --max-old-space-size=2048 and fail if the store grows beyond maxLines.
