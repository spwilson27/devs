# Task: Implement Focus Visuals (Double-line Borders) (Sub-Epic: 15_TUI Specific Hotkeys & Focus)

## Covered Requirements
- [7_UI_UX_DESIGN-REQ-UI-DES-067]

## 1. Initial Test Written
- [ ] Write integration tests for the `ActionCard` and `ZoneWrapper` components.
- [ ] Mock the global focus state and verify that when a zone (e.g., `ROADMAP`) is focused, its border style switches to "double" (`║`, `═`, etc.).
- [ ] Verify that when focus is lost (e.g., switched via `TAB`), the border style reverts to "single" (`│`, `─`, etc.).
- [ ] Simulate focus changes and verify the rendered output (via `ink-testing-library`'s `lastFrame()` snapshot).
- [ ] Test that while a zone is focused, its title or header also reflects the focus state (e.g., using the `Thinking` Magenta color).

## 2. Task Implementation
- [ ] Update the `ActionCard` primitive component in `@devs/cli/tui/primitives` to support a `isFocused` prop.
- [ ] Implement conditional border logic using Unicode box-drawing characters:
    - Focused: `╔`, `╗`, `╚`, `╝`, `║`, `═`
    - Unfocused: `┌`, `┐`, `└`, `┘`, `│`, `─`
- [ ] Apply the `isFocused` state to all main layout zones (`Header`, `Sidebar`, `Console`, `Footer`).
- [ ] Use the `focusManager` context to automatically pass the `isFocused` state to the correct zone wrapper.
- [ ] Integrate with the `Theme` or `Palette` to ensure focused borders use a distinct color (e.g., Magenta) for maximum visibility.

## 3. Code Review
- [ ] Verify that double-line borders are visually distinct and correctly represent the "Active Focus" state.
- [ ] Ensure that border transitions are smooth and do not cause layout "jitter" or content shifting.
- [ ] Check for ASCII fallbacks if the terminal does not support Unicode box-drawing (as per Sub-Epic 7).

## 4. Run Automated Tests to Verify
- [ ] Run `npm test` and ensure all border-related visual tests pass.
- [ ] Compare snapshots of focused vs. unfocused zones to verify correct character usage.

## 5. Update Documentation
- [ ] Document the focus visual system in the TUI design system guide.
- [ ] Ensure the AOD reflects how "Active Focus" is represented to agents.

## 6. Automated Verification
- [ ] Run a script that captures a frame of the TUI while the `Roadmap` is focused and verifies the presence of the `║` character (ANSI-redacted if necessary).
