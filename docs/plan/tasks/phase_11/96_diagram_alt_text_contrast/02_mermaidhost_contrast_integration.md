# Task: Integrate Dynamic Contrast Calculation into MermaidHost Component (Sub-Epic: 96_Diagram_Alt_Text_Contrast)

## Covered Requirements
- [6_UI_UX_ARCH-REQ-102]

## 1. Initial Test Written
- [ ] In `packages/vscode-webview/src/__tests__/MermaidHost.contrast.test.tsx`, write React Testing Library tests:
  - Mock `window.getComputedStyle` to return controlled `--vscode-editor-background` and `--vscode-editor-foreground` CSS variable values for dark, light, and high-contrast themes.
  - Assert that after initial render, the Mermaid `init` call receives a `theme` config object whose `primaryTextColor` and `edgeLabel.background` values pass a 4.5:1 contrast ratio check against the mocked background.
  - Simulate a `message` event from the VSCode extension host with `{ type: 'themeChanged', kind: 'hc-black' }` and assert that `mermaid.initialize` is called again with updated contrast-correct colors within 50ms.
  - Assert that if the resolved foreground color already passes AA, it is used unchanged (no unnecessary recalculation).

## 2. Task Implementation
- [ ] In `packages/vscode-webview/src/components/MermaidHost/MermaidHost.tsx`:
  - Import `ensureWcagAA`, `getContrastRatio`, `chooseForeground` from `@devs/ui-hooks/contrastUtils`.
  - Add a `resolveThemeColors()` function that reads the following VSCode CSS variables from the document root via `getComputedStyle(document.documentElement)`:
    - `--vscode-editor-background` → `bg`
    - `--vscode-editor-foreground` → `fg`
    - `--vscode-editorLink-activeForeground` → `linkColor`
  - Call `ensureWcagAA(bg, fg)` to produce a contrast-safe `safeFg`.
  - Call `ensureWcagAA(bg, linkColor)` to produce a contrast-safe `safeLinkColor`.
  - Build a `MermaidThemeConfig` object using these safe colors:
    ```ts
    {
      theme: 'base',
      themeVariables: {
        primaryTextColor: safeFg,
        edgeLabelBackground: bg,
        lineColor: safeFg,
        primaryColor: bg,
        primaryBorderColor: safeFg,
        fontSize: '13px',
      }
    }
    ```
  - Call `mermaid.initialize(config)` in a `useEffect` that runs on mount and whenever the `themeKind` prop changes.
  - Add a `useEffect` that listens to `window.addEventListener('message', handleThemeChange)` where `handleThemeChange` checks for `event.data.type === 'themeChanged'` and triggers `resolveThemeColors()` + re-initialization.
  - After re-initialization, force a re-render of all currently mounted Mermaid diagrams by calling the diagram re-render utility (see `MermaidHost.tsx` existing pattern or implement via a `diagramKey` state increment).

## 3. Code Review
- [ ] Verify `resolveThemeColors` is **not** called in the render path — it must only run inside `useEffect` to avoid layout thrash.
- [ ] Confirm the `message` event listener is cleaned up in the `useEffect` cleanup function to prevent memory leaks.
- [ ] Confirm that the contrast calculation does not introduce any synchronous DOM reads during a React render cycle (must be deferred with `useEffect`).
- [ ] Verify that `themeVariables` keys match the exact Mermaid 10.x API — cross-reference `node_modules/mermaid/src/themes/` or Mermaid docs for valid keys.

## 4. Run Automated Tests to Verify
- [ ] Run `pnpm --filter @devs/vscode-webview test -- --testPathPattern=MermaidHost.contrast` and confirm 0 failures.
- [ ] Run the full webview test suite with `pnpm --filter @devs/vscode-webview test` and confirm no regressions.

## 5. Update Documentation
- [ ] In `packages/vscode-webview/src/components/MermaidHost/MermaidHost.agent.md`, document the contract:
  - Which VSCode CSS variables are read.
  - The fallback chain (`ensureWcagAA` → black/white) if the resolved color fails AA.
  - The `themeChanged` message shape expected from the extension host.
- [ ] Update `docs/architecture/ui-components.md` to note that `MermaidHost` dynamically enforces WCAG 2.1 AA contrast for all diagram text.

## 6. Automated Verification
- [ ] Run `pnpm --filter @devs/vscode-webview test --reporter=json --outputFile=test-results/mermaid-contrast.json` and assert `"numFailedTests": 0`.
- [ ] Run a contrast audit script: `node scripts/audit-mermaid-contrast.mjs` (to be created in the same PR) that instantiates `resolveThemeColors` with three mock theme palettes (dark, light, hc-black) and asserts all returned `themeVariables` pass a 4.5:1 ratio — exit code 0 on pass.
