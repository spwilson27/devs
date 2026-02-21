# Task: Apply Navigation Font Intent and Line Height to UI Components (Sub-Epic: 21_Directive_Nav_Fonts)

## Covered Requirements
- [7_UI_UX_DESIGN-REQ-UI-DES-018], [7_UI_UX_DESIGN-REQ-UI-DES-035-3]

## 1. Initial Test Written
- [ ] Create integration tests for the `Sidebar` and `Dashboard` components.
- [ ] Verify that navigation items (links, tabs, buttons in sidebar) and dashboard tiles use the `font-nav` style.
- [ ] Specifically test that these elements have a computed `line-height` of `1.2`.

## 2. Task Implementation
- [ ] Identify all UI navigation zones: Sidebar menus, Phase stepper, Dashboard tile headers, and Tab bars.
- [ ] Apply the `font-nav` class (or equivalent) to these elements.
- [ ] Explicitly set `line-height: 1.2` for these components to ensure a compact, technical UI as per `7_UI_UX_DESIGN-REQ-UI-DES-035-3`.
- [ ] Ensure that labels and metadata within these zones also follow the navigation font intent.

## 3. Code Review
- [ ] Verify that the compact line-height (1.2) does not cause text clipping or overlap in CJK scripts or at high zoom levels.
- [ ] Ensure the "Navigation Zone" (Level 3: Environmental Fact/Platform) is visually distinct from the "Active Reasoning Zone".
- [ ] Check for consistency across all navigation elements in the multi-pane architecture.

## 4. Run Automated Tests to Verify
- [ ] Run the sidebar and dashboard tests: `npm test` or specific component test suites.

## 5. Update Documentation
- [ ] Update the global UI style guide in `docs/` or the extension's `README.md` to specify the line-height requirements for navigation elements.

## 6. Automated Verification
- [ ] Run a Playwright or Puppeteer script that traverses the Webview and asserts that elements with the navigation role or within the sidebar have a `line-height` of `1.2` (converted to px based on font-size).
