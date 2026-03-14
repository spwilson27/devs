# Task: Validation & Limits (Sub-Epic: 01_dag_scheduling_engine)

## Covered Requirements
- [2_TAS-REQ-153], [2_TAS-REQ-465], [2_TAS-REQ-466], [2_TAS-REQ-467], [2_TAS-REQ-468], [2_TAS-REQ-469], [2_TAS-REQ-470], [2_TAS-REQ-471], [2_TAS-REQ-472], [2_TAS-REQ-473], [2_TAS-REQ-474], [2_TAS-REQ-475], [2_TAS-REQ-476], [2_TAS-REQ-501], [2_TAS-REQ-502], [2_TAS-REQ-503], [2_TAS-REQ-504], [2_TAS-REQ-505], [2_TAS-REQ-506], [2_TAS-REQ-507], [2_TAS-REQ-508], [2_TAS-REQ-509]

## Dependencies
- depends_on: ["05_phase_1_completion_gate.md", "04_declarative_workflow_parser.md"]
- shared_components: [devs-core (owner — `BoundedString`, `ValidationError`), devs-config (consumer — workflow validation), devs-scheduler (consumer — submission validation)]

## 1. Initial Test Written
- [ ] Create `crates/devs-core/tests/validation_tests.rs` and `crates/devs-scheduler/tests/validation_tests.rs`.
- [ ] Write unit test `test_bounded_string_min_max`: create `BoundedString<1, 128>`. Assert empty string rejected, 1-char accepted, 128-char accepted, 129-char rejected. Annotate `// Covers: 2_TAS-REQ-153`.
- [ ] Write unit test `test_workflow_name_invalid_chars`: create workflow with name `"My Workflow!"` (uppercase, space, special char). Assert `ValidationError::InvalidName`. Annotate `// Covers: 2_TAS-REQ-465`.
- [ ] Write unit test `test_workflow_name_too_long`: create workflow with 129-byte name. Assert `ValidationError::InvalidName`. Annotate `// Covers: 2_TAS-REQ-465`.
- [ ] Write unit test `test_workflow_empty_stages_rejected`: create workflow with zero stages. Assert `ValidationError::EmptyWorkflow`. Annotate `// Covers: 2_TAS-REQ-466`.
- [ ] Write unit test `test_workflow_too_many_stages`: create workflow with 257 stages. Assert `ValidationError::TooManyStages`. Annotate `// Covers: 2_TAS-REQ-466`.
- [ ] Write unit test `test_workflow_too_many_inputs`: create workflow with 65 inputs. Assert `ValidationError::TooManyInputs`. Annotate `// Covers: 2_TAS-REQ-467`.
- [ ] Write unit test `test_optional_input_no_default_valid`: create input with `required: false` and no default. Assert validation passes, resolved value is `null`. Annotate `// Covers: 2_TAS-REQ-468`.
- [ ] Write unit test `test_stage_both_prompt_and_file_rejected`: create stage with both `prompt` and `prompt_file` set. Assert `ValidationError::MutuallyExclusive`. Annotate `// Covers: 2_TAS-REQ-469, 2_TAS-REQ-501`.
- [ ] Write unit test `test_stage_neither_prompt_nor_file_rejected`: create stage with neither `prompt` nor `prompt_file`. Assert `ValidationError::MutuallyExclusive`. Annotate `// Covers: 2_TAS-REQ-469`.
- [ ] Write unit test `test_stage_fan_out_and_branch_mutually_exclusive`: create stage with both `fan_out` and `branch` set. Assert validation fails. Annotate `// Covers: 2_TAS-REQ-470`.
- [ ] Write unit test `test_fan_out_count_zero_rejected`: create `FanOutConfig` with `count = 0`. Assert `ValidationError::FanOutLimitError`. Annotate `// Covers: 2_TAS-REQ-471, 2_TAS-REQ-507`.
- [ ] Write unit test `test_fan_out_count_max_64`: create `FanOutConfig` with `count = 65`. Assert validation fails. Annotate `// Covers: 2_TAS-REQ-471`.
- [ ] Write unit test `test_fan_out_input_list_empty_rejected`: create `FanOutConfig` with empty `input_list`. Assert validation fails. Annotate `// Covers: 2_TAS-REQ-471`.
- [ ] Write unit test `test_fan_out_input_list_max_64`: create `FanOutConfig` with 65 elements in `input_list`. Assert validation fails. Annotate `// Covers: 2_TAS-REQ-471`.
- [ ] Write unit test `test_retry_max_attempts_zero_rejected`: create `RetryConfig` with `max_attempts = 0`. Assert validation fails. Annotate `// Covers: 2_TAS-REQ-472, 2_TAS-REQ-508`.
- [ ] Write unit test `test_retry_max_attempts_max_20`: create `RetryConfig` with `max_attempts = 21`. Assert `ValidationError::InvalidRetryCount`. Annotate `// Covers: 2_TAS-REQ-472, 2_TAS-REQ-508`.
- [ ] Write unit test `test_retry_exponential_backoff_cap`: create `RetryConfig` with `backoff = Exponential`, no `max_delay`. Assert computed cap is 300 seconds. Annotate `// Covers: 2_TAS-REQ-473`.
- [ ] Write unit test `test_retry_initial_delay_minimum`: create `RetryConfig` with `initial_delay = 0`. Assert validation fails. Annotate `// Covers: 2_TAS-REQ-473`.
- [ ] Write unit test `test_agent_pool_max_concurrent_bounds`: create pool with `max_concurrent = 0` and `max_concurrent = 1025`. Assert both fail. Assert 1 and 1024 are accepted. Annotate `// Covers: 2_TAS-REQ-474`.
- [ ] Write unit test `test_agent_pool_requires_at_least_one_agent`: create pool with empty agents list. Assert validation fails. Annotate `// Covers: 2_TAS-REQ-474`.
- [ ] Write unit test `test_project_weight_zero_rejected`: create project with `weight = 0`. Assert `ValidationError::InvalidWeight`. Annotate `// Covers: 2_TAS-REQ-475, 2_TAS-REQ-509`.
- [ ] Write unit test `test_project_weight_minimum_one`: create project with `weight = 1`. Assert validation passes. Annotate `// Covers: 2_TAS-REQ-475`.
- [ ] Write unit test `test_webhook_url_non_http_scheme_rejected`: create webhook with `ftp://` or `file://` URL. Assert `ValidationError::InvalidWebhookUrl`. Annotate `// Covers: 2_TAS-REQ-476`.
- [ ] Write unit test `test_context_file_10mib_limit`: create stage output that would exceed 10 MiB context file. Assert truncation occurs, `truncated: true` set, WARN logged. Annotate `// Covers: 2_TAS-REQ-502`.
- [ ] Write unit test `test_prohibited_env_key_rejected`: create stage with env key `"DEVS_LISTEN"`. Assert `ValidationError::ProhibitedEnvKey`. Annotate `// Covers: 2_TAS-REQ-503`.
- [ ] Write unit test `test_snapshot_immutability`: create `WorkflowRun` with `definition_snapshot` set. Attempt to overwrite. Assert `ImmutableSnapshotError` and original unchanged. Annotate `// Covers: 2_TAS-REQ-504`.
- [ ] Write unit test `test_template_unknown_variable_fails_stage`: create stage with template `{{stage.X.output.field}}` where X used `exit_code` completion. Assert stage fails before agent spawn with `TemplateError::NoStructuredOutput`. Annotate `// Covers: 2_TAS-REQ-505`.
- [ ] Write unit test `test_structured_output_success_must_be_boolean`: create `.devs_output.json` with `"success": "true"` (string). Assert stage transitions to `Failed`. Annotate `// Covers: 2_TAS-REQ-506`.

## 2. Task Implementation
- [ ] Implement `BoundedString<MIN, MAX>` in `crates/devs-core/src/bounded.rs`:
  - `pub fn new(s: &str) -> Result<Self, ValidationError>` — validates length at construction.
  - `impl Deref<Target = str>` for transparent string access.
  - `impl Debug, Display` that don't leak sensitive content (for credential use).
- [ ] Implement workflow validation in `crates/devs-config/src/validation.rs`:
  - `WorkflowDefinition::validate(&self) -> Result<(), Vec<ValidationError>>` — collects ALL errors.
  - Check name matches `[a-z0-9_-]+` and ≤ 128 bytes.
  - Check stage count in 1-256.
  - Check input count ≤ 64.
  - Check no duplicate stage names.
  - Check all `depends_on` references exist.
- [ ] Implement stage validation:
  - Check exactly one of `prompt` or `prompt_file` is set.
  - Check `fan_out` and `branch` are mutually exclusive.
  - Check `completion` mode is valid for stage configuration.
- [ ] Implement `FanOutConfig::validate(&self)`:
  - Check exactly one of `count` or `input_list` is set.
  - Check `count` in 1-64.
  - Check `input_list` has 1-64 elements.
- [ ] Implement `RetryConfig::validate(&self)`:
  - Check `max_attempts` in 1-20.
  - Check `initial_delay` ≥ 1 second.
  - Compute exponential backoff cap (300s default if not specified).
- [ ] Implement `AgentPool::validate(&self)`:
  - Check `max_concurrent` in 1-1024.
  - Check at least one agent configured.
- [ ] Implement `Project::validate(&self)`:
  - Check `weight ≥ 1`.
- [ ] Implement `WebhookTarget::validate(&self)`:
  - Check URL scheme is http or https.
  - Check URL length ≤ 2048.
  - Check events array is non-empty.
  - Check `timeout_secs` in 1-30.
  - Check `max_retries` in 0-10.
- [ ] Implement template validation in `TemplateResolver`:
  - Check all `{{variable}}` expressions match known patterns.
  - Return `Err(TemplateError::UnknownVariable)` for unknowns.
  - Check `{{stage.<name>.output.<field>}}` references only work with `structured_output` completion.
- [ ] Implement structured output validation:
  - Parse `.devs_output.json`.
  - Check `"success"` field is boolean (not string).
  - Return error if type mismatch.
- [ ] Implement context file size limit:
  - Check total size ≤ 10 MiB.
  - Truncate `stdout`/`stderr` proportionally if exceeded.
  - Set `truncated: true` and log WARN.
- [ ] Implement prohibited env key check:
  - Reject `DEVS_*` keys in stage env configuration.
- [ ] Implement snapshot immutability:
  - Check `definition_snapshot.is_some()` before setting.
  - Return `ImmutableSnapshotError` if already set.
- [ ] Add `// Covers:` annotations for all covered requirements.

## 3. Code Review
- [ ] Verify all validation errors are collected (not early return on first error).
- [ ] Verify `BoundedString` cannot be constructed with invalid length.
- [ ] Verify template errors fail fast (before agent spawn).
- [ ] Verify context file truncation is proportional across fields.
- [ ] Verify snapshot immutability is enforced at API boundary.

## 4. Run Automated Tests to Verify
- [ ] Run `cargo test -p devs-core -- validation` and verify all tests pass.
- [ ] Run `cargo test -p devs-scheduler -- validation` and verify all tests pass.
- [ ] Run `cargo clippy -p devs-core -- -D warnings` and verify no warnings.
- [ ] Run `cargo clippy -p devs-scheduler -- -D warnings` and verify no warnings.

## 5. Update Documentation
- [ ] Add doc comments to `BoundedString`, `ValidationError`, and all validation functions.
- [ ] Document all limits (stage count, input count, fan-out limits, etc.) in module docs.
- [ ] Ensure `cargo doc -p devs-core --no-deps` and `cargo doc -p devs-scheduler --no-deps` build without warnings.

## 6. Automated Verification
- [ ] Run `cargo test -p devs-core -- validation --format=json 2>&1 | grep '"passed"'` and confirm all tests passed.
- [ ] Run `cargo test -p devs-scheduler -- validation --format=json 2>&1 | grep '"passed"'` and confirm all tests passed.
- [ ] Run `cargo tarpaulin -p devs-core --out json -- validation` and verify ≥ 90% line coverage.
- [ ] Run `cargo tarpaulin -p devs-scheduler --out json -- validation` and verify ≥ 90% line coverage.
