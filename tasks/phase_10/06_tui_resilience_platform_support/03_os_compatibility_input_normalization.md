# Task: OS Compatibility and Input Normalization (Sub-Epic: 06_TUI Resilience & Platform Support)

## Covered Requirements
- [6_UI_UX_ARCH-REQ-014]

## 1. Initial Test Written
- [ ] Create unit tests that mock `process.platform` as 'darwin', 'linux', and 'win32'.
- [ ] Verify that a `KeybindingMapper` returns correctly formatted hotkey descriptions (e.g., using symbols on macOS and text labels on Windows).
- [ ] Write tests to verify that path separators and line endings in TUI log views are handled correctly according to the detected OS.
- [ ] Mock different terminal emulators (e.g., Windows Terminal vs. classic CMD) and verify that color mapping adapts if needed.

## 2. Task Implementation
- [ ] Implement `PlatformManager` in `@devs/cli/tui/utils/platform.ts` to centralize OS-specific logic.
- [ ] Create a `KeybindingMapper` that normalizes inputs for the TUI (e.g., mapping `Ctrl+P` for Pause across platforms, but adjusting the UI hint to say "Ctrl+P" or "Cmd+P" if applicable, though TUI is primarily Ctrl).
- [ ] Ensure that box-drawing characters used for `ActionCard` and `LogTerminal` borders are compatible with standard Windows fonts (or use the ASCII fallback system from Task 01).
- [ ] Implement a "Platform Audit" check in `devs doctor` that verifies font rendering and terminal compatibility.

## 3. Code Review
- [ ] Verify that no OS-specific code is hardcoded in the main component logic; all should go through the `PlatformManager`.
- [ ] Ensure that keybinding listeners in `Ink` use the normalized mapping.
- [ ] Check for consistency in font rendering hints across the TUI.

## 4. Run Automated Tests to Verify
- [ ] Run cross-platform mock tests.
- [ ] Ensure `devs doctor` correctly identifies platform-specific issues in the test environment.

## 5. Update Documentation
- [ ] Add a "Cross-Platform Support" section to the `@devs/cli` documentation, listing supported terminals and any known limitations on legacy Windows versions.

## 6. Automated Verification
- [ ] Run a CI job that executes the TUI tests on macOS, Linux, and Windows runners to verify baseline compatibility.
