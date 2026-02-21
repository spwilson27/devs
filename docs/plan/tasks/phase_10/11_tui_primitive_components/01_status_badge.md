# Task: Implement StatusBadge Primitive (Sub-Epic: 11_TUI Primitive Components)

## Covered Requirements
- [6_UI_UX_ARCH-REQ-103]

## 1. Initial Test Written
- [ ] Create a Vitest unit test in `packages/cli/src/tui/components/StatusBadge.test.tsx`.
- [ ] Use `ink-testing-library` to render the `StatusBadge` component.
- [ ] Write tests to verify:
    - The component renders the provided text label.
    - The component applies the correct color for each variant: `SUCCESS` (Green), `ERROR` (Red), `THINKING` (Magenta), `WARNING` (Yellow), and `METADATA` (Grey), as per the ANSI palette requirements (7_UI_UX_DESIGN-REQ-UI-DES-024).
    - The component handles empty or long labels gracefully.

## 2. Task Implementation
- [ ] Implement the `StatusBadge` component in `packages/cli/src/tui/components/StatusBadge.tsx` using `ink` and `react`.
- [ ] Define a `StatusVariant` type: `'success' | 'error' | 'thinking' | 'warning' | 'metadata'`.
- [ ] Use `ink`'s `Text` component to apply colors and background colors if necessary for the "badge" effect.
- [ ] Ensure the component is reusable and follows the "Minimalist Authority" philosophy (7_UI_UX_DESIGN-REQ-UI-DES-060).
- [ ] Export the component for use in other TUI zones.

## 3. Code Review
- [ ] Verify that colors match the ANSI palette defined in the design specs.
- [ ] Ensure the component does not cause unnecessary re-renders.
- [ ] Confirm that types are strictly defined and exported.

## 4. Run Automated Tests to Verify
- [ ] Run `npm test packages/cli/src/tui/components/StatusBadge.test.tsx` and ensure all tests pass.

## 5. Update Documentation
- [ ] Update `@devs/cli` AOD (`.agent.md`) to include the `StatusBadge` component description and usage examples.

## 6. Automated Verification
- [ ] Run a small script `scripts/verify_tui_component.ts` that renders the `StatusBadge` to the terminal and captures the output to verify ANSI color codes.
