# Task: Requirement Hover Cross-Reference Highlighting (Sub-Epic: 82_HITL_Gating_Interface)

## Covered Requirements
- [7_UI_UX_DESIGN-REQ-UI-DES-092-2]

## 1. Initial Test Written
- [ ] In `packages/webview/src/components/hitl/__tests__/RequirementHighlighter.test.tsx`, write React Testing Library tests:
  - Rendering `<RequirementBlock reqId="REQ-001" label="User Auth" />` produces an element with `data-req-id="REQ-001"`.
  - Hovering (`fireEvent.mouseEnter`) a `<RequirementBlock reqId="REQ-001" />` dispatches a `requirementHover` custom event on `document` with `detail: { reqId: 'REQ-001', active: true }`.
  - Mouse leave (`fireEvent.mouseLeave`) dispatches `requirementHover` with `detail: { reqId: 'REQ-001', active: false }`.
- [ ] In `packages/webview/src/components/hitl/__tests__/TasErdHighlight.test.tsx`, write tests for `<TasErdDiagram>` integration:
  - Given a `diagramSource` string containing a Mermaid ERD with an entity named `UserAuth`, and a `requirementHover` event fires with `{ reqId: 'REQ-001', active: true }`, the component applies a `data-highlighted="true"` attribute to the SVG element matching the `reqId → entityName` mapping.
  - When `active: false`, `data-highlighted` is removed.
  - When no mapping exists for the `reqId`, no SVG element is mutated.
- [ ] In `packages/webview/src/hooks/__tests__/useRequirementHighlight.test.ts`, write tests for the `useRequirementHighlight` hook:
  - Returns `{ hoveredReqId: null }` initially.
  - After a `requirementHover` event with `active: true`, returns `{ hoveredReqId: 'REQ-001' }`.
  - After `active: false`, returns `{ hoveredReqId: null }`.
  - Cleans up the event listener on unmount (confirm `removeEventListener` is called via spy).

## 2. Task Implementation
- [ ] Create `packages/webview/src/components/hitl/RequirementBlock.tsx`:
  - Props: `reqId: string`, `label: string`, `priority: 'P1' | 'P2' | 'P3'`, `children?: React.ReactNode`.
  - Render a `<div data-req-id={reqId}>` wrapping the children.
  - On `mouseEnter`, dispatch `new CustomEvent('requirementHover', { bubbles: true, detail: { reqId, active: true } })` on `document`.
  - On `mouseLeave`, dispatch with `active: false`.
  - Apply `cursor: pointer` and a subtle `background: var(--vscode-editor-hoverHighlightBackground)` on hover via CSS class toggling (no inline style).
- [ ] Create `packages/webview/src/hooks/useRequirementHighlight.ts`:
  - Listen to `requirementHover` events on `document` via `addEventListener`.
  - Maintain state `{ hoveredReqId: string | null }`.
  - Return the current `hoveredReqId`.
  - Clean up the listener in the `useEffect` return function.
- [ ] Create `packages/webview/src/components/hitl/TasErdDiagram.tsx`:
  - Wraps `<MermaidHost source={diagramSource} />`.
  - Uses `useRequirementHighlight()` to obtain `hoveredReqId`.
  - Maintains a `reqIdToEntityMap: Record<string, string>` prop (passed from parent, derived from gate metadata).
  - When `hoveredReqId` changes to a non-null value with a mapping entry, queries the rendered SVG via `ref` for the entity element and sets `data-highlighted="true"`.
  - Applies a CSS rule in a `<style>` block: `[data-highlighted="true"] rect { stroke: var(--vscode-focusBorder); stroke-width: 2px; }`.
  - When `hoveredReqId` is null or has no mapping, removes `data-highlighted` from all SVG elements.
- [ ] Pass `reqIdToEntityMap` from `<GatedSpecReview>` to `<TasErdDiagram>`, derived from the `gate.requirementMappings` field (add this field to the `HitlGate` model).

## 3. Code Review
- [ ] Verify highlight state is managed purely via `useRequirementHighlight` hook — no prop-drilling of hover state through more than two component levels.
- [ ] Verify SVG DOM mutations are performed in a `useEffect` (not during render) to avoid React reconciliation conflicts.
- [ ] Verify the custom event uses `bubbles: true` so it propagates correctly regardless of component hierarchy.
- [ ] Verify that `data-highlighted` is cleaned up from ALL SVG elements before applying to the new one (no stale highlights).
- [ ] Confirm no hardcoded color values — the highlight stroke uses `var(--vscode-focusBorder)`.

## 4. Run Automated Tests to Verify
- [ ] Run `pnpm --filter @devs/webview test -- --testPathPattern="RequirementHighlight|TasErd|useRequirementHighlight"` and confirm all tests pass.
- [ ] Run `pnpm --filter @devs/webview build` and assert no TypeScript errors.

## 5. Update Documentation
- [ ] Add a `## Requirement Hover Cross-Reference` section to `packages/webview/src/components/hitl/README.md`:
  - Document the `requirementHover` custom event protocol (shape, bubbling).
  - Document the `reqIdToEntityMap` prop on `<TasErdDiagram>` and how mappings are derived.
- [ ] Update `docs/agent-memory/architecture-decisions.md`:
  ```
  ## [ADR-HITL-004] Requirement Hover Highlighting
  - Cross-pane communication uses a document-level CustomEvent ('requirementHover').
  - SVG DOM is mutated via useEffect after render, not during render.
  - Highlight style uses var(--vscode-focusBorder) stroke — no hardcoded colors.
  - reqIdToEntityMap is provided by the gate metadata, not computed client-side.
  ```

## 6. Automated Verification
- [ ] Run `pnpm --filter @devs/webview test -- --ci --testPathPattern="RequirementHighlight|TasErd|useRequirementHighlight"` and assert exit code `0`.
- [ ] Run `grep -rn "data-highlighted" packages/webview/src/components/hitl/TasErdDiagram.tsx` to confirm the attribute is set and cleaned up in the component.
- [ ] Run `pnpm --filter @devs/webview build` and assert exit code `0`.
