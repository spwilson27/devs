# Task: CLI Text-Format Output Rules (Sub-Epic: 053_Detailed Domain Specifications (Part 18))

## Covered Requirements
- [2_TAS-REQ-138]

## Dependencies
- depends_on: []
- shared_components: [devs-core (consumer — uses domain types like `WorkflowRunSummary`, `StageRunSummary`)]

## 1. Initial Test Written
- [ ] Create module `crates/devs-core/src/text_format.rs` and register it in `lib.rs`.
- [ ] Write these unit tests (all fail-first):
  - **`devs list` table format:**
    - `test_list_table_header`: Call the list formatter with an empty vec. Assert the output contains exactly the header line with columns: `RUN-ID`, `SLUG`, `WORKFLOW`, `STATUS`, `CREATED` (in that order, tab or space separated).
    - `test_list_table_single_row`: Format one run. Assert the row contains the short RUN-ID (first 8 chars of UUID), slug, workflow name, status string, and ISO-8601 created timestamp.
    - `test_list_table_multiple_rows`: Format 3 runs. Assert 3 data rows plus 1 header row.
    - `test_list_run_id_is_short`: Assert the RUN-ID column shows only the first 8 hex characters of the UUID (matching "short" format per REQ-138).
  - **`devs status` format:**
    - `test_status_header`: Format a single run status. Assert the output starts with run metadata (full run ID, workflow name, overall status).
    - `test_status_stage_table_columns`: Assert the stage table has columns: `STAGE`, `STATUS`, `ATTEMPT`, `STARTED`, `ELAPSED` (in that order).
    - `test_status_stage_elapsed_format`: Assert elapsed time is formatted as human-readable duration (e.g., `1m 23s` or `83s`).
  - **`devs logs` format:**
    - `test_logs_stdout_prefix`: Pass a stdout log line `"hello world"`. Assert output is `"[stdout] hello world"`.
    - `test_logs_stderr_prefix`: Pass a stderr log line `"error occurred"`. Assert output is `"[stderr] error occurred"`.
    - `test_logs_preserves_raw_content`: Assert no additional formatting, escaping, or wrapping is applied to the raw log content after the prefix.
- [ ] Tag each test with `// Covers: 2_TAS-REQ-138`.

## 2. Task Implementation
- [ ] Define input structs (or re-use existing domain types) for the formatter:
  ```rust
  pub struct RunListEntry {
      pub run_id: uuid::Uuid,
      pub slug: String,
      pub workflow: String,
      pub status: String,
      pub created: chrono::DateTime<chrono::Utc>,
  }
  pub struct RunStatusView {
      pub run_id: uuid::Uuid,
      pub workflow: String,
      pub status: String,
      pub stages: Vec<StageStatusEntry>,
  }
  pub struct StageStatusEntry {
      pub name: String,
      pub status: String,
      pub attempt: u32,
      pub started: Option<chrono::DateTime<chrono::Utc>>,
      pub elapsed: Option<chrono::Duration>,
  }
  pub enum LogStream { Stdout, Stderr }
  ```
- [ ] Implement `pub fn format_run_list(runs: &[RunListEntry]) -> String`:
  - Print header row with fixed-width columns.
  - For each run, print short UUID (first 8 hex chars), slug, workflow, status, and created timestamp.
  - Use consistent column widths (pad with spaces). Minimum widths: RUN-ID=8, SLUG=20, WORKFLOW=20, STATUS=12, CREATED=20.
- [ ] Implement `pub fn format_run_status(view: &RunStatusView) -> String`:
  - Print run header (full UUID, workflow, status) on first lines.
  - Print stage table with columns: STAGE, STATUS, ATTEMPT, STARTED, ELAPSED.
  - Format elapsed as `Xm Ys` for durations >= 60s, or `Xs` for shorter durations. Show `-` if not started.
- [ ] Implement `pub fn format_log_line(stream: LogStream, line: &str) -> String`:
  - Return `"[stdout] {line}"` or `"[stderr] {line}"` with no trailing newline added (caller handles newlines).
- [ ] Add `/// Covers: 2_TAS-REQ-138` doc comments on all three functions.

## 3. Code Review
- [ ] Verify column names and order exactly match REQ-138 specification.
- [ ] Verify RUN-ID in `devs list` is "short" (first 8 hex chars), not the full UUID.
- [ ] Verify log line prefix is exactly `[stdout] ` or `[stderr] ` (with one space after bracket).
- [ ] Verify no ANSI color codes are emitted (text format should be plain).
- [ ] No `unwrap()` or `panic!()` outside tests.

## 4. Run Automated Tests to Verify
- [ ] Run `cargo test -p devs-core -- text_format` and ensure all 10 test cases pass.
- [ ] Run `cargo clippy -p devs-core -- -D warnings` with zero warnings.

## 5. Update Documentation
- [ ] Add `pub mod text_format;` to `crates/devs-core/src/lib.rs`.
- [ ] Module-level doc comment describing the three CLI text output formats.

## 6. Automated Verification
- [ ] Run `./do lint` — must pass.
- [ ] Run `./do test` — must pass; verify `text_format` tests appear in output.
- [ ] Grep for `// Covers: 2_TAS-REQ-138` to confirm traceability.
