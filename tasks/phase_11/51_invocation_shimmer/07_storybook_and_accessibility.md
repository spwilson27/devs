# Task: Storybook stories and accessibility checks for Invocation Shimmer (Sub-Epic: 51_Invocation_Shimmer)

## Covered Requirements
- [7_UI_UX_DESIGN-REQ-UI-DES-052-1]
- [7_UI_UX_DESIGN-REQ-UI-DES-052-2]
- [7_UI_UX_DESIGN-REQ-UI-DES-052-3]
- [7_UI_UX_DESIGN-REQ-UI-DES-052-4]

## 1. Initial Test Written
- [ ] Create Storybook stories at `src/components/InvocationShimmer/InvocationShimmer.stories.tsx` and add a Storybook snapshot test (`__tests__/InvocationShimmer.stories.test.tsx`) that:
  - Exposes four stories: `Idle`, `Active`, `Success`, `Failure`.
  - Uses Storybook's `@storybook/testing-react` or `@storybook/addon-storyshots` to take a snapshot of each story.
  - Adds an accessibility check using `@storybook/addon-a11y` or `axe-core` to assert there are no critical accessibility violations for each story (except reduced-motion where animations are intentionally disabled).
  - Confirm the snapshot/a11y tests fail before implementation.

## 2. Task Implementation
- [ ] Implement the four stories with deterministic props wired to `InvocationShimmer`:
  - `Idle`: `<InvocationShimmer active={false} status="idle" />`
  - `Active`: `<InvocationShimmer active status="active" />`
  - `Success`: `<InvocationShimmer active={false} status="success" />` (show the completion pop)
  - `Failure`: `<InvocationShimmer active={false} status="failure" />` (show the shake)
- [ ] Add Storybook knobs/controls to toggle reduced motion and demonstrate the component's reduced-motion behavior.
- [ ] Add simple visual snapshot tests (`@storybook/addon-storyshots`) to CI to prevent regressions.

## 3. Code Review
- [ ] Confirm each story demonstrates the exact visual requirement: linear-gradient for shimmer, 2px progress sweep for active, scale(1.02) on success, and ±4px shake on failure.
- [ ] Confirm reduced-motion control disables animations correctly and the a11y addon shows no critical violations.
- [ ] Confirm stories use the component API (props) and do not rely on internal state wiring.

## 4. Run Automated Tests to Verify
- [ ] Run Storybook snapshot tests locally (e.g., `npm run test:stories` or `npx -p @storybook/addon-storyshots node scripts/run-storyshots.js`) and the a11y checks; ensure zero failures.

## 5. Update Documentation
- [ ] Add a paragraph to `docs/components.md` with links to the four stories and a note about reduced-motion support and accessibility considerations.

## 6. Automated Verification
- [ ] Add storyshots to CI and assert the snapshot test job exits with code 0. Also run `axe` in CI against the four stories and assert zero critical violations.
