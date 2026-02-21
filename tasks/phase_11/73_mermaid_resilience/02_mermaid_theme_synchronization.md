# Task: Implement MermaidHost VSCode Theme Synchronization (Sub-Epic: 73_Mermaid_Resilience)

## Covered Requirements
- [6_UI_UX_ARCH-REQ-029]

## 1. Initial Test Written

- [ ] In `packages/vscode/src/webview/components/MermaidHost/__tests__/MermaidHost.theme.test.tsx`, write unit and integration tests using Vitest and React Testing Library:
  - **Test 1 – Dark theme initialization:** Set `document.body.className = "vscode-dark"` before rendering. Mock `mermaid.initialize()`. Render `<MermaidHost definition="graph TD; A-->B" />`. Assert `mermaid.initialize` was called with `{ theme: 'dark', ... }`.
  - **Test 2 – Light theme initialization:** Set `document.body.className = "vscode-light"`. Assert `mermaid.initialize` was called with `{ theme: 'default', ... }`.
  - **Test 3 – High-contrast theme initialization:** Set `document.body.className = "vscode-high-contrast"`. Assert `mermaid.initialize` was called with `{ theme: 'base', themeVariables: { ... } }` (or `'dark'` with HC overrides — document the chosen mapping in the implementation).
  - **Test 4 – Theme change re-initializes and re-renders:** Render with `vscode-dark`. Simulate a VSCode theme change by mutating `document.body.className` to `"vscode-light"` and dispatching a `MutationObserver` callback (inject a helper to trigger the observer callback in tests). Assert `mermaid.initialize` is called a second time with `{ theme: 'default', ... }` and that `mermaid.render` is called again with the same definition.
  - **Test 5 – Theme change with error state resets and re-renders:** Start with a broken definition in error state. Trigger a theme change. Assert the error state is cleared and a new render attempt is made (allowing a newly-valid diagram to appear after a source correction followed by a theme toggle).
  - **Test 6 – MutationObserver teardown on unmount:** Spy on `MutationObserver.prototype.disconnect`. Render and then unmount the component. Assert `disconnect` was called exactly once.

## 2. Task Implementation

- [ ] In `packages/vscode/src/webview/hooks/useMermaidTheme.ts`, implement a custom hook:
  ```ts
  export type MermaidThemeConfig = {
    theme: 'dark' | 'default' | 'base';
    themeVariables?: Record<string, string>;
  };

  /**
   * Derives the correct Mermaid theme config from the active VSCode body class
   * and re-runs whenever the VSCode theme changes.
   */
  export function useMermaidTheme(): MermaidThemeConfig;
  ```
  - Read the current theme by inspecting `document.body.classList`:
    - `vscode-dark` → `{ theme: 'dark' }`
    - `vscode-light` → `{ theme: 'default' }`
    - `vscode-high-contrast` or `vscode-high-contrast-light` → `{ theme: 'base', themeVariables: { background: 'var(--vscode-editor-background)', primaryColor: 'var(--vscode-editor-foreground)', lineColor: 'var(--vscode-editor-foreground)', ... } }`
  - Use a `MutationObserver` watching `document.body` for `attributes` changes on the `class` attribute to detect VSCode theme switches at runtime.
  - Store the derived config in a `useState`. On observer callback, recompute and update state (triggering re-renders of consumers).
  - Disconnect the `MutationObserver` in the hook's `useEffect` cleanup function to prevent memory leaks.

- [ ] In `packages/vscode/src/webview/components/MermaidHost/MermaidHost.tsx`, consume `useMermaidTheme()`:
  ```ts
  const themeConfig = useMermaidTheme();
  ```
  - In the `useEffect` that calls `mermaid.render()`, first call `mermaid.initialize({ startOnLoad: false, ...themeConfig })` **before every render call** so Mermaid always uses the current theme.
  - Add `themeConfig` to the `useEffect` dependency array so that any theme change automatically triggers a re-render of the diagram.
  - When theme changes while in error state, reset the error state (`setState({ status: 'idle' })`) and re-attempt rendering — the definition has not changed but the Mermaid config has.

- [ ] Create `packages/vscode/src/webview/hooks/__tests__/useMermaidTheme.test.ts` with unit tests for the hook in isolation (using `renderHook` from `@testing-library/react`):
  - Test that the hook returns the correct initial config for each body class.
  - Test that mutating `document.body.className` and triggering the observer updates the returned config.

## 3. Code Review

- [ ] Verify the `MutationObserver` is scoped to `{ attributes: true, attributeFilter: ['class'] }` on `document.body` — not on the whole subtree — to minimize observer overhead.
- [ ] Verify that `mermaid.initialize()` is called **before** `mermaid.render()` on every render attempt (not just on mount), ensuring theme config is always current even if Mermaid caches previous configuration.
- [ ] Verify the high-contrast `themeVariables` use only `--vscode-*` CSS variable references (not hardcoded hex values), consistent with REQ-004 (Theme-Aware Styling).
- [ ] Verify the `useMermaidTheme` hook is exported from `packages/vscode/src/webview/hooks/index.ts` so other components can reuse it.
- [ ] Confirm the `useEffect` dependency array in `MermaidHost.tsx` includes both `definition` and `themeConfig` so theme changes and definition changes both trigger re-renders independently.
- [ ] Confirm there is no risk of a stale-closure race: if a theme change and a definition change fire simultaneously, the latest values of both are used for the render call.

## 4. Run Automated Tests to Verify

- [ ] Run the theme-specific tests:
  ```bash
  cd packages/vscode && npx vitest run src/webview/components/MermaidHost/__tests__/MermaidHost.theme.test.tsx
  ```
- [ ] Run the hook unit tests:
  ```bash
  cd packages/vscode && npx vitest run src/webview/hooks/__tests__/useMermaidTheme.test.ts
  ```
- [ ] Run the full webview suite to confirm no regressions:
  ```bash
  cd packages/vscode && npx vitest run src/webview
  ```
- [ ] All tests must pass with zero failures.

## 5. Update Documentation

- [ ] Update `packages/vscode/src/webview/components/MermaidHost/MermaidHost.agent.md` to add:
  - **Theme Synchronization:** `MermaidHost` uses the `useMermaidTheme()` hook to detect the active VSCode theme (`vscode-dark`, `vscode-light`, `vscode-high-contrast`) from `document.body.classList` via a `MutationObserver`. On every theme change, Mermaid is re-initialized with the correct theme config and the diagram is re-rendered automatically.
  - **Requirements Covered:** `6_UI_UX_ARCH-REQ-029`.
- [ ] Create or update `packages/vscode/src/webview/hooks/useMermaidTheme.agent.md` documenting:
  - **Purpose:** Derives Mermaid theme config from the VSCode-controlled body class and subscribes to runtime theme changes via `MutationObserver`.
  - **Theme Mapping Table:** `vscode-dark` → `dark`, `vscode-light` → `default`, `vscode-high-contrast*` → `base` with HC themeVariables.
  - **Memory Management:** Observer is disconnected on unmount.

## 6. Automated Verification

- [ ] Run the combined theme test suite and confirm exit code 0:
  ```bash
  cd packages/vscode && npx vitest run --reporter=verbose src/webview/components/MermaidHost/__tests__/MermaidHost.theme.test.tsx src/webview/hooks/__tests__/useMermaidTheme.test.ts 2>&1 | tee /tmp/mermaid_theme_test_results.txt && grep -E "^(PASS|FAIL|Tests)" /tmp/mermaid_theme_test_results.txt
  ```
- [ ] Verify that `useMermaidTheme` hook exists and is exported:
  ```bash
  grep -rn "useMermaidTheme" packages/vscode/src/webview/hooks/index.ts && echo "PASS: hook exported" || echo "FAIL: hook not exported"
  ```
- [ ] Verify that `MermaidHost.tsx` calls `mermaid.initialize` (confirming theme config is applied before every render):
  ```bash
  grep -c "mermaid.initialize" packages/vscode/src/webview/components/MermaidHost/MermaidHost.tsx
  ```
  Expected output: `1` or more.
- [ ] Verify the `MutationObserver` disconnect is present in the hook (confirming cleanup):
  ```bash
  grep -c "disconnect" packages/vscode/src/webview/hooks/useMermaidTheme.ts
  ```
  Expected output: `1` or more.
