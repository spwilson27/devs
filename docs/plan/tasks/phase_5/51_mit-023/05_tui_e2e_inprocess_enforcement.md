# Task: Enforce TUI E2E Tests Run In-Process via `ratatui::backend::TestBackend` (Sub-Epic: 51_MIT-023)

## Covered Requirements
- [MIT-023]

## Dependencies
- depends_on: ["01_e2e_subprocess_helper_llvm_profile.md"]
- shared_components: [./do Entrypoint Script, Traceability & Verification Infrastructure]

## 1. Initial Test Written

- [ ] In `.tools/tests/test_tui_e2e_inprocess.py`, write a pytest test `test_no_tui_subprocess_spawn` that:
  1. Recursively scans all files under `crates/devs-tui/tests/` using `pathlib.Path.rglob("*.rs")`.
  2. For each file, searches for `std::process::Command`, `assert_cmd`, `tokio::process::Command`, `SpawnHelper`, or `cargo_bin` using `re.search`.
  3. If any match is found, asserts `False` with a message: `"TUI E2E test file {path} spawns a subprocess — this is prohibited by RISK-023-BR-002. Use ratatui::backend::TestBackend instead."`.
  4. Annotate: `# Covers: MIT-023` (enforces RISK-023-BR-002 as a lint).
- [ ] Write a pytest test `test_tui_e2e_uses_testbackend` that:
  1. Scans all `*.rs` files under `crates/devs-tui/tests/`.
  2. Asserts that at least one file contains `ratatui::backend::TestBackend` or `TestBackend::new`.
  3. Annotate: `# Covers: MIT-023`.
- [ ] In `crates/devs-tui/tests/e2e/dashboard_e2e.rs` (create if absent), write a Rust integration test `test_tui_dashboard_renders_in_process` that:
  1. Instantiates `ratatui::backend::TestBackend::new(80, 24)`.
  2. Creates a `ratatui::Terminal` with the `TestBackend`.
  3. Renders the `devs-tui` `DashboardView` widget using mock state (stubbed `RunStatus`, `StageStatus`).
  4. Captures the buffer with `terminal.backend().buffer().clone()`.
  5. Asserts that the buffer contains expected text (e.g., `"Runs"`, `"Stages"`, column headers).
  6. Confirms that no `std::process::Command` or `SpawnHelper` is used anywhere in the test.
  7. Annotate: `// Covers: MIT-023`.

## 2. Task Implementation

- [ ] Create or review `crates/devs-tui/tests/e2e/dashboard_e2e.rs` and confirm it runs fully in-process:
  ```rust
  // Covers: MIT-023
  // RISK-023-BR-002: TUI E2E tests MUST use TestBackend in-process. Subprocess spawn is prohibited.

  #[test]
  fn test_tui_dashboard_renders_in_process() {
      use ratatui::backend::TestBackend;
      use ratatui::Terminal;
      // Use mock/stub data — no real server, no subprocess.
      let backend = TestBackend::new(80, 24);
      let mut terminal = Terminal::new(backend).unwrap();
      terminal.draw(|frame| {
          // Render the dashboard widget with stub state.
          let area = frame.size();
          let widget = DashboardView::new(&stub_run_list());
          frame.render_widget(widget, area);
      }).unwrap();
      let buffer = terminal.backend().buffer().clone();
      let text: String = buffer.content.iter().map(|c| c.symbol().to_string()).collect();
      assert!(text.contains("Runs"), "DashboardView must render 'Runs' header");
  }
  ```
- [ ] Create or update `crates/devs-tui/tests/e2e/logs_e2e.rs` and `crates/devs-tui/tests/e2e/debug_tab_e2e.rs` with the same in-process `TestBackend` pattern:
  - Each view (Logs, Debug, Pools) must have at least one test using `TestBackend`.
  - None of these tests may spawn a subprocess.
- [ ] Add a compile-time `#[deny(unsafe_code)]` attribute to the TUI E2E test files — since in-process tests do not need unsafe, its presence would signal a structural issue.
- [ ] Add a `.clippy.toml` (or `Cargo.toml` `[lints]` section) rule for `devs-tui` tests that forbids use of `std::process::Command` in test code:
  - If Clippy does not support this directly, rely on the Python lint test in §1 as the enforcement mechanism.
- [ ] Add `// Covers: MIT-023` and a `// RISK-023-BR-002: In-process only.` comment at the top of each TUI E2E test file.
- [ ] Add `[dev-dependencies]` in `crates/devs-tui/Cargo.toml` for `ratatui` with `features = ["crossterm"]` (or `TestBackend`) if not already present.

## 3. Code Review

- [ ] Confirm there is no `SpawnHelper`, `assert_cmd`, `std::process::Command`, or `tokio::process::Command` anywhere under `crates/devs-tui/tests/`.
- [ ] Confirm every TUI E2E test file under `crates/devs-tui/tests/` contains `TestBackend` (or `ratatui::backend::TestBackend`).
- [ ] Confirm the TUI tests do not import `devs-test-helpers`'s `subprocess` module — they may use other helpers (fixtures, stub builders) but not subprocess helpers.
- [ ] Confirm all public items in stub/fixture helpers used by TUI tests have `///` doc comments.

## 4. Run Automated Tests to Verify

- [ ] Run `python -m pytest .tools/tests/test_tui_e2e_inprocess.py -v` and assert all tests pass.
- [ ] Run `cargo test -p devs-tui --test '*_e2e*' -- --nocapture` and assert all TUI E2E tests pass.
- [ ] Confirm the TUI E2E tests complete without spawning any subprocess: run `strace -e trace=execve cargo test -p devs-tui --test '*_e2e*' 2>&1 | grep devs-server` on Linux (should produce no output). On macOS, use `sudo dtruss` or skip this check.
- [ ] Assert all tests exit with code 0.

## 5. Update Documentation

- [ ] Add a `## TUI E2E Testing` section to `crates/devs-tui/README.md` (create if absent) explaining:
  - All TUI E2E tests use `ratatui::backend::TestBackend` in-process.
  - Subprocess spawning for TUI testing is prohibited (cite `RISK-023-BR-002`).
  - Coverage is captured naturally by `cargo-llvm-cov` without `LLVM_PROFILE_FILE` configuration.
- [ ] Add `// Covers: MIT-023` to the top of each TUI E2E test file (verify it is present after implementation).

## 6. Automated Verification

- [ ] Run `.tools/verify_requirements.py` and confirm `MIT-023` appears in `covered`.
- [ ] Run `python -m pytest .tools/tests/test_tui_e2e_inprocess.py::test_no_tui_subprocess_spawn -v` and assert exit code 0.
- [ ] Run `grep -rn "SpawnHelper\|assert_cmd\|std::process::Command" crates/devs-tui/tests/` and assert the command returns no matches (exit code 1 for grep means no matches = pass).
