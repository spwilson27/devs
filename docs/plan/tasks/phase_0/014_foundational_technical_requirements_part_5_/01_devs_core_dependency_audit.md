# Task: devs-core Forbidden Dependency Enforcement (Sub-Epic: 014_Foundational Technical Requirements (Part 5))

## Covered Requirements
- [2_TAS-REQ-001E]

## Dependencies
- depends_on: [none]
- shared_components: [devs-core (consumer), ./do Entrypoint Script & CI Pipeline (consumer)]

## 1. Initial Test Written
- [ ] In `devs-core/tests/forbidden_deps.rs`, write a test annotated `// Covers: 2_TAS-REQ-001E` that shells out to `cargo tree -p devs-core --edges normal --prefix none` and asserts the output contains none of `tokio`, `git2`, `reqwest`, or `tonic`. The test must parse each line of output and fail with a descriptive message naming the forbidden crate if found.
- [ ] Write a second test in the same file that temporarily adds a `[dependencies] tokio = { version = "1", features = ["rt"] }` line to a copy of `devs-core/Cargo.toml` (in a tempdir), runs `cargo tree` against it, and confirms the forbidden dependency IS detected — validating the detection logic itself.

## 2. Task Implementation
- [ ] Ensure `devs-core/Cargo.toml` has zero `tokio`, `git2`, `reqwest`, or `tonic` entries in `[dependencies]` (dev-dependencies are permitted).
- [ ] In the `./do` script's `lint` subcommand, add a step that runs `cargo tree -p devs-core --edges normal --prefix none` and pipes the output through `grep -E '^(tokio|git2|reqwest|tonic) '`. If grep matches (exit 0), the lint step must fail with message: `"ERROR: devs-core has forbidden non-dev dependency"`. If grep does not match (exit 1), the step passes.
- [ ] Where async trait signatures are needed in `devs-core`, use `std::future::Future` return types or the `futures-core` crate (which has no runtime) instead of `tokio`.

## 3. Code Review
- [ ] Verify that `devs-core/Cargo.toml` `[dependencies]` section contains no entries for tokio, git2, reqwest, or tonic (transitive inclusion via other crates must also be checked via `cargo tree`).
- [ ] Confirm the `./do lint` step is positioned early in the lint sequence so violations are caught before compilation-heavy steps.

## 4. Run Automated Tests to Verify
- [ ] Run `cargo test -p devs-core --test forbidden_deps` and confirm all tests pass.
- [ ] Run `./do lint` and confirm the forbidden dependency check passes.

## 5. Update Documentation
- [ ] Add a doc comment to `devs-core/src/lib.rs` stating the forbidden dependency invariant and referencing [2_TAS-REQ-001E].

## 6. Automated Verification
- [ ] Run `./do lint` end-to-end and confirm exit code 0.
- [ ] Grep test output for `// Covers: 2_TAS-REQ-001E` to confirm traceability annotation is present.
