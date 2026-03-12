# Task: Define Project Registry Schema and Serialization (Sub-Epic: 047_Detailed Domain Specifications (Part 12))

## Covered Requirements
- [2_TAS-REQ-107]

## Dependencies
- depends_on: [none]
- shared_components: [devs-config, devs-core]

## 1. Initial Test Written
- [ ] Create a unit test in `devs-config/src/project/registry_tests.rs` that:
    - Serializes a `ProjectRegistry` containing multiple `ProjectEntry` and `WebhookConfig` objects to a TOML string.
    - Deserializes a TOML string conforming to [2_TAS-REQ-107] into a `ProjectRegistry` struct.
    - Validates that a `project_id` must be a valid UUID4.
    - Validates that `repo_path` must be an absolute path.
    - Validates that `priority` and `weight` meet their numeric constraints (u32, weight ≥ 1).
    - Validates that `webhook.url` is a valid HTTP/HTTPS URL.

## 2. Task Implementation
- [ ] Define the `ProjectRegistry` and `ProjectEntry` structs in `devs-config/src/project/registry.rs`.
- [ ] Implement `serde::Serialize` and `serde::Deserialize` for all registry types, ensuring they map correctly to the `projects.toml` schema.
- [ ] Use `devs_core::domain::Uuid` for `project_id` and `webhook_id`.
- [ ] Implement a `validate()` method on `ProjectEntry` that checks the requirements for `repo_path`, `priority`, `weight`, and `webhook.url`.
- [ ] Add a `status` enum with `Active` and `Removing` variants.

## 3. Code Review
- [ ] Ensure that `projects.toml` uses the exact key names and types specified in [2_TAS-REQ-107].
- [ ] Verify that `project_id` is assigned by `devs` and not manually edited (mark fields appropriately in documentation/comments).
- [ ] Confirm that `weight` has a minimum value of 1.

## 4. Run Automated Tests to Verify
- [ ] Run `cargo test -p devs-config` and ensure all registry schema tests pass.

## 5. Update Documentation
- [ ] Update `devs-config/README.md` with an example of the `projects.toml` structure.
- [ ] Add doc comments for all fields in the `ProjectEntry` and `WebhookConfig` structs.

## 6. Automated Verification
- [ ] Verify the traceability tag: `// Covers: 2_TAS-REQ-107` is present in the test file.
- [ ] Run `./do lint` to ensure no documentation or clippy warnings.
