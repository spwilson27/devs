# Task: Terminal Capability Detection and ASCII Fallback System (Sub-Epic: 06_TUI Resilience & Platform Support)

## Covered Requirements
- [6_UI_UX_ARCH-REQ-013]

## 1. Initial Test Written
- [ ] Create unit tests for a `TerminalDetector` utility. Mock `process.stdout` and environment variables (TERM, NO_COLOR, etc.) to simulate:
    - A modern terminal with TrueColor and Unicode support.
    - A legacy terminal (e.g., basic Windows CMD) with 16-color support and no Unicode.
    - A CI environment or headless terminal with no color support.
- [ ] Write tests to verify that the `SymbolProvider` returns ASCII characters (e.g., `[!]`) when Unicode is disabled and Unicode icons (e.g., `⚠`) when enabled.
- [ ] Write tests for a React context/hook `useCapabilities` that provides these flags to Ink components.

## 2. Task Implementation
- [ ] Implement `TerminalDetector` in `@devs/cli/tui/utils/terminal.ts` using `supports-color` and `is-unicode-supported`.
- [ ] Create a `SymbolMap` in `@devs/cli/tui/constants/symbols.ts` that defines both Unicode and ASCII fallbacks for all TUI icons (Success, Error, Thinking, Warning, Metadata).
- [ ] Implement `CapabilitiesProvider` and `useCapabilities` hook in `@devs/cli/tui/context/CapabilitiesContext.tsx`.
- [ ] Update basic TUI components (e.g., `StatusBadge`) to use the `useCapabilities` hook to decide which symbols and color depths to render.

## 3. Code Review
- [ ] Ensure the detection logic is robust and doesn't rely solely on `process.platform`.
- [ ] Verify that the fallback system is centralized and not hardcoded in individual components.
- [ ] Check that `Chalk` is configured correctly to respect the detected color depth.

## 4. Run Automated Tests to Verify
- [ ] Run `npm test` or the equivalent test runner for `@devs/cli`.
- [ ] Ensure all mock environment tests pass.

## 5. Update Documentation
- [ ] Update the `@devs/cli` README or internal `.agent.md` documentation to describe the TUI resilience strategy and how to add new symbols with fallbacks.

## 6. Automated Verification
- [ ] Execute a verification script that runs the CLI in a `TERM=dumb` environment and captures the output to verify no Unicode characters are present.
