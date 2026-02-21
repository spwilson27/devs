# Task: Implement Log Truncation Engine (Sub-Epic: 60_Log_UI_Presentation)

## Covered Requirements
- [7_UI_UX_DESIGN-REQ-UI-DES-083-2]

## 1. Initial Test Written
- [ ] Write unit tests in TypeScript at src/components/LogWindow/__tests__/logWindowing.test.ts that validate the truncation and chunking primitives BEFORE implementing the code. Tests must include:
  - A deterministic test named "truncateLogLines returns last N lines" that constructs an input array of 1000 distinct lines ("line 1".."line 1000"), calls truncateLogLines(lines, 500) and asserts the returned array length is 500, that the first returned item equals "line 501" and the last equals "line 1000".
  - A test named "chunkLogs splits into fixed-size chunks" that verifies chunkLogs(lines, 200) returns Math.ceil(lines.length/200) chunks with contiguous ordering and no overlaps.
  - A React integration test using React Testing Library at src/components/LogWindow/__tests__/LogWindow.integration.test.tsx named "Read more expands truncated log" which renders the LogWindow component with a props stream of 800 lines, asserts that initial render shows only 500 lines and the "Read more" button exists, fires a click on that button and asserts the full content (or next chunk) is rendered.
  - A streaming test that uses jest fake timers to simulate appending 100 lines in small intervals and asserts that the truncation primitive maintains the max window size and never allocates a huge concatenated string (use spies to check slice usage where possible).
  - Use explicit test names, avoid ambiguous snapshot-only assertions; assert DOM counts and exact strings.

## 2. Task Implementation
- [ ] Implement a pure, well-typed truncation/windowing module at src/components/LogWindow/logWindowing.ts with the following exported functions and types:
  - type LogLine = { id: string; ts: string; level: string; text: string }
  - function truncateLogLines(lines: LogLine[], maxLines = 500): LogLine[] — returns the last maxLines items preserving order and metadata.
  - function chunkLogs(lines: LogLine[], chunkSize = 200): LogLine[][] — returns an array of contiguous chunks for incremental rendering.
  - function mergeAppend(existing: LogLine[], incoming: LogLine[], maxLines = 500): LogLine[] — efficient append that avoids full-array copies when possible.

  Then update/implement the React component src/components/LogWindow/LogWindow.tsx to consume these primitives:
  - The component must accept props {lines: LogLine[], mode: 'narrow'|'wide', maxLines?: number}.
  - On initial render, call truncateLogLines(lines, maxLines) and render only visible chunk(s). When "Read more" is clicked, load the next chunk via chunkLogs and re-render.
  - Implement virtualization by rendering only the current chunk(s) and not the entire history; simple chunk-based rendering is acceptable for this task (no heavy dependency required).
  - Ensure the implementation uses TypeScript, includes JSDoc, and uses Tailwind classes for the "Read more" button (data-testid="log-read-more").

## 3. Code Review
- [ ] During self-review, verify:
  - All exported functions are pure and have explicit types.
  - Complexity is O(n) and slicing is used for truncation instead of repeated string concatenation.
  - There are unit tests covering edge cases (empty input, exact-limit input, over-limit input, high-frequency appends).
  - React component avoids rendering the full array and uses keys tied to LogLine.id.
  - Accessibility: "Read more" button uses aria-expanded and has an accessible label.

## 4. Run Automated Tests to Verify
- [ ] Run the test suite and ensure the new tests pass:
  - Recommended commands (adjust to repo toolchain): npm run test -- --testPathPattern=LogWindow --runInBand
  - If using pnpm/yarn: pnpm test -- -t LogWindow
  - Ensure the streaming fake-timer test advances timers with jest.runAllTimers() and assertions succeed.

## 5. Update Documentation
- [ ] Add a short README at src/components/LogWindow/README.md describing the truncateLogLines, chunkLogs API, the public props of LogWindow component, and the design decision to use chunk-based virtualization. Also add an entry in tasks/phase_11/60_log_ui_presentation/ describing the mapping to requirement 7_UI_UX_DESIGN-REQ-UI-DES-083-2.

## 6. Automated Verification
- [ ] Provide a verification script command invocations in package.json scripts (or CI job) which run only the LogWindow tests and exit non-zero on failure. Example script: "test:logwindow": "jest --testPathPattern=LogWindow --runInBand --silent" and instruct CI to run npm run test:logwindow and grep for "PASS" and ensure coverage threshold for this module is >= 80%.
