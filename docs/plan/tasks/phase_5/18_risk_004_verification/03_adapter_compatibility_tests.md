# Task: Adapter Compatibility Verification Suite (Sub-Epic: 18_Risk 004 Verification)

## Covered Requirements
- [MIT-004], [AC-RISK-004-01]

## Dependencies
- depends_on: ["01_adapter_version_tracking.md"]
- shared_components: [devs-adapters]

## 1. Initial Test Written
- [ ] Create 5 compatibility test files in `crates/devs-adapters/tests/`:
    - `claude_compatibility_test.rs`
    - `gemini_compatibility_test.rs`
    - `opencode_compatibility_test.rs`
    - `qwen_compatibility_test.rs`
    - `copilot_compatibility_test.rs`
- [ ] Each test FIRST reads `target/adapter-versions.json` to get the captured version.
- [ ] Each test invokes its respective CLI with `--version` (or equivalent).
- [ ] Each test asserts that the version string matches the one captured in the JSON.
- [ ] Each test asserts that `compatible: true` is recorded in the JSON for that adapter.

## 2. Task Implementation
- [ ] Define adapter CLI flags as constants (e.g., `const FLAG_VERSION: &str = "--version"`) in each adapter's `config.rs`.
- [ ] Store rate-limit detection patterns in `devs-adapters/src/<name>/rate_limit.rs` as `const &[&str]` arrays.
- [ ] Ensure that `MIT-004` is satisfied by verifying that:
    - `./do setup` has been updated to pin/capture these versions (partially handled in Task 01).
    - Adapter flag updates are centralized in the `config.rs` constants.

## 3. Code Review
- [ ] Ensure that the tests are skipped gracefully if the adapter binary is not present in the environment (unless required by the current platform).
- [ ] Verify that the version parsing is robust (handling semantic versioning or other version string formats used by the CLIs).
- [ ] Confirm that flag constants are used everywhere (no inline string literals for flags in `build_command()`).

## 4. Run Automated Tests to Verify
- [ ] Run `cargo test --package devs-adapters --test "*_compatibility_test"`.

## 5. Update Documentation
- [ ] Update documentation for adding new adapters, emphasizing the need for compatibility tests and version capturing.

## 6. Automated Verification
- [ ] Run `./do lint` to ensure no inline string literals for CLI flags remain in adapter implementations (scans for `program.arg("--")` type patterns).
- [ ] Run `./do test` to confirm the full compatibility suite passes on the current CI runner.
