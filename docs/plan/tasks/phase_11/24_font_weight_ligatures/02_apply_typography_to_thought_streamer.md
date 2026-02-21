# Task: Apply Typography Styles to Code Block Containers (Sub-Epic: 24_Font_Weight_Ligatures)

## Covered Requirements
- [7_UI_UX_DESIGN-REQ-UI-DES-037], [7_UI_UX_DESIGN-REQ-UI-DES-037-1], [7_UI_UX_DESIGN-REQ-UI-DES-037-2]

## 1. Initial Test Written
- [ ] Create a unit test for the `ThoughtStreamer` or any code-rendering component (e.g., in `@devs/ui-components`) that verifies that the `<code>` and `<pre>` elements within the component's output have the required CSS classes for font weights and ligatures.
- [ ] Ensure that the tests cover both standard code blocks and syntax-highlighted code blocks (e.g., from `react-markdown` or `shiki`).

## 2. Task Implementation
- [ ] Locate the `ThoughtStreamer` and any other component that renders SAOP logs or code blocks in the Webview.
- [ ] Apply the previously defined CSS utility classes (e.g., `.devs-code-typography` or the separate font-weight and ligature classes) to all `<code>` and `<pre>` elements.
- [ ] If using a markdown renderer like `react-markdown`, customize the `components` prop to ensure that the code block wrapper includes the specific typography settings.
- [ ] Ensure that the font weight for code blocks is set to `450` or `500` and the `font-variant-ligatures` is set to `contextual;`.

## 3. Code Review
- [ ] Verify that the font weights are applied correctly and do not clash with syntax highlighting colors.
- [ ] Ensure that the typography settings are only applied to code-based telemetry, as per the hierarchy of agency rules.
- [ ] Confirm that the ligatures are only enabled for code blocks and not globally.

## 4. Run Automated Tests to Verify
- [ ] Execute the component unit tests to confirm the presence of the correct CSS classes in the rendered output.

## 5. Update Documentation
- [ ] Update the component documentation (e.g., `src/components/ThoughtStreamer.agent.md`) to reflect the typography implementation.

## 6. Automated Verification
- [ ] Run a React testing library script that selects code elements in the `ThoughtStreamer` and checks the computed `font-weight` and `font-variant-ligatures` properties in a JSDOM environment.
