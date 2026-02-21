# Task: Create Base TUI Layout Scaffolding (Sub-Epic: 04_TUI Framework & Styling Foundations)

## Covered Requirements
- [9_ROADMAP-TAS-701]

## 1. Initial Test Written
- [ ] Create a unit test for a `TUILayout` component.
- [ ] The test should verify that the `TUILayout` correctly renders a `Header`, `Main`, `Sidebar`, and `Footer` sub-component.
- [ ] The test should verify that the `Main` component receives children and renders them.
- [ ] Verify that the `Sidebar` is correctly positioned relative to the `Main` component.

## 2. Task Implementation
- [ ] Implement a `TUILayout` component using Ink's `Box` with `flexDirection="column"`.
- [ ] Create a `TUIHeader` component with `width="100%"` and `padding={1}`.
- [ ] Create a `TUIFooter` component with `width="100%"` and `position="absolute"` or `marginTop="auto"`.
- [ ] Create a `TUIBody` component with `flexDirection="row"`, `flexGrow={1}`.
- [ ] Create a `TUISidebar` component (within `TUIBody`) with a fixed or percentage width.
- [ ] Create a `TUIMain` component (within `TUIBody`) that takes children.
- [ ] Use `Box` borders (e.g., `borderStyle="single"` or `double`) to visually separate zones.
- [ ] Ensure that the layout is responsive to terminal width/height (Ink's `useStdout` or `useInput` for screen dimensions).

## 3. Code Review
- [ ] Verify that the layout components use the `TUIThemeProvider` colors (e.g., for borders or background).
- [ ] Ensure that the layout does not overflow the terminal screen and handles small terminals gracefully (e.g., hiding the sidebar).
- [ ] Check for proper use of `flexGrow` and `flexShrink` for consistent layout behavior.

## 4. Run Automated Tests to Verify
- [ ] Run the tests for `TUILayout` and its sub-components.
- [ ] Verify the layout structure with snapshots of the rendered Ink output.

## 5. Update Documentation
- [ ] Document the layout architecture and the purpose of each zone.
- [ ] Update the `AOD` (.agent.md) with guidelines for placing new features within the established layout zones.

## 6. Automated Verification
- [ ] Run a "Layout Preview" script that renders the base scaffolding with dummy content to the terminal.
- [ ] Verify visually that the borders, padding, and flex behavior align with the "Minimalist Authority" design philosophy.
