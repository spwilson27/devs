# Task: Implement TTS Clean Log Mode for Agent Logs (Sub-Epic: 88_Screen_Reader_Optimization)

## Covered Requirements
- [4_USER_FEATURES-REQ-056]

## 1. Initial Test Written

- [ ] In `packages/webview-ui/src/utils/__tests__/cleanLog.test.ts`, write unit tests for a new `cleanLog(rawText: string): string` utility function:
  - Test that ANSI escape codes (e.g., `\x1b[32m`, `\x1b[0m`) are stripped from the output.
  - Test that markdown code fences (`` ``` ``) and inline backtick content are replaced with a plain-text equivalent: `` `someFunc()` `` → `someFunc()`.
  - Test that JSON blobs (strings starting with `{` or `[`) are replaced with the static placeholder `[structured data]`.
  - Test that URLs (http/https) are replaced with `[link]`.
  - Test that base64-encoded strings (matching `/[A-Za-z0-9+/]{40,}={0,2}/`) are replaced with `[encoded data]`.
  - Test that repeated whitespace (more than 2 consecutive newlines) is collapsed to a single blank line.
  - Test that the function is idempotent: calling it twice on the same input produces the same output.
  - Test that short plain-English sentences (< 200 chars, no special syntax) are returned unchanged.
  - Test that agent "tool invocation" lines matching the pattern `> Calling tool: <tool_name>` are rewritten as `Invoking [tool_name]`.
  - Test that hexadecimal strings (e.g., SHA hashes: `[0-9a-f]{40}`) are replaced with `[hash]`.

- [ ] In `packages/webview-ui/src/components/console/__tests__/CleanLogToggle.test.tsx`, write integration tests for a `CleanLogToggle` UI control:
  - Test that the toggle renders a `<button>` with accessible label `"Toggle Clean Log Mode"` and initial `aria-pressed="false"`.
  - Test that clicking the toggle sets `aria-pressed="true"` and that subsequent thought log entries rendered in `ThoughtStreamer` pass through `cleanLog()` before display.
  - Test that when Clean Log mode is OFF, raw log text is rendered unchanged (no `cleanLog()` applied).
  - Test that the user's Clean Log preference persists to Zustand Tier 3 (persistent preferences) and survives a component remount.

## 2. Task Implementation

- [ ] Create `packages/webview-ui/src/utils/cleanLog.ts` implementing `cleanLog(rawText: string): string`:
  - Strip ANSI codes: `rawText.replace(/\x1b\[[0-9;]*m/g, '')`.
  - Replace JSON blobs: replace substrings matching `/^\s*[{[]/m` blocks with `[structured data]` using a heuristic (attempt `JSON.parse` on candidate, replace if successful).
  - Replace URLs: `/https?:\/\/\S+/g` → `[link]`.
  - Replace base64 blobs: `/[A-Za-z0-9+/]{40,}={0,2}/g` → `[encoded data]`.
  - Replace hex hashes: `/\b[0-9a-f]{40,64}\b/gi` → `[hash]`.
  - Rewrite tool invocation lines: `/^>\s*Calling tool:\s*(\S+)/gm` → `Invoking $1`.
  - Strip markdown code fences: replace ` ``` ... ``` ` blocks with the inner text stripped of backtick syntax.
  - Strip inline backticks: `/`([^`]+)`/g` → `$1`.
  - Collapse excess whitespace: `rawText.replace(/\n{3,}/g, '\n\n')`.
  - Return the sanitized string. The function must be pure with no side effects.

- [ ] Create `packages/webview-ui/src/components/console/CleanLogToggle.tsx`:
  - Render a single `<button>` using VSCode design tokens for styling (CSS vars `--vscode-button-*`).
  - The button should use a `codicon codicon-unmute` icon when Clean Log mode is off and `codicon codicon-mute` when on (logical pairing for TTS context).
  - Use `aria-pressed` attribute to reflect the current toggle state.
  - `aria-label="Toggle Clean Log Mode"`.
  - On click: toggle the `isCleanLogMode` boolean in the Zustand UI preferences store (Tier 3).
  - Add a Codicon icon fallback: if `codicon` is unavailable, render the unicode characters `🔊` / `🔇` inside a `<span aria-hidden="true">`.

- [ ] In `packages/webview-ui/src/store/useUIPreferencesStore.ts` (or the Zustand Tier 3 store):
  - Add `isCleanLogMode: boolean` field defaulting to `false`.
  - Add `setCleanLogMode: (value: boolean) => void` action.
  - Ensure this preference is persisted to `vscode.getState()` alongside other Tier 3 preferences.

- [ ] In `packages/webview-ui/src/components/console/ThoughtStreamer.tsx`:
  - Subscribe to `isCleanLogMode` from the Zustand preferences store via selector.
  - When rendering each log entry's text, conditionally apply `cleanLog(text)` if `isCleanLogMode` is `true`.
  - Render `<CleanLogToggle />` in the console header/toolbar row adjacent to existing controls.

- [ ] Create `packages/webview-ui/src/utils/index.ts` (or update it) to export `cleanLog`.

## 3. Code Review

- [ ] Verify `cleanLog` is a pure function: no DOM access, no network calls, no side effects. It must be testable in a Node.js environment (Jest) without jsdom.
- [ ] Verify the JSON blob detection uses a try/catch around `JSON.parse` and NOT a complex regex to avoid ReDoS vulnerabilities.
- [ ] Confirm base64 regex has a length floor of 40 characters to prevent false positives on short tokens.
- [ ] Confirm `CleanLogToggle` uses `aria-pressed` (not `aria-checked`) as it is a toggle button, not a checkbox.
- [ ] Confirm the `isCleanLogMode` selector in `ThoughtStreamer` is memoized to prevent unnecessary re-renders when other preferences change.
- [ ] Verify that `cleanLog` does not destructively remove log lines entirely — it transforms content, not filters it. A user in Clean Log mode still sees all log entries.
- [ ] Confirm VSCode Codicon usage follows the `codicon-*` class naming convention per `[7_UI_UX_DESIGN-REQ-UI-DES-005-2]`.
- [ ] Verify `.agent.md` file exists for both `cleanLog.ts` and `CleanLogToggle.tsx`.

## 4. Run Automated Tests to Verify

- [ ] Run `pnpm --filter @devs/webview-ui test -- --testPathPattern="cleanLog|CleanLogToggle"` and confirm all tests pass.
- [ ] Run `pnpm --filter @devs/webview-ui test` to confirm no regressions.

## 5. Update Documentation

- [ ] Create `packages/webview-ui/src/utils/cleanLog.agent.md` documenting:
  - Purpose: sanitize raw agent log text for TTS/screen reader consumption.
  - All transformation rules (ANSI, JSON, URL, base64, hash, tool invocation, code fences, whitespace).
  - The idempotency guarantee.
  - What is NOT transformed: plain English sentences < 200 chars.
- [ ] Create `packages/webview-ui/src/components/console/CleanLogToggle.agent.md` documenting:
  - Purpose: user-facing toggle to enable TTS Clean Log mode.
  - Zustand Tier 3 persistence key: `isCleanLogMode`.
  - Codicon icons used and their fallbacks.
- [ ] Update `packages/webview-ui/src/components/console/ThoughtStreamer.agent.md` to document the `isCleanLogMode` conditional rendering and the `CleanLogToggle` placement in the toolbar.

## 6. Automated Verification

- [ ] Run `pnpm --filter @devs/webview-ui test -- --coverage --testPathPattern="cleanLog"` and confirm line coverage ≥ 95% for `cleanLog.ts` (pure utility, high coverage achievable).
- [ ] Run `pnpm --filter @devs/webview-ui build` and confirm zero TypeScript compilation errors and no bundle size regression > 5KB (gzip) for the `cleanLog` utility.
- [ ] Verify agent docs exist: `test -f packages/webview-ui/src/utils/cleanLog.agent.md && test -f packages/webview-ui/src/components/console/CleanLogToggle.agent.md && echo "AOD OK"`.
