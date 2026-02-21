# Task: Implement Fixed Zone Architecture and Telemetry Anchors (Sub-Epic: 32_Zone_Anchoring_Rules)

## Covered Requirements
- [7_UI_UX_DESIGN-REQ-UI-DES-003]
- [7_UI_UX_DESIGN-REQ-UI-DES-003-1]
- [7_UI_UX_DESIGN-REQ-UI-DES-045]
- [7_UI_UX_DESIGN-REQ-UI-DES-045-1]
- [7_UI_UX_DESIGN-REQ-UI-DES-045-2]
- [7_UI_UX_DESIGN-REQ-UI-DES-045-3]
- [7_UI_UX_DESIGN-REQ-UI-DES-045-4]

## 1. Initial Test Written
- [ ] Create a Playwright test in `tests/e2e/layout/layout-anchors.spec.ts` to verify that the "Health zone" (Top-right quadrant) remains stationary while the main viewport scrolls.
- [ ] Add an assertion to check that the "Epic Roadmap" sidebar remains fixed and resizable within the specified width (`280px`).
- [ ] Verify that the "Bottom Console" is persistent and resizable (`240px` default).

## 2. Task Implementation
- [ ] Implement a `FixedLayoutContainer` in `packages/vscode/webview/src/layout/` using CSS Grid or Flexbox to define the persistent zones.
- [ ] Define and anchor the following regions:
  - **Left Sidebar**: `Epic Roadmap / Map` with a resizable width (`280px`).
  - **Main Viewport**: `Focus (Dashboard/DAG/Spec)` with `flex-grow: 1`.
  - **Right Sidebar**: `Auxiliary (Logs/Docs)` with a collapsible width (`320px`).
  - **Bottom Console**: `Terminal / Thought Stream` with a resizable height (`240px`).
- [ ] Ensure "System Health" telemetry (Token budgets, Rate limits) is anchored in the top-right quadrant of the main viewport or a dedicated header region.
- [ ] Implement resizability for the Sidebar and Console using a custom `Resizer` component that preserves the layout state via `vscode.getState`.

## 3. Code Review
- [ ] Verify that the "Left Sidebar" is reserved specifically for "Context & Navigation" and is always accessible.
- [ ] Ensure that no other components overlay or hide the anchored telemetry regions.
- [ ] Check for responsive reflow logic (e.g., hiding the Right Sidebar on smaller widths).

## 4. Run Automated Tests to Verify
- [ ] Run `npm run test:e2e` to confirm the layout zones are persistent and correctly positioned.
- [ ] Perform a manual check of the resizers to ensure they work smoothly without content jumping.

## 5. Update Documentation
- [ ] Update the UI architecture document in `docs/ui/layout_regions.md` with the new fixed zone definitions.
- [ ] Confirm the anchoring rules in the agent's medium-term memory for layout-related tasks.

## 6. Automated Verification
- [ ] Execute `scripts/validate_layout.sh` to check for `fixed` and `absolute` positioning on the defined telemetry and roadmap zones.
