# Task: Document Niche/Proprietary Language Support as Out-of-Scope Boundary (Sub-Epic: 04_Out-of-Scope Manifest - Quality & Compliance)

## Covered Requirements
- [1_PRD-REQ-OOS-008]

## 1. Initial Test Written
- [ ] Create a test file at `src/oos/__tests__/oos-manifest.test.ts` (or the project's equivalent test location).
- [ ] Write a unit test that imports or loads the OOS manifest data structure (e.g., a JSON or TypeScript constant at `src/oos/oos-manifest.ts`) and asserts that an entry with ID `1_PRD-REQ-OOS-008` exists within it.
- [ ] Assert the entry has the following fields with correct values:
  - `id`: `"1_PRD-REQ-OOS-008"`
  - `name`: a string matching `"Niche or Proprietary Language Support"` (or equivalent)
  - `description`: a string containing the phrase `"mainstream languages"` (reflecting the requirement description)
  - `rationale`: a non-empty string explaining why this is out of scope (e.g., limited tooling, LLM training data coverage)
  - `futureConsideration`: a boolean or string field indicating whether this could be addressed in the future
- [ ] Write a test that asserts the system's language-allowlist (e.g., `src/config/supported-languages.ts`) does NOT contain any entries categorized as `niche` or `proprietary`.
- [ ] Write an integration test that verifies if the `devs init` command receives a project brief mentioning a niche language (e.g., `COBOL`, `Brainfuck`, `Erlang with a proprietary extension`), it emits a structured warning referencing `1_PRD-REQ-OOS-008` and does NOT proceed with code generation for that language.

## 2. Task Implementation
- [ ] Create the OOS manifest data file at `src/oos/oos-manifest.ts`. Define a typed array `OOS_MANIFEST` of objects with fields: `id: string`, `name: string`, `description: string`, `rationale: string`, `futureConsideration: boolean | string`.
- [ ] Add the entry for `1_PRD-REQ-OOS-008`:
  ```typescript
  {
    id: "1_PRD-REQ-OOS-008",
    name: "Niche or Proprietary Language Support",
    description: "Out of Scope: Limited to mainstream languages with robust tooling.",
    rationale: "Niche or proprietary languages (e.g., COBOL, RPG, proprietary DSLs) lack sufficient LLM training data, community tooling, and test framework support to guarantee reliable code generation and validation. Including them would produce unpredictable output quality.",
    futureConsideration: false,
  }
  ```
- [ ] Create or update `src/config/supported-languages.ts` to export an explicit allowlist of mainstream languages (e.g., TypeScript, Python, Go, Rust, Java, C#, Ruby, Swift, Kotlin, PHP). Ensure each entry has a `category: "mainstream"` field.
- [ ] In the orchestrator's input validation layer (e.g., `src/orchestrator/input-validator.ts`), add a validation step that:
  1. Parses the user's project brief for language mentions.
  2. Checks each mentioned language against the `supported-languages` allowlist.
  3. If a language is not in the allowlist, emits a `ValidationWarning` event with `oosReferenceId: "1_PRD-REQ-OOS-008"` and a human-readable message, then halts generation for that language scope.
- [ ] Export the `OOS_MANIFEST` from an index barrel file at `src/oos/index.ts`.

## 3. Code Review
- [ ] Verify the `OOS_MANIFEST` is typed with a strict TypeScript interface (e.g., `OosEntry`) — no use of `any`.
- [ ] Confirm the supported-languages allowlist is not hardcoded inline in the validator; it must import from `src/config/supported-languages.ts`.
- [ ] Verify the `ValidationWarning` event emitted by the input validator conforms to the project's established event/error schema.
- [ ] Ensure no code path silently swallows the OOS warning; it must be surfaced to the user via the CLI and logged to the project's audit log.
- [ ] Confirm no test uses `jest.mock` to bypass the actual OOS manifest lookup — tests must validate the real manifest data.

## 4. Run Automated Tests to Verify
- [ ] Run `npm test -- --testPathPattern=oos-manifest` (or project equivalent) and confirm all unit tests pass.
- [ ] Run the full test suite with `npm test` and confirm zero regressions.
- [ ] Run the integration test for the `devs init` OOS warning path and verify the structured warning output is emitted correctly.

## 5. Update Documentation
- [ ] Update `docs/oos/README.md` (create if not exists) with a section titled `## Niche or Proprietary Language Support (1_PRD-REQ-OOS-008)` explaining the boundary and the allowlist.
- [ ] Add a comment block at the top of `src/config/supported-languages.ts` referencing `1_PRD-REQ-OOS-008` and linking to the OOS manifest.
- [ ] Update the agent memory file (e.g., `docs/agent-memory/phase_15.agent.md`) to record: "Language scope is bounded to the mainstream allowlist per [1_PRD-REQ-OOS-008]. Any project brief referencing a niche language will trigger an OOS warning."

## 6. Automated Verification
- [ ] Run `node scripts/verify-oos-manifest.js` (create this script if it does not exist). The script must:
  1. Import the `OOS_MANIFEST`.
  2. Assert that `1_PRD-REQ-OOS-008` is present with all required fields populated and non-empty.
  3. Exit with code `0` on success, code `1` with a descriptive error on failure.
- [ ] Add this verification script to the CI pipeline step `verify:oos` in the project's CI config (e.g., `.github/workflows/ci.yml` or equivalent).
- [ ] Confirm CI passes on a clean run by checking exit code `0`.
