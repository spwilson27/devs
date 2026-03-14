# Task: Fan-Out Scheduler Integration (Spawning, Tracking, Waiting) (Sub-Epic: 04_Fan-Out Implementation)

## Covered Requirements
- [1_PRD-REQ-024]

## Dependencies
- depends_on: [01_fan_out_config_validation.md]
- shared_components: [devs-scheduler (consume), devs-core (consume), devs-pool (consume), devs-executor (consume)]

## 1. Initial Test Written
- [ ] In `devs-scheduler` (e.g., `src/fan_out.rs` or `tests/fan_out.rs`), write unit tests using mock adapters and mock pool:
  - `test_fan_out_count_spawns_n_agents`: workflow with one fan-out stage `count = 3` — submit run, assert exactly 3 `SubAgentRun` entries created in `StageRun`, each with `index` 0, 1, 2
  - `test_fan_out_input_list_spawns_per_item`: fan-out with `input_list = ["alpha", "beta"]` — assert 2 `SubAgentRun` entries with correct `item` values `"alpha"` and `"beta"`
  - `test_fan_out_index_template_injected`: for `count = 2`, assert sub-agent 0's resolved prompt contains `{{fan_out.index}}` → `"0"`, sub-agent 1 → `"1"` [spec §3.9.2]
  - `test_fan_out_item_template_injected`: for `input_list = ["x", "y"]`, assert sub-agent 0's prompt has `{{fan_out.item}}` → `"x"`, sub-agent 1 → `"y"` [spec §3.9.2]
  - `test_fan_out_item_not_available_in_count_mode`: for `count = 2`, assert `{{fan_out.item}}` is NOT available as a template variable (resolution returns error or empty)
  - `test_fan_out_stage_remains_running_until_all_complete`: complete sub-agents 0 and 1 but leave 2 running — assert stage state is still `Running`; complete sub-agent 2 — assert stage can transition [3_PRD-BR-033]
  - `test_fan_out_sub_agents_get_isolated_environments`: assert each sub-agent's `WorkingEnvironment` has a distinct path [spec §3.9.2 point 4]
  - `test_fan_out_sub_agents_compete_for_pool_independently`: pool `max_concurrent = 2`, fan-out `count = 3` — assert only 2 sub-agents dispatched initially; when one completes and releases its slot, the 3rd dispatches [spec §3.9.2 point 3]
  - `test_fan_out_all_succeed_stage_completed`: all 3 sub-agents exit code 0 — stage transitions to `Completed`
  - `test_fan_out_one_fails_waits_for_all_then_fails`: sub-agent 0 fails, 1 and 2 still running — stage stays `Running`; after all terminal → stage `Failed` [3_PRD-BR-032, 3_PRD-BR-033]
  - `test_fan_out_base_config_resolved_once`: stage prompt is `"process {{workflow.input.task}}"` — assert template resolved once for the base, then fan-out variables layered on top per sub-agent [spec §3.9.2 point 1]

## 2. Task Implementation
- [ ] Define `SubAgentRun` struct in `devs-core/src/fan_out.rs`:
  ```rust
  #[derive(Clone, Debug, Serialize, Deserialize, PartialEq)]
  pub struct SubAgentRun {
      pub index: usize,
      pub item: Option<String>,
      pub state: StageRunState,
      pub exit_code: Option<i32>,
      pub output: Option<serde_json::Value>,
      pub stdout: String,
      pub stderr: String,
  }
  ```
- [ ] Add `pub sub_agents: Option<Vec<SubAgentRun>>` to `StageRun` in `devs-core` — `None` = not fan-out, `Some(vec)` = fan-out stage
- [ ] Create `devs-scheduler/src/fan_out.rs` with `FanOutManager`:
  - `pub fn expand(stage: &StageDefinition, base_context: &TemplateContext) -> Vec<SubAgentInvocation>` — iterates over count indices or input_list items, creates one `SubAgentInvocation` per sub-agent with `{{fan_out.index}}` and optionally `{{fan_out.item}}` injected into the template context
  - `pub fn is_complete(sub_agents: &[SubAgentRun]) -> bool` — true iff all entries have terminal state
  - `pub fn aggregate_outcome(sub_agents: &[SubAgentRun]) -> FanOutOutcome` — `AllSucceeded` or `HasFailures(Vec<usize>)` listing failed indices
- [ ] Define `SubAgentInvocation` struct: resolved prompt string, env overrides, fan-out index, optional item
- [ ] Modify `DagScheduler` dispatch loop — when eligible stage has `fan_out`:
  1. Resolve base stage config (prompt template with workflow inputs) once
  2. Call `FanOutManager::expand()` to get per-sub-agent invocations
  3. Initialize `StageRun.sub_agents = Some(vec![SubAgentRun { state: Waiting, .. }; N])`
  4. For each invocation: `tokio::spawn` a task that acquires a pool slot via `devs-pool`, prepares isolated environment via `devs-executor`, runs the agent, and sends completion back via channel
  5. Transition stage to `Running`
- [ ] Modify completion event handler — when sub-agent completion arrives:
  1. Update `StageRun.sub_agents[index]` with state, exit_code, output, stdout, stderr
  2. Call `FanOutManager::is_complete()` — if false, continue
  3. If true, proceed to merge phase (handled by task 04)

## 3. Code Review
- [ ] Verify `SubAgentRun` is `Serialize + Deserialize` for checkpoint persistence
- [ ] Ensure fan-out expansion happens AFTER base template resolution (spec §3.9.2 point 1)
- [ ] Confirm pool slot acquisition per sub-agent is in a spawned task — scheduler loop never blocks waiting for pool slots
- [ ] Verify `StageRun.sub_agents` is included in checkpoint serialization so fan-out state survives server crash
- [ ] Check no deadlock: sub-agents acquire pool slots independently; scheduler holds no locks during pool acquisition
- [ ] Verify concurrent sub-agent completion events are handled safely (e.g., atomic update to `SubAgentRun` state under lock)

## 4. Run Automated Tests to Verify
- [ ] Run `cargo test -p devs-scheduler -- fan_out` — all spawning/waiting tests pass
- [ ] Run `cargo test -p devs-core -- sub_agent` — `SubAgentRun` type tests pass

## 5. Update Documentation
- [ ] Add doc comments to `FanOutManager`, `SubAgentRun`, `SubAgentInvocation`, and all public methods
- [ ] Add `// Covers: 1_PRD-REQ-024` annotation to all fan-out scheduler tests

## 6. Automated Verification
- [ ] Run `./do test` and confirm zero regressions
- [ ] Run `./do lint` and confirm no new warnings
