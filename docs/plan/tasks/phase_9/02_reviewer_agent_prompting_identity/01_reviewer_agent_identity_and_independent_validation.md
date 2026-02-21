# Task: Reviewer Agent Identity and Independent Validation (Sub-Epic: 02_Reviewer Agent Prompting & Identity)

## Covered Requirements
- [5_SECURITY_DESIGN-REQ-SEC-STR-001], [5_SECURITY_DESIGN-REQ-SEC-SD-085]

## 1. Initial Test Written
- [ ] Create a new unit test file `tests/unit/agents/reviewer/ReviewerAgent.test.ts`.
- [ ] Write a test `should be instantiated with a distinct, independent prompt compared to the DeveloperAgent`.
- [ ] Write a test `should cryptographically sign the review result using the Orchestrator-controlled agent identity key`.
- [ ] Write a test `should throw an Error("Impersonation detected") if the task's DeveloperAgent attempts to sign off on its own task as a Reviewer`.
- [ ] Ensure all tests fail (Red Phase).

## 2. Task Implementation
- [ ] In `src/agents/reviewer/ReviewerAgent.ts`, define the `ReviewerAgent` class extending the base `Agent` class.
- [ ] Initialize the `ReviewerAgent` with a unique, separate system prompt specifically designed for independent validation.
- [ ] Inject the Orchestrator's signing key into the `ReviewerAgent` constructor (or via an Identity Provider).
- [ ] Implement a `signOff(taskId: string, developerIdentity: string)` method.
- [ ] Within `signOff`, compare the current `ReviewerAgent` identity with the `developerIdentity`. If they match, throw an `Impersonation detected` error.
- [ ] Generate an HMAC-SHA256 signature over the review result using the injected Orchestrator identity key to ensure the review cannot be spoofed.

## 3. Code Review
- [ ] Ensure the signing mechanism utilizes the Node.js native `crypto` module (e.g., `crypto.createHmac`) rather than a 3rd party library.
- [ ] Verify that the `ReviewerAgent` class relies on dependency injection for its cryptographic keys.
- [ ] Check that the identity comparison is strict and fails closed by default.

## 4. Run Automated Tests to Verify
- [ ] Execute `npm run test -- tests/unit/agents/reviewer/ReviewerAgent.test.ts`.
- [ ] Verify that the test suite passes with 100% coverage for the new code.

## 5. Update Documentation
- [ ] Add an entry in `docs/architecture/agents.md` detailing the multi-agent signature process and identity enforcement.
- [ ] Ensure the `.agent.md` file for `ReviewerAgent.ts` describes the `signOff` method and its anti-impersonation checks.

## 6. Automated Verification
- [ ] Run `npm run verify-requirements --req 5_SECURITY_DESIGN-REQ-SEC-STR-001,5_SECURITY_DESIGN-REQ-SEC-SD-085` to ensure requirement mappings exist in the source code comments.
