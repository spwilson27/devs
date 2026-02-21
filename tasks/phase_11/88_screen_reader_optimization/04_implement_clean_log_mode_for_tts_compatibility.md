# Task: Implement Clean Log Mode for Text-to-Speech (TTS) Compatibility (Sub-Epic: 88_Screen_Reader_Optimization)

## Covered Requirements
- [4_USER_FEATURES-REQ-056]

## 1. Initial Test Written
- [ ] Create `packages/vscode/src/webview/utils/cleanLog/cleanLog.test.ts` and write unit tests for a pure `cleanLog(rawLog: string): string` function that:
  - Strips ANSI escape codes (e.g., `\u001b[32m`, `\u001b[0m`) from log lines, asserting `cleanLog('\u001b[32mSuccess\u001b[0m')` returns `'Success'`.
  - Strips JSON-formatted tool call payloads (lines matching `/^\s*\{.*\}\s*$/` multiline blocks) from the output, replacing with `'[Tool Call]'` placeholder.
  - Strips raw stack traces — lines matching `/^\s+at\s+\S+\s+\(.*\)$/` — replacing each contiguous block with a single `'[Stack Trace Omitted]'` placeholder.
  - Strips hex memory addresses matching `/0x[0-9a-fA-F]{4,}/g` replacing with `'[address]'`.
  - Strips base64 data blobs matching `/data:[a-z]+\/[a-z]+;base64,[A-Za-z0-9+/=]{20,}/g` replacing with `'[data blob]'`.
  - Preserves human-readable agent thought lines (e.g., `'Agent: Analyzing requirements for Task T-007'`) unchanged.
  - Preserves phase-level status lines (e.g., `'Task T-007: COMPLETED'`) unchanged.
  - Assert `cleanLog('')` returns `''` (empty input → empty output).
- [ ] In `packages/vscode/src/webview/components/AgentConsole/AgentConsole.test.tsx`, add tests that:
  - Assert a "Clean Log" toggle button with `aria-label="Toggle Clean Log Mode"` and `aria-pressed` attribute is present in the rendered component.
  - Assert that when `aria-pressed="true"` (Clean Log active), the displayed log entries have ANSI codes and JSON blocks stripped.
  - Assert that when `aria-pressed="false"` (Clean Log inactive), the displayed log entries are the raw original strings.
  - Assert the toggle button's `aria-pressed` attribute reflects the current mode state correctly (ARIA state management).
- [ ] In `packages/e2e/tests/tts-compatibility.spec.ts` (create if absent), write an E2E test using Playwright that:
  - Opens the VSCode Webview in a test harness, navigates to the Agent Console, activates Clean Log Mode, and asserts that no ANSI escape sequences are visible in the DOM text content of log entries.

## 2. Task Implementation
- [ ] Create `packages/vscode/src/webview/utils/cleanLog/cleanLog.ts`:
  ```typescript
  const ANSI_REGEX = /\u001b\[[0-9;]*m/g;
  const JSON_BLOCK_REGEX = /^\s*\{[\s\S]*?\}\s*$/gm;
  const STACK_TRACE_LINE_REGEX = /^\s+at\s+\S+.*\(.*\)$/gm;
  const HEX_ADDRESS_REGEX = /0x[0-9a-fA-F]{4,}/g;
  const BASE64_BLOB_REGEX = /data:[a-z]+\/[a-z]+;base64,[A-Za-z0-9+/=]{20,}/g;

  export function cleanLog(rawLog: string): string {
    return rawLog
      .replace(ANSI_REGEX, '')
      .replace(BASE64_BLOB_REGEX, '[data blob]')
      .replace(HEX_ADDRESS_REGEX, '[address]')
      .replace(JSON_BLOCK_REGEX, '[Tool Call]')
      .replace(STACK_TRACE_LINE_REGEX, '[Stack Trace Omitted]')
      .replace(/(\[Stack Trace Omitted\]\n?){2,}/g, '[Stack Trace Omitted]\n'); // deduplicate
  }
  ```
- [ ] In `packages/vscode/src/webview/components/AgentConsole/AgentConsole.tsx`:
  - Add a local boolean state `isCleanLogMode` (default: `false`). Persist this preference to the Zustand Tier 3 persistent user preferences store (`[6_UI_UX_ARCH-REQ-043]`) under the key `ui.cleanLogMode`, so the setting survives panel reloads.
  - Add a toggle `<button>` element:
    - `aria-label="Toggle Clean Log Mode"`
    - `aria-pressed={isCleanLogMode}` (boolean coerced to string `"true"` / `"false"`)
    - On click: toggle `isCleanLogMode` and update the Zustand store.
    - Style using a VSCode Codicon icon `$(symbol-keyword)` or `$(unmute)` from `@vscode/codicons`, with tooltip text `"Clean Log (TTS)"`.
  - When rendering log entries in the virtualized log list, apply `cleanLog(entry.rawText)` when `isCleanLogMode === true`. When `false`, render `entry.rawText` directly. Ensure this transformation is applied at render time (not mutation) so raw data is never lost.
- [ ] Export `cleanLog` from `packages/vscode/src/webview/utils/index.ts` for reuse by other components.

## 3. Code Review
- [ ] Verify `cleanLog` is a pure function — no side effects, no imports of React, no global state. It must be importable in a Node.js test environment without a DOM.
- [ ] Verify the regex patterns are compiled once (module-level `const`) and not recompiled on every call.
- [ ] Confirm the toggle button meets WCAG 2.1 interactive target size requirement (`≥ 24px`, see `[7_UI_UX_DESIGN-REQ-UI-DES-048-1]`).
- [ ] Confirm `aria-pressed` is toggled correctly — it must be `"true"` or `"false"` (string), not a boolean in JSX (JSX booleans render as missing attribute).
- [ ] Confirm that the Clean Log transformation does NOT mutate the underlying log store — only the display layer is affected.
- [ ] Verify the persistent preference key `ui.cleanLogMode` follows the existing Zustand Tier 3 persistence pattern in the codebase.

## 4. Run Automated Tests to Verify
- [ ] Run `pnpm --filter @devs/vscode test -- --testPathPattern="cleanLog|AgentConsole"` and confirm all tests pass with exit code 0.
- [ ] Run `pnpm --filter @devs/vscode test:coverage -- --collectCoverageFrom="src/webview/utils/cleanLog/**"` and confirm ≥ 100% line and branch coverage for `cleanLog.ts`.
- [ ] Run `pnpm --filter @devs/e2e test -- --grep="TTS compatibility"` (if E2E suite exists) and confirm the Playwright test passes.

## 5. Update Documentation
- [ ] Create or update `packages/vscode/src/webview/components/AgentConsole/README.md` with section "Clean Log Mode (TTS Compatibility)": describe the toggle button, what noise is stripped, and that raw data is preserved in the store.
- [ ] Update `specs/accessibility.md` with entry: `[4_USER_FEATURES-REQ-056] — AgentConsole provides Clean Log Mode toggle (aria-pressed button). When active, ANSI codes, JSON tool-call payloads, stack traces, hex addresses, and base64 blobs are stripped via cleanLog() utility before rendering. Raw data is never mutated.`
- [ ] Update `packages/vscode/src/webview/utils/cleanLog/README.md` (create) documenting: all regex transformations applied, input/output examples, and the rationale for each strip rule (reducing TTS noise).
- [ ] Add entry in `tasks/phase_11/DECISIONS.md`: "Clean Log mode strips noise at render time only. Raw log entries in Zustand state are never modified, ensuring users can switch back to full log without data loss."

## 6. Automated Verification
- [ ] Run `pnpm --filter @devs/vscode test -- --testPathPattern="cleanLog" --verbose 2>&1 | grep -E "PASS|FAIL"` and assert output contains `PASS` and zero `FAIL` lines.
- [ ] Run `node -e "const {cleanLog} = require('./packages/vscode/dist/webview/utils'); console.assert(cleanLog('\u001b[32mOK\u001b[0m') === 'OK', 'ANSI strip failed');"` and assert exit code 0.
- [ ] Run `grep -rn 'aria-pressed' packages/vscode/src/webview/components/AgentConsole/AgentConsole.tsx` and assert at least one match is found, confirming the toggle button ARIA state is implemented.
