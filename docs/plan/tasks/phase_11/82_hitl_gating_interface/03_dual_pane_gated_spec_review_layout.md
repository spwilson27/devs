# Task: Dual-Pane Gated Spec Review Layout Component (Sub-Epic: 82_HITL_Gating_Interface)

## Covered Requirements
- [7_UI_UX_DESIGN-REQ-UI-DES-092], [7_UI_UX_DESIGN-REQ-UI-DES-092-1]

## 1. Initial Test Written
- [ ] In `packages/webview/src/components/hitl/__tests__/GatedSpecReview.test.tsx`, write React Testing Library tests for the `<GatedSpecReview>` component:
  - Renders two panes: a `data-testid="spec-markdown-pane"` on the left and a `data-testid="spec-diagram-pane"` on the right.
  - Left pane renders the raw Markdown source text as a `<pre>` or `<code>` block when `markdownSource` prop is provided.
  - Right pane renders a `<MermaidHost>` component when `diagramSource` prop is provided.
  - When `diagramSource` is `null`, right pane renders a `data-testid="no-diagram-placeholder"` element.
  - The component applies a CSS Grid with `grid-template-columns: 1fr 1fr` (dual-pane split) — assert via `getComputedStyle` or `className` check.
  - Both panes scroll independently (overflow-y: auto on each pane wrapper) — assert that both pane wrappers contain an `overflow-y-auto` Tailwind class.
- [ ] In `packages/webview/src/components/hitl/__tests__/GatedSpecReviewLayout.test.tsx`, write tests for layout responsiveness:
  - When the container width is ≥ 800px (mocked via `ResizeObserver`), the dual-pane layout is active.
  - When the container width is < 800px, the layout switches to a single-column stacked layout (`grid-template-columns: 1fr`).

## 2. Task Implementation
- [ ] Create `packages/webview/src/components/hitl/GatedSpecReview.tsx`:
  - Accept props: `markdownSource: string`, `diagramSource: string | null`, `gate: HitlGate`.
  - Outer container: `display: grid`, `grid-template-columns: 1fr 1fr`, `height: 100%`, `gap: var(--spacing-2)` (4px base grid unit).
  - Left pane (`data-testid="spec-markdown-pane"`): `overflow-y: auto`, render `<MarkdownPane source={markdownSource} />`.
  - Right pane (`data-testid="spec-diagram-pane"`): `overflow-y: auto`, render `<MermaidHost source={diagramSource} />` when `diagramSource` is non-null; otherwise render `<NoDiagramPlaceholder />`.
  - Use a `useResizeObserver` hook (from `@devs/ui-hooks`) to detect container width and apply responsive column switching below 800px.
- [ ] Create `packages/webview/src/components/hitl/MarkdownPane.tsx`:
  - Render the raw Markdown source text in a `<pre>` with `font-family: var(--vscode-editor-font-family)` (VSCode Mono token, not hardcoded).
  - Apply Tailwind classes `text-[12px] leading-[1.4]` (Technical font: Mono 12px, line-height 1.4 per design spec).
  - Label the pane with `aria-label="Specification Source"`.
- [ ] Create `packages/webview/src/components/hitl/NoDiagramPlaceholder.tsx`:
  - Simple centered element with codicon `$(info)` and text "No diagram available for this specification."
  - Use `color: var(--vscode-descriptionForeground)` (VSCode token, no hardcoded color).
- [ ] Export all from `packages/webview/src/components/hitl/index.ts`.

## 3. Code Review
- [ ] Verify no hardcoded color values (`#`, `rgb(`, `hsl(`) appear anywhere in the component files — all colors MUST use `var(--vscode-*)` tokens.
- [ ] Verify CSS grid layout uses `gap` from the 4px base grid (`var(--spacing-2)` = 8px or `var(--spacing-1)` = 4px), not arbitrary pixel values.
- [ ] Verify the `MarkdownPane` renders within a scrollable container that does not affect the outer layout — no `overflow: visible` on the outer container.
- [ ] Verify the responsive breakpoint uses `useResizeObserver` on the component's own container (not `window.innerWidth`) so it is pane-aware.
- [ ] Confirm `aria-label` attributes are present on both panes for screen reader navigation.

## 4. Run Automated Tests to Verify
- [ ] Run `pnpm --filter @devs/webview test -- --testPathPattern=GatedSpecReview` and confirm all tests pass.
- [ ] Run `pnpm --filter @devs/webview build` and confirm the bundle compiles without TypeScript errors.

## 5. Update Documentation
- [ ] Add a `## GatedSpecReview Component` section to `packages/webview/src/components/hitl/README.md`:
  - Document props interface, responsive behaviour, and VSCode token dependencies.
- [ ] Update `docs/agent-memory/architecture-decisions.md`:
  ```
  ## [ADR-HITL-003] Dual-Pane Spec Review Layout
  - Layout uses CSS Grid with equal 1fr columns at ≥ 800px container width.
  - Below 800px, collapses to single-column stacked layout.
  - Each pane scrolls independently; outer container does not overflow.
  - Colors exclusively use var(--vscode-*) tokens per the Glass-Box philosophy.
  ```

## 6. Automated Verification
- [ ] Run `pnpm --filter @devs/webview test -- --ci --testPathPattern=GatedSpecReview` and assert exit code `0`.
- [ ] Run `grep -rn "var(--vscode-" packages/webview/src/components/hitl/` and confirm zero hardcoded color values exist alongside the token usages.
- [ ] Run `pnpm --filter @devs/webview build` and assert exit code `0`.
