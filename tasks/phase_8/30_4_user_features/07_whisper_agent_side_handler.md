# Task: Implement ContextInjectionService and Agent-side Whisper Handler (Sub-Epic: 30_4_USER_FEATURES)

## Covered Requirements
- [4_USER_FEATURES-REQ-010]

## 1. Initial Test Written
- [ ] Create unit tests in `src/context/__tests__/injector.test.ts`:
  - Test that `ContextInjectionService.inject(agentId, directive)` enqueues the directive in the agent's short-term memory queue and returns an immediate acknowledgement object `{ queued: true, queueId }`.
  - Test that if the agent is not active the service returns `{ queued: false, reason: 'agent_not_active' }`.
  - Test sanitization: verify dangerous payloads are sanitized/escaped and recorded in audit logs (no raw execution allowed).
- [ ] Create integration test `src/agents/__tests__/whisper-handler.integration.test.ts`:
  - Spin up a mock DeveloperAgent loop and assert the injected directive is appended to the short-term memory and consumed on next reasoning cycle (mock timing control).

## 2. Task Implementation
- [ ] Implement `src/context/context_injection.service.ts` exporting `ContextInjectionService` with:
  - `async inject(agentId: string, message: string): Promise<{ queued: boolean, queueId?: string, reason?: string }>` which:
    1. Validates and sanitizes message (rejects binary, extremely large payloads).
    2. Writes directive metadata to `short_term_memory` queue (in-memory queue or lightweight SQLite table) with TTL and correlation to active task.
    3. Emits a non-blocking notification to the running agent via established IPC/MCP channel (do NOT block on agent ack).
- [ ] Implement `src/agents/whisper_handler.ts` which the DeveloperAgent reads each cycle to consume newly enqueued directives and incorporate them into the next SAOP reasoning input.
- [ ] Ensure the handler respects priority (user whispers are high-priority but constrained by `maxDirectivePerTurn` config).

## 3. Code Review
- [ ] Verify directive sanitization prevents shell/SQL injection and strips control characters where appropriate.
- [ ] Confirm injection persistence is lightweight and ephemeral (short TTL), and that storage is cleared after consumption.
- [ ] Ensure the DeveloperAgent does not block waiting for directives; directives are a hint appended to the next reasoning payload.

## 4. Run Automated Tests to Verify
- [ ] Run `npm test -- --testPathPattern="injector|whisper-handler"` and ensure tests pass.
- [ ] Run `npm run lint` and `npm run build`.

## 5. Update Documentation
- [ ] Add `docs/agents/WHISPER_HANDLER.md` documenting the injection lifecycle, schema, TTL, and how agents should incorporate directives.
- [ ] Update agent developer documentation with examples showing how to read directives from short-term memory.

## 6. Automated Verification
- [ ] Add an automated test that injects 10 directives in quick succession and verifies only `maxDirectivePerTurn` are consumed in a single agent cycle and the rest are processed in subsequent cycles.
- [ ] CI check to ensure the injector returns `queued: true` immediately and directives are visible via the `short_term_memory` inspection endpoint.
