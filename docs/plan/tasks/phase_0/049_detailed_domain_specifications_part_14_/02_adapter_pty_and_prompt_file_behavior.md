# Task: Implement PTY and File-Based Prompt Logic (Sub-Epic: 049_Detailed Domain Specifications (Part 14))

## Covered Requirements
- [2_TAS-REQ-118], [2_TAS-REQ-119]

## Dependencies
- depends_on: [01_adapter_context_and_command_types.md]
- shared_components: [devs-adapters]

## 1. Initial Test Written
- [ ] Create `crates/devs-adapters/src/pty.rs` and write unit tests for PTY allocation using `portable-pty`.
- [ ] Write a test verifying that PTY allocation failure returns an error.
- [ ] Create `crates/devs-adapters/src/prompt.rs` and write unit tests for prompt file creation and cleanup.
- [ ] Write a test verifying that prompt file writing failure returns an error.
- [ ] Write a test ensuring the prompt file path follows the format `<working_dir>/.devs_prompt_<uuid>`.

## 2. Task Implementation
- [ ] Implement PTY allocation logic in `crates/devs-adapters/src/pty.rs` using the `portable-pty` crate.
- [ ] Ensure PTY size is set to 220 columns × 50 rows as required by [2_TAS-REQ-118].
- [ ] Implement error handling for PTY allocation failure; ensure it returns a non-retryable error if `use_pty = true`.
- [ ] Implement prompt file writing logic in `crates/devs-adapters/src/prompt.rs`:
    - Create a file at `<working_dir>/.devs_prompt_<uuid>`.
    - Write the resolved prompt string to it.
    - Return the path to the file.
- [ ] Implement cleanup logic to delete the prompt file after the agent process exits.
- [ ] Ensure that a failure to write the prompt file results in an immediate stage failure with the error: `"failed to write prompt file: <io error>"` as per [2_TAS-REQ-119].

## 3. Code Review
- [ ] Verify that PTY size is exactly 220x50.
- [ ] Verify that no automatic fallback to non-PTY mode exists.
- [ ] Ensure that the prompt file cleanup is robust and handles cases where the file might have already been deleted by the agent.
- [ ] Check that `Uuid` used in the prompt file name is randomly generated as specified.

## 4. Run Automated Tests to Verify
- [ ] Run `cargo test -p devs-adapters` to ensure PTY and prompt file logic is correct.

## 5. Update Documentation
- [ ] Update `devs-adapters` module documentation to include PTY size and prompt file naming conventions.

## 6. Automated Verification
- [ ] Run `./do lint` to verify documentation and formatting.
- [ ] Run `cargo clippy -p devs-adapters` to check for code quality.
