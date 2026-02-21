# Task: Forensic Sandbox State Capture on Task Failure (Sub-Epic: 11_Sandbox and Failure Preservation)

## Covered Requirements
- [3_MCP-TAS-021], [5_SECURITY_DESIGN-REQ-SEC-SD-076]

## 1. Initial Test Written

- [ ] Write a unit test in `src/sandbox/__tests__/forensic-capture.test.ts` that:
  - Mocks a Docker container (using `testcontainers` or a mock `DockerodeClient`) and simulates a task failure mid-execution.
  - Asserts that `ForensicCapture.capture(taskId, containerId)` is called exactly once when an `ImplementationError` is thrown.
  - Asserts the return value is a `ForensicArtifact` object with fields: `taskId`, `containerId`, `capturedAt` (ISO timestamp), `artifactPath` (string), and `status: 'preserved'`.
- [ ] Write an integration test in `src/sandbox/__tests__/forensic-capture.integration.test.ts` that:
  - Spins up a real Docker container using `testcontainers`.
  - Causes a simulated failure by running a failing shell command inside it.
  - Calls `ForensicCapture.capture(taskId, containerId)` and asserts that a `.tar.gz` artifact is written to `<project-root>/.devs/forensics/<taskId>/`.
  - Asserts the artifact contains: `filesystem.tar.gz` (container FS snapshot), `stdout.log`, `stderr.log`, `env.json` (environment variables), and `metadata.json` (container labels, image name, exit code).
- [ ] Write a unit test verifying that if `ForensicCapture.capture()` itself throws (e.g., Docker socket unreachable), the error is caught and logged without re-throwing, so the outer failure handler continues cleanly.

## 2. Task Implementation

- [ ] Create `src/sandbox/forensic-capture.ts` exporting the `ForensicCapture` class with method:
  ```typescript
  static async capture(taskId: string, containerId: string): Promise<ForensicArtifact>
  ```
  - Use `dockerode` to export the container filesystem: `container.export()` → pipe to `fs.createWriteStream('<artifactDir>/filesystem.tar.gz')`.
  - Fetch container logs via `container.logs({ stdout: true, stderr: true, follow: false })` and write to `stdout.log` / `stderr.log`.
  - Inspect container with `container.inspect()` to extract env vars (parse `Config.Env` array into key/value JSON) and write to `env.json`.
  - Write `metadata.json` with: `{ taskId, containerId, image, exitCode, capturedAt, labels }`.
  - Artifact directory: `<cwd>/.devs/forensics/<taskId>/` — create with `fs.mkdirSync(..., { recursive: true })`.
- [ ] Define and export the `ForensicArtifact` interface in `src/sandbox/types.ts`:
  ```typescript
  export interface ForensicArtifact {
    taskId: string;
    containerId: string;
    capturedAt: string;
    artifactPath: string;
    status: 'preserved' | 'failed';
  }
  ```
- [ ] In `src/orchestration/implementation-loop.ts`, wrap the task execution try/catch so that on any caught `ImplementationError` (or general `Error` after max retries), call `await ForensicCapture.capture(task.id, activeSandbox.containerId)` before re-throwing or transitioning task state to `FAILED`.
- [ ] Ensure the `.devs/forensics/` path is added to `.gitignore` so forensic artifacts are never committed.
- [ ] Update the SQLite `tasks` table: add a column `forensic_artifact_path TEXT DEFAULT NULL`. On successful capture, write the artifact path into this column for the failed task row using a prepared statement.

## 3. Code Review

- [ ] Confirm `ForensicCapture` uses a streaming pipe for filesystem export (not buffering the entire FS in memory) — critical for large containers.
- [ ] Confirm env var redaction: before writing `env.json`, all values matching the project's secrets pattern (from `src/security/redaction.ts`) must be replaced with `"[REDACTED]"`.
- [ ] Confirm the artifact write is wrapped in its own try/catch so a capture failure cannot mask the original task failure.
- [ ] Confirm the `forensic_artifact_path` column update is performed in the same SQLite transaction as the task `FAILED` status update to prevent desync.
- [ ] Confirm no forensic artifacts are retained for tasks that succeed (no false-positive captures).

## 4. Run Automated Tests to Verify

- [ ] Run unit tests: `npx vitest run src/sandbox/__tests__/forensic-capture.test.ts`
- [ ] Run integration tests (requires Docker socket): `npx vitest run src/sandbox/__tests__/forensic-capture.integration.test.ts`
- [ ] Confirm all tests pass with zero failures and zero skips.
- [ ] Run the full Phase 13 test suite to verify no regressions: `npx vitest run src/` and confirm exit code 0.

## 5. Update Documentation

- [ ] Add a section `## Forensic Sandbox Preservation` to `docs/reliability.md` describing:
  - When forensic capture is triggered (task failure after max retries).
  - The artifact directory structure (`.devs/forensics/<taskId>/`).
  - How to inspect artifacts using `devs debug <taskId>` (note: CLI command implemented in a separate task).
  - The secret redaction guarantee for `env.json`.
- [ ] Update `docs/mcp-design.md` to reference `[3_MCP-TAS-021]` and link to `docs/reliability.md`.
- [ ] Update agent memory file `docs/agent-memory/phase_13.md` with: "On task failure, `ForensicCapture.capture()` is always called. Artifacts are stored at `.devs/forensics/<taskId>/`. The `tasks.forensic_artifact_path` column is set for failed tasks."

## 6. Automated Verification

- [ ] Run `npx vitest run --reporter=json src/sandbox/__tests__/` and pipe output to `jq '.testResults[] | select(.status == "failed")'` — assert empty output (no failures).
- [ ] After the integration test, assert `.devs/forensics/<taskId>/metadata.json` exists and is valid JSON: `node -e "require('.devs/forensics/test-task-id/metadata.json')"`.
- [ ] Run `grep -r "forensic_artifact_path" src/db/migrations/` to confirm the column migration file exists.
- [ ] Run `grep -n "ForensicCapture.capture" src/orchestration/implementation-loop.ts` to confirm the call site is present in the catch block.
