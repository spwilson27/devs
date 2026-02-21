# Task: Tool Log Right Sidebar Component (Sub-Epic: 03_Agent Console UI Components)

## Covered Requirements
- [7_UI_UX_DESIGN-REQ-UI-DES-094-2]

## 1. Initial Test Written
- [ ] In `packages/webview-ui/src/components/AgentConsole/__tests__/ToolLog.test.tsx`, write tests that:
  - Assert `ToolLog` renders an empty state placeholder (`data-testid="tool-log-empty"`) when `toolCalls` prop is an empty array.
  - Assert that given a `ToolCallEntry[]` list, each entry renders as a collapsed row with `data-testid="tool-call-{id}"` showing only the tool name (e.g., `read_file`, `npm test`).
  - Assert each collapsed row has `aria-expanded="false"` and a chevron-down icon.
  - Assert clicking a collapsed row expands it: `aria-expanded` changes to `"true"`, a `data-testid="tool-call-output-{id}"` element appears containing the redacted raw output.
  - Assert clicking an expanded row collapses it back (toggle behavior).
  - Assert that sensitive strings matching the redaction pattern (e.g., API keys matching `/sk-[a-zA-Z0-9]{32,}/`) in the raw output are replaced with `[REDACTED]` before rendering.
  - Assert only one row can be expanded at a time (accordion behavior): expanding row B collapses row A.
  - Assert the sidebar has `role="complementary"` and `aria-label="Tool call log"`.
  - Write a snapshot test with three entries, the second expanded.

## 2. Task Implementation
- [ ] Add to `packages/webview-ui/src/components/AgentConsole/types.ts`:
  ```typescript
  export interface ToolCallEntry {
    id: string;           // UUID
    timestamp: number;    // Unix ms
    toolName: string;     // e.g. 'read_file', 'npm_test'
    rawOutput: string;    // Full stdout/stderr of the tool call
    durationMs: number;   // Execution time
  }
  ```
- [ ] Create `packages/webview-ui/src/components/AgentConsole/ToolLog.tsx`:
  - Accept props: `toolCalls: ToolCallEntry[]`, `className?: string`.
  - Render `<aside data-testid="tool-log" role="complementary" aria-label="Tool call log">`.
  - Maintain local state: `expandedId: string | null` (accordion: only one open).
  - Map each `ToolCallEntry` to a `<ToolCallRow>` sub-component.
  - `ToolCallRow` renders:
    - A `<button>` as the header with `aria-expanded={isExpanded}` and `aria-controls="tool-call-output-{id}"`.
    - Tool name as monospaced text (`font-family: monospace`), timestamp as `HH:mm:ss`, duration as `{durationMs}ms`.
    - A chevron icon (CSS-only, no icon library dependency) that rotates 180° when expanded.
    - When expanded: a `<pre id="tool-call-output-{id}" data-testid="tool-call-output-{id}">` containing `redactSensitiveData(rawOutput)`.
  - Implement `redactSensitiveData(raw: string): string` utility in `packages/webview-ui/src/utils/redact.ts`:
    - Replace patterns: `/sk-[a-zA-Z0-9]{32,}/g → '[REDACTED]'`, `/ghp_[a-zA-Z0-9]{36}/g → '[REDACTED]'`, `/Bearer\s+[^\s]{20,}/g → 'Bearer [REDACTED]'`.
    - Export as a pure function (no side effects).
- [ ] Create `packages/webview-ui/src/components/AgentConsole/ToolLog.module.css`:
  - `.toolLog` — `overflow-y: auto; height: 100%; display: flex; flex-direction: column;`
  - `.toolCallRow` — `border-bottom: 1px solid var(--vscode-panel-border);`
  - `.toolCallHeader` — `display: flex; align-items: center; gap: var(--spacing-xs); padding: var(--spacing-xs) var(--spacing-sm); background: none; border: none; width: 100%; cursor: pointer; text-align: left; font-family: var(--vscode-editor-font-family, monospace);`
  - `.chevron` — `transition: transform 200ms ease; flex-shrink: 0;` with `.chevronExpanded { transform: rotate(180deg); }`.
  - `.toolCallOutput` — `padding: var(--spacing-xs) var(--spacing-sm); font-family: monospace; font-size: 0.75rem; white-space: pre-wrap; word-break: break-all; background: var(--vscode-editor-background); max-height: 240px; overflow-y: auto;`
- [ ] Write `packages/webview-ui/src/utils/__tests__/redact.test.ts` with unit tests for each redaction pattern (covered, matched, not over-matched).
- [ ] Wire `ToolLog` into the right-sidebar pane of `AgentConsole`, receiving `toolCalls` from `useAgentConsoleStore`.

## 3. Code Review
- [ ] Confirm `redactSensitiveData` is tested independently of the component; it must be a pure function.
- [ ] Verify the accordion allows keyboard navigation: `Enter`/`Space` on the header button toggles expansion (this is default `<button>` behavior — confirm it's not prevented).
- [ ] Confirm the `<pre>` output block has `word-break: break-all` to prevent horizontal scroll overflow in the sidebar.
- [ ] Validate no secrets from `rawOutput` appear unredacted in the DOM — add a test asserting the raw string cannot be found in the rendered output when it contains a known API key pattern.
- [ ] Ensure the chevron animation uses `transform` only (no `width`/`height` transitions that trigger layout).

## 4. Run Automated Tests to Verify
- [ ] Run `pnpm --filter @devs/webview-ui test -- --testPathPattern="ToolLog|redact"` and confirm all assertions pass.
- [ ] Confirm `redact.ts` has 100% line and branch coverage.

## 5. Update Documentation
- [ ] Add `ToolLog` and `ToolCallEntry` type to `packages/webview-ui/docs/COMPONENTS.md`.
- [ ] Add `redactSensitiveData` to `packages/webview-ui/docs/UTILS.md` with the list of redaction patterns and their rationale.
- [ ] Record in `.devs/memory/phase_12_decisions.md`: "ToolLog uses accordion pattern (single-open). Redaction runs client-side via `redactSensitiveData` util before rendering raw tool output."

## 6. Automated Verification
- [ ] `pnpm --filter @devs/webview-ui test -- --ci --forceExit --testPathPattern="ToolLog|redact"` exits with code 0.
- [ ] `pnpm --filter @devs/webview-ui build` completes without errors.
- [ ] Security check: grep the compiled bundle for known test API-key fixture strings used in tests — assert zero matches: `grep -r "sk-testkey" packages/webview-ui/dist` should return empty.
