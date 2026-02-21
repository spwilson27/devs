# Task: Define Agent Suite System Prompts and Role Specifications (Sub-Epic: 07_TAS)

## Covered Requirements
- [TAS-079], [TAS-098]

## 1. Initial Test Written
- [ ] In `packages/core/src/agents/__tests__/agent-prompts.test.ts` write unit tests that assert the following:
  - The directory `packages/core/src/agents/prompts/` exists.
  - Files `researcher.json`, `developer.json`, and `reviewer.json` are present in the directory.
  - Loading each JSON yields an object with the keys: `id` (string), `name` (string), `systemPrompt` (string), `description` (string), `allowedTools` (string[]), `defaultToolset` (string[]), `version` (semver string).
  - `systemPrompt` length is <= 2000 characters.
  - `allowedTools` is non-empty for `developer` and `reviewer`; `researcher` contains at minimum `["search","summarize"]`.
  - No `systemPrompt` contains placeholder tokens (fail if any string matches regex `/\<[^>]+\>/`).
  - Tests must run under the repository test runner (use the commands in section 4).

## 2. Task Implementation
- [ ] Create directory `packages/core/src/agents/prompts/` and add three JSON files: `researcher.json`, `developer.json`, `reviewer.json` with the schema above and example minimal prompts.
- [ ] Add `packages/core/src/agents/prompts/index.ts` which imports/loads the JSON files and exports a typed `AgentPromptMap` (Record<string, AgentPrompt>). Add these comments at the top of the file:
  ```ts
  // REQ: TAS-079
  // REQ: TAS-098
  ```
- [ ] Ensure JSON files do not contain secrets, credentials, or environment-specific placeholders.

## 3. Code Review
- [ ] Confirm the prompt schema is consistent across files and uses concise instructions (no lengthy non-actionable prose).
- [ ] Verify the principle of least privilege: `developer` allowedTools must include write/file I/O and sandbox tools; `reviewer` must have read/diff/quality tools but not arbitrary write permissions; `researcher` limited to search/summarize.
- [ ] Ensure `index.ts` contains the `// REQ: TAS-079` and `// REQ: TAS-098` annotations.

## 4. Run Automated Tests to Verify
- [ ] Run `pnpm --filter @devs/core test -- --testPathPattern="agent-prompts"` and confirm the newly added tests pass.
- [ ] Run `pnpm --filter @devs/core test` (full suite) and confirm no regressions.

## 5. Update Documentation
- [ ] Create `docs/agents/prompts.md` documenting the prompt schema, versioning policy, and a short example of each agent's system prompt.
- [ ] Add `packages/core/src/agents/prompts/prompts.agent.md` describing usage guidance for AI agents and constraints (what to never include in prompts).

## 6. Automated Verification
- [ ] Run `grep -n "REQ: TAS-079" packages/core/src/agents/prompts/index.ts` and assert exit code 0.
- [ ] Add `scripts/validate-prompts.js` (or TS) that loads every prompt file and validates the schema; run `node scripts/validate-prompts.js` and assert exit code 0 in CI.
- [ ] Run `pnpm --filter @devs/core build` and confirm zero build/type errors.
