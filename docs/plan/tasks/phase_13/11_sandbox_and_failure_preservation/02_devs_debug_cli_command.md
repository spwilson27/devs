# Task: Implement `devs debug` CLI Command for Forensic Artifact Inspection (Sub-Epic: 11_Sandbox and Failure Preservation)

## Covered Requirements
- [3_MCP-TAS-021], [5_SECURITY_DESIGN-REQ-SEC-SD-076]

## 1. Initial Test Written

- [ ] Write unit tests in `src/cli/__tests__/debug-command.test.ts`:
  - Mock `ForensicStore.getArtifact(taskId)` returning a `ForensicArtifact` with a known `artifactPath`.
  - Assert `devs debug <taskId>` renders a table to stdout with columns: `File`, `Size`, `Last Modified` listing all files inside `artifactPath/`.
  - Assert `devs debug <taskId> --extract <destDir>` calls `tar.extract({ cwd: destDir })` on `filesystem.tar.gz` and prints a success message.
  - Assert `devs debug <taskId> --env` prints the contents of `env.json` to stdout (with `[REDACTED]` values preserved as-is).
  - Assert `devs debug <taskId>` exits with code `1` and prints `No forensic artifact found for task <taskId>` when `ForensicStore.getArtifact()` returns `null`.
- [ ] Write integration tests in `src/cli/__tests__/debug-command.integration.test.ts` that:
  - Create a real artifact directory structure in a temp dir with all expected files.
  - Run the `devs debug` CLI via `execa('node', ['dist/cli.js', 'debug', taskId])`.
  - Assert stdout contains the file listing table with correct sizes.
  - Assert `--extract` correctly unpacks `filesystem.tar.gz` to a target directory.

## 2. Task Implementation

- [ ] Create `src/cli/commands/debug.ts` registering a `debug` subcommand using `commander`:
  ```
  devs debug <taskId> [options]
  Options:
    --extract <destDir>   Extract the container filesystem snapshot to <destDir>
    --env                 Print the captured environment variables
    --logs                Print stdout and stderr logs from the failed container
    --open                Open the artifact directory in the system file explorer
  ```
- [ ] Implement `ForensicStore` in `src/sandbox/forensic-store.ts`:
  - `getArtifact(taskId: string): Promise<ForensicArtifact | null>` — queries `tasks.forensic_artifact_path` from SQLite for the given `taskId`.
  - `listFiles(artifactPath: string): Promise<ArtifactFile[]>` — reads the directory and returns `{ name, sizeBytes, modifiedAt }[]`.
- [ ] In `debug.ts`, use `cli-table3` to render the file listing table to stdout.
- [ ] Implement `--extract` using the `tar` npm package: `tar.x({ file: path.join(artifactPath, 'filesystem.tar.gz'), cwd: destDir })`.
- [ ] Implement `--logs` by reading and printing `stdout.log` and `stderr.log` with appropriate `[STDOUT]` / `[STDERR]` headers.
- [ ] Implement `--env` by reading and pretty-printing `env.json` (already redacted at capture time).
- [ ] Register the `debug` command in `src/cli/index.ts`.

## 3. Code Review

- [ ] Confirm the CLI does not re-expose redacted secrets — `env.json` must be printed verbatim (redaction was applied at capture time).
- [ ] Confirm `--extract` validates that `destDir` does not already contain files before extracting (to prevent accidental overwrites); print a warning and require `--force` to overwrite.
- [ ] Confirm `--open` uses `open` (npm package) and gracefully degrades when no GUI is available (headless environment) with a printed message.
- [ ] Confirm the command is documented in `devs --help` output.
- [ ] Confirm `ForensicStore.getArtifact()` uses a read-only SQLite connection to avoid locking the database.

## 4. Run Automated Tests to Verify

- [ ] Run: `npx vitest run src/cli/__tests__/debug-command.test.ts`
- [ ] Run: `npx vitest run src/cli/__tests__/debug-command.integration.test.ts`
- [ ] Run manual smoke test: `node dist/cli.js debug --help` and assert all options are listed.
- [ ] Confirm all tests pass with exit code 0.

## 5. Update Documentation

- [ ] Add `devs debug` usage to `docs/cli-reference.md` with all options and example outputs.
- [ ] Add a "Inspecting Failed Tasks" guide to `docs/reliability.md` referencing the `devs debug` command.
- [ ] Update `docs/agent-memory/phase_13.md`: "The `devs debug <taskId>` command provides access to forensic artifacts. Agents can programmatically access artifact metadata via `ForensicStore.getArtifact(taskId)`."

## 6. Automated Verification

- [ ] Run `npx vitest run --reporter=json src/cli/__tests__/` and assert no failing tests via `jq '.numFailedTests == 0'`.
- [ ] Run `node dist/cli.js debug --help 2>&1 | grep -q "\-\-extract"` and assert exit code 0.
- [ ] Run `node dist/cli.js debug nonexistent-task-id; echo "Exit: $?"` and assert output contains `No forensic artifact found` and exit code is `1`.
