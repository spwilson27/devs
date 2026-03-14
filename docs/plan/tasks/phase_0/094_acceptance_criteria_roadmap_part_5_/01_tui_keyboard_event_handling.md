# Task: TUI Keyboard Dispatch — Unrecognized Key Silence & Full Keybinding Snapshot Coverage (Sub-Epic: 094_Acceptance Criteria & Roadmap (Part 5))

## Covered Requirements
- [AC-KEY-005], [AC-KEY-006]

## Dependencies
- depends_on: []
- shared_components: [devs-tui (owner of dispatch_key and AppState), devs-core (consumed for domain types)]

## 1. Initial Test Written
- [ ] In `crates/devs-tui/src/event.rs` (or a `tests/` module alongside it), write a unit test `test_unrecognized_key_no_state_mutation` that:
  1. Constructs a default `AppState` with `active_tab: Tab::Dashboard`, `selected_run_id: None`, `help_visible: false`, `confirmation: None`.
  2. Clones the state as `before`.
  3. Calls `dispatch_key(&mut state, KeyEvent::new(KeyCode::Char('z'), KeyModifiers::NONE))` (an unmapped key).
  4. Asserts `state == before` (requires `AppState: PartialEq`).
- [ ] Write a companion test `test_unrecognized_key_no_tracing_output` using `tracing_test::TracingTest` (or `tracing_subscriber::fmt::TestWriter`) that:
  1. Installs a test subscriber that captures all spans/events.
  2. Calls `dispatch_key` with an unrecognized key (`KeyCode::Char('x')`).
  3. Asserts that zero tracing events were emitted during the call.
- [ ] For [AC-KEY-006], write one `insta` snapshot test per key×context combination from the authoritative keybinding table ([UI-DES-058]). Each test:
  1. Constructs an `AppState` representing the required context (e.g., `active_tab: Tab::Dashboard`, `selected_run_id: None` for `RunList`).
  2. Calls `dispatch_key(&mut state, key_event)`.
  3. Renders the resulting `AppState` to a `ratatui::backend::TestBackend` (200×50).
  4. Calls `insta::assert_snapshot!` with a descriptive name like `key__tab__dashboard_runlist`, `key__q__logs`, etc.
  The full list of key×context pairs to cover (from [UI-DES-058]):
    - `Tab` in each of the 4 tabs (4 tests)
    - `1`–`4` from a non-matching tab (4 tests)
    - `↑`/`k` and `↓`/`j` in Dashboard(RunList), Dashboard(StageList), Logs, Debug (8 tests)
    - `←`/`→` in Dashboard(DagView) (2 tests)
    - `Enter` in Dashboard(RunList) with a selected run (1 test)
    - `Esc` in Dashboard(StageList), Dashboard(RunList), HelpOverlay (3 tests)
    - `c` in Dashboard with a Running selected run (1 test)
    - `p` in Dashboard with a Running selected run (1 test)
    - `r` in Dashboard with a Paused selected run (1 test)
    - `?` from any tab (1 test)
    - `q` from any tab with no overlay (1 test)
    - `Ctrl+C` from any context (1 test)
- [ ] Add `// Covers: AC-KEY-005` to the unrecognized-key tests and `// Covers: AC-KEY-006` to each snapshot test.

## 2. Task Implementation
- [ ] Ensure `AppState` derives or manually implements `PartialEq` and `Clone`.
- [ ] Implement `dispatch_key(state: &mut AppState, key: KeyEvent)` in `crates/devs-tui/src/event.rs` following the priority order from [UI-DES-058]:
  1. `Ctrl+C` → set `state.quit = true`.
  2. `ConfirmationPrompt` context → only `y`/`Y`/`n`/`N`/`Esc` pass through; all others silently consumed.
  3. `HelpOverlay` context → only `?`/`Esc`/`q`/`Ctrl+C` pass through; all others silently consumed.
  4. Context-specific bindings per the keybinding table.
  5. Fall-through: return immediately, no mutation, no `tracing` call.
- [ ] Implement `current_context(state: &AppState) -> KeyDispatchContext` as a pure function per [UI-DES-056a].
- [ ] The keybinding table MUST be implemented as a `match` on `(KeyDispatchContext, KeyCode)` — no dynamic dispatch or registry at MVP.
- [ ] Ensure the `c`/`p`/`r` keys check run status preconditions per [UI-DES-058b] and [UI-DES-058c] before acting; otherwise silently consume.

## 3. Code Review
- [ ] Confirm `dispatch_key` contains zero `tracing::warn!`/`tracing::error!`/`tracing::info!` calls on the unrecognized-key path.
- [ ] Confirm the keybinding table in code matches the spec table from [UI-DES-058] exactly — no extra bindings, no missing bindings.
- [ ] Confirm `current_context()` is pure (no side effects, no I/O).
- [ ] Confirm `AppState` equality comparison covers all fields that could be mutated by key dispatch.

## 4. Run Automated Tests to Verify
- [ ] Run `cargo test -p devs-tui -- dispatch_key` and confirm all tests pass.
- [ ] Run `cargo insta review` and approve all new snapshots after visual inspection.

## 5. Update Documentation
- [ ] Add doc comments to `dispatch_key` and `current_context` explaining the priority evaluation order.

## 6. Automated Verification
- [ ] Run `./do test` and verify that `target/traceability.json` shows [AC-KEY-005] and [AC-KEY-006] as covered.
- [ ] Run `./do lint` and confirm zero warnings from clippy on `crates/devs-tui/`.
