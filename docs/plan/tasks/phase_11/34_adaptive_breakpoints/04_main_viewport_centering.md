# Task: Implement main viewport centering (Sub-Epic: 34_Adaptive_Breakpoints)

## Covered Requirements
- [7_UI_UX_DESIGN-REQ-UI-DES-081-3]

## 1. Initial Test Written
- [ ] Create unit/component tests at src/ui/layout/__tests__/Layout.centering.test.tsx:
  - Render the main container and assert that at the "standard" breakpoint the main content has a max-width (e.g., 1200px) and horizontal margins set to auto (centered).
  - Test that when the sidebar is collapsed (from task 03) the main content expands to fill available space but stays centered within a max width.
  - Use getComputedStyle in the test environment (jsdom) or test that the correct CSS class/data attribute is present (e.g., data-centered="true").

## 2. Task Implementation
- [ ] Implement CSS and structural changes:
  - Add a wrapping element for the main viewport (e.g., <main className="devs-main">) and CSS:
    - .devs-main { margin-left: auto; margin-right: auto; max-width: 1200px; width: 100%; padding: var(--layout-padding); }
  - Ensure the Layout component applies a `data-centered="true"` attribute when the breakpoint is STANDARD or WIDE and when no modal/overlay requires full bleed.
  - Make the max-width configurable (CSS var --devs-main-max-width) so it can be tuned later.
- [ ] Ensure centering respects RTL by using logical margins and not absolute left/right values.

## 3. Code Review
- [ ] Verify the main centering is implemented using CSS (margin auto and max-width) rather than JS-driven positioning where possible to reduce layout thrash.
- [ ] Confirm responsive behavior: small screens (mobile) should disable centering (main uses full width) and center only at or above STANDARD breakpoint.
- [ ] Confirm no regressions with the DAG canvas or other full-bleed visualizations (those should be able to opt-out of centering via a prop).

## 4. Run Automated Tests to Verify
- [ ] Run unit tests: npx jest src/ui/layout/__tests__/Layout.centering.test.tsx
- [ ] Run an integration scenario: mount Layout with Sidebar collapsed and verify the DOM attributes/class names used for centering.

## 5. Update Documentation
- [ ] Add a "Main Viewport Centering" subsection to docs/ui/breakpoints.md describing the rule: center at STANDARD+, full bleed at mobile, opt-out prop for full-bleed components.

## 6. Automated Verification
- [ ] Add a CI step that runs the centering unit tests and an integration smoke test to assert the main element's computed class or attribute for centering.
- [ ] Provide a sample Storybook story (or static HTML) that demonstrates centered and full-bleed layouts for review.
