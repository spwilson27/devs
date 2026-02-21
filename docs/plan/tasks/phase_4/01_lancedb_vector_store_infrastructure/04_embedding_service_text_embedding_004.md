# Task: Implement Embedding Service Using `text-embedding-004` (Sub-Epic: 01_LanceDB_Vector_Store_Infrastructure)

## Covered Requirements
- [TAS-091], [TAS-011]

## 1. Initial Test Written

- [ ] Create `packages/memory/src/__tests__/embedding.test.ts`.
- [ ] Write a **unit test** using `vitest` that mocks `@google/generative-ai` (using `vi.mock`) and asserts that `embedText(text: string)` calls the Google Generative AI SDK with:
  - Model name: `"text-embedding-004"`
  - The `content` parameter set to the input text string.
- [ ] Write a unit test asserting `embedText` returns a `Float32Array` of exactly `768` elements when the mock returns a 768-element array.
- [ ] Write a unit test asserting `embedText` throws a descriptive error if the input `text` is an empty string.
- [ ] Write a unit test asserting `embedText` throws an error if the `GOOGLE_API_KEY` environment variable is not set (guard at instantiation time).
- [ ] Write an **integration test** (skipped by default with `it.skip`, enabled via `INTEGRATION=true` env var) that calls the real Google API with a short text and asserts:
  - The returned vector is a `Float32Array`.
  - Its length is exactly `768`.
  - All values are finite numbers (no `NaN`, no `Infinity`).
- [ ] Confirm all tests **fail** (Red Phase) before implementation.

## 2. Task Implementation

- [ ] Create `packages/memory/src/embedding/embedder.ts`:
  ```typescript
  import { GoogleGenerativeAI } from '@google/generative-ai';
  import { VECTOR_DIMENSIONS } from '../schema/memory-schema.js';

  const MODEL_NAME = 'text-embedding-004';

  function getClient(): GoogleGenerativeAI {
    const apiKey = process.env.GOOGLE_API_KEY;
    if (!apiKey) {
      throw new Error(
        'GOOGLE_API_KEY environment variable is required for the embedding service.'
      );
    }
    return new GoogleGenerativeAI(apiKey);
  }

  /**
   * Generates a 768-dimensional semantic embedding for the given text
   * using Google's text-embedding-004 model.
   */
  export async function embedText(text: string): Promise<Float32Array> {
    if (!text || text.trim() === '') {
      throw new Error('embedText requires a non-empty text input.');
    }
    const client = getClient();
    const model = client.getGenerativeModel({ model: MODEL_NAME });
    const result = await model.embedContent(text);
    const values = result.embedding.values;
    if (values.length !== VECTOR_DIMENSIONS) {
      throw new Error(
        `Expected embedding of ${VECTOR_DIMENSIONS} dimensions, got ${values.length}.`
      );
    }
    return new Float32Array(values);
  }
  ```
- [ ] Export `embedText` from `packages/memory/src/index.ts`.
- [ ] Ensure `GOOGLE_API_KEY` is documented as a required environment variable in `packages/memory/README.md` and the root `.env.example` file.

## 3. Code Review

- [ ] Verify the model name `"text-embedding-004"` is a named constant or at minimum is a single source of truth — it must not be duplicated across files.
- [ ] Verify `VECTOR_DIMENSIONS` (768) is imported from `schema/memory-schema.ts`, not hardcoded.
- [ ] Verify the function validates the returned embedding dimension and throws if the API returns an unexpected dimension (defensive coding against API changes).
- [ ] Confirm `getClient()` is called at request time (not module load time) so that missing `GOOGLE_API_KEY` is caught gracefully during tests when the env var is absent.
- [ ] Confirm no API keys, credentials, or secrets are logged, stored in state, or committed to source.

## 4. Run Automated Tests to Verify

- [ ] Run `pnpm --filter @devs/memory test` — all unit tests in `embedding.test.ts` must pass (integration tests skipped).
- [ ] Run `pnpm --filter @devs/memory build` — TypeScript must compile with zero errors.
- [ ] (Optional, CI gate) With `GOOGLE_API_KEY` set: `INTEGRATION=true pnpm --filter @devs/memory test` — integration tests must also pass.

## 5. Update Documentation

- [ ] Add a `## Embedding Service` section to `packages/memory/README.md` documenting `embedText(text)`, the model used (`text-embedding-004`), required env var (`GOOGLE_API_KEY`), and output dimensions (768).
- [ ] Add `GOOGLE_API_KEY=` to the root `.env.example` file with a comment: `# Required for LanceDB vector embedding (text-embedding-004)`.
- [ ] Document in agent memory: "All text embeddings use `embedText()` from `@devs/memory`. Model is `text-embedding-004`, 768 dims. `GOOGLE_API_KEY` must be set. Never hardcode the model name outside of `embedder.ts`."

## 6. Automated Verification

- [ ] Run `pnpm --filter @devs/memory test --reporter=json > /tmp/embedding-test-results.json` and assert exit code `0`.
- [ ] Assert `grep -r "text-embedding-004" packages/memory/src` shows exactly **one** occurrence (the constant definition in `embedder.ts`), confirming no duplication.
- [ ] Assert `grep -r "GOOGLE_API_KEY" packages/memory/src` does NOT appear inside a `console.log` statement (key must never be logged).
