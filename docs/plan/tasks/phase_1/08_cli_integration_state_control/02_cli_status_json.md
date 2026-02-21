# Task: Implement `status` Command with JSON Support (Sub-Epic: 08_CLI Integration & State Control)

## Covered Requirements
- [1_PRD-REQ-INT-001], [1_PRD-REQ-INT-005]

## 1. Initial Test Written
- [ ] Write integration tests in `packages/cli/tests/status.spec.ts` using `execa` to verify:
    - Running `devs status` in an uninitialized directory should fail with a helpful error.
    - Running `devs status` in an initialized directory should output the current project state (Project Name, Active Epic/Task).
    - Running `devs status --json` should output a valid JSON string matching a schema.
    - Verifying fields in the JSON output match the database content.

## 2. Task Implementation
- [ ] Add the `status` command to the CLI parser.
- [ ] Implement the `status` logic:
    - Load the project metadata from `state.sqlite` via `@devs/core/persistence`.
    - Retrieve the most recent epic and task status.
    - Calculate overall progress if possible.
- [ ] Implement `JSON` output formatting:
    - Use a dedicated formatter that maps the internal state object to the JSON schema.
    - Suppress non-essential logging to ensure `stdout` only contains the JSON.
- [ ] Ensure that all CLI errors also support JSON formatting when the flag is present.

## 3. Code Review
- [ ] Verify that the JSON output is consistent and easily parseable by external scripts.
- [ ] Check for proper error handling when the database is locked or corrupted.
- [ ] Ensure that the CLI output respects terminal width and uses appropriate color coding (unless `--json` is set).

## 4. Run Automated Tests to Verify
- [ ] Run `pnpm test --filter @devs/cli` and ensure status tests pass.

## 5. Update Documentation
- [ ] Add the `status` command and the `--json` flag to the CLI documentation.
- [ ] Document the structure of the JSON status object.

## 6. Automated Verification
- [ ] Run `devs status --json | jq .` to verify that the output is valid JSON and contains expected fields.
