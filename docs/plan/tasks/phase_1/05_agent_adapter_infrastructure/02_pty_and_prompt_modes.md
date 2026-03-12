# Task: PTY Support and Prompt Mode Logic (Sub-Epic: 05_Agent Adapter Infrastructure)

## Covered Requirements
- [1_PRD-REQ-015], [1_PRD-REQ-016]

## Dependencies
- depends_on: [01_agent_adapter_trait.md]
- shared_components: [devs-core, devs-adapters]

## 1. Initial Test Written
- [ ] In `devs-adapters`, write a test for a `PromptHandler` or similar helper.
- [ ] Test that when `PromptMode::File` is used, the returned arguments correctly reference a temporary prompt file path.
- [ ] Test that `AdapterCommand` includes a `use_pty` field and its value is correctly propagated.
- [ ] Verify the test fails.

## 2. Task Implementation
- [ ] Define `PromptMode` enum in `devs-adapters/src/types.rs`:
    ```rust
    pub enum PromptMode {
        Flag { flag: String },
        File { flag: String }, // e.g., --prompt-file <path>
    }
    ```
- [ ] Implement a helper in `devs-adapters` that concrete adapters can use to build their CLI arguments based on the `PromptMode` and the `StageContext`.
- [ ] Add `use_pty: bool` support to the `AdapterCommand` generation logic. Ensure it is configurable per adapter.
- [ ] Implement logic to generate the `.devs_prompt_<uuid>` filename when in `File` mode, as specified in [2_TAS-REQ-119]. Note: the actual file write happens at the executor level, but the adapter defines the filename and the flag.
- [ ] Ensure that `PromptMode` selection is encapsulated within the adapter's `build_command` implementation.

## 3. Code Review
- [ ] Ensure the prompt filename uses a UUID as required by [2_TAS-REQ-119].
- [ ] Verify that PTY configuration is passed correctly in the `AdapterCommand`.
- [ ] Check for clear separation between defining the command (adapter) and executing it (runner/executor).

## 4. Run Automated Tests to Verify
- [ ] Run `cargo test -p devs-adapters` and ensure tests for prompt mode and PTY configuration pass.

## 5. Update Documentation
- [ ] Document the `PromptMode` enum and its usage in the crate's internal documentation.

## 6. Automated Verification
- [ ] Run `./do lint` and `./do test` to ensure compliance and traceability for [1_PRD-REQ-015] and [1_PRD-REQ-016].
