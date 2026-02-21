# Task: Implement SAOP Stream Parser Service (Sub-Epic: 95_Requirement_SAOP_Models)

## Covered Requirements
- [6_UI_UX_ARCH-REQ-093]

## 1. Initial Test Written
- [ ] In `packages/ui-hooks/src/__tests__/saop.parser.test.ts`, write unit tests for a `SaopStreamParser` class before implementing it:
  - **Happy-path THOUGHT**: Feed a JSON string representing a valid `SaopThought` envelope into `parser.push(chunk)`. Assert `parser.drain()` returns an array containing exactly one correctly typed `SaopThought`.
  - **Happy-path ACTION**: Feed a valid `SaopAction` JSON string. Assert `drain()` returns one correctly typed `SaopAction`.
  - **Happy-path OBSERVATION**: Feed a valid `SaopObservation` JSON string. Assert `drain()` returns one correctly typed `SaopObservation`.
  - **Chunked input**: Split a valid JSON envelope into three substrings; call `push()` three times. Assert `drain()` returns one complete envelope only after the third push.
  - **Malformed JSON**: Feed a string that is not valid JSON. Assert `drain()` returns an empty array and does not throw.
  - **Unknown `type`**: Feed a JSON object with `type: "UNKNOWN"`. Assert `drain()` returns an empty array.
  - **Multiple envelopes in one push**: Feed two newline-delimited JSON envelopes in a single `push()` call (NDJSON format). Assert `drain()` returns two envelopes.
  - **sequence_id ordering**: Push envelopes with `sequence_id` values `[3, 1, 2]`. Assert that `drain()` returns them in ascending `sequence_id` order.
- [ ] In `packages/ui-hooks/src/__tests__/saop.parser.test.ts`, write integration tests using a mock `EventSource`/`ReadableStream` to simulate a real SSE or WebSocket stream delivering NDJSON lines over multiple ticks.

## 2. Task Implementation
- [ ] Create `packages/ui-hooks/src/saop.parser.ts` implementing the `SaopStreamParser` class:
  - **Internal state**: `private _buffer: string` (accumulates partial chunks) and `private _queue: SaopEnvelope[]` (parsed and validated envelopes awaiting consumption).
  - **`push(chunk: string): void`**: Appends `chunk` to `_buffer`. Splits on `\n` (NDJSON delimiter). For each complete line: calls `parseSaopEnvelope(JSON.parse(line))` from `saop.schema.ts`; on success pushes to `_queue` in a way that maintains `sequence_id` order; on failure logs a `console.warn` with the raw line but does NOT throw.
  - **`drain(): SaopEnvelope[]`**: Returns a copy of `_queue` sorted by `sequence_id` ascending, then clears `_queue`. Callers are responsible for processing the returned envelopes.
  - **`reset(): void`**: Clears both `_buffer` and `_queue`. Called when the WebSocket/SSE connection resets.
  - Export a factory function `createSaopStreamParser(): SaopStreamParser` as the recommended instantiation pattern.
- [ ] Create `packages/ui-hooks/src/useSaopStream.ts` — a React hook that wraps `SaopStreamParser`:
  - Accepts a `WebSocket | null` as input.
  - On each `message` event, calls `parser.push(event.data)` then calls a provided `onEnvelopes(envelopes: SaopEnvelope[])` callback with the result of `parser.drain()`.
  - On `close`/`error` events, calls `parser.reset()`.
  - Cleans up event listeners in the hook's `useEffect` cleanup function.
- [ ] Re-export `SaopStreamParser`, `createSaopStreamParser`, and `useSaopStream` from `packages/ui-hooks/src/index.ts`.

## 3. Code Review
- [ ] Verify the parser never throws to callers — all errors are swallowed and logged via `console.warn`.
- [ ] Verify `drain()` always returns a new array (not a reference to internal state) to prevent callers from mutating the queue.
- [ ] Verify `push()` correctly handles chunks that end mid-JSON (i.e., no `\n` at end), buffering them for the next call.
- [ ] Verify `useSaopStream` cleanup removes event listeners on unmount or when the `WebSocket` prop changes.
- [ ] Verify there are no synchronous blocking loops — all processing is O(n) over lines in the current chunk.
- [ ] Confirm `sequence_id` sort is a stable numeric sort (not lexicographic string sort).

## 4. Run Automated Tests to Verify
- [ ] Run `pnpm --filter @devs/ui-hooks test` and confirm all tests in `saop.parser.test.ts` pass with zero failures.
- [ ] Run `pnpm --filter @devs/ui-hooks typecheck` and confirm zero TypeScript errors.
- [ ] Run `pnpm --filter @devs/ui-hooks test --coverage` and confirm `saop.parser.ts` has ≥ 90% line coverage.

## 5. Update Documentation
- [ ] Add a JSDoc comment block to `SaopStreamParser` and `useSaopStream` explaining usage, expected input format (NDJSON over WebSocket/SSE), and referencing `[6_UI_UX_ARCH-REQ-093]`.
- [ ] Update `packages/ui-hooks/ui-hooks.agent.md` with an entry: "SAOP stream parsing is handled by `SaopStreamParser` (stateful, push-based NDJSON parser). React integration via `useSaopStream` hook. Parser must be reset on connection drop."
- [ ] Update `packages/ui-hooks/README.md` with a "Stream Parser" section showing a minimal usage example of `useSaopStream`.

## 6. Automated Verification
- [ ] Execute `pnpm --filter @devs/ui-hooks test --reporter=json > /tmp/saop_parser_test_results.json` and verify exit code is `0`.
- [ ] Execute `cat /tmp/saop_parser_test_results.json | jq '.numFailedTests'` and assert the value is `0`.
- [ ] Execute `pnpm --filter @devs/ui-hooks test --coverage --reporter=json > /tmp/saop_coverage.json` and assert `saop.parser.ts` line coverage is ≥ 90%.
