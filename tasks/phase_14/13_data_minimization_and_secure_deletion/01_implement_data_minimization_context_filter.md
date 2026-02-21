# Task: Implement Data Minimization Context Filter (Sub-Epic: 13_Data Minimization and Secure Deletion)

## Covered Requirements
- [5_SECURITY_DESIGN-REQ-SEC-SD-086]

## 1. Initial Test Written
- [ ] In `src/core/context/__tests__/contextFilter.test.ts`, write unit tests for a `buildLLMContext(rawContext: ProjectContext): SanitizedContext` function:
  - Test that `PATH`, `HOME`, `USER`, `SHELL`, `LOGNAME`, `TMPDIR`, `TERM`, `LANG`, `LC_ALL`, `SSH_AUTH_SOCK`, and any key matching `/^(XDG_|DBUS_|DISPLAY|XAUTHORITY)/` are stripped from any `env` field in the payload.
  - Test that project-relevant fields (`projectId`, `taskDescription`, `phaseNumber`, `relevantFiles`, `constraints`) are retained verbatim.
  - Test that if the input contains a nested `agentContext.hostEnv` object, the entire `hostEnv` key is removed from the output.
  - Test that an allowlist of permitted env keys (e.g., `NODE_ENV`, `DEVS_MODEL`) passes through unchanged.
  - Test that the function is a pure function (same input → same output, no side effects).
- [ ] In `src/core/context/__tests__/llmPayloadBuilder.test.ts`, write integration tests verifying that `LLMPayloadBuilder.build()` calls `buildLLMContext` internally and the final payload sent over the wire never contains forbidden keys.

## 2. Task Implementation
- [ ] Create `src/core/context/contextFilter.ts`:
  - Export `BLOCKED_ENV_KEYS: ReadonlySet<string>` — a compile-time constant set containing: `PATH`, `HOME`, `USER`, `SHELL`, `LOGNAME`, `TMPDIR`, `TERM`, `LANG`, `LC_ALL`, `SSH_AUTH_SOCK`.
  - Export `BLOCKED_ENV_PREFIXES: ReadonlyArray<string>` — `['XDG_', 'DBUS_', 'DISPLAY', 'XAUTHORITY']`.
  - Export `ALLOWED_ENV_KEYS: ReadonlySet<string>` — allowlist: `NODE_ENV`, `DEVS_MODEL`, `DEVS_LOG_LEVEL`.
  - Implement `isBlockedEnvKey(key: string): boolean` — returns `true` if key is in `BLOCKED_ENV_KEYS` or starts with a prefix in `BLOCKED_ENV_PREFIXES`, AND is not in `ALLOWED_ENV_KEYS`.
  - Implement `buildLLMContext(rawContext: ProjectContext): SanitizedContext`:
    - Deep-clone the input using `structuredClone`.
    - Delete `result.agentContext?.hostEnv`.
    - If `result.env` exists, filter it through `isBlockedEnvKey` to remove blocked entries.
    - Return the sanitized object typed as `SanitizedContext`.
- [ ] Define `ProjectContext` and `SanitizedContext` interfaces in `src/core/context/types.ts` (or extend existing types file). `SanitizedContext` must omit `hostEnv` at the type level using `Omit<>`.
- [ ] In `src/core/llm/LLMPayloadBuilder.ts`, import `buildLLMContext` and apply it to the raw context before serializing the request payload.
- [ ] Add a `// [5_SECURITY_DESIGN-REQ-SEC-SD-086]` comment at the call site in `LLMPayloadBuilder.ts`.

## 3. Code Review
- [ ] Verify `buildLLMContext` is a pure function with no process.env reads — it must only operate on the passed argument.
- [ ] Verify `BLOCKED_ENV_KEYS` and `BLOCKED_ENV_PREFIXES` are `readonly` / `as const` to prevent mutation.
- [ ] Verify no other code path in `src/core/llm/` constructs an LLM payload without going through `LLMPayloadBuilder`.
- [ ] Verify `SanitizedContext` type statically prevents accessing `.hostEnv` — confirm no `// @ts-ignore` bypasses.
- [ ] Confirm tests achieve ≥ 95% branch coverage on `contextFilter.ts` (check via `npx jest --coverage`).

## 4. Run Automated Tests to Verify
- [ ] Run `npx jest src/core/context/__tests__/contextFilter.test.ts --coverage` and confirm all tests pass with ≥ 95% branch coverage.
- [ ] Run `npx jest src/core/context/__tests__/llmPayloadBuilder.test.ts` and confirm all tests pass.
- [ ] Run `npx tsc --noEmit` and confirm zero TypeScript errors.

## 5. Update Documentation
- [ ] Add a section to `docs/security/data-minimization.md` (create if absent) describing which env keys are blocked, the allowlist, and the `buildLLMContext` contract.
- [ ] Update `docs/architecture/llm-payload-pipeline.md` (create if absent) with a note that all payloads pass through `contextFilter` before dispatch.
- [ ] Update agent memory file `docs/agent-memory/phase_14_decisions.md` with: "Data minimization filter applied at LLM payload layer via `buildLLMContext`. Host env keys blocklisted per SD-086."

## 6. Automated Verification
- [ ] Run `node scripts/verify-no-host-env-in-payload.js` (create this script if absent): it should spawn a mock LLM server, trigger a sample task, capture the outgoing HTTP body, and assert that `PATH`, `HOME`, and `USER` are absent from the JSON body. Exit code 0 = pass, 1 = fail.
- [ ] Confirm CI pipeline step `validate-all` passes without errors: `npm run validate-all`.
