# Task: Implement E2E Test Isolation Lint (Sub-Epic: 34_Risk 011 Verification)

## Covered Requirements
- [AC-RISK-011-02]

## Dependencies
- depends_on: [01_devs_test_helper_server_handle.md]
- shared_components: [none]

## 1. Initial Test Written
- [ ] Create a dummy test file at `tests/violation_test.rs` that contains:
    ```rust
    use std::process::Command;
    #[test]
    fn test_bad_spawn() {
        let _ = Command::new("devs-server").spawn().unwrap();
    }
    ```
- [ ] Run `./do lint` and verify it currently passes (or doesn't fail due to this specific rule).

## 2. Task Implementation
- [ ] Update the linting infrastructure (either the `do` script itself or a dedicated lint tool).
- [ ] Add a scan for all files in `tests/**/*.rs`.
- [ ] Implement a rule that:
    - Finds any call to `Command::new("devs")` or `Command::new("devs-server")`.
    - Excludes files that are part of `devs-test-helper` (if they exist in `tests/`).
    - The requirement says "outside of `devs_test_helper`". If the lint tool can identify the current crate, it should exclude the `devs-test-helper` crate. If it's a simple `grep` scan, it should exclude the path `crates/devs-test-helper/`.
- [ ] Ensure the lint outputs a clear error message: "Direct Command::new('devs') in tests is prohibited; use devs_test_helper::start_server() instead."

## 3. Code Review
- [ ] Verify that the lint does not have false positives for other "devs" strings.
- [ ] Verify that the lint correctly identifies both literal `"devs"` and `"devs-server"`.

## 4. Run Automated Tests to Verify
- [ ] Run `./do lint` with the violation file and verify it exits non-zero.
- [ ] Remove the violation file and verify `./do lint` exits zero.

## 5. Update Documentation
- [ ] Update `.agent/MEMORY.md` to reflect the new E2E isolation policy and the role of `devs-test-helper`.

## 6. Automated Verification
- [ ] Verify requirement traceability: `// Covers: AC-RISK-011-02`.
- [ ] Ensure `./do presubmit` is green.
