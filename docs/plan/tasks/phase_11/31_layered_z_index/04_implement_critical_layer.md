# Task: Implement Critical Alerts Layer (Z-Index 400) (Sub-Epic: 31_Layered_Z_Index)

## Covered Requirements
- [7_UI_UX_DESIGN-REQ-UI-DES-049-Z4]

## 1. Initial Test Written
- [ ] Write a high-priority test to verify that "Critical Alerts" (Level 4) take absolute precedence over all other UI layers.
- [ ] Simulate a `SANDBOX_BREACH` event and assert that the alert overlay has a `z-index` of `400`.
- [ ] Assert that a Critical Alert covers any active modals (Level 3) or overlays (Level 2).

## 2. Task Implementation
- [ ] Extend the Tailwind CSS configuration to include a `z-critical` utility mapped to `400`.
- [ ] Apply the `z-critical` class (or `--devs-z-critical` CSS variable) to the following components:
    - `SecurityAlertOverlay`: The "Red Screen" displayed during a sandbox breach or security violation.
    - `SystemCrashOverlay`: The error screen displayed when the orchestrator or extension host encounters an unrecoverable failure.
- [ ] Ensure these overlays use `position: fixed` and cover the `inset-0` (entire viewport) to prevent any user interaction with compromised or broken states.

## 3. Code Review
- [ ] Verify that the `z-critical` layer is the highest z-index used in the entire application.
- [ ] Ensure that the styling for Level 4 alerts follows the "Red Screen" security design requirements (Phase 11: `7_UI_UX_DESIGN-REQ-UI-DES-122`).
- [ ] Check that these alerts cannot be dismissed by clicking the backdrop or pressing `Escape` unless the underlying state is resolved.

## 4. Run Automated Tests to Verify
- [ ] Run the security alert layering tests: `npm run test:ui -- --grep "z-index critical"`.
- [ ] Confirm that no other component can overlap the `SecurityAlertOverlay`.

## 5. Update Documentation
- [ ] Update the security and error handling documentation to specify that Level 4 (Critical) is reserved for system-level failures.
- [ ] Document the visual and technical specifications for the `SecurityAlertOverlay` in its respective AOD file.

## 6. Automated Verification
- [ ] Run the final Z-index audit script to ensure the hierarchy `Z0 < Z1 < Z2 < Z3 < Z4` is strictly enforced.
- [ ] Verify that `z-index: 400` is only used for the approved critical alert components.
