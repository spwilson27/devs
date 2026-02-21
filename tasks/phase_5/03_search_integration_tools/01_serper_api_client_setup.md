# Task: Serper/Google Search API Client Setup & Configuration (Sub-Epic: 03_Search Integration Tools)

## Covered Requirements
- [TAS-027], [9_ROADMAP-TAS-302]

## 1. Initial Test Written
- [ ] Create `src/tools/search/__tests__/serper_client.test.ts` (or equivalent test path for the project's test framework).
- [ ] Write a unit test that verifies `SerperClient` can be instantiated with a valid API key loaded from the environment variable `SERPER_API_KEY`.
- [ ] Write a unit test that verifies `SerperClient.search(query: string, options?: SearchOptions)` throws a `ConfigurationError` if `SERPER_API_KEY` is not set.
- [ ] Write a unit test mocking `fetch`/`axios` that verifies a correct HTTP POST request is sent to `https://google.serper.dev/search` with the right headers (`X-API-KEY`, `Content-Type: application/json`) and body (`{ q: query, num: options.num ?? 10, hl: options.lang ?? 'en' }`).
- [ ] Write a unit test verifying that the client correctly parses and returns a typed `SerperSearchResponse` object containing `organic`, `knowledgeGraph`, and `answerBox` fields from a mocked HTTP response.
- [ ] Write a unit test verifying that an HTTP 4xx response from Serper raises a `SearchApiError` with the correct status code and message.
- [ ] Write a unit test verifying that an HTTP 5xx response from Serper raises a `SearchApiError` and the raw response body is included in the error.
- [ ] Write an integration test (skipped in CI unless `SERPER_API_KEY` env var is present) that executes a real search query and confirms the response contains at least one organic result with a non-empty `link` and `title`.

## 2. Task Implementation
- [ ] Create `src/tools/search/types.ts` defining:
  - `SearchOptions`: `{ num?: number; lang?: string; country?: string; dateRange?: 'qdr:d' | 'qdr:w' | 'qdr:m' | 'qdr:y' }` — the `dateRange` field is critical for stale data prevention.
  - `SerperOrganicResult`: `{ title: string; link: string; snippet: string; date?: string; position: number }`.
  - `SerperSearchResponse`: `{ organic: SerperOrganicResult[]; knowledgeGraph?: object; answerBox?: object; searchParameters: object }`.
  - `SearchApiError` (custom error class extending `Error`) with `statusCode: number` and `responseBody: string`.
  - `ConfigurationError` (custom error class extending `Error`).
- [ ] Create `src/tools/search/serper_client.ts` implementing the `SerperClient` class:
  - Constructor reads `SERPER_API_KEY` from `process.env` and throws `ConfigurationError` if absent.
  - `async search(query: string, options?: SearchOptions): Promise<SerperSearchResponse>` method that POSTs to `https://google.serper.dev/search`.
  - Sets headers: `X-API-KEY: <key>`, `Content-Type: application/json`.
  - Parses and returns the typed `SerperSearchResponse`.
  - Throws `SearchApiError` on non-2xx HTTP responses.
- [ ] Create `src/tools/search/index.ts` exporting `SerperClient`, all types, and errors.
- [ ] Add `SERPER_API_KEY` to `.env.example` with a placeholder value and a comment: `# Required for real-time web search (https://serper.dev)`.
- [ ] Add `SERPER_API_KEY` to the project's secrets/environment variable documentation in `docs/configuration.md` (or equivalent).

## 3. Code Review
- [ ] Verify `SerperClient` does **not** log the raw API key to any log output.
- [ ] Verify all exported types are in `types.ts` and not scattered across implementation files.
- [ ] Verify the `dateRange` parameter is passed through correctly to the Serper API request body under the key `tbs` per Serper's API spec.
- [ ] Verify error classes use proper `instanceof` checks (i.e., they extend `Error` correctly with `Object.setPrototypeOf` if needed for TypeScript).
- [ ] Verify there are no hardcoded API keys, URLs (except the Serper base URL which is a public constant), or magic numbers without named constants.

## 4. Run Automated Tests to Verify
- [ ] Run `npm test -- --testPathPattern=serper_client` (or project-equivalent) and confirm all unit tests pass.
- [ ] Confirm 0 integration tests fail in normal CI (they should be skipped without `SERPER_API_KEY`).
- [ ] Run the linter (`npm run lint` or equivalent) and confirm 0 errors.

## 5. Update Documentation
- [ ] Update `src/tools/search/search.agent.md` (AOD file — create if absent) documenting: the purpose of `SerperClient`, the `SERPER_API_KEY` env var dependency, the `SearchOptions` API, and the error types thrown.
- [ ] Add an entry in the project's main `ARCHITECTURE.md` (or `docs/architecture.md`) under "External Integrations" describing the Serper API dependency and its role in the Discovery phase.

## 6. Automated Verification
- [ ] Run `npm test -- --coverage --testPathPattern=serper_client` and confirm test coverage for `src/tools/search/serper_client.ts` is ≥ 90% for statements and branches.
- [ ] Run `grep -r "SERPER_API_KEY" src/ --include="*.ts" | grep -v "test" | grep -v "\.env"` to confirm the key is only accessed in `serper_client.ts` and not leaked into other source files.
- [ ] Confirm `src/tools/search/search.agent.md` exists and contains the string `SerperClient`.
