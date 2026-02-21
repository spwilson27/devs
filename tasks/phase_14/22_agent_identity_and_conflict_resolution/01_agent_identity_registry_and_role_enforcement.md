# Task: Agent Identity Registry & Role Enforcement (Sub-Epic: 22_Agent Identity and Conflict Resolution)

## Covered Requirements
- [5_SECURITY_DESIGN-REQ-SEC-RSK-101]

## 1. Initial Test Written
- [ ] Create `src/orchestrator/identity/__tests__/AgentIdentityRegistry.test.ts`.
- [ ] Write a unit test `should register an agent with a unique identity` that calls `AgentIdentityRegistry.register({ threadId: 'thread-abc', role: 'Developer', agentInstanceId: 'agent-001' })` and asserts the returned identity record contains `threadId`, `role`, `agentInstanceId`, and a monotonically-increasing `registeredAt` timestamp (ISO-8601).
- [ ] Write a unit test `should reject registration of the same agentInstanceId twice` that calls `register()` twice with the same `agentInstanceId` and asserts the second call throws `DuplicateAgentIdentityError`.
- [ ] Write a unit test `should prevent a Developer agent from being assigned the Reviewer role on its own thread` that calls `assertNotSelfReviewer({ actingInstanceId: 'agent-001', reviewingThreadId: 'thread-abc' })` when `agent-001` was registered on `thread-abc` as `Developer`, and asserts it throws `SelfReviewViolationError`.
- [ ] Write a unit test `should allow a different agent instance to review the same thread` that calls `assertNotSelfReviewer({ actingInstanceId: 'agent-002', reviewingThreadId: 'thread-abc' })` for `agent-002` registered on a different thread and asserts it does NOT throw.
- [ ] Write an integration test that simulates the full SAOP turn cycle: registers two agents (`Developer` and `Reviewer`) on separate threads, then asserts `assertNotSelfReviewer` correctly differentiates them.

## 2. Task Implementation
- [ ] Create `src/orchestrator/identity/AgentIdentityRegistry.ts`.
- [ ] Define the `AgentIdentity` interface: `{ agentInstanceId: string; threadId: string; role: 'Researcher' | 'Developer' | 'Reviewer'; registeredAt: string; }`.
- [ ] Define custom error classes `DuplicateAgentIdentityError` and `SelfReviewViolationError` extending `Error`, with a `code` property for programmatic handling (`DUPLICATE_AGENT_IDENTITY`, `SELF_REVIEW_VIOLATION`).
- [ ] Implement `AgentIdentityRegistry` as a singleton class backed by a `Map<string, AgentIdentity>` keyed by `agentInstanceId`.
- [ ] Implement `register(identity: Omit<AgentIdentity, 'registeredAt'>): AgentIdentity` — throws `DuplicateAgentIdentityError` if `agentInstanceId` already exists; otherwise sets `registeredAt` to `new Date().toISOString()` and stores the record.
- [ ] Implement `getByInstanceId(agentInstanceId: string): AgentIdentity | undefined`.
- [ ] Implement `assertNotSelfReviewer({ actingInstanceId, reviewingThreadId }: { actingInstanceId: string; reviewingThreadId: string }): void` — looks up the acting agent's identity; if the agent's own `threadId` matches `reviewingThreadId`, throws `SelfReviewViolationError`.
- [ ] Persist the registry state to `state/agent_identity_registry.json` (append-only, serialized to disk) so identities survive process restarts. Use atomic write (write to `.tmp`, then `fs.rename`).
- [ ] Export a module-level singleton `agentIdentityRegistry` from `src/orchestrator/identity/index.ts`.
- [ ] Integrate the `assertNotSelfReviewer` call into the Reviewer Agent dispatch path inside `src/orchestrator/AgentOrchestrator.ts` so it is called before any Reviewer Agent processes a Code Review turn.

## 3. Code Review
- [ ] Verify no raw `Map` iteration is exposed outside the registry — callers must use typed accessor methods.
- [ ] Confirm that `SelfReviewViolationError` is caught at the orchestrator boundary and logged to the immutable audit log (structured JSON with `level: 'SECURITY'` and `reqId: '5_SECURITY_DESIGN-REQ-SEC-RSK-101'`).
- [ ] Ensure the singleton is imported via the exported `agentIdentityRegistry` instance, not re-instantiated — check for accidental `new AgentIdentityRegistry()` calls outside of tests.
- [ ] Verify the atomic write path uses `fs.promises.rename` (not `fs.renameSync`) to avoid blocking the event loop.
- [ ] Confirm TypeScript strict mode: no implicit `any`, all error types are narrowed with `instanceof`.

## 4. Run Automated Tests to Verify
- [ ] Run `npm test -- --testPathPattern=AgentIdentityRegistry` and confirm all tests pass with zero failures.
- [ ] Run `npm run lint` and confirm zero lint errors in the `src/orchestrator/identity/` directory.
- [ ] Run `npm run build` and confirm zero TypeScript compilation errors.

## 5. Update Documentation
- [ ] Add a section `## Agent Identity Registry` to `docs/security/agent-identity.md` (create if absent) describing the registry's role, the `assertNotSelfReviewer` guard, and listing `5_SECURITY_DESIGN-REQ-SEC-RSK-101` as the governing requirement.
- [ ] Update `docs/architecture/orchestrator.md` to document the identity-check integration point in the Reviewer Agent dispatch path.
- [ ] Add a `// REQ: 5_SECURITY_DESIGN-REQ-SEC-RSK-101` inline comment above the `assertNotSelfReviewer` call in `AgentOrchestrator.ts`.

## 6. Automated Verification
- [ ] Run `npm test -- --testPathPattern=AgentIdentityRegistry --coverage` and assert line coverage for `AgentIdentityRegistry.ts` is ≥ 90% (fail the CI step if below threshold).
- [ ] Run `grep -rn "5_SECURITY_DESIGN-REQ-SEC-RSK-101" src/` and confirm at least one match exists in the orchestrator source files, verifying the requirement traceability comment is present.
