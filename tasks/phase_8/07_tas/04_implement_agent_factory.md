# Task: Implement AgentFactory and Role-Bound Agent Instances (Sub-Epic: 07_TAS)

## Covered Requirements
- [TAS-098], [TAS-079]

## 1. Initial Test Written
- [ ] In `packages/core/src/agents/__tests__/agent-factory.test.ts` write unit tests that:
  - Mock `PromptManager` and `ToolRegistry` and instantiate `AgentFactory` with these mocks.
  - Call `AgentFactory.create('developer', { sessionId: 's1' })` and assert the returned object implements interface `{ id, roleId, systemPrompt, allowedTools, runTurn }`.
  - Assert `systemPrompt` equals the prompt returned by the mocked `PromptManager.get('developer')` and `allowedTools` match `ToolRegistry` permissions for `developer`.
  - Verify creating an unknown role id results in a well-documented `UnknownRoleError`.

## 2. Task Implementation
- [ ] Implement `packages/core/src/agents/agent-factory.ts` exporting `class AgentFactory { constructor({promptManager, toolRegistry}); create(roleId, opts?): Agent }`.
- [ ] Agent instances should be lightweight plain JS objects that contain `id` (uuid), `roleId`, `systemPrompt` (string), `allowedTools` (string[]), and a stubbed `async runTurn(context)` method that throws `NotImplementedError` until actual turn logic is implemented in later phases.
- [ ] Add `// REQ: TAS-098` and `// REQ: TAS-079` at the file top; include JSDoc describing dependencies and expected invariants.

## 3. Code Review
- [ ] Confirm `AgentFactory` uses dependency injection (no singletons) and that instances are isolated (no shared mutable runtime state across agents unless explicitly injected).
- [ ] Ensure errors are typed and user-friendly and that `// REQ: TAS-098` and `// REQ: TAS-079` annotations exist.

## 4. Run Automated Tests to Verify
- [ ] Run `pnpm --filter @devs/core test -- --testPathPattern="agent-factory"` and confirm all tests pass.
- [ ] Confirm full suite passes.

## 5. Update Documentation
- [ ] Add `docs/agents/agent-factory.md` describing how to instantiate agents, the light-weight agent shape, and examples for `developer`/`reviewer`/`researcher`.
- [ ] Add a small example in `packages/core/src/agents/agent-factory.example.ts`.

## 6. Automated Verification
- [ ] Run `grep -n "REQ: TAS-098" packages/core/src/agents/agent-factory.ts` and assert exit code 0.
- [ ] Run `pnpm --filter @devs/core build` to ensure types compile.
