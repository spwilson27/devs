# Task: Implement `./do` subcommand contract details (Sub-Epic: 004_Developer Script Behaviors)

## Covered Requirements
- [2_TAS-REQ-083]

## Dependencies
- depends_on: [none]
- shared_components: ["./do Entrypoint Script"]

## 1. Initial Test Written
- [ ] Create or update a shell script test `tests/test_do_subcommand_behaviors.sh` that:
    - Verifies `./do setup` (idempotent call, check exit code 0).
    - Verifies `./do build` (runs `cargo build --release --workspace`).
    - Verifies `./do test` (runs `cargo test --workspace`, then checks for `target/traceability.json`).
    - Verifies `./do lint` (runs `cargo fmt`, `cargo clippy`, and `cargo doc` in sequence).
    - Verifies `./do format` (runs `cargo fmt --all`).
    - Verifies `./do coverage` (runs unit + E2E coverage and generates `target/coverage/report.json`).
    - Verifies `./do presubmit` (executes the full sequence).
    - Verifies `./do ci` (triggers a simulated CI run).

## 2. Task Implementation
- [ ] Refine the `./do` script to ensure each subcommand implements the exact behavior described in [2_TAS-REQ-083]:
    - `setup`: Ensure it installs the Rust toolchain (via `rustup`), `cargo-llvm-cov`, and any necessary system dependencies. Ensure it is idempotent.
    - `build`: Ensure it executes `cargo build --release --workspace`.
    - `test`: Ensure it executes `cargo test --workspace` AND follows it with the traceability generation/verification step.
    - `lint`: Ensure it executes the three-command sequence: `cargo fmt --check --all`, `cargo clippy --workspace --all-targets --all-features -- -D warnings`, and the `cargo doc` warning check.
    - `format`: Ensure it executes `cargo fmt --all`.
    - `coverage`: Ensure it runs both unit and E2E coverage measurement and generates the report.
    - `presubmit`: Ensure it runs the full sequence: `setup` → `format` → `lint` → `test` → `coverage` → `ci`.
    - `ci`: Implement the logic to copy the working directory to a temporary commit/branch and trigger the pipeline.

## 3. Code Review
- [ ] Verify that each subcommand's implementation is concise and follows shell scripting best practices (`set -euo pipefail`).
- [ ] Ensure that the script provides clear logging/output for each step being executed.
- [ ] Confirm that `idempotency` for `setup` is correctly handled (e.g., checking for existing tool installs).

## 4. Run Automated Tests to Verify
- [ ] Execute `bash tests/test_do_subcommand_behaviors.sh` and ensure all subcommands are correctly dispatched and return success when the underlying cargo commands pass.

## 5. Update Documentation
- [ ] Ensure `GEMINI.md` or `MEMORY.md` is updated to confirm that the `./do` script now fully conforms to the [2_TAS-REQ-083] contract.

## 6. Automated Verification
- [ ] Verify that running `./do` without arguments still prints the correct usage information to stderr.
