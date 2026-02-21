# Task: Scaffold `devs export` CLI Command Entry Point (Sub-Epic: 07_Project Handover)

## Covered Requirements
- [4_USER_FEATURES-REQ-087]

## 1. Initial Test Written
- [ ] In `src/cli/__tests__/export.command.test.ts`, write unit tests for the `devs export` command entry point:
  - Test that `devs export` is registered as a valid sub-command in the CLI router (e.g., via `commander` or `yargs`).
  - Test that invoking `devs export` without a target project path exits with a non-zero code and prints a usage error to stderr.
  - Test that invoking `devs export --output <dir>` with a valid project path resolves the output directory correctly and calls the underlying `runExport(projectPath, outputDir)` orchestration function with the correct arguments.
  - Test that `devs export --help` prints usage text containing `--output`, `--format`, and `--dry-run` flags.
  - Test that the `--dry-run` flag suppresses file system writes and only logs what would be generated.
  - Mock `runExport` at the unit test boundary so that these tests only cover CLI argument parsing, not business logic.

## 2. Task Implementation
- [ ] Create `src/cli/commands/export.command.ts`:
  - Register the `export` sub-command on the CLI program object.
  - Accept arguments:
    - `<project-path>` (positional, required): path to the `devs`-generated project root.
    - `--output <dir>` (optional, default: `<project-path>/devs-export`): destination directory for the archive and report.
    - `--format <zip|tar.gz>` (optional, default: `zip`): archive format.
    - `--dry-run` (flag): print what would be created without writing files.
  - Validate that `<project-path>` exists and contains a `devs.db` (SQLite state database) or a `.devs/` config directory; exit with code 1 and a descriptive error message if not.
  - Call `runExport(projectPath, options)` from `src/export/index.ts` (to be implemented in subsequent tasks).
  - Handle errors thrown by `runExport`: print error message to stderr and exit with code 1.
- [ ] Register the new command in `src/cli/index.ts` (or wherever commands are aggregated).

## 3. Code Review
- [ ] Verify the command follows the existing CLI command pattern used by other `devs` sub-commands (same commander/yargs version, same error-handling helper, same exit code conventions).
- [ ] Confirm argument validation logic does not duplicate filesystem checks that belong in the export orchestrator layer.
- [ ] Ensure `--dry-run` propagation is purely a flag passed through to `runExport` rather than implemented inline in the command handler.
- [ ] Check that no import cycle is introduced between `src/cli` and `src/export`.

## 4. Run Automated Tests to Verify
- [ ] Run `npm test -- --testPathPattern="export.command"` (or the project-equivalent test runner command) and confirm all tests pass with zero failures.
- [ ] Run the full CLI test suite (`npm test -- --testPathPattern="src/cli"`) to confirm no regressions.

## 5. Update Documentation
- [ ] Add the `export` command to `docs/cli-reference.md` with full flag descriptions and at least two usage examples.
- [ ] Update `README.md`'s "CLI Commands" table to include `devs export`.
- [ ] Update the agent memory file `docs/agent-memory/phase_15.md` noting that the `devs export` CLI entry point is registered.

## 6. Automated Verification
- [ ] Run `node dist/cli/index.js export --help` and assert the output contains `--output`, `--format`, and `--dry-run` via a shell assertion: `node dist/cli/index.js export --help | grep -E "\-\-output|\-\-format|\-\-dry-run"`.
- [ ] Run `node dist/cli/index.js export /nonexistent/path 2>&1; echo "exit:$?"` and assert the output contains `exit:1` and a descriptive error message.
