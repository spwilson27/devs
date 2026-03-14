# Task: Implement Attack Surface Reduction and Security Test Annotations (Sub-Epic: 01_core_domain_models_state_machine)

## Covered Requirements
- [SEC-ATK-001], [SEC-ATK-002], [SEC-ATK-003], [SEC-ATK-004], [SEC-RISK-001], [SEC-RISK-002], [SEC-RISK-003], [5_SECURITY_DESIGN-REQ-354], [5_SECURITY_DESIGN-REQ-355], [5_SECURITY_DESIGN-REQ-356], [5_SECURITY_DESIGN-REQ-357], [5_SECURITY_DESIGN-REQ-358], [5_SECURITY_DESIGN-REQ-359], [5_SECURITY_DESIGN-REQ-360], [AC-SEC-4-001], [AC-SEC-4-002], [AC-SEC-4-003], [AC-SEC-4-004], [AC-SEC-4-005], [AC-SEC-4-006], [AC-SEC-4-007], [AC-SEC-4-008], [AC-SEC-4-009], [AC-SEC-4-010], [AC-SEC-4-011]

## Dependencies
- depends_on: ["11_redacted_wrapper_credential_security.md", "13_template_injection_prevention.md"]
- shared_components: [devs-core (Owner)]

## 1. Initial Test Written
- [ ] Write test `test_attack_vector_registry` asserting `AttackVector` enum covers `PromptInjection`, `CredentialExfiltration`, `PathTraversal`, `Ssrf`, `ShellInjection`, `CheckpointCorruption`, `LogInjection`
- [ ] Write test `test_threat_severity_levels` asserting `ThreatSeverity` enum has `Critical`, `High`, `Medium`, `Low` variants with ordinal comparison
- [ ] Write test `test_security_test_annotation_format` asserting `SecurityAnnotation::parse("// Covers: SEC-001")` extracts `SEC-001`
- [ ] Write test `test_security_test_annotation_risk` asserting `SecurityAnnotation::parse("// Covers: RISK-007")` extracts `RISK-007`
- [ ] Write test `test_threat_model_entry` asserting `ThreatModelEntry` holds attack vector, severity, mitigation status, and covering test IDs

## 2. Task Implementation
- [ ] Define `AttackVector` enum in `crates/devs-core/src/security/threat_model.rs` listing all attack vectors from the security design
- [ ] Define `ThreatSeverity` enum with `Critical`, `High`, `Medium`, `Low` and `impl Ord`
- [ ] Define `ThreatModelEntry` struct with `id: String`, `vector: AttackVector`, `severity: ThreatSeverity`, `status: MitigationStatus`, `covering_tests: Vec<String>`
- [ ] Define `MitigationStatus` enum with `Mitigated`, `AcceptedRisk`, `Open`
- [ ] Define `SecurityAnnotation` with `parse(comment: &str) -> Option<Vec<String>>` extracting requirement IDs from `// Covers: XXX` annotations
- [ ] Ensure all types derive `Debug`, `Clone`, `PartialEq`, `Serialize`, `Deserialize`

## 3. Code Review
- [ ] Verify attack vector list matches the security design document's threat model
- [ ] Verify severity ordering is correct (Critical > High > Medium > Low)
- [ ] Verify annotation parser handles multiple IDs on one line

## 4. Run Automated Tests to Verify
- [ ] Run `cargo test -p devs-core -- threat_model` and confirm all threat model tests pass
- [ ] Run `cargo test -p devs-core -- security_annotation` and confirm annotation parsing tests pass
- [ ] Run `cargo clippy --workspace -- -D warnings` and confirm no warnings

## 5. Update Documentation
- [ ] Add module-level doc comment to `crates/devs-core/src/security/threat_model.rs` describing the threat model structure and annotation convention
- [ ] Document `SecurityAnnotation::parse` with examples of valid annotation formats

## 6. Automated Verification
- [ ] `cargo test -p devs-core` passes with no failures
- [ ] `ThreatSeverity::Critical > ThreatSeverity::Low` verified by test assertion using `Ord`
- [ ] All `AttackVector` variants present in the enum verified by exhaustive match in test
