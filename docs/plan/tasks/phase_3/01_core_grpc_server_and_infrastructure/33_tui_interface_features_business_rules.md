# Task: TUI Interface Features and Business Rules (Sub-Epic: 01_core_grpc_server_and_infrastructure)

## Covered Requirements
- [4_USER_FEATURES-TUI-BR-001], [4_USER_FEATURES-TUI-BR-002], [4_USER_FEATURES-TUI-BR-003], [4_USER_FEATURES-TUI-BR-004], [4_USER_FEATURES-TUI-BR-005], [4_USER_FEATURES-TUI-BR-006], [4_USER_FEATURES-AC-3-TUI-001], [4_USER_FEATURES-AC-3-TUI-002], [4_USER_FEATURES-AC-3-TUI-003], [4_USER_FEATURES-AC-3-TUI-004], [4_USER_FEATURES-AC-3-TUI-005], [4_USER_FEATURES-AC-3-TUI-006], [4_USER_FEATURES-AC-4-TUI-001], [4_USER_FEATURES-AC-4-TUI-002], [4_USER_FEATURES-AC-4-TUI-003], [4_USER_FEATURES-AC-4-TUI-004], [4_USER_FEATURES-AC-4-TUI-005], [4_USER_FEATURES-AC-4-TUI-006], [4_USER_FEATURES-AC-4-TUI-007], [4_USER_FEATURES-AC-4-TUI-008]

## Dependencies
- depends_on: ["01_devs_grpc_crate_scaffold_and_server_service.md", "03_grpc_service_stubs_and_streaming.md"]
- shared_components: ["devs-tui (owner)", "devs-grpc (consumer)"]

## 1. Initial Test Written
- [ ] Create `crates/devs-tui/tests/tui_tabs_test.rs` with tests using `ratatui::backend::TestBackend`: Dashboard tab renders project/run list and run detail (AC-3-TUI-001), Logs tab renders full log stream (AC-3-TUI-002), Debug tab renders agent progress (AC-3-TUI-003), Pools tab renders utilization (AC-3-TUI-004).
- [ ] Write tests for TUI navigation: tab switching (AC-3-TUI-005), keyboard navigation (AC-3-TUI-006).
- [ ] Write tests for TUI business rules: gRPC connection management (TUI-BR-001), reconnection on disconnect (TUI-BR-002), live data updates (TUI-BR-003), split pane layout (TUI-BR-004), text snapshot testing (TUI-BR-005), cross-platform rendering (TUI-BR-006).
- [ ] Write tests for TUI visual design: golden ratio layout proportions (AC-4-TUI-001), theme system (AC-4-TUI-002), ANSI color palette (AC-4-TUI-003), high contrast mode (AC-4-TUI-004), screen reader support (AC-4-TUI-005), configurable keybindings (AC-4-TUI-006), status bar (AC-4-TUI-007), error display (AC-4-TUI-008).

## 2. Task Implementation
- [ ] Implement the `devs-tui` crate with `ratatui` and `crossterm`.
- [ ] Implement 4-tab layout: Dashboard, Logs, Debug, Pools.
- [ ] Implement Dashboard split pane with project/run list and run detail.
- [ ] Implement gRPC streaming for live data updates.
- [ ] Implement reconnection handling for dropped gRPC connections.
- [ ] Implement golden ratio (phi) based layout proportions.
- [ ] Implement theme system with ANSI-compatible color palette.
- [ ] Implement keyboard navigation with configurable keybindings.
- [ ] Implement UI text snapshot testing infrastructure.

## 3. Code Review
- [ ] Verify TUI renders correctly on 80x24 minimum terminal size.
- [ ] Confirm text snapshot tests capture meaningful UI state.
- [ ] Ensure no panics on malformed server data.

## 4. Run Automated Tests to Verify
- [ ] Run `cargo test -p devs-tui` and confirm all tests pass.

## 5. Update Documentation
- [ ] Add `// Covers:` annotations for all 20 requirements.

## 6. Automated Verification
- [ ] Run `./do test` and `./do lint` with zero failures.
