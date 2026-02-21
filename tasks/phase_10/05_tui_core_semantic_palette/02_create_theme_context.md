# Task: Implement Ink TUI Theme Provider (Sub-Epic: 05_TUI Core Semantic Palette)

## Covered Requirements
- [7_UI_UX_DESIGN-REQ-UI-DES-024-1], [7_UI_UX_DESIGN-REQ-UI-DES-024-2], [7_UI_UX_DESIGN-REQ-UI-DES-024-3], [7_UI_UX_DESIGN-REQ-UI-DES-024-4], [7_UI_UX_DESIGN-REQ-UI-DES-024-5]

## 1. Initial Test Written
- [ ] Create a component test in `packages/cli/src/tui/theme/__tests__/ThemeProvider.test.tsx` using `ink-testing-library`.
- [ ] Verify that a child component can access the semantic palette via the `useTheme` hook.
- [ ] Verify that the `useTheme` hook throws an error if used outside of a `ThemeProvider`.

## 2. Task Implementation
- [ ] Create `packages/cli/src/tui/theme/ThemeContext.tsx`.
- [ ] Implement a `ThemeProvider` component that accepts a `theme` prop (defaulting to the palette defined in Task 01).
- [ ] Implement a `useTheme` custom hook to consume the context.
- [ ] Export the `ThemeProvider` and `useTheme` hook.
- [ ] Ensure the context provides methods to resolve a semantic key to a usable `Ink` color prop (e.g., `resolveColor(key, variant)`).

## 3. Code Review
- [ ] Ensure the `ThemeProvider` is memoized to prevent unnecessary re-renders of the TUI tree.
- [ ] Verify that the `useTheme` hook has proper TypeScript return types.
- [ ] Check that the implementation follows React Context best practices.

## 4. Run Automated Tests to Verify
- [ ] Run `pnpm test packages/cli/src/tui/theme/__tests__/ThemeProvider.test.tsx` and ensure all tests pass.

## 5. Update Documentation
- [ ] Update the internal `AOD` (`.agent.md`) for the CLI module to document how to use the `useTheme` hook for styling new TUI components.

## 6. Automated Verification
- [ ] Run a linting check on the newly created files to ensure compliance with the project's TypeScript and React style guides.
