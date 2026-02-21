# Task: Implement PromptManager with Versioning and Retrieval API (Sub-Epic: 07_TAS)

## Covered Requirements
- [TAS-098]

## 1. Initial Test Written
- [ ] In `packages/core/src/agents/__tests__/prompt-manager.test.ts` write unit tests that:
  - Import `PromptManager` and instantiate it with a test fixtures directory `tests/fixtures/prompts/`.
  - Verify `await promptManager.load()` returns an in-memory index with keys matching the filenames in the fixtures directory.
  - Assert `promptManager.get(id)` returns the correct prompt object for `researcher`, `developer`, `reviewer`.
  - Assert `promptManager.getVersion(id)` returns a semver and that `promptManager.listVersions(id)` includes the loaded version.
  - Assert `promptManager.get(id, { version })` returns that specific version and falls back to `latest` when version omitted.
  - Mock file-system errors and assert `promptManager.load()` surfaces a descriptive error (no stack leakage) and fails the test.

## 2. Task Implementation
- [ ] Create `packages/core/src/agents/prompt-manager.ts` implementing `class PromptManager { constructor({dir, logger}); async load(); get(id, opts?); listVersions(id); getVersionMeta(id); }`.
- [ ] Implement file-based versioning: store loaded prompts in memory under `prompts[id][version]` and maintain `latest` pointer.
- [ ] Add comments at file top:
  ```ts
  // REQ: TAS-098
  ```
- [ ] Export TypeScript types `AgentPrompt`, `PromptVersionMeta`, and unit-test-friendly loader hooks.

## 3. Code Review
- [ ] Ensure PromptManager is side-effect free during `get()` calls (no IO during read), and that `load()` is the single IO boundary.
- [ ] Validate path normalization (no directory traversal) and that prompts are sanitized (no secrets kept in plain text in long-lived caches).
- [ ] Confirm `// REQ: TAS-098` annotation is present.

## 4. Run Automated Tests to Verify
- [ ] Run `pnpm --filter @devs/core test -- --testPathPattern="prompt-manager"` and confirm tests pass locally.
- [ ] Add CI job `validate-prompts` that runs `node scripts/validate-prompts.js` after install.

## 5. Update Documentation
- [ ] Add `docs/agents/prompt-manager.md` describing public API, versioning model, and how to add new prompt versions safely.
- [ ] Update `packages/core/src/agents/prompts/prompts.agent.md` with usage examples for PromptManager.

## 6. Automated Verification
- [ ] Run `grep -n "REQ: TAS-098" packages/core/src/agents/prompt-manager.ts` and assert exit code 0.
- [ ] Run `pnpm --filter @devs/core build` in CI and ensure type checks pass.
- [ ] Run unit tests and assert coverage on `prompt-manager.ts` ≥ 90% branch coverage.
