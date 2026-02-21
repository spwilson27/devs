# Task: Interactive SVG Pan/Zoom & Node Interaction for Mermaid Diagrams (Sub-Epic: 72_Mermaid_Interactive_Host)

## Covered Requirements
- [4_USER_FEATURES-REQ-030], [6_UI_UX_ARCH-REQ-026]

## 1. Initial Test Written
- [ ] In `packages/webview-ui/src/components/MermaidHost/__tests__/MermaidInteractiveSVG.test.tsx`, write **unit + integration tests** using Vitest + React Testing Library + `@testing-library/user-event` that:
  - Assert that after rendering a Mermaid ERD or Sequence diagram, the wrapping SVG element carries `data-testid="mermaid-interactive-svg"`.
  - Assert that the SVG is wrapped in a `react-zoom-pan-pinch` `TransformWrapper` (verify by checking `data-testid="transform-wrapper"` or by calling `screen.getByRole('img')` with the accessible label).
  - Assert that clicking the "Zoom In" button (data-testid `"mermaid-zoom-in"`) increases the SVG's CSS transform scale attribute (or the internal zoom state) by `0.25`.
  - Assert that clicking "Zoom Out" (data-testid `"mermaid-zoom-out"`) decreases the scale by `0.25`, with a minimum floor of `0.25`.
  - Assert that clicking the "Reset" button (data-testid `"mermaid-zoom-reset"`) restores scale to `1.0` and translation to `(0, 0)`.
  - Assert that double-clicking a node element inside the SVG (identified by class `node` or `actor`) fires the `onNodeActivate` callback prop with the node's `id` attribute as the argument.
  - Assert that hovering over a node applies the `mermaid-node--highlighted` CSS class on the hovered node.
  - Assert that moving the mouse away from a node removes the `mermaid-node--highlighted` class.
- [ ] In `packages/webview-ui/src/components/MermaidHost/__tests__/MermaidInteractiveSVG.a11y.test.tsx`, write **accessibility tests** using `@axe-core/react` or `jest-axe` that:
  - Assert the interactive SVG container has `role="img"` with a descriptive `aria-label` derived from the diagram type.
  - Assert all zoom control buttons have `aria-label` attributes (`"Zoom in"`, `"Zoom out"`, `"Reset zoom"`).
  - Assert that the diagram container participates in the keyboard focus order (has `tabIndex={0}`).
  - Assert keyboard `+`/`-` events on the focused container trigger zoom-in/out (at least verify the key handler is bound).

## 2. Task Implementation
- [ ] Install `react-zoom-pan-pinch` in `packages/webview-ui` if not already present:
  ```bash
  pnpm --filter @devs/webview-ui add react-zoom-pan-pinch
  ```
- [ ] Create `packages/webview-ui/src/components/MermaidHost/MermaidInteractiveSVG.tsx`:
  - Props interface:
    ```ts
    interface MermaidInteractiveSVGProps {
      svgContent: string;           // Raw SVG string from mermaid.render()
      diagramType?: string;         // e.g. "ERD", "Sequence", "Flowchart" — used for aria-label
      onNodeActivate?: (nodeId: string) => void;  // Fired on double-click of a node
      className?: string;
    }
    ```
  - Parse `svgContent` into a DOM tree using `DOMParser` and inject it into a `<div ref={containerRef}>` via `useLayoutEffect` (do NOT use `dangerouslySetInnerHTML` at this layer — use `containerRef.current.innerHTML = svgContent` inside the effect to allow post-processing).
  - After injection, iterate all `.node`, `.actor`, `.label` elements within `containerRef.current` and:
    - Attach `onmouseover` → add class `mermaid-node--highlighted`.
    - Attach `onmouseout` → remove class `mermaid-node--highlighted`.
    - Attach `ondblclick` → call `onNodeActivate(element.id || element.getAttribute('data-id') || '')`.
  - Wrap the container `<div>` with `react-zoom-pan-pinch`'s `<TransformWrapper>` + `<TransformComponent>`:
    ```tsx
    <TransformWrapper initialScale={1} minScale={0.25} maxScale={4} data-testid="transform-wrapper">
      <TransformComponent>
        <div ref={containerRef} role="img" aria-label={`${diagramType ?? 'Diagram'} diagram`} tabIndex={0} data-testid="mermaid-interactive-svg" />
      </TransformComponent>
    </TransformWrapper>
    ```
  - Render a toolbar `<div>` with three `<button>` elements:
    - Zoom In (`data-testid="mermaid-zoom-in"`, `aria-label="Zoom in"`, uses `useControls().zoomIn(0.25)`).
    - Zoom Out (`data-testid="mermaid-zoom-out"`, `aria-label="Zoom out"`, uses `useControls().zoomOut(0.25)`).
    - Reset (`data-testid="mermaid-zoom-reset"`, `aria-label="Reset zoom"`, uses `useControls().resetTransform()`).
  - Add a `useEffect` to listen for `keydown` events on the container (`+` → `zoomIn`, `-` → `zoomOut`, `0` → `resetTransform`) when the container has focus.
  - Apply VSCode design tokens (`--vscode-button-background`, `--vscode-button-foreground`) on the toolbar buttons. Do NOT hardcode colours.
  - Clean up all event listeners attached to SVG elements in the `useLayoutEffect` cleanup function.
- [ ] Update `MermaidHost.tsx` to replace the raw `dangerouslySetInnerHTML` div with `<MermaidInteractiveSVG svgContent={svg} diagramType={inferDiagramType(definition)} onNodeActivate={onNodeActivate} />` once SVG is available.
- [ ] Create utility `packages/webview-ui/src/components/MermaidHost/inferDiagramType.ts`:
  - Parses the first line of a Mermaid `definition` string (e.g., `erDiagram` → `"ERD"`, `sequenceDiagram` → `"Sequence"`, `graph` / `flowchart` → `"Flowchart"`, etc.) and returns a human-readable diagram type string.
- [ ] Add CSS in `packages/webview-ui/src/components/MermaidHost/MermaidHost.css` (or a Tailwind `@layer` utility):
  - `.mermaid-node--highlighted { outline: 2px solid var(--vscode-focusBorder); cursor: pointer; }`.
  - Ensure the rule is scoped (e.g., `.mermaid-host-container .mermaid-node--highlighted`) to avoid polluting global styles.

## 3. Code Review
- [ ] Verify all SVG node event listeners are removed in the `useLayoutEffect` cleanup (no memory leaks on unmount or definition change).
- [ ] Confirm `TransformWrapper`'s `minScale` is `0.25` and `maxScale` is `4.0` (no arbitrary limits).
- [ ] Confirm all interactive elements (buttons) use VSCode CSS variables, not hardcoded hex or rgb values.
- [ ] Verify `role="img"` + `aria-label` and `tabIndex={0}` are present on the SVG container for keyboard and screen-reader accessibility.
- [ ] Confirm `inferDiagramType` handles unknown diagram types gracefully (returns `"Diagram"` as a safe fallback).
- [ ] Verify double-click handler fires `onNodeActivate` with the node id and does **not** throw if the element has no `id` or `data-id` attribute.

## 4. Run Automated Tests to Verify
- [ ] Run `pnpm --filter @devs/webview-ui test --reporter=verbose packages/webview-ui/src/components/MermaidHost` and confirm all interaction and accessibility tests pass with 0 failures.
- [ ] Run `pnpm --filter @devs/webview-ui build` to confirm no TypeScript type errors.
- [ ] Run any existing accessibility test suite (`pnpm --filter @devs/webview-ui test:a11y`) and confirm it passes.

## 5. Update Documentation
- [ ] Update `packages/webview-ui/src/components/MermaidHost/MermaidHost.agent.md` to add an **Interactive SVG** section documenting:
  - `MermaidInteractiveSVG` props and interaction contract.
  - Zoom control keyboard bindings (`+`, `-`, `0`).
  - The `onNodeActivate` callback contract (called with node ID string).
  - Node hover class `mermaid-node--highlighted` and its CSS token source.
  - Covered requirement: `[4_USER_FEATURES-REQ-030]`.
- [ ] Update `docs/ui/components.md` (or equivalent) to include `MermaidInteractiveSVG` with a short description and link to the agent.md.

## 6. Automated Verification
- [ ] CI check: `pnpm --filter @devs/webview-ui test --run` exits with code `0`.
- [ ] CI check: `pnpm --filter @devs/webview-ui build` exits with code `0`.
- [ ] Playwright E2E smoke test (if E2E suite exists): navigate to a Spec view containing a Mermaid ERD block, assert the rendered SVG is present, assert the Zoom In button is clickable and changes the transform, and assert double-clicking a node does not throw a console error.
