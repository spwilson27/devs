# Task: Project Registry Parsing and Validation (Sub-Epic: 02_Configuration & Identification)

## Covered Requirements
- [1_PRD-REQ-042], [2_TAS-REQ-024]

## Dependencies
- depends_on: ["01_server_config_toml_parsing.md"]
- shared_components: ["devs-core (consumer)", "devs-config (owner)"]

## 1. Initial Test Written
- [ ] Create `crates/devs-config/tests/project_registry_tests.rs`.
- [ ] Write a test `test_parse_empty_project_registry` that deserializes a TOML string with an empty `[[project]]` array into `ProjectRegistry` and asserts the projects list is empty.
- [ ] Write a test `test_parse_project_entry` that deserializes a TOML string with one `[[project]]` entry containing `repo_path`, `priority` (u32), `weight` (u32), `checkpoint_branch` (optional string), and `workflow_search_paths` (vec of strings). Assert all fields parse correctly.
- [ ] Write a test `test_parse_multiple_projects` with 3 project entries. Assert the parsed `ProjectRegistry` has length 3 and each entry has correct values.
- [ ] Write a test `test_registry_validation_rejects_empty_repo_path` that creates a `ProjectEntry` with empty `repo_path` and calls `validate()`. Assert it returns an error including the field name.
- [ ] Write a test `test_registry_validation_rejects_zero_weight` that creates a `ProjectEntry` with `weight = 0` and asserts validation fails with an appropriate error message.
- [ ] Write a test `test_registry_default_checkpoint_branch` that parses a project entry without `checkpoint_branch` and asserts the default is `None` (server will use working branch).
- [ ] Write a test `test_registry_file_load` that writes a temp TOML file, calls `ProjectRegistry::from_file(path)`, and asserts success.
- [ ] Annotate each test with `// Covers: 1_PRD-REQ-042` or `// Covers: 2_TAS-REQ-024`.

## 2. Task Implementation
- [ ] Define `ProjectRegistry` struct in `crates/devs-config/src/registry.rs` with field `projects: Vec<ProjectEntry>`. Derive `Deserialize`, `Serialize`.
- [ ] Define `ProjectEntry` struct with fields: `repo_path: String`, `priority: Option<u32>`, `weight: Option<u32>`, `checkpoint_branch: Option<String>`, `workflow_search_paths: Vec<String>`. Derive `Deserialize`, `Serialize`.
- [ ] Implement `ProjectRegistry::from_toml(content: &str) -> Result<Self, toml::de::Error>`.
- [ ] Implement `ProjectRegistry::from_file(path: &Path) -> Result<Self, ConfigError>` that reads the file and calls `from_toml`.
- [ ] Implement `ProjectRegistry::validate(&self) -> Result<(), Vec<ConfigError>>` that checks: each `repo_path` is non-empty, each `weight` (if present) is >= 1, no duplicate `repo_path` values.
- [ ] Implement `ProjectRegistry::add_project(&mut self, entry: ProjectEntry) -> Result<(), ConfigError>` that validates the entry and appends it (rejecting duplicates by `repo_path`).
- [ ] Implement `ProjectRegistry::save_to_file(&self, path: &Path) -> Result<(), ConfigError>` that serializes to TOML and writes atomically (temp file + rename).
- [ ] Re-export `ProjectRegistry` and `ProjectEntry` from `crates/devs-config/src/lib.rs`.

## 3. Code Review
- [ ] Verify atomic file write uses temp file + rename pattern (not direct write).
- [ ] Verify duplicate `repo_path` detection in both `validate()` and `add_project()`.
- [ ] Verify `weight` minimum is 1, not 0.

## 4. Run Automated Tests to Verify
- [ ] Run `cargo test -p devs-config` and verify all tests pass.

## 5. Update Documentation
- [ ] Add doc comments to `ProjectRegistry`, `ProjectEntry`, and all public methods.

## 6. Automated Verification
- [ ] Run `cargo test -p devs-config -- --nocapture 2>&1 | grep -E "test result"` and confirm `0 failed`.
- [ ] Run `cargo clippy -p devs-config -- -D warnings` and confirm zero warnings.
