# Task: Implement Modals Layer (Z-Index 300) (Sub-Epic: 31_Layered_Z_Index)

## Covered Requirements
- [7_UI_UX_DESIGN-REQ-UI-DES-049-Z3]

## 1. Initial Test Written
- [ ] Write an integration test for the `Modal` system to ensure all modals have a `z-index` of `300`.
- [ ] Assert that a modal (e.g., HITL Approval gate) covers both the Navigation (100) and Overlay (200) layers.
- [ ] Verify that background interactions are disabled when a Level 3 modal is active.

## 2. Task Implementation
- [ ] Extend the Tailwind CSS configuration to include a `z-modal` utility mapped to `300`.
- [ ] Apply the `z-modal` class (or `--devs-z-modal` CSS variable) to the following components:
    - `ApprovalGateModal`: Used for PRD/TAS sign-offs and task progression approvals.
    - `DiffReviewer`: The side-by-side diff view used during implementation review.
    - `StrategyPivotModal`: The analysis view shown when the system detects entropy and requests a pivot.
- [ ] Implement a `ModalBackdrop` component with a `z-index` of `299` (or just below the modal) to provide visual focus and block background clicks.

## 3. Code Review
- [ ] Ensure that modals are centered in the viewport and maintain their layering regardless of the underlying view.
- [ ] Verify that multiple stacked modals (if permitted) follow a consistent "Last-In, Top-Most" logic within the Level 3 range.
- [ ] Check that keyboard focus is trapped within the Level 3 modal when it is active.

## 4. Run Automated Tests to Verify
- [ ] Run the modal interaction and layering tests: `npm run test:ui -- --grep "z-index modal"`.
- [ ] Ensure the `ModalBackdrop` correctly dimms the underlying Navigation and Base layers.

## 5. Update Documentation
- [ ] Document the `Modal` component's z-index requirements in its `.agent.md` file.
- [ ] Update the Phase 11 design summary to include Level 3 as the primary "User Intervention" layer.

## 6. Automated Verification
- [ ] Run the `verify-layer-integrity.sh` script to confirm that Level 3 components are correctly prioritized over Level 2 and Level 1.
- [ ] Ensure the script validates the presence of the `z-modal` utility in the CSS bundle.
