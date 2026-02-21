# Task: Implement Immutable Raw Observation Capture & Redaction Pipeline (Sub-Epic: 11_Flight Recorder & Audit Logging)

## Covered Requirements
- [3_MCP-TAS-076], [5_SECURITY_DESIGN-REQ-SEC-SD-067]

## 1. Initial Test Written
- [ ] In `packages/core/src/flight-recorder/__tests__/observationCapture.test.ts`, write unit tests that:
  - Assert `captureObservation()` stores the **full, unsummarized** raw tool output in `agent_logs.reasoning_chain` — not a truncated or summarized version. Provide a synthetic tool output > 100 KB and assert the stored blob byte-length equals the original.
  - Assert that secret masking (`SecretMasker`) is applied **before** storage: inject a synthetic output containing a string matching the high-entropy pattern and assert the stored blob does not contain the original secret (contains `[REDACTED:<sha256-prefix>]` instead).
  - Assert that if `SecretMasker` fails (throws), `captureObservation()` propagates the error and does **not** store unredacted data.
  - Assert that the stored blob is not affected by the current LLM context window size — the function must persist the full blob regardless of any `MAX_CONTEXT_TOKENS` setting.
  - Assert that calling `captureObservation()` with a non-UTF-8 binary buffer (e.g., a PNG header) stores the blob without modification (no UTF-8 coercion).
- [ ] In `packages/core/src/flight-recorder/__tests__/observationCapture.integration.test.ts`, write an integration test that:
  - Uses an in-memory SQLite database.
  - Calls `captureObservation()` with a 500 KB synthetic tool output.
  - Reads the stored blob back from `agent_logs` and asserts byte-for-byte equality with the redacted input (after applying `SecretMasker`).

## 2. Task Implementation
- [ ] Create `packages/core/src/flight-recorder/observationCapture.ts` exporting:
  - `captureObservation(db: Database, rawOutput: Buffer | string, context: TurnContext, secretMasker: SecretMasker): Promise<void>`:
    - Converts `rawOutput` to `Buffer` if it is a string (UTF-8 encoding).
    - Passes the buffer through `secretMasker.redact(buffer): Buffer` to produce the redacted blob.
    - Calls `persistSaopTurn(db, { phase: 'OBSERVATION', payload: { rawObservation: redactedBuffer } }, context)` — reusing the persistence layer from Task 02.
    - Does **not** truncate or summarize at any stage.
    - Throws `FlightRecorderError` (from Task 02) if redaction or persistence fails.
  - `interface SecretMasker { redact(input: Buffer): Buffer; }` — define the interface here; the concrete `SecretMaskerImpl` lives in `@devs/core/security`.
- [ ] Update the `ToolProxy` in `packages/core/src/mcp/toolProxy.ts`: after receiving a raw tool response, call `captureObservation()` with the raw response buffer before forwarding the result to the agent.
- [ ] Add JSDoc on all exports referencing `[3_MCP-TAS-076]` and `[5_SECURITY_DESIGN-REQ-SEC-SD-067]`.

## 3. Code Review
- [ ] Confirm `captureObservation()` never calls `.slice()`, `.substring()`, `.truncate()`, or any length-limiting operation on the raw buffer.
- [ ] Confirm `SecretMasker.redact()` is called **before** the blob is passed to `persistSaopTurn()`.
- [ ] Confirm the `ToolProxy` integration calls `captureObservation()` before returning the tool result to the SAOP processor — not after.
- [ ] Confirm binary inputs (non-UTF-8 buffers) pass through without encoding errors by checking no `toString('utf8')` calls are made on the raw buffer before redaction.
- [ ] Confirm there is no in-memory caching or batching of observations — each observation is persisted immediately.

## 4. Run Automated Tests to Verify
- [ ] Run `pnpm --filter @devs/core test -- --testPathPattern="observationCapture"` and confirm all unit and integration tests pass with zero failures.
- [ ] Run `pnpm --filter @devs/core build` and confirm no TypeScript errors.

## 5. Update Documentation
- [ ] Update `docs/architecture/flight-recorder.md` with a section **Raw Observation Capture**: "Tool outputs are persisted in full binary form after redaction, without truncation or summarization. This ensures agents cannot misinterpret results due to context-window pruning."
- [ ] Add a note to `docs/security/secret-masking.md` clarifying that `SecretMasker` is invoked by the Flight Recorder before log persistence (refs `[5_SECURITY_DESIGN-REQ-SEC-SD-067]`).

## 6. Automated Verification
- [ ] Run `pnpm --filter @devs/core test:ci` and assert exit code is `0`.
- [ ] Run the large-payload integration test and assert the byte-length of the stored blob equals the byte-length of the redacted input: `expect(storedBlob.byteLength).toBe(redactedInput.byteLength)`.
- [ ] Confirm the `ToolProxy` wiring by running `grep -rn "captureObservation" packages/core/src/mcp/toolProxy.ts` and asserting at least one match exists.
