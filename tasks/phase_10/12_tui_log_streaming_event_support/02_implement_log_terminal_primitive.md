# Task: Implement LogTerminal Ink Primitive (Sub-Epic: 12_TUI Log Streaming & Event Support)

## Covered Requirements
- [6_UI_UX_ARCH-REQ-105]

## 1. Initial Test Written
- [ ] Create a Vitest/Ink-testing-library test for the `LogTerminal` component.
- [ ] Verify that it renders a basic list of strings provided as props.
- [ ] Verify that it applies correct colors based on log metadata (e.g., magenta for "Thoughts", red for "Errors" using Chalk).
- [ ] Verify that it respects the box-model constraints (width/height) passed via Ink `Box` props.

## 2. Task Implementation
- [ ] Create `packages/cli/src/tui/components/LogTerminal.tsx`.
- [ ] Use Ink's `Box` and `Text` components to build the log viewport.
- [ ] Implement semantic prefixing (e.g., `[THOUGHT]`, `[ACTION]`) with appropriate `Chalk` colors as defined in `7_UI_UX_DESIGN-REQ-UI-DES-024`.
- [ ] Ensure the component supports "indented blocks" for nested logs as per `7_UI_UX_DESIGN-REQ-UI-DES-065-2`.
- [ ] Add support for "Unicode fallbacks" if the terminal doesn't support advanced characters.

## 3. Code Review
- [ ] Check for efficient rendering; use `React.memo` if the log list grows large.
- [ ] Ensure that the component doesn't wrap lines in a way that breaks semantic prefixes.
- [ ] Verify that the styling aligns with the "Minimalist Authority" philosophy.

## 4. Run Automated Tests to Verify
- [ ] Run `npm test LogTerminal.test.tsx`.

## 5. Update Documentation
- [ ] Register the `LogTerminal` component in the `@devs/cli` component library documentation.

## 6. Automated Verification
- [ ] Render the component with a sample set of logs and capture the output using `ink-testing-library`'s `lastFrame()` to verify the ANSI codes and layout match expectations.
