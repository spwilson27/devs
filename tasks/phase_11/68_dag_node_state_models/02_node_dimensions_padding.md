# Task: Implement DAG Node component with fixed dimensions and internal padding (Sub-Epic: 68_DAG_Node_State_Models)

## Covered Requirements
- [7_UI_UX_DESIGN-REQ-UI-DES-046-1], [7_UI_UX_DESIGN-REQ-UI-DES-046-2]

## 1. Initial Test Written
- [ ] Create a component unit test at `tests/ui/dag/node.spec.tsx` (Jest + React Testing Library). Write this test before implementation so it fails initially.
  - Mount the component `DagNode` with minimal props (id, label, state).
  - Assert the rendered node DOM element has computed width `180px` and height `64px`.
  - Assert the internal content container (child) has computed padding `8px`.
  - Add a snapshot test of the rendered DOM.
  - Use `getByTestId('dag-node-<id>')` or role queries; include test ids in the component.

## 2. Task Implementation
- [ ] Implement `src/ui/dag/DagNode.tsx` with the following specifics:
  - Render a root element with `data-testid="dag-node-{id}"` and `data-state` attribute set to node.state.
  - Enforce fixed layout: width: `180px`, height: `64px`.
    - Prefer using Tailwind tokens (`w-[180px]`, `h-[64px]`) if Tailwind is available; otherwise use a CSS module with `.dag-node { width: 180px; height: 64px; }`.
  - Internal content wrapper must have padding = `8px` (`p-2` in Tailwind or `padding: 8px` in CSS module).
  - Ensure component accepts `className` and `style` props for composability but that default sizing/padding cannot be overridden by external props without explicit opt-in.
  - Export the component with TypeScript props interface and document the size/padding constants in a single exported `const NODE_DIMENSIONS = { width: 180, height: 64, padding: 8 }`.

## 3. Code Review
- [ ] Verify:
  - Styling uses tokens/constants (NODE_DIMENSIONS) and does not duplicate magic numbers.
  - Component is accessible (role and aria-label where appropriate), test ids present for TDD, and snapshot stable.
  - No layout is computed at runtime in JS for these fixed values (avoid layout thrash).

## 4. Run Automated Tests to Verify
- [ ] Run `npm test`/`yarn test` and ensure `tests/ui/dag/node.spec.tsx` passes and snapshot matches the intended markup.

## 5. Update Documentation
- [ ] Add `docs/ui/dag_node.md` describing the `DagNode` component API, the required fixed dimensions and padding, and reference `NODE_DIMENSIONS` constants.

## 6. Automated Verification
- [ ] Add a CI step that runs a small headless check which mounts the component (jsdom) and asserts computed styles (via `window.getComputedStyle`) for width, height, and padding to prevent regressions.