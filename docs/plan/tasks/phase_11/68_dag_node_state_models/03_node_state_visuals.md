# Task: Implement Node State Visual Cues (PENDING, RUNNING, SUCCESS, FAILED, PAUSED) (Sub-Epic: 68_DAG_Node_State_Models)

## Covered Requirements
- [6_UI_UX_ARCH-REQ-022]

## 1. Initial Test Written
- [ ] Create `tests/ui/dag/node-states.spec.tsx` (Jest + React Testing Library) before implementing styles.
  - For each state `PENDING, RUNNING, SUCCESS, FAILED, PAUSED` render `DagNode` with `state` prop set and assert:
    - Presence of a state-specific class or `data-state` attribute (e.g., `data-state="PENDING"`).
    - The DOM contains an element or attribute representing the visual cue (spinner for RUNNING, check icon for SUCCESS, error icon for FAILED, dashed border for PAUSED, subtle neutral outline for PENDING).
    - Snapshots for each state to lock visual DOM structure.
  - Tests should also assert `prefers-reduced-motion` handling by mocking the media query and verifying animations/transitions are disabled.

## 2. Task Implementation
- [ ] Implement state visuals in `src/ui/dag/DagNode.tsx` and `src/ui/dag/dag-node.css` (or Tailwind variants):
  - Map states to visual tokens (use CSS custom properties or Tailwind classes):
    - PENDING: neutral border, muted background, no icon.
    - RUNNING: primary color pulse + inline spinner element.
    - SUCCESS: green border + check icon (SVG) and subtle success background tint.
    - FAILED: red border + error icon and `@keyframes` shake animation limited to 200ms.
    - PAUSED: amber dashed border + pause icon.
  - Ensure styles are theme-aware: use CSS variables (e.g., `var(--vscode-editor-foreground)`) or Tailwind tokens rather than hard-coded hex values.
  - Respect `prefers-reduced-motion: reduce` by disabling CSS animations and replacing with static indicators.
  - Keep rendering cheap: use class toggles and CSS animations (no per-frame JS animation loops).

## 3. Code Review
- [ ] Validate:
  - Visual cues are implemented via CSS classes and are toggle-only (no layout recalculation on state change).
  - Color tokens are theme-aware and meet contrast requirements.
  - Animations honor reduced-motion and are short, performant CSS transitions.
  - Icons are SVG (inline or imported) and accessible (`aria-hidden` where decorative, text alternative for critical status if required).

## 4. Run Automated Tests to Verify
- [ ] Run `npm test`/`yarn test` and verify `node-states.spec.tsx` passes. Confirm snapshot tests are intentional and updated only with deliberate changes.

## 5. Update Documentation
- [ ] Add `docs/ui/dag_node_states.md` that contains a table of states -> visual mapping, required CSS classnames/data attributes, accessibility notes, and examples.

## 6. Automated Verification
- [ ] Add a small browser-based smoke test (`tests/e2e/dag_node_state_smoke.test.js`) that mounts examples for each state, captures DOM attributes, and fails CI on mismatch. If Puppeteer is unavailable, run the same checks in jsdom with explicit class checks.