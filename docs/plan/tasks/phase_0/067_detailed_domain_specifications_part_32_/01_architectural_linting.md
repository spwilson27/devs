# Task: Architectural Linting for Library Crates (Sub-Epic: 067_Detailed Domain Specifications (Part 32))

## Covered Requirements
- [2_TAS-REQ-413], [2_TAS-REQ-414]

## Dependencies
- depends_on: [none]
- shared_components: [devs-core, ./do Entrypoint Script]

## 1. Initial Test Written
- [ ] Create a temporary crate `devs-core-test-lint` in the workspace that attempts to:
    - Add `tokio` to its `[dependencies]`.
    - Use `println!` in its source code.
    - Use `log::info!` in its source code.
- [ ] Write a test script (or a new case in a linter test) that runs `./do lint` and expects it to FAIL with specific errors related to these prohibited patterns.

## 2. Task Implementation
- [ ] Configure workspace-level `clippy.toml` to disallow `println!`, `eprintln!`, and `log::` macros in library crates.
    - Use `disallowed-macros` in clippy configuration if available, or specify `#[deny(clippy::print_stdout, clippy::print_stderr)]` in library root files.
- [ ] Update the `./do lint` script to include a check for `devs-core` dependencies.
    - Implement a grep or `cargo metadata` based check that ensures `devs-core` (and other marked library crates) do not have `tokio`, `git2`, `reqwest`, or `tonic` in their `[dependencies]` section.
- [ ] Ensure the linter distinguishes between `[dependencies]` and `[dev-dependencies]`, allowing I/O crates in tests.
- [ ] Integrate `tracing` as the standard logging library for the workspace.

## 3. Code Review
- [ ] Verify that the linter correctly identifies and reports violations.
- [ ] Ensure that the `devs-core` dependency check is robust and won't be bypassed by transitive dependencies (though the requirement specifically mentions the crate's own `[dependencies]`).
- [ ] Check that the structured tracing requirement is documented in the developer guide.

## 4. Run Automated Tests to Verify
- [ ] Run `./do lint` on the codebase.
- [ ] Verify that the temporary violating crate causes a failure.
- [ ] Remove the temporary violating crate and verify `./do lint` passes.

## 5. Update Documentation
- [ ] Document the architectural constraints in `CONTRIBUTING.md` or a similar architectural guide, referencing [2_TAS-REQ-413] and [2_TAS-REQ-414].
- [ ] Update the `./do` script help message if any new linting flags were added.

## 6. Automated Verification
- [ ] Run `grep -r "println!" devs-core/src` (or similar) to ensure no existing violations exist in the core library.
- [ ] Validate the `./do lint` exit code in the CI environment.
