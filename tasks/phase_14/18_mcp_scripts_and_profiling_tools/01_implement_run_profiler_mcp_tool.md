# Task: Implement `run_profiler` MCP Tool for CPU/Memory Trace Capture (Sub-Epic: 18_MCP Scripts and Profiling Tools)

## Covered Requirements
- [2_TAS-REQ-010]

## 1. Initial Test Written

- [ ] Create `src/mcp/tools/__tests__/run_profiler.test.ts`.
- [ ] Write a unit test that mocks the Node.js `inspector` module (or equivalent V8 CPU profiler API) and verifies that calling `runProfiler({ type: 'cpu', duration: 5000 })` starts and stops a CPU profile session and returns a structured result containing a `profilePath` string and `durationMs` number.
- [ ] Write a unit test that mocks Node.js `process.memoryUsage()` and verifies that calling `runProfiler({ type: 'memory' })` returns an object containing `heapUsed`, `heapTotal`, `external`, and `rss` fields in bytes.
- [ ] Write a unit test verifying that if the profiler is already running and another `runProfiler` call is made, it returns a structured error: `{ error: 'PROFILER_BUSY', message: '...' }` without throwing.
- [ ] Write an integration test that invokes the MCP tool handler registered on the MCP server for the tool name `run_profiler` with a valid JSON payload `{ type: 'cpu', duration: 2000 }` and asserts the MCP response conforms to the `CallToolResult` schema (i.e., `{ content: [{ type: 'text', text: '<json>' }] }`).
- [ ] Write a test that verifies the output JSON file from a CPU profile is saved to `<projectRoot>/.devs/profiles/` with a timestamp-based filename matching the pattern `cpu-YYYY-MM-DDTHH-mm-ss.cpuprofile`.
- [ ] All tests must fail before implementation (red phase confirmed).

## 2. Task Implementation

- [ ] Create `src/mcp/tools/run_profiler.ts` exporting a function `runProfiler(params: RunProfilerParams): Promise<RunProfilerResult>`.
- [ ] Define the TypeScript interfaces:
  ```ts
  // [2_TAS-REQ-010]
  export type RunProfilerParams =
    | { type: 'cpu'; duration: number }
    | { type: 'memory' };

  export type RunProfilerResult =
    | { profilePath: string; durationMs: number }
    | { heapUsed: number; heapTotal: number; external: number; rss: number }
    | { error: string; message: string };
  ```
- [ ] For CPU profiling: Use Node.js `v8` built-in or the `inspector` module (`Session`, `Profiler.enable`, `Profiler.start`, `Profiler.stop`) to start a session, wait `duration` ms, stop, serialize the profile to JSON, and write it to `.devs/profiles/cpu-<ISO_TIMESTAMP>.cpuprofile`. Return `{ profilePath, durationMs }`.
- [ ] For memory profiling: Call `process.memoryUsage()` and return the values directly.
- [ ] Use a module-level `let profilerBusy = false` flag to prevent concurrent CPU profiling sessions; return the `PROFILER_BUSY` error if already active.
- [ ] Ensure `.devs/profiles/` directory is created with `fs.mkdir(..., { recursive: true })` before writing.
- [ ] Register the tool on the MCP server in `src/mcp/server.ts` (or its equivalent registration file) under the name `run_profiler` with an appropriate JSON Schema input validator that matches `RunProfilerParams`.
- [ ] Add a `// [2_TAS-REQ-010]` requirement tracing comment at the top of the implementation file.

## 3. Code Review

- [ ] Confirm the tool is registered in the MCP server's tool manifest and the tool name exactly matches `run_profiler` (snake_case).
- [ ] Verify no `any` types are used; all parameters and return types are explicitly declared.
- [ ] Verify the busy-lock is released in a `finally` block to prevent a stuck state if an error occurs mid-profile.
- [ ] Verify the profile output directory (`.devs/profiles/`) is within the project root and not a system path.
- [ ] Confirm that the `inspector` session is properly disconnected after stopping to avoid resource leaks.
- [ ] Check that the MCP handler wraps `runProfiler` in a `try/catch` and returns a valid `CallToolResult` with `isError: true` on failure rather than throwing.

## 4. Run Automated Tests to Verify

- [ ] Run `npm test -- --testPathPattern="run_profiler"` and confirm all unit and integration tests pass.
- [ ] Run the full test suite with `npm test` and confirm no regressions.
- [ ] Run TypeScript compiler check: `npx tsc --noEmit` and confirm zero type errors.

## 5. Update Documentation

- [ ] Create or update `src/mcp/tools/run_profiler.agent.md` documenting: tool name, accepted parameters, return schema, error codes (`PROFILER_BUSY`), and output file path convention.
- [ ] Update the MCP server's master tool registry documentation (`docs/mcp-tools.md` or equivalent) to add an entry for `run_profiler` with parameter schema and usage examples.
- [ ] Add a `// [2_TAS-REQ-010]` comment in the MCP server registration block for this tool.

## 6. Automated Verification

- [ ] Run `npm test -- --testPathPattern="run_profiler" --coverage` and verify the coverage report shows ≥ 90% line coverage for `src/mcp/tools/run_profiler.ts`.
- [ ] Run `npx tsc --noEmit` and verify exit code is `0`.
- [ ] Execute `node -e "require('./dist/mcp/tools/run_profiler').runProfiler({ type: 'memory' }).then(r => { if (!('heapUsed' in r)) process.exit(1); })"` (after build) to confirm the exported function is callable and returns the expected shape.
