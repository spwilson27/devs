# Task: Authoritative Dependency Version Table Lint (Sub-Epic: 096_Acceptance Criteria & Roadmap (Part 7))

## Covered Requirements
- [AC-ROAD-P0-007]

## Dependencies
- depends_on: [none]
- shared_components: [./do Entrypoint Script & CI Pipeline, Traceability & Coverage Infrastructure]

## 1. Initial Test Written
- [ ] Create `tests/dependency_audit_test.sh` (POSIX sh) with the following test cases annotated `# Covers: AC-ROAD-P0-007`:
    - **Test 1 — clean baseline passes**: Run the dependency checker against the unmodified workspace. Assert exit code 0.
    - **Test 2 — unauthorized dependency detected**:
        1. Create a temporary copy of a crate's `Cargo.toml` (e.g., `crates/devs-core/Cargo.toml`).
        2. Append `left-pad = "1.0"` under `[dependencies]`.
        3. Run `cargo generate-lockfile` to update `Cargo.lock`.
        4. Run the dependency checker script.
        5. Assert exit code is non-zero.
        6. Assert stderr/stdout contains the string `left-pad` identifying the offending dependency.
        7. Restore the original `Cargo.toml` and `Cargo.lock`.
    - **Test 3 — dev-dependency not flagged**:
        1. Add `pretty_assertions = "1.4"` under `[dev-dependencies]` of a crate.
        2. Run `cargo generate-lockfile`.
        3. Run the dependency checker.
        4. Assert exit code 0 (dev-only deps are not subject to the audit).
        5. Restore originals.
- [ ] Create a Rust integration test in `tests/lint_dependency_audit.rs`:
    - `// Covers: AC-ROAD-P0-007`
    - Invoke `./do lint` as a `std::process::Command` and assert it completes without error on the clean workspace.

## 2. Task Implementation
- [ ] Create `.tools/check_dependencies.py` (Python 3, no third-party deps) that:
    1. Reads the authoritative version table from a TOML file at `.tools/approved_dependencies.toml`. This file has a `[dependencies]` section mapping `crate_name = "version_req"` for every approved production dependency.
    2. Parses `Cargo.lock` to extract all resolved packages (name + version).
    3. Parses every `Cargo.toml` in the workspace to build the set of *production* dependency names (entries under `[dependencies]`, not `[dev-dependencies]` or `[build-dependencies]`).
    4. For each production dependency found in `Cargo.lock`:
        - Check it exists in `.tools/approved_dependencies.toml`.
        - If missing, print `ERROR: unapproved dependency: <name> <version>` to stderr.
    5. Exit 0 if all production dependencies are approved; exit 1 otherwise.
- [ ] Create `.tools/approved_dependencies.toml` containing every current production dependency with its version. Populate by inspecting all `[dependencies]` sections in workspace `Cargo.toml` files.
- [ ] Update the `./do` script's `lint` subcommand to invoke `python3 .tools/check_dependencies.py` and propagate its exit code. If `python3` is not available, print a clear error message and exit 1.
- [ ] Ensure `./do lint` exits non-zero if the dependency check fails, even if other lint steps pass.

## 3. Code Review
- [ ] Verify `.tools/check_dependencies.py` correctly distinguishes `[dependencies]` from `[dev-dependencies]` and `[build-dependencies]` by parsing TOML structure (not regex).
- [ ] Verify the script handles workspace-level `[workspace.dependencies]` inheritance correctly.
- [ ] Verify error messages include both the crate name and version for actionable debugging.
- [ ] Verify `.tools/approved_dependencies.toml` does not contain dev-only dependencies.

## 4. Run Automated Tests to Verify
- [ ] Run `bash tests/dependency_audit_test.sh` — all 3 test cases pass.
- [ ] Run `./do lint` on the clean workspace — exits 0.
- [ ] Run `cargo test --test lint_dependency_audit` — passes.

## 5. Update Documentation
- [ ] Add a comment at the top of `.tools/approved_dependencies.toml` explaining that any new production dependency must be added here and that `./do lint` enforces this.

## 6. Automated Verification
- [ ] Run `./do test` and verify `target/traceability.json` includes `AC-ROAD-P0-007` in covered requirements.
- [ ] Run `./do lint` and confirm exit code 0 on the committed workspace.
