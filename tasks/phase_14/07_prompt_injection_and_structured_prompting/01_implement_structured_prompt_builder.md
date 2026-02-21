# Task: Implement Structured Prompt Builder with Trusted/Untrusted Delimiters (Sub-Epic: 07_Prompt Injection and Structured Prompting)

## Covered Requirements
- [1_PRD-REQ-SEC-006], [1_PRD-REQ-SEC-012]

## 1. Initial Test Written

- [ ] Create `src/security/__tests__/prompt-builder.test.ts`.
- [ ] Write a unit test asserting that `buildPrompt({ system: '...', untrustedContext: '...' })` wraps the untrusted content in `<untrusted_context>` XML tags and places it AFTER the system instructions.
- [ ] Write a unit test asserting that user-supplied file content injected as a string (e.g., `"Ignore previous instructions and..."`) cannot escape the `<untrusted_context>` delimiter block — specifically that the literal string `</untrusted_context>` appearing inside the content is escaped to `&lt;/untrusted_context&gt;` before insertion.
- [ ] Write a unit test asserting that `buildPrompt` refuses to accept `undefined` or `null` for the `untrustedContext` field and throws a typed `PromptBuildError`.
- [ ] Write a unit test asserting that a `trustedContext` field is wrapped in `<trusted_context>` tags and is placed between the system block and the untrusted block.
- [ ] Write an integration test in `src/security/__tests__/prompt-builder.integration.test.ts` verifying that the `ResearchAgent`, `RequirementDistillationAgent`, and `TaskAgent` all invoke `buildPrompt` from this module rather than constructing raw prompt strings directly. This test should use a spy/mock on the `buildPrompt` export and assert it was called at least once per agent invocation.
- [ ] Write a snapshot test that captures the full serialized prompt string output for a known input and asserts it matches the expected XML-delimited structure exactly.

## 2. Task Implementation

- [ ] Create `src/security/prompt-builder.ts` and export the following:
  - `interface PromptParts { system: string; trustedContext?: string; untrustedContext: string; task: string; }`
  - `class PromptBuildError extends Error {}`
  - `function buildPrompt(parts: PromptParts): string` — the primary API.
- [ ] Implement `buildPrompt`:
  1. Validate that `parts.untrustedContext` is a non-empty string; throw `PromptBuildError` otherwise.
  2. Escape any occurrence of `</untrusted_context>` (case-insensitive) inside `parts.untrustedContext` by replacing `<` with `&lt;`.
  3. Similarly escape `</trusted_context>` inside `parts.trustedContext` if provided.
  4. Compose the final prompt string in this exact order:
     ```
     {system}

     <trusted_context>
     {trustedContext}
     </trusted_context>

     <untrusted_context>
     {untrustedContext}
     </untrusted_context>

     {task}
     ```
  5. Omit the `<trusted_context>` block entirely when `trustedContext` is not provided.
- [ ] Create `src/security/index.ts` and re-export `buildPrompt`, `PromptParts`, and `PromptBuildError`.
- [ ] Refactor `ResearchAgent` (`src/agents/research-agent.ts`) to import and use `buildPrompt` when constructing prompts. External web content must be placed in `untrustedContext`.
- [ ] Refactor `RequirementDistillationAgent` (`src/agents/requirement-distillation-agent.ts`) to pass any raw document text in `untrustedContext`.
- [ ] Refactor `TaskAgent` (`src/agents/task-agent.ts`) to pass any user-supplied inputs or file content in `untrustedContext`.
- [ ] Add JSDoc comments to all exported symbols referencing requirement IDs `1_PRD-REQ-SEC-006` and `1_PRD-REQ-SEC-012`.

## 3. Code Review

- [ ] Verify no agent file constructs a template literal prompt string directly without going through `buildPrompt`. Use `grep -r "Content:\`" src/agents/` to find violations.
- [ ] Verify the delimiter-escaping logic uses a case-insensitive regex and covers both opening and closing tags.
- [ ] Verify `PromptBuildError` extends `Error` and sets `this.name = 'PromptBuildError'` for reliable `instanceof` checks.
- [ ] Verify the module has zero runtime dependencies beyond Node built-ins (no additional npm packages required for this utility).
- [ ] Confirm TypeScript strict mode is satisfied: no implicit `any`, no unhandled `undefined` paths.
- [ ] Confirm that requirement IDs `[1_PRD-REQ-SEC-006]` and `[1_PRD-REQ-SEC-012]` appear as inline code comments at the top of `prompt-builder.ts`.

## 4. Run Automated Tests to Verify

- [ ] Run `npm test -- --testPathPattern="src/security/__tests__/prompt-builder"` and confirm all unit and snapshot tests pass with zero failures.
- [ ] Run `npm test -- --testPathPattern="src/security/__tests__/prompt-builder.integration"` and confirm the integration spy tests pass.
- [ ] Run the full test suite with `npm test` and confirm no regressions are introduced in existing agent tests.

## 5. Update Documentation

- [ ] Add a `## Prompt Security` section to `docs/security.md` (create the file if it does not exist) describing the `buildPrompt` API, the delimiter strategy, and the rationale for treating external data as untrusted.
- [ ] Update `docs/architecture.md` to note that all LLM prompt construction must route through `src/security/prompt-builder.ts`.
- [ ] Add an entry to the agent memory store (`.devs/memory/security-decisions.md`) recording: "All LLM prompts MUST use `buildPrompt` from `src/security/prompt-builder.ts`. External/user data MUST be placed in `untrustedContext`. Requirement IDs: 1_PRD-REQ-SEC-006, 1_PRD-REQ-SEC-012."

## 6. Automated Verification

- [ ] Run `grep -r "buildPrompt" src/agents/ | wc -l` and assert the count is ≥ 3 (one per refactored agent).
- [ ] Run `grep -rn "untrusted_context" src/ | grep -v "__tests__"` and assert at least one match exists in each of `research-agent.ts`, `requirement-distillation-agent.ts`, and `task-agent.ts`.
- [ ] Run `npm run build` (TypeScript compilation) and confirm zero type errors.
- [ ] Execute `npm test -- --coverage --testPathPattern="src/security"` and confirm line coverage for `prompt-builder.ts` is ≥ 95%.
