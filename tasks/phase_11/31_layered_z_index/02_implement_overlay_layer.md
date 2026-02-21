# Task: Implement Overlays Layer (Z-Index 200) (Sub-Epic: 31_Layered_Z_Index)

## Covered Requirements
- [7_UI_UX_DESIGN-REQ-UI-DES-049-Z2]

## 1. Initial Test Written
- [ ] Write a test to verify that tooltips and ephemeral overlays correctly stack above the Navigation layer (Level 1).
- [ ] Create a test case for the `DirectiveWhisperer` (active state) to ensure it has a `z-index` of `200`.
- [ ] Assert that tooltip previews are visible even when hovering over items in a sticky header or sidebar.

## 2. Task Implementation
- [ ] Extend the Tailwind CSS configuration to include a `z-overlay` utility mapped to `200`.
- [ ] Apply the `z-overlay` class (or `--devs-z-overlay` CSS variable) to the following components:
    - `Tooltip`: Use for all hover-based previews and AOD summaries.
    - `DirectiveWhisperer`: Apply when the field is focused/active to ensure it sits above navigation bars.
    - `ToolCallExpansion`: Ensure expanded tool logs/details in the console view stack correctly over base content.
- [ ] Ensure that overlay components (like tooltips) are rendered via a React Portal to avoid parent stacking context issues.

## 3. Code Review
- [ ] Verify that overlays correctly overlap the Sidebar and Sticky headers without clipping.
- [ ] Ensure that the `DirectiveWhisperer` does not obscure critical HITL buttons unless it is the primary interaction point.
- [ ] Check for high-contrast accessibility (WCAG 2.1) to ensure borders are clear on overlays when stacked.

## 4. Run Automated Tests to Verify
- [ ] Execute the overlay stacking tests: `npm run test:ui -- --grep "z-index overlay"`.
- [ ] Confirm that tooltips are correctly positioned and layered in the DOM.

## 5. Update Documentation
- [ ] Update the `Tooltip` and `DirectiveWhisperer` component documentation to specify their Z-index level (Level 2).
- [ ] Reflect the "Overlay Layer" purpose in the project's design system documentation.

## 6. Automated Verification
- [ ] Run a style audit script to verify that `z-index: 200` is applied to elements with the `z-overlay` class.
- [ ] Validate that no two overlays are competing for the same layer without a clear definition.
