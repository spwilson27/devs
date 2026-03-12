# Task: Implement idempotent `setup` and standardized `lint` (Sub-Epic: 003_Developer Entrypoint Script)

## Covered Requirements
- [1_PRD-REQ-045], [1_PRD-BR-002], [2_TAS-REQ-012]

## Dependencies
- depends_on: [01_scaffold_do_script.md]
- shared_components: [none]

## 1. Initial Test Written
- [ ] Add a shell script test `tests/test_do_script_setup.sh` that:
    - Verifies `./do setup` completes with exit code 0.
    - Verifies `./do setup` invoked again immediately completes with exit code 0 ([1_PRD-BR-002]).
- [ ] Add a shell script test `tests/test_do_script_lint.sh` that:
    - Verifies `./do lint` correctly fails if `cargo fmt --check` fails.
    - Verifies `./do lint` correctly fails if `cargo clippy` emits warnings.
    - Verifies `./do lint` correctly fails if `cargo doc` emits warnings ([2_TAS-REQ-012]).

## 2. Task Implementation
- [ ] Update `./do setup` subcommand:
    - Implement installation of `rustfmt`, `clippy`, and `llvm-tools-preview`.
    - Implement installation of `cargo-llvm-cov`.
    - Ensure commands like `rustup component add` are used and handled idempotently.
- [ ] Update `./do lint` subcommand to run the exact sequence defined in [2_TAS-REQ-012]:
    - `cargo fmt --check --all`
    - `cargo clippy --workspace --all-targets --all-features -- -D warnings`
    - `cargo doc --no-deps --workspace 2>&1 | grep -E "^warning|^error" && exit 1 || exit 0`
- [ ] Ensure any command in the `lint` sequence failure stops execution and exits non-zero.

## 3. Code Review
- [ ] Verify `./do setup` does not perform unnecessary operations if dependencies are already present.
- [ ] Verify `./do lint` grep pattern for `cargo doc` covers both `warning` and `error` as required.
- [ ] Verify code documentation is strictly enforced by the `lint` command.

## 4. Run Automated Tests to Verify
- [ ] Run `bash tests/test_do_script_setup.sh`.
- [ ] Run `bash tests/test_do_script_lint.sh` with purposely broken code (unformatted, lint warning, missing doc).

## 5. Update Documentation
- [ ] Update `GEMINI.md` to confirm `setup` is idempotent and `lint` follows the 3-step sequence.

## 6. Automated Verification
- [ ] Verify `./do setup && ./do setup` exits 0.
- [ ] Verify that a broken doc comment in a crate triggers a failure in `./do lint`.
