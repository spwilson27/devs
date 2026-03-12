# Task: CLI List Format E2E Verification (Sub-Epic: 102_Acceptance Criteria & Roadmap (Part 13))

## Covered Requirements
- [AC-TYP-024], [AC-TYP-025]

## Dependencies
- depends_on: [none]
- shared_components: [devs-cli]

## 1. Initial Test Written
- [ ] Add `assert_cmd` and `predicates` to `devs-cli` `dev-dependencies`.
- [ ] Create an E2E test in `devs-cli/tests/e2e_list.rs` that uses `Command::cargo_bin("devs")` with subcommands `list --format text`.
- [ ] The test should assert that the header line (e.g., `RUN-ID  SLUG  WORKFLOW...`) contains exactly 2 spaces between headers [AC-TYP-024].
- [ ] Create another test for `list --format json`.
- [ ] The JSON test should assert that `stderr` is empty and `serde_json::from_str(stdout)` is successful [AC-TYP-025].

## 2. Task Implementation
- [ ] In `devs-cli/src/format.rs` (or similar), implement the `TextFormatter` for `devs list`.
- [ ] Specifically, ensure that column headers are separated by exactly two spaces as specified in [UI-DES-051].
- [ ] Implement the `JsonFormatter` for `devs list`.
- [ ] Ensure that when `--format json` is used, all output (including any errors) goes to `stdout` and `stderr` remains empty [AC-TYP-025] [UI-DES-071].
- [ ] Use `serde_json` to serialize the run list into a JSON array of summary objects [UI-DES-090].

## 3. Code Review
- [ ] Verify that the `TextFormatter` uses fixed-width columns as required by [UI-DES-180].
- [ ] Confirm that `JsonFormatter` produces valid, minified or pretty-printed JSON as requested.
- [ ] Ensure that `devs list` always prints the header row in text mode, even if there are no runs [UI-DES-096a].

## 4. Run Automated Tests to Verify
- [ ] Run `cargo test -p devs-cli --test e2e_list` and ensure all format assertions pass.

## 5. Update Documentation
- [ ] Update the CLI help text/documentation to reflect the stable output formats for `list`.

## 6. Automated Verification
- [ ] Run `./do test` and confirm the `e2e_list` tests are executed.
- [ ] Use `sh -c "./target/debug/devs list --format json | jq ."` to manually verify JSON validity.
