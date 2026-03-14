# Task: Implement Data Flow Security and Classification Types (Sub-Epic: 01_core_domain_models_state_machine)

## Covered Requirements
- [SEC-DAT-001], [SEC-DAT-002], [SEC-DAT-003], [SEC-DAT-004], [SEC-DAT-005], [SEC-DAT-006], [SEC-DAT-007], [SEC-DAT-008], [SEC-DAT-009], [SEC-DAT-010], [SEC-DAT-011], [SEC-DAT-012], [SEC-DAT-013], [SEC-DAT-014], [SEC-DAT-015], [SEC-DAT-016], [SEC-DAT-017], [SEC-DAT-018], [SEC-DAT-019], [SEC-DAT-020], [SEC-DAT-021], [SEC-DAT-022], [SEC-DAT-023], [5_SECURITY_DESIGN-REQ-331], [5_SECURITY_DESIGN-REQ-332], [5_SECURITY_DESIGN-REQ-333], [5_SECURITY_DESIGN-REQ-334], [5_SECURITY_DESIGN-REQ-335], [5_SECURITY_DESIGN-REQ-336], [5_SECURITY_DESIGN-REQ-337], [5_SECURITY_DESIGN-REQ-338], [5_SECURITY_DESIGN-REQ-339], [5_SECURITY_DESIGN-REQ-340], [5_SECURITY_DESIGN-REQ-341], [5_SECURITY_DESIGN-REQ-342], [5_SECURITY_DESIGN-REQ-343], [5_SECURITY_DESIGN-REQ-344], [5_SECURITY_DESIGN-REQ-345], [5_SECURITY_DESIGN-REQ-346], [5_SECURITY_DESIGN-REQ-347], [5_SECURITY_DESIGN-REQ-348], [5_SECURITY_DESIGN-REQ-349], [5_SECURITY_DESIGN-REQ-350], [5_SECURITY_DESIGN-REQ-351], [5_SECURITY_DESIGN-REQ-352], [5_SECURITY_DESIGN-REQ-353]

## Dependencies
- depends_on: ["11_redacted_wrapper_credential_security.md", "13_template_injection_prevention.md"]
- shared_components: [devs-core (Owner)]

## 1. Initial Test Written
- [ ] Write test `test_data_classification_levels` asserting `DataClassification` enum has `Public`, `Internal`, `Sensitive`, `Credential` variants
- [ ] Write test `test_stage_output_sanitization_spec` asserting `StageOutputSanitizer` strips control characters from agent output
- [ ] Write test `test_context_file_size_validation` asserting context files exceeding `MAX_CONTEXT_FILE_BYTES` are rejected
- [ ] Write test `test_data_flow_boundary_enum` asserting `DataFlowBoundary` enum covers `AgentInput`, `AgentOutput`, `TemplateResolution`, `CheckpointPersistence`, `WebhookDelivery`, `McpExposure`
- [ ] Write test `test_output_field_accessor_validates_path` asserting `OutputFieldPath::parse("stage.plan.output.field")` succeeds and `OutputFieldPath::parse("../../etc/passwd")` fails

## 2. Task Implementation
- [ ] Define `DataClassification` enum in `crates/devs-core/src/security/data_flow.rs` with `Public`, `Internal`, `Sensitive`, `Credential` variants
- [ ] Define `DataFlowBoundary` enum listing all system boundaries where data crosses trust domains
- [ ] Define `StageOutputSanitizer` with `sanitize(output: &str) -> String` stripping ANSI escape sequences and control characters (except newline/tab)
- [ ] Define `OutputFieldPath` with `parse(path: &str) -> Result<Self, FieldPathError>` validating `stage.<name>.<field>` format
- [ ] Define `ContextFileSpec` with `MAX_SIZE_BYTES: usize = 10_485_760` and `validate_size(bytes: usize) -> Result<(), SizeError>`
- [ ] Implement `DataClassification::requires_redaction(&self) -> bool` returning true for `Sensitive` and `Credential`

## 3. Code Review
- [ ] Verify sanitization removes ANSI escapes without corrupting valid UTF-8
- [ ] Verify data classification covers all sensitivity levels referenced in the security spec
- [ ] Verify field path parsing prevents path traversal

## 4. Run Automated Tests to Verify
- [ ] Run `cargo test -p devs-core -- data_flow` and confirm all data flow security tests pass
- [ ] Run `cargo test -p devs-core -- output_field` and confirm path traversal rejection tests pass
- [ ] Run `cargo clippy --workspace -- -D warnings` and confirm no warnings

## 5. Update Documentation
- [ ] Add module-level doc comment to `crates/devs-core/src/security/data_flow.rs` describing the classification hierarchy and boundary model
- [ ] Document `OutputFieldPath::parse` with examples of valid and rejected paths

## 6. Automated Verification
- [ ] `cargo test -p devs-core` passes with no failures
- [ ] Sanitizer strips ANSI sequences verified by test with known escape sequences
- [ ] `OutputFieldPath::parse("../../etc/passwd")` returns `Err` verified by test assertion
