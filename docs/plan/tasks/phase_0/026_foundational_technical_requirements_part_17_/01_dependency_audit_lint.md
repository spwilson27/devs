# Task: Implement Dependency Audit Lint Step (Sub-Epic: 026_Foundational Technical Requirements (Part 17))

## Covered Requirements
- [2_TAS-REQ-013A]

## Dependencies
- depends_on: [none]
- shared_components: ["./do Entrypoint Script & CI Pipeline"]

## 1. Initial Test Written
- [ ] Create `tests/do_script/dependency_audit_test.sh` (or equivalent test harness) with three test cases:
  1. **Pass case**: Run the audit script against the current workspace with all dependencies matching the authoritative tables in `docs/plan/specs/2_tas.md` §2.2. Assert exit code 0 and no error output on stderr.
  2. **Undocumented dependency case**: Create a temporary `Cargo.toml` modification that adds a crate not present in the §2.2 authoritative tables (e.g., `rand = "0.8"`). Run the audit script. Assert exit code is non-zero. Assert stderr contains the name of the undocumented dependency.
  3. **Version mismatch case**: Create a temporary `Cargo.toml` modification that changes a known dependency's version to one outside the §2.2 range (e.g., change `tokio` from `"1"` to `"0.2"`). Run the audit script. Assert exit code is non-zero. Assert stderr identifies the mismatched dependency and expected vs actual version.
- [ ] Each test must restore the original `Cargo.toml` after running (use a trap or finally block).

## 2. Task Implementation
- [ ] Create `.tools/audit_dependencies.sh` as a POSIX sh-compatible script that:
  1. Runs `cargo metadata --format-version 1 --no-deps` and captures the JSON output.
  2. Extracts all direct dependencies from every workspace member's `Cargo.toml` by parsing the `packages[].dependencies[]` array from the metadata output (using `jq` or a lightweight parser).
  3. Loads the authoritative dependency table from a machine-readable file (e.g., `.tools/authorized_deps.toml` or a structured section). This table lists every permitted crate name and its allowed version range.
  4. For each dependency found in the workspace metadata:
     - Checks that the crate name exists in the authoritative table. If not, records an error: `"Undocumented dependency: <crate> in <workspace-member>"`.
     - Checks that the version requirement string in `Cargo.toml` matches the authoritative range. If not, records an error: `"Version mismatch for <crate>: expected <authorized>, found <actual>"`.
  5. After checking all dependencies, prints all collected errors to stderr.
  6. Exits 0 if no errors were found; exits 1 otherwise.
- [ ] Make the script executable: `chmod +x .tools/audit_dependencies.sh`.
- [ ] Integrate the audit into `./do lint` by adding a call to `.tools/audit_dependencies.sh` as one of the lint steps. Per [2_TAS-REQ-444], `./do lint` must not stop at the first failure — it collects all failures. The audit step's exit code is OR'd with the other lint step exit codes.

## 3. Code Review
- [ ] Verify the script handles a multi-crate Cargo workspace (iterates all `packages` in `cargo metadata` output, not just the root).
- [ ] Verify version range comparison is correct: the script compares the literal version requirement string from `Cargo.toml` against the authoritative string (exact string match), since Cargo's semver resolution is handled by Cargo itself — the audit only checks that the declared requirement matches the authorized one.
- [ ] Verify the authoritative dependency file is easy to update (adding a new dependency = adding one line).
- [ ] Verify the script does not require any tools beyond POSIX sh, `cargo`, and `jq` (or equivalent already in `./do setup`).

## 4. Run Automated Tests to Verify
- [ ] Run `./do lint` and confirm it completes successfully with exit code 0 when all dependencies are authorized.
- [ ] Manually add an unauthorized dependency to any crate's `Cargo.toml`, run `./do lint`, and confirm it fails with a clear error message identifying the unauthorized dependency. Revert the change.

## 5. Update Documentation
- [ ] Add a comment at the top of `.tools/audit_dependencies.sh` explaining its purpose, how to update the authoritative list, and which requirement it implements (`2_TAS-REQ-013A`).

## 6. Automated Verification
- [ ] Run: `test -x .tools/audit_dependencies.sh && echo "PASS: audit script exists and is executable"` — assert exit 0.
- [ ] Run: `grep -q 'audit_dependencies' ./do && echo "PASS: ./do lint invokes audit"` — assert exit 0.
- [ ] Run the test harness from step 1 and assert all three test cases pass.
