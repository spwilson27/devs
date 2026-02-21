# Task: Create Consolidated Future Roadmap Document and Validation Suite (Sub-Epic: 05_Future Roadmap Strategy)

## Covered Requirements
- [9_ROADMAP-FUTURE-001]
- [9_ROADMAP-FUTURE-002]
- [9_ROADMAP-FUTURE-003]
- [9_ROADMAP-FUTURE-004]

## 1. Initial Test Written
- [ ] In `src/__tests__/future_roadmap_coverage.test.ts`, write a validation test that parses `docs/FUTURE_ROADMAP.md` and asserts:
  - The document contains all four requirement IDs as section anchors: `9_ROADMAP-FUTURE-001`, `9_ROADMAP-FUTURE-002`, `9_ROADMAP-FUTURE-003`, `9_ROADMAP-FUTURE-004`.
  - Each section contains a non-empty description (at least 50 characters of body text after the heading).
  - The document contains at least one Mermaid diagram block (` ```mermaid `).
- [ ] In `src/__tests__/roadmap_stubs.test.ts`, write an integration test that imports and exercises all four roadmap stubs in one suite:
  - `LocalLLMProvider.generateText(...)` throws `NotImplementedError`.
  - `SessionContext.addMember(...)` throws `TeamModeNotEnabledError`.
  - `GitHubPRReviewerService.handleWebhookEvent(...)` throws `NotImplementedError`.
  - All four Zod schemas (`LLMConfig` with `type:'local'` and no endpoint, `SessionContextSchema` with `mode:'team'`, `GitHubPRReviewerConfigSchema` with `enabled:true`) produce validation errors.

## 2. Task Implementation
- [ ] Create `docs/FUTURE_ROADMAP.md` as the canonical consolidated future roadmap document with the following structure:
  ```markdown
  # devs Future Roadmap

  > This document is authoritative. All future feature stubs in the codebase reference sections here.

  ## Future: Local LLM Support (9_ROADMAP-FUTURE-001)
  ...

  ## Future: Team Mode (9_ROADMAP-FUTURE-002)
  ...

  ## Future: Automated PR Reviewer (9_ROADMAP-FUTURE-003)
  ...

  ## Future: Native Mobile App Monitoring (9_ROADMAP-FUTURE-004)
  ...

  ## Implementation Checklist
  | Requirement ID | Status | Stub Location | Notes |
  |---|---|---|---|
  | 9_ROADMAP-FUTURE-001 | Stubbed | `src/llm/local_provider.ts` | Awaiting Ollama/vLLM stability |
  | 9_ROADMAP-FUTURE-002 | Stubbed | `src/session/session_context.ts` | Requires shared-state architecture decision |
  | 9_ROADMAP-FUTURE-003 | Stubbed | `src/integrations/github/pr_reviewer_service.ts` | Requires GitHub App registration |
  | 9_ROADMAP-FUTURE-004 | Stubbed | `src/api/project_event_bus.ts` | Requires agent lifecycle event hooks |
  ```
- [ ] Each section in `docs/FUTURE_ROADMAP.md` must include:
  - A 2–3 sentence description of the feature.
  - The exact file path of the stub in the codebase.
  - The specific architectural change needed to enable it.
  - A Mermaid diagram (where applicable, already authored in Tasks 01–04).
- [ ] Write the test file `src/__tests__/future_roadmap_coverage.test.ts` using Node.js `fs.readFileSync` to load the document and assert the required sections.
- [ ] Write the test file `src/__tests__/roadmap_stubs.test.ts` importing from all four stub modules.

## 3. Code Review
- [ ] Verify `docs/FUTURE_ROADMAP.md` is written for an AI agent audience: authoritative, no marketing language, uses Mermaid for all diagrams.
- [ ] Verify the Implementation Checklist table is accurate (stub locations match actual files created in Tasks 01–04).
- [ ] Verify the coverage test in `future_roadmap_coverage.test.ts` would fail if a section were deleted from the document (i.e., it is a true regression guard, not a trivially-passing assertion).
- [ ] Verify `roadmap_stubs.test.ts` covers all four stubs without importing mock modules (it should test real stub behaviour).

## 4. Run Automated Tests to Verify
- [ ] Run `npm test -- --testPathPattern="src/__tests__/future_roadmap_coverage.test.ts"` and confirm all assertions pass.
- [ ] Run `npm test -- --testPathPattern="src/__tests__/roadmap_stubs.test.ts"` and confirm all four stub error cases pass.
- [ ] Run `npm test` to confirm no regressions.

## 5. Update Documentation
- [ ] Update `README.md` to add a `## Future Roadmap` section with a one-line description of each future feature and a link to `docs/FUTURE_ROADMAP.md`.
- [ ] Update `src/llm/llm.agent.md`, `src/session/session.agent.md`, `src/integrations/github/github.agent.md`, and `src/api/api.agent.md` to each include a cross-reference link to the relevant section in `docs/FUTURE_ROADMAP.md`.

## 6. Automated Verification
- [ ] Run `npm test -- --testPathPattern="src/__tests__/(future_roadmap_coverage|roadmap_stubs).test.ts" --json --outputFile=test-results/future-roadmap.json` and verify `numFailedTests === 0`.
- [ ] Run `node -e "const fs = require('fs'); const doc = fs.readFileSync('docs/FUTURE_ROADMAP.md','utf8'); const ids = ['9_ROADMAP-FUTURE-001','9_ROADMAP-FUTURE-002','9_ROADMAP-FUTURE-003','9_ROADMAP-FUTURE-004']; const missing = ids.filter(id => !doc.includes(id)); if(missing.length) { console.error('Missing:', missing); process.exit(1); } console.log('All IDs present.');"` and confirm exit code `0`.
