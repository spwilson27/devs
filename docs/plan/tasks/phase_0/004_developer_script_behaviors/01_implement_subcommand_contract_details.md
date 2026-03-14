# Task: Implement `./do` Subcommand Exact Behaviors (Sub-Epic: 004_Developer Script Behaviors)

## Covered Requirements
- [2_TAS-REQ-083]

## Dependencies
- depends_on: ["none"]
- shared_components: ["./do Entrypoint Script & CI Pipeline"]

## 1. Initial Test Written
- [ ] Create `tests/do_subcommand_behaviors.sh` (POSIX sh, `set -eu`). The test script must verify the **dispatch and exact invocation** of each subcommand. For subcommands that invoke `cargo`, the test should use a shimmed `cargo` (a temporary wrapper script placed earlier in `$PATH`) that logs its arguments to a file and exits 0, so the test validates the exact command-line arguments without requiring a full build.
- [ ] **`setup` test**: Run `./do setup` twice in succession. Assert both invocations exit 0 (idempotency). Verify that the shim log shows `rustup` toolchain install was invoked. Verify that `cargo-llvm-cov` installation was attempted.
- [ ] **`build` test**: Run `./do build`. Read the shim log and assert it contains exactly `cargo build --release --workspace`.
- [ ] **`test` test**: Run `./do test`. Assert the shim log contains `cargo test --workspace`. Assert that `target/traceability.json` exists after completion (the script must create it or invoke the generation step).
- [ ] **`lint` test**: Run `./do lint`. Assert the shim log contains `cargo fmt --check --all`, then `cargo clippy --workspace --all-targets --all-features -- -D warnings`, then `cargo doc` with warnings check — in that exact order.
- [ ] **`format` test**: Run `./do format`. Assert the shim log contains `cargo fmt --all`.
- [ ] **`coverage` test**: Run `./do coverage`. Assert the shim log contains the `cargo-llvm-cov` invocation. Assert that `target/coverage/report.json` would be generated (or that the generation command was invoked).
- [ ] **`presubmit` test**: Run `./do presubmit`. Assert the shim log shows the subcommands were invoked in exact order: `setup` → `format` → `lint` → `test` → `coverage` → `ci`.
- [ ] **`ci` test**: Run `./do ci`. Assert it creates a temporary git commit (check `git log` for a temp commit or check the shim log for the ci invocation pattern).
- [ ] Each test case must include a `# Covers: 2_TAS-REQ-083` comment.

## 2. Task Implementation
- [ ] Implement or refine the `./do` script (POSIX `sh`-compatible, starting with `#!/bin/sh` and `set -eu`) to dispatch each subcommand:
  - `setup`: Call `rustup show` (which triggers toolchain install if needed), then `cargo install cargo-llvm-cov --locked` (idempotent via `--locked`). Print a message if tools are already installed.
  - `build`: Execute `cargo build --release --workspace`.
  - `test`: Execute `cargo test --workspace`, then invoke a traceability generation step that produces `target/traceability.json` with a `phase_gates` array.
  - `lint`: Execute in sequence: (1) `cargo fmt --check --all`, (2) `cargo clippy --workspace --all-targets --all-features -- -D warnings`, (3) `cargo doc --workspace --no-deps` with `RUSTDOCFLAGS="-D warnings"`. Add additional lint steps: dependency audit (`cargo audit`), BOOTSTRAP-STUB grep check, `cargo tree` forbidden import enforcement per `./do lint` spec.
  - `format`: Execute `cargo fmt --all`.
  - `coverage`: Execute `cargo llvm-cov --workspace --json --output-path target/coverage/report.json` (or equivalent), covering unit and E2E tests.
  - `presubmit`: Call `do_setup`, `do_format`, `do_lint`, `do_test`, `do_coverage`, `do_ci` in that exact order. Wrap in the timeout mechanism (see task 03).
  - `ci`: Copy working directory state to a temporary commit on a detached HEAD or temp branch, then invoke CI pipeline validation. For Phase 0, this can be a stub that creates the temp commit and runs `./do build && ./do test && ./do lint` against it.
- [ ] Each subcommand should be implemented as a shell function (`do_setup`, `do_build`, etc.) called from a `case` dispatcher.
- [ ] Print a banner line to stdout before each subcommand (e.g., `"==> setup"`) for traceability.

## 3. Code Review
- [ ] Verify the script starts with `#!/bin/sh` and uses only POSIX sh constructs (no bashisms like `[[`, arrays, `local` in non-function scope, process substitution).
- [ ] Verify `set -eu` is set at the top (not `set -euo pipefail` which is bash-specific).
- [ ] Confirm each subcommand's cargo invocation matches the spec table in [2_TAS-REQ-083] exactly.
- [ ] Confirm `setup` is idempotent — running it when tools are already installed must not fail.
- [ ] Verify the `presubmit` sequence order matches: setup → format → lint → test → coverage → ci.

## 4. Run Automated Tests to Verify
- [ ] Run `sh tests/do_subcommand_behaviors.sh` and confirm all assertions pass.
- [ ] Run `./do build` on the actual workspace and verify exit 0.
- [ ] Run `./do format` and `./do lint` on the actual workspace and verify exit 0.

## 5. Update Documentation
- [ ] Add a comment block at the top of the `./do` script listing all supported subcommands and their one-line descriptions matching the [2_TAS-REQ-083] table.

## 6. Automated Verification
- [ ] Run `sh tests/do_subcommand_behaviors.sh` in a clean environment (fresh clone or CI) and verify exit 0.
- [ ] Run `./do build && ./do test && ./do lint && ./do format` sequentially on the real workspace and verify all exit 0.
