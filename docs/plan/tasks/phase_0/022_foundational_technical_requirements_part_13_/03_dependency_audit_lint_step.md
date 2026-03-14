# Task: Implement Dependency Audit in ./do lint (Sub-Epic: 022_Foundational Technical Requirements (Part 13))

## Covered Requirements
- [2_TAS-REQ-007A], [2_TAS-REQ-007B]

## Dependencies
- depends_on: []
- shared_components: ["./do Entrypoint Script & CI Pipeline"]

## 1. Initial Test Written
- [ ] Write a test that runs the dependency audit script on the current workspace and asserts exit code 0 (all resolved dependencies are in the authoritative allow-list)
- [ ] Write a negative test: temporarily add a bogus dependency (e.g., `rand = "0.8"`) to a workspace crate's `Cargo.toml`, run `cargo generate-lockfile`, run the audit script, and assert it exits non-zero with an error message listing `rand` as an undocumented dependency
- [ ] Write a test that verifies the audit script distinguishes between `[dependencies]` and `[dev-dependencies]` — dev-only crates from the authoritative dev table are allowed in `[dev-dependencies]` but not in `[dependencies]`
- [ ] Write a test that verifies transitive dependencies are checked: a documented crate pulling in an undocumented transitive dependency should be allowed (only direct dependencies are audited), OR document the exact behavior chosen

## 2. Task Implementation
- [ ] Create a dependency audit script (e.g., `scripts/dep-audit.sh` or inline in `./do lint`) that:
  1. Runs `cargo metadata --format-version 1` to get the resolved dependency graph
  2. Extracts the list of direct dependencies for each workspace member
  3. Compares each direct dependency against the authoritative tables from [2_TAS-REQ-005] (non-dev) and [2_TAS-REQ-007] (dev)
  4. Exits non-zero if any undocumented direct dependency is found, printing the crate name, version, and which workspace member introduced it
- [ ] Maintain the authoritative allow-list as a text file (e.g., `scripts/allowed-deps.txt`) or inline in the audit script, listing each crate name from the tables in requirements
- [ ] Include standard transitive-only crates (e.g., `syn`, `quote`, `proc-macro2`) in the allow-list since they are pulled by `derive` features of documented crates
- [ ] Add this audit step to `./do lint` so it runs as part of the standard lint pipeline
- [ ] Document the new-dependency approval process per [2_TAS-REQ-007B]: when adding a dependency, the developer must (1) add it to the authoritative table in the requirements doc, (2) add it to the crate's `Cargo.toml`, (3) add it to the allow-list, (4) verify `./do lint` passes

## 3. Code Review
- [ ] Verify the allow-list matches the authoritative tables exactly — no extra crates, no missing crates
- [ ] Verify the script handles workspace members with no dependencies gracefully
- [ ] Verify the error output is actionable: it tells the developer exactly which dependency is undocumented and in which crate
- [ ] Verify the script is POSIX sh-compatible per [2_TAS-REQ-010D]

## 4. Run Automated Tests to Verify
- [ ] Run `./do lint` with the audit step and confirm exit code 0 on the current workspace
- [ ] Run the negative test (bogus dependency) and confirm the audit step catches it

## 5. Update Documentation
- [ ] Document the dependency approval process in development/contributing docs per [2_TAS-REQ-007B]
- [ ] Document where the allow-list lives and how to update it

## 6. Automated Verification
- [ ] Run `./do lint` end-to-end and confirm exit code 0
- [ ] Manually verify the allow-list file contains exactly the crates from the authoritative tables in the requirements
