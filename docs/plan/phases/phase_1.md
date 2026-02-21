# Phase 1: Foundation - Project Structure & Persistence

## Objective
Establish the core architectural foundation of the `devs` system, including the monorepo structure, state persistence layer (SQLite), and the basic LangGraph orchestration machine. This phase ensures that the system is stateless, resumable, and provides a "Glass-Box" audit trail from the very first operation.

## Requirements Covered
- [9_ROADMAP-PHASE-001]: Core Orchestrator & State Persistence
- [TAS-097]: @devs/core orchestration engine
- [TAS-066]: SQLite as primary source of truth
- [TAS-010]: better-sqlite3 for state and audit trails
- [TAS-105]: Projects table schema
- [TAS-106]: Documents table schema
- [TAS-107]: Requirements table schema
- [TAS-108]: Epics table schema
- [TAS-109]: Tasks table schema
- [TAS-110]: Agent logs table schema
- [TAS-111]: Entropy events table schema
- [TAS-112]: Turn envelope schema
- [TAS-113]: Event types and payloads
- [9_ROADMAP-TAS-102]: Schema design for state.sqlite
- [9_ROADMAP-TAS-101]: LangGraph.js state machine implementation
- [TAS-009]: LangGraph.js orchestration engine
- [TAS-078]: Orchestration layer management
- [TAS-001]: Glass-Box transparency & auditability
- [3_MCP-MCP-002]: Flight Recorder pattern via SQLite
- [3_MCP-REQ-SYS-002]: State transition recording requirement
- [3_MCP-REQ-REL-004]: ACID state transitions
- [TAS-067]: ACID-compliant transactions
- [TAS-070]: Concurrency management (WAL mode)
- [TAS-073]: State checkpointing after node transitions
- [TAS-094]: Checkpoint object persistence
- [TAS-095]: Git snapshot association
- [TAS-114]: Git state correlation
- [TAS-012]: simple-git for atomic snapshots
- [TAS-055]: Git snapshots after successful tasks
- [1_PRD-REQ-REL-003]: Deterministic state recovery
- [1_PRD-REQ-SYS-002]: Stateless orchestrator & crash recovery
- [TAS-002]: Stateless & resumable orchestration
- [TAS-047]: Stateful determinism
- [9_ROADMAP-REQ-016]: State integrity & chaos testing
- [9_ROADMAP-REQ-017]: Schema validation for core tables
- [9_ROADMAP-REQ-014]: ACID state transitions in LangGraph
- [9_ROADMAP-TAS-103]: SQLiteSaver checkpointer implementation
- [9_ROADMAP-REQ-015]: Git-SQLite correlation for time-travel
- [9_ROADMAP-REQ-031]: DAG determinism
- [9_ROADMAP-REQ-038]: Rewind fidelity
- [9_ROADMAP-REQ-037]: State synchronization between CLI/Extension
- [1_PRD-REQ-INT-013]: Shared state file/SQLite
- [1_PRD-REQ-INT-004]: Real-time state synchronization
- [TAS-060]: Node.js v22.x LTS environment
- [TAS-005]: TypeScript 5.4+ Strict Mode
- [TAS-006]: pnpm monorepo structure
- [TAS-096]: Module architecture separation
- [TAS-040]: Generated project directory structure
- [TAS-104]: Top-level directory overview
- [TAS-061]: .devs/ directory requirement
- [TAS-076]: Version manifest in package.json
- [TAS-046]: Full Traceability requirement
- [TAS-054]: Snapshot-at-commit strategy
- [TAS-056]: Trace persistence requirement
- [TAS-103]: Cyclical Orchestration Graph
- [2_TAS-REQ-016]: OrchestrationGraph implementation
- [2_TAS-REQ-017]: StateRepository implementation
- [2_TAS-REQ-018]: EventBus implementation
- [1_PRD-REQ-NEED-MAKER-01]: Instant project scaffolding
- [9_ROADMAP-M-1]: Foundation Milestone
- [9_ROADMAP-M-2]: Intelligence Milestone
- [9_ROADMAP-M-3]: Autonomy Milestone
- [9_ROADMAP-PHASE-007]: Multi-Modal Interface phase
- [9_ROADMAP-PHASE-008]: Validation & Self-Hosting phase
- [9_ROADMAP-DOD-P1]: Foundation Definition of Done
- [9_ROADMAP-REQ-041]: AOD Density (initial setup)
- [1_PRD-REQ-INT-001]: CLI Operability basics
- [1_PRD-REQ-INT-006]: CLI State Control (pause/resume)
- [1_PRD-REQ-INT-005]: CLI Headless Mode (--json)
- [1_PRD-REQ-GOAL-002]: Elimination of architectural debt
- [1_PRD-REQ-PIL-004]: Agentic observability
- [TAS-082]: Input requirement (brief/journeys)
- [TAS-083]: Cyclical refinement pattern
- [TAS-075]: Data locality requirement
- [TAS-059]: Decision logs
- [TAS-069]: State recovery from docs/comments
- [UNKNOWN-601]: state.sqlite git strategy
- [UNKNOWN-602]: Hidden project files handling
- [8_RISKS-REQ-001]: State machine robustness
- [8_RISKS-REQ-041]: ACID-compliant commits
- [8_RISKS-REQ-094]: ACID-compliant state transitions
- [8_RISKS-REQ-043]: Automatic lockfile cleanup
- [8_RISKS-REQ-072]: Dirty workspace detection
- [8_RISKS-REQ-069]: Filesystem restoration
- [8_RISKS-REQ-070]: Relational state rollback
- [8_RISKS-REQ-073]: Schema drift reconciliation
- [8_RISKS-REQ-083]: Audit trail reconstruction
- [8_RISKS-REQ-084]: Roadmap reconstruction
- [8_RISKS-REQ-085]: State snapshot in commit footer
- [8_RISKS-REQ-093]: Local state hardening
- [8_RISKS-REQ-115]: State desync & ACID violations mitigation
- [8_RISKS-REQ-127]: Git history corruption mitigation
- [1_PRD-REQ-CON-002]: State persistence & recovery
- [1_PRD-REQ-MET-014]: State recovery success rate
- [4_USER_FEATURES-REQ-001]: Project lifecycle management
- [4_USER_FEATURES-REQ-013]: LangGraph state persistence
- [4_USER_FEATURES-REQ-086]: Zero-external-dependency storage

## Detailed Deliverables & Components
### Monorepo Scaffolding
- Setup pnpm workspace with modules: `@devs/core`, `@devs/agents`, `@devs/sandbox`, `@devs/memory`, `@devs/mcp`, `@devs/cli`, `@devs/vscode`.
- Configure TypeScript strict mode and linting rules across all packages.

### Relational State Layer
- Implement `state.sqlite` schema with tables for projects, documents, requirements, epics, tasks, agent logs, and entropy events.
- Develop `@devs/core/persistence` using `better-sqlite3` with WAL mode and ACID transactions.

### LangGraph Orchestrator
- Implement the core state machine using LangGraph.js.
- Create `SQLiteSaver` checkpointer to persist every node transition.
- Develop the cyclical implementation nodes (Research -> Design -> Distill -> Implementation -> Verification).

### Git Integration
- Integrate `simple-git` for atomic state snapshots.
- Implement logic to correlate Git commit hashes with SQLite task IDs for "Time-Travel" capability.

## Technical Considerations
- Ensuring WAL mode is correctly configured for concurrent access by CLI and VSCode Extension.
- Managing large BLOBs in SQLite (checkpoints and reasoning logs) without performance degradation.
- Handling cross-platform path normalization using `upath`.
