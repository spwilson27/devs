# Phase 4: Self-Hosting & Agentic Development

## Objective
Achieve the "Self-Hosting" milestone (SO-1) where `devs` is capable of orchestrating its own development tasks. This phase transitions the project from manual human development to AI-agent-driven development using the Glass-Box MCP interface and standardized TDD workflows.

## Requirements Covered
- [3_MCP_DESIGN-REQ-006]: get_run for self-hosting diagnostics
- [3_MCP_DESIGN-REQ-027]: Agent diagnostic read sequence
- [3_MCP_DESIGN-REQ-028]: Agent non-terminal run check
- [3_MCP_DESIGN-REQ-029]: Agent loop classification
- [3_MCP_DESIGN-REQ-030]: Agent targeted fix rule
- [3_MCP_DESIGN-REQ-031]: Agent speculative edit prohibition
- [3_MCP_DESIGN-REQ-032]: Agent requirement selection
- [3_MCP_DESIGN-REQ-033]: Agent Red-phase confirmation
- [3_MCP_DESIGN-REQ-034]: Agent Green-phase confirmation
- [3_MCP_DESIGN-REQ-035]: Agent presubmit confirmation
- [3_MCP_DESIGN-REQ-036]: Agent test annotation requirement
- [3_MCP_DESIGN-REQ-037]: Agent TDD loop enforcement
- [3_MCP_DESIGN-REQ-038]: Agent workflow submission via devs submit
- [3_MCP_DESIGN-REQ-039]: Agent log streaming requirement
- [3_MCP_DESIGN-REQ-040]: Agent classification via get_stage_output
- [3_MCP_DESIGN-REQ-041]: Agent targeted fix based on classification
- [3_MCP_DESIGN-REQ-046]: Tool failure recovery
- [3_MCP_DESIGN-REQ-047]: Tool timeout handling
- [3_MCP_DESIGN-REQ-048]: Tool resource exhausted retry
- [3_MCP_DESIGN-REQ-049]: Tool invalid params recovery
- [3_MCP_DESIGN-REQ-050]: Tool parse error recovery
- [3_MCP_DESIGN-REQ-051]: Tool internal error escalation
- [3_MCP_DESIGN-REQ-052]: Tool connection loss recovery
- [3_MCP_DESIGN-REQ-053]: Tool write lock timeout retry
- [3_MCP_DESIGN-REQ-054]: Tool list_runs pagination loop
- [3_MCP_DESIGN-REQ-058]: get_run status terminal check
- [3_MCP_DESIGN-REQ-079]: list_runs loop termination
- [3_MCP_DESIGN-REQ-080]: get_run state consistency verification
- [3_MCP_DESIGN-REQ-081]: get_run run_id validation check
- [3_MCP_DESIGN-REQ-083]: stream_logs sequence verification
- [3_MCP_DESIGN-REQ-084]: stream_logs keepalive check
- [3_MCP_DESIGN-REQ-085]: list_workflows filter application
- [3_MCP_DESIGN-REQ-086]: get_workflow normalization check
- [3_MCP_DESIGN-REQ-087]: write_workflow_definition atomic verification
- [3_MCP_DESIGN-REQ-089]: cancel_run atomic verification
- [3_MCP_DESIGN-REQ-090]: retry_stage attempt reset check
- [3_MCP_DESIGN-REQ-091]: retry_stage atomic verification
- [3_MCP_DESIGN-REQ-AC-1.01]: list_runs pagination behavior
- [3_MCP_DESIGN-REQ-AC-1.19]: get_run behavior
- [3_MCP_DESIGN-REQ-AC-5.10]: assert_stage_output behavior
- [3_MCP_DESIGN-REQ-BR-003]: Agent self-correction
- [3_MCP_DESIGN-REQ-BR-004]: Agent diagnostic sequence
- [3_MCP_DESIGN-REQ-BR-007]: Agent classify compile error
- [3_MCP_DESIGN-REQ-BR-008]: Agent classify test failure
- [3_MCP_DESIGN-REQ-BR-009]: Agent classify coverage failure
- [3_MCP_DESIGN-REQ-BR-010]: Agent classify clippy error
- [3_MCP_DESIGN-REQ-BR-011]: Agent classify traceability failure
- [3_MCP_DESIGN-REQ-BR-012]: Agent classify timeout
- [3_MCP_DESIGN-REQ-BR-018]: Agent classify unclassified
- [AC-RLOOP-001] [AC-RLOOP-002] [AC-RLOOP-003] [AC-RLOOP-004] [AC-RLOOP-005] [AC-ROAD-P4-001] [AC-ROAD-P4-002] [AC-ROAD-P4-003] [AC-ROAD-P4-004] [AC-ROAD-P4-005] [AC-ROAD-P4-006] [ROAD-P4-DEP-001] [ROAD-P4-DEP-002] [ROAD-P4-DEP-003]

## Detailed Deliverables & Components
### Bootstrap Verification (COND-001–003)
- Verify `devs-server` port binding on all three platforms simultaneously.
- Successfully submit and complete a `presubmit-check` workflow via `devs-cli`.
- Verify all workflow stages reach a `Completed` terminal state on all platforms.

### Agentic Development Workflows
- Define and commit standard workflow TOML files (`tdd-red`, `tdd-green`, `presubmit-check`).
- Implement the mandatory agent diagnostic read-before-write sequence.
- Establish the Red-Green-Refactor TDD loop using `devs` tools.

### Self-Hosting Infrastructure
- Finalize the `.devs/workflows/` repository of operational workflows.
- Configure agent pools to include actual agent CLIs (Claude, Gemini, etc.) for real tasks.
- Validate the "Self-Hosting Attempt" sequence as defined in the Roadmap.

## Technical Considerations
- **Bootstrap Deadlock (RISK-009):** Ensure Phase 0–3 deliverables are stable enough to pass the bootstrap check without manual intervention.
- **Agent Reliability:** Implement robust error classification and retry logic for agents to handle transient environment or tool failures.
- **Traceability:** Maintain 100% requirement-to-test mapping as agents begin generating code.
