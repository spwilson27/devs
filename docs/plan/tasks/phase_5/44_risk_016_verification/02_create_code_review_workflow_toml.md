# Task: Create Code Review Workflow TOML Configuration (Sub-Epic: 44_Risk 016 Verification)

## Covered Requirements
- [RISK-016-BR-005]

## Dependencies
- depends_on: ["01_parse_mit_016_mitigation_strategy.md"]
- shared_components: [devs-config]

## 1. Initial Test Written
- [ ] Write a test in `tests/workflow/code_review_workflow_test.rs` that validates the `.devs/workflows/code-review.toml` file structure.
- [ ] Test should verify:
  1. The workflow file exists and is valid TOML
  2. A `review-pool` section is present with cross-agent selection configuration
  3. Agent capability tags are defined to enforce different `tool` selection
  4. The workflow defines stages for: review submission, agent dispatch, structured output parsing, and branching
- [ ] Add `// Covers: RISK-016-BR-005` annotation to the test.
- [ ] Test should initially fail because the workflow file does not yet exist.

## 2. Task Implementation
- [ ] Create `.devs/workflows/code-review.toml` with the following structure:
  ```toml
  [workflow]
  name = "code-review"
  description = "Cross-agent code review workflow for RISK-016 mitigation"
  
  [workflow.inputs]
  crate_name = { type = "string", required = true }
  implementing_agent = { type = "string", required = true }
  
  [[stage]]
  name = "select-reviewer"
  pool = "review-pool"
  prompt = "Review the {{crate_name}} crate implemented by {{implementing_agent}}..."
  
  [[stage]]
  name = "parse-review-output"
  pool = "primary"
  prompt = "Parse the review output and extract critical_findings and high_findings counts..."
  completion = "structured_output"
  
  [stage.branch]
  handler = "review_router"
  
  [review-pool]
  # Pool configuration that enforces cross-agent selection
  # If implementing_agent == "claude", select "gemini" or "opencode"
  # If implementing_agent == "gemini", select "claude" or "opencode"
  # etc.
  ```
- [ ] Implement the `review_router` branch handler in `crates/devs-scheduler/src/handlers/review_router.rs`:
  - Reads `critical_findings` from structured output
  - Returns `"halt-for-remediation"` if `critical_findings > 0`
  - Returns `"completed"` if `critical_findings == 0`
- [ ] Register the handler in the scheduler's handler registry.

## 3. Code Review
- [ ] Verify the TOML structure matches the declarative workflow format from the project description.
- [ ] Ensure the branch handler is properly documented and handles edge cases (missing output, malformed JSON).
- [ ] Confirm pool configuration enforces the cross-agent policy.

## 4. Run Automated Tests to Verify
- [ ] Run `cargo test --test code_review_workflow_test` and ensure all tests pass.
- [ ] Run `cargo test --package devs-scheduler review_router` to verify the branch handler.

## 5. Update Documentation
- [ ] Document the `code-review` workflow in `docs/plan/specs/3_mcp_design.md` under a new "Code Review Workflow" section.
- [ ] Add `RISK-016-BR-005` to the traceability mapping in `docs/plan/traceability.md`.

## 6. Automated Verification
- [ ] Run `./tools/verify_requirements.py` and confirm `RISK-016-BR-005` is marked as covered.
- [ ] Run `./do lint` to verify no TOML syntax errors or Rust clippy warnings.
