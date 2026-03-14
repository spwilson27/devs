# Task: Clippy and Unsafe Code Lint Enforcement (Sub-Epic: 073_Detailed Domain Specifications (Part 38))

## Covered Requirements
- [2_TAS-REQ-440], [2_TAS-REQ-443], [2_TAS-REQ-444]

## Dependencies
- depends_on: [none]
- shared_components: [./do Entrypoint Script & CI Pipeline]

## 1. Initial Test Written
- [ ] Create `tests/lint/test_clippy_blocks_warnings.sh` (POSIX sh) that:
    - Creates a temporary crate directory under `target/test_tmp/clippy_warn/` with a `Cargo.toml` that is a member of the workspace (or simulates standalone).
    - Writes a `lib.rs` containing an intentional clippy warning (e.g., `let mut x = 1; let _ = x;` — unused mut).
    - Runs `./do lint` and asserts exit code is non-zero.
    - Cleans up the temporary crate.
- [ ] Create `tests/lint/test_unsafe_code_blocked.sh` (POSIX sh) that:
    - Creates a temporary crate directory under `target/test_tmp/unsafe_deny/`.
    - Writes a `lib.rs` containing `unsafe {}` block.
    - Runs `./do lint` and asserts exit code is non-zero.
    - Asserts stderr/stdout contains `unsafe` in the error output.
    - Cleans up the temporary crate.
- [ ] Create `tests/lint/test_lint_continues_after_clippy_failure.sh` that:
    - Introduces a clippy warning in a temp crate.
    - Runs `./do lint` and captures full output.
    - Asserts that lint steps AFTER clippy (e.g., `cargo doc`, suppression check) still appear in the output, proving execution continued past the clippy failure ([2_TAS-REQ-444]).

## 2. Task Implementation
- [ ] In the `./do` script's `cmd_lint()` function, add a `clippy` lint step that runs:
    ```
    cargo clippy --workspace --all-targets --all-features -- -D warnings -D unsafe_code
    ```
    - `-D warnings` makes all clippy warnings blocking errors ([2_TAS-REQ-440]).
    - `-D unsafe_code` denies any `unsafe` blocks in workspace code ([2_TAS-REQ-443]).
- [ ] Implement (or verify existing) result aggregation in `cmd_lint()`:
    - Maintain a `failures` counter or list initialized to 0/empty at the start of `cmd_lint()`.
    - After running clippy, capture the return code. If non-zero, append to failures but do NOT return/exit early.
    - After ALL lint steps complete, exit with code 1 if any failures occurred, else exit 0 ([2_TAS-REQ-444]).
- [ ] Ensure clippy is the first lint step so subsequent steps (doc lint, suppression check) run regardless of clippy outcome.

## 3. Code Review
- [ ] Verify `cargo clippy` invocation includes `--workspace --all-targets --all-features -- -D warnings -D unsafe_code` exactly.
- [ ] Confirm `cmd_lint()` does NOT call `sys.exit()`, `return`, or `raise` immediately after a failing step — it must aggregate.
- [ ] Confirm the final exit code is the logical OR of all step results (non-zero if any step failed).
- [ ] Verify that the `unsafe_code = "deny"` lint is also set in `Cargo.toml` workspace `[workspace.lints.rust]` section as a defense-in-depth measure (if not already present from another task).

## 4. Run Automated Tests to Verify
- [ ] Run `sh tests/lint/test_clippy_blocks_warnings.sh` and confirm it passes.
- [ ] Run `sh tests/lint/test_unsafe_code_blocked.sh` and confirm it passes.
- [ ] Run `sh tests/lint/test_lint_continues_after_clippy_failure.sh` and confirm it passes.
- [ ] Run `./do lint` on the clean codebase and confirm exit 0.

## 5. Update Documentation
- [ ] Add inline comments in `cmd_lint()` referencing `[2_TAS-REQ-440]`, `[2_TAS-REQ-443]`, and `[2_TAS-REQ-444]` next to the clippy invocation and aggregation logic.

## 6. Automated Verification
- [ ] Run `./do lint 2>&1 | grep -q 'clippy'` to confirm clippy is being executed.
- [ ] Run `grep -q '\-D warnings' ./do && grep -q '\-D unsafe_code' ./do` to confirm flags are present in the script.
- [ ] Run `grep -q 'unsafe_code.*deny\|deny.*unsafe_code' Cargo.toml` to confirm workspace-level lint (if applicable).
