# Task: Implement IconButton Primitive (Sub-Epic: 11_TUI Primitive Components)

## Covered Requirements
- [6_UI_UX_ARCH-REQ-106]

## 1. Initial Test Written
- [ ] Create a Vitest unit test in `packages/cli/src/tui/components/IconButton.test.tsx`.
- [ ] Use `ink-testing-library` to verify:
    - Rendering of the icon (Unicode) and label.
    - Fallback to ASCII icons when a `useAscii` prop is true or terminal detection suggests limited support (7_UI_UX_DESIGN-REQ-UI-DES-064).
    - Display of the hotkey hint (e.g., "[P]") if provided.
    - Proper spacing between the icon and the text.

## 2. Task Implementation
- [ ] Implement the `IconButton` component in `packages/cli/src/tui/components/IconButton.tsx`.
- [ ] Support props: `icon: string`, `label: string`, `hotkey?: string`, `asciiIcon?: string`.
- [ ] Use `ink`'s `Text` and `Box` for layout.
- [ ] Implement logic to switch between `icon` and `asciiIcon` based on terminal capabilities or explicit prop.
- [ ] Style the hotkey part with a different color (Metadata/Grey) to distinguish it from the label.

## 3. Code Review
- [ ] Ensure the component follows the layout constraints for footer command shortcuts (7_UI_UX_DESIGN-REQ-UI-DES-061-4).
- [ ] Check for proper alignment and padding to ensure a "polished" look.

## 4. Run Automated Tests to Verify
- [ ] Run `npm test packages/cli/src/tui/components/IconButton.test.tsx` and ensure all tests pass.

## 5. Update Documentation
- [ ] Document the `IconButton` primitive in the CLI TUI component library section of the project documentation.

## 6. Automated Verification
- [ ] Use `ink-testing-library`'s `lastFrame()` to verify the rendered string contains both the icon/fallback and the label.
