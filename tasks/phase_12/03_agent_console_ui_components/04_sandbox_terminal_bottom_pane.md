# Task: Sandbox Terminal Bottom Pane with xterm.js (Sub-Epic: 03_Agent Console UI Components)

## Covered Requirements
- [7_UI_UX_DESIGN-REQ-UI-DES-094-3]

## 1. Initial Test Written
- [ ] In `packages/webview-ui/src/components/AgentConsole/__tests__/SandboxTerminal.test.tsx`, write tests that:
  - Assert `SandboxTerminal` renders a container `<div data-testid="sandbox-terminal" role="region" aria-label="Sandbox terminal output">`.
  - Assert that when `isActive` prop is `false`, the terminal renders an idle overlay with text "No active test execution" (`data-testid="terminal-idle-overlay"`).
  - Assert that when `isActive` prop is `true`, the idle overlay is NOT rendered and the xterm.js mount point `<div data-testid="xterm-mount">` is present.
  - Mock `@xterm/xterm` Terminal class: assert its constructor is called with options `{ fontFamily: 'monospace', fontSize: 13, theme: { background: '#1e1e1e' }, convertEol: true, scrollback: 5000 }` when `isActive` becomes `true`.
  - Assert that each string in the `outputLines` prop is written to the mocked terminal via `terminal.write()` in order.
  - Assert that when the component unmounts, `terminal.dispose()` is called exactly once.
  - Assert that when `outputLines` grows (new line appended), `terminal.write()` is called with only the new delta line (not the entire history re-written).
  - Assert a "Clear" button (`data-testid="terminal-clear-btn"`) calls `terminal.clear()` when clicked.
  - Assert a "Copy All" button (`data-testid="terminal-copy-btn"`) calls `navigator.clipboard.writeText` with the joined output lines.

## 2. Task Implementation
- [ ] Add `@xterm/xterm` as a dependency: `pnpm --filter @devs/webview-ui add @xterm/xterm`.
- [ ] Add to `packages/webview-ui/src/components/AgentConsole/types.ts`:
  ```typescript
  export interface SandboxTerminalProps {
    isActive: boolean;
    outputLines: string[];  // Append-only log of stdout/stderr lines
    className?: string;
  }
  ```
- [ ] Create `packages/webview-ui/src/components/AgentConsole/SandboxTerminal.tsx`:
  - Accept `SandboxTerminalProps`.
  - Render outer `<div data-testid="sandbox-terminal" role="region" aria-label="Sandbox terminal output" className={styles.sandboxTerminal}>`.
  - Render a toolbar `<div className={styles.toolbar}>` containing:
    - A label `<span>Sandbox Terminal</span>`.
    - `<button data-testid="terminal-clear-btn" onClick={handleClear} aria-label="Clear terminal">Clear</button>`.
    - `<button data-testid="terminal-copy-btn" onClick={handleCopyAll} aria-label="Copy all output">Copy All</button>`.
  - When `isActive` is `false`, render `<div data-testid="terminal-idle-overlay" className={styles.idleOverlay}>No active test execution</div>` inside the terminal area (xterm mount is not initialized).
  - When `isActive` is `true`, render `<div data-testid="xterm-mount" ref={xtermMountRef} className={styles.xtermMount} />`.
  - Use `useEffect` on `[isActive]`: when `isActive` becomes `true`, instantiate `new Terminal({ fontFamily: 'monospace', fontSize: 13, theme: { background: '#1e1e1e' }, convertEol: true, scrollback: 5000 })`, call `terminal.open(xtermMountRef.current)`, store in a `useRef<Terminal | null>`.
  - Use `useEffect` on `[outputLines]`: compute delta (lines added since last render) using a `prevLengthRef`, call `terminalRef.current?.write(newLine + '\r\n')` for each delta line.
  - Cleanup: in the `isActive` effect's return function, call `terminalRef.current?.dispose()` and set ref to `null`.
  - `handleClear`: call `terminalRef.current?.clear()`.
  - `handleCopyAll`: call `navigator.clipboard.writeText(outputLines.join('\n'))`.
- [ ] Create `packages/webview-ui/src/components/AgentConsole/SandboxTerminal.module.css`:
  - `.sandboxTerminal` — `display: flex; flex-direction: column; height: 100%; background: #1e1e1e; color: #d4d4d4;`
  - `.toolbar` — `display: flex; align-items: center; gap: var(--spacing-sm); padding: 4px var(--spacing-sm); background: var(--vscode-panel-background); border-bottom: 1px solid var(--vscode-panel-border); flex-shrink: 0;`
  - `.toolbar button` — `font-size: 0.75rem; padding: 2px 8px; cursor: pointer;`
  - `.xtermMount` — `flex: 1; overflow: hidden;`
  - `.idleOverlay` — `flex: 1; display: flex; align-items: center; justify-content: center; font-family: monospace; font-size: 0.875rem; color: var(--vscode-descriptionForeground);`
- [ ] Add a `__mocks__/@xterm` manual mock in `packages/webview-ui/src/__mocks__/@xterm/xterm.ts` exporting a mock `Terminal` class (jest.fn()) with mocked methods: `open`, `write`, `clear`, `dispose`, `onData`.
- [ ] Wire `SandboxTerminal` into the bottom pane of `AgentConsole`, receiving `isActive` and `outputLines` from `useAgentConsoleStore`.

## 3. Code Review
- [ ] Confirm xterm.js instance is created only once per `isActive=true` lifecycle, not on every render.
- [ ] Verify the delta-write logic (`prevLengthRef`) is correct: no lines are skipped or duplicated when `outputLines` grows.
- [ ] Confirm `terminal.dispose()` is called on unmount AND on `isActive` transition from `true → false` to prevent memory leaks.
- [ ] Validate the `scrollback: 5000` option is passed to prevent xterm.js from consuming unbounded memory.
- [ ] Confirm `role="region"` + `aria-label` provides sufficient landmark for screen reader users.
- [ ] Ensure the `@xterm/xterm` import is lazy-loaded or excluded from the webview bundle's critical path (use dynamic `import()` inside the `useEffect` if bundle size > 50 KB for the terminal module).

## 4. Run Automated Tests to Verify
- [ ] Run `pnpm --filter @devs/webview-ui test -- --testPathPattern="SandboxTerminal"` and confirm all assertions pass.
- [ ] Verify the mock `Terminal` constructor is called with the exact options object (use `expect(MockTerminal).toHaveBeenCalledWith(...)`) .
- [ ] Run with `--coverage` and confirm `SandboxTerminal.tsx` has ≥ 90% line coverage.

## 5. Update Documentation
- [ ] Add `SandboxTerminal` to `packages/webview-ui/docs/COMPONENTS.md` with prop table and lifecycle note about xterm.js disposal.
- [ ] Update `.devs/memory/phase_12_decisions.md`: "SandboxTerminal uses xterm.js with scrollback: 5000. Terminal is instantiated lazily on `isActive=true` and disposed on `isActive=false` or unmount. Delta-write pattern used to avoid re-writing full output history."

## 6. Automated Verification
- [ ] `pnpm --filter @devs/webview-ui test -- --ci --forceExit --testPathPattern="SandboxTerminal"` exits with code 0.
- [ ] `pnpm --filter @devs/webview-ui build` completes; check bundle stats to confirm `@xterm/xterm` is NOT in the critical initial chunk (should be dynamically imported).
- [ ] Run `pnpm --filter @devs/webview-ui size-limit` (if configured) and assert no bundle size regression > 5% from adding xterm.js.
