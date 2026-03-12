# Task: CLI Text-Format Output Rules (Sub-Epic: 053_Detailed Domain Specifications (Part 18))

## Covered Requirements
- [2_TAS-REQ-138]

## Dependencies
- depends_on: [none]
- shared_components: [devs-core]

## 1. Initial Test Written
- [ ] Create a unit test in `crates/devs-core/src/cli_format.rs` for the text formatting trait.
- [ ] The test should use a mock terminal or string buffer.
- [ ] Test Cases:
    - Format a list of runs: Verify that columns (RUN-ID, SLUG, etc.) match REQ-138.
    - Format a single run status: Verify header and stage table columns.
    - Format log lines: Verify `[stdout]` and `[stderr]` prefixes.

## 2. Task Implementation
- [ ] Define a `TextFormat` trait in `crates/devs-core/src/cli_format.rs`.
- [ ] Implement `TextFormat` for a collection of `WorkflowRun` objects (`devs list`).
    - Logic should include fixed-width column formatting (RUN-ID short, SLUG, WORKFLOW, STATUS, CREATED).
- [ ] Implement `TextFormat` for a single `WorkflowRun` and its associated `StageRun` objects (`devs status`).
    - Header info: Run ID, status, start/end times.
    - Stage table: STAGE, STATUS, ATTEMPT, STARTED, ELAPSED.
- [ ] Implement log line formatting utility (raw log line → prefixed string).

## 3. Code Review
- [ ] Verify that the table columns and headers exactly match the specifications in [2_TAS-REQ-138].
- [ ] Ensure that `TextFormat` is decoupled from the CLI argument parsing (it should just take data and return a string or write to a `fmt::Formatter`).

## 4. Run Automated Tests to Verify
- [ ] Run `cargo test -p devs-core --lib cli_format` and ensure all formatting test cases pass.

## 5. Update Documentation
- [ ] Document the `TextFormat` trait and its default implementations in the crate documentation.

## 6. Automated Verification
- [ ] Run `./do lint` and ensure no documentation or formatting violations are present.
