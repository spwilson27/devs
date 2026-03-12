# Task: Implement Dependency Audit Lint (Sub-Epic: 026_Foundational Technical Requirements (Part 17))

## Covered Requirements
- [2_TAS-REQ-013A]

## Dependencies
- depends_on: [none]
- shared_components: [none]

## 1. Initial Test Written
- [ ] Create a reproduction test case that adds an undocumented dependency to a crate's `Cargo.toml` and verifies that the audit script fails.
- [ ] Create a test case that modifies a dependency version to a range not matching the authoritative table and verifies failure.
- [ ] Create a test case that verifies the script passes when all dependencies match the authoritative table.

## 2. Task Implementation
- [ ] Implement a shell script `.tools/audit_dependencies.sh` (or a Python equivalent if `./do` remains Python, but the requirement specifies a shell script) that:
    - Runs `cargo metadata --format-version 1 --no-deps` to list all direct dependencies of all workspace crates.
    - Extracts the authoritative dependency list and version ranges from `docs/plan/specs/2_tas.md` §2.2.
    - Compares the actual dependencies against the authoritative set.
    - Exits with a non-zero status and a descriptive error message if any undocumented or mismatched dependency is found.
- [ ] Integrate this script into the `./do lint` command.

## 3. Code Review
- [ ] Ensure the script handles multi-crate workspaces correctly (checks every member crate).
- [ ] Verify that the script accurately parses version ranges (e.g., `1.0` matching `^1.0.0`).
- [ ] Ensure the authoritative list is easily updatable as per `2_TAS-REQ-007B`.

## 4. Run Automated Tests to Verify
- [ ] Run `./do lint` and ensure it passes with the current (valid) dependencies.
- [ ] Temporarily add an undocumented dependency to `devs-core/Cargo.toml` and verify `./do lint` fails.

## 5. Update Documentation
- [ ] Update the `GEMINI.md` or agent memory to reflect that the dependency audit is now active and how to update the authoritative list.

## 6. Automated Verification
- [ ] Verify that `.tools/audit_dependencies.sh` exists and is executable.
- [ ] Verify that `./do lint` invokes the audit script.
