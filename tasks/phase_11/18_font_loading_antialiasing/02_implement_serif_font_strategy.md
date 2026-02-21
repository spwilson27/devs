# Task: System Serif Strategy & Semantic Marker Enforcement (Sub-Epic: 18_Font_Loading_Antialiasing)

## Covered Requirements
- [7_UI_UX_DESIGN-REQ-UI-DES-036-2], [7_UI_UX_DESIGN-REQ-UI-UNK-001]

## 1. Initial Test Written
- [ ] Create a Vitest test that verifies the `font-family` stack for the `ThoughtStreamer` (agent reasoning) component.
- [ ] Test should check that the stack includes `Georgia` and `serif`.
- [ ] Test should also verify that the component's font-family is NOT affected by global user-font settings or overrides (if they exist in the UI store/context).
- [ ] Test should ensure that no `@font-face` downloads are triggered by the application for these serif fonts (per the system-standard requirement).

## 2. Task Implementation
- [ ] Define the system serif stack: `Georgia, "Times New Roman", Times, serif`.
- [ ] Configure the `ThoughtStreamer` component (or its corresponding CSS class) to use this serif stack.
- [ ] If the project has a global "user-font-family" variable, ensure that the `ThoughtStreamer` explicitly ignores it to preserve its semantic identity (Requirement: [7_UI_UX_DESIGN-REQ-UI-UNK-001]).
- [ ] Avoid using any external font-loading libraries (like Google Fonts) for this serif stack.
- [ ] If using Tailwind CSS, add a `font-serif` override or a custom `font-agent-reasoning` family in `tailwind.config.js` that points to the system serif stack.

## 3. Code Review
- [ ] Confirm that no external font assets are bundled with the Webview for the serif fonts.
- [ ] Ensure the font-family is hardcoded or tied to a non-overridable constant to prevent user dilution of the visual hierarchy.
- [ ] Verify that the fallback to a generic `serif` is the final item in the font-family list.

## 4. Run Automated Tests to Verify
- [ ] Run the component unit tests: `npm run test:components`.
- [ ] Check the computed styles in the browser/Vitest environment to confirm the font-family stack.

## 5. Update Documentation
- [ ] Update `docs/ui_ux_design.md` or the agent "memory" to note that the serif font is a "Semantic Marker of Agency" and MUST NOT be overridable by users.
- [ ] Document the system-serif strategy as an optimization to avoid font download overhead.

## 6. Automated Verification
- [ ] Run a grep/search script to confirm that the `font-family` for the reasoning component contains `serif` as a fallback.
- [ ] Example: `grep -r "Georgia.*serif" src/components/ThoughtStreamer`
- [ ] Verify there are no `@import` or `<link>` tags pointing to external font providers in the Webview template.
