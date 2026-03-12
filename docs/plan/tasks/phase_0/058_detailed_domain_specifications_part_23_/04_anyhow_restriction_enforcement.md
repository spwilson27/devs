# Task: Anyhow Crate Restriction Policy Enforcement (Sub-Epic: 058_Detailed Domain Specifications (Part 23))

## Covered Requirements
- [2_TAS-REQ-234]

## Dependencies
- depends_on: [none]
- shared_components: ["./do Entrypoint Script"]

## 1. Initial Test Written
- [ ] Create a mock library crate in a temporary directory with `anyhow` as a dependency.
- [ ] Verify that the restriction enforcement script (to be implemented) correctly identifies this violation and exits non-zero.
- [ ] Create a mock binary crate with `anyhow` and verify that it is permitted.

## 2. Task Implementation
- [ ] Implement a shell script `scripts/enforce_anyhow_restriction.sh` (or a Python script).
- [ ] The script should:
    - Iterate through all `Cargo.toml` files in the workspace.
    - Identify if the crate is a library or a binary by checking for the `[lib]` or `[[bin]]` section, or the presence of `src/main.rs`.
    - If it's a library crate, scan its `[dependencies]` and `[build-dependencies]` for `anyhow`.
    - If found, print a descriptive error and exit non-zero.
- [ ] Integrate this script into the `./do lint` subcommand.
- [ ] Update the lint step in the CI pipeline to include this check.

## 3. Code Review
- [ ] Verify that the script correctly distinguishes between library and binary crates.
- [ ] Ensure that `anyhow` is still permitted in `[dev-dependencies]` of library crates for testing purposes, if required. (Wait, requirement `2_TAS-REQ-234` says "MUST NOT appear in library crates' `[dependencies]`").
- [ ] Check that the error message is clear and points to the specific crate violating the policy.

## 4. Run Automated Tests to Verify
- [ ] Run the mock test cases created in step 1 and ensure they pass.
- [ ] Run `./do lint` on the current repository and ensure it passes (since no violations should exist yet).

## 5. Update Documentation
- [ ] Update `.agent/MEMORY.md` to reflect the implementation of the `anyhow` restriction enforcement policy.

## 6. Automated Verification
- [ ] Run `./do lint` and verify that the `anyhow` restriction check is executed and reported in the output.
