# Task: Implement Secure Permission Helpers in devs-checkpoint (Sub-Epic: 34_Risk 011 Verification)

## Covered Requirements
- [RISK-012], [RISK-012-BR-001]

## Dependencies
- depends_on: [none]
- shared_components: [devs-checkpoint]

## 1. Initial Test Written
- [ ] Write unit tests in `crates/devs-checkpoint/src/permissions.rs` (or equivalent) that:
    - On Unix:
        - Call `set_secure_file(path)` and verify permissions are `0600` (read/write for owner only).
        - Call `set_secure_dir(path)` and verify permissions are `0700` (read/write/execute for owner only).
    - On Windows:
        - Call `set_secure_file(path)` and `set_secure_dir(path)` and verify they do not panic and potentially emit a log warning (if logging is set up).
- [ ] Use `std::os::unix::fs::PermissionsExt` to verify modes on Unix.

## 2. Task Implementation
- [ ] In `crates/devs-checkpoint/src/permissions.rs`, implement `set_secure_file(path: &Path) -> Result<(), Error>`:
    - On Unix: Set permissions to `0600`.
    - On Windows: NOP, or emit a `warn` log level message (per `RISK-012-BR-005` context, though that's a separate requirement, it's good practice).
- [ ] Implement `set_secure_dir(path: &Path) -> Result<(), Error>`:
    - On Unix: Set permissions to `0700`.
    - On Windows: NOP.
- [ ] Export these helpers as part of the `devs_persist::permissions` module (if `devs_persist` is the public name for the checkpoint crate's persistence layer).

## 3. Code Review
- [ ] Verify that `#[cfg(unix)]` and `#[cfg(windows)]` are used correctly to handle platform-specific logic.
- [ ] Ensure that the functions use `devs_core::Error` or equivalent for consistent error reporting.

## 4. Run Automated Tests to Verify
- [ ] Run `cargo test -p devs-checkpoint`.
- [ ] Ensure that the Unix-specific tests are ignored on Windows and vice versa if applicable, but ideally both are verified in their respective CI environments.

## 5. Update Documentation
- [ ] Add doc comments explaining the security rationale (owner-only access).
- [ ] Reference `RISK-012` in the documentation.

## 6. Automated Verification
- [ ] Verify requirement traceability: `// Covers: RISK-012, RISK-012-BR-001`.
- [ ] Ensure `./do presubmit` is green.
