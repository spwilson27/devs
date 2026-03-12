# Task: CLI Architecture and Formatter Trait (Sub-Epic: 07_TUI Framework and Navigation)

## Covered Requirements
- [2_TAS-REQ-060]
- [2_TAS-REQ-061]
- [2_TAS-REQ-062]
- [2_TAS-REQ-063]
- [6_UI_UX_ARCHITECTURE-REQ-068]
- [6_UI_UX_ARCHITECTURE-REQ-069]
- [6_UI_UX_ARCHITECTURE-REQ-070]
- [6_UI_UX_ARCHITECTURE-REQ-071]
- [6_UI_UX_ARCHITECTURE-REQ-072]
- [9_PROJECT_ROADMAP-REQ-243]
- [9_PROJECT_ROADMAP-REQ-254]

## Dependencies
- depends_on: [01_shared_discovery_logic.md, 03_ui_strings_and_hygiene.md]
- shared_components: [devs-cli, devs-client-util]

## 1. Initial Test Written
- [ ] Create a unit test for `JsonFormatter` that verifies it produces a single-line JSON object on stdout and nothing on stderr.
- [ ] Create a unit test for `TextFormatter` that verifies it produces human-readable text.
- [ ] Create a test for `submit` command parsing that verifies `--input a=b=c` correctly sets key `a` to value `b=c`.
- [ ] Create a test that verifies `devs-cli` exits with code 3 when the server is unreachable.

## 2. Task Implementation
- [ ] Create `crates/devs-cli/` crate in the workspace.
- [ ] Implement the `Formatter` trait in `src/output.rs` with `TextFormatter` and `JsonFormatter`.
- [ ] Setup `clap` in `src/main.rs` with subcommands: `submit`, `list`, `status`, `logs`, `cancel`, `pause`, `resume`.
- [ ] Implement global flags: `--server <addr>` and `--format <text|json>`.
- [ ] Organize subcommands into separate modules under `src/commands/`.
- [ ] Implement the error handling logic: in JSON mode, errors go to stdout; in text mode, to stderr.
- [ ] Ensure `x-devs-client-version` is sent with gRPC requests.

## 3. Code Review
- [ ] Verify that no command handler calls `println!` or `eprintln!` directly (use the `Formatter`).
- [ ] Ensure that `devs-cli` does not depend on engine crates.
- [ ] Verify that the `"code"` field in JSON error responses matches the CLI exit code.

## 4. Run Automated Tests to Verify
- [ ] Run `cargo test -p devs-cli`.

## 5. Update Documentation
- [ ] Update `docs/plan/tasks/phase_3_grouping.json` if necessary to reflect implementation progress.

## 6. Automated Verification
- [ ] Run `cargo tree -p devs-cli` and verify no engine crates are in the dependency graph.
- [ ] Run `devs --help` and verify all mandatory subcommands are listed.
