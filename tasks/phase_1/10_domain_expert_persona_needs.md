# Tasks for 10_Domain Expert Persona Needs (Phase: phase_1.md)

## Covered Requirements
- [REQ-NEED-DOMAIN-01], [REQ-NEED-DOMAIN-02], [REQ-NEED-DOMAIN-03]

### Task Checklist
- [ ] **Subtask 1: Domain Expert Context Interface**: Define a `DomainExpertContext` interface in TypeScript that extends a base persona. Ensure it includes properties for tracking pending document approvals, active feedback sessions, and allowed workspace bounds.
- [ ] **Subtask 2: Implement Approval Gate Middleware**: Create a middleware function `requireDomainExpertApproval` that pauses agent execution before finalizing high-level documents (PRD, TAS) and triggers a prompt for the Domain Expert.
- [ ] **Subtask 3: Real-time Feedback Injection**: Implement an event handler `injectFeedback` that allows the Domain Expert to submit text feedback during agent execution, modifying the agent's current instructions or halting it.
- [ ] **Subtask 4: Scope Sandboxing System**: Build a file-system wrapper `SandboxedFS` that enforces read/write limits based on the current task's assigned scope to prevent the agent from modifying unrelated modules.

### Testing & Verification
- [ ] Create unit tests to verify that the `DomainExpertContext` structure initializes correctly with default values.
- [ ] Implement a test suite for `requireDomainExpertApproval` ensuring that the execution state is set to "PAUSED" when approval is pending, and resumes only after approval is granted.
- [ ] Write integration tests for `injectFeedback` to confirm that injected text correctly updates the active agent's prompt context.
- [ ] Develop unit tests for `SandboxedFS` proving that out-of-scope write attempts throw a `ScopeViolationError` while in-scope actions succeed.
