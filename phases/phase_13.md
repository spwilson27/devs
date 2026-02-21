# Phase 13: Reliability - State Recovery & Error Handling

## Objective
Implement the reliability, state recovery, and "Time-Travel" features. This phase focuses on the `devs rewind` and `devs resume` capabilities, ensuring that the system can restore both the filesystem (Git) and the relational state (SQLite) to any historical Task ID with 100% fidelity. It also covers robust error handling for network loss, API rate limits, and agentic looping.

## Requirements Covered
- [TAS-047]: Stateful determinism requirement
- [TAS-069]: State recovery from docs/comments
- [1_PRD-REQ-REL-003]: Deterministic state recovery logic
- [1_PRD-REQ-SYS-002]: Crash recovery (Stateless orchestrator)
- [1_PRD-REQ-INT-006]: CLI state control (Pause/Resume/Rewind)
- [1_PRD-REQ-UI-011]: Project rewind (Time-Travel) UI
- [1_PRD-REQ-UI-012]: Entropy pause presentation
- [3_MCP-REQ-REL-003]: Deterministic state recovery requirement
- [2_TAS-REQ-008]: rewind_to_task tool implementation
- [2_TAS-REQ-019]: HumanInTheLoopManager for gates
- [9_ROADMAP-TAS-706]: Implement devs rewind command
- [9_ROADMAP-REQ-014]: ACID state transitions logic
- [9_ROADMAP-REQ-038]: Rewind fidelity benchmark
- [9_ROADMAP-REQ-047]: KPI: State Recovery Time < 2s
- [5_SECURITY_DESIGN-REQ-SEC-SD-074]: Git-DB correlation for rewind
- [5_SECURITY_DESIGN-REQ-SEC-SD-076]: Forensic sandbox persistence
- [5_SECURITY_DESIGN-REQ-SEC-RSK-902]: Redaction false positive management
- [8_RISKS-REQ-001]: State machine robustness logic
- [8_RISKS-REQ-042]: Git-DB verification on resume
- [8_RISKS-REQ-043]: Automatic lockfile cleanup
- [8_RISKS-REQ-069]: Filesystem restoration (git checkout force)
- [8_RISKS-REQ-070]: Relational state rollback logic
- [8_RISKS-REQ-071]: Vector memory pruning on rewind
- [8_RISKS-REQ-072]: Dirty workspace detection logic
- [8_RISKS-REQ-073]: Schema drift reconciliation
- [8_RISKS-REQ-074]: Agent suspension on failure
- [8_RISKS-REQ-075]: User intervention detection feature
- [8_RISKS-REQ-076]: Contextual ingestion after resume logic
- [8_RISKS-REQ-081]: Model failover logic
- [8_RISKS-REQ-082]: State preservation across providers logic
- [8_RISKS-REQ-083]: Audit trail reconstruction logic
- [8_RISKS-REQ-084]: Roadmap reconstruction logic
- [8_RISKS-REQ-085]: State snapshot in commit footer
- [8_RISKS-REQ-087]: Soft rewind implementation
- [8_RISKS-REQ-090]: Recovery workflow after budget hit
- [8_RISKS-REQ-095]: Git-DB verification on resume requirement
- [8_RISKS-REQ-115]: State desync mitigation
- [8_RISKS-REQ-127]: Git history corruption mitigation
- [4_USER_FEATURES-REQ-002]: Deterministic rewind (Time-Travel) implementation
- [4_USER_FEATURES-REQ-013]: LangGraph state persistence implementation
- [4_USER_FEATURES-REQ-041]: Dirty workspace rewind block logic
- [4_USER_FEATURES-REQ-043]: Graceful suspension on interruption
- [4_USER_FEATURES-REQ-064]: Entropy pivot prompts UI
- [4_USER_FEATURES-REQ-066]: AIC interaction dialogs
- [4_USER_FEATURES-REQ-067]: Multi-choice resolution proposals
- [4_USER_FEATURES-REQ-071]: Automated state integrity checks
- [4_USER_FEATURES-REQ-074]: Deterministic rollback implementation
- [4_USER_FEATURES-REQ-075]: Memory syncing on rewind (Vector DB)
- [4_USER_FEATURES-REQ-077]: Strategy override feature implementation
- [4_USER_FEATURES-REQ-079]: Strategy pivot on loop logic
- [4_USER_FEATURES-REQ-080]: Entropy pause feature implementation
- [3_MCP-TAS-095]: Rewind execution logic (Reset FS/Relational/Vector)
- [3_MCP-TAS-092]: State introspection during failures
- [3_MCP-TAS-091]: Heuristic analysis for flaky tests
- [3_MCP-TAS-090]: Retry protocol implementation
- [3_MCP-TAS-073]: Tool timeout status handling
- [3_MCP-TAS-072]: Partial completions resume protocol
- [3_MCP-TAS-071]: Malformed response retry protocol
- [3_MCP-TAS-052]: Strategy blacklist usage
- [3_MCP-TAS-021]: Fail sandbox preservation
- [3_MCP-TAS-019]: Entropy detection review turn
- [3_MCP-RISK-102]: Schema evolution strategy
- [3_MCP-RISK-201]: Tool hallucination mitigation
- [3_MCP-RISK-301]: Sandbox latency mitigation
- [3_MCP-RISK-302]: Dependency deadlock mitigation
- [3_MCP-RISK-303]: Context drift mitigation
- [3_MCP-RISK-501]: Semantic drift mitigation
- [3_MCP-RISK-502]: Vector retrieval noise filtering
- [3_MCP-RISK-503]: Context poisoning mitigation
- [UNKNOWN-802]: Transient sandbox flakiness handling
- [RISK-401]: Sandbox latency impact mitigation
- [RISK-402]: Extension memory limits handling
- [RISK-601]: Monorepo complexity handling
- [RISK-602]: Documentation drift mitigation
- [RISK-801]: Non-UTF8 tool output handling
- [RISK-802]: Context window exhaustion handling
- [9_ROADMAP-RISK-401]: Deep LangGraph recursion performance
- [9_ROADMAP-REQ-006]: Task Failure Gate (HITL) logic

## Detailed Deliverables & Components
### Deterministic Rewind (Time-Travel)
- Implement `devs rewind` command that restores Git HEAD and SQLite state.
- Build the `VectorPruner` to remove LanceDB embeddings generated after the target rewind point.
- Develop the "Glitch/Desaturation" UI feedback during state restoration.

### Crash Recovery (Resume)
- Implement the `ResumeManager` that verifies repository HEAD matches the last successful task in SQLite.
- Develop the "Dirty Workspace Detection" logic that blocks rewinds/resumes if manual changes are uncommitted.
- Build the automatic lockfile cleanup for stale Git/SQLite journals on startup.

### Error & Loop Handling
- Implement the "Strategy Blacklist" to prevent agents from repeating failed implementation attempts.
- Develop the `PartialCompletion` resume protocol for LLM token limit hits.
- Build the "Expert Debugger" mode allowing agents to use `inspect_state` during failure implementation turns.

### Human-in-the-Loop Recovery
- Implement the `ConflictAnalysis` report generator for user intervention.
- Develop the `ArbitrationAgent` to resolve deep disagreements between Developer and Reviewer agents.
- Build the "Pivot Rationalization" prompts to notify users when strategy shifts occur.

## Technical Considerations
- Ensuring `git checkout --force` doesn't lead to permanent data loss of user-provided fixes.
- Managing the performance impact of deep LangGraph recursion on Node.js memory limits.
- Handling schema drift reconciliation when rewinding through database migrations.
