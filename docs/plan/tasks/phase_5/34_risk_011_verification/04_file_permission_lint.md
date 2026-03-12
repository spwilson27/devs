# Task: Implement File Permission Lint (Sub-Epic: 34_Risk 011 Verification)

## Covered Requirements
- [RISK-012-BR-001]

## Dependencies
- depends_on: [03_secure_permission_helpers.md]
- shared_components: [none]

## 1. Initial Test Written
- [ ] Create a dummy file in a new crate, e.g., `crates/devs-core/src/violation.rs`, that contains:
    ```rust
    use std::fs;
    fn set_perms() {
        let _ = fs::set_permissions("test.txt", fs::Permissions::from_mode(0o600));
    }
    ```
- [ ] Run `./do lint` and verify it currently passes.

## 2. Task Implementation
- [ ] Update the linting infrastructure (e.g., the `./do` script or the custom linting script).
- [ ] Add a scan for all `.rs` files in the workspace.
- [ ] Implement a rule that:
    - Finds all occurrences of `fs::set_permissions` or `std::fs::set_permissions`.
    - Excludes the implementation file `crates/devs-checkpoint/src/permissions.rs` (the only allowed location).
- [ ] Ensure the lint outputs a clear error message: "Direct std::fs::set_permissions() is prohibited; use devs_persist::permissions::set_secure_file() instead."
- [ ] Fix any existing violations in the codebase (except in the allowed file).

## 3. Code Review
- [ ] Verify that the exclusion for the allowed file is correct.
- [ ] Verify that the lint is applied across all crates in the workspace.

## 4. Run Automated Tests to Verify
- [ ] Run `./do lint` with the violation file and verify it exits non-zero.
- [ ] Remove the violation file and verify `./do lint` exits zero.

## 5. Update Documentation
- [ ] Update `.agent/MEMORY.md` to reflect the new file permission policy.

## 6. Automated Verification
- [ ] Verify requirement traceability: `// Covers: RISK-012-BR-001`.
- [ ] Ensure `./do presubmit` is green.
