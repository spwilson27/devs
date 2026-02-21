# Task: Implement ProjectServer Profiling MCP Tool for Flamegraph and Heap Data (Sub-Epic: 09_System Health and Performance Profiling)

## Covered Requirements
- [7_UI_UX_DESIGN-REQ-UI-DES-111-1]
- [7_UI_UX_DESIGN-REQ-UI-DES-111-2]

## 1. Initial Test Written

- [ ] In `packages/mcp-server/src/__tests__/ProfilingTool.test.ts`, write unit and integration tests for the `ProjectServer` profiling tools:
  - Test `startCpuProfiling(durationMs: number)` MCP tool: mock `v8-profiler-next` (or Node's `--prof` inspector API); assert the tool starts a CPU profile session and returns `{ profileId: string }`.
  - Test `stopCpuProfiling(profileId: string)` MCP tool: assert it resolves the profile and returns a `CpuProfilePayload` object containing `{ nodes: ProfileNode[], startTime: number, endTime: number }` conforming to the Chrome DevTools Protocol (CDP) CPU profile schema.
  - Test `takeHeapSnapshot()` MCP tool: mock `v8.writeHeapSnapshot()` or the `inspector` session; assert it returns a `HeapSnapshotPayload` object with `{ nodes: HeapNode[], edges: HeapEdge[], strings: string[] }` conforming to the CDP heap snapshot schema.
  - Test error cases: if profiling is already in progress, `startCpuProfiling` should reject with `{ error: "Profiling already in progress" }`.
  - Test that returned payloads are serializable to JSON without circular references.
  - Use `jest.mock` to stub native profiling modules.

## 2. Task Implementation

- [ ] In `packages/mcp-server/src/tools/ProfilingTool.ts`, implement two MCP tool handlers:
  - **`devs/startCpuProfiling`**: 
    - Accept parameter `{ durationMs: number }` (max 30000ms, enforced with validation).
    - Use Node.js `inspector` module (`require('inspector')`) to open a session, enable the Profiler domain, and call `Profiler.start`.
    - After `durationMs` elapses, call `Profiler.stop`, retrieve the `CPUProfile`, and close the inspector session.
    - Return the profile as a `CpuProfilePayload` JSON object.
    - Guard against concurrent invocations with a `profilingInProgress` flag.
  - **`devs/takeHeapSnapshot`**:
    - Use Node.js `v8.writeHeapSnapshot(filepath)` to write a `.heapsnapshot` file to a temp directory.
    - Parse the resulting JSON file into a `HeapSnapshotPayload` object.
    - Return the parsed object as the MCP tool response.
    - Clean up the temp file after reading.
- [ ] Register both tools in the `ProjectServer` MCP server's tool registry (`packages/mcp-server/src/server.ts`).
- [ ] Define and export `CpuProfilePayload` and `HeapSnapshotPayload` types in `packages/mcp-server/src/types/profiling.ts`.
- [ ] Emit `system.profiling.cpuProfileReady` and `system.profiling.heapSnapshotReady` events on the RTES `EventBus` after each successful profiling operation (so the UI can react).

## 3. Code Review

- [ ] Confirm profiling operations execute asynchronously and do not block the MCP server's main event loop.
- [ ] Confirm `durationMs` is validated with a max cap (30000ms) to prevent runaway profiling sessions that exhaust memory.
- [ ] Confirm the `profilingInProgress` guard is thread-safe within Node.js's single-threaded event loop (a simple boolean flag is sufficient).
- [ ] Confirm temp heap snapshot files are always cleaned up in a `finally` block, even on error.
- [ ] Confirm returned payloads strictly conform to the CDP schema so the UI flamegraph and treemap libraries can consume them directly.

## 4. Run Automated Tests to Verify

- [ ] Run `pnpm --filter @devs/mcp-server test -- --testPathPattern="ProfilingTool"` and confirm all tests pass.
- [ ] Run `pnpm --filter @devs/mcp-server test -- --coverage --testPathPattern="ProfilingTool"` and confirm line/branch coverage ≥ 90%.

## 5. Update Documentation

- [ ] Add JSDoc to both MCP tool handler functions describing parameters, return payload schema, and error states.
- [ ] Update `packages/mcp-server/README.md` to document `devs/startCpuProfiling` and `devs/takeHeapSnapshot` tools with request/response examples.
- [ ] Update `docs/agent_memory/phase_12_decisions.md`: "Profiling tools use Node.js `inspector` (CPU) and `v8.writeHeapSnapshot` (heap). Payloads are CDP-schema-compatible JSON. Max CPU profile duration: 30s. Heap snapshot temp files are cleaned up in `finally`."

## 6. Automated Verification

- [ ] CI runs `pnpm --filter @devs/mcp-server test -- --ci --testPathPattern="ProfilingTool"` and exits code 0.
- [ ] Confirm `pnpm --filter @devs/mcp-server build` compiles with zero TypeScript errors.
- [ ] Validate that the MCP server tool registry lists `devs/startCpuProfiling` and `devs/takeHeapSnapshot` by running a script: `node -e "const s = require('./dist/server'); console.log(JSON.stringify(s.listTools()))"` and asserting both tool names appear in the output.
