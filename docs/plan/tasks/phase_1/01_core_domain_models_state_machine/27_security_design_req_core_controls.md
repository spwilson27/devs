# Task: Implement Core Security Control Domain Types (SECURITY_DESIGN-REQ 054-113) (Sub-Epic: 01_core_domain_models_state_machine)

## Covered Requirements
- [5_SECURITY_DESIGN-REQ-054], [5_SECURITY_DESIGN-REQ-074], [5_SECURITY_DESIGN-REQ-075], [5_SECURITY_DESIGN-REQ-076], [5_SECURITY_DESIGN-REQ-077], [5_SECURITY_DESIGN-REQ-078], [5_SECURITY_DESIGN-REQ-079], [5_SECURITY_DESIGN-REQ-080], [5_SECURITY_DESIGN-REQ-081], [5_SECURITY_DESIGN-REQ-082], [5_SECURITY_DESIGN-REQ-083], [5_SECURITY_DESIGN-REQ-084], [5_SECURITY_DESIGN-REQ-085], [5_SECURITY_DESIGN-REQ-086], [5_SECURITY_DESIGN-REQ-087], [5_SECURITY_DESIGN-REQ-088], [5_SECURITY_DESIGN-REQ-089], [5_SECURITY_DESIGN-REQ-090], [5_SECURITY_DESIGN-REQ-091], [5_SECURITY_DESIGN-REQ-092], [5_SECURITY_DESIGN-REQ-093], [5_SECURITY_DESIGN-REQ-094], [5_SECURITY_DESIGN-REQ-095], [5_SECURITY_DESIGN-REQ-096], [5_SECURITY_DESIGN-REQ-097], [5_SECURITY_DESIGN-REQ-098], [5_SECURITY_DESIGN-REQ-099], [5_SECURITY_DESIGN-REQ-100], [5_SECURITY_DESIGN-REQ-101], [5_SECURITY_DESIGN-REQ-102], [5_SECURITY_DESIGN-REQ-103], [5_SECURITY_DESIGN-REQ-104], [5_SECURITY_DESIGN-REQ-105], [5_SECURITY_DESIGN-REQ-106], [5_SECURITY_DESIGN-REQ-107], [5_SECURITY_DESIGN-REQ-108], [5_SECURITY_DESIGN-REQ-109], [5_SECURITY_DESIGN-REQ-110], [5_SECURITY_DESIGN-REQ-111], [5_SECURITY_DESIGN-REQ-112], [5_SECURITY_DESIGN-REQ-113]

NOTE: These requirements map 1:1 to SEC-054 through SEC-113. The implementation is covered by tasks 11-22 which implement the SEC-NNN controls. This task serves as a traceability anchor for the 5_SECURITY_DESIGN-REQ numbering scheme.

## Dependencies
- depends_on: [11_redacted_wrapper_credential_security.md, 12_file_permission_security.md, 13_template_injection_prevention.md, 14_subprocess_execution_security.md, 15_webhook_ssrf_security.md, 16_logging_audit_security.md]
- shared_components: [devs-core (Consumer)]

## 1. Initial Test Written
- [ ] Write test `test_security_design_req_054_to_113_traceability` asserting a `SECURITY_DESIGN_CORE_CONTROLS: &[(&str, &str)]` constant maps each `5_SECURITY_DESIGN-REQ-NNN` to its corresponding `SEC-NNN` or `AC-SEC-*` ID
- [ ] Write test `test_no_gaps_in_core_controls` asserting the mapping covers IDs 054, 074-113 without gaps (note: 055-073 are in the non-unmapped range)
- [ ] Write test `test_all_mapped_sec_ids_exist` asserting each mapped SEC-NNN ID appears in the corresponding implementation task's covered requirements

## 2. Task Implementation
- [ ] Define `SECURITY_DESIGN_CORE_CONTROLS: &[(&str, &str)]` constant in `crates/devs-core/src/security/traceability.rs` mapping `5_SECURITY_DESIGN-REQ-NNN` → `SEC-NNN`
- [ ] Define `verify_traceability(req_id: &str) -> Option<&str>` function that looks up the corresponding implementation requirement ID
- [ ] Add `pub mod traceability;` to `crates/devs-core/src/security/mod.rs`

## 3. Code Review
- [ ] Verify every 5_SECURITY_DESIGN-REQ in the 054-113 range from the unmapped list is present
- [ ] Verify mappings are correct (each maps to its documented SEC-NNN counterpart)

## 4. Run Automated Tests to Verify
- [ ] Run `cargo test -p devs-core security::traceability` and confirm all three tests pass
- [ ] Run `cargo clippy -p devs-core -- -D warnings` and confirm no warnings

## 5. Update Documentation
- [ ] Add module-level doc comment to `crates/devs-core/src/security/traceability.rs` explaining the dual-numbering scheme (5_SECURITY_DESIGN-REQ maps to SEC/AC-SEC) and the purpose of the traceability tables

## 6. Automated Verification
- [ ] Confirm `cargo test -p devs-core` passes with zero failures
- [ ] Confirm `cargo doc -p devs-core --no-deps` generates documentation without errors
