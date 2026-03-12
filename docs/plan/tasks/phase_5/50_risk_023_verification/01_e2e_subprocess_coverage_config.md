# Task: E2E Subprocess Coverage Configuration (Sub-Epic: 50_Risk 023 Verification)

## Covered Requirements
- [RISK-023-BR-001]

## Dependencies
- depends_on: [none]
- shared_components: [devs-adapters, devs-executor, ./do Entrypoint Script]

## 1. Initial Test Written
- [ ] Create an integration test in `crates/devs-test-utils` (or the established E2E harness) that spawns a dummy Rust binary (configured as a `bin` in a test crate).
- [ ] The test must verify that the environment of the spawned subprocess contains `LLVM_PROFILE_FILE` and that the value includes the `%p` placeholder.
- [ ] The test must verify that when the subprocess is terminated via `SIGTERM`, it successfully writes a non-empty `.profraw` file to the directory specified in `LLVM_PROFILE_FILE`.

## 2. Task Implementation
- [ ] Update `ServerManager` and `CliWrapper` (or equivalent E2E test helpers) to automatically inject `LLVM_PROFILE_FILE` into the environment of spawned `devs-server` and `devs-cli` subprocesses.
- [ ] Use a standardized naming convention for profile files: `target/coverage/e2e/%p.profraw`.
- [ ] Ensure that `ServerManager` sends `SIGTERM` (using `nix::sys::signal::kill` or equivalent) to the server process and waits for it to exit before proceeding, ensuring the LLVM profiler has time to flush data to disk.
- [ ] Implement a verification helper that checks for the existence of at least one non-zero-sized `.profraw` file in the E2E coverage directory after a test run.

## 3. Code Review
- [ ] Verify that `LLVM_PROFILE_FILE` is NEVER set without the `%p` suffix in any E2E test helper.
- [ ] Ensure that `SIGKILL` is only used as a last resort if `SIGTERM` fails to stop the process within a reasonable timeout.
- [ ] Check that the coverage directory is created automatically before spawning subprocesses.

## 4. Run Automated Tests to Verify
- [ ] Run the E2E harness tests: `cargo test -p devs-test-utils`.
- [ ] Verify that `.profraw` files are generated in `target/coverage/e2e/`.

## 5. Update Documentation
- [ ] Update the internal "Testing Guide" (e.g., `docs/architecture/testing.md`) to document the requirement for `%p` in `LLVM_PROFILE_FILE` and clean SIGTERM shutdown.
- [ ] Update agent memory to reflect that E2E subprocesses require specific environment setup for accurate coverage.

## 6. Automated Verification
- [ ] Run `./do coverage --e2e` and verify that the generated coverage report includes data from the server and CLI subprocesses.
- [ ] Use `ls target/coverage/e2e/*.profraw` to confirm that multiple PID-tagged files are present after a concurrent test run.
