# Task: Implement StepProgress Primitive (Sub-Epic: 11_TUI Primitive Components)

## Covered Requirements
- [6_UI_UX_ARCH-REQ-107]

## 1. Initial Test Written
- [ ] Create a Vitest unit test in `packages/cli/src/tui/components/StepProgress.test.tsx`.
- [ ] Verify:
    - Rendering of a progress bar representing a percentage.
    - Rendering of "steps" (e.g., 2/15 tasks complete).
    - Correct bar length calculation based on the `width` prop.
    - Use of block characters (e.g., `█` or `#` fallback) for the progress bar (9_ROADMAP-REQ-UI-001).

## 2. Task Implementation
- [ ] Implement `StepProgress` in `packages/cli/src/tui/components/StepProgress.tsx`.
- [ ] Support props: `current: number`, `total: number`, `width?: number`, `showPercentage?: boolean`.
- [ ] Calculate the number of filled vs. empty blocks.
- [ ] Use `chalk` (via `ink`) to color the filled portion (e.g., Green for success/current progress).
- [ ] Implement an ASCII fallback for the bar (e.g., `[###---]`) for restricted terminals.

## 3. Code Review
- [ ] Ensure the progress bar is responsive to the width of the terminal (7_UI_UX_DESIGN-REQ-UI-RISK-005).
- [ ] Verify that the progress calculation handles edge cases (0 total, current > total).

## 4. Run Automated Tests to Verify
- [ ] Run `npm test packages/cli/src/tui/components/StepProgress.test.tsx`.

## 5. Update Documentation
- [ ] Document the `StepProgress` component usage for showing research and implementation progress.

## 6. Automated Verification
- [ ] Verify the rendered output contains the expected number of block characters for a given percentage (e.g., 50% on a 10-character bar should have 5 blocks).
