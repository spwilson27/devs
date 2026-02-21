# Task: Implement run_test_task Tool (Sub-Epic: 09_ProjectServer Introspection Tools)

## Covered Requirements
- [3_MCP-TAS-080]

## 1. Initial Test Written
- [ ] Create `packages/mcp-server/src/projectserver/__tests__/run-test-task.test.ts`.
- [ ] Mock `child_process.spawn` (or the test runner adapter) to simulate test execution.
- [ ] Write unit tests for `runTestTask(params: { test_path: string; reporter: "json" | "tap" })`:
  - `reporter: "json"` with a passing test suite — returns `StructuredTestReport { passed: true, totalTests: 5, failedTests: 0, failures: [] }`.
  - `reporter: "json"` with a failing test suite — returns `StructuredTestReport { passed: false, totalTests: 5, failedTests: 2, failures: [{ name, message, stackTrace, diff }] }` with correct failure details parsed from the mock JSON output.
  - `reporter: "tap"` — mock TAP output is parsed and returns equivalent `StructuredTestReport`.
  - `test_path` that does not exist — returns `{ passed: false, totalTests: 0, failedTests: 0, failures: [{ name: "Setup Error", message: "Test path not found: ...", stackTrace: "", diff: undefined }] }`.
  - Test runner process exits with non-zero code for non-test-failure reasons (e.g., compilation error) — returns a `StructuredTestReport` where `failures[0].message` includes the raw stderr.
  - Verify the spawned command uses the project-root-relative `test_path` (path traversal guard applied).
- [ ] Write an integration test that uses an actual small in-repo test fixture and confirms the tool produces a valid `StructuredTestReport`.
- [ ] All tests must fail (RED) before implementation.

## 2. Task Implementation
- [ ] Create `packages/mcp-server/src/projectserver/tools/runTestTask.ts`:
  - Export `runTestTask(params: { test_path: string; reporter: "json" | "tap" }, deps: { projectRoot: string; spawnFn?: SpawnFn }): Promise<StructuredTestReport>`.
  - Default `spawnFn` is Node's `child_process.spawn` wrapped in a promise helper (`spawnToPromise`).
  - Validate `test_path` with `_pathGuard` from task 03.
  - Build the command:
    - For `reporter: "json"`: `["npx", "jest", "--testPathPattern", resolvedPath, "--json", "--no-coverage"]`
    - For `reporter: "tap"`: `["npx", "jest", "--testPathPattern", resolvedPath, "--tap", "--no-coverage"]`
  - Capture `stdout` and `stderr`.
  - Parse `stdout`:
    - For `json` reporter: parse Jest JSON output. Map `testResults[].assertionResults[]` to `failures` array.
    - For `tap` reporter: implement a minimal TAP line parser that extracts `not ok` lines, their descriptions, and YAML diagnostic blocks.
  - Return `StructuredTestReport`.
- [ ] Create `packages/mcp-server/src/projectserver/tools/_spawnToPromise.ts`:
  - Export `spawnToPromise(command: string, args: string[], cwd: string): Promise<{ stdout: string; stderr: string; exitCode: number }>`.
  - Use `child_process.spawn` with `{ cwd, stdio: "pipe" }`.
  - Accumulate stdout/stderr buffer chunks; resolve on `close` event.
- [ ] Register `run_test_task` as an MCP tool with input schema:
  ```ts
  z.object({ test_path: z.string(), reporter: z.enum(["json", "tap"]) })
  ```

## 3. Code Review
- [ ] Verify the TAP parser handles multi-line YAML diagnostic blocks correctly (lines between `---` and `...` delimiters).
- [ ] Verify `spawnToPromise` has a hard timeout of 300 seconds (per `3_MCP-TAS-073`) — use `setTimeout` + `process.kill(child.pid)` on timeout, then reject with a timeout error.
- [ ] Verify no shell injection is possible: arguments are passed as an array to `spawn`, never interpolated into a shell string.
- [ ] Verify `StructuredTestReport` returned on parse errors still conforms to the interface (no extra keys, no missing required fields).
- [ ] Verify `diff` field in failures is populated only when the Jest JSON output contains a `matcherResult.message` block with a diff section.

## 4. Run Automated Tests to Verify
- [ ] Run `pnpm --filter @devs/mcp-server test -- --testPathPattern="run-test-task"` and confirm all tests pass (GREEN).
- [ ] Run `pnpm --filter @devs/mcp-server tsc --noEmit`.

## 5. Update Documentation
- [ ] Append to `packages/mcp-server/src/projectserver/tools/index.agent.md`:
  - Document `run_test_task` parameters, timeout behavior (300 s), and both reporter formats.
  - Include sample `StructuredTestReport` JSON for a failing test.
  - List requirement IDs: `3_MCP-TAS-080`.
- [ ] Update `packages/mcp-server/README.md` to list `run_test_task` as an available ProjectServer tool.

## 6. Automated Verification
- [ ] Run `pnpm --filter @devs/mcp-server test -- --ci --testPathPattern="run-test-task"` and assert exit code `0`.
- [ ] Run `grep -n "300" packages/mcp-server/src/projectserver/tools/_spawnToPromise.ts` and confirm the 300-second timeout constant is present.
