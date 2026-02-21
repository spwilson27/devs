# Task: Implement Non-UTF8 Tool Output Sanitization for MCP Protocol Safety (Sub-Epic: 15_Risk Mitigations & Resilience)

## Covered Requirements
- [RISK-801]

## 1. Initial Test Written
- [ ] In `packages/core/src/protocol/__tests__/output-sanitizer.test.ts`, write unit tests for `OutputSanitizer`:
  - Test `sanitize(raw: Buffer): string` with a pure ASCII input — assert output equals the decoded UTF-8 string unchanged.
  - Test with a valid UTF-8 multi-byte sequence (e.g., `\xE2\x82\xAC` = €) — assert output preserves the character correctly.
  - Test with an invalid UTF-8 byte sequence (e.g., lone `\xFF` byte) — assert output replaces the invalid bytes with the Unicode replacement character `\uFFFD` (or configurable replacement string) and does NOT throw.
  - Test with a null byte (`\x00`) embedded in output — assert the null byte is stripped or replaced, and the resulting string is valid JSON-serializable.
  - Test with a mix of valid UTF-8 and binary garbage — assert only the invalid portions are replaced.
  - Test with a zero-length buffer — assert an empty string is returned.
  - Test with output exceeding `config.mcp.maxToolOutputBytes` (default 10 MB) — assert the output is truncated at the byte boundary with a `[TRUNCATED]` sentinel appended, and a warning is emitted to the structured logger.
  - Test `OutputSanitizer.isSafeForJSON(str: string): boolean` — assert `false` for strings containing lone surrogates or control characters that would break JSON serialization, `true` for clean strings.
- [ ] In `packages/core/src/protocol/__tests__/tool-proxy.test.ts`, add integration tests:
  - Mock a sandbox tool that returns a `Buffer` containing `\xFF\xFE` (BOM + binary) bytes. Assert that `ToolProxy` successfully wraps the result in a `SAOPEnvelope` `Observation` without throwing a JSON serialization error.
  - Assert that the `Observation.content` field in the envelope is a valid UTF-8 string (passes `JSON.stringify` without error).

## 2. Task Implementation
- [ ] Implement `packages/core/src/protocol/output-sanitizer.ts`:
  - `class OutputSanitizer` with constructor `(config: OutputSanitizerConfig)`.
  - `sanitize(raw: Buffer | string): string`:
    1. If input is a `string`, convert to `Buffer` via `Buffer.from(input, 'binary')`.
    2. Use Node.js `TextDecoder` with `{ fatal: false }` to decode the buffer as UTF-8 — this automatically replaces invalid sequences with `\uFFFD`.
    3. Strip null bytes (`\x00`) using a regex replace.
    4. If resulting string byte-length exceeds `config.mcp.maxToolOutputBytes`, truncate at the nearest valid UTF-8 character boundary and append `\n[OUTPUT TRUNCATED — exceeded maxToolOutputBytes limit]`.
    5. Return the sanitized string.
  - `isSafeForJSON(str: string): boolean` — returns `false` if the string contains lone surrogates (`\uD800`–`\uDFFF` not paired) detected via a regex.
  - Export singleton factory `createOutputSanitizer(config: DevsCoreConfig): OutputSanitizer`.
- [ ] Add `OutputSanitizerConfig` to `packages/core/src/config/schema.ts`:
  ```ts
  mcp: {
    maxToolOutputBytes: number;  // default: 10_485_760 (10 MB)
  }
  ```
- [ ] Update `packages/core/src/protocol/tool-proxy.ts`:
  - Inject `OutputSanitizer` dependency into `ToolProxy` constructor.
  - In the tool execution result handler, wrap the raw output (which may be a `Buffer` or arbitrary string from the sandbox) with `outputSanitizer.sanitize(raw)` before placing it in the `Observation.content` field.
  - If `!outputSanitizer.isSafeForJSON(sanitized)`, log a structured warning via the `StructuredLogger` (including `tool_name`, `task_id`, `turn_index`) and apply an additional pass replacing lone surrogates with `\uFFFD`.
- [ ] Register `OutputSanitizer` in the DI container in `packages/core/src/container.ts` as a singleton, bound to `IOutputSanitizer` token.
- [ ] Export `OutputSanitizer`, `createOutputSanitizer`, and `IOutputSanitizer` from `packages/core/src/index.ts`.

## 3. Code Review
- [ ] Confirm `TextDecoder` is instantiated with `{ fatal: false }` — `fatal: true` would throw on bad bytes, which is the failure mode we are preventing.
- [ ] Verify that `sanitize()` never throws under any input (fuzz-test the function with random `Buffer` contents in tests).
- [ ] Confirm truncation always occurs at a valid UTF-8 character boundary (not mid-codepoint) to avoid introducing new invalid sequences after truncation.
- [ ] Verify that `ToolProxy` does not call `JSON.stringify` on raw `Buffer` objects directly anywhere — all tool outputs must pass through `OutputSanitizer.sanitize()` first.
- [ ] Confirm the `[OUTPUT TRUNCATED]` sentinel is appended as a plain ASCII string so it is always safely embeddable in JSON without further escaping.
- [ ] Ensure the `OutputSanitizer` has no coupling to `OrchestratorServer` or `LogArchiver`; it is a pure utility class.

## 4. Run Automated Tests to Verify
- [ ] Run `pnpm --filter @devs/core test -- --testPathPattern="output-sanitizer"` and confirm all tests pass with zero failures.
- [ ] Run `pnpm --filter @devs/core test -- --testPathPattern="tool-proxy"` and confirm integration tests pass.
- [ ] Run the full core test suite `pnpm --filter @devs/core test` to confirm no regressions.

## 5. Update Documentation
- [ ] Create `packages/core/src/protocol/output-sanitizer.agent.md` documenting: the sanitization pipeline (invalid UTF-8 replacement → null-byte removal → truncation), the `isSafeForJSON` contract, configuration keys, and how the sentinel string appears in logs.
- [ ] Update `packages/core/src/protocol/tool-proxy.agent.md` to document the `OutputSanitizer` injection point and the warning log format for non-safe JSON output.
- [ ] Add an entry to `.devs/memory/phase_3_decisions.md`: "Non-UTF8 mitigation: all tool outputs routed through `OutputSanitizer.sanitize()` in `ToolProxy` before JSON serialization; uses `TextDecoder { fatal: false }` for replacement; outputs exceeding `maxToolOutputBytes` are truncated with a sentinel."

## 6. Automated Verification
- [ ] Run `pnpm --filter @devs/core test -- --testPathPattern="output-sanitizer" --coverage` and assert line coverage ≥ 90% for `output-sanitizer.ts`.
- [ ] Run `pnpm --filter @devs/core build` and assert exit code 0 (no TypeScript compilation errors).
- [ ] Execute a fuzz verification script: `node -e "const {createOutputSanitizer} = require('./packages/core/dist'); const s = createOutputSanitizer({mcp:{maxToolOutputBytes:1048576}}); for(let i=0;i<1000;i++){const buf=Buffer.from(Array.from({length:64},()=>Math.floor(Math.random()*256))); const out=s.sanitize(buf); JSON.stringify(out);} console.log('fuzz OK')"` and assert it prints `fuzz OK` with exit code 0.
