# Task: Define ArtifactMode Enum and Config Integration (Sub-Epic: 09_Artifact Collection)

## Covered Requirements
- [1_PRD-REQ-023]

## Dependencies
- depends_on: []
- shared_components: [devs-core (consumer — add enum here), devs-config (consumer — parse from TOML), devs-executor (consumer — use in trait)]

## 1. Initial Test Written
- [ ] In `crates/devs-core/src/artifact.rs` (new module), write unit tests:
  - `test_artifact_mode_default_is_agent_driven`: assert `ArtifactMode::default() == ArtifactMode::AgentDriven`.
  - `test_artifact_mode_serde_round_trip_agent_driven`: serialize `ArtifactMode::AgentDriven` to JSON, assert string is `"agent_driven"`, deserialize back, assert equality.
  - `test_artifact_mode_serde_round_trip_auto_collect`: same for `ArtifactMode::AutoCollect`, assert string is `"auto_collect"`.
  - `test_artifact_mode_display`: assert `format!("{}", ArtifactMode::AgentDriven)` produces `"agent_driven"` and `AutoCollect` produces `"auto_collect"`.
- [ ] In `crates/devs-config/src/workflow.rs` (or equivalent workflow definition parsing module), write tests:
  - `test_stage_definition_missing_artifact_mode_defaults_to_agent_driven`: parse a minimal TOML `[[stage]]` block with no `artifact_mode` field. Assert the parsed `StageDefinition.artifact_mode` equals `ArtifactMode::AgentDriven`.
  - `test_stage_definition_explicit_auto_collect`: parse a TOML `[[stage]]` with `artifact_mode = "auto_collect"`. Assert `ArtifactMode::AutoCollect`.
  - `test_stage_definition_explicit_agent_driven`: parse a TOML `[[stage]]` with `artifact_mode = "agent_driven"`. Assert `ArtifactMode::AgentDriven`.
  - `test_stage_definition_invalid_artifact_mode_rejected`: parse a TOML `[[stage]]` with `artifact_mode = "invalid"`. Assert deserialization error.
  - `test_workflow_level_artifact_mode_inheritance`: parse a TOML workflow with `artifact_mode = "auto_collect"` at the `[workflow]` level and a stage with no override. Assert the stage inherits `AutoCollect`. Parse another with a stage-level override to `agent_driven` and assert the override wins.
- [ ] All tests must fail initially (no implementation yet). Annotate each test with `// Covers: 1_PRD-REQ-023`.

## 2. Task Implementation
- [ ] Create `crates/devs-core/src/artifact.rs` and add `pub mod artifact;` to `lib.rs`.
- [ ] Define the enum:
  ```rust
  /// Controls how agent work products are persisted back to the project repository.
  #[derive(Debug, Clone, Copy, PartialEq, Eq, Hash, Serialize, Deserialize)]
  #[serde(rename_all = "snake_case")]
  pub enum ArtifactMode {
      /// Agents commit and push their own changes (instructed via prompt).
      AgentDriven,
      /// `devs` diffs the working directory, commits changes, and pushes to the checkpoint branch.
      AutoCollect,
  }

  impl Default for ArtifactMode {
      fn default() -> Self { Self::AgentDriven }
  }

  impl std::fmt::Display for ArtifactMode {
      fn fmt(&self, f: &mut std::fmt::Formatter<'_>) -> std::fmt::Result {
          match self {
              Self::AgentDriven => write!(f, "agent_driven"),
              Self::AutoCollect => write!(f, "auto_collect"),
          }
      }
  }
  ```
- [ ] Add `artifact_mode: ArtifactMode` field (with `#[serde(default)]`) to `StageDefinition` in `devs-config`. Add an optional `artifact_mode: Option<ArtifactMode>` to the workflow-level config struct. During validation/normalization, if the stage-level field is unset, inherit from the workflow-level value; if that is also unset, use `ArtifactMode::default()`.
- [ ] Update the `devs-executor` crate's `collect_artifacts` trait method signature to accept `mode: ArtifactMode` (or the `WorkingEnvironment` that carries it). For `AgentDriven`, the method is a no-op (return `Ok(())`). `AutoCollect` implementation is deferred to tasks 02–04.

## 3. Code Review
- [ ] Verify `ArtifactMode` lives in `devs-core` (domain type, no runtime dependencies).
- [ ] Verify `devs-config` depends on `devs-core` for the type, not the other way around.
- [ ] Verify the default is `AgentDriven` as specified in the PRD (agents commit their own changes unless configured otherwise).
- [ ] Verify serde rename uses `snake_case` for TOML compatibility.
- [ ] Verify doc comments are present on the enum and both variants.

## 4. Run Automated Tests to Verify
- [ ] Run `cargo test -p devs-core -- artifact` and confirm all artifact-related tests pass.
- [ ] Run `cargo test -p devs-config -- artifact` and confirm all config parsing tests pass.

## 5. Update Documentation
- [ ] Add doc comments to the `ArtifactMode` enum explaining the two modes and their PRD origin.
- [ ] Ensure `cargo doc -p devs-core --no-deps` builds without warnings.

## 6. Automated Verification
- [ ] Run `./do lint` — must pass with zero warnings.
- [ ] Run `./do test` — all tests must pass. Verify `artifact` test names appear in output.
- [ ] Run `cargo test -p devs-core -p devs-config 2>&1 | grep -c "test result: ok"` — must output `2` (both crates pass).
