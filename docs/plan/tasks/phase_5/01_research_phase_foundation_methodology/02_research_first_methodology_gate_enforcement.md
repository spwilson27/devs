# Task: Research-First Methodology Gate Enforcement (Sub-Epic: 01_Research Phase Foundation & Methodology)

## Covered Requirements
- [1_PRD-REQ-PIL-001], [3_MCP-REQ-GOAL-001], [8_RISKS-REQ-065]

## 1. Initial Test Written
- [ ] Create `tests/phase_5/test_research_gate.py`.
- [ ] Write `test_pipeline_blocked_before_research_approval` — instantiate the pipeline orchestrator (e.g., `DevsPipeline`) with a project context whose research phase status is `PhaseStatus.PENDING`, then call `pipeline.advance_to_architecture()` and assert it raises a `ResearchGateError` (or equivalent `PipelineBlockedError`).
- [ ] Write `test_pipeline_blocked_when_research_in_progress` — same as above but with `PhaseStatus.IN_PROGRESS`. Assert the same `ResearchGateError` is raised.
- [ ] Write `test_pipeline_blocked_when_research_awaiting_approval` — same with `PhaseStatus.AWAITING_APPROVAL`. Assert `ResearchGateError` is raised.
- [ ] Write `test_pipeline_blocked_when_research_failed` — same with `PhaseStatus.FAILED`. Assert `ResearchGateError` is raised.
- [ ] Write `test_pipeline_advances_only_when_research_approved` — set status to `PhaseStatus.APPROVED`, call `pipeline.advance_to_architecture()`, and assert no error is raised and the returned phase is `PipelinePhase.ARCHITECTURE`.
- [ ] Write `test_research_gate_error_message` — assert the `ResearchGateError` message contains the string `"Research phase must be approved"` (exact string TBD by implementation, but must clearly communicate the gate condition).
- [ ] Write `test_mcp_gate_enforcement` — if an MCP tool endpoint exists for architecture generation (e.g., `generate_architecture`), mock-call it with an unapproved research context and assert it returns an error payload with `"gate": "research_not_approved"`.
- [ ] Write `test_no_code_generation_before_research` — assert that calling any code generation entrypoint (e.g., `pipeline.generate_code()`) without approved research raises `ResearchGateError`.
- [ ] Confirm all tests fail (red) before implementation.

## 2. Task Implementation
- [ ] Create `devs/pipeline/gates.py` (or add to existing pipeline module):
  - Define `ResearchGateError(Exception)` with a descriptive message: `"Research phase must be approved before proceeding. Current status: {status}"`.
  - Implement `enforce_research_gate(phase_status: PhaseStatus) -> None` that raises `ResearchGateError` unless `phase_status == PhaseStatus.APPROVED`.
- [ ] In the pipeline orchestrator class (e.g., `DevsPipeline` in `devs/pipeline/pipeline.py`):
  - Inject or retrieve the `ResearchManager.get_status()` result before any transition to `ARCHITECTURE`, `TASK_BREAKDOWN`, or `CODE_GENERATION` phases.
  - Call `enforce_research_gate(status)` at the top of `advance_to_architecture()`, `advance_to_task_breakdown()`, and `advance_to_code_generation()` (or their equivalents in the project's state machine).
  - Ensure these guards run even when the methods are invoked via MCP tool calls (i.e., the guard is in the core method, not just a CLI wrapper).
- [ ] Create `devs/pipeline/phases.py` (if not already present):
  - Define `PipelinePhase` enum with at minimum: `RESEARCH`, `ARCHITECTURE`, `TASK_BREAKDOWN`, `CODE_GENERATION`.
- [ ] If the project exposes MCP tool handlers, add gate enforcement to the MCP handler for `generate_architecture` and `generate_code` tools: call `enforce_research_gate` early in the handler and return a structured error response (not an exception) with `{"error": "research_not_approved", "gate": "research_not_approved", "current_status": "<status>"}`.
- [ ] Add a project-level constant or config key `RESEARCH_FIRST=True` in `devs/config.py` (or equivalent) — this is the feature flag that enables/disables the gate (default must be `True`; disabling is only for testing).

## 3. Code Review
- [ ] Confirm `enforce_research_gate` is a pure function (no side effects) so it is easily testable in isolation.
- [ ] Confirm the gate is enforced in the core pipeline methods, NOT only at the CLI or API boundary — this prevents bypassing via direct Python API calls.
- [ ] Confirm `ResearchGateError` inherits from a common project-level `PipelineError` base class (if one exists) for consistent error handling.
- [ ] Confirm the MCP handler returns a structured error dict (not raises an exception) — MCP callers expect JSON-serializable responses.
- [ ] Confirm the `RESEARCH_FIRST` feature flag is documented in `docs/config.md` or equivalent.
- [ ] Confirm the gate logic does NOT contain any business logic — it is purely a state assertion. Business logic for research belongs in `ResearchManager`.
- [ ] Verify this directly implements the "Architecture-First Differentiator" (8_RISKS-REQ-065): the gate is what technically distinguishes devs from general-purpose assistants that jump straight to code generation.

## 4. Run Automated Tests to Verify
- [ ] Run `pytest tests/phase_5/test_research_gate.py -v` and confirm all tests pass.
- [ ] Run the full suite `pytest --tb=short` and confirm no regressions.
- [ ] Run coverage: `pytest --cov=devs.pipeline.gates --cov-report=term-missing` and confirm 100% branch coverage on `enforce_research_gate`.
- [ ] Manually verify: attempt to call `pipeline.advance_to_architecture()` without an approved research phase and confirm a `ResearchGateError` is raised in the Python REPL.

## 5. Update Documentation
- [ ] Add a section "Research Gate" to `docs/pipeline.md` (or equivalent) explaining: no pipeline phase beyond `RESEARCH` can begin until `PhaseStatus.APPROVED` is set, referencing requirements `1_PRD-REQ-PIL-001`, `3_MCP-REQ-GOAL-001`, and `8_RISKS-REQ-065`.
- [ ] Document `ResearchGateError` in the error catalog (`docs/errors.md` or equivalent).
- [ ] Update `docs/architecture_first.md` (create if absent) with a section "Why Research-First Matters" — state that devs enforces research completion as a hard gate, distinguishing it from code-first AI tools (per `8_RISKS-REQ-065`).
- [ ] Update agent memory file `docs/agent_memory/phase_5.md`: "ResearchGate enforced at pipeline level. `enforce_research_gate()` is called before any architecture or code-generation step. MCP handlers also enforce this gate."

## 6. Automated Verification
- [ ] Run `pytest tests/phase_5/test_research_gate.py -v --tb=short` and assert exit code `0`.
- [ ] Run `python -c "from devs.pipeline.gates import ResearchGateError, enforce_research_gate; enforce_research_gate('PENDING')"` and assert the output contains `ResearchGateError`.
- [ ] Run `pytest --co -q tests/phase_5/test_research_gate.py` and assert at least 8 test items are collected.
- [ ] Run `grep -r "enforce_research_gate" devs/pipeline/` and confirm the function is referenced in at least 2 pipeline transition methods.
