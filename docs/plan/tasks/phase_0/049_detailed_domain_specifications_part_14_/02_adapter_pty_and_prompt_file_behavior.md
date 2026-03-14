# Task: Implement PTY Allocation and File-Based Prompt Logic (Sub-Epic: 049_Detailed Domain Specifications (Part 14))

## Covered Requirements
- [2_TAS-REQ-118], [2_TAS-REQ-119]

## Dependencies
- depends_on: [01_adapter_context_and_command_types.md]
- shared_components: [devs-adapters (create modules in)]

## 1. Initial Test Written
- [ ] In `crates/devs-adapters/src/pty_tests.rs`, write `test_pty_size_is_220x50` — allocate a PTY using `portable-pty` and assert the configured size is 220 columns × 50 rows.
- [ ] Write `test_pty_allocation_failure_is_non_retryable` — simulate or force a PTY allocation failure (e.g., by requesting an impossible config if feasible, or by mocking the allocator). Assert the returned error contains the string `"PTY allocation failed: "` and that the error is marked as non-retryable (i.e., no automatic fallback to non-PTY mode).
- [ ] Write `test_no_fallback_to_non_pty_on_failure` — when `use_pty = true` and allocation fails, assert the stage result is `Failed` and no subprocess was spawned (confirming no silent fallback).
- [ ] In `crates/devs-adapters/src/prompt_tests.rs`, write `test_prompt_file_path_format` — call the prompt file writer with a known `working_dir` and assert the returned path matches `<working_dir>/.devs_prompt_<uuid>` (where `<uuid>` is a valid UUID v4 pattern).
- [ ] Write `test_prompt_file_contains_resolved_prompt` — write a prompt string via the prompt file writer, then read the file back and assert contents match exactly.
- [ ] Write `test_prompt_file_deleted_after_agent_exits` — write a prompt file, simulate agent exit (call the cleanup function), and assert the file no longer exists on disk.
- [ ] Write `test_prompt_file_cleanup_handles_already_deleted` — delete the prompt file manually before calling cleanup, and assert cleanup does not panic or error (idempotent).
- [ ] Write `test_prompt_file_write_failure_returns_stage_error` — point `working_dir` to a non-existent or read-only directory. Assert the error message matches `"failed to write prompt file: <io error>"` pattern.

## 2. Task Implementation
- [ ] Add `portable-pty` to `crates/devs-adapters/Cargo.toml` dependencies.
- [ ] Create `crates/devs-adapters/src/pty.rs`:
    - Implement `pub fn allocate_pty() -> Result<PtyPair, AdapterError>` that creates a PTY with size `PtySize { rows: 50, cols: 220, .. }`.
    - On failure, return `AdapterError::PtyAllocationFailed(os_error_string)` — this error must be flagged as non-retryable.
    - Do NOT implement any fallback logic — if PTY allocation fails, propagate the error immediately.
- [ ] Create `crates/devs-adapters/src/prompt.rs`:
    - Implement `pub fn write_prompt_file(working_dir: &Path, prompt: &str) -> Result<PathBuf, AdapterError>`:
        - Generate a UUID v4 for the filename.
        - Write `prompt` to `<working_dir>/.devs_prompt_<uuid>`.
        - Return the file path on success.
        - On write failure, return `AdapterError::PromptFileWriteFailed(io_error)` with message format `"failed to write prompt file: {io_error}"`.
    - Implement `pub fn cleanup_prompt_file(path: &Path)`:
        - Delete the file at `path`.
        - If the file does not exist, silently succeed (idempotent).
        - Log but do not error on other I/O failures during cleanup.
- [ ] Ensure cleanup is called in a `Drop` guard or equivalent RAII pattern so the prompt file is always deleted regardless of how the agent process terminates.

## 3. Code Review
- [ ] Verify PTY size is exactly `cols: 220, rows: 50` — not reversed.
- [ ] Confirm there is NO code path that falls back from PTY to non-PTY mode when `use_pty = true`.
- [ ] Verify the prompt file UUID is generated fresh per invocation (not reused).
- [ ] Confirm cleanup is called in all exit paths: success, failure, panic.
- [ ] Check that `AdapterError::PtyAllocationFailed` includes the OS error string verbatim.

## 4. Run Automated Tests to Verify
- [ ] Run `cargo test -p devs-adapters -- pty` and confirm all PTY tests pass.
- [ ] Run `cargo test -p devs-adapters -- prompt` and confirm all prompt file tests pass.

## 5. Update Documentation
- [ ] Add doc comments to `allocate_pty` specifying the 220×50 size and non-retryable failure behavior.
- [ ] Add doc comments to `write_prompt_file` and `cleanup_prompt_file` specifying the file naming convention and cleanup guarantees.

## 6. Automated Verification
- [ ] Run `./do lint` and confirm no warnings for `devs-adapters`.
- [ ] Run `cargo clippy -p devs-adapters -- -D warnings` and confirm clean output.
