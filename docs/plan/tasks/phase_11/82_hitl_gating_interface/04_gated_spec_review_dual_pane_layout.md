# Task: Gated Spec Review Dual-Pane Layout (Sub-Epic: 82_HITL_Gating_Interface)

## Covered Requirements
- [7_UI_UX_DESIGN-REQ-UI-DES-092], [7_UI_UX_DESIGN-REQ-UI-DES-092-1]

## 1. Initial Test Written

- [ ] Create `packages/vscode-webview/src/__tests__/GatedSpecReviewView.test.tsx`.
- [ ] Write RTL unit tests:
  - Test that the component renders a two-column layout with a left pane (class `spec-source-pane`) and a right pane (class `spec-diagram-pane`).
  - Test that the left pane renders Markdown content using `react-markdown` when given a `markdownSource` prop.
  - Test that the right pane renders the `MermaidHost` component stub when given a `mermaidSource` prop.
  - Test that requirement blocks in the Markdown are identified and rendered with a unique `data-req-id` attribute extracted from `[REQ-ID]` patterns.
  - Test that the dual-pane layout becomes a single stacked layout (column direction) when a `narrow` prop is `true` (viewport < 900px simulation).
  - Test that the split divider between panes is draggable: simulate `mousedown` + `mousemove` on the divider and assert that the left pane flex-basis CSS value updates.
- [ ] Write an integration test confirming that a `specDocument` object with both `markdown` and `mermaid` fields correctly populates both panes.

## 2. Task Implementation

- [ ] Create `packages/vscode-webview/src/views/GatedSpecReview/GatedSpecReviewView.tsx`:
  - Props interface:
    ```ts
    interface GatedSpecReviewViewProps {
      specDocument: {
        title: string;
        markdown: string;       // Full Markdown content of the spec document
        mermaidDiagrams: Array<{ id: string; source: string }>;
      };
      narrow?: boolean;         // If true, stack panes vertically
    }
    ```
  - Render a `<div class="spec-review-container">` with:
    - Left pane (`spec-source-pane`): renders the Markdown with `react-markdown`, with a custom `components` map that wraps every paragraph beginning with `[REQ-` in a `<RequirementBlock>` component.
    - A `<ResizableDivider>` between the two panes (draggable, 4px wide, `cursor: col-resize`).
    - Right pane (`spec-diagram-pane`): renders `<MermaidHost>` for each `mermaidDiagrams` entry.
  - The flex split defaults to 50/50. Store the divider position in local `useState`. Apply `will-change: flex-basis` for GPU acceleration ([7_UI_UX_DESIGN-REQ-UI-DES-087]).
  - When `narrow` is `true`, switch flex-direction to `column` and hide the divider.
- [ ] Create `packages/vscode-webview/src/views/GatedSpecReview/RequirementBlock.tsx`:
  - Props: `{ reqId: string; children: React.ReactNode }`.
  - Renders a `<div data-req-id={reqId}>` wrapping children, with a sign-off checkbox (see task 05 for checkbox logic — this task creates the structural wrapper only).
  - Applies left border `2px solid var(--vscode-charts-blue)` to visually mark requirement blocks.
- [ ] Create `packages/vscode-webview/src/views/GatedSpecReview/ResizableDivider.tsx`:
  - `onMouseDown` starts a drag session; `document.onMouseMove` updates the parent left pane flex-basis via a callback prop.
  - Clean up `document` event listeners in a `useEffect` cleanup.
- [ ] Register the view in `ViewRouter` so `SPEC_VIEW` route renders `GatedSpecReviewView`.
- [ ] Add CSS in `GatedSpecReviewView.module.css`:
  - `.spec-review-container`: `display: flex; flex-direction: row; height: 100%; overflow: hidden;`
  - `.spec-source-pane`: `overflow-y: auto; padding: 16px;` (scroll per pane, not full page)
  - `.spec-diagram-pane`: `overflow-y: auto; padding: 16px; background: var(--vscode-sideBar-background);`

## 3. Code Review

- [ ] Verify `react-markdown` is the rendering engine for the Markdown pane (per [6_UI_UX_ARCH-REQ-016]) — no `dangerouslySetInnerHTML` with raw HTML.
- [ ] Confirm `ResizableDivider` cleans up `document` event listeners on `mouseup` and component unmount to prevent memory leaks.
- [ ] Ensure the `data-req-id` attribute extraction regex handles all valid REQ-ID formats: `[1_PRD-REQ-*]`, `[4_USER_FEATURES-REQ-*]`, `[7_UI_UX_DESIGN-REQ-*]`, etc.
- [ ] Confirm the component degrades gracefully when `mermaidDiagrams` is empty (right pane renders a placeholder with icon `$(file-code)` and "No diagrams available").
- [ ] Verify no hardcoded pixel breakpoints — use CSS custom properties or container queries where possible.

## 4. Run Automated Tests to Verify

- [ ] Run `pnpm --filter @devs/vscode-webview test -- --testPathPattern="GatedSpecReviewView"` and confirm all tests pass.
- [ ] Run `pnpm --filter @devs/vscode-webview tsc --noEmit` for type validation.

## 5. Update Documentation

- [ ] Create `packages/vscode-webview/src/views/GatedSpecReview/README.md` documenting the component API, the `specDocument` data shape, and how `RequirementBlock` extraction works.
- [ ] Update `docs/agent_memory/phase_11_decisions.md`: "GatedSpecReviewView is the SPEC_VIEW route. It uses a draggable dual-pane layout (50/50 default). Markdown left, MermaidHost right. Requirement blocks are identified by [REQ-ID] prefix pattern."

## 6. Automated Verification

- [ ] Run `pnpm --filter @devs/vscode-webview test --coverage --coverageThreshold='{"global":{"lines":90}}'` and confirm threshold passes.
- [ ] Run `grep -r 'data-req-id' packages/vscode-webview/src/views/GatedSpecReview/RequirementBlock.tsx` and assert the attribute is present.
- [ ] Run `grep -r 'ResizableDivider' packages/vscode-webview/src/views/GatedSpecReview/GatedSpecReviewView.tsx` and assert the component is used.
