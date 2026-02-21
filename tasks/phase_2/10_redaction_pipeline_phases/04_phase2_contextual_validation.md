# Task: Implement Phase 2 Redaction - Contextual Validation via Local Flash Model (Sub-Epic: 10_Redaction Pipeline Phases)

## Covered Requirements
- [5_SECURITY_DESIGN-REQ-SEC-SD-051]

## 1. Initial Test Written
- [ ] Create `packages/secret-masker/src/__tests__/phase2-validator.test.ts`.
- [ ] Mock the local flash model inference call (stub `LocalFlashModel.classify(prompt): Promise<ClassificationResult>`) using Jest mock factories — do NOT call a real model in unit tests.
- [ ] Write tests for `phase2Validate(results: ScanResult[], text: string): Promise<ValidatedResult[]>`:
  - A `ScanResult` of type `AWS_ACCESS_KEY` with a realistic key value → model stub returns `{ isSecret: true, confidence: 0.97 }` → `ValidatedResult` has `confirmed: true`.
  - A `ScanResult` of type `HIGH_ENTROPY` with value `"node_modules/.cache/abc123def456ghi789jkl"` → model stub returns `{ isSecret: false, confidence: 0.91, reason: "file_path_artifact" }` → `ValidatedResult` has `confirmed: false`.
  - A `ScanResult` where model stub returns `{ isSecret: true, confidence: 0.60 }` (below threshold `0.80`) → `ValidatedResult` has `confirmed: false` and `lowConfidence: true`.
  - Model stub throws a timeout error → function logs a warning and falls back to `confirmed: true` (fail-safe: prefer over-redaction).
  - Empty `results` array → returns empty `ValidatedResult[]` without calling the model.
  - Batch of 10 results → model is called once per result (not batched, to preserve per-item reasoning).
- [ ] Write a test asserting `ValidatedResult` shape: `{ ...ScanResult, confirmed: boolean, confidence: number, lowConfidence?: boolean, reason?: string }`.
- [ ] Confirm tests fail before implementation: `npx jest packages/secret-masker --testPathPattern=phase2 --no-coverage 2>&1 | grep FAIL`.

## 2. Task Implementation
- [ ] Create `packages/secret-masker/src/local-flash-model.ts` and export:
  ```ts
  export interface ClassificationResult {
    isSecret: boolean;
    confidence: number;      // 0.0 – 1.0
    reason?: string;         // optional explanation
  }

  export interface LocalFlashModel {
    classify(prompt: string): Promise<ClassificationResult>;
  }

  export function createLocalFlashModel(options?: FlashModelOptions): LocalFlashModel;
  ```
- [ ] `createLocalFlashModel` should load a quantized local model (e.g., via `llama-cpp-node` or `@xenova/transformers`) specified by `options.modelPath` (defaulting to `process.env.FLASH_MODEL_PATH`). The implementation must be swappable via dependency injection — accept a `LocalFlashModel` interface, not a concrete class.
- [ ] Create `packages/secret-masker/src/phase2-validator.ts` and export:
  ```ts
  export interface ValidatedResult extends ScanResult {
    confirmed: boolean;
    confidence: number;
    lowConfidence?: boolean;
    reason?: string;
  }

  export async function phase2Validate(
    results: ScanResult[],
    text: string,
    model?: LocalFlashModel,
    options?: { confidenceThreshold?: number }
  ): Promise<ValidatedResult[]>;
  ```
- [ ] Implementation steps:
  1. For each `ScanResult`, build a structured prompt:
     ```
     Determine if the following string is a real secret (API key, token, password, PII) or a safe technical artifact (file path, hash, test data).
     Type hint: {result.type}
     Surrounding context (±50 chars): {text.slice(max(0, result.start-50), result.end+50)}
     Value: {result.value}
     Reply with JSON: {"isSecret": boolean, "confidence": 0.0-1.0, "reason": "..."}
     ```
  2. Call `model.classify(prompt)`.
  3. If `confidence < options.confidenceThreshold` (default `0.80`) → mark `lowConfidence: true`, set `confirmed: false`.
  4. On model error/timeout → log warning via injected `logger` and set `confirmed: true` (fail-safe).
  5. Return all results as `ValidatedResult[]`.
- [ ] Export everything from `packages/secret-masker/src/index.ts`.

## 3. Code Review
- [ ] Verify the `LocalFlashModel` is injected (not imported directly) in `phase2Validate` — no hard-coded model instantiation inside the validator.
- [ ] Verify fail-safe behavior is explicitly tested and the comment `// Fail-safe: prefer over-redaction on model error` is present in the catch block.
- [ ] Confirm the confidence threshold is a parameter with a documented default (`0.80`), not a magic number.
- [ ] Confirm no secrets from `ScanResult.value` appear in the structured prompt beyond the intentional context window (e.g., truncate values longer than 200 chars to avoid sending full private keys to local model).
- [ ] Confirm `phase2Validate` is `async` and returns `Promise<ValidatedResult[]>` (not a synchronous function wrapping a promise).

## 4. Run Automated Tests to Verify
- [ ] Run `npx jest packages/secret-masker --testPathPattern=phase2 --coverage`.
- [ ] Confirm 100% line coverage for `phase2-validator.ts` and ≥ 90% for `local-flash-model.ts`.

## 5. Update Documentation
- [ ] Add `## Phase 2: Contextual Validation` section to `packages/secret-masker/README.md` describing the local flash model, confidence threshold, fail-safe behavior, and how to configure `FLASH_MODEL_PATH`.
- [ ] Document `FlashModelOptions` interface in `packages/secret-masker/docs/local-flash-model.md`.
- [ ] Update `.agent/memory/phase_2.md` with: "Phase 2 validator operational. Uses injected `LocalFlashModel`. Confidence threshold: 0.80. Fail-safe: over-redact on error. Model path via `FLASH_MODEL_PATH` env var."

## 6. Automated Verification
- [ ] Run `npx jest packages/secret-masker --testPathPattern=phase2 --json --outputFile=/tmp/phase2_results.json && node -e "const r=require('/tmp/phase2_results.json'); process.exit(r.numFailedTests > 0 ? 1 : 0)"`.
- [ ] Run `npx tsc --project packages/secret-masker/tsconfig.json --noEmit` to assert zero type errors.
