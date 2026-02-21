# Task: Implement DocumentValidator Core Service (Sub-Epic: 07_Document Validation and Traceability)

## Covered Requirements
- [9_ROADMAP-REQ-027]

## 1. Initial Test Written
- [ ] Create a unit test at tests/validators/documentValidator.spec.js (or .ts) using the project's test runner (Jest/Mocha). The test must:
  - Import the DocumentValidator module via `const { validateMarkdown } = require('../../src/validators/documentValidator')` (adjust to project paths).
  - Provide three sample markdown inputs as strings:
    1. `invalidFrontmatter`: missing required YAML frontmatter keys expected by the project's schema.
    2. `brokenMarkdown`: includes malformed links (`[link](missing`), bare HTML, inconsistent heading levels, and trailing spaces.
    3. `validMarkdown`: a minimal valid PRD/TAS fragment that should return no errors.
  - Assert that `validateMarkdown(invalidFrontmatter)` returns an array containing at least one error with fields {ruleId, line, message}.
  - Assert that `validateMarkdown(brokenMarkdown)` returns at least 3 distinct lint errors and that errors include line numbers.
  - Assert that `validateMarkdown(validMarkdown)` returns an empty array.
  - Run the test with `npm test -- tests/validators/documentValidator.spec.js` and fail the CI run if the assertions are not met.

## 2. Task Implementation
- [ ] Implement a DocumentValidator module at `src/validators/documentValidator.(js|ts)` exposing a single async function `validateMarkdown(markdownText: string, options?: object): Promise<Array<LintError>>` where `LintError = { ruleId: string, line: number, message: string, severity: 'error'|'warning' }`.
- [ ] Integrate an existing Markdown linting engine (preferred: remark + remark-lint OR markdownlint) as a pluggable adapter. Provide a thin abstraction layer so the lint engine can be swapped.
- [ ] Create a default markdown lint config at `config/markdownlint.json` or `config/.remarkrc` enabling rules appropriate for PRD/TAS documents (no HTML blocks, frontmatter presence, heading order, link format, code block fences, no trailing spaces).
- [ ] Implement parsing of frontmatter (YAML) and validate presence of machine-readable metadata keys (e.g., `req_id`, `status`) as part of the validation step.
- [ ] Ensure the module returns structured errors (see LintError above) and includes a machine-readable `fingerprint` combining ruleId + line + snippet for automated deduplication.
- [ ] Add logging and a `--format json|text` option for CLI or API consumers.

## 3. Code Review
- [ ] Verify the module uses dependency injection for the lint engine adapter (no hard-coded imports so tests can inject a mock engine).
- [ ] Ensure the lint rules are configurable via the project's config system and that defaults live under `config/`.
- [ ] Ensure comprehensive unit test coverage (>= 90% on the validator module) and clear error shapes for downstream consumers.
- [ ] Confirm no synchronous blocking file IO in the validator core (accept raw markdown strings) to keep it testable and re-entrant.

## 4. Run Automated Tests to Verify
- [ ] Run `npm test` (or the project's test command) and confirm the new `documentValidator` tests pass.
- [ ] Add a temporary failing test to verify CI will fail on regressions and then revert the temporary test after confirmation.

## 5. Update Documentation
- [ ] Add `docs/validators/DocumentValidator.md` describing the public API, config file format, standard lint rules, and examples of lint error objects.
- [ ] Add an entry to the architecture doc `docs/arch/validation.md` describing where the validator is invoked in the document generation and approval pipeline.
- [ ] Update the agent memory / knowledge base entry describing the validator's contract (function signature + error schema).

## 6. Automated Verification
- [ ] Provide a script `scripts/verify-document-validator.sh` that:
  - Runs a set of canonical inputs through `validateMarkdown`.
  - Verifies that known invalid inputs produce the expected ruleIds and that `validMarkdown` produces zero errors.
  - Exits non-zero on mismatch. The CI should run this script as part of the verification pipeline.
