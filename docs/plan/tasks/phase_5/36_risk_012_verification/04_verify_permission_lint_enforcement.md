# Task: Verify File Permission Lint Enforcement (Sub-Epic: 36_Risk 012 Verification)

## Covered Requirements
- [AC-RISK-012-05]

## Dependencies
- depends_on: [none]
- shared_components: [./do Entrypoint Script]

## 1. Initial Test Written
- [ ] Create a shell test script `tests/lint/test_permission_lint_failure.sh` that:
    - Creates a temporary file `crates/devs-core/src/leaky_permissions.rs` containing a call to `std::fs::set_permissions(path, permissions)`.
    - Runs `./do lint` (or the specific grep command).
    - Asserts that it exits non-zero and points to the unauthorized call in `leaky_permissions.rs`.
    - Cleans up the temporary file.

## 2. Task Implementation
- [ ] Add the following lint check to the `lint` subcommand in `./do`:
    - `grep -rn "fs::set_permissions" crates/ | grep -v "devs-checkpoint/src/permissions.rs" && exit 1 || exit 0`
- [ ] Run `./do lint` and ensure it passes on the current codebase.

## 3. Code Review
- [ ] Verify that the `grep` command correctly identifies `fs::set_permissions` while allowing it in the designated safe file (`devs-checkpoint/src/permissions.rs`).
- [ ] Ensure that no other calls currently exist in the codebase.

## 4. Run Automated Tests to Verify
- [ ] Run `sh tests/lint/test_permission_lint_failure.sh`.
- [ ] Run `./do lint` and ensure it passes.

## 5. Update Documentation
- [ ] Document in `.agent/MEMORY.md` under the "Brittle Areas" section that direct use of `std::fs::set_permissions` is prohibited outside the `devs-checkpoint` permissions module to maintain cross-platform security consistency.

## 6. Automated Verification
- [ ] Verify that `grep -rn "fs::set_permissions" crates/ | grep -v "devs-checkpoint/src/permissions.rs"` returns no matches.
- [ ] Check `target/traceability.json` to ensure `AC-RISK-012-05` is covered.
