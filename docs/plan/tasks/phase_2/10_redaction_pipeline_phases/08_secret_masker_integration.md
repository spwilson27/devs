# Task: Integrate Full 3-Phase SecretMasker Pipeline and End-to-End Validation (Sub-Epic: 10_Redaction Pipeline Phases)

## Covered Requirements
- [5_SECURITY_DESIGN-REQ-SEC-SD-050], [5_SECURITY_DESIGN-REQ-SEC-SD-051], [5_SECURITY_DESIGN-REQ-SEC-SD-052], [8_RISKS-REQ-092], [4_USER_FEATURES-REQ-021]

## 1. Initial Test Written
- [ ] Create `packages/secret-masker/src/__tests__/secret-masker.integration.test.ts`.
- [ ] Write end-to-end integration tests for the top-level `SecretMasker` class:
  - `masker.redact(text: string): Promise<RedactionResult>` — confirm all 3 phases run in sequence: Phase 1 (scan) → Phase 2 (validate) → Phase 3 (replace).
  - An input containing 5 secrets of 4 different types → all 5 are redacted with correct type-specific placeholders.
  - An input with a high-entropy string (entropy > 4.5, length ≥ 20) that Phase 2 model classifies as a non-secret (e.g., a git object hash) → it is NOT redacted in the final output.
  - `masker.redactStream(source): ReadableStream<string>` → wraps a stream and verifies secrets are redacted across chunk boundaries.
  - `masker.redactAgentThought(thought: AgentThought): Promise<AnonymizedThought>` → delegates to `anonymizeReasoningLog` and returns the anonymized result.
  - Benchmark: a corpus of 500 diverse secrets (load from `packages/secret-masker/test-fixtures/secret-corpus.json`) → `masker.redact` achieves ≥ 99.9% recall (at most 0 secrets pass through unredacted in a 500-secret fixture).
- [ ] Create `packages/secret-masker/test-fixtures/secret-corpus.json` with ≥ 500 distinct secret strings covering all pattern types.
- [ ] Confirm tests fail before implementation: `npx jest packages/secret-masker --testPathPattern=integration --no-coverage 2>&1 | grep FAIL`.

## 2. Task Implementation
- [ ] Create `packages/secret-masker/src/secret-masker.ts` and export the `SecretMasker` class:
  ```ts
  export class SecretMasker {
    constructor(options?: SecretMaskerOptions);
    async redact(text: string): Promise<RedactionResult>;
    redactStream(source: ReadableStream<string>): ReadableStream<string>;
    async redactAgentThought(thought: AgentThought): Promise<AnonymizedThought>;
  }

  export interface SecretMaskerOptions {
    model?: LocalFlashModel;
    confidenceThreshold?: number;   // default: 0.80
    bufferWindowBytes?: number;     // default: 512
    onRedaction?: (result: ScanResult) => void;
    logger?: Logger;
  }
  ```
- [ ] `SecretMasker.redact` must chain:
  1. `phase1Scan(text)` → `ScanResult[]`
  2. `phase2Validate(results, text, this.model)` → `ValidatedResult[]` (skip if no model configured, treat all as confirmed)
  3. `phase3Replace(text, validated)` → `RedactionResult`
- [ ] `SecretMasker.redactStream` delegates to `createMaskedStream` (from `stream-masker.ts`), passing `this.options`.
- [ ] `SecretMasker.redactAgentThought` delegates to `anonymizeReasoningLog` (from `reasoning-anonymizer.ts`), passing `this.model`.
- [ ] Export `SecretMasker` as the default export and as a named export from `packages/secret-masker/src/index.ts`.
- [ ] Create `packages/secret-masker/src/index.ts` as the package's single public API surface, re-exporting all public types and functions from the sub-modules.

## 3. Code Review
- [ ] Verify `SecretMasker` has no circular dependencies between its sub-modules (use `madge --circular packages/secret-masker/src` to check).
- [ ] Verify Phase 2 is gracefully skipped (not an error) when no `model` is provided — document this as the "pattern-only mode."
- [ ] Confirm `SecretMaskerOptions.logger` is an injected interface (not `console`) so consumers can route logs to their own logging infrastructure.
- [ ] Confirm the public API surface in `index.ts` exports ONLY the types and functions that external consumers need; internal helpers must not be exported.
- [ ] Verify `SecretMasker` is instantiable with zero options (`new SecretMasker()`) for simple use cases.

## 4. Run Automated Tests to Verify
- [ ] Run `npx jest packages/secret-masker --testPathPattern=integration --coverage`.
- [ ] Confirm ≥ 90% overall coverage for the `secret-masker` package.
- [ ] Run the 500-secret recall benchmark test and assert `recallRate >= 0.999`.

## 5. Update Documentation
- [ ] Create `packages/secret-masker/README.md` with a complete usage guide covering: installation, `SecretMasker` class API, stream usage, agent thought anonymization, configuration options, and extension points.
- [ ] Add a Mermaid diagram to `README.md` showing the 3-phase pipeline:
  ```mermaid
  graph LR
    Input --> Phase1[Phase 1: Patterns + Entropy]
    Phase1 --> Phase2[Phase 2: Contextual Validation]
    Phase2 --> Phase3[Phase 3: Replace + Hash]
    Phase3 --> Output
  ```
- [ ] Update `.agent/memory/phase_2.md` with: "Full `SecretMasker` pipeline integrated. Public API: `SecretMasker` class with `redact`, `redactStream`, `redactAgentThought`. Recall ≥99.9% validated against 500-secret corpus."

## 6. Automated Verification
- [ ] Run `npx jest packages/secret-masker --json --outputFile=/tmp/integration_results.json && node -e "const r=require('/tmp/integration_results.json'); process.exit(r.numFailedTests > 0 ? 1 : 0)"`.
- [ ] Run `madge --circular packages/secret-masker/src/index.ts` and assert no circular dependencies (exit code 0).
- [ ] Run `npx tsc --project packages/secret-masker/tsconfig.json --noEmit` and assert exit code 0.
- [ ] Run `node packages/secret-masker/scripts/benchmark-recall.js` (create this script to load `test-fixtures/secret-corpus.json` and assert recall ≥ 99.9%) and assert exit code 0.
