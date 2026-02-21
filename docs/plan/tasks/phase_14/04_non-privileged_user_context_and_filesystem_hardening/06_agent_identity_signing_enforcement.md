# Task: Implement Multi-Agent Identity Signing to Prevent Agent Impersonation (Sub-Epic: 04_Non-Privileged User Context and Filesystem Hardening)

## Covered Requirements
- [5_SECURITY_DESIGN-REQ-SEC-STR-001]

## 1. Initial Test Written
- [ ] Create `src/security/__tests__/agentIdentity.test.ts`.
- [ ] Write a unit test: `signAgentAction(action, agentId, agentSecret)` returns an object containing `{ agentId, signature, timestamp }` where `signature` is a non-empty hex string.
- [ ] Write a unit test: `verifyAgentSignature(signedAction, agentId, agentSecret)` returns `true` for a correctly signed action.
- [ ] Write a unit test: `verifyAgentSignature(signedAction, agentId, agentSecret)` returns `false` if the `agentId` in the payload does not match the claimed signer.
- [ ] Write a unit test: `verifyAgentSignature(signedAction, agentId, agentSecret)` returns `false` if the payload has been tampered with (change any field after signing).
- [ ] Write a unit test: `verifyAgentSignature(signedAction, agentId, agentSecret)` returns `false` if the `agentId` is `'reviewer'` but the action was signed by `'implementer'` (cross-role impersonation).
- [ ] Write an integration test: the Orchestrator rejects a task completion event signed by the `'implementer'` agent when the event's `role` claims `'reviewer'`.
- [ ] Write an integration test: the Orchestrator accepts a reviewer sign-off only when the signature matches the known reviewer agent secret managed by the Orchestrator.

## 2. Task Implementation
- [ ] Create `src/security/agentIdentity.ts`.
- [ ] Define type `AgentRole = 'orchestrator' | 'researcher' | 'implementer' | 'reviewer' | 'tester'`.
- [ ] Define type `SignedAgentAction = { agentId: string; role: AgentRole; actionType: string; payload: unknown; timestamp: number; signature: string; }`.
- [ ] Export `signAgentAction(action: Omit<SignedAgentAction, 'signature'>, secret: string): SignedAgentAction`:
  - Serialize the action fields (excluding `signature`) to a canonical JSON string (sorted keys).
  - Compute HMAC-SHA256 over the serialized string using `crypto.createHmac('sha256', secret)`.
  - Return the action with the hex digest attached as `signature`.
  - Add comment: `// [5_SECURITY_DESIGN-REQ-SEC-STR-001]: Agent identity signing to prevent impersonation`.
- [ ] Export `verifyAgentSignature(action: SignedAgentAction, secret: string): boolean`:
  - Re-derive the expected signature over the non-signature fields using the same HMAC approach.
  - Use `crypto.timingSafeEqual` to compare expected vs actual signature buffers.
  - Return `false` if `agentId` does not match `role`'s authorized identity mapping.
- [ ] In the Orchestrator task completion handler, call `verifyAgentSignature` before accepting any agent output. Reject (log error + mark task as failed) if verification fails.
- [ ] The Orchestrator manages agent secrets in memory (generated at startup using `crypto.randomBytes(32).toString('hex')`), never persisted to disk and never exposed to agents directly.
- [ ] Export from `src/security/index.ts`.

## 3. Code Review
- [ ] Verify `crypto.timingSafeEqual` is used for signature comparison, NOT `===` or `Buffer.compare`.
- [ ] Verify agent secrets are generated via `crypto.randomBytes`, never hardcoded or read from environment.
- [ ] Confirm the canonical JSON serialization uses sorted keys to ensure determinism.
- [ ] Confirm agents receive only their own secret, never another agent's secret or the orchestrator's master key.
- [ ] Verify the requirement comment `// [5_SECURITY_DESIGN-REQ-SEC-STR-001]` is present on the HMAC computation line.
- [ ] Confirm `AgentRole` is a union type (not a string), preventing arbitrary role values.

## 4. Run Automated Tests to Verify
- [ ] Run `npm test -- --testPathPattern="src/security/__tests__/agentIdentity"` and confirm all tests pass.
- [ ] Confirm 100% branch coverage for `src/security/agentIdentity.ts`.
- [ ] Run the full integration test suite and confirm no regressions in agent communication.

## 5. Update Documentation
- [ ] Update `docs/security.md` with a section "Agent Identity & Signing" describing the HMAC-SHA256 signing scheme, role definitions, and how the Orchestrator enforces identity.
- [ ] Update `docs/architecture/adr/ADR-SEC-003-agent-identity.md` recording the decision to use per-session HMAC secrets for agent identity.
- [ ] Update the developer agent memory file `docs/agent-memory/security-decisions.md` with: "All agent actions must be HMAC-signed. The Orchestrator holds all secrets. Agents never see other agents' secrets."

## 6. Automated Verification
- [ ] Run `npm run validate-all` and confirm exit code 0.
- [ ] Add `scripts/smoke-test-agent-identity.sh`:
  1. Start a local orchestrator in test mode.
  2. Send a forged task completion event (signed by `'implementer'` but claiming `role: 'reviewer'`).
  3. Assert the orchestrator rejects the event and logs a security violation.
  4. Exit with code 0 if rejection is confirmed.
