# Task: TUI Crate Scaffold and Event Loop (Sub-Epic: 07_TUI Framework and Navigation)

## Covered Requirements
- [1_PRD-REQ-038], [2_TAS-REQ-055], [6_UI_UX_ARCHITECTURE-REQ-001], [6_UI_UX_ARCHITECTURE-REQ-002], [6_UI_UX_ARCHITECTURE-REQ-004], [6_UI_UX_ARCHITECTURE-REQ-005], [6_UI_UX_ARCHITECTURE-REQ-006], [6_UI_UX_ARCHITECTURE-REQ-007], [6_UI_UX_ARCHITECTURE-REQ-012], [6_UI_UX_ARCHITECTURE-REQ-043], [6_UI_UX_ARCHITECTURE-REQ-050], [6_UI_UX_ARCHITECTURE-REQ-057], [6_UI_UX_ARCHITECTURE-REQ-058], [6_UI_UX_ARCHITECTURE-REQ-059], [6_UI_UX_ARCHITECTURE-REQ-134], [6_UI_UX_ARCHITECTURE-REQ-135], [6_UI_UX_ARCHITECTURE-REQ-147]

## Dependencies
- depends_on: []
- shared_components: [devs-core (consumer), devs-proto (consumer)]

## 1. Initial Test Written
- [ ] Create `crates/devs-tui/tests/scaffold_test.rs` with a test that imports `devs_tui::App` and verifies `App::new()` returns a valid instance with default `AppState`
- [ ] Write a test verifying `App` struct owns `AppState` exclusively (no Arc/Mutex/RwLock in the struct definition) — use a compile-time assertion or type check
- [ ] Write a test that `App::render()` accepts `&self` (immutable reference) and a `&mut Frame`, confirming the pure rendering contract (REQ-147)
- [ ] Write a test that the event loop processes a `TuiEvent::Quit` and terminates cleanly
- [ ] Write a test that terminal alternate screen is entered on startup and restored on drop (REQ-012, REQ-043) — use `ratatui::backend::TestBackend` to verify cleanup via a drop guard struct
- [ ] Write a test verifying `render()` completes in under 16ms with an empty AppState on a 200×50 TestBackend (REQ-058)

## 2. Task Implementation
- [ ] Create `crates/devs-tui/Cargo.toml` with dependencies: `ratatui = "0.28"`, `crossterm = "0.28"`, `tokio`, `tonic` (for gRPC client). Dev-dependencies: `insta = "1.40"`. Ensure NO dependency on `devs-scheduler`, `devs-pool`, `devs-executor`, `devs-adapters`, `devs-checkpoint`, `devs-webhook`, `devs-grpc`, `devs-mcp` (REQ-002, REQ-005, REQ-006)
- [ ] Create `crates/devs-tui/src/lib.rs` exporting `App`, `AppState`, `TuiEvent`
- [ ] Implement `App` struct that owns `AppState` exclusively (REQ-057, REQ-059). No Arc/Mutex/RwLock fields
- [ ] Implement `App::run()` async method containing the main event loop: `tokio::select!` over crossterm events, gRPC channels, and a 1-second tick interval (REQ-134, REQ-135)
- [ ] Implement `App::handle_event(&mut self, event: TuiEvent)` that mutates `AppState`
- [ ] Implement `App::render(&self, frame: &mut Frame)` that reads `AppState` immutably (REQ-147)
- [ ] Implement terminal setup/teardown: enable raw mode, enter alternate screen, hide cursor on init; reverse on drop using a `TerminalGuard` struct with `Drop` impl (REQ-012, REQ-043)
- [ ] Add the `devs-tui` crate to the workspace `Cargo.toml` members list
- [ ] Ensure the crate compiles on Linux, macOS, and Windows targets (REQ-004)

## 3. Code Review
- [ ] Verify no engine-layer crate imports exist in `Cargo.toml` (REQ-002, REQ-005, REQ-006)
- [ ] Verify `AppState` contains no `Arc`, `Mutex`, `RwLock`, or async primitives (REQ-059)
- [ ] Verify `render()` signature takes `&self` not `&mut self` (REQ-147)
- [ ] Verify terminal cleanup happens in Drop impl, not just on normal exit (REQ-043)

## 4. Run Automated Tests to Verify
- [ ] Run `cargo test -p devs-tui` and verify all tests pass
- [ ] Run `cargo clippy -p devs-tui -- -D warnings` with zero warnings

## 5. Update Documentation
- [ ] Add doc comments to all public types and methods in `lib.rs`

## 6. Automated Verification
- [ ] Run `cargo test -p devs-tui --lib --tests 2>&1 | tail -5` and confirm `test result: ok`
- [ ] Run `cargo check -p devs-tui --target x86_64-unknown-linux-gnu` to verify compilation
