# Task: Fan-Out Authoring (Builder API and Declarative Named Handlers) (Sub-Epic: 04_Fan-Out Implementation)

## Covered Requirements
- [1_PRD-REQ-025]

## Dependencies
- depends_on: [02_fan_out_scheduler_integration.md]
- shared_components: [devs-core (consume), devs-config (consume), devs-scheduler (consume)]

## 1. Initial Test Written
- [ ] In `devs-core` (e.g., `tests/builder_fan_out.rs`), write Builder API tests:
  - `test_builder_fan_out_closure`: use `WorkflowBuilder` to define a stage with `.fan_out(|ctx| vec![PromptOverride::new("task A"), PromptOverride::new("task B")].into_iter())` — assert built `WorkflowDefinition` stage has a dynamic fan-out source producing 2 items
  - `test_builder_fan_out_with_custom_merge`: chain `.merge(|results: Vec<SubAgentResult>| Ok(json!({"count": results.len()})))` — assert the stage definition has a merge closure set (not `None`)
  - `test_builder_fan_out_without_merge_uses_default`: `.fan_out(...)` without `.merge(...)` — assert merge handler is `None` (scheduler will use `DefaultMergeHandler`)
  - `test_builder_fan_out_closure_receives_context`: fan-out closure receives `FanOutContext` — assert it can read `ctx.workflow_input("param1")` and `ctx.stage_output("prior_stage")`
  - `test_builder_stage_without_fan_out_unchanged`: building a stage without `.fan_out()` — assert no fan-out config, no regression
- [ ] In `devs-config` (e.g., `tests/named_handler.rs`), write named handler tests:
  - `test_named_fan_out_handler_registration`: call `HandlerRegistry::register_fan_out("split_tasks", handler)` — assert `get_fan_out("split_tasks")` returns `Some`
  - `test_named_merge_handler_registration`: call `HandlerRegistry::register_merge("combine", handler)` — assert `get_merge("combine")` returns `Some`
  - `test_declarative_fan_out_references_named_handler`: TOML with `fan_out.handler = "split_tasks"` — parsed definition stores handler name string
  - `test_declarative_fan_out_unknown_handler_rejected_at_submission`: TOML references `fan_out.handler = "nonexistent"` — upon workflow submission, scheduler returns error `"unknown fan_out handler: nonexistent"`
  - `test_declarative_fan_out_static_count_no_handler_needed`: TOML with `fan_out.count = 3` and no handler — valid, static expansion by `FanOutManager`
  - `test_handler_registry_concurrent_reads`: register handlers, then read from multiple threads — no panics (verifies thread safety)

## 2. Task Implementation
- [ ] Define `PromptOverride` struct in `devs-core/src/fan_out.rs`:
  ```rust
  pub struct PromptOverride {
      pub prompt: Option<String>,
      pub env: Option<HashMap<String, String>>,
  }
  ```
- [ ] Define `FanOutContext` struct providing read-only access to workflow inputs and prior stage outputs
- [ ] Define `FanOutExpander` trait in `devs-core`:
  ```rust
  pub trait FanOutExpander: Send + Sync + 'static {
      fn expand(&self, ctx: &FanOutContext) -> Result<Vec<PromptOverride>, FanOutError>;
  }
  ```
- [ ] Add `.fan_out()` method to `StageBuilder` in `devs-core/src/builder.rs`:
  ```rust
  pub fn fan_out<F>(mut self, f: F) -> Self
  where F: Fn(&FanOutContext) -> Vec<PromptOverride> + Send + Sync + 'static
  ```
  Store as `Option<Box<dyn FanOutExpander>>` in the stage definition
- [ ] Add `.merge()` method to `StageBuilder`:
  ```rust
  pub fn merge<F>(mut self, f: F) -> Self
  where F: Fn(Vec<SubAgentResult>) -> Result<serde_json::Value, MergeError> + Send + Sync + 'static
  ```
  Store as `Option<Box<dyn MergeHandler>>` in the stage definition
- [ ] Create `HandlerRegistry` in `devs-config/src/handlers.rs`:
  - Internal storage: `Arc<RwLock<HashMap<String, Box<dyn FanOutExpander>>>>` for fan-out handlers, same pattern for merge handlers
  - `register_fan_out(name: &str, handler: impl FanOutExpander + 'static)`
  - `register_merge(name: &str, handler: impl MergeHandler + 'static)`
  - `get_fan_out(name: &str) -> Option<Arc<dyn FanOutExpander>>`
  - `get_merge(name: &str) -> Option<Arc<dyn MergeHandler>>`
- [ ] Add optional `handler: Option<String>` field to `FanOutToml` / `FanOutConfig` for declarative workflows that use a named fan-out expander instead of static count/input_list
- [ ] Update `devs-scheduler` dispatch: when a fan-out stage is eligible, resolve fan-out source:
  1. If stage has a builder closure (`Box<dyn FanOutExpander>`): invoke it to get `Vec<PromptOverride>`
  2. If stage has a static `FanOutConfig` (count/input_list): use `FanOutManager::expand()`
  3. If stage references a named handler: look up in `HandlerRegistry`, invoke it
  4. If named handler not found: return error `"unknown fan_out handler: <name>"`

## 3. Code Review
- [ ] Verify fan-out closures stored in Builder API are `Send + Sync + 'static`
- [ ] Confirm `HandlerRegistry` is `Arc`-wrapped and safe for concurrent reads during dispatch
- [ ] Ensure Builder API and declarative format converge to the same internal representation before reaching the scheduler
- [ ] Verify `PromptOverride` is composable: if `prompt` is `Some`, it replaces the base prompt; if `None`, the base prompt is used with fan-out template variables added

## 4. Run Automated Tests to Verify
- [ ] Run `cargo test -p devs-core -- builder_fan_out` — all builder tests pass
- [ ] Run `cargo test -p devs-config -- named_handler` — all handler registry tests pass

## 5. Update Documentation
- [ ] Add doc comments to `StageBuilder::fan_out()`, `StageBuilder::merge()`, `PromptOverride`, `FanOutContext`, `FanOutExpander`, and `HandlerRegistry`
- [ ] Add `// Covers: 1_PRD-REQ-025` annotation to all authoring-format tests

## 6. Automated Verification
- [ ] Run `./do test` and confirm zero regressions
- [ ] Run `./do lint` and confirm no new warnings
