# Task: Configure Typography for Narrative Blocks (ThoughtStreamer) (Sub-Epic: 23_Type_Scale_Body_Mono)

## Covered Requirements
- [7_UI_UX_DESIGN-REQ-UI-DES-035]

## 1. Initial Test Written
- [ ] Create a component test for `ThoughtStreamer` in `packages/webview/src/components/Console/__tests__/ThoughtStreamer.test.tsx`.
- [ ] Verify that the narrative blocks (rendered thoughts) have the class `leading-devs-narrative` applied.
- [ ] Assert that the computed `line-height` of the thought content is equivalent to `1.6 * font-size`.

## 2. Task Implementation
- [ ] Modify the `ThoughtStreamer` component in `packages/webview/src/components/Console/ThoughtStreamer.tsx`.
- [ ] Apply the `leading-devs-narrative` Tailwind class to the container or the `react-markdown` wrapper that renders the agent's internal reasoning.
- [ ] Ensure that nested paragraphs within the narrative block also inherit or explicitly use the 1.6 line-height.

## 3. Code Review
- [ ] Verify that the line-height is ONLY applied to narrative blocks and not accidentally to technical code blocks within the same component.
- [ ] Ensure the vertical rhythm facilitates scanning long chains of thought as per REQ-UI-DES-035-1.
- [ ] Check that the line-height doesn't break the virtual scrolling calculation if one is implemented.

## 4. Run Automated Tests to Verify
- [ ] Run `pnpm test` to verify the `ThoughtStreamer` component tests pass.

## 5. Update Documentation
- [ ] Update `packages/webview/src/components/Console/README.md` to document the use of `leading-devs-narrative` for the `ThoughtStreamer`.

## 6. Automated Verification
- [ ] Run a Playwright test to inspect a rendered `ThoughtStreamer` element and verify its computed `line-height`.
