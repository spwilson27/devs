# Task: Health Zone (System Telemetry Anchor) (Sub-Epic: 33_Persistent_Zones_Nav)

## Covered Requirements
- [7_UI_UX_DESIGN-REQ-UI-DES-044], [7_UI_UX_DESIGN-REQ-UI-DES-044-1]

## 1. Initial Test Written
- [ ] Create a Vitest suite `HealthZone.test.tsx`.
- [ ] Verify that the `HealthZone` component renders critical telemetry: Token usage (USD), Code Coverage, and Rate Limits.
- [ ] Write a test to ensure the Health Zone is positioned in the top-right quadrant of the Dashboard or as a fixed header element in the Main Viewport.
- [ ] Mock the telemetry data stream and verify that the UI updates in real-time when new data arrives.

## 2. Task Implementation
- [ ] Create a `HealthZone` component that serves as a persistent cognitive anchor for system health (Requirement `7_UI_UX_DESIGN-REQ-UI-DES-003-1`).
- [ ] Implement micro-visualizations (sparklines) or status dots for requirement fulfillment and resource consumption (Requirement `7_UI_UX_DESIGN-REQ-UI-DES-004-1`).
- [ ] Use `color-mix()` for backgrounds to create the "Glass-Box" effect (Requirement `7_UI_UX_DESIGN-REQ-UI-DES-018`).
- [ ] Integrate the `HealthZone` into the `DashboardView` and as a sticky element in other primary views to ensure it remains a "Telemetry Anchor."
- [ ] Use `var(--devs-warning)` or `var(--devs-error)` tokens for threshold alerts (e.g., budget > 80%).

## 3. Code Review
- [ ] Ensure that labels are authoritative and brief (e.g., "USD: $4.20", "COV: 85%").
- [ ] Verify that the component follows the `7_UI_UX_DESIGN-REQ-UI-DES-003` deterministic layout rule.
- [ ] Confirm that no decorative animations are used; only functional pulses for state changes are allowed.

## 4. Run Automated Tests to Verify
- [ ] Run `npm test` to execute the `HealthZone` suite.
- [ ] Verify that the telemetry values are correctly formatted (e.g., USD precision).

## 5. Update Documentation
- [ ] Document the telemetry data schema and how the `HealthZone` consumes it in the UI architecture docs.
- [ ] Update the Project DNA memory with the decision to use sparklines for real-time resource tracking.

## 6. Automated Verification
- [ ] Execute a script to validate that the `HealthZone` is rendered within the top-right quadrant of the dashboard and maintains its position during scrolling if configured as sticky.
- [ ] Verify that the component's `z-index` is higher than base content to prevent occlusion.
