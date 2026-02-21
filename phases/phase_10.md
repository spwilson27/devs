# Phase 10: Terminal - CLI & Ink-based TUI

## Objective
Implement the `devs` command-line interface and the Ink-based high-fidelity Terminal User Interface (TUI). This phase focuses on providing a powerful, keyboard-driven environment for "Makers," including real-time progress bars, streamed agent telemetry, and interactive approval gates within the terminal.

## Requirements Covered
- [TAS-102]: User interface controllers (@devs/cli)
- [1_PRD-REQ-SYS-003]: Multi-model orchestration CLI support
- [9_ROADMAP-REQ-SYS-002]: System health telemetry in TUI
- [9_ROADMAP-REQ-UI-003]: TUI dashboard layout
- [9_ROADMAP-REQ-UI-012]: TUI interaction requirements
- [8_RISKS-REQ-054]: Headless CLI parity
- [5_SECURITY_DESIGN-REQ-SEC-STR-006]: Host-level execution prevention
- [TAS-038]: Real-time Trace & Event Streaming (RTES) support
- [1_PRD-REQ-INT-001]: CLI operability (devs init, run, status)
- [1_PRD-REQ-INT-005]: CLI headless mode support
- [1_PRD-REQ-INT-006]: CLI state control (pause, rewind)
- [3_MCP-REQ-SYS-003]: Headless First IPC parity
- [2_TAS-REQ-033]: CLIController logic
- [9_ROADMAP-TAS-701]: Build CLI with Ink-based TUI
- [9_ROADMAP-TAS-706]: Implement devs rewind command
- [9_ROADMAP-REQ-INT-001]: Terminal TUI requirements
- [9_ROADMAP-REQ-INT-002]: Terminal interactive mode
- [9_ROADMAP-REQ-INT-003]: Terminal log streaming
- [9_ROADMAP-REQ-UI-001]: TUI progress indicators
- [9_ROADMAP-REQ-UI-002]: TUI status dashboard
- [9_ROADMAP-REQ-UI-005]: TUI interactive approval gates
- [9_ROADMAP-REQ-UI-009]: TUI command shortcuts
- [6_UI_UX_ARCH-REQ-002]: CLI (The Automation Engine) implementation
- [6_UI_UX_ARCH-REQ-013]: TUI resilience & terminal detection
- [6_UI_UX_ARCH-REQ-014]: OS compatibility (macOS, Linux, Windows)
- [6_UI_UX_ARCH-REQ-035]: Platform-agnostic Zustand store
- [6_UI_UX_ARCH-REQ-069]: Headless transition logic
- [6_UI_UX_ARCH-REQ-072]: TUI styling (Ink & Chalk)
- [6_UI_UX_ARCH-REQ-080]: TUI ASCII fallbacks
- [6_UI_UX_ARCH-REQ-103]: StatusBadge primitive (Ink)
- [6_UI_UX_ARCH-REQ-104]: ActionCard primitive (Ink)
- [6_UI_UX_ARCH-REQ-105]: LogTerminal primitive (Ink)
- [6_UI_UX_ARCH-REQ-106]: IconButton primitive (Ink)
- [6_UI_UX_ARCH-REQ-107]: StepProgress primitive (Ink)
- [7_UI_UX_DESIGN-REQ-UI-DES-060]: TUI philosophy (Minimalist Authority)
- [7_UI_UX_DESIGN-REQ-UI-DES-061]: Terminal layout zones
- [7_UI_UX_DESIGN-REQ-UI-DES-061-1]: Zone: Header (System Health)
- [7_UI_UX_DESIGN-REQ-UI-DES-061-2]: Zone: Sidebar (Epic Navigation)
- [7_UI_UX_DESIGN-REQ-UI-DES-061-3]: Zone: Main (Implementation Console)
- [7_UI_UX_DESIGN-REQ-UI-DES-061-4]: Zone: Footer (Command Shortcuts)
- [7_UI_UX_DESIGN-REQ-UI-DES-062-1]: Compact mode layout (< 80 chars)
- [7_UI_UX_DESIGN-REQ-UI-DES-063]: ANSI token mapping
- [7_UI_UX_DESIGN-REQ-UI-DES-063-1]: TrueColor support (24-bit)
- [7_UI_UX_DESIGN-REQ-UI-DES-063-2]: 256-color fallback
- [7_UI_UX_DESIGN-REQ-UI-DES-063-3]: 16-color basic fallback
- [7_UI_UX_DESIGN-REQ-UI-DES-064]: Semantic prefixes & Unicode fallbacks
- [7_UI_UX_DESIGN-REQ-UI-DES-065]: Structured blocks (Unicode box-drawing)
- [7_UI_UX_DESIGN-REQ-UI-DES-065-1]: Tool call block styling
- [7_UI_UX_DESIGN-REQ-UI-DES-065-2]: Indentation hierarchy (dotted lines)
- [7_UI_UX_DESIGN-REQ-UI-DES-066]: Keyboard-first navigation hotkeys
- [7_UI_UX_DESIGN-REQ-UI-DES-066-1]: Global actions (P, R, H)
- [7_UI_UX_DESIGN-REQ-UI-DES-066-2]: Phase gates (Enter/Esc)
- [7_UI_UX_DESIGN-REQ-UI-DES-066-3]: The Whisperer hotkey (/)
- [7_UI_UX_DESIGN-REQ-UI-DES-066-4]: Task switching hotkeys
- [7_UI_UX_DESIGN-REQ-UI-DES-067]: Focus management (double-line borders)
- [7_UI_UX_DESIGN-REQ-UI-DES-068-2]: Scrollback buffer (1000 lines)
- [7_UI_UX_DESIGN-REQ-UI-DES-069]: Secret redaction in TUI stream
- [7_UI_UX_DESIGN-REQ-UI-DES-070]: Terminal Diff Reviewer
- [7_UI_UX_DESIGN-REQ-UI-DES-070-1]: Unified diff visualization
- [7_UI_UX_DESIGN-REQ-UI-DES-070-2]: Multi-select for sign-offs
- [7_UI_UX_DESIGN-REQ-UI-DES-024]: ANSI Palette calibration
- [7_UI_UX_DESIGN-REQ-UI-DES-024-1]: Success color (Green)
- [7_UI_UX_DESIGN-REQ-UI-DES-024-2]: Error color (Red)
- [7_UI_UX_DESIGN-REQ-UI-DES-024-3]: Thinking color (Magenta)
- [7_UI_UX_DESIGN-REQ-UI-DES-024-4]: Warning color (Yellow)
- [7_UI_UX_DESIGN-REQ-UI-DES-024-5]: Metadata color (Grey)
- [7_UI_UX_DESIGN-REQ-UI-RISK-005]: Terminal resizing robustness
- [7_UI_UX_DESIGN-REQ-UI-UNK-003]: No mouse interaction recommendation
- [4_USER_FEATURES-REQ-004]: Interactive TUI approval gates
- [4_USER_FEATURES-REQ-005]: devs doctor command
- [4_USER_FEATURES-REQ-025]: CLI progress bar for research
- [4_USER_FEATURES-REQ-046]: Keyboard-first navigation requirement

## Detailed Deliverables & Components
### Command-Line Interface (Commander)
- Develop the entry point using `commander` or similar.
- Implement core commands: `init`, `run`, `pause`, `resume`, `status`, `rewind`, `doctor`, `purge`.
- Build the "Headless Mode" that outputs NDJSON for all commands.

### Ink-based TUI Framework
- Implement the TUI using React Ink in `@devs/cli/tui`.
- Develop common primitives: `StatusBadge`, `ActionCard`, `LogTerminal`, `StepProgress`.
- Implement layout zones (Header, Sidebar, Console, Footer) using Flexbox.

### Terminal Experience Features
- Build the "Diff Reviewer" for terminal-based approval of TAS/PRD changes.
- Implement ANSI color mapping that respects terminal background detection.
- Develop ASCII fallback logic for environments with limited Unicode support.

### TUI Navigation & Hotkeys
- Implement the global hotkey listener (P for Pause, / for Whisper).
- Build the task-switching logic using arrow keys within the Epic Roadmap zone.
- Implement the "Double-line Border" focus indicator for active zones.

## Technical Considerations
- Ensuring `Ink` doesn't crash during rapid terminal resizing.
- Minimizing reconciliation load when streaming high-frequency agent thoughts (using `Static` components).
- Handling OS-specific terminal differences (Windows cmd vs. macOS Terminal).
