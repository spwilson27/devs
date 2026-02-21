# Task: Implement Non-UTF8 Tool Output Sanitization to Prevent JSON Protocol Crashes (Sub-Epic: 17_Infrastructure Risk Mitigation)

## Covered Requirements
- [RISK-801]

## 1. Initial Test Written
- [ ] Create `src/sandbox/__tests__/outputSanitizer.test.ts` with Vitest.
- [ ] Write a unit test `sanitize_passesCleanUtf8Unchanged` providing a valid UTF-8 string and asserting `sanitizeToolOutput(input)` returns the identical string.
- [ ] Write a unit test `sanitize_stripsNullBytes` providing a string containing `\x00` characters and asserting they are replaced with the replacement character `\uFFFD` or removed entirely (per implementation choice—document in code).
- [ ] Write a unit test `sanitize_handlesBinaryBlob` providing a `Buffer` containing arbitrary bytes (including values > 127 with invalid UTF-8 sequences) and asserting the output is a valid UTF-8 string with no JSON-breaking characters.
- [ ] Write a unit test `sanitize_truncatesOversizedOutput` providing a string exceeding `MAX_TOOL_OUTPUT_BYTES` (default 512 KB) and asserting the output is truncated with a sentinel suffix `[TRUNCATED: original_bytes=N]`.
- [ ] Write a unit test `sanitize_escapesControlCharacters` providing strings with ASCII control codes (`\x01`–`\x1F` except `\t`, `\n`, `\r`) and asserting they are replaced so the result is safe for `JSON.stringify`.
- [ ] Write an integration test `sandboxExecutor_wrapsAllOutputThroughSanitizer` using a mock child process that emits binary output and asserting the `Observation` object returned to the agent has a `content` field that passes `JSON.parse(JSON.stringify(content))` without throwing.

## 2. Task Implementation
- [ ] Create `src/sandbox/outputSanitizer.ts` exporting:
  - `sanitizeToolOutput(raw: Buffer | string, opts?: SanitizeOptions): string`
    - Convert `Buffer` → string using `raw.toString('utf8', ...)` with replacement character mode.
    - Strip null bytes (`\x00`).
    - Replace non-printable control characters (except `\t`, `\n`, `\r`) with `\uFFFD`.
    - If length in bytes exceeds `opts.maxBytes ?? MAX_TOOL_OUTPUT_BYTES`, truncate and append `[TRUNCATED: original_bytes=N]`.
    - Return a string guaranteed to be valid UTF-8 and free of JSON-unsafe characters.
  - Export constant `MAX_TOOL_OUTPUT_BYTES = 524288` (512 KB).
- [ ] Create `src/sandbox/SanitizeOptions` type: `{ maxBytes?: number; replacementChar?: string }`.
- [ ] Integrate `sanitizeToolOutput` into `src/sandbox/sandboxExecutor.ts`:
  - Wrap both `stdout` and `stderr` chunks from child process `data` events through `sanitizeToolOutput` before concatenation.
  - Apply sanitizer to the final combined output before constructing the `Observation` JSON payload.
- [ ] Add a log entry (at `DEBUG` level) whenever truncation or replacement occurs, including `{ taskId, toolName, originalBytes, action }`.

## 3. Code Review
- [ ] Confirm `sanitizeToolOutput` handles `Buffer` and `string` input without allocating unnecessarily large intermediate buffers (use streaming-friendly chunked processing if input exceeds 1 MB).
- [ ] Verify the truncation sentinel string itself does not contain any non-UTF-8 characters.
- [ ] Ensure `sandboxExecutor` applies the sanitizer before any `JSON.stringify` call, not after.
- [ ] Confirm `MAX_TOOL_OUTPUT_BYTES` is a named constant exported from the module (not a magic number inline).

## 4. Run Automated Tests to Verify
- [ ] Run `pnpm vitest run src/sandbox/__tests__/outputSanitizer.test.ts` and confirm all tests pass.
- [ ] Run `pnpm vitest run --reporter=verbose` for the full suite and verify no regressions.

## 5. Update Documentation
- [ ] Create or update `src/sandbox/sandbox.agent.md` with a "Tool Output Sanitization" section describing the sanitizer's responsibilities, the `MAX_TOOL_OUTPUT_BYTES` limit, and the truncation sentinel format.
- [ ] Update `docs/architecture/sandbox.md` to reference the sanitizer in the data-flow diagram between the child process and the Observation payload.
- [ ] Update `CHANGELOG.md`: `feat(sandbox): non-UTF8 and binary output sanitizer for JSON protocol safety [RISK-801]`.

## 6. Automated Verification
- [ ] Run `pnpm vitest run --reporter=json --outputFile=test-results/output-sanitizer.json` and assert exit code is `0`.
- [ ] Execute `node scripts/verify_test_results.js test-results/output-sanitizer.json` and confirm all tests show `status: "passed"`.
