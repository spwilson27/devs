# Task: devs-core Dependency Isolation Lint Check (Sub-Epic: 075_Detailed Domain Specifications (Part 40))

## Covered Requirements
- [2_TAS-REQ-450]

## Dependencies
- depends_on: []
- shared_components: ["devs-core", "./do Entrypoint Script & CI Pipeline"]

## 1. Initial Test Written
- [ ] Create a shell-level test script (or integration test in a `tests/` directory) that runs `cargo tree -p devs-core --edges normal` and asserts the output does **not** contain the strings `tokio`, `git2`, `reqwest`, or `tonic` (case-sensitive, whole-word match against crate names in the dependency tree output).
- [ ] The test must parse each line of `cargo tree` output, extract the crate name (the first token before any version), and fail with a descriptive error message listing every forbidden dependency found, e.g., `"FAIL: devs-core transitively depends on tokio via: devs-core -> foo -> tokio"`.
- [ ] Add a dedicated test function or script entry named `test_devs_core_no_forbidden_deps` so it can be invoked independently.

## 2. Task Implementation
- [ ] Add a dependency-audit step to `./do lint` that executes `cargo tree -p devs-core --edges normal` and pipes the output through a grep/awk filter that checks for `tokio`, `git2`, `reqwest`, and `tonic`.
- [ ] If any forbidden dependency is found, `./do lint` must exit non-zero with a clear message: `"ERROR [2_TAS-REQ-450]: devs-core must not depend on <crate>. Remove or replace the dependency."`.
- [ ] Audit the current `devs-core/Cargo.toml` to confirm none of these crates appear in `[dependencies]` or `[dev-dependencies]` (dev-dependencies are permitted only if they do not leak into normal edges; verify with `--edges normal`).
- [ ] If any transitive dependency pulls in a forbidden crate, refactor `devs-core` to remove or replace it.

## 3. Code Review
- [ ] Verify the lint step uses `--edges normal` (not `--edges all`) so dev-only and build-only dependencies are excluded.
- [ ] Confirm the grep pattern matches crate names only, not substrings (e.g., `tokio-util` should also be flagged since it implies `tokio`; any crate starting with `tokio` is forbidden).
- [ ] Ensure the check is idempotent and does not modify any files.

## 4. Run Automated Tests to Verify
- [ ] Run `./do lint` and confirm it exits 0 with the dependency isolation check passing.
- [ ] Temporarily add `tokio` to `devs-core/Cargo.toml` `[dependencies]`, run `./do lint`, and confirm it exits non-zero with the expected error message. Revert the change.

## 5. Update Documentation
- [ ] Add a `// Covers: 2_TAS-REQ-450` annotation to the test or lint check code.

## 6. Automated Verification
- [ ] Run `./do lint` in CI and confirm exit code 0. Parse output to confirm the dependency isolation check line is present and reports PASS.
