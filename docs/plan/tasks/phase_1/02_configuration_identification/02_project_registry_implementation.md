# Task: devs-config: Project Registry and projects.toml Parsing (Sub-Epic: 02_Configuration & Identification)

## Covered Requirements
- [1_PRD-REQ-042], [2_TAS-REQ-024]

## Dependencies
- depends_on: [01_server_config_implementation.md]
- shared_components: [devs-core, devs-config]

## 1. Initial Test Written
- [ ] Create a test suite in `crates/devs-config/src/registry.rs` that tests parsing `projects.toml` with multiple projects.
- [ ] Test that the `ProjectRegistry` correctly handles an empty file (empty registry is valid as per [2_TAS-REQ-001]).
- [ ] Test atomic writes of the registry file by simulating a crash or write failure (using a mock or tempfile).
- [ ] Test validation for `weight` (must be ≥ 1 as per [3_PRD-BR-041]) and `priority`.

## 2. Task Implementation
- [ ] Define the `ProjectRegistry` struct which contains a collection of `ProjectConfig`.
- [ ] Define `ProjectConfig` with fields from [2_TAS-REQ-107]:
    - `project_id` (Uuid, assigned by devs)
    - `name` (String, max 128 chars)
    - `repo_path` (AbsolutePath, must exist)
    - `priority` (u32)
    - `weight` (u32, ≥ 1)
    - `checkpoint_branch` (String, default `devs/state`)
    - `workflow_dirs` (List of strings)
    - `status` (Enum: `Active` | `Removing`)
    - `webhook` (List of per-project `WebhookConfig`)
- [ ] Implement TOML parsing for the registry.
- [ ] Implement an atomic write method `save(&self, path: &Path)` that follows the write-to-temp-then-rename protocol from [3_PRD-BR-053].
- [ ] Implement `add_project` and `remove_project` methods that update the registry and save the changes.
- [ ] Ensure that `weight = 0` is rejected with an error during parsing/validation [3_PRD-BR-041].

## 3. Code Review
- [ ] Verify that all file operations use atomic renames for safety.
- [ ] Ensure that the `ProjectConfig` status is managed by the server and not directly by the user via the TOML.
- [ ] Confirm that the registry file search path defaults to `~/.config/devs/projects.toml`.
- [ ] Verify that the `devs-core::ValidationError` infrastructure is used.

## 4. Run Automated Tests to Verify
- [ ] Run `cargo test -p devs-config --lib registry`.
- [ ] Verify that atomic writes are actually atomic (e.g., check for `.tmp` file presence during failure).

## 5. Update Documentation
- [ ] Add comments to `ProjectConfig` fields explaining the purpose of `priority` vs `weight` (Scheduling).

## 6. Automated Verification
- [ ] Run `./do lint`.
- [ ] Run `cargo-llvm-cov` and verify that the registry implementation has ≥ 90% coverage.
