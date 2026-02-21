# Task: Integrate Semantic Prefixes & Color Fallbacks into TUI Components (Sub-Epic: 07_TUI Fallbacks & Color Modes)

## Covered Requirements
- [6_UI_UX_ARCH-REQ-080], [7_UI_UX_DESIGN-REQ-UI-DES-064]

## 1. Initial Test Written
- [ ] Create an integration test in `packages/cli/src/tui/__tests__/integration.test.tsx` that renders a `StatusBadge` and `ActionCard`.
- [ ] Verify that `StatusBadge` correctly applies the semantic color from `ColorMapper` and uses the appropriate `Glyph`.
- [ ] Verify that `LogTerminal` correctly prefixes lines with semantic glyphs and colors.

## 2. Task Implementation
- [ ] Update `StatusBadge` component in `packages/cli/src/tui/components/StatusBadge.tsx` to use the `Glyph` component and `ColorMapper`.
- [ ] Update `LogTerminal` component in `packages/cli/src/tui/components/LogTerminal.tsx` to handle semantic prefixes for different log types (Thought, Action, Observation).
- [ ] Apply `BoxDrawing` utility to `ActionCard` and `LogTerminal` containers to ensure borders degrade to ASCII if Unicode is not supported.
- [ ] Ensure that `7_UI_UX_DESIGN-REQ-UI-DES-064` (Semantic Prefixes) is fully respected in the implementation of the `LogTerminal` stream.

## 3. Code Review
- [ ] Verify that the TUI remains readable and functional in 16-color ASCII-only mode (e.g., standard Windows CMD or basic SSH sessions).
- [ ] Check contrast ratios in the 16-color mode.

## 4. Run Automated Tests to Verify
- [ ] Run `npm test packages/cli/src/tui` to ensure all components pass integration tests.

## 5. Update Documentation
- [ ] Update the `AOD` (`.agent.md`) for the TUI module to reflect how to add new semantic colors or glyphs.

## 6. Automated Verification
- [ ] Run `devs status` in a terminal with `TERM=dumb` (if supported by detection logic) and verify that the output is purely ASCII and readable.
