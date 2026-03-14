# Task: Implement inject_stage_input and assert_stage_output MCP Tools (Sub-Epic: 06_MCP Tools - Control and Management)

## Covered Requirements
- [3_MCP_DESIGN-REQ-059], [3_MCP_DESIGN-REQ-060], [3_MCP_DESIGN-REQ-BR-028], [3_MCP_DESIGN-REQ-BR-029], [3_MCP_DESIGN-REQ-BR-030], [3_MCP_DESIGN-REQ-BR-031], [3_MCP_DESIGN-REQ-BR-032], [3_MCP_DESIGN-REQ-BR-033], [3_MCP_DESIGN-REQ-BR-034], [3_MCP_DESIGN-REQ-BR-035], [3_MCP_DESIGN-REQ-EC-MCP-012], [3_MCP_DESIGN-REQ-EC-MCP-016], [3_MCP_DESIGN-REQ-EC-TEST-001], [3_MCP_DESIGN-REQ-EC-TEST-002], [3_MCP_DESIGN-REQ-EC-TEST-003], [3_MCP_DESIGN-REQ-EC-TEST-004], [3_MCP_DESIGN-REQ-EC-TEST-005]

## Dependencies
- depends_on: ["01_submit_run_tool.md", "04_signal_completion_tool.md"]
- shared_components: ["devs-scheduler (consumer — stage state, template variable resolution)", "devs-core (consumer — TemplateResolver, StageRunState)"]

## 1. Initial Test Written
- [ ] Create `crates/devs-mcp/src/tools/testing/inject_assert_tests.rs`
- [ ] **Test: `test_inject_stage_input_waiting_stage`** — Create a run where stage B depends on stage A. Call `inject_stage_input(run_id, "A", {output: {result: "mock"}})`. Assert stage A's output is stored and stage B becomes Eligible with access to `{{stage.A.result}}`. Covers [3_MCP_DESIGN-REQ-059], [3_MCP_DESIGN-REQ-BR-028].
- [ ] **Test: `test_inject_stage_input_eligible_stage`** — Inject input for an Eligible stage. Assert accepted. Covers [3_MCP_DESIGN-REQ-BR-029].
- [ ] **Test: `test_inject_stage_input_running_stage_rejected`** — Inject input for a Running stage. Assert `failed_precondition` error. Covers [3_MCP_DESIGN-REQ-EC-MCP-016], [3_MCP_DESIGN-REQ-EC-TEST-001].
- [ ] **Test: `test_inject_stage_input_stores_for_template_refs`** — Inject `{output: {code: "42"}}` for stage A, then verify `{{stage.A.code}}` resolves to `"42"` in subsequent stage template resolution. Covers [3_MCP_DESIGN-REQ-BR-030], [3_MCP_DESIGN-REQ-BR-031].
- [ ] **Test: `test_inject_stage_input_missing_exit_code`** — Inject input without `exit_code` field. Assert `invalid_argument` error or appropriate default behavior. Covers [3_MCP_DESIGN-REQ-EC-TEST-002].
- [ ] **Test: `test_assert_stage_output_success`** — Complete a stage with `{result: "pass", score: 95}`. Call `assert_stage_output(run_id, "A", assertions: [{type: "matches", field: "result", pattern: "pass"}])`. Assert all assertions pass and response shows `passed: true`. Covers [3_MCP_DESIGN-REQ-060], [3_MCP_DESIGN-REQ-BR-032].
- [ ] **Test: `test_assert_stage_output_evaluates_all`** — Provide 3 assertions where 2 pass and 1 fails. Assert response contains results for all 3 (not short-circuited), with overall `passed: false`. Covers [3_MCP_DESIGN-REQ-BR-033].
- [ ] **Test: `test_assert_stage_output_regex_validation`** — Use `matches` assertion with invalid regex pattern. Assert `invalid_argument: invalid regex` error returned at call time (not assertion evaluation). Covers [3_MCP_DESIGN-REQ-BR-034].
- [ ] **Test: `test_assert_stage_output_json_path`** — Assert using `json_path_eq` against structured output field. Verify JSONPath evaluation against the stage's structured output. Covers [3_MCP_DESIGN-REQ-BR-035].
- [ ] **Test: `test_assert_stage_output_actual_snippet_truncated`** — Stage output with >256 char field. Assert `actual_snippet` in assertion result is truncated to 256 chars. Covers [3_MCP_DESIGN-REQ-BR-035].
- [ ] **Test: `test_assert_stage_output_running_stage_rejected`** — Call on a Running stage. Assert `failed_precondition: stage not in terminal state` error. Covers [3_MCP_DESIGN-REQ-EC-MCP-012], [3_MCP_DESIGN-REQ-EC-TEST-003].
- [ ] **Test: `test_assert_stage_output_missing_json_path_field`** — JSONPath references a field not present in output. Assert assertion fails with descriptive message. Covers [3_MCP_DESIGN-REQ-EC-TEST-004], [3_MCP_DESIGN-REQ-EC-TEST-005].

## 2. Task Implementation
- [ ] Create `crates/devs-mcp/src/tools/testing/inject_stage_input.rs`
- [ ] `InjectStageInputParams`: `run_id`, `stage_name`, `output: serde_json::Value` (must include `exit_code`)
- [ ] Validate stage is in `Waiting` or `Eligible` state (BR-028, BR-029); reject `Running`/terminal with `failed_precondition`
- [ ] Store injected output in stage's output slot, making it available for `{{stage.<name>.<field>}}` template resolution (BR-030, BR-031)
- [ ] Trigger scheduler re-evaluation of downstream stages
- [ ] Create `crates/devs-mcp/src/tools/testing/assert_stage_output.rs`
- [ ] `AssertStageOutputParams`: `run_id`, `stage_name`, `assertions: Vec<Assertion>` where `Assertion` has `type` (matches/json_path_eq/exit_code_eq), `field`, `pattern`/`expected`
- [ ] Validate stage is terminal (Completed/Failed/Cancelled); reject Running with `failed_precondition`
- [ ] Evaluate ALL assertions (no short-circuit), collect results with `passed: bool`, `actual_snippet: String` (truncated to 256 chars)
- [ ] Validate regex patterns at call time using `regex::Regex::new()` — return `invalid_argument` for invalid patterns
- [ ] Register both tools: `"inject_stage_input"`, `"assert_stage_output"`

## 3. Code Review
- [ ] Verify inject_stage_input only accepts Waiting/Eligible states
- [ ] Verify assert_stage_output evaluates all assertions without short-circuit
- [ ] Verify actual_snippet truncation is exactly 256 chars
- [ ] Verify regex validation happens before assertion evaluation

## 4. Run Automated Tests to Verify
- [ ] Run `cargo test -p devs-mcp --lib tools::testing::inject_assert_tests`

## 5. Update Documentation
- [ ] Doc comments on both tools explaining assertion types, state requirements, and template variable interaction

## 6. Automated Verification
- [ ] Run `./do test` — all inject/assert tests pass
- [ ] Run `./do lint` — zero warnings
