# Task: Design Log Windowing & Acceptance Tests (Sub-Epic: 59_Log_Windowing_Core)

## Covered Requirements
- [6_UI_UX_ARCH-REQ-046], [6_UI_UX_ARCH-REQ-094]

## 1. Initial Test Written
- [ ] Create an integration-style failing test at tests/phase_11/59_log_windowing_core/01_design_acceptance.test.ts that uses the project's JS test framework (Jest/Vitest). The test must:
  - Instantiate a headless ConsoleView component with a mocked WindowingStore and a mocked network/stream source.
  - Push a controlled sequence of 2,000 timestamped log entries into the mocked stream and assert that:
    - The WindowingStore exposes an API getWindow(startTs, endTs) that returns a contiguous subset matching the requested timestamps.
    - The ConsoleView subscribes to the store and receives only the entries within the requested window when the window query is invoked.
    - The Virtualized list render callback is invoked only for visible indexes (use spies to assert render calls << total log count).
  - The test must be written first and assert the above behavior so it fails before implementation.

## 2. Task Implementation
- [ ] Produce a short architectural design file at docs/phase_11/59_log_windowing_core/design.md (mermaid diagram + component responsibilities) and implement a minimal failing skeleton so the integration test imports defined interfaces:
  - Component responsibilities (mermaid): ConsoleView -> WindowingStore -> ChunkManager -> VirtualizedList.
  - Define TypeScript interfaces and file locations:
    - src/webview/console/types.ts: export type LogEntry = { id: string; seq: number; ts: number; text: string };
    - src/webview/console/windowingStore.ts: export interface WindowingStore { append(entry: LogEntry): void; getWindow(startTs:number,endTs:number): LogEntry[]; getAround(seq:number, before:number, after:number): LogEntry[] }
    - src/webview/console/VirtualizedConsole.tsx: minimal component that imports the interfaces above and renders an empty container (skeleton) so tests can import it.
  - Implement the skeletons (no real logic) to get the project compiling while tests remain failing because assertions about behavior are not satisfied.

## 3. Code Review
- [ ] During the PR review, verify:
  - The design doc uses a clear mermaid diagram and documents the five public APIs of the windowing subsystem.
  - TypeScript interfaces are lean, strictly typed, and exported for unit tests.
  - Tests are descriptive, deterministic, and use deterministic timestamps/seq values.

## 4. Run Automated Tests to Verify
- [ ] Run the project's unit test command (e.g., npm test or pnpm test) and confirm the newly added integration test fails with clear missing-behavior assertions.

## 5. Update Documentation
- [ ] Commit docs/phase_11/59_log_windowing_core/design.md with the mermaid diagram and a short narrative describing trade-offs (in-memory vs persistent mirror) and the chosen chunk size strategy (used later).

## 6. Automated Verification
- [ ] Add a small CI check script tests/phase_11/59_log_windowing_core/verify_design_fail.sh that runs the test file and exits non-zero when the expected assertions are not met. The CI check should be runnable locally to guard that the test indeed fails until the implementation is completed.
