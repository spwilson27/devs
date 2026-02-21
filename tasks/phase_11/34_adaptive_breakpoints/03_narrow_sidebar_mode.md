# Task: Implement narrow sidebar mode (Sub-Epic: 34_Adaptive_Breakpoints)

## Covered Requirements
- [7_UI_UX_DESIGN-REQ-UI-DES-081-2]

## 1. Initial Test Written
- [ ] Add unit tests for the Sidebar component and the UI preferences store at:
  - src/ui/sidebar/__tests__/Sidebar.store.test.ts
    - Test that toggling the sidebar collapsed state via the store changes the returned value and is persisted (localStorage or persistent store mock).
  - src/ui/sidebar/__tests__/Sidebar.component.test.tsx
    - Render Sidebar with a forced breakpoint of 'narrow' and assert the component renders in "ghost rail" (collapsed) mode: check CSS width or a `data-collapsed="true"` attribute.
  - Test keyboard accessibility: pressing the collapse toggle via fireEvent.keyDown should toggle the state and maintain focus order.

## 2. Task Implementation
- [ ] Implement a narrow-sidebar mode:
  - Add a boolean `collapsed` state to the UI preferences store (Zustand or existing global store) with persistence.
  - Implement a compact "ghost rail" variant of Sidebar that reduces to a minimal width (e.g., 48px) with icons only and shows full labels on hover or on focus.
  - Add a visible toggle control (with data-testid="sidebar-toggle") and keyboard support (Enter/Space) that toggles collapsed state.
  - Ensure the main content area resizes fluidly when collapsed; use CSS variables for sidebar width to keep styles readable.
- [ ] UI and animations:
  - Use an intentional, non-distracting transition (e.g., transform/translateX + opacity for label reveal). Keep transitions brief (<160ms) and respect reduced-motion users.

## 3. Code Review
- [ ] Verify collapsed width uses a single CSS variable (e.g., --sidebar-width-collapsed) and that default and collapsed widths are not duplicated.
- [ ] Verify accessibility: toggle button has aria-pressed and aria-label attributes and is reachable by keyboard.
- [ ] Confirm that persistence uses the project's preference store and does not leak implementation details.

## 4. Run Automated Tests to Verify
- [ ] Run unit tests: npx jest src/ui/sidebar/__tests__/Sidebar.*.test.tsx
- [ ] Optionally run a small integration test that mounts Layout + Sidebar and asserts main content width after toggling.

## 5. Update Documentation
- [ ] Update docs/ui/breakpoints.md and docs/ui/sidebar.md describing:
  - When narrow-sidebar mode should be used (which breakpoints), the collapsed width value, and expected interaction patterns.

## 6. Automated Verification
- [ ] Add a CI check that runs the Sidebar store tests and the component integration test; fail CI if sidebar state persistence or toggle behavior regresses.
- [ ] Add a short Playwright test that toggles the collapse control and validates the main content size change.
