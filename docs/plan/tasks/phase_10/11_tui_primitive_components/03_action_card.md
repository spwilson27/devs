# Task: Implement ActionCard Primitive (Sub-Epic: 11_TUI Primitive Components)

## Covered Requirements
- [6_UI_UX_ARCH-REQ-104]

## 1. Initial Test Written
- [ ] Create a Vitest unit test in `packages/cli/src/tui/components/ActionCard.test.tsx`.
- [ ] Verify:
    - Rendering of children within the card.
    - Rendering of a border around the content.
    - Switching to a "double-line" border (Unicode box-drawing) when the `isFocused` prop is true (7_UI_UX_DESIGN-REQ-UI-DES-067).
    - Rendering of an optional title in the border top.

## 2. Task Implementation
- [ ] Implement `ActionCard` in `packages/cli/src/tui/components/ActionCard.tsx`.
- [ ] Utilize `ink-box` or a custom `Box` wrapper with border implementation.
- [ ] Implement a `borderStyle` mapping that switches between `single` and `double` based on focus state.
- [ ] Support a `title` prop that renders within the top border line.
- [ ] Ensure the card uses Flexbox to expand or shrink based on parent constraints.

## 3. Code Review
- [ ] Confirm that Unicode box-drawing characters are used correctly (7_UI_UX_DESIGN-REQ-UI-DES-065).
- [ ] Verify that focus visualization is distinct and follows the design spec.

## 4. Run Automated Tests to Verify
- [ ] Run `npm test packages/cli/src/tui/components/ActionCard.test.tsx`.

## 5. Update Documentation
- [ ] Update the CLI TUI design system documentation with the `ActionCard` component.

## 6. Automated Verification
- [ ] Run a script that renders two `ActionCard` components (one focused, one not) and verifies the presence of double-line vs single-line Unicode characters in the output stream.
