# Task: Define Z-Index and Layering Hierarchy (Sub-Epic: 32_Zone_Anchoring_Rules)

## Covered Requirements
- [7_UI_UX_DESIGN-REQ-UI-DES-049]
- [7_UI_UX_DESIGN-REQ-UI-DES-049-Z0]
- [7_UI_UX_DESIGN-REQ-UI-DES-049-Z1]
- [7_UI_UX_DESIGN-REQ-UI-DES-049-Z2]
- [7_UI_UX_DESIGN-REQ-UI-DES-049-Z3]
- [7_UI_UX_DESIGN-REQ-UI-DES-049-Z4]

## 1. Initial Test Written
- [ ] Create a Vitest unit test in `packages/vscode/webview/src/styles/z-index.test.ts` to verify the layering constants exist and are in the correct ascending order: Base (0) < Navigation (100) < Overlays (200) < Modals (300) < Critical (400).
- [ ] Create a Playwright E2E test to verify that a "Critical" overlay (e.g., a sandbox breach alert) appears above a "Modal" and that "Navigation" (sidebar/header) appears above the "Base" content.

## 2. Task Implementation
- [ ] Define the z-index hierarchy in `packages/vscode/webview/src/styles/variables.css` or a Tailwind configuration file using the specific values provided:
  - `z-base: 0` (Workspace, Dashboard tiles, Background logs)
  - `z-navigation: 100` (Sticky headers, Sidebar nav, Phase-stepper)
  - `z-overlays: 200` (Tooltips, active Whisper field, Tool call expansion)
  - `z-modals: 300` (HITL Approval gates, Diff reviewers, Strategy pivot analysis)
  - `z-critical: 400` (Sandbox Breach Alerts, System Crashes)
- [ ] Update the main React layout components in `packages/vscode/webview/src/layout/` to utilize these constants, ensuring no hardcoded z-index values exist in the codebase.
- [ ] Ensure that CSS `stacking-context` issues are handled, particularly for the DAG Canvas and the Sidebar, by using these constants correctly within their parent containers.

## 3. Code Review
- [ ] Verify that all z-index values are derived from the central configuration and that no `z-index: 9999` type "hacks" are present.
- [ ] Check that the layering correctly reflects the "Source of Truth" hierarchy: Human Directives and Critical Alerts must always be on top.

## 4. Run Automated Tests to Verify
- [ ] Run `npm run test:webview` to verify the unit tests for z-index constants.
- [ ] Run `npm run test:e2e` (Playwright) to verify visual layering in a headless browser.

## 5. Update Documentation
- [ ] Update `packages/vscode/webview/README.md` or a design system doc (if it exists) with the documented z-index hierarchy.
- [ ] Record the implementation of the layering strategy in the agent's memory for future UI task consistency.

## 6. Automated Verification
- [ ] Run a grep script `scripts/verify_z_index.sh` to search for any hardcoded `z-index` values in `.tsx` and `.css` files that do not reference the central variables.
