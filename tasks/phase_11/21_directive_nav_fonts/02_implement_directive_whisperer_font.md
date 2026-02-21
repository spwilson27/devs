# Task: Apply Directive Font Intent to DirectiveWhisperer (Sub-Epic: 21_Directive_Nav_Fonts)

## Covered Requirements
- [7_UI_UX_DESIGN-REQ-UI-DES-017]

## 1. Initial Test Written
- [ ] Create a React Testing Library test for the `DirectiveWhisperer` component.
- [ ] The test should verify that the input field or text display for human directives uses the `font-directive` style (bold system font).
- [ ] Verify that the rendered component has the CSS class or style attribute corresponding to the "Human Directive" font intent.

## 2. Task Implementation
- [ ] Locate the `DirectiveWhisperer` component in the `@devs/vscode` Webview source (e.g., `src/webview/components/DirectiveWhisperer.tsx`).
- [ ] Apply the `font-directive` class (or equivalent defined in Task 01) to the primary input/textarea and any displayed directive history.
- [ ] Ensure that human-provided text is visually bold and uses the system font stack to differentiate it from agentic reasoning (which uses italic serif).

## 3. Code Review
- [ ] Verify the "Cognitive Distinction": Does the human directive stand out as an "Authority" element compared to the agent's "Narrative"?
- [ ] Check for accessibility: Ensure the bold system font maintains high contrast and legibility at standard font sizes.

## 4. Run Automated Tests to Verify
- [ ] Run the component tests: `npm test src/webview/components/DirectiveWhisperer.test.tsx`.

## 5. Update Documentation
- [ ] Update the component's AOD (`DirectiveWhisperer.agent.md`) to document its use of the Directive font intent for human inputs.

## 6. Automated Verification
- [ ] Use a DOM-snapshot or style-checking script to confirm the `DirectiveWhisperer` element in the test environment has `font-weight: 700` and the system font stack applied.
