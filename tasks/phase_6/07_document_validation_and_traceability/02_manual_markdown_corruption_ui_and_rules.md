# Task: Implement Manual Markdown Corruption Linting UI and API (Sub-Epic: 07_Document Validation and Traceability)

## Covered Requirements
- [4_USER_FEATURES-REQ-031]

## 1. Initial Test Written
- [ ] Create an integration test at tests/integration/manualMarkdownCorruption.spec.js that:
  - Spins up the web/API server in test mode (or uses a mocked HTTP layer) and loads the Manual Corruption endpoint: `POST /api/docs/manual-validate` with a JSON body { "path": "docs/sample_prd.md", "content": "<corrupted markdown string>" }.
  - Provides at least two corrupted payloads: (1) trimmed/garbled content with missing fenced code block closers, (2) PDF-converted noise (random control characters) injected into markdown.
  - Asserts the API responds with HTTP 200 and a JSON payload containing `corruptionDetected: true`, `errors: [ { line, severity, message, heuristic } ]`, and a `repairSuggestion` field for each heuristic (can be a short string).
  - Write a UI E2E test (Cypress/Playwright) `e2e/manual-lint.spec.js` that:
    - Loads the Manual Lint UI page, pastes the corrupted markdown into the editor, clicks "Run Manual Lint", and asserts the UI highlights corrupted lines and shows repair suggestions in a side panel.

## 2. Task Implementation
- [ ] Add an API endpoint `POST /api/docs/manual-validate` implemented in `src/api/docs/manualValidate.(js|ts)` which accepts raw markdown or a path and returns structured corruption diagnostics.
- [ ] Implement a set of heuristics in `src/validators/manualCorruptionHeuristics.(js|ts)` including:
  - Binary/noise detector: detect non-UTF-8/control characters likely from non-text paste.
  - Fenced-block integrity: unmatched ``` or indentation block corruption.
  - Character-entropy checks: unusually high entropy indicating binary copy/paste.
  - Link and reference truncation heuristics: detect truncated markdown link patterns.
- [ ] Implement a small React/Vue/Preact component `ManualCorruptionPanel` under `src/ui/components/`:
  - Features: paste/upload editor, run lint button, side panel showing line-level diagnostics, repair-suggestion buttons which call the API with `repairSuggestionRequested: true` and receive a small automated patch or suggested edit.
  - Provide accessible keyboard shortcuts and ensure the component is testable by E2E tools.
- [ ] Store and expose a `manualLintHistory` record for each document with timestamp, input hash, and results for auditability (store in simple JSON DB or existing persistence layer).

## 3. Code Review
- [ ] Confirm heuristics are modular and individually unit-tested, and each heuristic returns the standard `LintError` shape used by DocumentValidator.
- [ ] Ensure the UI component is stateless except for current session state and uses the project's UI patterns (composition, CSS modules, or design system tokens).
- [ ] Verify API request/response contracts are typed (TypeScript or JSON Schema) and documented.

## 4. Run Automated Tests to Verify
- [ ] Run integration tests: `npm run test:integration -- tests/integration/manualMarkdownCorruption.spec.js` and E2E tests: `npm run test:e2e -- e2e/manual-lint.spec.js` and ensure they pass.

## 5. Update Documentation
- [ ] Add `docs/features/manual-markdown-corruption.md` describing the UI flow, API contract, heuristics list, and examples of detected corruption with suggested repairs.
- [ ] Add example screenshots or animated GIFs (in `docs/assets/`) showing the UI highlighting corrupted lines and repair suggestions.
- [ ] Update agent memory with the new heuristics and the API contract so downstream agent tasks can call it.

## 6. Automated Verification
- [ ] Provide `scripts/manual-lint-smoke.sh` that runs the integration test payloads against a running test server and validates the presence of `corruptionDetected: true` for the known corrupted inputs, returning non-zero on any mismatch. CI should execute this script after deployment to staging.
