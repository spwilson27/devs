# Task: Fan-Out Result Merging and Failure Propagation (Sub-Epic: 04_Fan-Out Implementation)

## Covered Requirements
- [1_PRD-REQ-026]

## Dependencies
- depends_on: [02_fan_out_scheduler_integration.md, 03_fan_out_authoring.md]
- shared_components: [devs-scheduler (consume), devs-core (consume)]

## 1. Initial Test Written
- [ ] In `devs-scheduler` (e.g., `tests/fan_out_merge.rs`), write the following tests:
  - `test_default_merge_produces_spec_json`: 3 sub-agents all succeed with outputs `{"a":1}`, `{"b":2}`, `{"c":3}` — assert merged stage output matches spec §3.9.3 format: `{"success": true, "error": null, "result": {"fan_out_results": [{"index": 0, "item": null, "success": true, "exit_code": 0, "output": {"a":1}}, ...]}}`
  - `test_default_merge_input_list_includes_item`: fan-out with `input_list = ["x", "y"]` — assert each `fan_out_results` entry has `"item": "x"` / `"item": "y"`
  - `test_default_merge_count_mode_item_null`: fan-out with `count = 2` — assert `"item": null` in each result entry
  - `test_default_merge_one_failure_stage_fails`: sub-agent 1 of 3 fails (exit_code 1) — assert stage `Failed`, error contains `"failed sub-agents: [1]"` [3_PRD-BR-032]
  - `test_default_merge_multiple_failures_lists_all`: sub-agents 0 and 2 fail — error contains `"failed sub-agents: [0, 2]"` with sorted indices [3_PRD-BR-032]
  - `test_custom_merge_receives_all_results`: register custom merge that asserts it receives exactly N `SubAgentResult` entries — verify assertion holds
  - `test_custom_merge_success_overrides_failure`: sub-agent 1 fails but custom merge returns `Ok(json!({"partial": true}))` — stage `Completed` with custom output
  - `test_custom_merge_error_fails_stage`: all sub-agents succeed but custom merge returns `Err(MergeError::new("bad"))` — stage `Failed` with error `"merge handler error: bad"` [EC-3.9-003]
  - `test_custom_merge_receives_stdout_stderr`: verify `SubAgentResult.stdout` and `.stderr` are populated from actual process output
  - `test_merged_output_as_template_variable`: downstream stage prompt `{{stage.fan_stage.output.fan_out_results}}` resolves to the JSON array string
  - `test_merged_output_in_context_file`: after fan-out merge, `.devs_context.json` for next stage includes the merged output
  - `test_fan_out_retry_respawns_all`: fan-out stage with `max_retries = 1` fails (default merge, sub-agent failure) — on retry, ALL sub-agents re-spawned from scratch; `sub_agents` vec is reset [EC-3.9-001]

## 2. Task Implementation
- [ ] Define `MergeHandler` trait in `devs-core/src/fan_out.rs`:
  ```rust
  pub trait MergeHandler: Send + Sync + 'static {
      fn merge(&self, results: Vec<SubAgentResult>) -> Result<serde_json::Value, MergeError>;
  }
  ```
- [ ] Define `SubAgentResult` struct in `devs-core/src/fan_out.rs` matching spec §3.9.4:
  ```rust
  #[derive(Clone, Debug, Serialize, Deserialize)]
  pub struct SubAgentResult {
      pub index: usize,
      pub item: Option<String>,
      pub success: bool,
      pub exit_code: Option<i32>,
      pub output: Option<serde_json::Value>,
      pub stdout: String,
      pub stderr: String,
  }
  ```
- [ ] Define `MergeError` struct with `message: String` field, `Display` and `Debug` impls
- [ ] Implement `DefaultMergeHandler` in `devs-scheduler/src/fan_out.rs`:
  - Check if any result has `success == false` → return `Err(MergeError)` with sorted failed indices list: `"failed sub-agents: [0, 2]"`
  - Otherwise build JSON matching §3.9.3: `{"fan_out_results": [{index, item, success, exit_code, output}, ...]}`
- [ ] Integrate merge into `FanOutManager` completion flow:
  1. After `is_complete()` returns true, convert `Vec<SubAgentRun>` → `Vec<SubAgentResult>`
  2. Determine handler: stage's custom merge closure/named handler, or `DefaultMergeHandler`
  3. Invoke merge handler **outside** the scheduler `RwLock`
  4. On `Ok(value)`: wrap in `{"success": true, "error": null, "result": value}`, store as `StageRun.output`, set `StageRun.state = Completed`
  5. On `Err(e)`: set `StageRun.state = Failed`, store `"merge handler error: {e.message}"` as error
- [ ] Update checkpoint serialization to include the merged output in `StageRun`
- [ ] Update context file writer: include fan-out merged output in `.devs_context.json` for downstream stages
- [ ] Update `TemplateResolver`: support `{{stage.<name>.output.fan_out_results}}` by extracting the `fan_out_results` field from the stage's stored output JSON
- [ ] Update retry logic: when a fan-out stage is retried, reset `StageRun.sub_agents` to `Some(vec![])` before re-expansion — entire fan-out re-runs from scratch

## 3. Code Review
- [ ] Verify `DefaultMergeHandler` output JSON exactly matches spec §3.9.3 (fields: `index`, `item`, `success`, `exit_code`, `output`)
- [ ] Confirm custom merge handlers receive ALL results including failures — they decide whether to tolerate partial failure
- [ ] Verify failed indices in error messages are sorted ascending for deterministic output
- [ ] Ensure merge handler runs outside the scheduler's `RwLock` — no lock held during potentially slow custom merge
- [ ] Confirm retry resets `sub_agents` vec, does not append to previous run's results
- [ ] Verify `SubAgentResult.stdout`/`.stderr` are populated from `SubAgentRun` process output

## 4. Run Automated Tests to Verify
- [ ] Run `cargo test -p devs-scheduler -- fan_out_merge` — all merge tests pass
- [ ] Run `cargo test -p devs-core -- merge` — trait/type tests pass

## 5. Update Documentation
- [ ] Add doc comments to `MergeHandler`, `DefaultMergeHandler`, `SubAgentResult`, `MergeError`
- [ ] Add `// Covers: 1_PRD-REQ-026` annotation to all merge and failure propagation tests

## 6. Automated Verification
- [ ] Run `./do test` and confirm zero regressions
- [ ] Run `./do lint` and confirm no new warnings
