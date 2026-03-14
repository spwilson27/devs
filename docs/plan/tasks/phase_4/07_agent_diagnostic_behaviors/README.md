# Sub-Epic: 07_Agent Diagnostic Behaviors

## Overview
This sub-epic implements the diagnostic behaviors that AI agents must follow when developing `devs` using the Glass-Box MCP interface. These behaviors ensure systematic, verifiable agentic development following the TDD Red-Green-Refactor loop with mandatory diagnostic sequences.

## Covered Requirements
| Requirement ID | Description | Primary Task |
|----------------|-------------|--------------|
| [3_MCP_DESIGN-REQ-027] | Agent MUST use filesystem MCP server (not shell) to read/write/verify source files | Task 04 |
| [3_MCP_DESIGN-REQ-028] | Tests MUST have `// Covers: <REQ-ID>` annotation before Red stage | Task 02, Task 05 |
| [3_MCP_DESIGN-REQ-029] | Agent MUST verify test is genuinely failing (exit code 1) before implementation | Task 03, Task 06 |
| [3_MCP_DESIGN-REQ-030] | Agent MUST run full presubmit-check after every Green stage | Task 03, Task 07 |
| [3_MCP_DESIGN-REQ-BR-004] | Agent MUST NOT cache MCP address across process restarts | Task 01, Task 08 |

## Task List
| Task | Name | Dependencies | Status |
|------|------|--------------|--------|
| [01](01_diagnostic_investigation_sequence.md) | Mandatory Diagnostic Investigation Sequence | none | Pending |
| [02](02_non_terminal_run_recovery.md) | In-Flight Run Recovery Logic | 01 | Pending |
| [03](03_failure_classification_and_targeted_fix.md) | Failure Classification & Targeted Fix Protocol | 01, 06 | Pending |
| [04](04_filesystem_mcp_enforcement.md) | Filesystem MCP Enforcement for Source Code Operations | none | Pending |
| [05](05_test_annotation_enforcement.md) | Test Annotation Enforcement for TDD Workflow | none | Pending |
| [06](06_test_failure_verification.md) | Test Failure Verification Before Implementation | 05 | Pending |
| [07](07_presubmit_enforcement.md) | Presubmit Check Enforcement After Green Stage | 06 | Pending |
| [08](08_mcp_address_discovery.md) | MCP Address Discovery Protocol (Non-Caching) | none | Pending |

## Shared Components
This sub-epic consumes the following shared components:
- **devs-mcp**: MCP server implementation and client
- **devs-grpc**: gRPC service definitions and types
- **devs-checkpoint**: Git-backed state persistence
- **devs-scheduler**: Workflow scheduling engine
- **./do Entrypoint Script**: Test and presubmit execution
- **Traceability & Coverage Infrastructure**: Annotation validation and coverage gates
- **Server Discovery Protocol**: MCP address discovery mechanism

## TDD Workflow Integration
The diagnostic behaviors integrate with the TDD workflow as follows:

```
Red Stage (Write Failing Test)
├─ Task 05: Verify // Covers: annotation is valid
├─ Task 06: Verify test genuinely fails (exit code 1)
└─ If test passes without implementation → fix test (defective)

Green Stage (Implement Until Passing)
├─ Implement code to make test pass
├─ Run tests locally to verify pass
└─ Task 07: Submit presubmit-check and wait for all stages

Presubmit Verification
├─ Task 07: Wait for all stages to reach terminal status
├─ Task 07: Call assert_stage_output on each stage
├─ If any assertion fails → Task 03: Classify failure
└─ If all pass → task complete

Failure Handling
├─ Task 01: Execute 4-step diagnostic sequence
│   ├─ get_stage_output
│   ├─ get_run
│   ├─ get_pool_state
│   └─ list_checkpoints
├─ Task 03: Classify failure into one of 8 categories
├─ Apply targeted fix based on classification
└─ Retry presubmit
```

## Dependency Graph
```
01_diagnostic_investigation_sequence (no deps)
├─ 02_non_terminal_run_recovery (depends on 01)
├─ 03_failure_classification_and_targeted_fix (depends on 01, 06)
├─ 04_filesystem_mcp_enforcement (no deps)
├─ 05_test_annotation_enforcement (no deps)
│   └─ 06_test_failure_verification (depends on 05)
│       └─ 07_presubmit_enforcement (depends on 06)
└─ 08_mcp_address_discovery (no deps)
```

## Execution Order
For optimal parallel development, tasks can be executed in this order:

**Wave 1 (Independent):**
- Task 01: Diagnostic Investigation Sequence
- Task 04: Filesystem MCP Enforcement
- Task 05: Test Annotation Enforcement
- Task 08: MCP Address Discovery

**Wave 2 (Depends on Wave 1):**
- Task 02: Run Recovery (depends on 01)
- Task 06: Test Failure Verification (depends on 05)

**Wave 3 (Depends on Wave 2):**
- Task 03: Failure Classification (depends on 01, 06)
- Task 07: Presubmit Enforcement (depends on 06)

## Verification Criteria
All tasks in this sub-epic must pass:
1. `./do presubmit` - Full presubmit check passes
2. `./do lint` - No clippy warnings or formatting issues
3. `./do coverage` - ≥90% unit coverage for new code
4. Traceability - All test functions have valid `// Covers:` annotations
5. E2E Coverage - Each task contributes to 50% CLI E2E gate

## Agent Development Guidelines
When executing tasks in this sub-epic, AI agents must:
1. **Read the task document fully** before starting implementation
2. **Write tests first** (TDD Red stage) following the detailed instructions
3. **Implement code** to make tests pass (TDD Green stage)
4. **Run presubmit-check** after every Green stage (Task 07)
5. **Execute diagnostic sequence** on any failure (Task 01)
6. **Classify failures** before applying fixes (Task 03)
7. **Use filesystem MCP** for all source file operations (Task 04)
8. **Re-discover MCP address** on each session restart (Task 08)
