# Task: Build the Glass-Box Agent Console Backend Data Pipeline (Sub-Epic: 10_Observability & Real-Time Tracing)

## Covered Requirements
- [4_USER_FEATURES-REQ-007], [1_PRD-REQ-NEED-DEVS-01], [3_MCP-TAS-038]

## 1. Initial Test Written

- [ ] In `packages/mcp-orchestrator/src/__tests__/agent-console-pipeline.test.ts`, write unit and integration tests:
  - Test that `classifyEnvelope(envelope: SAOPEnvelope): EnvelopeClass` returns `"thought"` for `type === "thought"`, `"action"` for `type === "action"`, and `"observation"` for `type === "observation"`.
  - Test that `annotateEnvelope(envelope, classification)` returns an `AnnotatedEnvelope` with field `semantic_class` set to the classification and `highlight_color` set to the correct hex value (`"#A8D8EA"` for thought, `"#F9E4B7"` for action, `"#B7F9C3"` for observation) as defined in the UI/UX design spec.
  - Test that `AgentConsolePipeline.process(envelope)` calls `classifyEnvelope` and `annotateEnvelope` in sequence and emits an `'annotated'` event with the resulting `AnnotatedEnvelope`.
  - Test that the pipeline is wired to `TraceStreamBus`: when `TraceStreamBus.publish(envelope)` is called, `AgentConsolePipeline` receives and processes the envelope automatically.
  - Test that an envelope with `type === "thought"` and `payload.analysis.reasoning_chain` present has the `reasoning_chain` extracted and placed in `AnnotatedEnvelope.display.summary` (truncated to 280 characters for the console summary line).
  - Test that `AgentConsolePipeline` drops envelopes with an unrecognized `type` field, logging a `WARN` level message without throwing.
  - Test that if `annotateEnvelope` is called with an envelope missing `timestamp_ns`, it throws an `EnvelopeAnnotationError`.

## 2. Task Implementation

- [ ] Create `packages/mcp-orchestrator/src/agent-console/envelope-classifier.ts`:
  - Define `EnvelopeClass = "thought" | "action" | "observation" | "unknown"`.
  - Implement `classifyEnvelope(envelope: SAOPEnvelope): EnvelopeClass`: switch on `envelope.type`, return `"unknown"` for unrecognized types.
- [ ] Create `packages/mcp-orchestrator/src/agent-console/envelope-annotator.ts`:
  - Define `AnnotatedEnvelope` interface extending `SAOPEnvelope` with:
    ```typescript
    semantic_class: EnvelopeClass;
    highlight_color: string;  // hex color string
    display: {
      summary: string;        // ≤ 280 chars extracted from payload
      icon: string;           // emoji: "💭" thought, "⚡" action, "👁️" observation
    };
    ```
  - Implement `annotateEnvelope(envelope: SAOPEnvelope, cls: EnvelopeClass): AnnotatedEnvelope`:
    - Map `EnvelopeClass` to `highlight_color` using a `const` color map.
    - Extract `display.summary` from `payload.analysis.reasoning_chain` (thought), `payload.tool_call.tool_name` + arguments summary (action), or `payload.result.stdout` first 280 chars (observation).
    - Throw `EnvelopeAnnotationError` if `envelope.timestamp_ns` is absent.
  - Export `EnvelopeAnnotationError` extending `Error`.
- [ ] Create `packages/mcp-orchestrator/src/agent-console/agent-console-pipeline.ts`:
  - Implement `AgentConsolePipeline` extending `EventEmitter`.
  - In constructor, subscribe to `TraceStreamBus` via `subscribe()`. On each envelope:
    - Classify with `classifyEnvelope`.
    - If `EnvelopeClass === "unknown"`, log warning and return.
    - Annotate with `annotateEnvelope`.
    - Emit `'annotated'` event with `AnnotatedEnvelope`.
  - Export `getAgentConsolePipeline(): AgentConsolePipeline` singleton factory.
- [ ] Register `GET /agent-console/stream` SSE endpoint in `packages/mcp-orchestrator/src/server.ts`:
  - Subscribe to `AgentConsolePipeline` `'annotated'` events.
  - Stream `AnnotatedEnvelope` objects as `data: ${JSON.stringify(annotated)}\n\n` to connected VSCode Extension clients.
  - Apply the same auth guard and heartbeat as the `/trace/stream` endpoint.

## 3. Code Review

- [ ] Verify that `highlight_color` values are hardcoded from the UI/UX design spec in `specs/6_uiux_design.md` (or `specs/7_uiux_design.md`), not invented arbitrarily.
- [ ] Verify that `display.summary` truncation uses `substring(0, 280)` and does not cut in the middle of a Unicode surrogate pair (use `Intl.Segmenter` or similar safe truncation).
- [ ] Verify `AgentConsolePipeline` unsubscribes from `TraceStreamBus` on `close()` to prevent listener leaks.
- [ ] Verify the pipeline does not perform any async I/O itself — all I/O is delegated to `FlightRecorder` via `TraceStreamBus.publish`.
- [ ] Verify that the `/agent-console/stream` and `/trace/stream` endpoints are distinct and independently consumable (the console stream delivers richer annotated data; the raw stream delivers raw SAOP envelopes).

## 4. Run Automated Tests to Verify

- [ ] Run `pnpm --filter @devs/mcp-orchestrator test -- --testPathPattern=agent-console-pipeline` and confirm all tests pass with exit code 0.
- [ ] Run `pnpm --filter @devs/mcp-orchestrator tsc --noEmit` to confirm no TypeScript compile errors.

## 5. Update Documentation

- [ ] In `docs/agent-memory/observability.md`, add a section "Agent Console Pipeline":
  - Document `AnnotatedEnvelope` fields.
  - Document the `/agent-console/stream` SSE endpoint and how the VSCode Extension should render `semantic_class` and `highlight_color`.
  - Note that `4_USER_FEATURES-REQ-007` (Glass-Box Trace Streamer with SAOP semantic highlighting) is satisfied by this component.
- [ ] In `specs/6_uiux_design.md` or a companion document, record the agreed highlight colors (thought: `#A8D8EA`, action: `#F9E4B7`, observation: `#B7F9C3`) so they are the single source of truth.

## 6. Automated Verification

- [ ] Run `pnpm --filter @devs/mcp-orchestrator test -- --coverage --testPathPattern=agent-console-pipeline` and assert line coverage ≥ 90% for all files in `packages/mcp-orchestrator/src/agent-console/`.
- [ ] Run the following end-to-end check script and confirm it prints `ANNOTATED` before timeout:
  ```bash
  node -e "
  const {getAgentConsolePipeline} = require('./packages/mcp-orchestrator/dist/agent-console/agent-console-pipeline');
  const {getTraceStreamBus} = require('./packages/mcp-orchestrator/dist/trace/trace-stream-bus');
  const pipeline = getAgentConsolePipeline();
  pipeline.once('annotated', (a) => {
    console.assert(a.semantic_class === 'thought', 'Wrong class');
    console.assert(a.highlight_color === '#A8D8EA', 'Wrong color');
    console.log('ANNOTATED');
    process.exit(0);
  });
  getTraceStreamBus().publish({type:'thought', turn_index:1, payload:{analysis:{reasoning_chain:'hello world'}}, timestamp_ns:'123456789'});
  setTimeout(() => { console.error('TIMEOUT'); process.exit(1); }, 1000);
  "
  ```
