# Task: Fan-Out Configuration Types and Validation (Sub-Epic: 04_Fan-Out Implementation)

## Covered Requirements
- [1_PRD-REQ-024], [1_PRD-REQ-025]

## Dependencies
- depends_on: [none]
- shared_components: [devs-core (consume), devs-config (consume)]

## 1. Initial Test Written
- [ ] In `devs-core/src/fan_out.rs`, write unit tests for the `FanOutConfig` domain type:
  - `test_fan_out_count_valid`: construct `FanOutConfig { mode: FanOutMode::Count(3), merge_handler: None }` — assert `validate()` returns `Ok(())` and `item_count()` returns 3
  - `test_fan_out_input_list_valid`: construct with `FanOutMode::InputList(vec!["a".into(), "b".into()])` — assert valid, `item_count()` returns 2
  - `test_fan_out_count_zero_rejected`: construct with `FanOutMode::Count(0)` — assert `validate()` returns error containing `"fan_out.count must be ≥ 1"` [3_PRD-BR-031]
  - `test_fan_out_count_exceeds_max_rejected`: construct with `FanOutMode::Count(65)` — assert validation error containing `"fan_out.count must be ≤ 64"`
  - `test_fan_out_empty_input_list_rejected`: construct with `FanOutMode::InputList(vec![])` — assert error containing `"fan_out requires at least one item"` [3_PRD-BR-031]
  - `test_fan_out_input_list_exceeds_64_rejected`: construct with 65 string items — assert validation error
  - `test_fan_out_merge_handler_optional`: construct with `merge_handler: None` — valid; construct with `merge_handler: Some("my_handler".into())` — also valid
  - `test_fan_out_item_count_for_count_mode`: verify `item_count()` returns the count value as `usize`
  - `test_fan_out_item_count_for_input_list_mode`: verify `item_count()` returns the vec length
- [ ] In `devs-config` (workflow deserialization module), write TOML parsing tests:
  - `test_toml_fan_out_count_parses`: TOML with `[stage.fan_out]\ncount = 5` — deserializes to `FanOutMode::Count(5)`
  - `test_toml_fan_out_input_list_parses`: TOML with `input_list = ["a", "b"]` — deserializes to `FanOutMode::InputList`
  - `test_toml_fan_out_both_count_and_input_list_rejected`: TOML with both `count = 3` and `input_list = ["a"]` — assert error containing `"mutually exclusive"` [3_PRD-BR-030]
  - `test_toml_fan_out_neither_count_nor_input_list_rejected`: empty `[stage.fan_out]` block — assert error requiring one of count or input_list
  - `test_toml_fan_out_merge_handler_parses`: TOML with `merge_handler = "my_merge"` — assert field populated in parsed config
  - `test_stage_without_fan_out_still_parses`: existing stage TOML without `fan_out` block — assert `fan_out` field is `None`, no regression to existing stages

## 2. Task Implementation
- [ ] Create `devs-core/src/fan_out.rs` and add `pub mod fan_out;` to `devs-core/src/lib.rs`
- [ ] Define constants: `const MAX_FAN_OUT_ITEMS: u32 = 64;`
- [ ] Define `FanOutMode` enum:
  ```rust
  #[derive(Clone, Debug, PartialEq, Serialize, Deserialize)]
  pub enum FanOutMode {
      Count(u32),
      InputList(Vec<String>),
  }
  ```
- [ ] Define `FanOutConfig` struct:
  ```rust
  #[derive(Clone, Debug, PartialEq, Serialize, Deserialize)]
  pub struct FanOutConfig {
      pub mode: FanOutMode,
      pub merge_handler: Option<String>,
  }
  ```
- [ ] Implement `FanOutConfig::validate(&self) -> Result<(), Vec<ValidationError>>`:
  - `Count(0)` → error `"fan_out.count must be ≥ 1"`
  - `Count(n)` where `n > 64` → error `"fan_out.count must be ≤ 64"`
  - `InputList(v)` where `v.is_empty()` → error `"fan_out requires at least one item"`
  - `InputList(v)` where `v.len() > 64` → error `"fan_out.input_list must have ≤ 64 items"`
- [ ] Implement `FanOutConfig::item_count(&self) -> usize`
- [ ] Add `pub fan_out: Option<FanOutConfig>` field to `StageDefinition` in `devs-core`
- [ ] In `devs-config`, create `FanOutToml` serde helper struct with `count: Option<u32>`, `input_list: Option<Vec<String>>`, `merge_handler: Option<String>`
- [ ] Implement `TryFrom<FanOutToml> for FanOutConfig` enforcing mutual exclusivity of `count` vs `input_list` [3_PRD-BR-030] and requiring at least one
- [ ] Wire `fan_out` into existing `StageDefinition` TOML deserialization as an optional field
- [ ] Ensure `WorkflowDefinition::validate()` iterates stages and calls `fan_out.validate()` for each stage that has it

## 3. Code Review
- [ ] Confirm `FanOutConfig` and `FanOutMode` live in `devs-core` (pure domain type, no runtime deps)
- [ ] Verify validation errors use the project's existing `ValidationError` type/pattern
- [ ] Confirm stages without `fan_out` are completely unaffected — no breaking changes
- [ ] Verify `FanOutConfig` derives `Clone`, `Debug`, `PartialEq`, `Serialize`, `Deserialize`
- [ ] Ensure the 64-item limit is defined as a named constant, not a magic number

## 4. Run Automated Tests to Verify
- [ ] Run `cargo test -p devs-core -- fan_out` — all validation tests pass
- [ ] Run `cargo test -p devs-config -- fan_out` — all TOML parsing tests pass

## 5. Update Documentation
- [ ] Add doc comments to `FanOutConfig`, `FanOutMode`, `validate()`, and `item_count()` describing constraints (1..=64, mutual exclusivity)
- [ ] Add `// Covers: 1_PRD-REQ-024` annotation to the domain type validation tests
- [ ] Add `// Covers: 1_PRD-REQ-025` annotation to the TOML parsing tests

## 6. Automated Verification
- [ ] Run `./do test` and confirm zero regressions
- [ ] Run `./do lint` and confirm no new warnings or clippy violations
