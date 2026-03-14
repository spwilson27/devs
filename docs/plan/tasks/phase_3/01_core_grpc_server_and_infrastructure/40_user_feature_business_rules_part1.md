# Task: User Feature Business Rules Part 1 — Core Rules (Sub-Epic: 01_core_grpc_server_and_infrastructure)

## Covered Requirements
- [4_USER_FEATURES-FEAT-BR-001], [4_USER_FEATURES-FEAT-BR-002], [4_USER_FEATURES-FEAT-BR-003], [4_USER_FEATURES-FEAT-BR-004], [4_USER_FEATURES-FEAT-BR-005], [4_USER_FEATURES-FEAT-BR-006], [4_USER_FEATURES-FEAT-BR-007], [4_USER_FEATURES-FEAT-BR-008], [4_USER_FEATURES-FEAT-BR-009], [4_USER_FEATURES-FEAT-BR-010], [4_USER_FEATURES-FEAT-BR-011], [4_USER_FEATURES-FEAT-BR-012], [4_USER_FEATURES-FEAT-BR-013], [4_USER_FEATURES-FEAT-BR-014], [4_USER_FEATURES-FEAT-BR-015], [4_USER_FEATURES-FEAT-BR-016], [4_USER_FEATURES-FEAT-BR-017], [4_USER_FEATURES-FEAT-BR-018], [4_USER_FEATURES-FEAT-BR-019], [4_USER_FEATURES-FEAT-BR-020], [4_USER_FEATURES-FEAT-BR-021], [4_USER_FEATURES-FEAT-BR-022], [4_USER_FEATURES-FEAT-BR-023], [4_USER_FEATURES-FEAT-BR-024], [4_USER_FEATURES-FEAT-BR-025], [4_USER_FEATURES-FEAT-BR-026], [4_USER_FEATURES-FEAT-BR-027], [4_USER_FEATURES-FEAT-BR-028], [4_USER_FEATURES-FEAT-BR-029], [4_USER_FEATURES-FEAT-BR-030], [4_USER_FEATURES-FEAT-BR-031], [4_USER_FEATURES-FEAT-BR-032], [4_USER_FEATURES-FEAT-BR-033], [4_USER_FEATURES-FEAT-BR-034], [4_USER_FEATURES-FEAT-BR-035], [4_USER_FEATURES-FEAT-BR-036], [4_USER_FEATURES-FEAT-BR-037], [4_USER_FEATURES-FEAT-BR-038], [4_USER_FEATURES-FEAT-BR-039], [4_USER_FEATURES-FEAT-BR-040], [4_USER_FEATURES-FEAT-BR-041], [4_USER_FEATURES-FEAT-BR-042], [4_USER_FEATURES-FEAT-BR-043], [4_USER_FEATURES-FEAT-BR-044], [4_USER_FEATURES-FEAT-BR-045], [4_USER_FEATURES-FEAT-BR-046], [4_USER_FEATURES-FEAT-BR-047], [4_USER_FEATURES-FEAT-BR-048], [4_USER_FEATURES-FEAT-BR-049], [4_USER_FEATURES-FEAT-BR-050], [FEAT-BR-001], [FEAT-BR-011], [FEAT-BR-016], [FEAT-NNN]

## Dependencies
- depends_on: ["36_user_features_core_part1.md"]
- shared_components: ["devs-scheduler (consumer)", "devs-pool (consumer)", "devs-config (consumer)", "devs-checkpoint (consumer)"]

## 1. Initial Test Written
- [ ] Create `tests/feat_business_rules_test.rs` with tests enforcing each business rule: workflow validation rules (BR-001 to BR-010), scheduling rules (BR-011 to BR-020), pool management rules (BR-021 to BR-030), execution rules (BR-031 to BR-040), persistence rules (BR-041 to BR-050).
- [ ] Write tests for standalone feature business rules: FEAT-BR-001 (workflow DAG must be acyclic), FEAT-BR-011 (pool fallback order), FEAT-BR-016 (retry backoff).
- [ ] Write a test for FEAT-NNN placeholder: verify the feature registry is extensible.

## 2. Task Implementation
- [ ] Implement tests verifying all 54 business rules are enforced.
- [ ] Ensure business rules are tested at the correct enforcement boundary (config validation, scheduler, pool manager).
- [ ] Verify business rule violations produce actionable error messages.

## 3. Code Review
- [ ] Verify each business rule test would fail if the rule were removed.
- [ ] Confirm error messages reference the violated business rule.

## 4. Run Automated Tests to Verify
- [ ] Run `cargo test -- feat_business_rules` and confirm all tests pass.

## 5. Update Documentation
- [ ] Add `// Covers:` annotations for all 54 requirements.

## 6. Automated Verification
- [ ] Run `./do test` and `./do lint` with zero failures.
