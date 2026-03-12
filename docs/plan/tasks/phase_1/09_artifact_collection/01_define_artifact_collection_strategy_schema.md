# Task: Define Artifact Collection Strategy & Schema (Sub-Epic: 09_Artifact Collection)

## Covered Requirements
- [1_PRD-REQ-023]

## Dependencies
- depends_on: [none]
- shared_components: [devs-core, devs-config]

## 1. Initial Test Written
- [ ] Create a unit test in `devs-core` to verify that the `ArtifactCollection` enum correctly serializes and deserializes.
- [ ] Update `devs-config` tests for `StageDefinition` to ensure that the `artifact_collection` field is optional and defaults to `AgentDriven` (or as specified in the PRD).
- [ ] Write a test in `devs-config` to verify that a workflow TOML with `artifact_collection = "auto_collect"` is correctly parsed.

## 2. Task Implementation
- [ ] Define the `ArtifactCollection` enum in `devs-core/src/models.rs` (or equivalent):
    ```rust
    #[derive(Debug, Clone, Copy, Serialize, Deserialize, PartialEq, Eq)]
    #[serde(rename_all = "snake_case")]
    pub enum ArtifactCollection {
        AgentDriven,
        AutoCollect,
    }
    ```
- [ ] Update the `StageDefinition` struct in `devs-config` and `devs-core` to include:
    ```rust
    pub struct StageDefinition {
        // ... other fields
        #[serde(default = "default_artifact_collection")]
        pub artifact_collection: ArtifactCollection,
    }

    fn default_artifact_collection() -> ArtifactCollection {
        ArtifactCollection::AgentDriven
    }
    ```
- [ ] Ensure `devs-executor` re-exports or consumes this enum for use in the `StageExecutor` trait.

## 3. Code Review
- [ ] Verify that the enum variants match the PRD names (`agent_driven`, `auto_collect`).
- [ ] Ensure that the default behavior (Agent-driven) is preserved if the field is missing from the configuration.

## 4. Run Automated Tests to Verify
- [ ] Run `cargo test -p devs-core`.
- [ ] Run `cargo test -p devs-config`.

## 5. Update Documentation
- [ ] Update the configuration documentation (e.g., in `devs-config/README.md`) to include the new `artifact_collection` field and its options.

## 6. Automated Verification
- [ ] Run `./do lint` and ensure no serialization-related warnings occur.
