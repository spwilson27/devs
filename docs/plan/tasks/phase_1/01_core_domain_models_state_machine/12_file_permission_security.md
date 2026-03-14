# Task: Implement File Permission Security Types and Validation (Sub-Epic: 01_core_domain_models_state_machine)

## Covered Requirements
- [SEC-019], [SEC-020], [SEC-020-BR-001], [SEC-020-BR-002], [SEC-020-BR-003], [SEC-020-BR-004], [SEC-020-BR-005], [SEC-026], [SEC-027], [SEC-028], [SEC-029], [SEC-030], [SEC-031], [SEC-032], [SEC-033], [SEC-034], [SEC-052], [SEC-105], [5_SECURITY_DESIGN-REQ-086], [5_SECURITY_DESIGN-REQ-087], [5_SECURITY_DESIGN-REQ-088], [5_SECURITY_DESIGN-REQ-089], [5_SECURITY_DESIGN-REQ-090], [5_SECURITY_DESIGN-REQ-091], [5_SECURITY_DESIGN-REQ-092], [5_SECURITY_DESIGN-REQ-093], [5_SECURITY_DESIGN-REQ-094], [5_SECURITY_DESIGN-REQ-095], [5_SECURITY_DESIGN-REQ-096], [5_SECURITY_DESIGN-REQ-097], [5_SECURITY_DESIGN-REQ-098], [5_SECURITY_DESIGN-REQ-099], [5_SECURITY_DESIGN-REQ-100], [5_SECURITY_DESIGN-REQ-101], [5_SECURITY_DESIGN-REQ-102], [5_SECURITY_DESIGN-REQ-103], [5_SECURITY_DESIGN-REQ-104], [5_SECURITY_DESIGN-REQ-105], [5_SECURITY_DESIGN-REQ-204], [5_SECURITY_DESIGN-REQ-205], [5_SECURITY_DESIGN-REQ-206], [5_SECURITY_DESIGN-REQ-207], [5_SECURITY_DESIGN-REQ-208], [5_SECURITY_DESIGN-REQ-209], [5_SECURITY_DESIGN-REQ-210], [AC-SEC-1-004], [AC-SEC-1-008], [AC-SEC-1-009], [AC-SEC-1-010], [AC-SEC-1-016], [AC-SEC-2-005], [AC-SEC-2-009], [AC-SEC-2-011], [AC-SEC-2-020], [AC-SEC-3-005], [AC-SEC-3-022]

## Dependencies
- depends_on: ["11_redacted_wrapper_credential_security.md"]
- shared_components: [devs-core (Owner)]

## 1. Initial Test Written
- [ ] Write test `test_file_permission_check_0600` asserting `FilePermission::OwnerReadWrite.mode()` returns `0o600`
- [ ] Write test `test_file_permission_check_0700` asserting `FilePermission::OwnerAll.mode()` returns `0o700`
- [ ] Write test `test_path_validation_rejects_traversal` asserting `validate_path("../../etc/passwd", &base)` returns error
- [ ] Write test `test_path_validation_accepts_relative_within_base` asserting `validate_path("config/devs.toml", &base)` succeeds
- [ ] Write test `test_discovery_file_path_resolution` verifying `DEVS_DISCOVERY_FILE` env var override and default `~/.config/devs/server.addr`
- [ ] Write test `test_atomic_write_protocol` verifying tmp-file-then-rename pattern types

## 2. Task Implementation
- [ ] Define `FilePermission` enum in `crates/devs-core/src/security/file_permissions.rs` with variants `OwnerReadWrite` (0o600), `OwnerAll` (0o700), `OwnerReadOnly` (0o400)
- [ ] Implement `FilePermission::mode(&self) -> u32`
- [ ] Define `validate_path(path: &Path, base_dir: &Path) -> Result<PathBuf, PathValidationError>` that canonicalizes and checks the path stays within `base_dir`
- [ ] Define `PathValidationError` enum with `TraversalAttempt`, `NonExistent`, `NotWithinBase`
- [ ] Define `DiscoveryFilePath` type with `resolve() -> PathBuf` that checks `DEVS_DISCOVERY_FILE` then falls back to `~/.config/devs/server.addr`
- [ ] Define `AtomicWriteSpec` struct describing the temp-file + rename atomic write protocol

## 3. Code Review
- [ ] Verify path traversal prevention uses canonicalization, not string matching
- [ ] Verify permission constants match Unix conventions
- [ ] Verify no `unsafe` code

## 4. Run Automated Tests to Verify
- [ ] Run `cargo test -p devs-core security::file_permissions` and confirm all tests pass
- [ ] Run `cargo test -p devs-core` to confirm no regressions in the crate

## 5. Update Documentation
- [ ] Add doc comments to `FilePermission`, `validate_path`, `DiscoveryFilePath`, and `AtomicWriteSpec` explaining the security rationale for each
- [ ] Document that `validate_path` must be called before any file operation on user-supplied paths

## 6. Automated Verification
- [ ] `cargo clippy -p devs-core -- -D warnings` passes with no warnings
- [ ] `cargo test -p devs-core security::file_permissions` passes
- [ ] `cargo fmt --check -p devs-core` passes
