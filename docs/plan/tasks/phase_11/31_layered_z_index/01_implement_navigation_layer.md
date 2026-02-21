# Task: Implement Navigation Layer (Z-Index 100) (Sub-Epic: 31_Layered_Z_Index)

## Covered Requirements
- [7_UI_UX_DESIGN-REQ-UI-DES-049-Z1]

## 1. Initial Test Written
- [ ] Create a Playwright or Vitest/React-Testing-Library test to verify the stacking order of Navigation components.
- [ ] Assert that the Sidebar navigation, Sticky headers, and Phase Stepper have a computed `z-index` of `100`.
- [ ] Assert that these components correctly overlap content in the Base layer (Level 0) when scrolling or positioned absolutely.

## 2. Task Implementation
- [ ] Extend the Tailwind CSS configuration in the VSCode Webview project to include a semantic `z-nav` utility mapped to `100`.
- [ ] Apply the `z-nav` class (or equivalent CSS variable `--devs-z-nav`) to the following components:
    - `SidebarNav`: Ensure the main navigation sidebar remains above the dashboard content.
    - `StickyHeader`: Ensure view-specific headers (e.g., in the Spec or Research views) remain visible during scroll.
    - `PhaseStepper`: Apply to the fixed progress indicator at the top of the implementation view.
- [ ] Ensure that these components use `position: sticky` or `position: fixed` where appropriate to maintain their visual layer.

## 3. Code Review
- [ ] Verify that no components in this layer use hardcoded `z-index` values; they must all use the `z-nav` utility or CSS variable.
- [ ] Ensure that the stacking context is not broken by parent elements with `overflow: hidden` or unrelated `z-index` assignments.
- [ ] Check for visual consistency across different VSCode themes (Dark, Light, High Contrast).

## 4. Run Automated Tests to Verify
- [ ] Run the UI tests: `npm run test:ui -- --grep "z-index navigation"`.
- [ ] Verify that all tests for z-index layering pass.

## 5. Update Documentation
- [ ] Update the UI component documentation (AOD) for `SidebarNav`, `StickyHeader`, and `PhaseStepper` to reflect their assigned z-index level (Level 1).
- [ ] Ensure the global style guide in `docs/ui/layering.md` lists these components as examples of Level 1.

## 6. Automated Verification
- [ ] Run the `validate-styles.sh` script (or equivalent) to ensure `z-index: 100` is correctly applied to the targeted components in the final build.
- [ ] Verify the output confirms no z-index regressions in the Navigation layer.
