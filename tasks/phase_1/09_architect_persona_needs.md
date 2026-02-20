# Tasks for 09_Architect Persona Needs (Phase: phase_1.md)

## Covered Requirements
- [REQ-NEED-ARCH-01], [REQ-NEED-ARCH-02], [REQ-NEED-ARCH-03]

### Task Checklist
- [ ] **Subtask 1: Implement PatternEnforcer Module**: Create a `PatternEnforcer` module in `src/architecture/PatternEnforcer.ts` to parse the Technical Architecture Specification (TAS) and extract explicitly defined architectural patterns and constraints (e.g., "Must use Functional Programming with Effect-TS").
- [ ] **Subtask 2: Inject Architectural Constraints into Agent Context**: Update the Prompt Builder (`src/agents/promptBuilder.ts`) to query the `PatternEnforcer` and automatically append strict pattern constraints into the Developer Agent's system prompt to enforce architectural adherence during code generation.
- [ ] **Subtask 3: Implement Phase Approval Gates**: Create a `PhaseApprovalGate` component within `src/orchestrator/gates.ts` that explicitly blocks the orchestrator from transitioning from Phase 2 (Documentation) to Phase 3 (Distillation) until the user signs off via the VSCode extension or CLI prompt.
- [ ] **Subtask 4: Granular Document Diffing & Approval UI**: Build a utility `src/utils/docDiff.ts` to identify incremental changes in the PRD and TAS and surface them in the VSCode Extension for granular review, requiring re-approval when fundamental structural updates are detected.
- [ ] **Subtask 5: Develop AutomatedReviewerAgent**: Implement an `AutomatedReviewerAgent` class in `src/agents/ReviewerAgent.ts` responsible for identifying anti-patterns, architectural drift, and security flaws within generated code.
- [ ] **Subtask 6: Integrate Reviewer Agent with Static Analysis**: Equip the `AutomatedReviewerAgent` with MCP capabilities to trigger and read output from established static analysis tools (e.g., SonarQube, Semgrep, or ESLint customized for strict pattern adherence) before returning a "Pass/Fail" decision.
- [ ] **Subtask 7: Wire Reviewer Agent into TDD Loop**: Modify `src/orchestrator/tddLoop.ts` to ensure that following a successful test pass by the Developer Agent, the `AutomatedReviewerAgent` evaluates the diff. Any rejection MUST trigger a new developer turn with the reviewer's feedback attached.

### Testing & Verification
- [ ] Create unit tests in `tests/architecture/PatternEnforcer.test.ts` to verify the module correctly extracts and formats constraints from a mock TAS document.
- [ ] Add unit tests for `tests/orchestrator/gates.test.ts` verifying that `PhaseApprovalGate` halts execution upon reaching the PRD/TAS step and successfully resumes immediately after simulated user approval.
- [ ] Implement Playwright E2E tests simulating an Architect Persona flow: Configure a test project with strict architectural limits (e.g., "No classes allowed"), observe the orchestrator blocking progress until the PRD is approved, and verify the `AutomatedReviewerAgent` rejects any submitted Object-Oriented code attempts from the Developer Agent.
- [ ] Write integration tests for the `AutomatedReviewerAgent` ensuring it successfully surfaces mocked security vulnerabilities (e.g., hardcoded secrets or SQL injection patterns) through standard static analysis tool integrations.