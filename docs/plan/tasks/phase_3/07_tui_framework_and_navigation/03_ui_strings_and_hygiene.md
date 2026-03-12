# Task: UI Strings Management and Hygiene Lints (Sub-Epic: 07_TUI Framework and Navigation)

## Covered Requirements
- [6_UI_UX_ARCHITECTURE-REQ-049]
- [6_UI_UX_ARCHITECTURE-REQ-316]
- [6_UI_UX_ARCHITECTURE-REQ-317]
- [6_UI_UX_ARCHITECTURE-REQ-318]
- [6_UI_UX_ARCHITECTURE-REQ-319]
- [6_UI_UX_ARCHITECTURE-REQ-320]
- [6_UI_UX_ARCHITECTURE-REQ-348]
- [6_UI_UX_ARCHITECTURE-REQ-349]
- [6_UI_UX_ARCHITECTURE-REQ-451]
- [6_UI_UX_ARCHITECTURE-REQ-452]
- [6_UI_UX_ARCHITECTURE-REQ-453]
- [6_UI_UX_ARCHITECTURE-REQ-459]
- [6_UI_UX_ARCHITECTURE-REQ-460]
- [6_UI_UX_ARCHITECTURE-REQ-464]
- [6_UI_UX_ARCHITECTURE-REQ-465]
- [6_UI_UX_ARCHITECTURE-REQ-467]
- [6_UI_UX_ARCHITECTURE-REQ-468]
- [9_PROJECT_ROADMAP-REQ-253]

## Dependencies
- depends_on: [02_tui_terminal_lifecycle.md]
- shared_components: [devs-tui, devs-cli]

## 1. Initial Test Written
- [ ] Create a unit test in `crates/devs-tui/src/strings.rs` that asserts all `STATUS_*` strings are exactly 4 bytes long.
- [ ] Create a unit test in `crates/devs-tui/src/strings.rs` that asserts all `ERR_*` constants begin with a machine-stable prefix (e.g., `not_found:`).
- [ ] Create a unit test that verifies `strings.rs` contains no imports outside the standard library.
- [ ] Create a test script in `scripts/strings_lint.sh` that scans for inline string literals with error prefixes.

## 2. Task Implementation
- [ ] Create `crates/devs-tui/src/strings.rs` and define mandatory constants (`STATUS_RUN_`, `STATUS_DONE`, etc.).
- [ ] Create `crates/devs-cli/src/strings.rs` with its specific constants (`CMD_SUBMIT`, etc.).
- [ ] Implement the `strings_hygiene` check in `./do lint` using a regex scan (e.g., `grep -rn`).
- [ ] Ensure that `STATUS_RUN_` is `"RUN "` (with trailing space).
- [ ] Ensure all constants in `strings.rs` have `///` doc comments.
- [ ] Ensure `strings.rs` contains no submodules.

## 3. Code Review
- [ ] Verify that no `strings.rs` module `use` or `pub use` constants from another crate (intentional duplication).
- [ ] Verify that no `strings.rs` module depends on `devs-core`, `devs-proto`, or any crate other than `std`.
- [ ] Ensure no byte value in U+0080–U+FFFF appears in any constant in `strings.rs`.

## 4. Run Automated Tests to Verify
- [ ] Run `cargo test -p devs-tui` and `cargo test -p devs-cli`.

## 5. Update Documentation
- [ ] Update `docs/plan/tasks/phase_3_grouping.json` if necessary to reflect implementation progress.

## 6. Automated Verification
- [ ] Run `./do lint` and verify it correctly flags an inline error string in a non-strings.rs file.
- [ ] Run `cargo tree -p devs-tui` and verify `strings.rs` has no external dependencies.
