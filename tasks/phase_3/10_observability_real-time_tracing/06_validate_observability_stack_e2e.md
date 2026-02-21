# Task: Validate Full Observability Stack as MCP Differentiator (Integration Test Suite) (Sub-Epic: 10_Observability & Real-Time Tracing)

## Covered Requirements
- [8_RISKS-REQ-066], [TAS-003], [1_PRD-REQ-OBS-001], [1_PRD-REQ-OBS-003], [3_MCP-TAS-038], [4_USER_FEATURES-REQ-007], [1_PRD-REQ-NEED-DEVS-01], [TAS-065]

## 1. Initial Test Written

- [ ] In `packages/e2e/src/__tests__/observability-stack.e2e.test.ts`, write an end-to-end integration test suite that exercises the complete observability pipeline:
  - **Test: Full Trace Pipeline** — Start the `OrchestratorServer` in test mode. Connect an SSE client to `/trace/stream`. Simulate a complete agent turn by injecting a `SAOPEnvelope` of each type (thought, action, observation) via `TraceStreamBus.publish()`. Assert that:
    1. All 3 envelopes arrive at the SSE client in order within 500 ms.
    2. The `.devs/trace.log` file contains exactly 3 NDJSON lines after `FlightRecorder.flush()`.
    3. Each line in `trace.log` is valid JSON and passes `validateObservation()` or `validateSAOPEnvelope()` as appropriate.
  - **Test: Agent Console Semantic Annotation** — Connect an SSE client to `/agent-console/stream`. Publish one envelope of each type. Assert each received `AnnotatedEnvelope` has the correct `semantic_class` and `highlight_color`, confirming the Glass-Box Trace Streamer (`4_USER_FEATURES-REQ-007`) is functional.
  - **Test: ProjectServer Introspection Round-Trip** — Start a ProjectServer in a temp directory. Call `get_internal_state`, `get_logs`, and `get_profiling_data` tools via the MCP client. Assert each response passes `validateObservation()`. Assert `.devs/mcp-server.port` exists and contains a valid port number (integer 1024–65535).
  - **Test: Agent-to-Agent Trace Completeness** — Simulate a 5-turn agent loop. Assert that all 5×3 = 15 envelopes (one thought + one action + one observation per turn) appear in `.devs/trace.log` and are received by the SSE subscriber. Assert no duplicates (check `tool_call_id` uniqueness for action envelopes).
  - **Test: Observation Schema Compliance** — For every `observation`-type envelope received across all above tests, call `validateObservation()` on the parsed object and assert no `SchemaValidationError` is thrown. This validates `TAS-065` across the full stack.
  - **Test: MCP Debugging Superiority (Risk Mitigation)** — Assert that after completing the 5-turn loop, a test assistant agent can query `get_logs({ level: 'ERROR' })` and receive structured, filterable log data — demonstrating the MCP-native debugging superiority described in `8_RISKS-REQ-066`. Assert the response is non-empty if any errors were logged.

## 2. Task Implementation

- [ ] Create `packages/e2e/src/helpers/orchestrator-test-harness.ts`:
  - Export `startTestOrchestrator(): Promise<{ serverUrl: string; bus: TraceStreamBus; flightRecorder: FlightRecorder; stop: () => Promise<void> }>`.
  - Starts `OrchestratorServer` on a random port, returns the bus and recorder instances for test control.
- [ ] Create `packages/e2e/src/helpers/project-server-test-harness.ts`:
  - Export `startTestProjectServer(tmpDir: string): Promise<{ client: MCPClient; port: number; stop: () => Promise<void> }>`.
  - Creates a temp directory, starts a `ProjectServer`, reads `.devs/mcp-server.port`, connects an MCP client, and returns it.
- [ ] Create `packages/e2e/src/helpers/sse-client.ts`:
  - Export `connectSSE(url: string): Promise<{ events: SAOPEnvelope[]; close: () => void }>` using the `eventsource` npm package.
  - Accumulates received events in the `events` array for assertion.
- [ ] Wire all helpers into `packages/e2e/src/__tests__/observability-stack.e2e.test.ts` using Jest `beforeAll`/`afterAll` lifecycle hooks with a 30-second timeout.
- [ ] Add an `e2e` test script in `packages/e2e/package.json`: `"test:e2e:observability": "jest --testPathPattern=observability-stack.e2e --runInBand --forceExit"`.

## 3. Code Review

- [ ] Confirm each test is fully isolated: no shared state between tests; each test uses its own temp directory and server instance.
- [ ] Confirm test timeouts are set appropriately: SSE subscription tests use `jest.setTimeout(10_000)`, the full pipeline test uses `jest.setTimeout(30_000)`.
- [ ] Confirm the test suite calls `stop()` in `afterAll` to cleanly shut down all server processes (prevent dangling processes from interfering with CI).
- [ ] Confirm that `validateObservation()` is imported from `@devs/core/protocol` (not reimplemented inline), ensuring the e2e test validates the same schema as unit tests.
- [ ] Confirm the e2e test imports are done using package names (`@devs/mcp-orchestrator`, `@devs/core`, `@devs/project-server-template`), not relative paths crossing package boundaries.

## 4. Run Automated Tests to Verify

- [ ] Run `pnpm --filter @devs/e2e test:e2e:observability` and confirm all tests pass with exit code 0.
- [ ] Confirm the test run completes within 60 seconds total.

## 5. Update Documentation

- [ ] In `docs/agent-memory/observability.md`, add a section "Observability Stack Validation" noting that the full pipeline (FlightRecorder → TraceStreamBus → SSE Stream → AgentConsolePipeline → ProjectServer tools) is validated by the e2e test suite at `packages/e2e/src/__tests__/observability-stack.e2e.test.ts`.
- [ ] In `docs/agent-memory/protocol-decisions.md`, add an entry confirming that `8_RISKS-REQ-066` (MCP as a differentiator for agentic observability) is validated by the integration test's "MCP Debugging Superiority" test case, not just claimed.
- [ ] Update `docs/agent-memory/requirements-coverage.md` (create if absent) with a table mapping each requirement ID covered in this Sub-Epic to the file(s) that implement and test it:
  | Requirement | Implementation | Test |
  |---|---|---|
  | TAS-065 | `packages/core/src/protocol/observation.ts` | `observation.schema.test.ts`, `observability-stack.e2e.test.ts` |
  | 1_PRD-REQ-OBS-003 | `packages/core/src/observability/flight-recorder.ts` | `flight-recorder.test.ts` |
  | 1_PRD-REQ-NEED-DEVS-01 | `FlightRecorder` + `TraceStreamBus` | `observability-stack.e2e.test.ts` |
  | 3_MCP-TAS-038 | `packages/mcp-orchestrator/src/trace/trace-stream-router.ts` | `trace-stream.test.ts` |
  | 4_USER_FEATURES-REQ-007 | `packages/mcp-orchestrator/src/agent-console/` | `agent-console-pipeline.test.ts` |
  | TAS-003 | `packages/project-server-template/src/tools/` | `observability-tools.test.ts` |
  | 1_PRD-REQ-OBS-001 | `packages/project-server-template/src/server.ts` | `observability-tools.test.ts` |
  | 8_RISKS-REQ-066 | All of the above (full stack) | `observability-stack.e2e.test.ts` |

## 6. Automated Verification

- [ ] In CI (`.github/workflows/ci.yml` or equivalent), ensure the step `pnpm --filter @devs/e2e test:e2e:observability` is added to the build pipeline and is required to pass before merge.
- [ ] Run the following assertion script after the e2e suite completes in CI to confirm the trace log is never empty:
  ```bash
  node -e "
  const fs = require('fs');
  const log = fs.readFileSync('.devs/trace.log', 'utf8').trim();
  const lines = log.split('\n').filter(Boolean);
  console.assert(lines.length >= 15, 'Expected at least 15 trace entries, got ' + lines.length);
  lines.forEach((l, i) => {
    try { JSON.parse(l); } catch (e) { throw new Error('Invalid JSON at line ' + (i+1) + ': ' + l); }
  });
  console.log('VERIFICATION PASS: ' + lines.length + ' trace entries found.');
  "
  ```
