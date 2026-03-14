# Task: Implement Risk Matrix Acceptance Criteria (Sub-Epic: 01_core_domain_models_state_machine)

## Covered Requirements
- [AC-RISK-MATRIX-008]

## Dependencies
- depends_on: ["24_roadmap_dependency_graph.md"]
- shared_components: [devs-core (Owner), ./do Entrypoint Script & CI Pipeline (Consumer)]

## 1. Initial Test Written
- [ ] Write test `test_risk_matrix_json_schema_validation` that validates all risk records in `docs/plan/requirements/8_risks_mitigation.md` against the JSON schema
- [ ] Write test `test_risk_matrix_all_high_severity_have_tests` that asserts all risks with severity_score >= 6 have at least one `// Covers: RISK-NNN` annotation
- [ ] Write test `test_risk_matrix_mitigation_tags_match` that asserts every `[RISK-NNN]` has a corresponding `[MIT-NNN]` tag
- [ ] Write test `test_risk_matrix_no_duplicate_ids` that asserts all risk IDs are unique
- [ ] Write test `test_risk_matrix_state_transitions_valid` that asserts risk status transitions follow the state machine (Open → Mitigated → Retired)
- [ ] Write test `test_risk_matrix_fallback_records_exist` that asserts fallback activation records exist for all risks with fallbacks (FB-NNN)

## 2. Task Implementation
- [ ] Define `RiskMatrixValidator` struct in `crates/devs-core/src/risk/matrix.rs` with:
  - `validate_all(risks: &[RiskRecord]) -> Result<(), Vec<RiskMatrixValidationError>>` method
  - `load_from_markdown(path: &Path) -> Result<Vec<RiskRecord>, ParseError>` method
- [ ] Define `RiskRecord` struct with fields matching the risk matrix schema:
  - `id: String` (e.g., "RISK-001")
  - `description: String`
  - `category: RiskCategory` (Technical, Operational, Market)
  - `severity: SeverityLevel` (LOW, MEDIUM, HIGH)
  - `probability: ProbabilityLevel` (LOW, MEDIUM, HIGH)
  - `severity_score: u32` (computed: severity * probability)
  - `mitigation_id: String` (e.g., "MIT-001")
  - `fallback_id: Option<String>` (e.g., "FB-002")
  - `status: RiskStatus` (Open, Mitigated, Retired)
- [ ] Define `RiskMatrixValidationError` enum with variants:
  - `MissingMitigation { risk_id: String }`
  - `MissingCoveringTest { risk_id: String, severity_score: u32 }`
  - `DuplicateId { id: String }`
  - `InvalidStateTransition { risk_id: String, from: RiskStatus, to: RiskStatus }`
  - `MissingFallbackRecord { fallback_id: String }`
  - `SchemaVersionMismatch { expected: String, found: String }`
- [ ] Implement `AC-RISK-MATRIX-008` acceptance criterion: Risk matrix integrity validation
  - All risks with severity_score >= 6 must have covering tests
  - All risks must have matching mitigation tags
  - All fallbacks must have activation records
  - No duplicate IDs allowed
- [ ] Define `RiskStatusMachine` with `transition(from: RiskStatus, to: RiskStatus) -> Result<(), InvalidTransition>` enforcing valid state transitions
- [ ] Add `pub mod matrix;` to `crates/devs-core/src/risk/mod.rs`

## 3. Code Review
- [ ] Verify risk matrix validator catches all integrity violations
- [ ] Verify `AC-RISK-MATRIX-008` acceptance criterion is fully implemented
- [ ] Verify state machine enforces valid transitions only
- [ ] Verify fallback activation record validation is correct

## 4. Run Automated Tests to Verify
- [ ] Run `cargo test -p devs-core risk::matrix` and confirm all risk matrix tests pass
- [ ] Run `cargo test -p devs-core` to confirm no regressions in the crate
- [ ] Run `cargo clippy -p devs-core -- -D warnings` and confirm no warnings
- [ ] Run `./do lint` and verify risk matrix validation passes

## 5. Update Documentation
- [ ] Add module-level doc comment to `crates/devs-core/src/risk/matrix.rs` explaining the risk matrix schema and AC-RISK-MATRIX-008 acceptance criterion
- [ ] Add doc comments to `RiskRecord` fields describing the schema
- [ ] Document the risk lifecycle state machine transitions

## 6. Automated Verification
- [ ] Confirm `cargo test -p devs-core` passes with zero failures
- [ ] Confirm `cargo doc -p devs-core --no-deps` generates documentation without errors
- [ ] Verify risk matrix validation runs as part of `./do lint`
- [ ] Run `grep -r "AC-RISK-MATRIX-008" crates/devs-core/src/` and confirm the requirement ID appears in test annotations
