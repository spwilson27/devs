# Task: Implement StandardButton component with accessible metrics and variants (Sub-Epic: 43_Interactive_Targets)

## Covered Requirements
- [7_UI_UX_DESIGN-REQ-UI-DES-048], [7_UI_UX_DESIGN-REQ-UI-DES-048-2]

## 1. Initial Test Written
- [ ] Write a unit test at packages/ui/src/components/StandardButton/__tests__/StandardButton.test.tsx using @testing-library/react:
  - Render <StandardButton aria-label="save">Save</StandardButton>
  - Assert getByRole('button', { name: /save/i }) exists
  - Assert the button element has class "btn-standard" and attribute data-interactive-size="24"
  - Add an accessibility snapshot: expect(container).toMatchSnapshot()
- [ ] Ensure the test is runnable with the project test command: npm test -- packages/ui -- -t StandardButton

## 2. Task Implementation
- [ ] Implement the component file packages/ui/src/components/StandardButton/StandardButton.tsx with these exact requirements:
  - Expose a React component StandardButton(props) that renders a <button> (or <a role="button"> when necessary) and accepts standard button props (onClick, type, disabled, className, children, aria-label).
  - Apply the canonical utility class "btn-standard" and set data-interactive-size attribute using tokens.interactiveTargetSize (e.g., data-interactive-size="24").
  - Default props: type="button"; ensure forwarded ref support for focus management.
  - Do not use inline pixel literals for the interactive size—read the value from packages/ui/src/design/tokens.ts.
- [ ] Add a Storybook story: packages/ui/src/components/StandardButton/StandardButton.stories.tsx demonstrating primary/secondary/icon-only variants and keyboard focus state.

## 3. Code Review
- [ ] Verify component exposes a clear public API, includes forwarded ref, and uses design tokens (no magic values).
- [ ] Confirm accessibility: role, aria-label behaviour, keyboard interaction, and visible focus styles consistent with design tokens.
- [ ] Confirm visual parity with storybook snapshot and that the component uses theme variables rather than hardcoded colors.

## 4. Run Automated Tests to Verify
- [ ] Run: npm test -- packages/ui -- -t StandardButton and validate all new tests pass.
- [ ] Run Storybook locally: npm run --workspace packages/ui storybook (or project equivalent) and visually confirm focus ring and size targets.

## 5. Update Documentation
- [ ] Add a component README at packages/ui/src/components/StandardButton/README.md describing API, examples of use, and accessibility notes (including the interactive target rationale and how to compose icon-only buttons to meet 24px target).

## 6. Automated Verification
- [ ] Add a CI job or npm script that runs the StandardButton jest tests and a lightweight axe check (jest-axe) against the component story to assert no critical a11y violations related to focus or role.