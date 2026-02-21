# Task: Enforce No-Drawer Policy for Core Architectural State (Sub-Epic: 32_Zone_Anchoring_Rules)

## Covered Requirements
- [7_UI_UX_DESIGN-REQ-UI-DES-003-2]

## 1. Initial Test Written
- [ ] Create a Playwright test in `tests/e2e/layout/no-drawer-policy.spec.ts` that navigates to the "Phase 2 (Design)" and "Phase 3 (Distill)" states.
- [ ] Verify that the "TAS/PRD status" indicators (completion/sign-off status) are visible in the main viewport or anchored sidebar without any user interaction (no clicks or hovers required).
- [ ] Add a check to ensure no "Drawer" or "Modal" component is used to store primary architectural status during the implementation phase.

## 2. Task Implementation
- [ ] Audit the `DASHBOARD`, `SPEC_VIEW`, and `ROADMAP` components to identify any core state hidden behind interactive elements.
- [ ] Refactor the `RequirementMappingBadge` and `ArchitecturalSignOff` components to be anchored within the "Epic Roadmap" sidebar or the "Main Viewport" header.
- [ ] Move any "secondary editing" tools into drawers if necessary, but leave the "status" indicators fixed and persistent.
- [ ] Ensure that even when the "Right Sidebar" is collapsed, core architectural status remains visible in the "Main Viewport" or "Left Sidebar".

## 3. Code Review
- [ ] Verify that architectural decisions (TAS/PRD) are always auditable at a glance.
- [ ] Ensure that no "Hamburger Menus" or hidden panels contain critical project telemetry.

## 4. Run Automated Tests to Verify
- [ ] Run `npm run test:e2e` to verify the persistent visibility of core project state.
- [ ] Perform a manual walk-through of the UI in all 5 project phases to confirm adherence to the no-drawer policy.

## 5. Update Documentation
- [ ] Add the "No-Drawer Policy" rule to the `packages/vscode/webview/docs/UI_CONVENTIONS.md` document.
- [ ] Confirm compliance with the policy in the agent's long-term memory for architectural consistency.

## 6. Automated Verification
- [ ] Execute `scripts/audit_drawers.sh` to search for components like `Drawer`, `Modal`, or `Accordion` and verify they do not contain the strings "TAS", "PRD", or "Requirement ID" as their primary content.
