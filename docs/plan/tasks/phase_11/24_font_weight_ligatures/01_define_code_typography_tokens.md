# Task: Define CSS Utility Classes for Code Block Typography (Sub-Epic: 24_Font_Weight_Ligatures)

## Covered Requirements
- [7_UI_UX_DESIGN-REQ-UI-DES-037-1], [7_UI_UX_DESIGN-REQ-UI-DES-037-2]

## 1. Initial Test Written
- [ ] Create a unit test for the Tailwind/CSS configuration to ensure that the `font-weight-450` (or similar) and `font-variant-ligatures: contextual` utility classes are defined and correctly mapped to their CSS properties.
- [ ] Write a test in a sandbox environment that attempts to render a dummy code block with these new utility classes and verifies that the computed styles match the requirements.

## 2. Task Implementation
- [ ] Modify the Tailwind CSS configuration (e.g., `tailwind.config.ts`) to include custom font weights: `450` and `500` if they are not already standard.
- [ ] Define a CSS utility class (e.g., `.code-ligatures`) in the global CSS file (e.g., `styles/globals.css`) that sets `font-variant-ligatures: contextual;`.
- [ ] Create a consolidated CSS class (e.g., `.devs-code-typography`) that combines the font-weight and ligature settings for easy application to code containers.

## 3. Code Review
- [ ] Verify that the custom font weights do not conflict with existing theme tokens.
- [ ] Ensure that `font-variant-ligatures: contextual` is only applied to monospaced fonts to avoid affecting narrative text.
- [ ] Confirm that the utility classes are correctly exported for use in the Webview components.

## 4. Run Automated Tests to Verify
- [ ] Execute `npm run test` (or the project's test runner) to verify the CSS configuration and utility class presence.

## 5. Update Documentation
- [ ] Update the design system documentation (e.g., `docs/design_system.md` or similar) to reflect the new code block typography standards.

## 6. Automated Verification
- [ ] Run a script that scans the built CSS output for the presence of the `.devs-code-typography` class and its associated properties (`font-weight: 450; font-variant-ligatures: contextual;`).
