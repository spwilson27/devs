# Task: PTY Support and Prompt Passing Mode Logic (Sub-Epic: 05_Agent Adapter Infrastructure)

## Covered Requirements
- [1_PRD-REQ-015], [1_PRD-REQ-016]

## Dependencies
- depends_on: [01_agent_adapter_trait.md]
- shared_components: [devs-adapters (extend)]

## 1. Initial Test Written
- [ ] Write a test `test_prompt_mode_flag_builds_inline_arg` that creates a `PromptMode::Flag { flag: "--print".into() }`, calls a helper `build_prompt_args(mode, "do the thing")`, and asserts the result is `vec!["--print", "do the thing"]`.
- [ ] Write a test `test_prompt_mode_file_builds_file_arg` that creates a `PromptMode::File { flag: "--prompt-file".into() }`, calls `build_prompt_args(mode, "do the thing")`, and asserts the result is `vec!["--prompt-file", "<temp_path>"]` where `<temp_path>` matches the pattern `.devs_prompt_<uuid>`.
- [ ] Write a test `test_prompt_file_path_contains_uuid` that verifies the generated filename in `File` mode contains a valid UUID v4 segment (regex: `[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}`).
- [ ] Write a test `test_prompt_file_path_is_relative_to_working_dir` that verifies the generated path is relative (not absolute), so the executor can resolve it against the working directory.
- [ ] Write a test `test_pty_flag_propagates_to_adapter_command` that creates an `AgentInvocation` with `use_pty: true`, calls a mock adapter's `build_command`, and asserts `AdapterCommand.use_pty == true`.
- [ ] Write a test `test_pty_flag_false_by_default` that creates an `AgentInvocation` with `use_pty: false` and asserts `AdapterCommand.use_pty == false`.
- [ ] Write a test `test_prompt_mode_file_content_not_in_args` that verifies when using `File` mode, the actual prompt text does NOT appear in the args list (only the file path does), preventing shell argument length issues.
- [ ] Confirm all tests fail (types don't exist yet).

## 2. Task Implementation
- [ ] Define `PromptMode` enum in `crates/devs-adapters/src/types.rs`:
  ```rust
  pub enum PromptMode {
      /// Prompt passed directly as a CLI flag value.
      Flag { flag: String },
      /// Prompt written to a temp file; the file path is passed as a CLI flag value.
      File { flag: String },
  }
  ```
  Derive `Debug`, `Clone`, `PartialEq`.
- [ ] Implement `build_prompt_args(mode: &PromptMode, prompt: &str, working_dir: &Path) -> PromptArgs` in `crates/devs-adapters/src/prompt.rs`:
  - For `Flag`: return args `[flag, prompt]` and `prompt_file: None`.
  - For `File`: generate a filename `.devs_prompt_<uuid>` using `uuid::Uuid::new_v4()`, return args `[flag, filename]` and `prompt_file: Some(PromptFile { path, content: prompt })`.
- [ ] Define `PromptArgs` struct: `args: Vec<String>`, `prompt_file: Option<PromptFile>`.
- [ ] Define `PromptFile` struct: `relative_path: PathBuf`, `content: String`.
- [ ] Ensure `AdapterCommand` (from task 01) already contains `use_pty: bool`. No structural changes needed; this task validates propagation.
- [ ] Add `uuid` as a dependency to `devs-adapters/Cargo.toml` (feature `v4`).

## 3. Code Review
- [ ] Verify `PromptMode` is used by adapters in `build_command` and is not exposed to callers outside the crate (adapters choose their own mode internally).
- [ ] Verify the UUID generation uses `uuid::Uuid::new_v4()` (cryptographically random).
- [ ] Verify the prompt file helper does NOT write the file to disk (that is the executor's responsibility); it only produces the path and content.
- [ ] Verify `use_pty` is a simple boolean pass-through with no platform-specific logic in the adapter layer.

## 4. Run Automated Tests to Verify
- [ ] Run `cargo test -p devs-adapters` and confirm all prompt mode and PTY tests pass.
- [ ] Run `cargo clippy -p devs-adapters -- -D warnings` and confirm zero warnings.

## 5. Update Documentation
- [ ] Add `// Covers: 1_PRD-REQ-015` to prompt mode tests.
- [ ] Add `// Covers: 1_PRD-REQ-016` to PTY propagation tests.
- [ ] Add doc comments to `PromptMode`, `PromptArgs`, `PromptFile`, and `build_prompt_args`.

## 6. Automated Verification
- [ ] Run `./do lint` and confirm it passes.
- [ ] Run `./do test` and confirm `target/traceability.json` includes entries for `1_PRD-REQ-015` and `1_PRD-REQ-016`.
