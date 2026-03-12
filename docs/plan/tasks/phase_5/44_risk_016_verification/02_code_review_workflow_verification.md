# Task: Code Review Workflow Verification (Sub-Epic: 44_Risk 016 Verification)

## Covered Requirements
- [RISK-016-BR-004], [RISK-016-BR-005], [MIT-016]

## Dependencies
- depends_on: [none]
- shared_components: [devs-config, devs-scheduler, devs-pool]

## 1. Initial Test Written
- [ ] Create an E2E test in `tests/test_code_review_workflow.rs` that submits a `code-review` workflow run with a mock agent.
- [ ] The test should use the MCP interface to inject a mock structured output containing `critical_findings: 1`. (Covers: [RISK-016-BR-004])
- [ ] Assert that the run transitions to a `halt-for-remediation` stage (or similar status as defined in the workflow TOML) and does NOT reach `Completed`.
- [ ] Write a validation test that parses `.devs/workflows/code-review.toml` and verifies the presence of a `review-pool` or pool selection logic that enforces cross-agent tool selection. (Covers: [RISK-016-BR-005])

## 2. Task Implementation
- [ ] Create or update `.devs/workflows/code-review.toml` to define the code-review DAG.
- [ ] Implement the branching logic in the workflow: `critical_findings > 0` should branch to a `halt` or `remediate` stage.
- [ ] Configure the `review-pool` in `code-review.toml` or the server config to ensure the agent used for review is different from the one that implemented the code (this may involve tagging agents in the pool and requiring specific tags). (Covers: [RISK-016-BR-005])
- [ ] Ensure that the `MIT-016` strategy is fully reflected in the final workflow configuration. (Covers: [MIT-016])

## 3. Code Review
- [ ] Verify that the branch predicate `halt-for-remediation` is correctly configured in the declarative format.
- [ ] Ensure the cross-agent tool selection is robustly enforced by the pool management logic.

## 4. Run Automated Tests to Verify
- [ ] Run `cargo test --test test_code_review_workflow` and confirm that critical findings correctly block completion.
- [ ] Verify that the workflow correctly identifies and handles the `critical_findings` field in the structured JSON output.

## 5. Update Documentation
- [ ] Document the `halt-for-remediation` state in `docs/plan/specs/3_mcp_design.md` or a relevant workflow documentation file.
- [ ] Add `RISK-016-BR-004` and `RISK-016-BR-005` to the traceability summary.

## 6. Automated Verification
- [ ] Run `./tools/verify_requirements.py` and confirm all IDs in this sub-epic are covered.
