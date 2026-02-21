# Task: ToolProxy Stream Integration (Sub-Epic: 09_SecretMasker Middleware Core)

## Covered Requirements
- [5_SECURITY_DESIGN-REQ-SEC-STR-004], [5_SECURITY_DESIGN-REQ-SEC-SD-049], [3_MCP-TAS-023]

## 1. Initial Test Written

- [ ] Create `packages/secret-masker/src/__tests__/mask-stream.test.ts` testing the `maskStream()` method.
- [ ] Test that a `Readable` stream containing `"api_key=AKIAIOSFODNN7EXAMPLE00000\n"` piped through `masker.maskStream(readable)` emits chunks where the secret is replaced with `[REDACTED]` in the output.
- [ ] Test that a multi-chunk stream (a secret split across two chunks, e.g., `"api_key=AKIA"` then `"IOSFODNN7EXAMPLE00000"`) is buffered and correctly redacted (the full secret is present in the joined buffer before redaction is applied).
- [ ] Test that a stream with no secrets passes through unchanged (output equals input).
- [ ] Test that the stream `Transform` emits a `redaction` event for each `IRedactionHit` found, so callers can log hits without reading the masked output.
- [ ] Create `packages/tool-proxy/src/__tests__/ToolProxy.secretmasker.test.ts` (or the equivalent integration test file):
  - Mock a sandbox tool call that returns stdout containing `"Bearer ghp_realtoken1234567890123456789012"`.
  - Assert the `ToolProxy` result received by the caller has the token replaced with `[REDACTED]`.
  - Assert the raw stdout value is never stored in the SQLite `tool_calls` table unredacted.
- [ ] All tests MUST fail initially.

## 2. Task Implementation

- [ ] Implement `SecretMasker.maskStream(stream: NodeJS.ReadableStream): NodeJS.ReadableStream` in `packages/secret-masker/src/SecretMasker.ts`:
  - Create a `Transform` stream.
  - Buffer incoming chunks (append each chunk to an internal `Buffer`).
  - On each chunk, apply a "line-aware flush" strategy: flush and redact all complete lines (ending with `\n`), hold any partial last line in the buffer until the next chunk or `flush`.
  - On stream `end` / `flush`, redact any remaining buffered content and push it.
  - Emit a custom `'redaction'` event on the Transform for each `IRedactionHit` found during processing.
- [ ] Locate the `ToolProxy` class in `packages/orchestrator/src/ToolProxy.ts` (or the equivalent path established in Phase 2 architecture). Import `SecretMaskerFactory` from `@devs/secret-masker`.
- [ ] In `ToolProxy`, instantiate a single `ISecretMasker` at construction time: `private readonly masker = SecretMaskerFactory.create()`.
- [ ] In the `ToolProxy` method that executes a sandbox tool and returns its stdout/stderr:
  - Pipe sandbox stdout through `this.masker.maskStream(sandboxStdout)` before returning or forwarding to the LLM.
  - Pipe sandbox stderr through a separate `this.masker.maskStream(sandboxStderr)` call.
  - Log all `redaction` events emitted by the masked streams to the security alert table with fields `{ timestamp, pipelineStage: 'tool-proxy-stdout' | 'tool-proxy-stderr', hitCount, patterns }`.
- [ ] Ensure `ToolProxy` never stores the raw (unmasked) stream content in any variable beyond the Transform pipeline.
- [ ] Add `@devs/secret-masker` to `packages/orchestrator/package.json` dependencies.

## 3. Code Review

- [ ] Verify `ToolProxy` holds exactly one `ISecretMasker` instance (singleton per `ToolProxy` instance) to avoid re-initializing the pattern library on every tool call.
- [ ] Verify the `Transform` stream in `maskStream()` correctly handles backpressure (does not accumulate unbounded memory for very large streams).
- [ ] Confirm that the `maskStream()` line-buffer strategy guarantees that no secret spanning a chunk boundary escapes redaction.
- [ ] Confirm no redaction hits are logged with the actual secret value — the log record MUST contain only `{ pattern, position, replacedWith: '[REDACTED]' }`, NOT the original `matchedValue`.
- [ ] Verify that `ToolProxy` integration does not break existing tool-call tests (check existing test suite passes).

## 4. Run Automated Tests to Verify

- [ ] Run `pnpm --filter @devs/secret-masker test -- --testPathPattern=mask-stream` and confirm all stream tests pass.
- [ ] Run `pnpm --filter @devs/orchestrator test -- --testPathPattern=ToolProxy.secretmasker` and confirm all integration tests pass.
- [ ] Run `pnpm --filter @devs/orchestrator test` to confirm no regressions in the broader ToolProxy test suite.

## 5. Update Documentation

- [ ] Update `packages/secret-masker/.agent.md`:
  - Add a "Stream Integration" section explaining the line-aware buffering strategy and the `redaction` event API.
  - Note: callers SHOULD subscribe to the `redaction` event to record security audit hits.
- [ ] Update `packages/orchestrator/.agent.md` (or equivalent):
  - Document that `ToolProxy` applies `SecretMasker` to both stdout and stderr of every sandbox tool call.
  - Add an "Agentic Hook" entry: "Redaction events are emitted on the masked stream and logged to the `security_alerts` table."

## 6. Automated Verification

- [ ] Run `pnpm --filter @devs/secret-masker test --coverage` and assert exit code `0`.
- [ ] Run `pnpm --filter @devs/orchestrator test --coverage` and assert exit code `0`.
- [ ] Run the following stream smoke-test and assert `PASS`:
  ```bash
  node -e "
  const {Readable} = require('stream');
  const {SecretMaskerFactory} = require('./packages/secret-masker/dist');
  const masker = SecretMaskerFactory.create();
  const input = Readable.from(['Bearer ghp_ABCDEFGHIJKLMNOPQRSTUVWXYZ123456\n']);
  const out = masker.maskStream(input);
  let result = '';
  out.on('data', d => result += d);
  out.on('end', () => console.log(!result.includes('ghp_') && result.includes('[REDACTED]') ? 'PASS' : 'FAIL: ' + result));
  "
  ```
