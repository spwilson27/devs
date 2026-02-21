# Task: Configure Typography for UI Navigation Elements (Sub-Epic: 23_Type_Scale_Body_Mono)

## Covered Requirements
- [7_UI_UX_DESIGN-REQ-UI-DES-035]

## 1. Initial Test Written
- [ ] Create an E2E test in `packages/webview/e2e/navigation_typography.spec.ts` to verify the line-height of navigation elements.
- [ ] Target the Sidebar and Phase Stepper components.
- [ ] Assert that these elements have a computed `line-height` of `1.2`.

## 2. Task Implementation
- [ ] Identify UI navigation components such as `Sidebar`, `PhaseStepper`, and `TabNav`.
- [ ] Apply the `leading-devs-navigation` Tailwind class to these components.
- [ ] Ensure that interactive targets within these components maintain the 1.2 line-height to support compact vertical spacing.

## 3. Code Review
- [ ] Verify that the 1.2 line-height is appropriate for the high-density UI navigation zones as per REQ-UI-DES-035-3.
- [ ] Ensure that text doesn't feel cramped in multi-line navigation items (if any).
- [ ] Check that the line-height works correctly with standard button heights (28px) and interactive target sizes (24px).

## 4. Run Automated Tests to Verify
- [ ] Run the E2E tests for navigation typography.

## 5. Update Documentation
- [ ] Update the `UI Architecture` documentation to list `leading-devs-navigation` as the standard for all navigation and structural UI elements.

## 6. Automated Verification
- [ ] Run a script to scan `packages/webview/src/components/Navigation/` for the use of `leading-devs-navigation`.
