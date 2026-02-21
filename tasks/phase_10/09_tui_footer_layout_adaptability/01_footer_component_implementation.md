# Task: TUI Footer Component Implementation (Sub-Epic: 09_TUI Footer & Layout Adaptability)

## Covered Requirements
- [7_UI_UX_DESIGN-REQ-UI-DES-061-4]

## 1. Initial Test Written
- [ ] Create a unit test for the `Footer` component using `ink-testing-library` in `packages/cli/src/tui/components/__tests__/Footer.test.tsx`.
- [ ] Test that the component renders a horizontal box at the bottom of the screen.
- [ ] Test that it displays common command shortcuts: `(P)ause`, `(R)esume`, `(H)elp`, and `(/) Whisper`.
- [ ] Test that shortcuts are styled with a specific "Metadata" color (e.g., grey) as per the TUI palette.
- [ ] Test that the component accepts a `shortcuts` prop to allow dynamic updates based on the current application state (e.g., showing "(R)esume" only when paused).

## 2. Task Implementation
- [ ] Implement the `Footer` component in `packages/cli/src/tui/components/Footer.tsx` using `ink` primitives (`Box`, `Text`).
- [ ] Use `Flexbox` to ensure the footer spans the full width of the terminal.
- [ ] Integrate with the `Theme` provider or constants to apply the consistent TUI color palette (specifically the metadata color for shortcut keys).
- [ ] Ensure the footer text is concise and follows the "Minimalist Authority" philosophy (e.g., `P Pause  R Resume  H Help  / Whisper`).
- [ ] Export the `Footer` component for use in the main layout.

## 3. Code Review
- [ ] Verify the component is purely presentational and doesn't contain business logic.
- [ ] Ensure the use of `Box` and `Text` follows the established patterns in other TUI components.
- [ ] Check that the component handles very narrow terminal widths gracefully (e.g., by wrapping or truncating shortcuts).

## 4. Run Automated Tests to Verify
- [ ] Run `npm test packages/cli/src/tui/components/__tests__/Footer.test.tsx` and ensure all tests pass.

## 5. Update Documentation
- [ ] Update the `TUI_COMPONENTS.md` or similar documentation in `@devs/cli` to include the `Footer` component.
- [ ] Record the shortcut key conventions in the agent's memory for future TUI work.

## 6. Automated Verification
- [ ] Execute a script that renders the component to a string and validates the presence of the expected shortcut labels using a regex pattern.
