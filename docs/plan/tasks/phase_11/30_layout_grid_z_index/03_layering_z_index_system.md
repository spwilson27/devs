# Task: Implement Z-Index Layering System (Sub-Epic: 30_Layout_Grid_Z_Index)

## Covered Requirements
- [7_UI_UX_DESIGN-REQ-UI-DES-043], [7_UI_UX_DESIGN-REQ-UI-DES-049-Z0]

## 1. Initial Test Written
- [ ] Create a CSS regression test or a unit test in `@devs/vscode` to verify that the defined Z-index constants are applied correctly to the UI layers.
- [ ] Verify that the `Base` layer has a Z-index of 0.
- [ ] Verify that components within the `Base` layer (e.g., Dashboard tiles, background logs) do not overlap with navigation or overlays incorrectly.
- [ ] Check for "Z-index wars" by verifying that all layers use the defined constants rather than arbitrary high numbers.

## 2. Task Implementation
- [ ] Define the Z-index hierarchy in a centralized constants file or Tailwind configuration:
    - `Base`: 0 (Workspace, Dashboard tiles, background logs). [7_UI_UX_DESIGN-REQ-UI-DES-049-Z0]
    - (Include placeholders for other levels to satisfy the zone hierarchy requirement [7_UI_UX_DESIGN-REQ-UI-DES-043]).
- [ ] Apply the `z-0` (or equivalent CSS class) to the `MainViewport` content and background terminal elements.
- [ ] Implement a system-wide "Layering Policy" that ensures UI elements reflect the Agency hierarchy (Human Authority > Agent Autonomy > Environmental Fact).
- [ ] Use CSS variables for Z-indices (e.g., `--devs-z-base`, `--devs-z-nav`) to ensure easy overrides and theme awareness.

## 3. Code Review
- [ ] Verify that no hardcoded Z-index values are used in component styles.
- [ ] Ensure that the `z-index` values follow a logical increment (e.g., 0, 100, 200, 300, 400).
- [ ] Check that the layering correctly handles complex visualizations like the DAGCanvas and its interaction with overlays.

## 4. Run Automated Tests to Verify
- [ ] Execute the CSS validation tests: `npm test -- --grep "z-index"`.
- [ ] Manually verify layering by inspecting the elements in the VSCode Webview DevTools.

## 5. Update Documentation
- [ ] Update the UI/UX Design system documentation in `docs/` or the agent "memory" to reflect the Z-index layering policy and levels.
- [ ] Update `.agent.md` for layout and overlay components to document their expected Z-index level.

## 6. Automated Verification
- [ ] Run a script that scans the CSS bundle and verifies that only the approved Z-index constants are present.
- [ ] Verify the script output shows "Z-index validation: 100% compliant with layering policy".
