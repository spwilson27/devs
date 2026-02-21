# Task: Implement UI Redaction Parity - Real-Time Stream Integration with SecretMasker (Sub-Epic: 10_Redaction Pipeline Phases)

## Covered Requirements
- [5_SECURITY_DESIGN-REQ-SEC-SD-070], [4_USER_FEATURES-REQ-021]

## 1. Initial Test Written
- [ ] Create `packages/secret-masker/src/__tests__/stream-masker.test.ts`.
- [ ] Write unit tests for `createMaskedStream(source: ReadableStream<string>, options?: MaskedStreamOptions): ReadableStream<string>`:
  - A stream emitting `["Hello ", "sk_live_abc123def456ghi", " world"]` in 3 chunks → the composed output stream emits chunks where the secret is replaced with a `[REDACTED_STRIPE_KEY_<hash>]` placeholder.
  - A secret split across two chunks (`"sk_live_abc"` then `"123def456ghi"`) → the masker buffers until a natural boundary and correctly redacts the cross-chunk secret (no partial secrets leak between chunks).
  - A stream with no secrets → output is identical to input, chunk-by-chunk.
  - The stream completes normally (no hanging) when the source stream closes.
  - On source stream error → the masked stream propagates the error.
  - High-throughput test: stream 10MB of text with 100 embedded secrets in 1KB chunks → all secrets redacted, no chunk dropped.
- [ ] Write tests for `createMaskedWritableStream(dest: WritableStream<string>): WritableStream<string>`:
  - Writes passing through are redacted before reaching `dest`.
- [ ] Write integration test: `MaskedEventEmitter` wrapping Node.js `EventEmitter` — any string emitted on `'data'` events is scanned and secrets replaced before forwarding to listeners.
- [ ] Confirm all tests fail before implementation: `npx jest packages/secret-masker --testPathPattern=stream-masker --no-coverage 2>&1 | grep FAIL`.

## 2. Task Implementation
- [ ] Create `packages/secret-masker/src/stream-masker.ts` and export:
  ```ts
  export interface MaskedStreamOptions {
    bufferWindowBytes?: number;   // default: 512. Overlap buffer to handle cross-chunk secrets.
    model?: LocalFlashModel;      // optional Phase 2 model
    onRedaction?: (result: ScanResult) => void;  // telemetry hook
  }

  export function createMaskedStream(
    source: ReadableStream<string>,
    options?: MaskedStreamOptions
  ): ReadableStream<string>;

  export function createMaskedWritableStream(
    dest: WritableStream<string>,
    options?: MaskedStreamOptions
  ): WritableStream<string>;
  ```
- [ ] Cross-chunk handling strategy:
  1. Maintain a `buffer: string` that holds the last `bufferWindowBytes` (default 512) characters from the previous chunk.
  2. When a new chunk arrives, prepend `buffer` to form `windowText = buffer + chunk`.
  3. Run `phase1Scan(windowText)` (and optionally `phase2Validate`), then `phase3Replace`.
  4. Emit only the `chunk.length` characters from the end of `redactedWindowText` (i.e., skip the buffered prefix to avoid double-emission), and update `buffer` to the last `bufferWindowBytes` chars of `windowText`.
  5. On stream close, flush the remaining buffer through the pipeline and emit the final redacted output.
- [ ] Create `packages/secret-masker/src/masked-event-emitter.ts` exporting `MaskedEventEmitter` class that:
  - Extends or wraps Node.js `EventEmitter`.
  - Intercepts `emit(event, ...args)` for string arguments, runs the 3-phase pipeline synchronously (Phase 1 + Phase 3 only, no async model for event emitters), and re-emits the redacted string.
- [ ] Wire `SecretMasker` middleware to the `ToolProxy` stream by exporting a factory function `wrapToolProxyStream(toolProxy: IToolProxy): IToolProxy` in `packages/secret-masker/src/tool-proxy-wrapper.ts` (creates a `MaskedStream` around the proxy's output stream).
- [ ] Export `createMaskedStream`, `createMaskedWritableStream`, `MaskedEventEmitter`, and `wrapToolProxyStream` from `packages/secret-masker/src/index.ts`.

## 3. Code Review
- [ ] Verify the `bufferWindowBytes` overlap is large enough to catch the longest possible single-token secret (256 chars), and document this constraint in a JSDoc comment.
- [ ] Verify `MaskedEventEmitter` is synchronous (does NOT await async model calls) and uses Phase 1 + Phase 3 only — document this limitation.
- [ ] Confirm `onRedaction` telemetry hook is called for EVERY redacted span, enabling UI components to display redaction count badges without accessing the original values.
- [ ] Confirm `wrapToolProxyStream` is the single integration point — no other location in the codebase should directly pipe ToolProxy output to UI without going through a masked stream.
- [ ] Verify no original secret value leaks through the `onRedaction` callback (pass only `{ type, start, end, detectionMethod, entropy }` — no `value`).

## 4. Run Automated Tests to Verify
- [ ] Run `npx jest packages/secret-masker --testPathPattern=stream-masker --coverage`.
- [ ] Confirm ≥ 95% line coverage for `stream-masker.ts`, `masked-event-emitter.ts`, and `tool-proxy-wrapper.ts`.
- [ ] Run the high-throughput test as a standalone benchmark: `node packages/secret-masker/scripts/benchmark-stream.js` (create this script) asserting 10MB processed in < 2 seconds.

## 5. Update Documentation
- [ ] Add `## UI Redaction Parity` and `## Stream Integration` sections to `packages/secret-masker/README.md` documenting `createMaskedStream`, the cross-chunk buffer strategy, `MaskedEventEmitter` limitations (sync-only), and how to use `wrapToolProxyStream`.
- [ ] Add an architecture diagram (Mermaid) to `packages/secret-masker/docs/stream-architecture.md` showing the data flow: `ToolProxy → MaskedStream → UI / Logger`.
- [ ] Update `.agent/memory/phase_2.md` with: "UI redaction parity implemented. All sandbox output streams pass through `createMaskedStream` via `wrapToolProxyStream`. Cross-chunk buffer: 512 bytes. Sync masking via `MaskedEventEmitter` for event-based streams."

## 6. Automated Verification
- [ ] Run `npx jest packages/secret-masker --testPathPattern=stream-masker --json --outputFile=/tmp/stream_results.json && node -e "const r=require('/tmp/stream_results.json'); process.exit(r.numFailedTests > 0 ? 1 : 0)"`.
- [ ] Run `npx tsc --project packages/secret-masker/tsconfig.json --noEmit` to confirm zero type errors.
- [ ] Run `node packages/secret-masker/scripts/benchmark-stream.js` and assert exit code 0.
