# Task: Expose Drift Investigation MCP Tool and Run Baseline Spike (Sub-Epic: 15_Long_Term_Memory_Drift_Investigation)

## Covered Requirements
- [9_ROADMAP-SPIKE-002]

## 1. Initial Test Written
- [ ] Create `packages/mcp-server/src/tools/__tests__/driftInvestigateTool.spec.ts`.
- [ ] Mock `DriftHarness` and `DriftReportStore`.
- [ ] Write a test asserting that calling the MCP tool `memory/drift_investigate` with `{ iterations: 10, querySet: ["q1"] }` returns a `CallToolResult` with `content[0].type === 'text'` and the text containing `"firstDegradationIteration"`.
- [ ] Write a test asserting that if `DriftHarness.run()` throws, the MCP tool returns `{ isError: true }` with the error message in `content[0].text`.
- [ ] Write a test asserting that the tool's input schema validates that `iterations` is a positive integer and `querySet` is a non-empty array of strings; invalid input returns `{ isError: true }`.
- [ ] Create `packages/memory/src/drift/__tests__/baselineSpike.spec.ts` (integration test, tagged `@slow`).
- [ ] Write an integration test that runs `DriftHarness` against a real temporary LanceDB directory with 3 iterations, 10 synthetic entries, and asserts the returned `DriftReport` is structurally valid (correct field types, `noiseRatioByIteration.length === 3`).

## 2. Task Implementation
- [ ] Create `packages/mcp-server/src/tools/driftInvestigateTool.ts`:
  - Register tool name: `memory/drift_investigate`.
  - Input schema (JSON Schema):
    ```json
    {
      "type": "object",
      "properties": {
        "iterations":       { "type": "integer", "minimum": 1 },
        "querySet":         { "type": "array", "items": { "type": "string" }, "minItems": 1 },
        "noiseThreshold":   { "type": "number", "minimum": 0, "maximum": 1 },
        "noiseStrategy":    { "type": "string", "enum": ["gaussian", "random_replace", "semantic_shuffle"] },
        "syntheticEntries": { "type": "integer", "minimum": 1 }
      },
      "required": ["iterations", "querySet"]
    }
    ```
  - Handler:
    1. Resolve `.devs/memory.lancedb` from the server's project root.
    2. Instantiate `DriftHarness` and call `run()`.
    3. Persist via `DriftReportStore`.
    4. Return `CallToolResult` with a JSON-formatted summary of `DriftReport`.
    5. On error, return `{ isError: true, content: [{ type: 'text', text: err.message }] }`.
- [ ] Register the tool in `packages/mcp-server/src/tools/index.ts`.
- [ ] Create `scripts/run_drift_baseline_spike.ts`:
  - A standalone script (run with `pnpm tsx scripts/run_drift_baseline_spike.ts`) that:
    1. Runs `DriftHarness` with `{ iterations: 50, syntheticEntries: 200, querySet: BASELINE_QUERIES }` against the local `.devs/memory.lancedb`.
    2. Writes the `DriftReport` JSON to `docs/spike_results/drift_baseline_YYYYMMDD.json`.
    3. Prints a markdown-formatted summary table to stdout.
  - Define `BASELINE_QUERIES` as a constant array of 10 representative queries derived from TAS and PRD content (e.g., `"What is the tiered memory strategy?"`, `"Context pruning threshold"`).

## 3. Code Review
- [ ] Verify the MCP tool handler never imports LanceDB or embedding SDK directly — it must delegate entirely to `DriftHarness`.
- [ ] Verify the `scripts/run_drift_baseline_spike.ts` script does not share any state with the MCP server process.
- [ ] Verify the tool is listed in `packages/mcp-server/README.md`'s tool catalogue with its input schema and description.
- [ ] Verify that `isError: true` responses include the full stack trace in development mode (`NODE_ENV !== 'production'`) but only the message in production.

## 4. Run Automated Tests to Verify
- [ ] Run `pnpm --filter @devs/mcp-server test -- --testPathPattern=driftInvestigateTool` and confirm all unit tests pass.
- [ ] Run `pnpm --filter @devs/memory test -- --testPathPattern=baselineSpike --testNamePattern="@slow"` and confirm the integration test passes against a real temporary LanceDB.

## 5. Update Documentation
- [ ] Add `memory/drift_investigate` to the MCP tool catalogue in `packages/mcp-server/README.md` with input schema, output format, and error handling notes.
- [ ] Commit the output of `scripts/run_drift_baseline_spike.ts` as `docs/spike_results/drift_baseline_initial.json` to serve as the reference baseline for future regression comparisons.
- [ ] Update `docs/architecture/memory.md` with a `## Long-Term Memory Drift Spike Findings` section summarizing the `firstDegradationIteration` from the baseline run and recommended `noiseThreshold` value.

## 6. Automated Verification
- [ ] Run `pnpm --filter @devs/mcp-server test --coverage -- --testPathPattern=driftInvestigateTool` and confirm coverage ≥ 85% for `driftInvestigateTool.ts`.
- [ ] Run `pnpm --filter @devs/mcp-server tsc --noEmit` and confirm zero TypeScript errors.
- [ ] Verify `docs/spike_results/drift_baseline_initial.json` exists and is valid JSON: `node -e "JSON.parse(require('fs').readFileSync('docs/spike_results/drift_baseline_initial.json','utf8'))"`.
