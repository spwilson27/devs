# Task: Formatting Lint Blocking Enforcement (Sub-Epic: 072_Detailed Domain Specifications (Part 37))

## Covered Requirements
- [2_TAS-REQ-439]

## Dependencies
- depends_on: ["none"]
- shared_components: ["./do Entrypoint Script & CI Pipeline"]

## 1. Initial Test Written
- [ ] Write an integration test that invokes `cargo fmt --check --all` as a subprocess and asserts the exit code is 0 (all code is formatted).
- [ ] Write a test that reads the `./do` script source and asserts the `lint` subcommand invokes `cargo fmt --check` and treats a non-zero exit code as a blocking error (i.e., propagates the failure exit code rather than ignoring it or converting it to a warning).

## 2. Task Implementation
- [ ] In the `./do lint` command implementation, ensure `cargo fmt --check --all` is executed and its exit code is checked:
  - If `cargo fmt --check` returns non-zero, `./do lint` must immediately (or after collecting other results) exit with a non-zero status.
  - The output must clearly indicate "formatting check failed" so the developer knows to run `cargo fmt`.
- [ ] Ensure a `rustfmt.toml` exists at the workspace root with the project's formatting configuration (or confirm defaults are acceptable).

## 3. Code Review
- [ ] Verify `./do lint` does not swallow the `cargo fmt --check` exit code or convert it to a warning.
- [ ] Verify `./do presubmit` also inherits this blocking behavior (since it calls `./do lint`).

## 4. Run Automated Tests to Verify
- [ ] Run `cargo fmt --check --all` directly and confirm exit code 0.
- [ ] Run the integration test and confirm it passes.

## 5. Update Documentation
- [ ] Add `// Covers: 2_TAS-REQ-439` annotation to each test.

## 6. Automated Verification
- [ ] Run `./do lint` and verify exit code 0.
- [ ] Temporarily introduce a formatting violation (e.g., remove a trailing newline or add inconsistent indentation), run `./do lint`, confirm it fails with a non-zero exit code, then revert with `cargo fmt`.
