# Task: Implement MermaidHost Error Boundary & Raw-Markup Fallback (Sub-Epic: 73_Mermaid_Resilience)

## Covered Requirements
- [6_UI_UX_ARCH-REQ-028], [6_UI_UX_ARCH-REQ-096]

## 1. Initial Test Written

- [ ] In `packages/vscode/src/webview/components/MermaidHost/__tests__/MermaidHost.error.test.tsx`, write unit tests using React Testing Library and Vitest:
  - **Test 1 – Parse error shows fallback:** Mock `mermaid.render()` to throw a `MermaidParseError` (or generic `Error`). Render `<MermaidHost definition="graph TD\n  A -→ B" />` and assert:
    - The rendered SVG is **not** present in the DOM.
    - A `<pre>` or `<code>` block containing the raw definition text `"graph TD\n  A -→ B"` **is** present.
    - An element with `data-testid="mermaid-syntax-error-warning"` is visible and contains the text `"Syntax Error"`.
    - A button with `data-testid="mermaid-edit-shortcut"` and accessible label `"Edit diagram source"` is present.
  - **Test 2 – Successful render hides fallback:** Mock `mermaid.render()` to resolve with a valid SVG string. Assert that the error warning and raw-code block are **not** rendered; the SVG container is present.
  - **Test 3 – Error boundary reset on prop change:** Start with a broken definition (trigger error state). Update the `definition` prop to a valid string. Assert the error warning disappears and the SVG renders correctly (error state is reset).
  - **Test 4 – Async rendering error:** Mock `mermaid.render()` to return a rejected Promise. Assert the same fallback UI appears as in Test 1.
  - **Test 5 – Copy raw markup:** Within the fallback state, assert the `<pre>` block content is selectable/copyable (check `user-select: text` style or that the element is not `aria-hidden`).

## 2. Task Implementation

- [ ] Locate or create `packages/vscode/src/webview/components/MermaidHost/MermaidHost.tsx`.
- [ ] Add internal component state:
  ```ts
  type MermaidState =
    | { status: 'idle' }
    | { status: 'rendering' }
    | { status: 'success'; svg: string }
    | { status: 'error'; error: Error; definition: string };
  const [state, setState] = useState<MermaidState>({ status: 'idle' });
  ```
- [ ] In a `useEffect` that depends on the `definition` prop:
  1. Set state to `{ status: 'rendering' }`.
  2. Wrap `mermaid.render(uniqueId, definition)` in a `try/catch` (and `.catch()` for the Promise).
  3. On success: set `{ status: 'success', svg: result.svg }`.
  4. On any error: set `{ status: 'error', error, definition }` — **do NOT rethrow**.
  5. Reset state to `{ status: 'idle' }` on each new `definition` before re-running (so stale error is cleared).
- [ ] Implement the render output:
  - **When `status === 'success'`:** Render a `<div dangerouslySetInnerHTML={{ __html: svg }} />` inside the sandbox container.
  - **When `status === 'error'`:**
    - Render a wrapper `<div className="mermaid-error-fallback" role="alert">`.
    - Include `<span data-testid="mermaid-syntax-error-warning" className="mermaid-syntax-warning">⚠ Syntax Error</span>`.
    - Include `<pre data-testid="mermaid-raw-source" className="mermaid-raw-source"><code>{state.definition}</code></pre>` — ensure `user-select: text`.
    - Include `<button data-testid="mermaid-edit-shortcut" aria-label="Edit diagram source" onClick={onEditRequest}>Edit</button>`, where `onEditRequest` is an optional callback prop (`onEditRequest?: (definition: string) => void`) that the parent uses to open the diagram for editing.
  - **When `status === 'rendering'`:** Render a lightweight skeleton placeholder (e.g., `<div className="mermaid-loading" aria-busy="true" />`).
- [ ] Add CSS/Tailwind styles for `.mermaid-error-fallback` using only `--vscode-*` tokens (no hardcoded colors):
  - Warning span: `color: var(--vscode-editorWarning-foreground)`.
  - `pre` block: `background: var(--vscode-textCodeBlock-background); color: var(--vscode-editor-foreground); font-family: var(--vscode-editor-font-family); padding: 8px; border-radius: 4px; overflow-x: auto; user-select: text`.
  - Button: use `--vscode-button-secondaryBackground` and `--vscode-button-secondaryForeground` tokens.
- [ ] Export `MermaidHost` component from `packages/vscode/src/webview/components/MermaidHost/index.ts`.
- [ ] Ensure the `onEditRequest` prop is plumbed into the parent spec/roadmap views so clicking "Edit" focuses the relevant editor or opens a modal with the raw definition.

## 3. Code Review

- [ ] Verify that **no colors are hardcoded** — every color value must come from a `--vscode-*` CSS variable.
- [ ] Verify the error fallback is rendered inside the same sandbox container as the normal render path (no DOM structure divergence that could break layout).
- [ ] Verify the `uniqueId` passed to `mermaid.render()` is stable per component instance (use `useId()` or a `useRef`-stored UUID), preventing duplicate-ID collisions when multiple `MermaidHost` instances exist on the same page.
- [ ] Verify the `useEffect` cleanup properly cancels/ignores async render results when the component unmounts or `definition` changes before the render completes (use an `isCancelled` flag or `AbortController` pattern).
- [ ] Confirm the `role="alert"` on the error fallback wrapper enables screen readers to announce the error without additional `aria-live` attributes.
- [ ] Confirm all `data-testid` attributes match exactly what the tests assert.

## 4. Run Automated Tests to Verify

- [ ] Run the component unit tests:
  ```bash
  cd packages/vscode && npx vitest run src/webview/components/MermaidHost/__tests__/MermaidHost.error.test.tsx
  ```
- [ ] Run the full webview test suite to confirm no regressions:
  ```bash
  cd packages/vscode && npx vitest run src/webview
  ```
- [ ] All tests must pass with zero failures. If snapshot tests exist, update them only if the change is intentional.

## 5. Update Documentation

- [ ] Update (or create) `packages/vscode/src/webview/components/MermaidHost/MermaidHost.agent.md` with:
  - **Purpose:** Renders Mermaid.js diagram definitions. Provides a safe error boundary: on parse/render failure, falls back to displaying the raw definition in a `<pre>` block with a "⚠ Syntax Error" warning and an "Edit diagram source" button.
  - **Key Props:** `definition: string`, `onEditRequest?: (definition: string) => void`.
  - **Error Handling Contract:** Never throws to the React tree. All Mermaid errors are caught internally and produce the fallback UI.
  - **Requirements Covered:** `6_UI_UX_ARCH-REQ-028`, `6_UI_UX_ARCH-REQ-096`.
- [ ] Add an entry to the phase 11 architecture decision log noting that Mermaid errors are caught at the component boundary (not via a React Error Boundary class) to allow prop-driven recovery without unmounting.

## 6. Automated Verification

- [ ] Run the full test suite and confirm exit code 0:
  ```bash
  cd packages/vscode && npx vitest run --reporter=verbose src/webview/components/MermaidHost/__tests__/MermaidHost.error.test.tsx 2>&1 | tee /tmp/mermaid_error_test_results.txt && grep -E "^(PASS|FAIL|Tests)" /tmp/mermaid_error_test_results.txt
  ```
- [ ] Verify that the file `packages/vscode/src/webview/components/MermaidHost/MermaidHost.tsx` contains both the string `"mermaid-syntax-error-warning"` and `"mermaid-raw-source"`:
  ```bash
  grep -c "mermaid-syntax-error-warning\|mermaid-raw-source" packages/vscode/src/webview/components/MermaidHost/MermaidHost.tsx
  ```
  Expected output: `2` (or higher).
- [ ] Verify no hardcoded color values exist in the component:
  ```bash
  grep -Pn "#[0-9a-fA-F]{3,6}|rgb\(|rgba\(" packages/vscode/src/webview/components/MermaidHost/MermaidHost.tsx && echo "FAIL: hardcoded colors found" || echo "PASS: no hardcoded colors"
  ```
