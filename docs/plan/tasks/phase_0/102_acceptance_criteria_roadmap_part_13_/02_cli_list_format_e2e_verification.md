# Task: CLI `devs list` Text and JSON Format E2E Verification (Sub-Epic: 102_Acceptance Criteria & Roadmap (Part 13))

## Covered Requirements
- [AC-TYP-024], [AC-TYP-025]

## Dependencies
- depends_on: []
- shared_components: [devs-cli (consumer — list subcommand), devs-core (consumer — run summary types)]

## 1. Initial Test Written
- [ ] Add `assert_cmd` and `predicates` to `crates/devs-cli/Cargo.toml` under `[dev-dependencies]` if not already present.
- [ ] Create an E2E test file `crates/devs-cli/tests/e2e_list_format.rs`.
- [ ] Write test `test_list_text_format_column_spacing` that invokes `Command::cargo_bin("devs")` with args `["list", "--format", "text"]` (against a test server or with a mock/fixture). Parse the first line of stdout (the header row). Assert that consecutive column headers (e.g., `RUN ID`, `SLUG`, `WORKFLOW`, `STATUS`) are separated by exactly 2 space characters. Specifically, split on `"  "` (two spaces) and verify the expected number of columns. Tag with `// Covers: AC-TYP-024`.
- [ ] Write test `test_list_text_format_run_id_column_width` that captures the text output with at least one run present. Assert the `RUN ID` column value in each data row is exactly 36 characters wide (UUID format). Tag with `// Covers: AC-TYP-024`.
- [ ] Write test `test_list_json_format_valid_json_empty_stderr` that invokes `Command::cargo_bin("devs")` with args `["list", "--format", "json"]`. Assert `output.stderr.is_empty()`. Assert `serde_json::from_slice::<serde_json::Value>(&output.stdout).is_ok()`. Tag with `// Covers: AC-TYP-025`.
- [ ] Write test `test_list_json_format_array_structure` that parses the JSON output and asserts it is a JSON array. If runs exist, each element should have at minimum `run_id`, `workflow`, and `status` fields. Tag with `// Covers: AC-TYP-025`.

## 2. Task Implementation
- [ ] In the CLI list command handler (e.g., `crates/devs-cli/src/commands/list.rs`), implement a `TextFormatter` that prints column headers separated by exactly 2 spaces. The `RUN ID` column must be formatted to exactly 36 characters width (left-aligned, space-padded). This satisfies [AC-TYP-024].
- [ ] Implement a `JsonFormatter` that serializes the run list as a JSON array to stdout using `serde_json::to_writer(io::stdout(), &runs)`. Ensure no output is written to stderr — any errors should be serialized as JSON to stdout or cause a non-zero exit code without stderr output. This satisfies [AC-TYP-025].
- [ ] Wire the `--format` flag (with values `text` and `json`, defaulting to `text`) to select the appropriate formatter.
- [ ] Ensure the text formatter always prints the header row even when there are zero runs.

## 3. Code Review
- [ ] Verify column separator is exactly `"  "` (two ASCII spaces), not tabs or variable whitespace.
- [ ] Verify the `RUN ID` column uses `{:<36}` format specifier for consistent 36-char UUID width.
- [ ] Confirm JSON mode writes nothing to stderr — check all code paths including error handling.
- [ ] Verify `--format json` output is parseable by standard JSON tools (no trailing commas, no comments).

## 4. Run Automated Tests to Verify
- [ ] Run `cargo test -p devs-cli --test e2e_list_format` and ensure all 4 tests pass.

## 5. Update Documentation
- [ ] Add doc comments to the `TextFormatter` and `JsonFormatter` structs documenting the output contract.
- [ ] Update CLI `--help` text for `devs list` to mention `--format text|json`.

## 6. Automated Verification
- [ ] Run `./do test` and confirm the `e2e_list_format` tests are included in the test run.
- [ ] Run `./target/debug/devs list --format json 2>/dev/null | python3 -m json.tool > /dev/null` to independently verify JSON validity (or equivalent `jq .` check).
