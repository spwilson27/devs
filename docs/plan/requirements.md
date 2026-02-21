# Ordered Master Requirements Document: Project devs

## **Block 0: Core Architecture & Persistence**

### **[9_ROADMAP-REQ-041]** AOD Density
- **Type:** Functional
- **Description:** AOD Density: 1:1 ratio between production modules and `.agent.md` documentation files.
- **Source:** Project Roadmap (specs/9_project_roadmap.md)
- **Dependencies:** None

### **[1_PRD-REQ-INT-001]** CLI Operability
- **Type:** Functional
- **Description:** The system must be operable via a terminal interface (e.g., `devs init`, `devs run`, `devs status`).
- **Source:** PRD (Product Requirements Document) (specs/1_prd.md)
- **Dependencies:** None

### **[1_PRD-REQ-INT-006]** CLI State Control
- **Type:** Functional
- **Description:** Commands to `pause`, `resume`, `rewind` (to specific task/epic), and `skip` current operations.
- **Source:** PRD (Product Requirements Document) (specs/1_prd.md)
- **Dependencies:** None

### **[9_ROADMAP-REQ-SYS-001]** Context Exhaustion  `ContextPruner` executes Flash-model summarization turn.
- **Type:** Functional
- **Description:** Context Exhaustion  `ContextPruner` executes Flash-model summarization turn.
- **Source:** Project Roadmap (specs/9_project_roadmap.md)
- **Dependencies:** None

### **[9_ROADMAP-REQ-010]** Context Injection
- **Type:** Functional
- **Description:** Context Injection: Every turn in the loop is preceded by a `ContextRefresh` where the `ContextPruner` ensures the 1M token window contains the PRD, TAS, and the active task requirements.
- **Source:** Project Roadmap (specs/9_project_roadmap.md)
- **Dependencies:** None

### **[9_ROADMAP-REQ-032]** Cost Heuristics
- **Type:** Functional
- **Description:** Cost Heuristics: The `TokenEstimate` must be within 25% of actual usage for the "Foundation" milestone benchmark.
- **Source:** Project Roadmap (specs/9_project_roadmap.md)
- **Dependencies:** None

### **[9_ROADMAP-REQ-031]** DAG Determinism
- **Type:** Functional
- **Description:** DAG Determinism: The Task DAG must be a Directed Acyclic Graph with zero cycles and clear dependency paths.
- **Source:** Project Roadmap (specs/9_project_roadmap.md)
- **Dependencies:** None

### **[9_ROADMAP-REQ-046]** Entropy Buffer
- **Type:** Functional
- **Description:** Entropy Buffer: A 20% "Research & Strategy" buffer is allocated within P6 to account for the `StrategyPivotAgent` and human-in-the-loop recovery cycles.
- **Source:** Project Roadmap (specs/9_project_roadmap.md)
- **Dependencies:** None

### **[9_ROADMAP-REQ-012]** Entropy Detection
- **Type:** Functional
- **Description:** Entropy Detection: The system hashes the last 3 terminal outputs. If hashes match, the `EntropyDetector` interrupts the loop and invokes a `PivotAgent` to rethink the implementation strategy from first principles.
- **Source:** Project Roadmap (specs/9_project_roadmap.md)
- **Dependencies:** None

### **[9_ROADMAP-REQ-035]** Entropy Prevention
- **Type:** Functional
- **Description:** Entropy Prevention: `EntropyDetector` must pause the orchestrator within 1 turn of a detected hash-match loop.
- **Source:** Project Roadmap (specs/9_project_roadmap.md)
- **Dependencies:** None

### **[9_ROADMAP-REQ-015]** Git-SQLite Correlation
- **Type:** Functional
- **Description:** Git-SQLite Correlation: Every `CommitNode` execution updates the `tasks` table with the `git_commit_hash`. This allows the "Time-Travel" feature (`devs rewind`) to perfectly synchronize the filesystem and the database.
- **Source:** Project Roadmap (specs/9_project_roadmap.md)
- **Dependencies:** None

### **[9_ROADMAP-REQ-040]** Global Audit
- **Type:** Functional
- **Description:** Global Audit: Final "Full Project Validation" must run all tests (unit, integration, e2e) in a clean, non-persistent sandbox with 100% pass rate.
- **Source:** Project Roadmap (specs/9_project_roadmap.md)
- **Dependencies:** None

### **[9_ROADMAP-REQ-042]** Global Validation
- **Type:** Functional
- **Description:** Global Validation: Implementation of "Global Validation" phase for full project requirement audit.
- **Source:** Project Roadmap (specs/9_project_roadmap.md)
- **Dependencies:** None

### **[TAS-082]** Input Requirement
- **Type:** Functional
- **Description:** User provides a brief and journeys as the starting point for the orchestration.
- **Source:** TAS (Technical Architecture Specification) (specs/2_tas.md)
- **Dependencies:** None

### **[9_ROADMAP-REQ-048]** KPI: Research Citation Count > 5; Requirement Coverage 100%.
- **Type:** Functional
- **Description:** KPI: Research Citation Count > 5; Requirement Coverage 100%.
- **Source:** Project Roadmap (specs/9_project_roadmap.md)
- **Dependencies:** None

### **[9_ROADMAP-REQ-049]** KPI: Task Autonomy Rate (TAR) > 85%; Time-to-First-Commit (TTFC) < 1hr.
- **Type:** Functional
- **Description:** KPI: Task Autonomy Rate (TAR) > 85%; Time-to-First-Commit (TTFC) < 1hr.
- **Source:** Project Roadmap (specs/9_project_roadmap.md)
- **Dependencies:** None

### **[9_ROADMAP-REQ-019]** Memory Efficiency
- **Type:** Functional
- **Description:** Memory Efficiency: `ContextPruner` must successfully compress a 1M token context into a <200k token summary without losing P3 (Must-have) requirements.
- **Source:** Project Roadmap (specs/9_project_roadmap.md)
- **Dependencies:** None

### **[9_ROADMAP-REQ-013]** Multi-Agent Verification (ReviewNode)
- **Type:** Functional
- **Description:** Multi-Agent Verification (ReviewNode): Verification is performed by a separate agent instance with a "Hostile Auditor" prompt. It validates:
- **Source:** Project Roadmap (specs/9_project_roadmap.md)
- **Dependencies:** None

### **[9_ROADMAP-REQ-036]** Real-time Streaming
- **Type:** Functional
- **Description:** Real-time Streaming: VSCode Webview must maintain 60FPS during high-frequency log updates from Gemini 3 Flash.
- **Source:** Project Roadmap (specs/9_project_roadmap.md)
- **Dependencies:** None

### **[9_ROADMAP-REQ-030]** Requirement Coverage
- **Type:** Functional
- **Description:** Requirement Coverage: The `RTI` (Requirement Traceability Index) must be 1.0. 100% of requirements must be mapped to Task IDs.
- **Source:** Project Roadmap (specs/9_project_roadmap.md)
- **Dependencies:** None

### **[9_ROADMAP-REQ-043]** Requirement: Implement a "Protocol Freeze" milestone at the end of P1 to prevent
- **Type:** Functional
- **Description:** Requirement: Implement a "Protocol Freeze" milestone at the end of P1 to prevent breaking changes during the implementation of P6.
- **Source:** Project Roadmap (specs/9_project_roadmap.md)
- **Dependencies:** None

### **[9_ROADMAP-REQ-034]** Reviewer Autonomy
- **Type:** Functional
- **Description:** Reviewer Autonomy: The Reviewer Agent must successfully catch and revert at least one "Deliberate Anti-Pattern" (e.g., hardcoded secret) in the implementation.
- **Source:** Project Roadmap (specs/9_project_roadmap.md)
- **Dependencies:** None

### **[9_ROADMAP-REQ-038]** Rewind Fidelity
- **Type:** Functional
- **Description:** Rewind Fidelity: `devs rewind` must restore the filesystem and SQLite state to a previous Task ID with 100% checksum match.
- **Source:** Project Roadmap (specs/9_project_roadmap.md)
- **Dependencies:** None

### **[9_ROADMAP-REQ-018]** SAOP Compliance
- **Type:** Functional
- **Description:** SAOP Compliance: The `Structured Agent-Orchestrator Protocol` must validate 100% of agent envelopes against the versioned JSON schema.
- **Source:** Project Roadmap (specs/9_project_roadmap.md)
- **Dependencies:** None

### **[9_ROADMAP-REQ-039]** Self-Host Success
- **Type:** Functional
- **Description:** Self-Host Success: 'devs' must successfully implement a minor feature for its own core orchestrator using the autonomous P6 loop.
- **Source:** Project Roadmap (specs/9_project_roadmap.md)
- **Dependencies:** None

### **[9_ROADMAP-REQ-016]** State Integrity
- **Type:** Functional
- **Description:** State Integrity: `SQLiteSaver` must pass "Chaos Testing" (simulated process kills during high-frequency writes) with 0% state corruption.
- **Source:** Project Roadmap (specs/9_project_roadmap.md)
- **Dependencies:** None

### **[9_ROADMAP-REQ-037]** State Synchronization
- **Type:** Functional
- **Description:** State Synchronization: 0ms desync between CLI TUI and VSCode UI when both are active on the same `.devs` folder.
- **Source:** Project Roadmap (specs/9_project_roadmap.md)
- **Dependencies:** None

### **[9_ROADMAP-REQ-045]** Task Granularity
- **Type:** Functional
- **Description:** Task Granularity: The Distiller must enforce a "Task Complexity Cap." Any task estimated to require > 10 implementation turns must be recursively decomposed.
- **Source:** Project Roadmap (specs/9_project_roadmap.md)
- **Dependencies:** None

### **[1_PRD-REQ-INT-002]** VSCode Extension
- **Type:** Functional
- **Description:** Provide a VSCode extension for project management and monitoring.
- **Source:** PRD (Product Requirements Document) (specs/1_prd.md)
- **Dependencies:** None

### **[9_ROADMAP-REQ-014]** ACID State Transitions
- **Type:** Non-Functional
- **Description:** ACID State Transitions: Every node transition in the diagram (e.g., `Green` to `Sandbox2`) is recorded as a LangGraph checkpoint in SQLite. If the process is killed mid-turn, the system resumes from the exact same "Thought" or "Action" turn.
- **Source:** Project Roadmap (specs/9_project_roadmap.md)
- **Dependencies:** None

### **[9_ROADMAP-TAS-103]** Implement `SQLiteSaver` checkpointer for ACID-compliant state snapshots, ensurin
- **Type:** Non-Functional
- **Description:** Implement `SQLiteSaver` checkpointer for ACID-compliant state snapshots, ensuring zero data loss on process crash.
- **Source:** Project Roadmap (specs/9_project_roadmap.md)
- **Dependencies:** None

### **[9_ROADMAP-REQ-047]** KPI: State Recovery Time < 2s; Secret Redaction Accuracy 100%.
- **Type:** Non-Functional
- **Description:** KPI: State Recovery Time < 2s; Secret Redaction Accuracy 100%.
- **Source:** Project Roadmap (specs/9_project_roadmap.md)
- **Dependencies:** None

### **[9_ROADMAP-REQ-017]** Schema Validation
- **Type:** Non-Functional
- **Description:** Schema Validation: All 7 core tables (projects, documents, requirements, epics, tasks, agent_logs, entropy_events) must support ACID transactions.
- **Source:** Project Roadmap (specs/9_project_roadmap.md)
- **Dependencies:** None

### **[9_ROADMAP-REQ-044]** Risk: Sandbox provisioning latency must be < 30s to maintain implementation velo
- **Type:** Security
- **Description:** Risk: Sandbox provisioning latency must be < 30s to maintain implementation velocity.
- **Source:** Project Roadmap (specs/9_project_roadmap.md)
- **Dependencies:** None

### **[3_MCP-REQ-REL-003]** 1.4.2 Deterministic State Recovery
- **Type:** Technical
- **Description:** ACID State Transitions [3_MCP-REQ-REL-004]**: Every state change (task start, tool execution, commit) is wrapped in a SQLite transaction. - **[3_MCP-TAS-039] Git-DB Correlation**: Every successful task completion maps to a Git Commit. The `tasks` table stores the `HEAD` hash, enabling a "Hard Rewind" that restores both the filesystem and the database to a consistent historical state.
- **Source:** MCP and AI Development Design (specs/3_mcp_design.md)
- **Dependencies:** None

### **[3_MCP-MCP-009]** 3.4.1 Live Profiling during the Refactor Phase
- **Type:** Technical
- **Description:** During the `RefactorNode`, the Reviewer Agent can optionally invoke the `capture_trace` tool via the `ProjectServer`. - **Constraint Check**: If the memory usage or CPU execution time exceeds the thresholds defined in the TAS Security/Performance section, the task is marked `FAILED_PERFORMANCE` even if tests pass.
- **Source:** MCP and AI Development Design (specs/3_mcp_design.md)
- **Dependencies:** None

### **[3_MCP-REQ-SYS-001]** 5.5 Context Pruning, Summarization, and Refresh [3_MCP-TAS-024
- **Type:** Technical
- **Description:** To manage the 1M token context window of Gemini 3 Pro efficiently, the orchestrator implements a "Sliding Relevance Window."
- **Source:** MCP and AI Development Design (specs/3_mcp_design.md)
- **Dependencies:** None

### **[TAS-102]** @devs/cli & @devs/vscode
- **Type:** Technical
- **Description:** User interface controllers for CLI and VSCode Extension.
- **Source:** TAS (Technical Architecture Specification) (specs/2_tas.md)
- **Dependencies:** None

### **[TAS-097]** @devs/core
- **Type:** Technical
- **Description:** Orchestration engine responsible for state transitions and persistence.
- **Source:** TAS (Technical Architecture Specification) (specs/2_tas.md)
- **Dependencies:** None

### **[TAS-100]** @devs/memory
- **Type:** Technical
- **Description:** Tiered memory system management.
- **Source:** TAS (Technical Architecture Specification) (specs/2_tas.md)
- **Dependencies:** None

### **[3_MCP-REQ-SYS-002]** ACID Persistence
- **Type:** Technical
- **Description:** Every state transition MUST be recorded in `state.sqlite` before the next tool call is executed.
- **Source:** MCP and AI Development Design (specs/3_mcp_design.md)
- **Dependencies:** None

### **[3_MCP-REQ-REL-004]** ACID State Transitions
- **Type:** Technical
- **Description:** Every state change (task start, tool execution, commit) is wrapped in a SQLite transaction.
- **Source:** MCP and AI Development Design (specs/3_mcp_design.md)
- **Dependencies:** None

### **[TAS-067]** ACID-Compliant Transactions
- **Type:** Technical
- **Description:** All database tables use ACID-compliant transactions to ensure consistency during agent handoffs.
- **Source:** TAS (Technical Architecture Specification) (specs/2_tas.md)
- **Dependencies:** None

### **[TAS-110]** Agent Logs Table
- **Type:** Technical
- **Description:** SQLite table for detailed audit of agent thoughts, strategies, tool calls, and observations.
- **Source:** TAS (Technical Architecture Specification) (specs/2_tas.md)
- **Dependencies:** [TAS-066]

### **[1_PRD-REQ-SYS-004]** Agentic Profiling via MCP
- **Type:** Technical
- **Description:** Support for running code and capturing traces via MCP during TDD.
- **Source:** PRD (Product Requirements Document) (specs/1_prd.md)
- **Dependencies:** None

### **[1_PRD-REQ-INT-005]** CLI Headless Mode
- **Type:** Technical
- **Description:** Support for `--json` output for all commands to allow integration into CI/CD pipelines or other scripts.
- **Source:** PRD (Product Requirements Document) (specs/1_prd.md)
- **Dependencies:** None

### **[TAS-094]** Checkpoint Object
- **Type:** Technical
- **Description:** LangGraph graph state persisted as binary/JSON blobs in SQLite.
- **Source:** TAS (Technical Architecture Specification) (specs/2_tas.md)
- **Dependencies:** None

### **[TAS-070]** Concurrency Management
- **Type:** Technical
- **Description:** Database uses WAL mode and row-level locking for parallel agent safety.
- **Source:** TAS (Technical Architecture Specification) (specs/2_tas.md)
- **Dependencies:** None

### **[1_PRD-REQ-SYS-002]** Crash Recovery
- **Type:** Technical
- **Description:** Stateless orchestrator allowing `devs resume` from exact same task/state.
- **Source:** PRD (Product Requirements Document) (specs/1_prd.md)
- **Dependencies:** None

### **[TAS-103]** Cyclical Orchestration Graph
- **Type:** Technical
- **Description:** Orchestrator follows a cyclical graph (LangGraph) for Research, Design, Distillation, and Implementation.
- **Source:** TAS (Technical Architecture Specification) (specs/2_tas.md)
- **Dependencies:** None

### **[TAS-083]** Cyclical Refinement Pattern
- **Type:** Technical
- **Description:** Data flows through Expansion, Compression, Decomposition, Execution, and Verification stages.
- **Source:** TAS (Technical Architecture Specification) (specs/2_tas.md)
- **Dependencies:** None

### **[TAS-075]** Data Locality Requirement
- **Type:** Technical
- **Description:** Agents must not hold long-term state internally; all findings written to DB tables.
- **Source:** TAS (Technical Architecture Specification) (specs/2_tas.md)
- **Dependencies:** None

### **[TAS-059]** Decision Logs
- **Type:** Technical
- **Description:** Searchable history of every alternative the agent considered but rejected.
- **Source:** TAS (Technical Architecture Specification) (specs/2_tas.md)
- **Dependencies:** None

### **[3_MCP-REQ-SYS-004]** Deterministic Hashing
- **Type:** Technical
- **Description:** The Entropy Detector MUST use a stable hashing algorithm for error outputs to ensure reliability across different environments.
- **Source:** MCP and AI Development Design (specs/3_mcp_design.md)
- **Dependencies:** None

### **[1_PRD-REQ-REL-003]** Deterministic State Recovery (ACID Compliance)
- **Type:** Technical
- **Description:** Persist state transitions to SQLite using ACID transactions for bulletproof resume.
- **Source:** PRD (Product Requirements Document) (specs/1_prd.md)
- **Dependencies:** None

### **[9_ROADMAP-TAS-105]** Develop the `ContextPruner` utilizing Gemini 3 Flash for summarizing intermediat
- **Type:** Technical
- **Description:** Develop the `ContextPruner` utilizing Gemini 3 Flash for summarizing intermediate reasoning turns (1M context window management).
- **Source:** Project Roadmap (specs/9_project_roadmap.md)
- **Dependencies:** None

### **[TAS-106]** Documents Table
- **Type:** Technical
- **Description:** SQLite table for storing document content, versions, and approval status.
- **Source:** TAS (Technical Architecture Specification) (specs/2_tas.md)
- **Dependencies:** [TAS-066]

### **[TAS-091]** Embedding Model
- **Type:** Technical
- **Description:** Use of text-embedding-004 (768 dimensions) for semantic memory.
- **Source:** TAS (Technical Architecture Specification) (specs/2_tas.md)
- **Dependencies:** None

### **[1_PRD-REQ-REL-001]** Entropy & Loop Detection
- **Type:** Technical
- **Description:** Monitor semantic delta and force strategy pivot on repeating errors.
- **Source:** PRD (Product Requirements Document) (specs/1_prd.md)
- **Dependencies:** None

### **[TAS-111]** Entropy Events Table
- **Type:** Technical
- **Description:** SQLite table tracking repeating failures for loop prevention.
- **Source:** TAS (Technical Architecture Specification) (specs/2_tas.md)
- **Dependencies:** [TAS-066]

### **[TAS-108]** Epics Table
- **Type:** Technical
- **Description:** SQLite table for project epics and their roadmap order.
- **Source:** TAS (Technical Architecture Specification) (specs/2_tas.md)
- **Dependencies:** [TAS-066]

### **[TAS-113]** Event Types and Payloads
- **Type:** Technical
- **Description:** Specified event types (THOUGHT_STREAM, TOOL_LIFECYCLE, etc.) for real-time orchestration feedback.
- **Source:** TAS (Technical Architecture Specification) (specs/2_tas.md)
- **Dependencies:** [TAS-038]

### **[TAS-012]** Filesystem & Change Tracking
- **Type:** Technical
- **Description:** simple-git for atomic state snapshots and audit trail of project evolution.
- **Source:** TAS (Technical Architecture Specification) (specs/2_tas.md)
- **Dependencies:** None

### **[TAS-046]** Full Traceability
- **Type:** Technical
- **Description:** Every agent thought, decision, tool call, and terminal output must be captured and queryable.
- **Source:** TAS (Technical Architecture Specification) (specs/2_tas.md)
- **Dependencies:** None

### **[TAS-040]** Generated Project Directory Structure
- **Type:** Technical
- **Description:** Mandatory directory structure for generated projects ensuring transparency and observability.
- **Source:** TAS (Technical Architecture Specification) (specs/2_tas.md)
- **Dependencies:** None

### **[TAS-095]** Git Snapshot Association
- **Type:** Technical
- **Description:** Every successful task results in a Git commit hash stored in the tasks table.
- **Source:** TAS (Technical Architecture Specification) (specs/2_tas.md)
- **Dependencies:** None

### **[TAS-055]** Git Snapshots
- **Type:** Technical
- **Description:** Commits code changes to the project's Git repository after each successful task.
- **Source:** TAS (Technical Architecture Specification) (specs/2_tas.md)
- **Dependencies:** None

### **[TAS-114]** Git State Correlation
- **Type:** Technical
- **Description:** Every task transition mapped to a Git commit hash in the tasks table for project rewind capability.
- **Source:** TAS (Technical Architecture Specification) (specs/2_tas.md)
- **Dependencies:** None

### **[TAS-001]** Glass-Box Transparency & Auditability
- **Type:** Technical
- **Description:** Every state transition and agent reasoning step is persisted to a local SQLite database (`.devs/state.sqlite`) as a "Flight Recorder".
- **Source:** TAS (Technical Architecture Specification) (specs/2_tas.md)
- **Dependencies:** None

### **[3_MCP-REQ-SYS-003]** Headless First
- **Type:** Technical
- **Description:** The OrchestratorServer MUST be accessible via standard IPC (Unix Sockets / Named Pipes) to ensure CLI and Extension parity.
- **Source:** MCP and AI Development Design (specs/3_mcp_design.md)
- **Dependencies:** None

### **[9_ROADMAP-TAS-101]** Implement LangGraph.js state machine with cyclical implementation nodes and expl
- **Type:** Technical
- **Description:** Implement LangGraph.js state machine with cyclical implementation nodes and explicit state transitions.
- **Source:** Project Roadmap (specs/9_project_roadmap.md)
- **Dependencies:** None

### **[9_ROADMAP-TAS-106]** Implement the SAOP (Structured Agent-Orchestrator Protocol) parser and validator
- **Type:** Technical
- **Description:** Implement the SAOP (Structured Agent-Orchestrator Protocol) parser and validator.
- **Source:** Project Roadmap (specs/9_project_roadmap.md)
- **Dependencies:** None

### **[TAS-092]** Indexing Strategy
- **Type:** Technical
- **Description:** IVF-PQ (Inverted File with Product Quantization) for efficient vector search in LanceDB.
- **Source:** TAS (Technical Architecture Specification) (specs/2_tas.md)
- **Dependencies:** None

### **[9_ROADMAP-TAS-104]** Integrate LanceDB for vectorized Long-term Memory (Project DNA, Architectural De
- **Type:** Technical
- **Description:** Integrate LanceDB for vectorized Long-term Memory (Project DNA, Architectural Decisions).
- **Source:** Project Roadmap (specs/9_project_roadmap.md)
- **Dependencies:** None

### **[1_PRD-REQ-INT-012]** MCP Assistant Querying
- **Type:** Technical
- **Description:** Allow external AI assistants to query `devs` status, requirements, and task DAG via MCP.
- **Source:** PRD (Product Requirements Document) (specs/1_prd.md)
- **Dependencies:** None

### **[1_PRD-REQ-INT-003]** MCP Orchestrator Server
- **Type:** Technical
- **Description:** The system must expose its internal state via an MCP server.
- **Source:** PRD (Product Requirements Document) (specs/1_prd.md)
- **Dependencies:** None

### **[1_PRD-REQ-INT-011]** MCP State Exposure
- **Type:** Technical
- **Description:** Expose internal state of 'devs' via MCP server.
- **Source:** PRD (Product Requirements Document) (specs/1_prd.md)
- **Dependencies:** None

### **[1_PRD-REQ-REL-002]** Maximum Turn & Token Budgets
- **Type:** Technical
- **Description:** Hard limits of 10 implementation turns and specified token budgets per task.
- **Source:** PRD (Product Requirements Document) (specs/1_prd.md)
- **Dependencies:** None

### **[TAS-081]** Memory Layer
- **Type:** Technical
- **Description:** A tiered system consisting of short-term (active task), medium-term (epic-level), and long-term (project-wide constraints in LanceDB) memory.
- **Source:** TAS (Technical Architecture Specification) (specs/2_tas.md)
- **Dependencies:** None

### **[TAS-096]** Module Architecture
- **Type:** Technical
- **Description:** TypeScript monorepo with clear separation between core, agents, sandbox, memory, and MCP modules.
- **Source:** TAS (Technical Architecture Specification) (specs/2_tas.md)
- **Dependencies:** None

### **[1_PRD-REQ-REL-004]** Multi-Agent Cross-Verification
- **Type:** Technical
- **Description:** Use a separate Reviewer Agent to verify implementation and tests in a clean sandbox.
- **Source:** PRD (Product Requirements Document) (specs/1_prd.md)
- **Dependencies:** None

### **[1_PRD-REQ-SYS-003]** Multi-Model Orchestration
- **Type:** Technical
- **Description:** Use Gemini 3 Pro for architecture/implementation and Gemini 3 Flash for review/linting.
- **Source:** PRD (Product Requirements Document) (specs/1_prd.md)
- **Dependencies:** None

### **[TAS-009]** Orchestration Engine
- **Type:** Technical
- **Description:** LangGraph.js for orchestrating multi-agent workflow as a stateful, cyclical graph.
- **Source:** TAS (Technical Architecture Specification) (specs/2_tas.md)
- **Dependencies:** None

### **[TAS-078]** Orchestration Layer
- **Type:** Technical
- **Description:** Uses LangGraph.js to manage high-level state machine, handles agent handoffs, checkpointing to SQLite, and human-in-the-loop signaling.
- **Source:** TAS (Technical Architecture Specification) (specs/2_tas.md)
- **Dependencies:** None

### **[TAS-006]** Package Manager
- **Type:** Technical
- **Description:** pnpm v9.x with monorepo workspace structure.
- **Source:** TAS (Technical Architecture Specification) (specs/2_tas.md)
- **Dependencies:** None

### **[TAS-039]** Persistence & Inter-Agent Handoff
- **Type:** Technical
- **Description:** Stateless handoffs between agents via shared database state.
- **Source:** TAS (Technical Architecture Specification) (specs/2_tas.md)
- **Dependencies:** None

### **[9_ROADMAP-PHASE-001]** Phase 1
- **Type:** Technical
- **Description:** Phase 1: Core Orchestrator & State Persistence
- **Source:** Project Roadmap (specs/9_project_roadmap.md)
- **Dependencies:** None

### **[TAS-066]** Primary Source of Truth
- **Type:** Technical
- **Description:** SQLite database (`.devs/state.sqlite`) is the primary source of truth for project state and audit logs.
- **Source:** TAS (Technical Architecture Specification) (specs/2_tas.md)
- **Dependencies:** None

### **[TAS-005]** Programming Language
- **Type:** Technical
- **Description:** TypeScript 5.4+ (Strict Mode) with mandatory strict typing configurations.
- **Source:** TAS (Technical Architecture Specification) (specs/2_tas.md)
- **Dependencies:** None

### **[TAS-105]** Projects Table
- **Type:** Technical
- **Description:** SQLite table for project metadata including phase and status.
- **Source:** TAS (Technical Architecture Specification) (specs/2_tas.md)
- **Dependencies:** [TAS-066]

### **[3_MCP-MCP-001]** Projects generated by 'devs' are optimized for agentic interaction, ensuring they are "Transparent by Design."
- **Type:** Technical
- **Description:** Projects generated by 'devs' are optimized for agentic interaction, ensuring they are "Transparent by Design."
- **Source:** MCP and AI Development Design (specs/3_mcp_design.md)
- **Dependencies:** None

### **[1_PRD-REQ-INT-013]** Real-time State Sharing
- **Type:** Technical
- **Description:** The CLI and VSCode extension MUST share a common state file (.devs/state.json or SQLite).
- **Source:** PRD (Product Requirements Document) (specs/1_prd.md)
- **Dependencies:** None

### **[1_PRD-REQ-INT-004]** Real-time State Synchronization
- **Type:** Technical
- **Description:** CLI and VSCode extension must share common state to ensure seamless switching.
- **Source:** PRD (Product Requirements Document) (specs/1_prd.md)
- **Dependencies:** None

### **[TAS-038]** Real-time Trace & Event Streaming (RTES)
- **Type:** Technical
- **Description:** Event bus for synchronizing state between core and UI/CLI dashboards.
- **Source:** TAS (Technical Architecture Specification) (specs/2_tas.md)
- **Dependencies:** None

### **[TAS-010]** Relational State Store
- **Type:** Technical
- **Description:** SQLite 3 via better-sqlite3 for project state and audit trails.
- **Source:** TAS (Technical Architecture Specification) (specs/2_tas.md)
- **Dependencies:** None

### **[TAS-107]** Requirements Table
- **Type:** Technical
- **Description:** SQLite table for atomic requirements with priority, status, and trace metadata.
- **Source:** TAS (Technical Architecture Specification) (specs/2_tas.md)
- **Dependencies:** [TAS-066]

### **[TAS-060]** Runtime Environment
- **Type:** Technical
- **Description:** Node.js v22.x (LTS) with headless-first design for CLI/Extension parity.
- **Source:** TAS (Technical Architecture Specification) (specs/2_tas.md)
- **Dependencies:** None

### **[TAS-071]** Scaling Traces
- **Type:** Technical
- **Description:** Archival strategy for agent_logs over 100MB to compressed JSON files.
- **Source:** TAS (Technical Architecture Specification) (specs/2_tas.md)
- **Dependencies:** None

### **[9_ROADMAP-TAS-102]** Schema design for SQLite `state.sqlite` (projects, documents, requirements, epic
- **Type:** Technical
- **Description:** Schema design for SQLite `state.sqlite` (projects, documents, requirements, epics, tasks, agent_logs, entropy_events).
- **Source:** Project Roadmap (specs/9_project_roadmap.md)
- **Dependencies:** None

### **[TAS-054]** Snapshot-at-Commit Strategy
- **Type:** Technical
- **Description:** The system performs git snapshots, trace persistence, and vector memory updates after every successful task.
- **Source:** TAS (Technical Architecture Specification) (specs/2_tas.md)
- **Dependencies:** None

### **[TAS-073]** State Checkpointing Requirement
- **Type:** Technical
- **Description:** ACID commit to SQLite triggered after every LangGraph node transition.
- **Source:** TAS (Technical Architecture Specification) (specs/2_tas.md)
- **Dependencies:** None

### **[TAS-069]** State Recovery
- **Type:** Technical
- **Description:** If .devs folder is missing, orchestrator reconstructs requirement maps from code comments/documentation.
- **Source:** TAS (Technical Architecture Specification) (specs/2_tas.md)
- **Dependencies:** None

### **[TAS-047]** Stateful Determinism
- **Type:** Technical
- **Description:** The system can be paused, resumed, or rewound to any previous state (Task/Epic) with 100% fidelity.
- **Source:** TAS (Technical Architecture Specification) (specs/2_tas.md)
- **Dependencies:** None

### **[TAS-002]** Stateless & Resumable Orchestration
- **Type:** Technical
- **Description:** The core engine is stateless; the entire project context (Agent memory, requirement DAGs, and task status) is reloaded from the project's `.devs/` directory.
- **Source:** TAS (Technical Architecture Specification) (specs/2_tas.md)
- **Dependencies:** None

### **[1_PRD-REQ-REL-005]** Strategy Pivot
- **Type:** Technical
- **Description:** Flag Strategy Entropy and force reasoning pivot after 3 identical errors.
- **Source:** PRD (Product Requirements Document) (specs/1_prd.md)
- **Dependencies:** None

### **[TAS-109]** Tasks Table
- **Type:** Technical
- **Description:** SQLite table for tasks including implementation instructions, status, and associated git commit hashes.
- **Source:** TAS (Technical Architecture Specification) (specs/2_tas.md)
- **Dependencies:** [TAS-066]

### **[9_ROADMAP-TAS-010]** **[9_ROADMAP-TAS-011]** Technical Requirements
- **Type:** Technical
- **Description:** Technical Requirements: , , , , .
- **Source:** Project Roadmap (specs/9_project_roadmap.md)
- **Dependencies:** None

### **[9_ROADMAP-TAS-013]** **[9_ROADMAP-TAS-014]** **[9_ROADMAP-TAS-019]** Technical Requirements
- **Type:** Technical
- **Description:** Technical Requirements: , , , , , .
- **Source:** Project Roadmap (specs/9_project_roadmap.md)
- **Dependencies:** None

### **[9_ROADMAP-TAS-043]** Technical Requirements
- **Type:** Technical
- **Description:** Technical Requirements: , , , .
- **Source:** Project Roadmap (specs/9_project_roadmap.md)
- **Dependencies:** None

### **[TAS-061]** The .devs/ Directory Requirement
- **Type:** Technical
- **Description:** Flight recorder directory containing SQLite DB, LanceDB, and trace logs; excluded from Developer Agent write-access.
- **Source:** TAS (Technical Architecture Specification) (specs/2_tas.md)
- **Dependencies:** [TAS-104]

### **[3_MCP-MCP-002]** The system implements a "Flight Recorder" pattern via a local SQLite database (`.devs/state.sqlite`).
- **Type:** Technical
- **Description:** The system implements a "Flight Recorder" pattern via a local SQLite database (`.devs/state.sqlite`).
- **Source:** MCP and AI Development Design (specs/3_mcp_design.md)
- **Dependencies:** None

### **[1_PRD-REQ-REL-006]** Token Budget
- **Type:** Technical
- **Description:** Hard limit on tokens (e.g., 200k) per task.
- **Source:** PRD (Product Requirements Document) (specs/1_prd.md)
- **Dependencies:** None

### **[1_PRD-REQ-SYS-001]** Token Optimization
- **Type:** Technical
- **Description:** Intelligent context pruning and summarization handoffs between Epics.
- **Source:** PRD (Product Requirements Document) (specs/1_prd.md)
- **Dependencies:** None

### **[TAS-104]** Top-Level Directory Overview
- **Type:** Technical
- **Description:** Specific top-level folders: .devs, .agent, mcp-server, src, tests, docs, scripts.
- **Source:** TAS (Technical Architecture Specification) (specs/2_tas.md)
- **Dependencies:** [TAS-040]

### **[TAS-056]** Trace Persistence
- **Type:** Technical
- **Description:** Persists agent's reasoning trace to SQLite after each successful task.
- **Source:** TAS (Technical Architecture Specification) (specs/2_tas.md)
- **Dependencies:** None

### **[TAS-112]** Turn Envelope Schema
- **Type:** Technical
- **Description:** Strictly-typed JSON structure for every agent interaction turn.
- **Source:** TAS (Technical Architecture Specification) (specs/2_tas.md)
- **Dependencies:** [TAS-035]

### **[TAS-057]** Vector Memory Updates
- **Type:** Technical
- **Description:** Updates the Vector DB with any new architectural decisions made during the task.
- **Source:** TAS (Technical Architecture Specification) (specs/2_tas.md)
- **Dependencies:** None

### **[TAS-093]** Vector Schema
- **Type:** Technical
- **Description:** LanceDB schema including vector, content, type (ARCHITECTURAL_DECISION, etc.), and metadata.
- **Source:** TAS (Technical Architecture Specification) (specs/2_tas.md)
- **Dependencies:** None

### **[TAS-076]** Version Manifest Requirement
- **Type:** Technical
- **Description:** package.json must include a devs section with project metadata.
- **Source:** TAS (Technical Architecture Specification) (specs/2_tas.md)
- **Dependencies:** None

### **[9_ROADMAP-REQ-033]** TDD Fidelity
- **Type:** UX
- **Description:** TDD Fidelity: 100% of tasks must pass the "Red-Phase Gate" (empirical verification of a failing test).
- **Source:** Project Roadmap (specs/9_project_roadmap.md)
- **Dependencies:** None

### **[9_ROADMAP-REQ-011]** The Red-Phase Gate
- **Type:** UX
- **Description:** The Red-Phase Gate: A task MUST fail its test in the sandbox before implementation begins. This prevents "hallucination-driven success" where an agent claims a task is done without verifying it.
- **Source:** Project Roadmap (specs/9_project_roadmap.md)
- **Dependencies:** None

### **[1_PRD-REQ-INT-009]** VSCode Agent Console
- **Type:** UX
- **Description:** Streaming log view differentiating between "Thoughts", "Actions", and "Observations".
- **Source:** PRD (Product Requirements Document) (specs/1_prd.md)
- **Dependencies:** None

### **[1_PRD-REQ-INT-008]** VSCode Document Editor
- **Type:** UX
- **Description:** Integrated Markdown preview and editor for PRD, TAS, and other documents with "Sync & Regenerate" capabilities.
- **Source:** PRD (Product Requirements Document) (specs/1_prd.md)
- **Dependencies:** None

### **[1_PRD-REQ-INT-010]** VSCode Human-in-the-Loop Popups
- **Type:** UX
- **Description:** Visual prompts for approvals at defined checkpoints within VSCode.
- **Source:** PRD (Product Requirements Document) (specs/1_prd.md)
- **Dependencies:** None

### **[1_PRD-REQ-INT-007]** VSCode Project Dashboard
- **Type:** UX
- **Description:** Dedicated sidebar view showing status of the current Epic, overall project progress, and task tree.
- **Source:** PRD (Product Requirements Document) (specs/1_prd.md)
- **Dependencies:** None

## **Block 1: Sandbox & MCP Tooling**

### **[5_SECURITY_DESIGN-REQ-SEC-STR-002]** AOD Checksum Verification
- **Type:** Security
- **Description:** Implement checksum verification of AOD files before agent ingestion to prevent tampering with `.agent.md` and misleading future developer agents.
- **Source:** Security Design (specs/5_security_design.md)
- **Dependencies:** None

### **[5_SECURITY_DESIGN-REQ-SEC-STR-001]** Agent Identity Enforcement
- **Type:** Security
- **Description:** Use multi-agent signatures and Orchestrator-controlled agent identity to prevent an agent from impersonating the Reviewer to sign off on its own task.
- **Source:** Security Design (specs/5_security_design.md)
- **Dependencies:** None

### **[5_SECURITY_DESIGN-REQ-SEC-SD-026]** Agent-Oriented Debugging Auth
- **Type:** Security
- **Description:** Internal MCP servers in generated projects MUST only listen on `localhost` and MUST require a 256-bit Bearer Token.
- **Source:** Security Design (specs/5_security_design.md)
- **Dependencies:** None

### **[5_SECURITY_DESIGN-REQ-SEC-SD-017]** Argument Sanitization (Anti-Injection)
- **Type:** Security
- **Description:** Shell commands MUST accept arguments as an array; shell metacharacters MUST be rejected unless escaped. Paths MUST be normalized and restricted to the `/workspace` subtree.
- **Source:** Security Design (specs/5_security_design.md)
- **Dependencies:** None

### **[1_PRD-REQ-SEC-005]** Automated Secret & PII Redaction
- **Type:** Security
- **Description:** Redaction scanner for logs and traces using regex and LLM.
- **Source:** PRD (Product Requirements Document) (specs/1_prd.md)
- **Dependencies:** None

### **[5_SECURITY_DESIGN-REQ-SEC-SD-056]** Automated Vulnerability Gates
- **Type:** Security
- **Description:** Perform automated audits after installation; high/critical vulnerabilities MUST trigger Reviewer failure.
- **Source:** Security Design (specs/5_security_design.md)
- **Dependencies:** None

### **[5_SECURITY_DESIGN-REQ-SEC-SD-029]** Certificate Pinning
- **Type:** Security
- **Description:** The orchestrator SHOULD implement certificate pinning for Gemini API endpoints.
- **Source:** Security Design (specs/5_security_design.md)
- **Dependencies:** None

### **[5_SECURITY_DESIGN-REQ-SEC-QST-901]** Context Injection Risk Evaluation
- **Type:** Security
- **Description:** Assess risk of older malicious requirements influencing tasks via long context windows.
- **Source:** Security Design (specs/5_security_design.md)
- **Dependencies:** None

### **[5_SECURITY_DESIGN-REQ-SEC-SD-086]** Data Minimization
- **Type:** Security
- **Description:** Only send minimal project context to the LLM; exclude host environment variables like PATH or HOME.
- **Source:** Security Design (specs/5_security_design.md)
- **Dependencies:** None

### **[5_SECURITY_DESIGN-REQ-SEC-SD-010]** Dedicated Non-privileged User Context
- **Type:** Security
- **Description:** The orchestrator MUST run under a non-privileged local user account and MUST explicitly fail and exit if executed with `root` or `sudo` privileges (UID 0 check on startup).
- **Source:** Security Design (specs/5_security_design.md)
- **Dependencies:** None

### **[1_PRD-REQ-SEC-007]** Dependency Vulnerability Scanning
- **Type:** Security
- **Description:** Run security audits after dependency installation and trigger failures on High/Critical risks.
- **Source:** PRD (Product Requirements Document) (specs/1_prd.md)
- **Dependencies:** None

### **[5_SECURITY_DESIGN-REQ-SEC-SD-024]** Directive Injection Authorization
- **Type:** Security
- **Description:** The orchestrator MUST validate that mid-task directives come from the authenticated user session.
- **Source:** Security Design (specs/5_security_design.md)
- **Dependencies:** None

### **[5_SECURITY_DESIGN-REQ-SEC-SD-011]** Directory Hardening
- **Type:** Security
- **Description:** The `.devs/` state directory MUST be initialized with `0700` permissions. The orchestrator MUST verify permissions on startup and abort if they are loose.
- **Source:** Security Design (specs/5_security_design.md)
- **Dependencies:** None

### **[5_SECURITY_DESIGN-REQ-SEC-SD-060]** Document Integrity Checksums
- **Type:** Security
- **Description:** Verify SHA-256 checksums of PRD and TAS before distilling and implementation; block if manual edits bypass approval.
- **Source:** Security Design (specs/5_security_design.md)
- **Dependencies:** None

### **[5_SECURITY_DESIGN-REQ-SEC-SD-015]** Environment Isolation
- **Type:** Security
- **Description:** The orchestrator MUST sanitize its own environment variables before spawning sandboxes, stripping sensitive host variables (e.g., `AWS_ACCESS_KEY_ID`).
- **Source:** Security Design (specs/5_security_design.md)
- **Dependencies:** None

### **[5_SECURITY_DESIGN-REQ-SEC-SD-021]** Ephemeral GitHub/VCS Tokens
- **Type:** Security
- **Description:** Agents SHOULD use host `ssh-agent` or short-lived tokens for Git operations; credentials MUST NEVER be committed.
- **Source:** Security Design (specs/5_security_design.md)
- **Dependencies:** None

### **[5_SECURITY_DESIGN-REQ-SEC-SD-040]** Ephemeral Sandbox Environment Secrets
- **Type:** Security
- **Description:** Secrets MUST NOT be passed via command line; they SHOULD use secure stdin or encrypted ephemeral files with `0400` permissions.
- **Source:** Security Design (specs/5_security_design.md)
- **Dependencies:** None

### **[5_SECURITY_DESIGN-REQ-SEC-SD-043]** Ephemeral Sandbox Key Rotation
- **Type:** Security
- **Description:** Every sandbox task MUST use a new, ephemeral 128-bit session key.
- **Source:** Security Design (specs/5_security_design.md)
- **Dependencies:** None

### **[1_PRD-REQ-SEC-008]** Explicit Allow-lists
- **Type:** Security
- **Description:** Allow-lists for package managers and specific user-approved APIs.
- **Source:** PRD (Product Requirements Document) (specs/1_prd.md)
- **Dependencies:** None

### **[1_PRD-REQ-SEC-003]** Filesystem Integrity
- **Type:** Security
- **Description:** Sandbox write access restricted to project directory; host protection for `.git` and `.devs`.
- **Source:** PRD (Product Requirements Document) (specs/1_prd.md)
- **Dependencies:** None

### **[5_SECURITY_DESIGN-REQ-SEC-SD-047]** Filesystem Isolation & Integrity
- **Type:** Security
- **Description:** Container root MUST be read-only; `/tmp` MUST be `tmpfs` with `noexec,nosuid,nodev`. `.git` and `.devs` MUST NOT be mounted.
- **Source:** Security Design (specs/5_security_design.md)
- **Dependencies:** None

### **[5_SECURITY_DESIGN-REQ-SEC-SD-036]** Filesystem Permission Hardening
- **Type:** Security
- **Description:** The `.devs/` directory MUST have `0700` permissions; individual DB files MUST be `0600`.
- **Source:** Security Design (specs/5_security_design.md)
- **Dependencies:** None

### **[TAS-080-1]** FilesystemManager
- **Type:** Security
- **Description:** Synchronizes host and sandbox while protecting sensitive metadata like .git and .devs.
- **Source:** TAS (Technical Architecture Specification) (specs/2_tas.md)
- **Dependencies:** [TAS-099]

### **[5_SECURITY_DESIGN-REQ-SEC-SD-046]** Hardened Runtime Configuration (Docker)
- **Type:** Security
- **Description:** Enforce `--cap-drop=ALL`, `--security-opt=no-new-privileges:true`, `--pids-limit 128`, and hard RAM/CPU quotas for Docker containers.
- **Source:** Security Design (specs/5_security_design.md)
- **Dependencies:** None

### **[5_SECURITY_DESIGN-REQ-SEC-SD-019]** Host Keychain Integration
- **Type:** Security
- **Description:** All API keys MUST be stored in the host's native secure storage (macOS Keychain, etc.); they MUST NOT be stored in `.env` files or the database.
- **Source:** Security Design (specs/5_security_design.md)
- **Dependencies:** None

### **[1_PRD-REQ-SEC-009]** Host Protection
- **Type:** Security
- **Description:** Host's `.git` and `.devs` directories mounted as read-only or excluded.
- **Source:** PRD (Product Requirements Document) (specs/1_prd.md)
- **Dependencies:** None

### **[5_SECURITY_DESIGN-REQ-SEC-STR-006]** Host-Level Execution Prevention
- **Type:** Security
- **Description:** Use `ignore-scripts` flag and no-exec `/tmp` in sandbox to prevent privilege escalation via malicious post-install scripts.
- **Source:** Security Design (specs/5_security_design.md)
- **Dependencies:** None

### **[5_SECURITY_DESIGN-REQ-SEC-SD-032]** IPC Session Handshake
- **Type:** Security
- **Description:** Each IPC session MUST begin with a 256-bit ephemeral handshake token passed via environment variables.
- **Source:** Security Design (specs/5_security_design.md)
- **Dependencies:** None

### **[5_SECURITY_DESIGN-REQ-SEC-RSK-101]** Identity Spoofing Mitigation
- **Type:** Security
- **Description:** Prevent an agent instance from signing off as its own Reviewer by tracking `thread_id` and role.
- **Source:** Security Design (specs/5_security_design.md)
- **Dependencies:** None

### **[5_SECURITY_DESIGN-REQ-SEC-SD-062]** Immutable Audit Log
- **Type:** Security
- **Description:** Log every SAOP turn with nanosecond precision timestamps.
- **Source:** Security Design (specs/5_security_design.md)
- **Dependencies:** None

### **[5_SECURITY_DESIGN-REQ-SEC-SD-065]** Immutable Audit Record (SAOP)
- **Type:** Security
- **Description:** Persist every turn (Thought, Action, Observation) to SQLite before the next turn begins.
- **Source:** Security Design (specs/5_security_design.md)
- **Dependencies:** None

### **[9_ROADMAP-TAS-202]** Implement `SandboxProvider` for Docker (CLI) and WebContainers (VSCode Web).
- **Type:** Security
- **Description:** Implement `SandboxProvider` for Docker (CLI) and WebContainers (VSCode Web).
- **Source:** Project Roadmap (specs/9_project_roadmap.md)
- **Dependencies:** None

### **[9_ROADMAP-TAS-204]** Implement the `SecretMasker` middleware (Regex + Shannon Entropy > 4.5 detection
- **Type:** Security
- **Description:** Implement the `SecretMasker` middleware (Regex + Shannon Entropy > 4.5 detection).
- **Source:** Project Roadmap (specs/9_project_roadmap.md)
- **Dependencies:** None

### **[5_SECURITY_DESIGN-REQ-SEC-SD-085]** Independent Reviewer Validation
- **Type:** Security
- **Description:** Every implementation task MUST be verified by a separate Reviewer Agent with a different prompt.
- **Source:** Security Design (specs/5_security_design.md)
- **Dependencies:** None

### **[5_SECURITY_DESIGN-REQ-SEC-RSK-102]** Indirect Tool Invocation Mitigation
- **Type:** Security
- **Description:** Use strict delimiters in prompts and CBAC enforcement to prevent malicious data from triggering unauthorized tool calls.
- **Source:** Security Design (specs/5_security_design.md)
- **Dependencies:** None

### **[5_SECURITY_DESIGN-REQ-SEC-SD-053]** Input Redaction (Tool Call Protection)
- **Type:** Security
- **Description:** Inspect tool arguments before sending to the sandbox to prevent accidental secret leakage in shell commands.
- **Source:** Security Design (specs/5_security_design.md)
- **Dependencies:** None

### **[5_SECURITY_DESIGN-REQ-SEC-SD-033]** Localhost MCP Security
- **Type:** Security
- **Description:** MCP servers MUST bind exclusively to `127.0.0.1` and require a Bearer token.
- **Source:** Security Design (specs/5_security_design.md)
- **Dependencies:** None

### **[5_SECURITY_DESIGN-REQ-SEC-SD-079]** Log Integrity & Purge (GDPR)
- **Type:** Security
- **Description:** Support secure deletion of all traces and metadata via `devs purge`.
- **Source:** Security Design (specs/5_security_design.md)
- **Dependencies:** None

### **[1_PRD-REQ-SEC-001]** Mandatory Containerization
- **Type:** Security
- **Description:** Code execution and testing must occur in fresh, ephemeral sandboxes.
- **Source:** PRD (Product Requirements Document) (specs/1_prd.md)
- **Dependencies:** None

### **[5_SECURITY_DESIGN-REQ-SEC-SD-045]** Mandatory Ephemeral Isolation
- **Type:** Security
- **Description:** All implementation and testing tasks MUST occur within a fresh, isolated sandbox (Docker or WebContainer).
- **Source:** Security Design (specs/5_security_design.md)
- **Dependencies:** None

### **[5_SECURITY_DESIGN-REQ-SEC-CRY-003]** Mandatory Host Keychain Usage
- **Type:** Security
- **Description:** Long-lived secrets MUST be stored in native secure storage; plaintext in config files is prohibited.
- **Source:** Security Design (specs/5_security_design.md)
- **Dependencies:** None

### **[5_SECURITY_DESIGN-REQ-SEC-STR-004]** Mandatory SecretMasker
- **Type:** Security
- **Description:** Implement a mandatory `SecretMasker` on all sandbox streams to prevent secret leakage via error logs sent back to the Gemini API.
- **Source:** Security Design (specs/5_security_design.md)
- **Dependencies:** None

### **[5_SECURITY_DESIGN-REQ-SEC-SD-049]** Multi-Tiered Redaction
- **Type:** Security
- **Description:** Process all data passing through `ToolProxy` via the `SecretMasker` to prevent leakage.
- **Source:** Security Design (specs/5_security_design.md)
- **Dependencies:** None

### **[5_SECURITY_DESIGN-REQ-SEC-SD-034]** Native Keychain Integration for Secrets
- **Type:** Security
- **Description:** Secrets MUST NEVER be stored in plaintext; they MUST be stored using host OS secure credential managers (Keychain, DPAPI, etc.).
- **Source:** Security Design (specs/5_security_design.md)
- **Dependencies:** None

### **[5_SECURITY_DESIGN-REQ-SEC-SD-048]** Network Egress & DNS Filtering
- **Type:** Security
- **Description:** Default to no network; use a scoped bridge with an internal proxy enforcing an allow-list and isolated DNS.
- **Source:** Security Design (specs/5_security_design.md)
- **Dependencies:** None

### **[1_PRD-REQ-SEC-002]** Network Egress Control
- **Type:** Security
- **Description:** Deny-all network policy with explicit allow-lists for package managers/APIs.
- **Source:** PRD (Product Requirements Document) (specs/1_prd.md)
- **Dependencies:** None

### **[TAS-022]** Network Egress Policy
- **Type:** Security
- **Description:** Default Deny with allow-list for npmjs.org, pypi.org, and github.com during dependency phases.
- **Source:** TAS (Technical Architecture Specification) (specs/2_tas.md)
- **Dependencies:** None

### **[5_SECURITY_DESIGN-REQ-SEC-CRY-005]** No Raw Keys in LLM Context
- **Type:** Security
- **Description:** Agents MUST only see Key References; raw private keys MUST NOT be injected into context.
- **Source:** Security Design (specs/5_security_design.md)
- **Dependencies:** None

### **[3_MCP-REQ-SEC-001]** Path Sanitization
- **Type:** Security
- **Description:** All paths are resolved against the project root. Attempts to access `..` or system paths (e.g., `/etc`) result in an immediate `ACCESS_DENIED` observation.
- **Source:** MCP and AI Development Design (specs/3_mcp_design.md)
- **Dependencies:** None

### **[5_SECURITY_DESIGN-REQ-SEC-STR-003]** Persistent SAOP Traces
- **Type:** Security
- **Description:** Maintain persistent SAOP traces linked to Git commit hashes to ensure non-repudiation of agent-generated code blocks.
- **Source:** Security Design (specs/5_security_design.md)
- **Dependencies:** None

### **[5_SECURITY_DESIGN-REQ-SEC-SD-050]** Phase 1 Redaction: Patterns & Entropy
- **Type:** Security
- **Description:** Use 100+ regex patterns and Shannon Entropy > 4.5 detection for initial secret identification.
- **Source:** Security Design (specs/5_security_design.md)
- **Dependencies:** None

### **[9_ROADMAP-PHASE-002]** Phase 2
- **Type:** Security
- **Description:** Phase 2: Sandbox Isolation & MCP Infrastructure
- **Source:** Project Roadmap (specs/9_project_roadmap.md)
- **Dependencies:** None

### **[5_SECURITY_DESIGN-REQ-SEC-SD-051]** Phase 2 Redaction: Contextual Validation
- **Type:** Security
- **Description:** Use a local flash model to determine if flagged strings are legitimate secrets or safe technical artifacts.
- **Source:** Security Design (specs/5_security_design.md)
- **Dependencies:** None

### **[5_SECURITY_DESIGN-REQ-SEC-SD-052]** Phase 3 Redaction: Replacement & Hashing
- **Type:** Security
- **Description:** Replace secrets with consistent placeholders `[REDACTED_<TYPE>_<SHORT_HASH>]`.
- **Source:** Security Design (specs/5_security_design.md)
- **Dependencies:** None

### **[5_SECURITY_DESIGN-REQ-SEC-SD-016]** Phase-Specific Permission Escalation
- **Type:** Security
- **Description:** Permissions MUST be dynamic based on the project phase (e.g., revoking Research tools during Implementation).
- **Source:** Security Design (specs/5_security_design.md)
- **Dependencies:** None

### **[5_SECURITY_DESIGN-REQ-SEC-SD-038]** Pre-Persistence Redaction (SecretMasker)
- **Type:** Security
- **Description:** `SecretMasker` MUST apply regex and entropy-based redaction to all stdout/stderr before writing to logs or SQLite.
- **Source:** Security Design (specs/5_security_design.md)
- **Dependencies:** None

### **[5_SECURITY_DESIGN-REQ-SEC-RSK-103]** Privilege Escalation via Dependencies Mitigation
- **Type:** Security
- **Description:** Mandatory use of `--ignore-scripts` and restricted network egress during package installation.
- **Source:** Security Design (specs/5_security_design.md)
- **Dependencies:** None

### **[1_PRD-REQ-SEC-006]** Prompt Injection Mitigation
- **Type:** Security
- **Description:** Treat external data as untrusted and use structured prompting with delimiters.
- **Source:** PRD (Product Requirements Document) (specs/1_prd.md)
- **Dependencies:** None

### **[5_SECURITY_DESIGN-REQ-SEC-SD-039]** Reasoning Log Anonymization
- **Type:** Security
- **Description:** Agent "thoughts" MUST be scrubbed of PII unless explicitly required for the task.
- **Source:** Security Design (specs/5_security_design.md)
- **Dependencies:** None

### **[5_SECURITY_DESIGN-REQ-SEC-THR-003]** Recursive Resource Drain
- **Type:** Security
- **Description:** An agent generates code that creates millions of tiny files or spawns thousands of processes within the sandbox to perform a local DoS.
- **Source:** Security Design (specs/5_security_design.md)
- **Dependencies:** None

### **[3_MCP-REQ-SEC-002]** Resource Quotas
- **Type:** Security
- **Description:** `run_shell_monitored` kills processes exceeding 4GB RSS or 100% CPU for > 10 seconds.
- **Source:** MCP and AI Development Design (specs/3_mcp_design.md)
- **Dependencies:** None

### **[5_SECURITY_DESIGN-REQ-SEC-STR-005]** Resource Quotas and Timeouts
- **Type:** Security
- **Description:** Enforce hard resource quotas (e.g., 2 cores, 4GB) and 300s timeouts to prevent DoS attacks where an agent locks the sandbox CPU.
- **Source:** Security Design (specs/5_security_design.md)
- **Dependencies:** None

### **[5_SECURITY_DESIGN-REQ-SEC-SD-087]** Right to Erasure Implementation
- **Type:** Security
- **Description:** Ensure `devs purge` recursively deletes all state, vectors, and traces.
- **Source:** Security Design (specs/5_security_design.md)
- **Dependencies:** None

### **[5_SECURITY_DESIGN-REQ-SEC-SD-012]** Role-Based Scoping (RBAC)
- **Type:** Security
- **Description:** Implement granular capabilities for MCP tools based on Agent Role (Researcher, Developer, Reviewer).
- **Source:** Security Design (specs/5_security_design.md)
- **Dependencies:** None

### **[9_ROADMAP-REQ-SEC-004]** Sandbox Breach  `SandboxMonitor` kills process and triggers `SECURITY_PAUSE`.
- **Type:** Security
- **Description:** Sandbox Breach  `SandboxMonitor` kills process and triggers `SECURITY_PAUSE`.
- **Source:** Project Roadmap (specs/9_project_roadmap.md)
- **Dependencies:** None

### **[5_SECURITY_DESIGN-REQ-SEC-RSK-001]** Sandbox Escape Risk (WebContainers)
- **Type:** Security
- **Description:** Investigate and mitigate the risk of sandbox escape in WebContainers, especially for complex C-extension based Node modules.
- **Source:** Security Design (specs/5_security_design.md)
- **Dependencies:** None

### **[5_SECURITY_DESIGN-REQ-SEC-SD-063]** Sandbox Violation Alerts
- **Type:** Security
- **Description:** Log network or resource violations as security alerts in the dashboard.
- **Source:** Security Design (specs/5_security_design.md)
- **Dependencies:** None

### **[5_SECURITY_DESIGN-REQ-SEC-SD-057]** Script Execution Blocking
- **Type:** Security
- **Description:** Use `--ignore-scripts` by default; post-install scripts require HITL approval.
- **Source:** Security Design (specs/5_security_design.md)
- **Dependencies:** None

### **[TAS-023]** Secret Masking & Redaction
- **Type:** Security
- **Description:** Middleware layer intercepting sandbox output to redact API keys, credentials, or PII using regex and entropy masking.
- **Source:** TAS (Technical Architecture Specification) (specs/2_tas.md)
- **Dependencies:** None

### **[1_PRD-REQ-SEC-011]** Secret Replacement
- **Type:** Security
- **Description:** Detected secrets replaced with `[REDACTED]`.
- **Source:** PRD (Product Requirements Document) (specs/1_prd.md)
- **Dependencies:** None

### **[5_SECURITY_DESIGN-REQ-SEC-SD-030]** Secure Web Scraping Egress
- **Type:** Security
- **Description:** Research agents MUST default to HTTPS; HTTP content is blocked unless explicitly overridden and logged.
- **Source:** Security Design (specs/5_security_design.md)
- **Dependencies:** None

### **[5_SECURITY_DESIGN-REQ-SEC-SD-075]** Security Alert Table
- **Type:** Security
- **Description:** Dedicated table to log network violations, filesystem violations, resource DoS, and redaction hits.
- **Source:** Security Design (specs/5_security_design.md)
- **Dependencies:** None

### **[5_SECURITY_DESIGN-REQ-SEC-SD-058]** Structured Argument Enforcement
- **Type:** Security
- **Description:** Enforce JSON schema validation, `argv` arrays for shell execution, and path traversal protection for all tool calls.
- **Source:** Security Design (specs/5_security_design.md)
- **Dependencies:** None

### **[5_SECURITY_DESIGN-REQ-SEC-THR-002]** Supply Chain Poisoning
- **Type:** Security
- **Description:** The agent is tricked into choosing a "typosquatted" or malicious library during the Tech Landscape phase because it lacked a live "reputation check."
- **Source:** Security Design (specs/5_security_design.md)
- **Dependencies:** None

### **[9_ROADMAP-REQ-SEC-001]** **[9_ROADMAP-REQ-SEC-002]** **[9_ROADMAP-REQ-SEC-003]** Technical Requirements
- **Type:** Security
- **Description:** Technical Requirements: , , , , , .
- **Source:** Project Roadmap (specs/9_project_roadmap.md)
- **Dependencies:** None

### **[5_SECURITY_DESIGN-REQ-SEC-SD-041]** Temporary Directory Isolation
- **Type:** Security
- **Description:** Temporary directories MUST follow `0700` policy and MUST be purged upon completion.
- **Source:** Security Design (specs/5_security_design.md)
- **Dependencies:** None

### **[5_SECURITY_DESIGN-REQ-SEC-THR-001]** The "Trojan Requirement"
- **Type:** Security
- **Description:** An agent, influenced by malicious research, distills a requirement that seems valid (e.g., "Add health check endpoint") but includes a hidden backdoor (e.g., `eval(req.query.cmd)`).
- **Source:** Security Design (specs/5_security_design.md)
- **Dependencies:** None

### **[5_SECURITY_DESIGN-REQ-SEC-SD-013]** Tool Call Validation & Schema Enforcement
- **Type:** Security
- **Description:** Every MCP tool call MUST be validated against a strict JSON schema; unauthorized arguments MUST result in rejection and logging.
- **Source:** Security Design (specs/5_security_design.md)
- **Dependencies:** None

### **[5_SECURITY_DESIGN-REQ-SEC-SD-070]** UI Redaction Parity
- **Type:** Security
- **Description:** Ensure real-time streams pass through the `SecretMasker` before display in UI.
- **Source:** Security Design (specs/5_security_design.md)
- **Dependencies:** None

### **[5_SECURITY_DESIGN-REQ-SEC-SD-037]** Vector Embedding Integrity
- **Type:** Security
- **Description:** Vector database files MUST be treated as high-confidentiality assets; sensitive blobs SHOULD be encrypted with a project master key.
- **Source:** Security Design (specs/5_security_design.md)
- **Dependencies:** None

### **[5_SECURITY_DESIGN-REQ-SEC-SD-061]** Vector Memory Sanitization
- **Type:** Security
- **Description:** Store research data in a separate, lower-trust partition to prevent semantic poisoning.
- **Source:** Security Design (specs/5_security_design.md)
- **Dependencies:** None

### **[5_SECURITY_DESIGN-REQ-SEC-THR-004]** Verification Bypass
- **Type:** Security
- **Description:** An agent writes both the implementation *and* a "fake" test that passes regardless of the actual logic, tricking the Reviewer Agent.
- **Source:** Security Design (specs/5_security_design.md)
- **Dependencies:** None

### **[1_PRD-REQ-SEC-013]** Vulnerability Trigger
- **Type:** Security
- **Description:** High/Critical vulnerabilities trigger task failure and mitigation update.
- **Source:** PRD (Product Requirements Document) (specs/1_prd.md)
- **Dependencies:** None

### **[5_SECURITY_DESIGN-REQ-SEC-SD-020]** Zero-Persistence Secret Policy
- **Type:** Security
- **Description:** Secrets injected into the sandbox MUST be provided via ephemeral environment variables and scrubbed from all logs.
- **Source:** Security Design (specs/5_security_design.md)
- **Dependencies:** None

### **[5_SECURITY_DESIGN-REQ-SEC-SD-035]** Zero-Plaintext Config
- **Type:** Security
- **Description:** Config and state files MUST NOT contain unencrypted API keys; references MUST use URI-based lookup.
- **Source:** Security Design (specs/5_security_design.md)
- **Dependencies:** None

### **[5_SECURITY_DESIGN-REQ-SEC-SD-054]** Zero-Trust Dependency Management
- **Type:** Security
- **Description:** Protect against supply chain attacks and typosquatting during dependency resolution.
- **Source:** Security Design (specs/5_security_design.md)
- **Dependencies:** None

### **[TAS-101]** @devs/mcp
- **Type:** Technical
- **Description:** Standardized communication protocols using MCP.
- **Source:** TAS (Technical Architecture Specification) (specs/2_tas.md)
- **Dependencies:** None

### **[TAS-099]** @devs/sandbox
- **Type:** Technical
- **Description:** Isolated execution abstraction for shell commands and file I/O.
- **Source:** TAS (Technical Architecture Specification) (specs/2_tas.md)
- **Dependencies:** None

### **[TAS-013]** Agent Sandboxing
- **Type:** Technical
- **Description:** Isolated runtime for agents to execute code safely.
- **Source:** TAS (Technical Architecture Specification) (specs/2_tas.md)
- **Dependencies:** None

### **[5_SECURITY_DESIGN-REQ-SEC-SD-059]** Atomic State Persistence
- **Type:** Technical
- **Description:** Use WAL and ACID transactions in SQLite; ensure consistency between tasks and requirements.
- **Source:** Security Design (specs/5_security_design.md)
- **Dependencies:** None

### **[5_SECURITY_DESIGN-REQ-SEC-SD-072]** Atomic Task Commits
- **Type:** Technical
- **Description:** Every successful task implementation MUST result in an atomic Git commit.
- **Source:** Security Design (specs/5_security_design.md)
- **Dependencies:** None

### **[9_ROADMAP-TAS-203]** Build the Network Egress Proxy with domain whitelist enforcement (npm, pypi, git
- **Type:** Technical
- **Description:** Build the Network Egress Proxy with domain whitelist enforcement (npm, pypi, github).
- **Source:** Project Roadmap (specs/9_project_roadmap.md)
- **Dependencies:** None

### **[5_SECURITY_DESIGN-REQ-SEC-SD-031]** CLI-to-Extension Encrypted IPC
- **Type:** Technical
- **Description:** IPC between CLI and Extension MUST occur over encrypted Unix Domain Sockets or Named Pipes with ACLs.
- **Source:** Security Design (specs/5_security_design.md)
- **Dependencies:** None

### **[5_SECURITY_DESIGN-REQ-SEC-SD-028]** Cipher Suite Enforcement
- **Type:** Technical
- **Description:** Only AEAD-based cipher suites are permitted for external communication.
- **Source:** Security Design (specs/5_security_design.md)
- **Dependencies:** None

### **[5_SECURITY_DESIGN-REQ-SEC-SD-077]** Command-Line Auditing Tool
- **Type:** Technical
- **Description:** Support `devs trace` to output Markdown summaries of agent reasoning for specific tasks.
- **Source:** Security Design (specs/5_security_design.md)
- **Dependencies:** None

### **[5_SECURITY_DESIGN-REQ-SEC-SD-078]** Compliance & Traceability Export
- **Type:** Technical
- **Description:** Generate "Project Integrity Reports" with full requirement-to-commit mapping.
- **Source:** Security Design (specs/5_security_design.md)
- **Dependencies:** None

### **[5_SECURITY_DESIGN-REQ-SEC-SD-084]** Context Window Refresh
- **Type:** Technical
- **Description:** Re-inject TAS and PRD blueprints every 10 turns to combat reasoning decay.
- **Source:** Security Design (specs/5_security_design.md)
- **Dependencies:** None

### **[9_ROADMAP-TAS-201]** Create hardened Docker base images (Alpine-based, non-root user, minimal syscall
- **Type:** Technical
- **Description:** Create hardened Docker base images (Alpine-based, non-root user, minimal syscalls).
- **Source:** Project Roadmap (specs/9_project_roadmap.md)
- **Dependencies:** None

### **[5_SECURITY_DESIGN-REQ-SEC-CRY-006]** Cryptographic MCP Tools
- **Type:** Technical
- **Description:** Perform all signing/encryption via Orchestrator MCP tools to maintain control over keys.
- **Source:** Security Design (specs/5_security_design.md)
- **Dependencies:** None

### **[5_SECURITY_DESIGN-REQ-SEC-SD-025]** Default-Secure Auth Boilerplate
- **Type:** Technical
- **Description:** Generated projects MUST use industry-standard auth defaults (Argon2, JWT rotation, secure cookies); basic-auth is prohibited.
- **Source:** Security Design (specs/5_security_design.md)
- **Dependencies:** None

### **[5_SECURITY_DESIGN-REQ-SEC-CRY-007]** Default-Secure Generated Crypto
- **Type:** Technical
- **Description:** Prioritize native OS crypto modules in generated code over user-land JS implementations.
- **Source:** Security Design (specs/5_security_design.md)
- **Dependencies:** None

### **[5_SECURITY_DESIGN-REQ-SEC-SD-067]** Detailed Observation Persistence
- **Type:** Technical
- **Description:** Store raw tool outputs (after redaction) in SQLite, unaffected by context window truncation.
- **Source:** Security Design (specs/5_security_design.md)
- **Dependencies:** None

### **[5_SECURITY_DESIGN-REQ-SEC-SD-081]** Deterministic Loop Detection
- **Type:** Technical
- **Description:** Trigger `STRATEGY_PIVOT` if the hash of the last 3 error outputs remains identical.
- **Source:** Security Design (specs/5_security_design.md)
- **Dependencies:** None

### **[5_SECURITY_DESIGN-REQ-SEC-SD-080]** Entropy Detection
- **Type:** Technical
- **Description:** Monitor output for repeating patterns to prevent token waste and autonomous "spinning."
- **Source:** Security Design (specs/5_security_design.md)
- **Dependencies:** None

### **[5_SECURITY_DESIGN-REQ-SEC-CRY-004]** Ephemeral Session Keys (IPC)
- **Type:** Technical
- **Description:** Use X25519 to establish and rotate unique session keys for CLI/Extension IPC.
- **Source:** Security Design (specs/5_security_design.md)
- **Dependencies:** None

### **[TAS-080]** Execution Layer (Sandbox)
- **Type:** Technical
- **Description:** An isolated Docker or WebContainer environment where agents perform file I/O, run tests, and execute shell commands.
- **Source:** TAS (Technical Architecture Specification) (specs/2_tas.md)
- **Dependencies:** None

### **[1_PRD-REQ-SEC-010]** Execution Time Cap
- **Type:** Technical
- **Description:** Capped at 5 minutes per tool call in sandbox.
- **Source:** PRD (Product Requirements Document) (specs/1_prd.md)
- **Dependencies:** None

### **[5_SECURITY_DESIGN-REQ-SEC-SD-076]** Forensic Sandbox Persistence
- **Type:** Technical
- **Description:** Preserve container state on failure or violation for manual analysis via `devs debug`.
- **Source:** Security Design (specs/5_security_design.md)
- **Dependencies:** None

### **[TAS-043]** Generated Project MCP API
- **Type:** Technical
- **Description:** Mandatory internal MCP server in generated projects for post-delivery maintenance.
- **Source:** TAS (Technical Architecture Specification) (specs/2_tas.md)
- **Dependencies:** None

### **[5_SECURITY_DESIGN-REQ-SEC-SD-074]** Git-DB Correlation (Rewind)
- **Type:** Technical
- **Description:** Store HEAD hash in tasks table to support consistent historical rewinds.
- **Source:** Security Design (specs/5_security_design.md)
- **Dependencies:** None

### **[5_SECURITY_DESIGN-REQ-SEC-EDG-002]** Host Entropy Management
- **Type:** Technical
- **Description:** Seed sandbox PRNGs from host entropy source to ensure non-blocking operation.
- **Source:** Security Design (specs/5_security_design.md)
- **Dependencies:** None

### **[5_SECURITY_DESIGN-REQ-SEC-QST-002]** Host-Aware Agent Implementation
- **Type:** Technical
- **Description:** Determine how to handle "Host-Aware" agents that need OS details without leaking sensitive host information.
- **Source:** Security Design (specs/5_security_design.md)
- **Dependencies:** None

### **[5_SECURITY_DESIGN-REQ-SEC-SD-014]** IPC Security (CLI <-> Extension)
- **Type:** Technical
- **Description:** Communication between the VSCode extension and CLI logic MUST use a secure local Unix Socket or Named Pipe with a unique, ephemeral 128-bit Handshake Token.
- **Source:** Security Design (specs/5_security_design.md)
- **Dependencies:** None

### **[5_SECURITY_DESIGN-REQ-SEC-SD-023]** Immutable Architectural Sign-off
- **Type:** Technical
- **Description:** Once the TAS is approved, the Developer Agent is NOT authorized to modify core architectural files without a specific directive.
- **Source:** Security Design (specs/5_security_design.md)
- **Dependencies:** None

### **[9_ROADMAP-TAS-206]** Implement `surgical_edit` tool to prevent full-file overwrites and minimize cont
- **Type:** Technical
- **Description:** Implement `surgical_edit` tool to prevent full-file overwrites and minimize context drift.
- **Source:** Project Roadmap (specs/9_project_roadmap.md)
- **Dependencies:** None

### **[9_ROADMAP-TAS-207]** Implement resource quotas for sandboxes (CPU/RAM limiting via Cgroups).
- **Type:** Technical
- **Description:** Implement resource quotas for sandboxes (CPU/RAM limiting via Cgroups).
- **Source:** Project Roadmap (specs/9_project_roadmap.md)
- **Dependencies:** None

### **[5_SECURITY_DESIGN-REQ-SEC-CRY-002]** Key Wrapping (KEK)
- **Type:** Technical
- **Description:** Wrap asset-specific keys using the Master Key.
- **Source:** Security Design (specs/5_security_design.md)
- **Dependencies:** None

### **[5_SECURITY_DESIGN-REQ-SEC-EDG-001]** Legacy System Crypto Wrapping
- **Type:** Technical
- **Description:** Wrap legacy weak primitives in a dedicated adapter flagged for human audit.
- **Source:** Security Design (specs/5_security_design.md)
- **Dependencies:** None

### **[5_SECURITY_DESIGN-REQ-SEC-QST-001]** Local-only Model Support
- **Type:** Technical
- **Description:** Evaluate supporting "Local-only" models to eliminate external service trust risks for enterprise users.
- **Source:** Security Design (specs/5_security_design.md)
- **Dependencies:** None

### **[TAS-036]** MCP Standard Usage
- **Type:** Technical
- **Description:** Unified interface for all tool-based operations using MCP.
- **Source:** TAS (Technical Architecture Specification) (specs/2_tas.md)
- **Dependencies:** None

### **[5_SECURITY_DESIGN-REQ-SEC-SD-055]** Mandatory Lockfile Enforcement
- **Type:** Technical
- **Description:** The `DependencyManager` MUST fail if no lockfile is generated/updated during installation.
- **Source:** Security Design (specs/5_security_design.md)
- **Dependencies:** None

### **[5_SECURITY_DESIGN-REQ-SEC-SD-027]** Mandatory TLS 1.3
- **Type:** Technical
- **Description:** All outbound requests to external APIs MUST use TLS 1.3.
- **Source:** Security Design (specs/5_security_design.md)
- **Dependencies:** None

### **[5_SECURITY_DESIGN-REQ-SEC-SD-042]** Master Key Derivation
- **Type:** Technical
- **Description:** A 256-bit project master key MUST be derived from the user's host keychain using PBKDF2-HMAC-SHA512.
- **Source:** Security Design (specs/5_security_design.md)
- **Dependencies:** None

### **[5_SECURITY_DESIGN-REQ-SEC-CRY-001]** Master Key Derivation Strategy
- **Type:** Technical
- **Description:** Derive a 256-bit Project Master Key from the user's host keychain using PBKDF2-HMAC-SHA512.
- **Source:** Security Design (specs/5_security_design.md)
- **Dependencies:** None

### **[5_SECURITY_DESIGN-REQ-SEC-SD-066]** Metadata Correlation in Logs
- **Type:** Technical
- **Description:** Tag log entries with thread_id, task_id, agent_role, turn_index, and git_commit_hash.
- **Source:** Security Design (specs/5_security_design.md)
- **Dependencies:** None

### **[TAS-014]** Model Context Protocol (MCP) Integration
- **Type:** Technical
- **Description:** Full integration of MCP SDK for standardized tool interfaces and orchestrator observability.
- **Source:** TAS (Technical Architecture Specification) (specs/2_tas.md)
- **Dependencies:** None

### **[5_SECURITY_DESIGN-REQ-SEC-QST-902]** Native Extension Sandbox Support
- **Type:** Technical
- **Description:** Develop strategy for handling projects requiring broad permissions for native extension compilation.
- **Source:** Security Design (specs/5_security_design.md)
- **Dependencies:** None

### **[5_SECURITY_DESIGN-REQ-SEC-QST-201]** Post-Quantum Cryptography Evaluation
- **Type:** Technical
- **Description:** Evaluate future implementation of PQC primitives (e.g., Kyber) for IPC handshakes.
- **Source:** Security Design (specs/5_security_design.md)
- **Dependencies:** None

### **[5_SECURITY_DESIGN-REQ-SEC-SD-068]** Reasoning Persistence
- **Type:** Technical
- **Description:** Never discard the reasoning chain; store it as a blob for post-hoc analysis.
- **Source:** Security Design (specs/5_security_design.md)
- **Dependencies:** None

### **[5_SECURITY_DESIGN-REQ-SEC-RSK-902]** Redaction False Positive Management
- **Type:** Technical
- **Description:** Handle incorrect redaction of high-entropy binary/encoded artifacts that could break builds.
- **Source:** Security Design (specs/5_security_design.md)
- **Dependencies:** None

### **[5_SECURITY_DESIGN-REQ-SEC-RSK-201]** Redaction Hash Collision Mitigation
- **Type:** Technical
- **Description:** Use first 12 chars of SHA-256 for secret masking to allow correlation while minimizing collision risk.
- **Source:** Security Design (specs/5_security_design.md)
- **Dependencies:** None

### **[5_SECURITY_DESIGN-REQ-SEC-SD-064]** Requirement-to-Commit Traceability
- **Type:** Technical
- **Description:** Tag every Git commit with a REQ-ID and reference to the SQLite task record.
- **Source:** Security Design (specs/5_security_design.md)
- **Dependencies:** None

### **[1_PRD-REQ-SEC-004]** Resource Quotas
- **Type:** Technical
- **Description:** CPU/Memory restrictions and execution time caps (5 min) for sandboxes.
- **Source:** PRD (Product Requirements Document) (specs/1_prd.md)
- **Dependencies:** None

### **[5_SECURITY_DESIGN-REQ-SEC-RSK-901]** Sandbox Performance Overhead
- **Type:** Technical
- **Description:** Monitor and mitigate build time impact from strict Docker isolation.
- **Source:** Security Design (specs/5_security_design.md)
- **Dependencies:** None

### **[TAS-021]** Sandbox Resource Constraints
- **Type:** Technical
- **Description:** Limits of 2 vCPUs, 4GB RAM, 2GB storage, and 300s timeout per tool call.
- **Source:** TAS (Technical Architecture Specification) (specs/2_tas.md)
- **Dependencies:** None

### **[5_SECURITY_DESIGN-REQ-SEC-SD-044]** Secure Deletion (devs purge)
- **Type:** Technical
- **Description:** The `purge` command MUST overwrite sensitive files with random data before removal.
- **Source:** Security Design (specs/5_security_design.md)
- **Dependencies:** None

### **[9_ROADMAP-TAS-205]** Setup MCP Tool Registry
- **Type:** Technical
- **Description:** Setup MCP Tool Registry: `read_file`, `write_file`, `shell_exec`, `git_commit`, `surgical_edit`.
- **Source:** Project Roadmap (specs/9_project_roadmap.md)
- **Dependencies:** None

### **[5_SECURITY_DESIGN-REQ-SEC-SD-082]** Strategy Pivot Directive
- **Type:** Technical
- **Description:** Force the agent to "Reason from First Principles" and address the repeating error.
- **Source:** Security Design (specs/5_security_design.md)
- **Dependencies:** None

### **[1_PRD-REQ-SEC-012]** Structured Prompting
- **Type:** Technical
- **Description:** Use delimiters like `<untrusted_context>` to minimize prompt injection.
- **Source:** PRD (Product Requirements Document) (specs/1_prd.md)
- **Dependencies:** None

### **[TAS-041]** TDD Verification & Binary Gate Protocol
- **Type:** Technical
- **Description:** Set of deterministic exit-code gates (RED, GREEN, REGRESSION, QUALITY) for task progression.
- **Source:** TAS (Technical Architecture Specification) (specs/2_tas.md)
- **Dependencies:** None

### **[TAS-042]** The .agent/ Directory Requirement
- **Type:** Technical
- **Description:** Contains Agent-Oriented Documentation (AOD) for future AI agent context.
- **Source:** TAS (Technical Architecture Specification) (specs/2_tas.md)
- **Dependencies:** [TAS-104]

### **[TAS-044]** The docs/ Directory Requirement
- **Type:** Technical
- **Description:** Standardized Markdown specs and research reports generated during Phase 1 & 2.
- **Source:** TAS (Technical Architecture Specification) (specs/2_tas.md)
- **Dependencies:** [TAS-104]

### **[TAS-062]** The mcp-server/ Directory Requirement
- **Type:** Technical
- **Description:** Standalone MCP project in generated output for application inspection.
- **Source:** TAS (Technical Architecture Specification) (specs/2_tas.md)
- **Dependencies:** [TAS-104]

### **[5_SECURITY_DESIGN-REQ-SEC-RSK-002]** Token Redaction Latency
- **Type:** Technical
- **Description:** Ensure `SecretMasker` performance does not introduce significant latency in the "Green-Phase" of the TDD loop.
- **Source:** Security Design (specs/5_security_design.md)
- **Dependencies:** None

### **[TAS-072]** Tool Execution Flow
- **Type:** Technical
- **Description:** Agents emit tool_call; core validates via ToolRegistry and forwards to sandbox; result logged to agent_logs.
- **Source:** TAS (Technical Architecture Specification) (specs/2_tas.md)
- **Dependencies:** None

### **[5_SECURITY_DESIGN-REQ-SEC-SD-073]** Trace Linkage in Commits
- **Type:** Technical
- **Description:** Commit messages MUST include TASK-ID and a reference to the reasoning trace.
- **Source:** Security Design (specs/5_security_design.md)
- **Dependencies:** None

### **[TAS-045]** src and tests Directory Structure
- **Type:** Technical
- **Description:** Modular src structure mirroring defined architecture; tests mirroring src with unit, integration, and agent-specific tests.
- **Source:** TAS (Technical Architecture Specification) (specs/2_tas.md)
- **Dependencies:** [TAS-104]

### **[5_SECURITY_DESIGN-REQ-SEC-SD-083]** Escalation Pause
- **Type:** UX
- **Description:** Enter `PAUSED_FOR_INTERVENTION` state after 5 total failed implementation attempts.
- **Source:** Security Design (specs/5_security_design.md)
- **Dependencies:** None

### **[5_SECURITY_DESIGN-REQ-SEC-SD-071]** HITL Block Signaling
- **Type:** UX
- **Description:** Provide explicit events when the orchestrator is awaiting user approval.
- **Source:** Security Design (specs/5_security_design.md)
- **Dependencies:** None

### **[5_SECURITY_DESIGN-REQ-SEC-SD-069]** Low-Latency Event Bus
- **Type:** UX
- **Description:** Stream thought streams and sandbox pulses via WebSockets or SSE for real-time observability.
- **Source:** Security Design (specs/5_security_design.md)
- **Dependencies:** None

### **[5_SECURITY_DESIGN-REQ-SEC-SD-022]** Mandatory Approval Junctions
- **Type:** UX
- **Description:** The orchestrator state machine MUST implement hard blocks at Phase 2 and Phase 3, requiring a `human_approval_signature` to proceed.
- **Source:** Security Design (specs/5_security_design.md)
- **Dependencies:** None

## **Block 2: Phase 1 - Discovery & Research**

### **[1_PRD-REQ-RES-001]** Market & Competitive Analysis
- **Type:** Functional
- **Description:** Identify 5+ competitors, feature sets, pricing, and SWOT analysis.
- **Source:** PRD (Product Requirements Document) (specs/1_prd.md)
- **Dependencies:** None

### **[1_PRD-REQ-RES-005]** Niche Markets
- **Type:** Functional
- **Description:** Analyze Adjacent Markets or Manual Workarounds if no direct competitors found.
- **Source:** PRD (Product Requirements Document) (specs/1_prd.md)
- **Dependencies:** None

### **[TAS-049]** Phase 1: Discovery & Research
- **Type:** Functional
- **Description:** Deployment of parallel agents to analyze market, technology landscape, and competitive space.
- **Source:** TAS (Technical Architecture Specification) (specs/2_tas.md)
- **Dependencies:** None

### **[1_PRD-REQ-RES-004]** Research Edge Cases
- **Type:** Functional
- **Description:** Analyze adjacent markets or manual workarounds if no direct competitors are found.
- **Source:** PRD (Product Requirements Document) (specs/1_prd.md)
- **Dependencies:** None

### **[1_PRD-REQ-MAP-003]** Research report details
- **Type:** Functional
- **Description:** Research reports must include "Pros/Cons" and "Trade-offs" sections for learning.
- **Source:** PRD (Product Requirements Document) (specs/1_prd.md)
- **Dependencies:** None

### **[1_PRD-REQ-RES-003]** User Persona & Journey Mapping
- **Type:** Functional
- **Description:** Detailed profiles for 3+ personas and Mermaid.js sequence diagrams for core journeys.
- **Source:** PRD (Product Requirements Document) (specs/1_prd.md)
- **Dependencies:** None

### **[9_ROADMAP-TAS-304]** Develop Tech Landscape decision matrix generator (weighted comparison of framewo
- **Type:** Technical
- **Description:** Develop Tech Landscape decision matrix generator (weighted comparison of frameworks/libraries).
- **Source:** Project Roadmap (specs/9_project_roadmap.md)
- **Dependencies:** None

### **[9_ROADMAP-TAS-301]** Develop `ResearchManager` agent for parallelizing Market, Competitive, and Tech
- **Type:** Technical
- **Description:** Develop `ResearchManager` agent for parallelizing Market, Competitive, and Tech searches.
- **Source:** Project Roadmap (specs/9_project_roadmap.md)
- **Dependencies:** None

### **[9_ROADMAP-TAS-303]** Implement `ContentExtractor` to convert dynamic/SPA content into clean Markdown.
- **Type:** Technical
- **Description:** Implement `ContentExtractor` to convert dynamic/SPA content into clean Markdown.
- **Source:** Project Roadmap (specs/9_project_roadmap.md)
- **Dependencies:** None

### **[9_ROADMAP-TAS-305]** Implement automated Markdown report generation with Mermaid SWOT and Decision Ma
- **Type:** Technical
- **Description:** Implement automated Markdown report generation with Mermaid SWOT and Decision Matrix diagrams.
- **Source:** Project Roadmap (specs/9_project_roadmap.md)
- **Dependencies:** None

### **[9_ROADMAP-TAS-302]** Integrate Serper/Google Search API with "Source Credibility" scoring.
- **Type:** Technical
- **Description:** Integrate Serper/Google Search API with "Source Credibility" scoring.
- **Source:** Project Roadmap (specs/9_project_roadmap.md)
- **Dependencies:** None

### **[1_PRD-REQ-MAP-006]** Mandatory entropy detection
- **Type:** Technical
- **Description:** Mandatory entropy detection (Max 3 retries per task) for reliability.
- **Source:** PRD (Product Requirements Document) (specs/1_prd.md)
- **Dependencies:** None

### **[1_PRD-REQ-MAP-001]** Parallelized Research Agents
- **Type:** Technical
- **Description:** Parallelized Research Agents (Market/Comp/Tech) for speed.
- **Source:** PRD (Product Requirements Document) (specs/1_prd.md)
- **Dependencies:** None

### **[1_PRD-REQ-MAP-002]** Persistent decision log
- **Type:** Technical
- **Description:** Persistent decision log in `.devs/state.sqlite` for auditability.
- **Source:** PRD (Product Requirements Document) (specs/1_prd.md)
- **Dependencies:** None

### **[9_ROADMAP-PHASE-003]** Phase 3
- **Type:** Technical
- **Description:** Phase 3: Discovery & Research Agents
- **Source:** Project Roadmap (specs/9_project_roadmap.md)
- **Dependencies:** None

### **[1_PRD-REQ-RES-007]** Research Agent Deployment & Scoring
- **Type:** Technical
- **Description:** Deploy specialized agents to generate a research suite with Confidence Scores and cited sources.
- **Source:** PRD (Product Requirements Document) (specs/1_prd.md)
- **Dependencies:** None

### **[1_PRD-REQ-MAP-004]** Sandbox Tooling
- **Type:** Technical
- **Description:** MCP servers MUST be injected into the Sandbox on startup.
- **Source:** PRD (Product Requirements Document) (specs/1_prd.md)
- **Dependencies:** None

### **[1_PRD-REQ-RES-006]** Stale Data Prevention
- **Type:** Technical
- **Description:** Perform live searches to ensure recommended libraries are not deprecated.
- **Source:** PRD (Product Requirements Document) (specs/1_prd.md)
- **Dependencies:** None

### **[1_PRD-REQ-RES-002]** Technology Landscape & Decision Matrix
- **Type:** Technical
- **Description:** Evaluate stacks against performance, scalability, and "Agent-Friendliness" with a weighted matrix.
- **Source:** PRD (Product Requirements Document) (specs/1_prd.md)
- **Dependencies:** None

### **[1_PRD-REQ-MAP-005]** Real-time streaming
- **Type:** UX
- **Description:** Real-time streaming of LangGraph state to VSCode Sidebar.
- **Source:** PRD (Product Requirements Document) (specs/1_prd.md)
- **Dependencies:** None

## **Block 3: Phase 2 - Documentation & Blueprinting**

### **[1_PRD-REQ-DOC-001]** PRD (Product Requirements Document)
- **Type:** Functional
- **Description:** Generate PRD including Goals, Non-Goals, User Stories (Gherkin), and Constraints.
- **Source:** PRD (Product Requirements Document) (specs/1_prd.md)
- **Dependencies:** None

### **[TAS-050]** Phase 2: Blueprint Generation
- **Type:** Functional
- **Description:** The Architect Agent generates PRDs and TAS documents, ending with a mandatory user approval gate.
- **Source:** TAS (Technical Architecture Specification) (specs/2_tas.md)
- **Dependencies:** [TAS-049]

### **[9_ROADMAP-REQ-DOC-001]** **[9_ROADMAP-REQ-DOC-002]** **[9_ROADMAP-REQ-DOC-003]** **[9_ROADMAP-REQ-INT-001]** **[9_ROADMAP-REQ-INT-002]** **[9_ROADMAP-REQ-INT-003]** **[9_ROADMAP-REQ-MAP-002]** **[9_ROADMAP-REQ-SYS-002]** **[9_ROADMAP-REQ-SYS-003]** **[9_ROADMAP-REQ-UI-001]** **[9_ROADMAP-REQ-UI-002]** **[9_ROADMAP-REQ-UI-005]** **[9_ROADMAP-REQ-UI-009]** Technical Requirements
- **Type:** Functional
- **Description:** Technical Requirements: , , , , .
- **Source:** Project Roadmap (specs/9_project_roadmap.md)
- **Dependencies:** None

### **[1_PRD-REQ-DOC-010]** Mitigation Strategies
- **Type:** Security
- **Description:** Detailed strategies for each identified security risk.
- **Source:** PRD (Product Requirements Document) (specs/1_prd.md)
- **Dependencies:** None

### **[1_PRD-REQ-DOC-005]** Security & Mitigation Plan
- **Type:** Security
- **Description:** Threat model with top 3 risks and mitigation strategies.
- **Source:** PRD (Product Requirements Document) (specs/1_prd.md)
- **Dependencies:** None

### **[1_PRD-REQ-DOC-008]** API/Interface Contracts
- **Type:** Technical
- **Description:** Definition of core internal interfaces (TypeScript or Protobuf).
- **Source:** PRD (Product Requirements Document) (specs/1_prd.md)
- **Dependencies:** None

### **[9_ROADMAP-TAS-402]** Build Mermaid.js auto-generator for ERDs, Sequence Diagrams, and Site Maps.
- **Type:** Technical
- **Description:** Build Mermaid.js auto-generator for ERDs, Sequence Diagrams, and Site Maps.
- **Source:** Project Roadmap (specs/9_project_roadmap.md)
- **Dependencies:** None

### **[1_PRD-REQ-DOC-007]** Data Model
- **Type:** Technical
- **Description:** Mermaid.js ERD (Entity Relationship Diagram) in the TAS.
- **Source:** PRD (Product Requirements Document) (specs/1_prd.md)
- **Dependencies:** None

### **[9_ROADMAP-TAS-404]** Develop the "Wait-for-Approval" HITL gate logic in LangGraph.
- **Type:** Technical
- **Description:** Develop the "Wait-for-Approval" HITL gate logic in LangGraph.
- **Source:** Project Roadmap (specs/9_project_roadmap.md)
- **Dependencies:** None

### **[9_ROADMAP-TAS-405]** Implement "Spec Synchronization" logic to detect and update requirements when do
- **Type:** Technical
- **Description:** Implement "Spec Synchronization" logic to detect and update requirements when docs are edited.
- **Source:** Project Roadmap (specs/9_project_roadmap.md)
- **Dependencies:** None

### **[9_ROADMAP-TAS-401]** Implement `ArchitectAgent` (Gemini 3 Pro) for PRD and TAS generation.
- **Type:** Technical
- **Description:** Implement `ArchitectAgent` (Gemini 3 Pro) for PRD and TAS generation.
- **Source:** Project Roadmap (specs/9_project_roadmap.md)
- **Dependencies:** None

### **[1_PRD-REQ-DOC-003]** MCP & Glass-Box Architecture
- **Type:** Technical
- **Description:** Specification for internal MCP server and "Introspection Points".
- **Source:** PRD (Product Requirements Document) (specs/1_prd.md)
- **Dependencies:** None

### **[1_PRD-REQ-DOC-011]** Machine-Readable Document Schema
- **Type:** Technical
- **Description:** All authoritative documents must follow a strict schema for machine readability by the Distiller Agent.
- **Source:** PRD (Product Requirements Document) (specs/1_prd.md)
- **Dependencies:** None

### **[9_ROADMAP-PHASE-004]** Phase 4
- **Type:** Technical
- **Description:** Phase 4: Documentation & Blueprinting Agents
- **Source:** Project Roadmap (specs/9_project_roadmap.md)
- **Dependencies:** None

### **[1_PRD-REQ-DOC-006]** System Layout
- **Type:** Technical
- **Description:** Detailed folder structure proposal in the TAS.
- **Source:** PRD (Product Requirements Document) (specs/1_prd.md)
- **Dependencies:** None

### **[1_PRD-REQ-DOC-002]** TAS (Technical Architecture Specification)
- **Type:** Technical
- **Description:** Generate TAS including System Layout, Data Model (ERD), and API/Interface contracts.
- **Source:** PRD (Product Requirements Document) (specs/1_prd.md)
- **Dependencies:** None

### **[9_ROADMAP-TAS-403]** Implement specialized Security Design and UI/UX Architecture agents.
- **Type:** UX
- **Description:** Implement specialized Security Design and UI/UX Architecture agents.
- **Source:** Project Roadmap (specs/9_project_roadmap.md)
- **Dependencies:** None

### **[1_PRD-REQ-DOC-009]** Site Map
- **Type:** UX
- **Description:** Mermaid.js Site Map showing page hierarchy.
- **Source:** PRD (Product Requirements Document) (specs/1_prd.md)
- **Dependencies:** None

### **[1_PRD-REQ-DOC-004]** UI/UX Design System
- **Type:** UX
- **Description:** Definition of color palettes, typography, components, and Site Map.
- **Source:** PRD (Product Requirements Document) (specs/1_prd.md)
- **Dependencies:** None

## **Block 4: Phase 3 - Requirement Compilation**

### **[9_ROADMAP-REQ-PLAN-003]** Dependency Deadlock Distiller Agent flags circular dependency and requests user
- **Type:** Functional
- **Description:** Dependency Deadlock Distiller Agent flags circular dependency and requests user DAG edit.
- **Source:** Project Roadmap (specs/9_project_roadmap.md)
- **Dependencies:** None

### **[1_PRD-REQ-PLAN-006]** Epic Count
- **Type:** Functional
- **Description:** Project broken into 8-16 phases/epics representing logical milestones.
- **Source:** PRD (Product Requirements Document) (specs/1_prd.md)
- **Dependencies:** None

### **[TAS-051]** Phase 3: Requirement Compilation
- **Type:** Functional
- **Description:** The Distiller Agent translates documents into atomic requirements and a Directed Acyclic Graph (DAG) of implementation tasks.
- **Source:** TAS (Technical Architecture Specification) (specs/2_tas.md)
- **Dependencies:** [TAS-050]

### **[1_PRD-REQ-PLAN-001]** Atomic Requirement Extraction
- **Type:** Technical
- **Description:** Parse all Phase 1 & 2 docs to extract unique, atomic, testable, and traceable requirements.
- **Source:** PRD (Product Requirements Document) (specs/1_prd.md)
- **Dependencies:** None

### **[9_ROADMAP-TAS-505]** Build the RTI (Requirement Traceability Index) calculator.
- **Type:** Technical
- **Description:** Build the RTI (Requirement Traceability Index) calculator.
- **Source:** Project Roadmap (specs/9_project_roadmap.md)
- **Dependencies:** None

### **[9_ROADMAP-TAS-503]** Build the Task Dependency DAG (Directed Acyclic Graph) generator.
- **Type:** Technical
- **Description:** Build the Task Dependency DAG (Directed Acyclic Graph) generator.
- **Source:** Project Roadmap (specs/9_project_roadmap.md)
- **Dependencies:** None

### **[1_PRD-REQ-PLAN-003]** Dependency DAG
- **Type:** Technical
- **Description:** Generate a Directed Acyclic Graph of all tasks and support parallel execution.
- **Source:** PRD (Product Requirements Document) (specs/1_prd.md)
- **Dependencies:** None

### **[9_ROADMAP-TAS-502]** Develop the Epic (8-16) and Task (200+) generation algorithm.
- **Type:** Technical
- **Description:** Develop the Epic (8-16) and Task (200+) generation algorithm.
- **Source:** Project Roadmap (specs/9_project_roadmap.md)
- **Dependencies:** None

### **[1_PRD-REQ-PLAN-002]** Epic & Task Orchestration
- **Type:** Technical
- **Description:** Break project into epics and tasks with clear definition and success criteria.
- **Source:** PRD (Product Requirements Document) (specs/1_prd.md)
- **Dependencies:** None

### **[9_ROADMAP-TAS-501]** Implement Requirement Distiller (Atomic REQ extraction with REQ-ID mapping).
- **Type:** Technical
- **Description:** Implement Requirement Distiller (Atomic REQ extraction with REQ-ID mapping).
- **Source:** Project Roadmap (specs/9_project_roadmap.md)
- **Dependencies:** None

### **[9_ROADMAP-TAS-504]** Implement Token/Cost Estimation heuristic per Epic and Phase.
- **Type:** Technical
- **Description:** Implement Token/Cost Estimation heuristic per Epic and Phase.
- **Source:** Project Roadmap (specs/9_project_roadmap.md)
- **Dependencies:** None

### **[9_ROADMAP-PHASE-005]** Phase 5
- **Type:** Technical
- **Description:** Phase 5: Requirement Distiller & Roadmap Generator
- **Source:** Project Roadmap (specs/9_project_roadmap.md)
- **Dependencies:** None

### **[1_PRD-REQ-PLAN-005]** Task Definition
- **Type:** Technical
- **Description:** Tasks must include ID, Title, Description, Input Files, Success Criteria, and Dependencies.
- **Source:** PRD (Product Requirements Document) (specs/1_prd.md)
- **Dependencies:** None

### **[1_PRD-REQ-PLAN-004]** Task Granularity
- **Type:** Technical
- **Description:** 25+ tasks per Epic, limited to 200 lines of change per task.
- **Source:** PRD (Product Requirements Document) (specs/1_prd.md)
- **Dependencies:** None

## **Block 5: Phase 4 - TDD Implementation**

### **[1_PRD-REQ-IMP-009]** Automated Hand-off
- **Type:** Functional
- **Description:** Pause and hand off to user after 5 total task failures with a detailed report.
- **Source:** PRD (Product Requirements Document) (specs/1_prd.md)
- **Dependencies:** None

### **[TAS-052]** Phase 4: TDD Implementation
- **Type:** Functional
- **Description:** Iterative execution of tasks using Developer Agent in a TDD cycle (write test, fail, write code, pass).
- **Source:** TAS (Technical Architecture Specification) (specs/2_tas.md)
- **Dependencies:** [TAS-051]

### **[9_ROADMAP-REQ-IMP-002]** TAS Violation  Reviewer Agent blocks commit and returns task to `PlanNode`.
- **Type:** Functional
- **Description:** TAS Violation  Reviewer Agent blocks commit and returns task to `PlanNode`.
- **Source:** Project Roadmap (specs/9_project_roadmap.md)
- **Dependencies:** None

### **[9_ROADMAP-REQ-IMP-001]** **[9_ROADMAP-REQ-IMP-003]** **[9_ROADMAP-REQ-IMP-005]** **[9_ROADMAP-REQ-UI-012]** Technical Requirements
- **Type:** Functional
- **Description:** Technical Requirements: , , , , , .
- **Source:** Project Roadmap (specs/9_project_roadmap.md)
- **Dependencies:** None

### **[1_PRD-REQ-IMP-003]** Agentic Memory & Decision Logging
- **Type:** Technical
- **Description:** Management of short-term, medium-term, and long-term agent memory.
- **Source:** PRD (Product Requirements Document) (specs/1_prd.md)
- **Dependencies:** None

### **[1_PRD-REQ-IMP-008]** Atomic Commits
- **Type:** Technical
- **Description:** Task completion must result in a commit with Task ID and summary.
- **Source:** PRD (Product Requirements Document) (specs/1_prd.md)
- **Dependencies:** None

### **[9_ROADMAP-TAS-604]** Build the Entropy Detector (SHA-256 hash comparison of terminal stdout/stderr).
- **Type:** Technical
- **Description:** Build the Entropy Detector (SHA-256 hash comparison of terminal stdout/stderr).
- **Source:** Project Roadmap (specs/9_project_roadmap.md)
- **Dependencies:** None

### **[1_PRD-REQ-IMP-007]** Cleanup
- **Type:** Technical
- **Description:** Persist sandbox on failure for debugging, destroy on success.
- **Source:** PRD (Product Requirements Document) (specs/1_prd.md)
- **Dependencies:** None

### **[1_PRD-REQ-IMP-013]** Deterministic Execution Engine
- **Type:** Technical
- **Description:** The core execution engine must be deterministic and resilient.
- **Source:** PRD (Product Requirements Document) (specs/1_prd.md)
- **Dependencies:** None

### **[9_ROADMAP-TAS-606]** Develop "Medium-term Memory" handoffs (summarizing task status for the next task
- **Type:** Technical
- **Description:** Develop "Medium-term Memory" handoffs (summarizing task status for the next task).
- **Source:** Project Roadmap (specs/9_project_roadmap.md)
- **Dependencies:** None

### **[9_ROADMAP-TAS-602]** Develop Developer Agent turn logic (SAOP implementation, file-level write locks)
- **Type:** Technical
- **Description:** Develop Developer Agent turn logic (SAOP implementation, file-level write locks).
- **Source:** Project Roadmap (specs/9_project_roadmap.md)
- **Dependencies:** None

### **[1_PRD-REQ-IMP-005]** Entropy Detection & Automated Backoff
- **Type:** Technical
- **Description:** Strategy shift or automated hand-off after repeated task failures.
- **Source:** PRD (Product Requirements Document) (specs/1_prd.md)
- **Dependencies:** None

### **[1_PRD-REQ-IMP-011]** Git Repository Management
- **Type:** Technical
- **Description:** The system must manage a git repository for the generated project.
- **Source:** PRD (Product Requirements Document) (specs/1_prd.md)
- **Dependencies:** None

### **[1_PRD-REQ-IMP-004]** Git Strategy & Atomic Commits
- **Type:** Technical
- **Description:** Manage a git repository with atomic commits for each task completion.
- **Source:** PRD (Product Requirements Document) (specs/1_prd.md)
- **Dependencies:** None

### **[9_ROADMAP-TAS-605]** Implement the "Strategy Pivot" logic (force reasoning shift from first principle
- **Type:** Technical
- **Description:** Implement the "Strategy Pivot" logic (force reasoning shift from first principles).
- **Source:** Project Roadmap (specs/9_project_roadmap.md)
- **Dependencies:** None

### **[9_ROADMAP-TAS-603]** Implement the Independent Reviewer Agent (regression audit, pattern compliance).
- **Type:** Technical
- **Description:** Implement the Independent Reviewer Agent (regression audit, pattern compliance).
- **Source:** Project Roadmap (specs/9_project_roadmap.md)
- **Dependencies:** None

### **[9_ROADMAP-TAS-601]** Implement the TDD Loop (Plan -> Test -> Code -> Verify -> Commit).
- **Type:** Technical
- **Description:** Implement the TDD Loop (Plan -> Test -> Code -> Verify -> Commit).
- **Source:** Project Roadmap (specs/9_project_roadmap.md)
- **Dependencies:** None

### **[9_ROADMAP-PHASE-006]** Phase 6
- **Type:** Technical
- **Description:** Phase 6: TDD Implementation Engine & Reviewer Agent
- **Source:** Project Roadmap (specs/9_project_roadmap.md)
- **Dependencies:** None

### **[1_PRD-REQ-IMP-006]** Pre-flight
- **Type:** Technical
- **Description:** Inject sandbox with codebase, task requirements, and MCP tools.
- **Source:** PRD (Product Requirements Document) (specs/1_prd.md)
- **Dependencies:** None

### **[1_PRD-REQ-IMP-010]** Provisioning
- **Type:** Technical
- **Description:** Spin up a fresh sandbox (Docker/WebContainer) for each task.
- **Source:** PRD (Product Requirements Document) (specs/1_prd.md)
- **Dependencies:** None

### **[1_PRD-REQ-IMP-001]** Sandbox Lifecycle Management
- **Type:** Technical
- **Description:** Provisioning, pre-flight injection, and cleanup of ephemeral sandboxes.
- **Source:** PRD (Product Requirements Document) (specs/1_prd.md)
- **Dependencies:** None

### **[1_PRD-REQ-IMP-012]** Strategy Shift
- **Type:** Technical
- **Description:** Attempt a reasoning or implementation pivot after 3 failures.
- **Source:** PRD (Product Requirements Document) (specs/1_prd.md)
- **Dependencies:** None

### **[1_PRD-REQ-IMP-002]** Strict TDD Cycle
- **Type:** Technical
- **Description:** Mandatory Red (fail) -> Green (pass) -> Validation loop for every task.
- **Source:** PRD (Product Requirements Document) (specs/1_prd.md)
- **Dependencies:** None

## **Block 6: Human-in-the-Loop & Interaction**

### **[9_ROADMAP-REQ-UI-013]** Ambiguous Brief  Research Agent triggers `AIC` (Agent-Initiated Clarification).
- **Type:** Functional
- **Description:** Ambiguous Brief  Research Agent triggers `AIC` (Agent-Initiated Clarification).
- **Source:** Project Roadmap (specs/9_project_roadmap.md)
- **Dependencies:** None

### **[1_PRD-REQ-HITL-005]** Task Failure Hand-off
- **Type:** Functional
- **Description:** If an agent hits the entropy limit, the system MUST hand off to the user for manual correction.
- **Source:** PRD (Product Requirements Document) (specs/1_prd.md)
- **Dependencies:** None

### **[9_ROADMAP-TAS-701]** Build CLI with Ink-based TUI (Progress bars, Real-time log streaming).
- **Type:** Technical
- **Description:** Build CLI with Ink-based TUI (Progress bars, Real-time log streaming).
- **Source:** Project Roadmap (specs/9_project_roadmap.md)
- **Dependencies:** None

### **[9_ROADMAP-TAS-704]** Build the Interactive Task DAG visualization (D3/React).
- **Type:** Technical
- **Description:** Build the Interactive Task DAG visualization (D3/React).
- **Source:** Project Roadmap (specs/9_project_roadmap.md)
- **Dependencies:** None

### **[TAS-019]** Deterministic Entropy Detection Algorithm
- **Type:** Technical
- **Description:** 4-step algorithm using SHA-256 hashes of errors to detect loops and trigger strategy pivots.
- **Source:** TAS (Technical Architecture Specification) (specs/2_tas.md)
- **Dependencies:** None

### **[9_ROADMAP-TAS-702]** Develop VSCode Extension (React/Tailwind) with Webview bridge.
- **Type:** Technical
- **Description:** Develop VSCode Extension (React/Tailwind) with Webview bridge.
- **Source:** Project Roadmap (specs/9_project_roadmap.md)
- **Dependencies:** None

### **[9_ROADMAP-TAS-705]** Implement "Directive Injection" (User Whispering) UI and MCP tool.
- **Type:** Technical
- **Description:** Implement "Directive Injection" (User Whispering) UI and MCP tool.
- **Source:** Project Roadmap (specs/9_project_roadmap.md)
- **Dependencies:** None

### **[9_ROADMAP-TAS-706]** Implement `devs rewind` command (Git HEAD + SQLite state restoration).
- **Type:** Technical
- **Description:** Implement `devs rewind` command (Git HEAD + SQLite state restoration).
- **Source:** Project Roadmap (specs/9_project_roadmap.md)
- **Dependencies:** None

### **[9_ROADMAP-TAS-703]** Implement the "Agent Console" with SAOP streaming (Thought/Action/Observation).
- **Type:** Technical
- **Description:** Implement the "Agent Console" with SAOP streaming (Thought/Action/Observation).
- **Source:** Project Roadmap (specs/9_project_roadmap.md)
- **Dependencies:** None

### **[1_PRD-REQ-HITL-002]** Architecture Suite Approval
- **Type:** UX
- **Description:** User must sign off on PRD and TAS before the Distiller runs.
- **Source:** PRD (Product Requirements Document) (specs/1_prd.md)
- **Dependencies:** None

### **[1_PRD-REQ-HITL-004]** Epic Start Review
- **Type:** UX
- **Description:** User can review the 25+ tasks for the upcoming Epic and add/remove tasks.
- **Source:** PRD (Product Requirements Document) (specs/1_prd.md)
- **Dependencies:** None

### **[TAS-020]** Escalation Pause
- **Type:** UX
- **Description:** System pauses for human intervention after 5 total task implementation failures.
- **Source:** TAS (Technical Architecture Specification) (specs/2_tas.md)
- **Dependencies:** [TAS-019]

### **[TAS-048]** Human-in-the-Loop (HITL)
- **Type:** UX
- **Description:** The system provides explicit "Gated Autonomy" checkpoints where users must approve architectural blueprints and roadmaps before implementation begins.
- **Source:** TAS (Technical Architecture Specification) (specs/2_tas.md)
- **Dependencies:** None

### **[1_PRD-REQ-HITL-001]** Phase 1 Completion Approval
- **Type:** UX
- **Description:** User must approve the Research Suite (Market, Comp, Tech, User).
- **Source:** PRD (Product Requirements Document) (specs/1_prd.md)
- **Dependencies:** None

### **[9_ROADMAP-PHASE-007]** Phase 7
- **Type:** UX
- **Description:** Phase 7: Multi-Modal Interface (CLI & VSCode Extension)
- **Source:** Project Roadmap (specs/9_project_roadmap.md)
- **Dependencies:** None

### **[1_PRD-REQ-HITL-003]** Roadmap & Epic Review Approval
- **Type:** UX
- **Description:** User must approve the sequence of 8-16 Epics.
- **Source:** PRD (Product Requirements Document) (specs/1_prd.md)
- **Dependencies:** None

### **[TAS-015]** User Approval Gate
- **Type:** UX
- **Description:** Explicit user sign-off required on generated blueprints before proceeding to distillation.
- **Source:** TAS (Technical Architecture Specification) (specs/2_tas.md)
- **Dependencies:** None

## **Block 7: UI/UX Design & Architecture**

### **[7_UI_UX_DESIGN-REQ-UI-DES-024]** ANSI Palette Calibration
- **Type:** Functional
- **Description:** The CLI and VSCode `LogTerminal` components MUST map the semantic palette to standard ANSI escape codes for consistent cross-platform rendering.
- **Source:** UI/UX Design (specs/7_ui_ux_design.md)
- **Dependencies:** None

### **[7_UI_UX_DESIGN-REQ-UI-DES-052-2]** Active Progress Sweep
- **Type:** Functional
- **Description:** During long-running tools (e.g., `npm install`, `vitest`), a 2px indeterminate progress bar MUST scan across the top of the card or terminal window using a 1500ms cycle.
- **Source:** UI/UX Design (specs/7_ui_ux_design.md)
- **Dependencies:** None

### **[7_UI_UX_DESIGN-REQ-UI-DES-090-2]** Activity Feed
- **Type:** Functional
- **Description:** A scrolling list of the last 10 successful task commits, including timestamps and contributor agent IDs.
- **Source:** UI/UX Design (specs/7_ui_ux_design.md)
- **Dependencies:** None

### **[7_UI_UX_DESIGN-REQ-UI-DES-110-3]** Agentic Links
- **Type:** Functional
- **Description:** Double-clicking a node in a Mermaid diagram (e.g., a DB table) MUST open the corresponding definition in the TAS source.
- **Source:** UI/UX Design (specs/7_ui_ux_design.md)
- **Dependencies:** None

### **[7_UI_UX_DESIGN-REQ-UI-DES-034-1]** Agentic Reasoning (Thoughts)
- **Type:** Functional
- **Description:** MUST be rendered in **Italic Serif**. This creates a "journalistic" or "internal monologue" feel, separating reasoning from code implementation.
- **Source:** UI/UX Design (specs/7_ui_ux_design.md)
- **Dependencies:** None

### **[7_UI_UX_DESIGN-REQ-UI-DES-054-3]** Agentic Response
- **Type:** Functional
- **Description:** The next "Thought" block MUST include a one-time visual highlight (light-blue border) to indicate that the user's directive has been ingested into the reasoning context.
- **Source:** UI/UX Design (specs/7_ui_ux_design.md)
- **Dependencies:** None

### **[7_UI_UX_DESIGN-REQ-UI-DES-006-2]** Anti-Magic Rule
- **Type:** Functional
- **Description:** No "fade-ins" or "sliding" for purely decorative reasons. Transitions must be fast (< 200ms) and use standard engineering easing (`cubic-bezier(0.4, 0, 0.2, 1)`).
- **Source:** UI/UX Design (specs/7_ui_ux_design.md)
- **Dependencies:** None

### **[7_UI_UX_DESIGN-REQ-UI-DES-027-3]** Architect
- **Type:** Functional
- **Description:** `--vscode-symbolIcon-classForeground` (Green/Teal).
- **Source:** UI/UX Design (specs/7_ui_ux_design.md)
- **Dependencies:** None

### **[7_UI_UX_DESIGN-REQ-UI-DES-140-1]** Aria-Live
- **Type:** Functional
- **Description:** New agent thoughts MUST be announced as "Polite" updates.
- **Source:** UI/UX Design (specs/7_ui_ux_design.md)
- **Dependencies:** None

### **[7_UI_UX_DESIGN-REQ-UI-DES-110-1]** Auto-Sync
- **Type:** Functional
- **Description:** Diagrams re-render within 200ms of a file save.
- **Source:** UI/UX Design (specs/7_ui_ux_design.md)
- **Dependencies:** None

### **[7_UI_UX_DESIGN-REQ-UI-DES-025-2]** Border Emphasis
- **Type:** Functional
- **Description:** All `1px` borders MUST increase to `2px` using `var(--vscode-contrastBorder)`.
- **Source:** UI/UX Design (specs/7_ui_ux_design.md)
- **Dependencies:** None

### **[7_UI_UX_DESIGN-REQ-UI-DES-047-1]** Border Radius
- **Type:** Functional
- **Description:** `4px` (Rigid, professional feel).
- **Source:** UI/UX Design (specs/7_ui_ux_design.md)
- **Dependencies:** None

### **[7_UI_UX_DESIGN-REQ-UI-DES-047-2]** Border Width
- **Type:** Functional
- **Description:** `1px` solid `var(--devs-border)`.
- **Source:** UI/UX Design (specs/7_ui_ux_design.md)
- **Dependencies:** None

### **[6_UI_UX_ARCH-REQ-058]** CONSOLE View
- **Type:** Functional
- **Description:** View for agent thought stream and implementation, accessible once Phase 4 is active.
- **Source:** UI/UX Architecture (specs/6_ui_ux_architecture.md)
- **Dependencies:** None

### **[7_UI_UX_DESIGN-REQ-UI-DES-093-1]** Clustering
- **Type:** Functional
- **Description:** Tasks are visually grouped into Epic bounding boxes (light grey background).
- **Source:** UI/UX Design (specs/7_ui_ux_design.md)
- **Dependencies:** None

### **[7_UI_UX_DESIGN-REQ-UI-DES-005-2]** Codicon Utilization
- **Type:** Functional
- **Description:** Exclusive use of the `@vscode/codicons` library for iconography to maintain semantic consistency with the host editor.
- **Source:** UI/UX Design (specs/7_ui_ux_design.md)
- **Dependencies:** None

### **[7_UI_UX_DESIGN-REQ-UI-DES-052-3]** Completion "Pop"
- **Type:** Functional
- **Description:** Successful tool completion triggers a subtle `scale(1.02)` pop followed by a `var(--devs-success)` border-flash (500ms decay).
- **Source:** UI/UX Design (specs/7_ui_ux_design.md)
- **Dependencies:** None

### **[7_UI_UX_DESIGN-REQ-UI-DES-121]** Connection Lost
- **Type:** Functional
- **Description:** A full-page blurred overlay with a "Reconnecting to Orchestrator..." spinner.
- **Source:** UI/UX Design (specs/7_ui_ux_design.md)
- **Dependencies:** None

### **[7_UI_UX_DESIGN-REQ-UI-DES-053-3]** Constraint
- **Type:** Functional
- **Description:** These pulses MUST terminate as soon as the user interacts with the target element or the keyboard focus (`tab`) reaches it.
- **Source:** UI/UX Design (specs/7_ui_ux_design.md)
- **Dependencies:** None

### **[6_UI_UX_ARCH-REQ-031]** Context Awareness
- **Type:** Functional
- **Description:** DirectiveWhisperer supports auto-complete for @file paths and #requirement IDs.
- **Source:** UI/UX Architecture (specs/6_ui_ux_architecture.md)
- **Dependencies:** [6_UI_UX_ARCH-REQ-030]

### **[6_UI_UX_ARCH-REQ-090]** Contextual Snippets
- **Type:** Functional
- **Description:** Support for @file mentions in directives to automatically inject file contents.
- **Source:** UI/UX Architecture (specs/6_ui_ux_architecture.md)
- **Dependencies:** [6_UI_UX_ARCH-REQ-089]

### **[7_UI_UX_DESIGN-REQ-UI-DES-093-2]** Critical Path Highlighting
- **Type:** Functional
- **Description:** A toggle to highlight the longest sequence of dependent tasks that define the project duration.
- **Source:** UI/UX Design (specs/7_ui_ux_design.md)
- **Dependencies:** None

### **[6_UI_UX_ARCH-REQ-020]** DAGCanvas (Interactive Roadmap)
- **Type:** Functional
- **Description:** Component that visualizes the 200+ task Directed Acyclic Graph (DAG) generated by the Distiller.
- **Source:** UI/UX Architecture (specs/6_ui_ux_architecture.md)
- **Dependencies:** None

### **[6_UI_UX_ARCH-REQ-054]** DASHBOARD View
- **Type:** Functional
- **Description:** Always available project overview view.
- **Source:** UI/UX Architecture (specs/6_ui_ux_architecture.md)
- **Dependencies:** None

### **[7_UI_UX_DESIGN-REQ-UI-DES-091-3]** Decision Matrix
- **Type:** Functional
- **Description:** A side-by-side comparison table of tech stacks (e.g., React vs. Angular) with weighted pros/cons.
- **Source:** UI/UX Design (specs/7_ui_ux_design.md)
- **Dependencies:** None

### **[7_UI_UX_DESIGN-REQ-UI-DES-055-3]** Dependency Flow Highlighting
- **Type:** Functional
- **Description:** When a node is selected, its upstream dependencies (inputs) and downstream dependents (outputs) MUST be highlighted. The connecting lines (edges) MUST transform from grey to `var(--devs-primary)` with an animated dash-offset effect simulating "Data Flow" toward the selected node.
- **Source:** UI/UX Design (specs/7_ui_ux_design.md)
- **Dependencies:** None

### **[7_UI_UX_DESIGN-REQ-UI-DES-027-1]** Developer
- **Type:** Functional
- **Description:** `--vscode-symbolIcon-functionForeground` (Blue/Cyan).
- **Source:** UI/UX Design (specs/7_ui_ux_design.md)
- **Dependencies:** None

### **[6_UI_UX_ARCH-REQ-030]** DirectiveWhisperer (HITL Input)
- **Type:** Functional
- **Description:** The primary channel for "User Whispering" (mid-task directives).
- **Source:** UI/UX Architecture (specs/6_ui_ux_architecture.md)
- **Dependencies:** None

### **[7_UI_UX_DESIGN-REQ-UI-DES-085-3]** Disable sweep
- **Type:** Functional
- **Description:** Disable the "Distillation Sweep" particle effects in Phase 3.
- **Source:** UI/UX Design (specs/7_ui_ux_design.md)
- **Dependencies:** None

### **[7_UI_UX_DESIGN-REQ-UI-DES-092-1]** Dual Pane
- **Type:** Functional
- **Description:** Markdown source on the left, live-rendered Mermaid.js diagrams on the right.
- **Source:** UI/UX Design (specs/7_ui_ux_design.md)
- **Dependencies:** None

### **[7_UI_UX_DESIGN-REQ-UI-DES-046-3]** Edge Weight
- **Type:** Functional
- **Description:** `1px` stroke (normal) / `2.5px` stroke (dependency highlighted).
- **Source:** UI/UX Design (specs/7_ui_ux_design.md)
- **Dependencies:** None

### **[7_UI_UX_DESIGN-REQ-UI-DES-024-2]** Error (Red)
- **Type:** Functional
- **Description:** ANSI 1 (Red) / ANSI 9 (Light Red).
- **Source:** UI/UX Design (specs/7_ui_ux_design.md)
- **Dependencies:** None

### **[7_UI_UX_DESIGN-REQ-UI-DES-052-4]** Failure Shake
- **Type:** Functional
- **Description:** Tool failure triggers a horizontal shake (`±4px` at 400ms) and an immediate shift to a solid `var(--devs-error)` background for the card header.
- **Source:** UI/UX Design (specs/7_ui_ux_design.md)
- **Dependencies:** None

### **[7_UI_UX_DESIGN-REQ-UI-DES-038-1]** Fallback Chain
- **Type:** Functional
- **Description:** For Non-Latin scripts (Chinese, Japanese, Korean), the system MUST fallback to the host OS defaults (e.g., `PingFang SC` for macOS, `Meiryo` for Windows) to prevent "tofu" or broken character rendering in research reports.
- **Source:** UI/UX Design (specs/7_ui_ux_design.md)
- **Dependencies:** None

### **[7_UI_UX_DESIGN-REQ-UI-DES-058-2]** Feedback
- **Type:** Functional
- **Description:** A "State Restored" toast with the new Task ID MUST slide in from the bottom-center.
- **Source:** UI/UX Design (specs/7_ui_ux_design.md)
- **Dependencies:** None

### **[7_UI_UX_DESIGN-REQ-UI-DES-111-1]** Flamegraphs
- **Type:** Functional
- **Description:** Visual representation of CPU execution time captured via the `ProjectServer` profiling tool.
- **Source:** UI/UX Design (specs/7_ui_ux_design.md)
- **Dependencies:** None

### **[7_UI_UX_DESIGN-REQ-UI-DES-084-2]** Focus Ring Persistence
- **Type:** Functional
- **Description:** The standard VSCode focus ring (`2px solid var(--vscode-focusBorder)`) MUST be visible on all keyboard-navigable elements. In HC mode, the border MUST be `offset` by 2px to ensure it is not masked by the component boundary.
- **Source:** UI/UX Design (specs/7_ui_ux_design.md)
- **Dependencies:** None

### **[7_UI_UX_DESIGN-REQ-UI-DES-037-1]** Font Weight Alignment
- **Type:** Functional
- **Description:** Code blocks in logs SHOULD use a slightly heavier weight (`450` or `500`) than the standard editor to ensure legibility during real-time streaming against the dark terminal background.
- **Source:** UI/UX Design (specs/7_ui_ux_design.md)
- **Dependencies:** None

### **[7_UI_UX_DESIGN-REQ-UI-DES-100-3]** Ghost Text
- **Type:** Functional
- **Description:** "Whisper a directive to the agent (e.g., 'Use fetch instead of axios')..."
- **Source:** UI/UX Design (specs/7_ui_ux_design.md)
- **Dependencies:** None

### **[7_UI_UX_DESIGN-REQ-UI-DES-066-1]** Global Actions
- **Type:** Functional
- **Description:** `P` (Pause/Resume), `R` (Rewind Menu), `H` (Help/Keymap).
- **Source:** UI/UX Design (specs/7_ui_ux_design.md)
- **Dependencies:** None

### **[6_UI_UX_ARCH-REQ-089]** Global Directive Input
- **Type:** Functional
- **Description:** Persistent text field for "User Whispering" in the sidebar or console footer.
- **Source:** UI/UX Architecture (specs/6_ui_ux_architecture.md)
- **Dependencies:** [6_UI_UX_ARCH-REQ-030]

### **[6_UI_UX_ARCH-REQ-063]** Hard Redirects (Gated Autonomy)
- **Type:** Functional
- **Description:** UI MUST automatically navigate the user to relevant views (e.g., SPEC_VIEW) when the orchestrator is WAITING_FOR_APPROVAL.
- **Source:** UI/UX Architecture (specs/6_ui_ux_architecture.md)
- **Dependencies:** None

### **[7_UI_UX_DESIGN-REQ-UI-DES-090-3]** Health Telemetry
- **Type:** Functional
- **Description:** Real-time gauges for Token Spend (USD), Code Coverage (%), and Test Pass Rate (%).
- **Source:** UI/UX Design (specs/7_ui_ux_design.md)
- **Dependencies:** None

### **[7_UI_UX_DESIGN-REQ-UI-DES-111-2]** Heap Snapshots
- **Type:** Functional
- **Description:** A treemap visualization of memory allocation, highlighting modules exceeding the TAS memory quota.
- **Source:** UI/UX Design (specs/7_ui_ux_design.md)
- **Dependencies:** None

### **[7_UI_UX_DESIGN-REQ-UI-DES-055-1]** Hover Elevation
- **Type:** Functional
- **Description:** Hovering a task node triggers a `scale(1.05)` transform and an increased shadow depth (`shadow-md`) to separate it from the graph background.
- **Source:** UI/UX Design (specs/7_ui_ux_design.md)
- **Dependencies:** None

### **[6_UI_UX_ARCH-REQ-062]** Incremental View Unlocking
- **Type:** Functional
- **Description:** Navigation is strictly constrained by the current project phase; views unlock as the project progresses through phases.
- **Source:** UI/UX Architecture (specs/6_ui_ux_architecture.md)
- **Dependencies:** None

### **[7_UI_UX_DESIGN-REQ-UI-DES-085-4]** Instant-jump transitions
- **Type:** Functional
- **Description:** Instant-jump all tab transitions (0ms duration).
- **Source:** UI/UX Design (specs/7_ui_ux_design.md)
- **Dependencies:** None

### **[7_UI_UX_DESIGN-REQ-UI-DES-031]** Interface Hierarchy (Tiered Fonts)
- **Type:** Functional
- **Description:** 'devs' utilizes a tri-modal font system to categorize content by origin and intent.
- **Source:** UI/UX Design (specs/7_ui_ux_design.md)
- **Dependencies:** None

### **[7_UI_UX_DESIGN-REQ-UI-DES-130-2]** Introspection Highlights
- **Type:** Functional
- **Description:** Specific lines of code that serve as "Agentic Hooks" SHOULD be highlighted with a distinctive left-gutter icon (e.g., a "Glass Box" glyph).
- **Source:** UI/UX Design (specs/7_ui_ux_design.md)
- **Dependencies:** None

### **[7_UI_UX_DESIGN-REQ-UI-DES-052-1]** Invocation Shimmer
- **Type:** Functional
- **Description:** When a tool is called, the corresponding "Action Card" in the log MUST exhibit a one-time horizontal shimmer effect (linear-gradient sweep) to signify the handoff from reasoning to execution.
- **Source:** UI/UX Design (specs/7_ui_ux_design.md)
- **Dependencies:** None

### **[7_UI_UX_DESIGN-REQ-UI-DES-083-1-3]** LOD-1 (Far)
- **Type:** Functional
- **Description:** Individual tasks are hidden; only Epic bounding boxes with progress percentages are rendered.
- **Source:** UI/UX Design (specs/7_ui_ux_design.md)
- **Dependencies:** None

### **[7_UI_UX_DESIGN-REQ-UI-DES-002-1]** Level 1: Human Authority (Directives)
- **Type:** Functional
- **Description:** The highest priority. Rendered using high-contrast borders (e.g., `var(--vscode-focusBorder)`) and bold weights. These are the "Command overrides."
- **Source:** UI/UX Design (specs/7_ui_ux_design.md)
- **Dependencies:** None

### **[7_UI_UX_DESIGN-REQ-UI-DES-002-2]** Level 2: Agent Autonomy (Reasoning/Logic)
- **Type:** Functional
- **Description:** Middle priority. Rendered using a distinct narrative font (Serif) and alpha-blended backgrounds (`--devs-bg-thought`). This represents the agent's "Internal State."
- **Source:** UI/UX Design (specs/7_ui_ux_design.md)
- **Dependencies:** None

### **[7_UI_UX_DESIGN-REQ-UI-DES-002-3]** Level 3: Environmental Fact (Files/Logs/Tests)
- **Type:** Functional
- **Description:** The base priority. Rendered in raw, monospaced blocks. This represents the "External Reality" the agent is acting upon.
- **Source:** UI/UX Design (specs/7_ui_ux_design.md)
- **Dependencies:** None

### **[7_UI_UX_DESIGN-REQ-UI-DES-051-3]** Logic
- **Type:** Functional
- **Description:** Triggered by the `AGENT_THOUGHT_STREAM` event; terminated immediately upon the `TOOL_LIFECYCLE:INVOKED` event.
- **Source:** UI/UX Design (specs/7_ui_ux_design.md)
- **Dependencies:** None

### **[6_UI_UX_ARCH-REQ-026]** MermaidHost (Diagram Orchestrator)
- **Type:** Functional
- **Description:** A centralized, safe environment for rendering Mermaid.js diagrams.
- **Source:** UI/UX Architecture (specs/6_ui_ux_architecture.md)
- **Dependencies:** None

### **[7_UI_UX_DESIGN-REQ-UI-DES-024-5]** Metadata (Grey)
- **Type:** Functional
- **Description:** ANSI 8 (Bright Black).
- **Source:** UI/UX Design (specs/7_ui_ux_design.md)
- **Dependencies:** None

### **[7_UI_UX_DESIGN-REQ-UI-DES-048-1]** Min Target
- **Type:** Functional
- **Description:** `24px` x `24px` (Optimized for mouse/trackpad precision in VSCode).
- **Source:** UI/UX Design (specs/7_ui_ux_design.md)
- **Dependencies:** None

### **[7_UI_UX_DESIGN-REQ-UI-DES-035-1]** Narrative Blocks (Thoughts)
- **Type:** Functional
- **Description:** `line-height: 1.6`. High vertical rhythm to facilitate scanning long chains of thought.
- **Source:** UI/UX Design (specs/7_ui_ux_design.md)
- **Dependencies:** None

### **[7_UI_UX_DESIGN-REQ-UI-DES-003-2]** No-Drawer Policy
- **Type:** Functional
- **Description:** Core architectural state (TAS/PRD status) must never be hidden behind drawers or modals unless it's for secondary editing.
- **Source:** UI/UX Design (specs/7_ui_ux_design.md)
- **Dependencies:** None

### **[7_UI_UX_DESIGN-REQ-UI-DES-046-1]** Node Dimensions
- **Type:** Functional
- **Description:** Width `180px`, Height `64px` (fixed).
- **Source:** UI/UX Design (specs/7_ui_ux_design.md)
- **Dependencies:** None

### **[7_UI_UX_DESIGN-REQ-UI-DES-054-2]** Persistence
- **Type:** Functional
- **Description:** Visible for 3000ms, then fades out via `opacity: 0` over 500ms.
- **Source:** UI/UX Design (specs/7_ui_ux_design.md)
- **Dependencies:** None

### **[7_UI_UX_DESIGN-REQ-UI-DES-066-2]** Phase Gates
- **Type:** Functional
- **Description:** `Enter` (Approve/Proceed), `ESC` (Reject/Back).
- **Source:** UI/UX Design (specs/7_ui_ux_design.md)
- **Dependencies:** None

### **[6_UI_UX_ARCH-REQ-032]** Priority Toggle
- **Type:** Functional
- **Description:** Ability to flag a directive as "Immediate Pivot" in DirectiveWhisperer.
- **Source:** UI/UX Architecture (specs/6_ui_ux_architecture.md)
- **Dependencies:** [6_UI_UX_ARCH-REQ-030]

### **[7_UI_UX_DESIGN-REQ-UI-DES-100-4]** Priority Toggle
- **Type:** Functional
- **Description:** A checkbox for "Immediate Pivot" that forces the current agent turn to interrupt and reflect on the directive.
- **Source:** UI/UX Design (specs/7_ui_ux_design.md)
- **Dependencies:** None

### **[7_UI_UX_DESIGN-REQ-UI-DES-120-2]** RCA Report
- **Type:** Functional
- **Description:** A modal overlay presenting the agent's Root Cause Analysis, contrasting the failing strategy with a proposed pivot.
- **Source:** UI/UX Design (specs/7_ui_ux_design.md)
- **Dependencies:** None

### **[6_UI_UX_ARCH-REQ-055]** RESEARCH_VIEW
- **Type:** Functional
- **Description:** View for research reports, accessible once Phase 1 is active or completed.
- **Source:** UI/UX Architecture (specs/6_ui_ux_architecture.md)
- **Dependencies:** None

### **[6_UI_UX_ARCH-REQ-057]** ROADMAP View
- **Type:** Functional
- **Description:** View for task DAG visualization, accessible once Phase 3 is completed.
- **Source:** UI/UX Architecture (specs/6_ui_ux_architecture.md)
- **Dependencies:** None

### **[7_UI_UX_DESIGN-REQ-UI-DES-085-2]** Replace pulse
- **Type:** Functional
- **Description:** Replace the "Thinking Pulse" with a static "Active" icon.
- **Source:** UI/UX Design (specs/7_ui_ux_design.md)
- **Dependencies:** None

### **[6_UI_UX_ARCH-REQ-088]** Roadmap DAG Editor
- **Type:** Functional
- **Description:** Interactive canvas for reordering, deleting, merging, or editing tasks in the Roadmap.
- **Source:** UI/UX Architecture (specs/6_ui_ux_architecture.md)
- **Dependencies:** [6_UI_UX_ARCH-REQ-057]

### **[6_UI_UX_ARCH-REQ-059]** SETTINGS View
- **Type:** Functional
- **Description:** Always available settings view.
- **Source:** UI/UX Architecture (specs/6_ui_ux_architecture.md)
- **Dependencies:** None

### **[6_UI_UX_ARCH-REQ-056]** SPEC_VIEW
- **Type:** Functional
- **Description:** View for PRD/TAS preview and requirement approval, accessible once Phase 2 is active or completed.
- **Source:** UI/UX Architecture (specs/6_ui_ux_architecture.md)
- **Dependencies:** None

### **[7_UI_UX_DESIGN-REQ-UI-DES-064]** Semantic Prefixes & Unicode Fallbacks
- **Type:** Functional
- **Description:** To ensure cross-platform compatibility, iconography uses a tiered fallback system.
- **Source:** UI/UX Design (specs/7_ui_ux_design.md)
- **Dependencies:** None

### **[7_UI_UX_DESIGN-REQ-UI-DES-056-2]** Semantic Zooming
- **Type:** Functional
- **Description:** At zoom levels < 0.4, detailed task titles are hidden in favor of `REQ-ID` badges. At zoom levels < 0.1, individual tasks are hidden, and only Epic bounding boxes with progress radials are rendered.
- **Source:** UI/UX Design (specs/7_ui_ux_design.md)
- **Dependencies:** None

### **[7_UI_UX_DESIGN-REQ-UI-DES-091-2]** Source Tooltips
- **Type:** Functional
- **Description:** Every factual claim in the reports MUST have a hoverable citation that shows the source URL and a "Reliability Score" (0.0 - 1.0).
- **Source:** UI/UX Design (specs/7_ui_ux_design.md)
- **Dependencies:** None

### **[6_UI_UX_ARCH-REQ-087]** Spec Sign-off Component
- **Type:** Functional
- **Description:** Specialized view for Phase 2 that renders PRD and TAS with "Accept/Reject" buttons for requirement blocks.
- **Source:** UI/UX Architecture (specs/6_ui_ux_architecture.md)
- **Dependencies:** [6_UI_UX_ARCH-REQ-056]

### **[7_UI_UX_DESIGN-REQ-UI-DES-048-2]** Standard Button
- **Type:** Functional
- **Description:** Height `28px`, Horizontal Padding `12px`.
- **Source:** UI/UX Design (specs/7_ui_ux_design.md)
- **Dependencies:** None

### **[7_UI_UX_DESIGN-REQ-UI-DES-033]** Standardized Type Scale
- **Type:** Functional
- **Description:** To maintain high information density, 'devs' uses a compact, non-linear scale.
- **Source:** UI/UX Design (specs/7_ui_ux_design.md)
- **Dependencies:** None

### **[7_UI_UX_DESIGN-REQ-UI-DES-068-1]** State Optimization
- **Type:** Functional
- **Description:** High-frequency streaming (Thoughts) MUST utilize `React.memo` and partial updates. Only the `LogTerminal` component should re-render on character-level data arrivals.
- **Source:** UI/UX Design (specs/7_ui_ux_design.md)
- **Dependencies:** None

### **[7_UI_UX_DESIGN-REQ-UI-DES-065-1]** Structured Blocks
- **Type:** Functional
- **Description:** Tool calls and Reasoning turns MUST be wrapped in Unicode box-drawing characters (`┌`, `─`, `┐`, `│`, `└`, `─`, `┘`).
- **Source:** UI/UX Design (specs/7_ui_ux_design.md)
- **Dependencies:** None

### **[7_UI_UX_DESIGN-REQ-UI-DES-024-1]** Success (Green)
- **Type:** Functional
- **Description:** ANSI 2 (Green) / ANSI 10 (Light Green).
- **Source:** UI/UX Design (specs/7_ui_ux_design.md)
- **Dependencies:** None

### **[7_UI_UX_DESIGN-REQ-UI-DES-091-1]** Tabs
- **Type:** Functional
- **Description:** Market Research, Competitive Analysis, Technology Landscape, User Research.
- **Source:** UI/UX Design (specs/7_ui_ux_design.md)
- **Dependencies:** None

### **[7_UI_UX_DESIGN-REQ-UI-DES-140-2]** Task Success
- **Type:** Functional
- **Description:** "Task [ID] Completed Successfully" MUST be announced as an "Assertive" update.
- **Source:** UI/UX Design (specs/7_ui_ux_design.md)
- **Dependencies:** None

### **[7_UI_UX_DESIGN-REQ-UI-DES-066-4]** Task Switching
- **Type:** Functional
- **Description:** `Up/Down` arrows to navigate the Epic Roadmap; `TAB` to switch focus between Roadmap and Console.
- **Source:** UI/UX Design (specs/7_ui_ux_design.md)
- **Dependencies:** None

### **[7_UI_UX_DESIGN-REQ-UI-DES-035-2]** Technical Blocks (Logs)
- **Type:** Functional
- **Description:** `line-height: 1.4`. Optimized for density while maintaining line-to-line separation.
- **Source:** UI/UX Design (specs/7_ui_ux_design.md)
- **Dependencies:** None

### **[6_UI_UX_ARCH-REQ-085]** Temporal Navigation
- **Type:** Functional
- **Description:** Vertical timeline allowing users to jump back to previous turns within the current task.
- **Source:** UI/UX Architecture (specs/6_ui_ux_architecture.md)
- **Dependencies:** None

### **[7_UI_UX_DESIGN-REQ-UI-DES-086-2]** The "Disconnected" Mask
- **Type:** Functional
- **Description:** If the MCP connection drops, a semi-transparent blur overlay (CSS `backdrop-filter: blur(4px)`) MUST cover the interactive zones with a high-priority "Reconnecting..." toast.
- **Source:** UI/UX Design (specs/7_ui_ux_design.md)
- **Dependencies:** None

### **[7_UI_UX_DESIGN-REQ-UI-DES-066-3]** The Whisperer
- **Type:** Functional
- **Description:** `/` (slash) or `W` focuses the Directive input field.
- **Source:** UI/UX Design (specs/7_ui_ux_design.md)
- **Dependencies:** None

### **[7_UI_UX_DESIGN-REQ-UI-DES-024-3]** Thinking (Magenta)
- **Type:** Functional
- **Description:** ANSI 5 (Magenta) / ANSI 13 (Light Magenta).
- **Source:** UI/UX Design (specs/7_ui_ux_design.md)
- **Dependencies:** None

### **[7_UI_UX_DESIGN-REQ-UI-DES-094-1]** Thought Stream (Center)
- **Type:** Functional
- **Description:** The serif-based, narrative reasoning of the agent. New thoughts slide in from the bottom.
- **Source:** UI/UX Design (specs/7_ui_ux_design.md)
- **Dependencies:** None

### **[6_UI_UX_ARCH-REQ-015]** ThoughtStreamer (The Glass-Box Heart)
- **Type:** Functional
- **Description:** Component that renders the agent's internal reasoning (SAOP reasoning_chain) in real-time.
- **Source:** UI/UX Architecture (specs/6_ui_ux_architecture.md)
- **Dependencies:** None

### **[7_UI_UX_DESIGN-REQ-UI-DES-051-2]** Timing
- **Type:** Functional
- **Description:** 2000ms duration, infinite loop, using a sinusoidal ease-in-out.
- **Source:** UI/UX Design (specs/7_ui_ux_design.md)
- **Dependencies:** None

### **[7_UI_UX_DESIGN-REQ-UI-DES-123]** Token Budget Overrun
- **Type:** Functional
- **Description:** A yellow overlay masking the "Run" button when the project exceeds 80% of its allocated USD budget.
- **Source:** UI/UX Design (specs/7_ui_ux_design.md)
- **Dependencies:** None

### **[7_UI_UX_DESIGN-REQ-UI-DES-034-3]** Tool Invocations (Actions)
- **Type:** Functional
- **Description:** MUST use **Monospace Bold** for tool names (e.g., `READ_FILE`) to signify deterministic, system-level execution.
- **Source:** UI/UX Design (specs/7_ui_ux_design.md)
- **Dependencies:** None

### **[7_UI_UX_DESIGN-REQ-UI-DES-100-1]** Trigger
- **Type:** Functional
- **Description:** `Cmd+K` (macOS) or `Ctrl+K` (Windows).
- **Source:** UI/UX Design (specs/7_ui_ux_design.md)
- **Dependencies:** None

### **[7_UI_UX_DESIGN-REQ-UI-DES-051-1]** Visual
- **Type:** Functional
- **Description:** A subtle opacity pulse (0.6 to 1.0) applied to the `active_task_node` in the DAG and the header of the `ThoughtStreamer`.
- **Source:** UI/UX Design (specs/7_ui_ux_design.md)
- **Dependencies:** None

### **[7_UI_UX_DESIGN-REQ-UI-DES-053-1]** Visual
- **Type:** Functional
- **Description:** The primary approval button or "Directives" field MUST exhibit a glowing box-shadow pulse (`0 0 8px var(--devs-primary)`).
- **Source:** UI/UX Design (specs/7_ui_ux_design.md)
- **Dependencies:** None

### **[7_UI_UX_DESIGN-REQ-UI-DES-120-1]** Visual Feedback
- **Type:** Functional
- **Description:** When entropy is detected (>3 repeating hashes), the active Thought Block header should pulse red and exhibit a subtle "shake" effect.
- **Source:** UI/UX Design (specs/7_ui_ux_design.md)
- **Dependencies:** None

### **[7_UI_UX_DESIGN-REQ-UI-DES-024-4]** Warning (Yellow)
- **Type:** Functional
- **Description:** ANSI 3 (Yellow) / ANSI 11 (Light Yellow).
- **Source:** UI/UX Design (specs/7_ui_ux_design.md)
- **Dependencies:** None

### **[7_UI_UX_DESIGN-REQ-UI-DES-047-3-2]** shadow-md
- **Type:** Functional
- **Description:** `0 8px 24px rgba(0,0,0,0.30)`
- **Source:** UI/UX Design (specs/7_ui_ux_design.md)
- **Dependencies:** None

### **[7_UI_UX_DESIGN-REQ-UI-RISK-001]** Risk
- **Type:** Non-Functional
- **Description:** Information density may lead to "Dashboard Fatigue" for non-architect users. *Mitigation*: Implementation of "LOD" (Level of Detail) toggles to collapse technical telemetry.
- **Source:** UI/UX Design (specs/7_ui_ux_design.md)
- **Dependencies:** None

### **[7_UI_UX_DESIGN-REQ-UI-RISK-002]** Risk
- **Type:** Non-Functional
- **Description:** Theme resilience across 1,000+ community VSCode themes. *Mitigation*: Strict reliance on standard VSCode semantic tokens rather than custom hex codes.
- **Source:** UI/UX Design (specs/7_ui_ux_design.md)
- **Dependencies:** None

### **[7_UI_UX_DESIGN-REQ-UI-RISK-003]** Risk
- **Type:** Non-Functional
- **Description:** Serif fonts on low-DPI displays can sometimes exhibit poor legibility. *Mitigation*: Implementation of a "Monospace Only" mode for accessibility if subpixel rendering fails.
- **Source:** UI/UX Design (specs/7_ui_ux_design.md)
- **Dependencies:** None

### **[7_UI_UX_DESIGN-REQ-UI-RISK-004]** Risk
- **Type:** Non-Functional
- **Description:** High-frequency updates from Gemini 3 Flash could lead to "Stuttering" if animations are too complex. *Mitigation*: Implementation of a global "Animation Throttler" that drops frames if the CPU usage exceeds 30%.
- **Source:** UI/UX Design (specs/7_ui_ux_design.md)
- **Dependencies:** None

### **[7_UI_UX_DESIGN-REQ-UI-RISK-005]** Risk
- **Type:** Non-Functional
- **Description:** Terminal resizing during a long-running task can cause `Ink` to crash or corrupt the buffer. *Mitigation*: Implementation of a `ResizeObserver` that forces a full layout re-calculation and terminal clear.
- **Source:** UI/UX Design (specs/7_ui_ux_design.md)
- **Dependencies:** None

### **[7_UI_UX_DESIGN-REQ-UI-RISK-006]** Risk
- **Type:** Non-Functional
- **Description:** Sudden layout shifts during streaming logs can disorient the user. *Mitigation*: Implementation of a "Scroll Lock" that prevents the view from jumping when new content is appended unless the user is already at the bottom of the buffer.
- **Source:** UI/UX Design (specs/7_ui_ux_design.md)
- **Dependencies:** None

### **[7_UI_UX_DESIGN-REQ-UI-DES-033-1]** **[7_UI_UX_DESIGN-REQ-UI-DES-033-2]** **[7_UI_UX_DESIGN-REQ-UI-DES-033-3]** **[7_UI_UX_DESIGN-REQ-UI-DES-033-4]** **[7_UI_UX_DESIGN-REQ-UI-DES-033-5]** ** |
- **Type:** Security
- **Description:** - **[7_UI_UX_DESIGN-REQ-UI-DES-034-1] Agentic Reasoning (Thoughts)**: MUST be rendered in **Italic Serif**. This creates a "journalistic" or "internal monologue" feel, separating reasoning from code implementation.
- **Source:** UI/UX Design (specs/7_ui_ux_design.md)
- **Dependencies:** None

### **[7_UI_UX_DESIGN-REQ-UI-DES-011]** **[7_UI_UX_DESIGN-REQ-UI-DES-012]** ** |
- **Type:** Security
- **Description:** Backgrounds for agentic content utilize the CSS `color-mix()` function to create a "Glass-Box" effect that adapts to the user's background while maintaining semantic intent.
- **Source:** UI/UX Design (specs/7_ui_ux_design.md)
- **Dependencies:** None

### **[6_UI_UX_ARCH-REQ-012]** Content Security Policy (CSP)
- **Type:** Security
- **Description:** The VSCode Webview MUST implement a strict CSP, and all project assets and documentation MUST be served via the vscode-resource URI scheme.
- **Source:** UI/UX Architecture (specs/6_ui_ux_architecture.md)
- **Dependencies:** None

### **[6_UI_UX_ARCH-REQ-079]** Image Redaction
- **Type:** Security
- **Description:** Scraped images MUST be proxied through a local "Sanitation Buffer" to ensure CSP compliance and prevent IP leaks.
- **Source:** UI/UX Architecture (specs/6_ui_ux_architecture.md)
- **Dependencies:** [6_UI_UX_ARCH-REQ-012]

### **[7_UI_UX_DESIGN-REQ-UI-DES-049-Z4]** Level 4 (Critical)
- **Type:** Security
- **Description:** Sandbox Breach Alerts, System Crashes. `z-index: 400`.
- **Source:** UI/UX Design (specs/7_ui_ux_design.md)
- **Dependencies:** None

### **[6_UI_UX_ARCH-REQ-074]** Local Resource Loading (URI Scheme)
- **Type:** Security
- **Description:** All assets MUST be loaded using webview.asWebviewUri() and resolved to vscode-resource:// URIs.
- **Source:** UI/UX Architecture (specs/6_ui_ux_architecture.md)
- **Dependencies:** [6_UI_UX_ARCH-REQ-012]

### **[6_UI_UX_ARCH-REQ-027]** Sandbox
- **Type:** Security
- **Description:** Mermaid MUST be rendered within an internal iframe or strictly controlled div to prevent CSS leakage.
- **Source:** UI/UX Architecture (specs/6_ui_ux_architecture.md)
- **Dependencies:** [6_UI_UX_ARCH-REQ-026]

### **[7_UI_UX_DESIGN-REQ-UI-DES-122]** Sandbox Breach Alert
- **Type:** Security
- **Description:** A high-priority red banner across the entire UI if a container attempt to escape its network/filesystem boundary is detected.
- **Source:** UI/UX Design (specs/7_ui_ux_design.md)
- **Dependencies:** None

### **[7_UI_UX_DESIGN-REQ-UI-DES-069]** Secret Redaction (TUI Integration)
- **Type:** Security
- **Description:** The `SecretMasker` MUST be applied to the TUI stream before the data reaches the `Ink` renderer. Redacted strings are highlighted in `inverse` or `bgRed` to ensure they are visually distinct to the user.
- **Source:** UI/UX Design (specs/7_ui_ux_design.md)
- **Dependencies:** None

### **[7_UI_UX_DESIGN-REQ-UI-DES-028]** The "Red-Screen" Security Alert
- **Type:** Security
- **Description:** In the event of a `SANDBOX_BREACH_ALERT`, the UI MUST override the active theme with a high-intensity red overlay (`#FF0000` at 15% opacity) and set all borders to `3px solid var(--devs-error)`, forcing an immediate shift in the user's focus.
- **Source:** UI/UX Design (specs/7_ui_ux_design.md)
- **Dependencies:** None

### **[7_UI_UX_DESIGN-REQ-UI-DES-045-1]** **[7_UI_UX_DESIGN-REQ-UI-DES-045-2]** **[7_UI_UX_DESIGN-REQ-UI-DES-045-3]** **[7_UI_UX_DESIGN-REQ-UI-DES-045-4]** **[7_UI_UX_DESIGN-REQ-UI-DES-046]** ** |
- **Type:** Technical
- **Description:** The Task DAG is the most performance-sensitive component.
- **Source:** UI/UX Design (specs/7_ui_ux_design.md)
- **Dependencies:** None

### **[7_UI_UX_DESIGN-REQ-UI-DES-013]** ** |
- **Type:** Technical
- **Description:** Backgrounds for agentic content utilize the CSS `color-mix()` function to create a "Glass-Box" effect that adapts to the user's background while maintaining semantic intent.
- **Source:** UI/UX Design (specs/7_ui_ux_design.md)
- **Dependencies:** None

### **[6_UI_UX_ARCH-REQ-039]** 3D Visualization / Profiler Trace Handling
- **Type:** Technical
- **Description:** 3D visualizations or complex profiler traces are currently out of scope; use static SVG snapshots within the Webview.
- **Source:** UI/UX Architecture (specs/6_ui_ux_architecture.md)
- **Dependencies:** None

### **[6_UI_UX_ARCH-REQ-104]** ActionCard Primitive
- **Type:** Technical
- **Description:** Custom primitive (React/Ink) that displays a single SAOP tool call and its arguments.
- **Source:** UI/UX Architecture (specs/6_ui_ux_architecture.md)
- **Dependencies:** None

### **[7_UI_UX_DESIGN-REQ-UI-DES-059]** Animation Guardrails
- **Type:** Technical
- **Description:** - **[7_UI_UX_DESIGN-REQ-UI-DES-059-1] FPS Target**: All animations MUST maintain 60FPS on a standard developer machine (e.g., MacBook M1).
- **Source:** UI/UX Design (specs/7_ui_ux_design.md)
- **Dependencies:** None

### **[6_UI_UX_ARCH-REQ-078]** Asset Lazy Loading
- **Type:** Technical
- **Description:** Heavy binary assets (e.g., Mermaid sub-modules) MUST be lazy-loaded using dynamic imports.
- **Source:** UI/UX Architecture (specs/6_ui_ux_architecture.md)
- **Dependencies:** None

### **[7_UI_UX_DESIGN-REQ-UI-DES-087-1]** Battery Saver Mode
- **Type:** Technical
- **Description:** If the device is detected to be in "Battery Saver" mode (via Battery API where available), the UI MUST throttle the DAG Canvas refresh rate from 60FPS to 15FPS.
- **Source:** UI/UX Design (specs/7_ui_ux_design.md)
- **Dependencies:** None

### **[6_UI_UX_ARCH-REQ-096]** Broken Mermaid Handling
- **Type:** Technical
- **Description:** Catch rendering errors for invalid Mermaid diagrams and display a fallback with raw markup.
- **Source:** UI/UX Architecture (specs/6_ui_ux_architecture.md)
- **Dependencies:** [6_UI_UX_ARCH-REQ-026]

### **[6_UI_UX_ARCH-REQ-007]** Bundle Size Constraints
- **Type:** Technical
- **Description:** The Webview bundle MUST be optimized for load speed. Heavy visualization libraries (Mermaid, D3) SHOULD be lazy-loaded only when the user navigates to the Roadmap or Spec views.
- **Source:** UI/UX Architecture (specs/6_ui_ux_architecture.md)
- **Dependencies:** None

### **[6_UI_UX_ARCH-REQ-002]** CLI (The Automation Engine)
- **Type:** Technical
- **Description:** The interface for "Makers" and CI/CD integration. Built with Node.js (LTS), ink (v4+), terminal-kit / chalk, supporting both Interactive and Headless (NDJSON) modes.
- **Source:** UI/UX Architecture (specs/6_ui_ux_architecture.md)
- **Dependencies:** None

### **[6_UI_UX_ARCH-REQ-061]** Cross-Document Spec Linking
- **Type:** Technical
- **Description:** Links within generated documents (e.g., REQ-ID) MUST trigger NAVIGATE_TO_SPEC in the Webview instead of opening an external browser.
- **Source:** UI/UX Architecture (specs/6_ui_ux_architecture.md)
- **Dependencies:** None

### **[6_UI_UX_ARCH-REQ-035]** Cross-Platform State (Zustand Store)
- **Type:** Technical
- **Description:** Core state logic implemented in a platform-agnostic Zustand store consumed by both CLI (Ink) and VSCode (React).
- **Source:** UI/UX Architecture (specs/6_ui_ux_architecture.md)
- **Dependencies:** None

### **[6_UI_UX_ARCH-REQ-081]** Custom CSS Handling
- **Type:** Technical
- **Description:** Custom CSS for the generated app is ignored by the 'devs' orchestrator UI; only applied to the generated project's src folder.
- **Source:** UI/UX Architecture (specs/6_ui_ux_architecture.md)
- **Dependencies:** None

### **[6_UI_UX_ARCH-REQ-048]** DAG Level-of-Detail (LOD)
- **Type:** Technical
- **Description:** For projects with >10 Epics, the Zustand store calculates a simplified DAG of Epic-level summaries; full DAG is computed only on drill-down.
- **Source:** UI/UX Architecture (specs/6_ui_ux_architecture.md)
- **Dependencies:** [6_UI_UX_ARCH-REQ-020]

### **[6_UI_UX_ARCH-REQ-049]** Disconnection Resilience
- **Type:** Technical
- **Description:** If MCP socket closes, UI enters RECONNECTING state, disables interactive buttons, and reconciles state via sync_all upon reconnection.
- **Source:** UI/UX Architecture (specs/6_ui_ux_architecture.md)
- **Dependencies:** [6_UI_UX_ARCH-REQ-008]

### **[6_UI_UX_ARCH-REQ-018]** Edge Case: Large Reasoning Logs
- **Type:** Technical
- **Description:** ThoughtStreamer MUST implement virtual scrolling for tasks with >50 turns to maintain 60fps performance.
- **Source:** UI/UX Architecture (specs/6_ui_ux_architecture.md)
- **Dependencies:** [6_UI_UX_ARCH-REQ-015]

### **[6_UI_UX_ARCH-REQ-025]** Edge Case: Massive Graphs
- **Type:** Technical
- **Description:** If task count > 300, the DAGCanvas MUST switch to a simplified "LOD" mode where labels are hidden until zoomed in.
- **Source:** UI/UX Architecture (specs/6_ui_ux_architecture.md)
- **Dependencies:** [6_UI_UX_ARCH-REQ-020]

### **[6_UI_UX_ARCH-REQ-021]** Engine
- **Type:** Technical
- **Description:** DAGCanvas uses d3-force for layout and react-zoom-pan-pinch for navigation.
- **Source:** UI/UX Architecture (specs/6_ui_ux_architecture.md)
- **Dependencies:** [6_UI_UX_ARCH-REQ-020]

### **[6_UI_UX_ARCH-REQ-011]** Error Propagation
- **Type:** Technical
- **Description:** All system errors MUST be bubbled up to the UI with original stack traces and "Root Cause" summaries to facilitate human debugging.
- **Source:** UI/UX Architecture (specs/6_ui_ux_architecture.md)
- **Dependencies:** [6_UI_UX_ARCH-REQ-008]

### **[6_UI_UX_ARCH-REQ-060]** Extension Host URI Handler
- **Type:** Technical
- **Description:** Register a custom URI scheme (vscode://google.gemini-devs/open-task?id=...) to deep-link into specific tasks from external files.
- **Source:** UI/UX Architecture (specs/6_ui_ux_architecture.md)
- **Dependencies:** None

### **[7_UI_UX_DESIGN-REQ-UI-DES-059-1]** FPS Target
- **Type:** Technical
- **Description:** All animations MUST maintain 60FPS on a standard developer machine (e.g., MacBook M1).
- **Source:** UI/UX Design (specs/7_ui_ux_design.md)
- **Dependencies:** None

### **[7_UI_UX_DESIGN-REQ-UI-DES-050]** Functional Animation Manifesto (The Logic of Motion)
- **Type:** Technical
- **Description:** Motion in 'devs' is never decorative. It is a technical tool used to communicate system state, data flow, and agentic intent. All animations MUST be fast (< 250ms), utilize the standard engineering easing curve `cubic-bezier(0.4, 0, 0.2, 1)`, and prioritize performance by animating only `transform` and `opacity` properties where possible.
- **Source:** UI/UX Design (specs/7_ui_ux_design.md)
- **Dependencies:** None

### **[7_UI_UX_DESIGN-REQ-UI-DES-087-2]** GPU Acceleration
- **Type:** Technical
- **Description:** Heavy visualizations (Flamegraphs, Large DAGs) MUST use `transform: translate3d(0,0,0)` to force GPU layer creation, preventing CPU spikes during agent implementation loops.
- **Source:** UI/UX Design (specs/7_ui_ux_design.md)
- **Dependencies:** None

### **[6_UI_UX_ARCH-REQ-095]** Graph Throttling
- **Type:** Technical
- **Description:** Internal debouncer for DAG updates during parallel task execution to prevent UI stuttering.
- **Source:** UI/UX Architecture (specs/6_ui_ux_architecture.md)
- **Dependencies:** [6_UI_UX_ARCH-REQ-020]

### **[7_UI_UX_DESIGN-REQ-UI-DES-087]** Hardware-Aware Rendering
- **Type:** Technical
- **Description:** - **[7_UI_UX_DESIGN-REQ-UI-DES-087-1] Battery Saver Mode**: If the device is detected to be in "Battery Saver" mode (via Battery API where available), the UI MUST throttle the DAG Canvas refresh rate from 60FPS to 15FPS.
- **Source:** UI/UX Design (specs/7_ui_ux_design.md)
- **Dependencies:** None

### **[6_UI_UX_ARCH-REQ-069]** Headless Transition (CLI)
- **Type:** Technical
- **Description:** The CLI ignores complex navigation parameters and focuses on the current active task or phase gate.
- **Source:** UI/UX Architecture (specs/6_ui_ux_architecture.md)
- **Dependencies:** [6_UI_UX_ARCH-REQ-002]

### **[6_UI_UX_ARCH-REQ-106]** IconButton Primitive
- **Type:** Technical
- **Description:** Primitive using vscode-webview-ui-toolkit (React) or keybinding shortcuts (Ink) for standardized interactive triggers.
- **Source:** UI/UX Architecture (specs/6_ui_ux_architecture.md)
- **Dependencies:** None

### **[6_UI_UX_ARCH-REQ-003]** Interface-Core Decoupling (The "Thin UI" Rule)
- **Type:** Technical
- **Description:** UI layers MUST remain strictly observational. No business logic, agent state transitions, or requirement distillation logic is permitted in the presentation packages.
- **Source:** UI/UX Architecture (specs/6_ui_ux_architecture.md)
- **Dependencies:** None

### **[6_UI_UX_ARCH-REQ-068]** Invalid Context Recovery
- **Type:** Technical
- **Description:** Router MUST fallback to DASHBOARD and show a "Task Not Found" toast if a taskId no longer exists.
- **Source:** UI/UX Architecture (specs/6_ui_ux_architecture.md)
- **Dependencies:** None

### **[6_UI_UX_ARCH-REQ-047]** Log Chunking
- **Type:** Technical
- **Description:** Observations exceeding 50KB are stored as discrete chunks in the UI; LogTerminal renders last 500 lines by default with infinite scroll.
- **Source:** UI/UX Architecture (specs/6_ui_ux_architecture.md)
- **Dependencies:** None

### **[6_UI_UX_ARCH-REQ-094]** Log Virtualization
- **Type:** Technical
- **Description:** Use virtualized rendering for ConsoleView turns to prevent DOM bloat in long-running tasks.
- **Source:** UI/UX Architecture (specs/6_ui_ux_architecture.md)
- **Dependencies:** [6_UI_UX_ARCH-REQ-058]

### **[6_UI_UX_ARCH-REQ-105]** LogTerminal Primitive
- **Type:** Technical
- **Description:** Primitive using xterm.js (React) or monospaced text (Ink) that renders sandbox stdout/stderr with secret masking.
- **Source:** UI/UX Architecture (specs/6_ui_ux_architecture.md)
- **Dependencies:** None

### **[6_UI_UX_ARCH-REQ-097]** Massive Log Handling
- **Type:** Technical
- **Description:** Truncate observations exceeding 10,000 characters and provide "Read More" functionality.
- **Source:** UI/UX Architecture (specs/6_ui_ux_architecture.md)
- **Dependencies:** None

### **[6_UI_UX_ARCH-REQ-006]** Message Throttling
- **Type:** Technical
- **Description:** The UI MUST implement a throttling mechanism (max 60fps) for agent thought streams to prevent blocking the UI main thread or causing input lag.
- **Source:** UI/UX Architecture (specs/6_ui_ux_architecture.md)
- **Dependencies:** None

### **[6_UI_UX_ARCH-REQ-014]** OS Compatibility
- **Type:** Technical
- **Description:** UI layers MUST be tested and verified on macOS, Linux, and Windows, with attention to font rendering and keybinding parity (Cmd vs Ctrl).
- **Source:** UI/UX Architecture (specs/6_ui_ux_architecture.md)
- **Dependencies:** None

### **[7_UI_UX_DESIGN-REQ-UI-DES-086-3]** Optimistic State Rollback
- **Type:** Technical
- **Description:** If a human-initiated directive fails to persist in the SQLite state, the UI MUST perform a "Snap-Back" animation (300ms) to the last verified state and display a "Persistence Failure" warning.
- **Source:** UI/UX Design (specs/7_ui_ux_design.md)
- **Dependencies:** None

### **[7_UI_UX_DESIGN-REQ-UI-DES-056]** Pan & Zoom Inertia
- **Type:** Technical
- **Description:** - **[7_UI_UX_DESIGN-REQ-UI-DES-056-1] Physics**: The DAG canvas MUST implement momentum scrolling (inertia). Rapid pans MUST decelerate gracefully over 400ms.
- **Source:** UI/UX Design (specs/7_ui_ux_design.md)
- **Dependencies:** None

### **[7_UI_UX_DESIGN-REQ-UI-DES-111]** Performance Telemetry
- **Type:** Technical
- **Description:** - **[7_UI_UX_DESIGN-REQ-UI-DES-111-1] Flamegraphs**: Visual representation of CPU execution time captured via the `ProjectServer` profiling tool.
- **Source:** UI/UX Design (specs/7_ui_ux_design.md)
- **Dependencies:** None

### **[7_UI_UX_DESIGN-REQ-UI-DES-056-1]** Physics
- **Type:** Technical
- **Description:** The DAG canvas MUST implement momentum scrolling (inertia). Rapid pans MUST decelerate gracefully over 400ms.
- **Source:** UI/UX Design (specs/7_ui_ux_design.md)
- **Dependencies:** None

### **[6_UI_UX_ARCH-REQ-046]** Reasoning Log Windowing
- **Type:** Technical
- **Description:** The UI store only maintains the "Full Trace" for the activeTaskId; historical traces are evicted and re-fetched via MCP on-demand.
- **Source:** UI/UX Architecture (specs/6_ui_ux_architecture.md)
- **Dependencies:** None

### **[6_UI_UX_ARCH-REQ-016]** Rendering Logic
- **Type:** Technical
- **Description:** ThoughtStreamer uses react-markdown with remark-gfm and MUST support incremental streaming without full re-renders.
- **Source:** UI/UX Architecture (specs/6_ui_ux_architecture.md)
- **Dependencies:** [6_UI_UX_ARCH-REQ-015]

### **[6_UI_UX_ARCH-REQ-009]** Request/Response
- **Type:** Technical
- **Description:** UI triggers tool calls which are forwarded to the OrchestratorServer via MCP.
- **Source:** UI/UX Architecture (specs/6_ui_ux_architecture.md)
- **Dependencies:** [6_UI_UX_ARCH-REQ-008]

### **[6_UI_UX_ARCH-REQ-052]** Router Provider
- **Type:** Technical
- **Description:** Top-level ViewRouter component that conditionally renders primary view modules based on the viewMode state.
- **Source:** UI/UX Architecture (specs/6_ui_ux_architecture.md)
- **Dependencies:** None

### **[6_UI_UX_ARCH-REQ-093]** SAOP Envelope UI Representation
- **Type:** Technical
- **Description:** Standardized JSON model for representing agent turns (thoughts, actions, observations) in the UI.
- **Source:** UI/UX Architecture (specs/6_ui_ux_architecture.md)
- **Dependencies:** None

### **[6_UI_UX_ARCH-REQ-037]** SVG Rendering Overhead Mitigation
- **Type:** Technical
- **Description:** MermaidHost MUST use a ResizeObserver to only render diagrams currently in the viewport.
- **Source:** UI/UX Architecture (specs/6_ui_ux_architecture.md)
- **Dependencies:** [6_UI_UX_ARCH-REQ-026]

### **[6_UI_UX_ARCH-REQ-045]** Selective Reactivity
- **Type:** Technical
- **Description:** ThoughtStreamer uses selector-based subscriptions to Zustand to only re-render when its specific task_id content changes.
- **Source:** UI/UX Architecture (specs/6_ui_ux_architecture.md)
- **Dependencies:** [6_UI_UX_ARCH-REQ-015], [6_UI_UX_ARCH-REQ-035]

### **[6_UI_UX_ARCH-REQ-066]** Session Re-hydration
- **Type:** Technical
- **Description:** UI MUST call vscode.setState() on every navigation change to restore viewMode and activeTaskId if the Webview is disposed.
- **Source:** UI/UX Architecture (specs/6_ui_ux_architecture.md)
- **Dependencies:** None

### **[6_UI_UX_ARCH-REQ-034]** Shared Logic Hooks (@devs/ui-hooks)
- **Type:** Technical
- **Description:** Shared React hooks for task status, entropy monitoring (loop detection), and requirement tracing.
- **Source:** UI/UX Architecture (specs/6_ui_ux_architecture.md)
- **Dependencies:** None

### **[6_UI_UX_ARCH-REQ-050]** State Desync Detection
- **Type:** Technical
- **Description:** Every state update includes a sequence_id/timestamp; UI initiates "Hard Refresh" if it receives an older sequence update.
- **Source:** UI/UX Architecture (specs/6_ui_ux_architecture.md)
- **Dependencies:** None

### **[6_UI_UX_ARCH-REQ-038]** State Desync Mitigation
- **Type:** Technical
- **Description:** Mandatory use of SQLite WAL mode and file-system watchers on state.sqlite to trigger UI refreshes across all interfaces.
- **Source:** UI/UX Architecture (specs/6_ui_ux_architecture.md)
- **Dependencies:** None

### **[6_UI_UX_ARCH-REQ-033]** State Integration
- **Type:** Technical
- **Description:** On submit, DirectiveWhisperer triggers the inject_directive MCP tool and optimistically appends the directive to the ThoughtStreamer.
- **Source:** UI/UX Architecture (specs/6_ui_ux_architecture.md)
- **Dependencies:** [6_UI_UX_ARCH-REQ-030]

### **[7_UI_UX_DESIGN-REQ-UI-DES-058]** State Recovery & Rewind (Time-Travel)
- **Type:** Technical
- **Description:** - **[7_UI_UX_DESIGN-REQ-UI-DES-058-1] Visual**: Triggering a `rewind` MUST apply a temporary "Glitch/Desaturation" filter to the entire UI (CSS `grayscale(1) brightness(0.8)`) for 600ms while the Git/SQLite state is restored.
- **Source:** UI/UX Design (specs/7_ui_ux_design.md)
- **Dependencies:** None

### **[6_UI_UX_ARCH-REQ-010]** State Streaming
- **Type:** Technical
- **Description:** The Orchestrator emits STATE_CHANGE events which the UI Context Provider captures to perform partial state refreshes, keeping the UI in sync with the SQLite "Flight Recorder".
- **Source:** UI/UX Architecture (specs/6_ui_ux_architecture.md)
- **Dependencies:** [6_UI_UX_ARCH-REQ-008]

### **[6_UI_UX_ARCH-REQ-103]** StatusBadge Primitive
- **Type:** Technical
- **Description:** Custom primitive (React/Ink) that renders task/epic status with standardized colors.
- **Source:** UI/UX Architecture (specs/6_ui_ux_architecture.md)
- **Dependencies:** None

### **[6_UI_UX_ARCH-REQ-107]** StepProgress Primitive
- **Type:** Technical
- **Description:** Custom primitive (React/Ink) that visualizes the 5 phases of the 'devs' lifecycle.
- **Source:** UI/UX Architecture (specs/6_ui_ux_architecture.md)
- **Dependencies:** None

### **[6_UI_UX_ARCH-REQ-082]** Streaming Thought Protocol
- **Type:** Technical
- **Description:** ThoughtStream component MUST support incremental rendering of Markdown from the SAOP stream.
- **Source:** UI/UX Architecture (specs/6_ui_ux_architecture.md)
- **Dependencies:** [6_UI_UX_ARCH-REQ-015]

### **[6_UI_UX_ARCH-REQ-005]** Sub-Second State Hydration
- **Type:** Technical
- **Description:** The UI MUST be reactive, utilizing a dedicated "Event Stream" (WebSockets in CLI, postMessage in VSCode) to reflect underlying SQLite state transitions.
- **Source:** UI/UX Architecture (specs/6_ui_ux_architecture.md)
- **Dependencies:** None

### **[6_UI_UX_ARCH-REQ-077]** Syntax Highlighting (Glass-Box Logs)
- **Type:** Technical
- **Description:** Integration of shiki or Prism for syntax highlighting that matches the active VSCode color theme.
- **Source:** UI/UX Architecture (specs/6_ui_ux_architecture.md)
- **Dependencies:** None

### **[6_UI_UX_ARCH-REQ-080]** TUI ASCII Fallbacks
- **Type:** Technical
- **Description:** CLI MUST automatically swap Codicons for ASCII equivalents if Unicode is not supported.
- **Source:** UI/UX Architecture (specs/6_ui_ux_architecture.md)
- **Dependencies:** [6_UI_UX_ARCH-REQ-013]

### **[7_UI_UX_DESIGN-REQ-UI-DES-060]** TUI Philosophy (Minimalist Authority)
- **Type:** Technical
- **Description:** The CLI interface MUST provide the same "Glass-Box" telemetry as the VSCode Extension but optimized for the low-latency, keyboard-driven environment of the terminal. It utilizes `Ink` (React for CLI) to manage stateful components and `Chalk` for ANSI color mapping. The TUI prioritizes vertical flow and high-density text over the spatial 2D graph of the VSCode DAG.
- **Source:** UI/UX Design (specs/7_ui_ux_design.md)
- **Dependencies:** None

### **[6_UI_UX_ARCH-REQ-013]** TUI Resilience
- **Type:** Technical
- **Description:** The CLI MUST detect terminal capabilities and degrade gracefully using ASCII Fallbacks if Unicode or specific color depths are unsupported.
- **Source:** UI/UX Architecture (specs/6_ui_ux_architecture.md)
- **Dependencies:** [6_UI_UX_ARCH-REQ-002]

### **[6_UI_UX_ARCH-REQ-072]** TUI Styling (Ink & Chalk)
- **Type:** Technical
- **Description:** CLI uses a semantic color mapper for ANSI codes and detects terminal background for theme selection.
- **Source:** UI/UX Architecture (specs/6_ui_ux_architecture.md)
- **Dependencies:** [6_UI_UX_ARCH-REQ-002]

### **[6_UI_UX_ARCH-REQ-070]** Tailwind CSS with Shadow DOM Isolation
- **Type:** Technical
- **Description:** Use prefixed Tailwind with Shadow DOM to prevent style collisions with VSCode or other extensions.
- **Source:** UI/UX Architecture (specs/6_ui_ux_architecture.md)
- **Dependencies:** None

### **[7_UI_UX_DESIGN-REQ-UI-DES-093-4]** Task Detail Card
- **Type:** Technical
- **Description:** A slide-out panel showing the full implementation history, including failing test logs and git diffs.
- **Source:** UI/UX Design (specs/7_ui_ux_design.md)
- **Dependencies:** None

### **[6_UI_UX_ARCH-REQ-008]** The Orchestrator Bridge
- **Type:** Technical
- **Description:** Both interfaces communicate with the @devs/core orchestrator via a standardized MCP (Model Context Protocol) Client.
- **Source:** UI/UX Architecture (specs/6_ui_ux_architecture.md)
- **Dependencies:** None

### **[7_UI_UX_DESIGN-REQ-UI-DES-026]** Theme Switching Latency
- **Type:** Technical
- **Description:** The UI MUST react to theme changes (emitted by VSCode) within 50ms. CSS variable updates MUST NOT trigger full React re-renders of the Task DAG; instead, the DAG canvas MUST utilize `requestAnimationFrame` to update its internal theme state.
- **Source:** UI/UX Design (specs/7_ui_ux_design.md)
- **Dependencies:** None

### **[7_UI_UX_DESIGN-REQ-UI-DES-059-3]** Threading
- **Type:** Technical
- **Description:** Heavy canvas updates (DAG layout) MUST be offloaded to a Web Worker to ensure that the React main thread remains responsive for user input.
- **Source:** UI/UX Design (specs/7_ui_ux_design.md)
- **Dependencies:** None

### **[6_UI_UX_ARCH-REQ-040]** Tier 0: Transient Component State (Ephemeral)
- **Type:** Technical
- **Description:** Ephemeral component-level state (hover, toggles) using React useState/useReducer; never persisted.
- **Source:** UI/UX Architecture (specs/6_ui_ux_architecture.md)
- **Dependencies:** None

### **[6_UI_UX_ARCH-REQ-041]** Tier 1: Global UI Layout State (Volatile)
- **Type:** Technical
- **Description:** Volatile layout state (active tab, zoom/pan) using Zustand; shared across Webview, resets on reload.
- **Source:** UI/UX Architecture (specs/6_ui_ux_architecture.md)
- **Dependencies:** None

### **[6_UI_UX_ARCH-REQ-042]** Tier 2: Synchronized Project Mirror (Source of Truth)
- **Type:** Technical
- **Description:** Normalized Zustand store hydrated via MCP subscriptions, reflecting the SQLite state.sqlite database.
- **Source:** UI/UX Architecture (specs/6_ui_ux_architecture.md)
- **Dependencies:** [6_UI_UX_ARCH-REQ-008]

### **[6_UI_UX_ARCH-REQ-043]** Tier 3: Persistent User Preferences (Host-Level)
- **Type:** Technical
- **Description:** Host-level persistent preferences (theme, directive history) using VSCode workspaceState/globalState.
- **Source:** UI/UX Architecture (specs/6_ui_ux_architecture.md)
- **Dependencies:** None

### **[6_UI_UX_ARCH-REQ-092]** UI Task DAG Model
- **Type:** Technical
- **Description:** Standardized JSON model for representing the task DAG in the UI.
- **Source:** UI/UX Architecture (specs/6_ui_ux_architecture.md)
- **Dependencies:** None

### **[7_UI_UX_DESIGN-REQ-UI-UNK-001]** Unknown
- **Type:** Technical
- **Description:** Should the user be allowed to override the "Agent Thought" Serif font with a custom font? *Recommendation*: No, the serif font is a critical semantic marker for agency; allowing overrides could dilute the visual hierarchy.
- **Source:** UI/UX Design (specs/7_ui_ux_design.md)
- **Dependencies:** None

### **[7_UI_UX_DESIGN-REQ-UI-UNK-002]** Unknown
- **Type:** Technical
- **Description:** Should the "Thinking Pulse" be color-coded based on model confidence? *Recommendation*: No, keep it neutral; use the `LogTerminal` for confidence scores to avoid visual noise.
- **Source:** UI/UX Design (specs/7_ui_ux_design.md)
- **Dependencies:** None

### **[7_UI_UX_DESIGN-REQ-UI-UNK-003]** Unknown
- **Type:** Technical
- **Description:** Should the CLI support "Mouse Interaction" (clicking nodes)? *Recommendation*: No, maintain a 100% keyboard-driven interface for CLI consistency; reserve mouse interaction for the VSCode Extension.
- **Source:** UI/UX Design (specs/7_ui_ux_design.md)
- **Dependencies:** None

### **[7_UI_UX_DESIGN-REQ-UI-UNK-004]** Unknown
- **Type:** Technical
- **Description:** How should the UI adapt if the user has a custom VSCode "Zoom" setting > 200%? *Recommendation*: All spacing variables MUST use `rem` or `em` units to ensure they scale with the editor's base font size.
- **Source:** UI/UX Design (specs/7_ui_ux_design.md)
- **Dependencies:** None

### **[6_UI_UX_ARCH-REQ-044]** Update Batching (60FPS Rule)
- **Type:** Technical
- **Description:** The @devs/core orchestrator MUST batch thought chunks every 32ms (targeting 30fps) during high-velocity tasks to prevent bridge saturation.
- **Source:** UI/UX Architecture (specs/6_ui_ux_architecture.md)
- **Dependencies:** None

### **[6_UI_UX_ARCH-REQ-001]** VSCode Extension (The Visual Glass-Box)
- **Type:** Technical
- **Description:** The primary interface for architectural review and real-time monitoring. Built with React 18.3+ (TypeScript), Vite 5.x, @vscode/webview-ui-toolkit, Mermaid.js (v10+), and VSCode postMessage API.
- **Source:** UI/UX Architecture (specs/6_ui_ux_architecture.md)
- **Dependencies:** None

### **[6_UI_UX_ARCH-REQ-075]** Vector-First Visualization Pipeline
- **Type:** Technical
- **Description:** Diagrams are rendered client-side to SVG; high-density DAG may use HTML5 Canvas fallback for performance.
- **Source:** UI/UX Architecture (specs/6_ui_ux_architecture.md)
- **Dependencies:** None

### **[6_UI_UX_ARCH-REQ-064]** Virtual History Stack
- **Type:** Technical
- **Description:** The UI store maintains a 10-level deep navigationHistory array for Back/Forward functionality within the Webview.
- **Source:** UI/UX Architecture (specs/6_ui_ux_architecture.md)
- **Dependencies:** None

### **[7_UI_UX_DESIGN-REQ-UI-DES-058-1]** Visual
- **Type:** Technical
- **Description:** Triggering a `rewind` MUST apply a temporary "Glitch/Desaturation" filter to the entire UI (CSS `grayscale(1) brightness(0.8)`) for 600ms while the Git/SQLite state is restored.
- **Source:** UI/UX Design (specs/7_ui_ux_design.md)
- **Dependencies:** None

### **[6_UI_UX_ARCH-REQ-051]** Webview Crash Recovery
- **Type:** Technical
- **Description:** Critical UI state (active view, filters) MUST be persisted to vscode.getState() every 5 seconds to allow restoration after a crash or reload.
- **Source:** UI/UX Architecture (specs/6_ui_ux_architecture.md)
- **Dependencies:** None

### **[6_UI_UX_ARCH-REQ-036]** Webview Message Bottleneck Mitigation
- **Type:** Technical
- **Description:** Implement an internal buffer in @devs/core that batches thought chunks every 50ms before sending to the UI via postMessage.
- **Source:** UI/UX Architecture (specs/6_ui_ux_architecture.md)
- **Dependencies:** None

### **[6_UI_UX_ARCH-REQ-101]** i18n Skeleton
- **Type:** Technical
- **Description:** Use i18next for static UI strings to support dynamic locale switching.
- **Source:** UI/UX Architecture (specs/6_ui_ux_architecture.md)
- **Dependencies:** None

### **[7_UI_UX_DESIGN-REQ-UI-DES-033-6]** **[7_UI_UX_DESIGN-REQ-UI-DES-034]** ** |
- **Type:** UX
- **Description:** - **[7_UI_UX_DESIGN-REQ-UI-DES-034-1] Agentic Reasoning (Thoughts)**: MUST be rendered in **Italic Serif**. This creates a "journalistic" or "internal monologue" feel, separating reasoning from code implementation.
- **Source:** UI/UX Design (specs/7_ui_ux_design.md)
- **Dependencies:** None

### **[7_UI_UX_DESIGN-REQ-UI-DES-064-1]** **[7_UI_UX_DESIGN-REQ-UI-DES-064-2]** **[7_UI_UX_DESIGN-REQ-UI-DES-064-3]** **[7_UI_UX_DESIGN-REQ-UI-DES-064-4]** **[7_UI_UX_DESIGN-REQ-UI-DES-064-5]** **[7_UI_UX_DESIGN-REQ-UI-DES-064-6]** **[7_UI_UX_DESIGN-REQ-UI-DES-065]** ** |
- **Type:** UX
- **Description:** - **[7_UI_UX_DESIGN-REQ-UI-DES-065-1] Structured Blocks**: Tool calls and Reasoning turns MUST be wrapped in Unicode box-drawing characters (`┌`, `─`, `┐`, `│`, `└`, `─`, `┘`).
- **Source:** UI/UX Design (specs/7_ui_ux_design.md)
- **Dependencies:** None

### **[7_UI_UX_DESIGN-REQ-UI-DES-031-1]** **[7_UI_UX_DESIGN-REQ-UI-DES-031-2]** **[7_UI_UX_DESIGN-REQ-UI-DES-031-3]** **[7_UI_UX_DESIGN-REQ-UI-DES-032]** ** |
- **Type:** UX
- **Description:** The "Technical Logs" and "Source Code" views MUST inherit the user's active VSCode editor font settings (family, weight, and ligatures) via the `--vscode-editor-font-family` and `--vscode-editor-font-weight` variables. This ensures the implementation view feels identical to the user's coding environment.
- **Source:** UI/UX Design (specs/7_ui_ux_design.md)
- **Dependencies:** None

### **[7_UI_UX_DESIGN-REQ-UI-DES-081-1]** **[7_UI_UX_DESIGN-REQ-UI-DES-081-2]** **[7_UI_UX_DESIGN-REQ-UI-DES-081-3]** **[7_UI_UX_DESIGN-REQ-UI-DES-081-4]** **[7_UI_UX_DESIGN-REQ-UI-DES-081-5]** **[7_UI_UX_DESIGN-REQ-UI-DES-082]** ** |
- **Type:** UX
- **Description:** If the viewport height is `< 600px`, the Bottom Console MUST be minimized to a "Status Bar" mode (32px height) showing only the active task ID and a progress pulse, maximizing the vertical space for the Roadmap or Spec View.
- **Source:** UI/UX Design (specs/7_ui_ux_design.md)
- **Dependencies:** None

### **[7_UI_UX_DESIGN-REQ-UI-DES-061-1]** **[7_UI_UX_DESIGN-REQ-UI-DES-061-2]** **[7_UI_UX_DESIGN-REQ-UI-DES-061-3]** **[7_UI_UX_DESIGN-REQ-UI-DES-061-4]** **[7_UI_UX_DESIGN-REQ-UI-DES-062]** ** |
- **Type:** UX
- **Description:** - **[7_UI_UX_DESIGN-REQ-UI-DES-062-1] Compact Mode (< 80 chars)**: The layout switches to a single vertical stack. The Roadmap is hidden in favor of a `[Current Task ID]` breadcrumb in the header.
- **Source:** UI/UX Design (specs/7_ui_ux_design.md)
- **Dependencies:** None

### **[7_UI_UX_DESIGN-REQ-UI-DES-041]** **[7_UI_UX_DESIGN-REQ-UI-DES-042]** **[7_UI_UX_DESIGN-REQ-UI-DES-043]** **[7_UI_UX_DESIGN-REQ-UI-DES-044]** **[7_UI_UX_DESIGN-REQ-UI-DES-044-1]** **[7_UI_UX_DESIGN-REQ-UI-DES-044-2]** **[7_UI_UX_DESIGN-REQ-UI-DES-045]** ** |
- **Type:** UX
- **Description:** To support cognitive anchoring [7_UI_UX_DESIGN-REQ-UI-DES-003], the UI is divided into resizable but persistent zones.
- **Source:** UI/UX Design (specs/7_ui_ux_design.md)
- **Dependencies:** None

### **[7_UI_UX_DESIGN-REQ-UI-DES-019]** **[7_UI_UX_DESIGN-REQ-UI-DES-020]** **[7_UI_UX_DESIGN-REQ-UI-DES-021]** **[7_UI_UX_DESIGN-REQ-UI-DES-022]** **[7_UI_UX_DESIGN-REQ-UI-DES-023]** ** |
- **Type:** UX
- **Description:** The CLI and VSCode `LogTerminal` components MUST map the semantic palette to standard ANSI escape codes for consistent cross-platform rendering.
- **Source:** UI/UX Design (specs/7_ui_ux_design.md)
- **Dependencies:** None

### **[7_UI_UX_DESIGN-REQ-UI-DES-014]** **[7_UI_UX_DESIGN-REQ-UI-DES-015]** **[7_UI_UX_DESIGN-REQ-UI-DES-016]** **[7_UI_UX_DESIGN-REQ-UI-DES-017]** **[7_UI_UX_DESIGN-REQ-UI-DES-018]** ** |
- **Type:** UX
- **Description:** Backgrounds for agentic content utilize the CSS `color-mix()` function to create a "Glass-Box" effect that adapts to the user's background while maintaining semantic intent.
- **Source:** UI/UX Design (specs/7_ui_ux_design.md)
- **Dependencies:** None

### **[7_UI_UX_DESIGN-REQ-UI-DES-063-3]** 16-Color (Basic)
- **Type:** UX
- **Description:** High-contrast fallback using standard ANSI constants (Green, Red, Yellow, Cyan, Magenta).
- **Source:** UI/UX Design (specs/7_ui_ux_design.md)
- **Dependencies:** None

### **[7_UI_UX_DESIGN-REQ-UI-DES-063-2]** 256-Color (xterm)
- **Type:** UX
- **Description:** Fallback mapping for older terminals (e.g., standard macOS Terminal.app).
- **Source:** UI/UX Design (specs/7_ui_ux_design.md)
- **Dependencies:** None

### **[7_UI_UX_DESIGN-REQ-UI-DES-063]** ANSI Token Mapping (The TUI Palette)
- **Type:** UX
- **Description:** The VSCode semantic tokens [7_UI_UX_DESIGN-REQ-UI-DES-010] are mapped to the closest ANSI equivalents.
- **Source:** UI/UX Design (specs/7_ui_ux_design.md)
- **Dependencies:** None

### **[6_UI_UX_ARCH-REQ-067]** Active Task Lock
- **Type:** UX
- **Description:** Show confirmation warning if user attempts to navigate away from CONSOLE during a high-priority "Human-in-the-Loop" gate.
- **Source:** UI/UX Architecture (specs/6_ui_ux_architecture.md)
- **Dependencies:** None

### **[7_UI_UX_DESIGN-REQ-UI-DES-027]** Agentic Differentiators (Multi-Agent Support)
- **Type:** UX
- **Description:** In scenarios where multiple agents (e.g., Developer vs. Reviewer) are working simultaneously, the UI SHOULD use secondary accent tints from the VSCode `symbolIcon` palette to differentiate their "Thought" headers:
- **Source:** UI/UX Design (specs/7_ui_ux_design.md)
- **Dependencies:** None

### **[7_UI_UX_DESIGN-REQ-UI-DES-025-1]** Alpha-Blending Removal
- **Type:** UX
- **Description:** All `color-mix()` backgrounds MUST be replaced with solid `var(--vscode-editor-background)`.
- **Source:** UI/UX Design (specs/7_ui_ux_design.md)
- **Dependencies:** None

### **[7_UI_UX_DESIGN-REQ-UI-DES-092-3]** Approval Checkboxes
- **Type:** UX
- **Description:** Every requirement block MUST have a "Sign-off" checkbox. The "Approve Architecture" button remains disabled until all P3 (Must-have) requirements are checked.
- **Source:** UI/UX Design (specs/7_ui_ux_design.md)
- **Dependencies:** None

### **[7_UI_UX_DESIGN-REQ-UI-DES-084-3]** Aria-Live Annunciation
- **Type:** UX
- **Description:** The UI MUST utilize a non-visual `aria-live` buffer to announce "Agentic Events" (e.g., "Task T-102 Failed at Red Phase") without disrupting the user's focus on the code.
- **Source:** UI/UX Design (specs/7_ui_ux_design.md)
- **Dependencies:** None

### **[7_UI_UX_DESIGN-REQ-UI-DES-100-2]** Autocomplete
- **Type:** UX
- **Description:** `@` triggers a list of project files; `#` triggers a list of requirement IDs.
- **Source:** UI/UX Design (specs/7_ui_ux_design.md)
- **Dependencies:** None

### **[7_UI_UX_DESIGN-REQ-UI-DES-038]** CJK & Multi-Script Support
- **Type:** UX
- **Description:** - **[7_UI_UX_DESIGN-REQ-UI-DES-038-1] Fallback Chain**: For Non-Latin scripts (Chinese, Japanese, Korean), the system MUST fallback to the host OS defaults (e.g., `PingFang SC` for macOS, `Meiryo` for Windows) to prevent "tofu" or broken character rendering in research reports.
- **Source:** UI/UX Design (specs/7_ui_ux_design.md)
- **Dependencies:** None

### **[7_UI_UX_DESIGN-REQ-UI-DES-047]** Card & Container Attributes
- **Type:** UX
- **Description:** - **[7_UI_UX_DESIGN-REQ-UI-DES-047-1] Border Radius**: `4px` (Rigid, professional feel).
- **Source:** UI/UX Design (specs/7_ui_ux_design.md)
- **Dependencies:** None

### **[6_UI_UX_ARCH-REQ-084]** Chain-of-Thought Visualization
- **Type:** UX
- **Description:** UI MUST visually link tool calls back to the reasoning block that initiated them.
- **Source:** UI/UX Architecture (specs/6_ui_ux_architecture.md)
- **Dependencies:** None

### **[7_UI_UX_DESIGN-REQ-UI-DES-037]** Code Block Typography (Syntax Highlighting)
- **Type:** UX
- **Description:** - **[7_UI_UX_DESIGN-REQ-UI-DES-037-1] Font Weight Alignment**: Code blocks in logs SHOULD use a slightly heavier weight (`450` or `500`) than the standard editor to ensure legibility during real-time streaming against the dark terminal background.
- **Source:** UI/UX Design (specs/7_ui_ux_design.md)
- **Dependencies:** None

### **[7_UI_UX_DESIGN-REQ-UI-DES-062-1]** Compact Mode (< 80 chars)
- **Type:** UX
- **Description:** The layout switches to a single vertical stack. The Roadmap is hidden in favor of a `[Current Task ID]` breadcrumb in the header.
- **Source:** UI/UX Design (specs/7_ui_ux_design.md)
- **Dependencies:** None

### **[7_UI_UX_DESIGN-REQ-UI-DES-100]** Context-Aware Injection
- **Type:** UX
- **Description:** - **[7_UI_UX_DESIGN-REQ-UI-DES-100-1] Trigger**: `Cmd+K` (macOS) or `Ctrl+K` (Windows).
- **Source:** UI/UX Design (specs/7_ui_ux_design.md)
- **Dependencies:** None

### **[7_UI_UX_DESIGN-REQ-UI-DES-130]** Contextual Guidance Display
- **Type:** UX
- **Description:** - **[7_UI_UX_DESIGN-REQ-UI-DES-130-1] Module Hover**: In the `src/` view, hovering a file name MUST show a summary of its `.agent.md` documentation (Intent, Hooks, Test Strategy).
- **Source:** UI/UX Design (specs/7_ui_ux_design.md)
- **Dependencies:** None

### **[7_UI_UX_DESIGN-REQ-UI-DES-084-1]** Contrast Enforcement
- **Type:** UX
- **Description:** All text-to-background ratios MUST exceed 4.5:1. In High Contrast themes, this MUST increase to 7:1 for all primary actions.
- **Source:** UI/UX Design (specs/7_ui_ux_design.md)
- **Dependencies:** None

### **[7_UI_UX_DESIGN-REQ-UI-DES-083-1]** DAG Semantic Zooming
- **Type:** UX
- **Description:** - **[7_UI_UX_DESIGN-REQ-UI-DES-083-1-1] LOD-3 (Close)**: Full node details, requirement tags, and agent status icons.   - **[7_UI_UX_DESIGN-REQ-UI-DES-083-1-2] LOD-2 (Mid)**: Task titles only; icons are simplified to status dots. Edges (lines) are thinned to 0.5px.   - **[7_UI_UX_DESIGN-REQ-UI-DES-083-1-3] LOD-1 (Far)**: Individual tasks are hidden; only Epic bounding boxes with progress percentages are rendered.
- **Source:** UI/UX Design (specs/7_ui_ux_design.md)
- **Dependencies:** None

### **[7_UI_UX_DESIGN-REQ-UI-DES-090]** Dashboard Layout
- **Type:** UX
- **Description:** The initial landing state after `devs init`.
- **Source:** UI/UX Design (specs/7_ui_ux_design.md)
- **Dependencies:** None

### **[7_UI_UX_DESIGN-REQ-UI-DES-049]** Depth Perception
- **Type:** UX
- **Description:** Layering MUST reflect the SoT hierarchy [7_UI_UX_DESIGN-REQ-UI-DES-002].
- **Source:** UI/UX Design (specs/7_ui_ux_design.md)
- **Dependencies:** None

### **[7_UI_UX_DESIGN-REQ-UI-DES-003]** Deterministic Layout & Telemetry Anchors
- **Type:** UX
- **Description:** Components MUST maintain fixed, immutable anchors for critical project telemetry. Users should never have to search for the "Active Task," "Current Phase," or "Cumulative USD Spend."
- **Source:** UI/UX Design (specs/7_ui_ux_design.md)
- **Dependencies:** None

### **[7_UI_UX_DESIGN-REQ-UI-DES-101-1]** Diff View
- **Type:** UX
- **Description:** When an agent proposes a TAS change mid-implementation, the approval modal MUST show a side-by-side diff of the Markdown spec.
- **Source:** UI/UX Design (specs/7_ui_ux_design.md)
- **Dependencies:** None

### **[7_UI_UX_DESIGN-REQ-UI-DES-054]** Directive Injection Feedback (The "Whisper" Confirmation)
- **Type:** UX
- **Description:** - **[7_UI_UX_DESIGN-REQ-UI-DES-054-1] Visual**: On submission of a directive, a transient success badge (`Directive Injected`) MUST slide in from the top-right of the Console View (+20px Y-offset).
- **Source:** UI/UX Design (specs/7_ui_ux_design.md)
- **Dependencies:** None

### **[7_UI_UX_DESIGN-REQ-UI-DES-085-1]** Disable sliding animations
- **Type:** UX
- **Description:** Disable all `ThoughtStream` sliding animations.
- **Source:** UI/UX Design (specs/7_ui_ux_design.md)
- **Dependencies:** None

### **[7_UI_UX_DESIGN-REQ-UI-DES-059-2]** Disabling Motion
- **Type:** UX
- **Description:** The UI MUST respect the `prefers-reduced-motion` media query, replacing all transforms and pulses with static state-indicators (e.g., solid color changes).
- **Source:** UI/UX Design (specs/7_ui_ux_design.md)
- **Dependencies:** None

### **[6_UI_UX_ARCH-REQ-098]** Disconnected State
- **Type:** UX
- **Description:** Overlay "Reconnecting..." modal and disable interaction if MCP connection drops.
- **Source:** UI/UX Architecture (specs/6_ui_ux_architecture.md)
- **Dependencies:** [6_UI_UX_ARCH-REQ-049]

### **[7_UI_UX_DESIGN-REQ-UI-DES-057-3]** Duration
- **Type:** UX
- **Description:** 800ms total, staggered by 50ms per requirement to create a "Waterfall" effect.
- **Source:** UI/UX Design (specs/7_ui_ux_design.md)
- **Dependencies:** None

### **[7_UI_UX_DESIGN-REQ-UI-DES-090-1]** Epic Progress Radial
- **Type:** UX
- **Description:** A large, circular visualization showing the percentage completion of requirements across all 8-16 epics.
- **Source:** UI/UX Design (specs/7_ui_ux_design.md)
- **Dependencies:** None

### **[6_UI_UX_ARCH-REQ-028]** Error Resilience
- **Type:** UX
- **Description:** If Mermaid parsing fails, MermaidHost MUST display the raw code block with a Syntax Error warning and an "Edit" shortcut.
- **Source:** UI/UX Architecture (specs/6_ui_ux_architecture.md)
- **Dependencies:** [6_UI_UX_ARCH-REQ-026]

### **[7_UI_UX_DESIGN-REQ-UI-DES-093-3]** Filtering Bar
- **Type:** UX
- **Description:** Fast search by Task ID, Title, or associated Requirement ID.
- **Source:** UI/UX Design (specs/7_ui_ux_design.md)
- **Dependencies:** None

### **[7_UI_UX_DESIGN-REQ-UI-DES-003-1]** Fixed Zones
- **Type:** UX
- **Description:** The top-right quadrant is reserved for "System Health" (Token budgets, Rate limits). The left sidebar is reserved for "Context & Navigation" (Epic Roadmap).
- **Source:** UI/UX Design (specs/7_ui_ux_design.md)
- **Dependencies:** None

### **[7_UI_UX_DESIGN-REQ-UI-DES-068]** Flicker-Free Rendering (Memoization)
- **Type:** UX
- **Description:** - **[7_UI_UX_DESIGN-REQ-UI-DES-068-1] State Optimization**: High-frequency streaming (Thoughts) MUST utilize `React.memo` and partial updates. Only the `LogTerminal` component should re-render on character-level data arrivals.
- **Source:** UI/UX Design (specs/7_ui_ux_design.md)
- **Dependencies:** None

### **[6_UI_UX_ARCH-REQ-024]** Focus Interaction
- **Type:** UX
- **Description:** Clicking a node in DAGCanvas focuses the TaskDetailCard and syncs the ConsoleView to that task's history.
- **Source:** UI/UX Architecture (specs/6_ui_ux_architecture.md)
- **Dependencies:** [6_UI_UX_ARCH-REQ-020]

### **[7_UI_UX_DESIGN-REQ-UI-DES-067]** Focus Management (Ink-Focus)
- **Type:** UX
- **Description:** The TUI MUST maintain a clear "Active Focus" state. The focused zone (e.g., the Roadmap) MUST exhibit a double-line border (`║`) while inactive zones use single-line borders (`│`).
- **Source:** UI/UX Design (specs/7_ui_ux_design.md)
- **Dependencies:** None

### **[7_UI_UX_DESIGN-REQ-UI-DES-036]** Font Loading & Anti-Aliasing
- **Type:** UX
- **Description:** - **[7_UI_UX_DESIGN-REQ-UI-DES-036-1] Subpixel Rendering**: Components MUST use `-webkit-font-smoothing: antialiased` to ensure crisp text in the Webview, especially when using light weights on dark backgrounds.
- **Source:** UI/UX Design (specs/7_ui_ux_design.md)
- **Dependencies:** None

### **[6_UI_UX_ARCH-REQ-076]** Font Stack Hierarchy
- **Type:** UX
- **Description:** UI inherits VSCode workbench font; agent thoughts use serif font; terminal/code logs inherit user's editor font.
- **Source:** UI/UX Architecture (specs/6_ui_ux_architecture.md)
- **Dependencies:** None

### **[7_UI_UX_DESIGN-REQ-UI-DES-141]** Forced Contrast Mode
- **Type:** UX
- **Description:** In VSCode High Contrast themes, all alpha-blended backgrounds (`--devs-bg-thought`) revert to solid background colors with high-contrast borders to ensure WCAG 2.1 compliance.
- **Source:** UI/UX Design (specs/7_ui_ux_design.md)
- **Dependencies:** None

### **[7_UI_UX_DESIGN-REQ-UI-DES-006-1]** Functional Motion
- **Type:** UX
- **Description:** Permitted for showing the "Flow of Data" (e.g., a document "distilling" into requirements) or "System Pulsing" (indicating active agent thinking).
- **Source:** UI/UX Design (specs/7_ui_ux_design.md)
- **Dependencies:** None

### **[7_UI_UX_DESIGN-REQ-UI-DES-053]** Gated Autonomy Highlighting (The "Attention" Pulse)
- **Type:** UX
- **Description:** When the orchestrator hits a mandatory approval gate (Phase 2, Phase 3, or Task Failure), the UI MUST guide the user to the resolution point.
- **Source:** UI/UX Design (specs/7_ui_ux_design.md)
- **Dependencies:** None

### **[7_UI_UX_DESIGN-REQ-UI-DES-092]** Gated Spec Review
- **Type:** UX
- **Description:** The interface for Phase 2 human-in-the-loop approvals.
- **Source:** UI/UX Design (specs/7_ui_ux_design.md)
- **Dependencies:** None

### **[7_UI_UX_DESIGN-REQ-UI-DES-039-2]** High Contrast Contrast
- **Type:** UX
- **Description:** In HC themes, font weights for H2 and H3 MUST increase by one step (e.g., `600` to `700`) to ensure structural clarity against the stark background.
- **Source:** UI/UX Design (specs/7_ui_ux_design.md)
- **Dependencies:** None

### **[7_UI_UX_DESIGN-REQ-UI-DES-025]** High-Contrast (HC) Mode Overrides
- **Type:** UX
- **Description:** When a VSCode High Contrast theme is active (`.vscode-high-contrast` class present), the following overrides are mandatory:
- **Source:** UI/UX Design (specs/7_ui_ux_design.md)
- **Dependencies:** None

### **[7_UI_UX_DESIGN-REQ-UI-DES-084]** High-Contrast (HC) Resilience
- **Type:** UX
- **Description:** The UI MUST strictly adhere to WCAG 2.1 AA standards.
- **Source:** UI/UX Design (specs/7_ui_ux_design.md)
- **Dependencies:** None

### **[7_UI_UX_DESIGN-REQ-UI-DES-094]** High-Density Development Hub
- **Type:** UX
- **Description:** The active view during Phase 4.
- **Source:** UI/UX Design (specs/7_ui_ux_design.md)
- **Dependencies:** None

### **[7_UI_UX_DESIGN-REQ-UI-DES-004]** High-Density Signal-to-Noise Ratio
- **Type:** UX
- **Description:** 'devs' prioritizes a high data-to-pixel ratio over whitespace-heavy "minimalist" designs.
- **Source:** UI/UX Design (specs/7_ui_ux_design.md)
- **Dependencies:** None

### **[7_UI_UX_DESIGN-REQ-UI-DES-034-2]** Human Directives (Directives)
- **Type:** UX
- **Description:** MUST be rendered in **Bold System UI** with a specific accent color (`--devs-primary`). This signals human authority and priority.
- **Source:** UI/UX Design (specs/7_ui_ux_design.md)
- **Dependencies:** None

### **[7_UI_UX_DESIGN-REQ-UI-DES-057-2]** Implementation
- **Type:** UX
- **Description:** Particle-based animation where text fragments transform into requirement badges.
- **Source:** UI/UX Design (specs/7_ui_ux_design.md)
- **Dependencies:** None

### **[7_UI_UX_DESIGN-REQ-UI-DES-065-2]** Indentation Hierarchy
- **Type:** UX
- **Description:** Nested tool calls (Reviewer checking Developer) are indented by `$spacing-sm` (2 spaces) and use dotted vertical lines (`┆`).
- **Source:** UI/UX Design (specs/7_ui_ux_design.md)
- **Dependencies:** None

### **[7_UI_UX_DESIGN-REQ-UI-DES-049-3]** Information Density Scaling
- **Type:** UX
- **Description:** If the task count in the DAG exceeds 100, the spacing between nodes reduces from `$spacing-md` to `$spacing-sm` to maintain a global view.
- **Source:** UI/UX Design (specs/7_ui_ux_design.md)
- **Dependencies:** None

### **[7_UI_UX_DESIGN-REQ-UI-DES-110]** Interactive Blueprint Rendering
- **Type:** UX
- **Description:** - **[7_UI_UX_DESIGN-REQ-UI-DES-110-1] Auto-Sync**: Diagrams re-render within 200ms of a file save.
- **Source:** UI/UX Design (specs/7_ui_ux_design.md)
- **Dependencies:** None

### **[7_UI_UX_DESIGN-REQ-UI-DES-048]** Interactive Target Sizes
- **Type:** UX
- **Description:** - **[7_UI_UX_DESIGN-REQ-UI-DES-048-1] Min Target**: `24px` x `24px` (Optimized for mouse/trackpad precision in VSCode).
- **Source:** UI/UX Design (specs/7_ui_ux_design.md)
- **Dependencies:** None

### **[7_UI_UX_DESIGN-REQ-UI-DES-046-2]** Internal Padding
- **Type:** UX
- **Description:** `$spacing-sm` (`8px`).
- **Source:** UI/UX Design (specs/7_ui_ux_design.md)
- **Dependencies:** None

### **[6_UI_UX_ARCH-REQ-100]** Keyboard Navigation
- **Type:** UX
- **Description:** Every task card and roadmap node MUST be focusable and operable via Enter/Space keys.
- **Source:** UI/UX Architecture (specs/6_ui_ux_architecture.md)
- **Dependencies:** None

### **[7_UI_UX_DESIGN-REQ-UI-DES-066]** Keyboard-First Navigation (Hotkeys)
- **Type:** UX
- **Description:** - **[7_UI_UX_DESIGN-REQ-UI-DES-066-1] Global Actions**: `P` (Pause/Resume), `R` (Rewind Menu), `H` (Help/Keymap).
- **Source:** UI/UX Design (specs/7_ui_ux_design.md)
- **Dependencies:** None

### **[7_UI_UX_DESIGN-REQ-UI-DES-083-1-2]** LOD-2 (Mid)
- **Type:** UX
- **Description:** Task titles only; icons are simplified to status dots. Edges (lines) are thinned to 0.5px.   - **[7_UI_UX_DESIGN-REQ-UI-DES-083-1-3] LOD-1 (Far)**: Individual tasks are hidden; only Epic bounding boxes with progress percentages are rendered.
- **Source:** UI/UX Design (specs/7_ui_ux_design.md)
- **Dependencies:** None

### **[7_UI_UX_DESIGN-REQ-UI-DES-083-1-1]** LOD-3 (Close)
- **Type:** UX
- **Description:** Full node details, requirement tags, and agent status icons.   - **[7_UI_UX_DESIGN-REQ-UI-DES-083-1-2] LOD-2 (Mid)**: Task titles only; icons are simplified to status dots. Edges (lines) are thinned to 0.5px.   - **[7_UI_UX_DESIGN-REQ-UI-DES-083-1-3] LOD-1 (Far)**: Individual tasks are hidden; only Epic bounding boxes with progress percentages are rendered.
- **Source:** UI/UX Design (specs/7_ui_ux_design.md)
- **Dependencies:** None

### **[7_UI_UX_DESIGN-REQ-UI-DES-093]** Large-Scale Graph Navigation
- **Type:** UX
- **Description:** - **[7_UI_UX_DESIGN-REQ-UI-DES-093-1] Clustering**: Tasks are visually grouped into Epic bounding boxes (light grey background).
- **Source:** UI/UX Design (specs/7_ui_ux_design.md)
- **Dependencies:** None

### **[7_UI_UX_DESIGN-REQ-UI-DES-049-Z0]** Level 0 (Base)
- **Type:** UX
- **Description:** Workspace, Dashboard tiles, Background logs. `z-index: 0`.
- **Source:** UI/UX Design (specs/7_ui_ux_design.md)
- **Dependencies:** None

### **[7_UI_UX_DESIGN-REQ-UI-DES-049-Z1]** Level 1 (Navigation)
- **Type:** UX
- **Description:** Sticky headers, Sidebar nav, Fixed phase-stepper. `z-index: 100`.
- **Source:** UI/UX Design (specs/7_ui_ux_design.md)
- **Dependencies:** None

### **[7_UI_UX_DESIGN-REQ-UI-DES-049-Z2]** Level 2 (Overlays)
- **Type:** UX
- **Description:** Tooltip previews, "Whisper" field (active), Tool call expansion. `z-index: 200`.
- **Source:** UI/UX Design (specs/7_ui_ux_design.md)
- **Dependencies:** None

### **[7_UI_UX_DESIGN-REQ-UI-DES-049-Z3]** Level 3 (Modals)
- **Type:** UX
- **Description:** HITL Approval gates, Diff reviewers, Strategy pivot analysis. `z-index: 300`.
- **Source:** UI/UX Design (specs/7_ui_ux_design.md)
- **Dependencies:** None

### **[7_UI_UX_DESIGN-REQ-UI-DES-083]** Level-of-Detail (LOD) Scaling
- **Type:** UX
- **Description:** To prevent "Telemetry Noise," the UI MUST dynamically adjust the resolution of information based on the visual "Zoom Level" or "Container Size."
- **Source:** UI/UX Design (specs/7_ui_ux_design.md)
- **Dependencies:** None

### **[7_UI_UX_DESIGN-REQ-UI-DES-037-2]** Ligatures
- **Type:** UX
- **Description:** If the user has enabled font ligatures in VSCode, they MUST be supported in the 'devs' code previews via `font-variant-ligatures: contextual;`.
- **Source:** UI/UX Design (specs/7_ui_ux_design.md)
- **Dependencies:** None

### **[7_UI_UX_DESIGN-REQ-UI-DES-035]** Line Height & Readability Metrics
- **Type:** UX
- **Description:** - **[7_UI_UX_DESIGN-REQ-UI-DES-035-1] Narrative Blocks (Thoughts)**: `line-height: 1.6`. High vertical rhythm to facilitate scanning long chains of thought.
- **Source:** UI/UX Design (specs/7_ui_ux_design.md)
- **Dependencies:** None

### **[7_UI_UX_DESIGN-REQ-UI-DES-083-2]** Log Truncation & Summarization
- **Type:** UX
- **Description:** - **[7_UI_UX_DESIGN-REQ-UI-DES-083-2-1] Narrow mode**: In **Narrow** mode, SAOP observations (raw logs) are hidden behind a "View Log" button to prevent vertical bloat. Only the "Reasoning Chain" (Thoughts) is streamed by default.   - **[7_UI_UX_DESIGN-REQ-UI-DES-083-2-2] Wide mode**: In **Wide** mode, the UI displays a side-by-side "Thought vs. Action" view.
- **Source:** UI/UX Design (specs/7_ui_ux_design.md)
- **Dependencies:** None

### **[7_UI_UX_DESIGN-REQ-UI-DES-006]** Meaningful & Non-Decorated Motion
- **Type:** UX
- **Description:** Animations are strictly prohibited if they do not serve a functional state-transition purpose.
- **Source:** UI/UX Design (specs/7_ui_ux_design.md)
- **Dependencies:** None

### **[7_UI_UX_DESIGN-REQ-UI-DES-130-1]** Module Hover
- **Type:** UX
- **Description:** In the `src/` view, hovering a file name MUST show a summary of its `.agent.md` documentation (Intent, Hooks, Test Strategy).
- **Source:** UI/UX Design (specs/7_ui_ux_design.md)
- **Dependencies:** None

### **[6_UI_UX_ARCH-REQ-053]** Multi-Pane Architecture
- **Type:** UX
- **Description:** Support for a split-pane layout where Sidebar remains persistent while MainViewport transitions between views.
- **Source:** UI/UX Architecture (specs/6_ui_ux_architecture.md)
- **Dependencies:** None

### **[7_UI_UX_DESIGN-REQ-UI-DES-091]** Multi-Pane Discovery
- **Type:** UX
- **Description:** Specialized view for Phase 1 results.
- **Source:** UI/UX Design (specs/7_ui_ux_design.md)
- **Dependencies:** None

### **[7_UI_UX_DESIGN-REQ-UI-DES-070-2]** Multi-Select
- **Type:** UX
- **Description:** Use `ink-select-input` for requirement sign-offs, allowing users to toggle checkboxes using `Space`.
- **Source:** UI/UX Design (specs/7_ui_ux_design.md)
- **Dependencies:** None

### **[7_UI_UX_DESIGN-REQ-UI-DES-083-2-1]** Narrow mode
- **Type:** UX
- **Description:** In **Narrow** mode, SAOP observations (raw logs) are hidden behind a "View Log" button to prevent vertical bloat. Only the "Reasoning Chain" (Thoughts) is streamed by default.   - **[7_UI_UX_DESIGN-REQ-UI-DES-083-2-2] Wide mode**: In **Wide** mode, the UI displays a side-by-side "Thought vs. Action" view.
- **Source:** UI/UX Design (specs/7_ui_ux_design.md)
- **Dependencies:** None

### **[7_UI_UX_DESIGN-REQ-UI-DES-055]** Node Interaction & Focus States
- **Type:** UX
- **Description:** - **[7_UI_UX_DESIGN-REQ-UI-DES-055-1] Hover Elevation**: Hovering a task node triggers a `scale(1.05)` transform and an increased shadow depth (`shadow-md`) to separate it from the graph background.
- **Source:** UI/UX Design (specs/7_ui_ux_design.md)
- **Dependencies:** None

### **[6_UI_UX_ARCH-REQ-022]** Node States
- **Type:** UX
- **Description:** DAGCanvas MUST support PENDING, RUNNING, SUCCESS, FAILED, and PAUSED states with specific visual cues.
- **Source:** UI/UX Architecture (specs/6_ui_ux_architecture.md)
- **Dependencies:** [6_UI_UX_ARCH-REQ-020]

### **[7_UI_UX_DESIGN-REQ-UI-DES-110-2]** Pan/Zoom Controls
- **Type:** UX
- **Description:** Floating toolbar on every diagram for "Reset View" and "Export to SVG".
- **Source:** UI/UX Design (specs/7_ui_ux_design.md)
- **Dependencies:** None

### **[7_UI_UX_DESIGN-REQ-UI-DES-086]** Persistence & Recovery UX
- **Type:** UX
- **Description:** - **[7_UI_UX_DESIGN-REQ-UI-DES-086-1] Skeleton Shimmer Logic**: During initial project hydration (Tier 2 sync), the UI MUST render skeleton loaders for all Dashboard tiles and the Roadmap DAG. The shimmer effect MUST use a `linear-gradient` derived from `--vscode-editor-lineHighlightBackground`.
- **Source:** UI/UX Design (specs/7_ui_ux_design.md)
- **Dependencies:** None

### **[7_UI_UX_DESIGN-REQ-UI-DES-090-4]** Phase Stepper
- **Type:** UX
- **Description:** A horizontal indicator at the top showing the transition from Research -> Design -> Distill -> Implement -> Validate.
- **Source:** UI/UX Design (specs/7_ui_ux_design.md)
- **Dependencies:** None

### **[7_UI_UX_DESIGN-REQ-UI-DES-005]** Platform-Native "Ghost" Integration
- **Type:** UX
- **Description:** The UI must feel like an extension of VSCode itself, not an external web application hosted in a frame.
- **Source:** UI/UX Design (specs/7_ui_ux_design.md)
- **Dependencies:** None

### **[7_UI_UX_DESIGN-REQ-UI-DES-046-4]** Port Spacing
- **Type:** UX
- **Description:** Input (Left) and Output (Right) ports are vertically centered.
- **Source:** UI/UX Design (specs/7_ui_ux_design.md)
- **Dependencies:** None

### **[6_UI_UX_ARCH-REQ-091]** Priority Feedback
- **Type:** UX
- **Description:** Visual confirmation (badge) when the agent acknowledges a directive in the thought stream.
- **Source:** UI/UX Architecture (specs/6_ui_ux_architecture.md)
- **Dependencies:** [6_UI_UX_ARCH-REQ-089]

### **[7_UI_UX_DESIGN-REQ-UI-DES-039]** Readability Edge Cases
- **Type:** UX
- **Description:** - **[7_UI_UX_DESIGN-REQ-UI-DES-039-1] Variable Font Size**: The UI MUST respect the `window.zoomLevel` and `editor.fontSize` settings from VSCode, scaling the entire typography system proportionally.
- **Source:** UI/UX Design (specs/7_ui_ux_design.md)
- **Dependencies:** None

### **[7_UI_UX_DESIGN-REQ-UI-DES-085]** Reduced Motion Optimization
- **Type:** UX
- **Description:** If the host OS has "Reduced Motion" enabled (`prefers-reduced-motion: reduce`), the UI MUST:
- **Source:** UI/UX Design (specs/7_ui_ux_design.md)
- **Dependencies:** None

### **[7_UI_UX_DESIGN-REQ-UI-DES-092-2]** Requirement Highlighting
- **Type:** UX
- **Description:** Hovering over a requirement in the PRD MUST highlight the corresponding data model in the TAS ERD.
- **Source:** UI/UX Design (specs/7_ui_ux_design.md)
- **Dependencies:** None

### **[6_UI_UX_ARCH-REQ-019]** Requirement Mapping
- **Type:** UX
- **Description:** Thoughts mentioning a REQ-ID SHOULD be decorated with a hoverable badge linking back to the PRD.
- **Source:** UI/UX Architecture (specs/6_ui_ux_architecture.md)
- **Dependencies:** [6_UI_UX_ARCH-REQ-015]

### **[7_UI_UX_DESIGN-REQ-UI-DES-027-2]** Reviewer
- **Type:** UX
- **Description:** `--vscode-symbolIcon-variableForeground` (Orange/Amber).
- **Source:** UI/UX Design (specs/7_ui_ux_design.md)
- **Dependencies:** None

### **[7_UI_UX_DESIGN-REQ-UI-DES-101-2]** Risk Indicator
- **Type:** UX
- **Description:** Color-coded badges (Low, Med, High) based on how many downstream tasks are affected by the change.
- **Source:** UI/UX Design (specs/7_ui_ux_design.md)
- **Dependencies:** None

### **[7_UI_UX_DESIGN-REQ-UI-DES-094-3]** Sandbox Terminal (Bottom)
- **Type:** UX
- **Description:** A monospaced terminal view (`xterm.js`) showing the real-time stdout/stderr of the active test execution.
- **Source:** UI/UX Design (specs/7_ui_ux_design.md)
- **Dependencies:** None

### **[6_UI_UX_ARCH-REQ-099]** Screen Reader ARIA-Live
- **Type:** UX
- **Description:** Use aria-live="polite" for ThoughtStream to announce new agent thoughts.
- **Source:** UI/UX Architecture (specs/6_ui_ux_architecture.md)
- **Dependencies:** [6_UI_UX_ARCH-REQ-015]

### **[7_UI_UX_DESIGN-REQ-UI-DES-068-2]** Scrollback Buffer
- **Type:** UX
- **Description:** The TUI MUST maintain a virtualized scrollback buffer of the last 1000 lines. Use of `Static` components from Ink for historical logs to minimize the reconciliation load.
- **Source:** UI/UX Design (specs/7_ui_ux_design.md)
- **Dependencies:** None

### **[7_UI_UX_DESIGN-REQ-UI-DES-049-4]** Scrollbar Metrics
- **Type:** UX
- **Description:** Scrollbars MUST be slim (`8px` width) with a `4px` radius thumb, utilizing `--vscode-scrollbarSlider-background` to minimize visual noise in high-density views.
- **Source:** UI/UX Design (specs/7_ui_ux_design.md)
- **Dependencies:** None

### **[7_UI_UX_DESIGN-REQ-UI-DES-053-2]** Secondary Indicator
- **Type:** UX
- **Description:** The Sidebar's "Phase Stepper" icon for the current phase MUST pulse amber.
- **Source:** UI/UX Design (specs/7_ui_ux_design.md)
- **Dependencies:** None

### **[7_UI_UX_DESIGN-REQ-UI-DES-055-2]** Selection Anchor
- **Type:** UX
- **Description:** Clicking a node applies a persistent `3px solid var(--devs-primary)` border and centers the node in the viewport using a smooth `d3-zoom` transition (500ms).
- **Source:** UI/UX Design (specs/7_ui_ux_design.md)
- **Dependencies:** None

### **[7_UI_UX_DESIGN-REQ-UI-DES-140]** Semantic Annunciations
- **Type:** UX
- **Description:** - **[7_UI_UX_DESIGN-REQ-UI-DES-140-1] Aria-Live**: New agent thoughts MUST be announced as "Polite" updates.
- **Source:** UI/UX Design (specs/7_ui_ux_design.md)
- **Dependencies:** None

### **[6_UI_UX_ARCH-REQ-083]** Semantic Differentiators
- **Type:** UX
- **Description:** Distinct rendering for Thoughts (serif/italic), Actions (Action Cards), and Observations (terminal-themed blocks with redaction).
- **Source:** UI/UX Architecture (specs/6_ui_ux_architecture.md)
- **Dependencies:** None

### **[7_UI_UX_DESIGN-REQ-UI-DES-047-3]** Shadows
- **Type:** UX
- **Description:** Only used for elevated states (Modals, Overlays).    - **[7_UI_UX_DESIGN-REQ-UI-DES-047-3-1] shadow-sm**: `0 2px 4px rgba(0,0,0,0.15)`   - **[7_UI_UX_DESIGN-REQ-UI-DES-047-3-2] shadow-md**: `0 8px 24px rgba(0,0,0,0.30)`
- **Source:** UI/UX Design (specs/7_ui_ux_design.md)
- **Dependencies:** None

### **[7_UI_UX_DESIGN-REQ-UI-DES-049-2]** Sidebar Collapse
- **Type:** UX
- **Description:** When the Left Sidebar is collapsed (< 80px), it MUST transform into a "Ghost Rail" showing only Epic icons and requirement fulfillment badges.
- **Source:** UI/UX Design (specs/7_ui_ux_design.md)
- **Dependencies:** None

### **[7_UI_UX_DESIGN-REQ-UI-DES-086-1]** Skeleton Shimmer Logic
- **Type:** UX
- **Description:** During initial project hydration (Tier 2 sync), the UI MUST render skeleton loaders for all Dashboard tiles and the Roadmap DAG. The shimmer effect MUST use a `linear-gradient` derived from `--vscode-editor-lineHighlightBackground`.
- **Source:** UI/UX Design (specs/7_ui_ux_design.md)
- **Dependencies:** None

### **[7_UI_UX_DESIGN-REQ-UI-DES-004-1]** Sparklines & Indicators
- **Type:** UX
- **Description:** Use micro-visualizations (sparklines) for resource consumption and status dots for requirement fulfillment.
- **Source:** UI/UX Design (specs/7_ui_ux_design.md)
- **Dependencies:** None

### **[7_UI_UX_DESIGN-REQ-UI-DES-062-2]** Standard Mode (80-120 chars)
- **Type:** UX
- **Description:** Sidebar (Epic List) occupies `25%` width; Main implementation view occupies `75%`.
- **Source:** UI/UX Design (specs/7_ui_ux_design.md)
- **Dependencies:** None

### **[6_UI_UX_ARCH-REQ-086]** State Delta Highlighting
- **Type:** UX
- **Description:** Offer a "Diff View" showing exactly which files were modified by an implementation turn.
- **Source:** UI/UX Architecture (specs/6_ui_ux_architecture.md)
- **Dependencies:** None

### **[6_UI_UX_ARCH-REQ-017]** Styling
- **Type:** UX
- **Description:** ThoughtStreamer uses distinctive typography (serif/italic) to separate "Internal Thought" from "External Output".
- **Source:** UI/UX Architecture (specs/6_ui_ux_architecture.md)
- **Dependencies:** [6_UI_UX_ARCH-REQ-015]

### **[7_UI_UX_DESIGN-REQ-UI-DES-036-1]** Subpixel Rendering
- **Type:** UX
- **Description:** Components MUST use `-webkit-font-smoothing: antialiased` to ensure crisp text in the Webview, especially when using light weights on dark backgrounds.
- **Source:** UI/UX Design (specs/7_ui_ux_design.md)
- **Dependencies:** None

### **[7_UI_UX_DESIGN-REQ-UI-DES-004-2]** Technical Conciseness
- **Type:** UX
- **Description:** Labels should be authoritative and brief (e.g., "REQ-ID: 402" instead of "Requirement Identifier 402").
- **Source:** UI/UX Design (specs/7_ui_ux_design.md)
- **Dependencies:** None

### **[7_UI_UX_DESIGN-REQ-UI-DES-008]** Technical Unknowns & Design Risks
- **Type:** UX
- **Description:** - **[7_UI_UX_DESIGN-REQ-UI-RISK-001] Risk**: Information density may lead to "Dashboard Fatigue" for non-architect users. *Mitigation*: Implementation of "LOD" (Level of Detail) toggles to collapse technical telemetry.
- **Source:** UI/UX Design (specs/7_ui_ux_design.md)
- **Dependencies:** None

### **[7_UI_UX_DESIGN-REQ-UI-DES-061]** Terminal Layout Zones
- **Type:** UX
- **Description:** In interactive mode (TTY), the interface is divided into persistent zones using Ink's Flexbox engine.
- **Source:** UI/UX Design (specs/7_ui_ux_design.md)
- **Dependencies:** None

### **[7_UI_UX_DESIGN-REQ-UI-DES-025-3]** Text Luminance
- **Type:** UX
- **Description:** All semantic text colors MUST be verified against a 7:1 contrast ratio (WCAG AAA).
- **Source:** UI/UX Design (specs/7_ui_ux_design.md)
- **Dependencies:** None

### **[7_UI_UX_DESIGN-REQ-UI-DES-007]** The "Agent-Ready" Visual Contract
- **Type:** UX
- **Description:** The design must be consistent and predictable to ensure that "Visual Reviewer" agents (using screenshot-to-text capabilities) can accurately parse the state of the UI. This requires high-contrast separators between different agentic threads.
- **Source:** UI/UX Design (specs/7_ui_ux_design.md)
- **Dependencies:** None

### **[7_UI_UX_DESIGN-REQ-UI-DES-120]** The "Glitch" State
- **Type:** UX
- **Description:** - **[7_UI_UX_DESIGN-REQ-UI-DES-120-1] Visual Feedback**: When entropy is detected (>3 repeating hashes), the active Thought Block header should pulse red and exhibit a subtle "shake" effect.
- **Source:** UI/UX Design (specs/7_ui_ux_design.md)
- **Dependencies:** None

### **[7_UI_UX_DESIGN-REQ-UI-DES-040]** The 4px Base Grid (Deterministic Spacing)
- **Type:** UX
- **Description:** 'devs' utilizes a 4px base increment for all spatial relationships. This ensures mathematical alignment and consistent density across different display scales. All margins, padding, and component dimensions MUST be multiples of 4px.
- **Source:** UI/UX Design (specs/7_ui_ux_design.md)
- **Dependencies:** None

### **[7_UI_UX_DESIGN-REQ-UI-DES-080]** The Adaptive Layout Engine
- **Type:** UX
- **Description:** The 'devs' UI utilizes a "Fluid-to-Linear" layout strategy. It must maintain technical authority across three primary environments: the VSCode Editor (Main Webview), the VSCode Sidebar (Narrow View), and the CLI TUI (Terminal).
- **Source:** UI/UX Design (specs/7_ui_ux_design.md)
- **Dependencies:** None

### **[7_UI_UX_DESIGN-REQ-UI-DES-057]** The Distillation Sweep (Phase 2 to 3)
- **Type:** UX
- **Description:** - **[7_UI_UX_DESIGN-REQ-UI-DES-057-1] Visual**: During requirement distillation, requirements MUST appear to "fly" from the TAS/PRD document preview into the Roadmap list.
- **Source:** UI/UX Design (specs/7_ui_ux_design.md)
- **Dependencies:** None

### **[7_UI_UX_DESIGN-REQ-UI-DES-001]** The Glass-Box Philosophy (Observability-Driven Design)
- **Type:** UX
- **Description:** The visual language of 'devs' is rooted in transparency, information density, and technical authority. It rejects the industry trend of "hiding complexity" in favor of exposing it through structured, auditable telemetry. The system must feel like a "High-Fidelity Flight Recorder" for software engineering—precise, data-rich, and natively integrated into the developer's environment. The core goal is to eliminate the "Magic Gap" where users lose track of agentic intent.
- **Source:** UI/UX Design (specs/7_ui_ux_design.md)
- **Dependencies:** None

### **[7_UI_UX_DESIGN-REQ-UI-DES-051]** The Reasoning Pulse (Thinking State)
- **Type:** UX
- **Description:** When an agent is actively generating a "Reasoning Chain," the UI MUST communicate "Live Activity" without causing distraction.
- **Source:** UI/UX Design (specs/7_ui_ux_design.md)
- **Dependencies:** None

### **[7_UI_UX_DESIGN-REQ-UI-DES-070]** The Terminal Diff Reviewer
- **Type:** UX
- **Description:** - **[7_UI_UX_DESIGN-REQ-UI-DES-070-1] Visual**: When approving a TAS/PRD change, the TUI MUST render a side-by-side or unified diff using standard `+` (Green) and `-` (Red) syntax.
- **Source:** UI/UX Design (specs/7_ui_ux_design.md)
- **Dependencies:** None

### **[6_UI_UX_ARCH-REQ-102]** Theme Contrast Logic
- **Type:** UX
- **Description:** Dynamically calculate foreground colors for diagrams to ensure WCAG 2.1 AA contrast ratios across themes.
- **Source:** UI/UX Architecture (specs/6_ui_ux_architecture.md)
- **Dependencies:** [6_UI_UX_ARCH-REQ-004]

### **[6_UI_UX_ARCH-REQ-029]** Theme Sync
- **Type:** UX
- **Description:** MermaidHost MUST listen to VSCode theme changes and re-initialize Mermaid with the appropriate configuration.
- **Source:** UI/UX Architecture (specs/6_ui_ux_architecture.md)
- **Dependencies:** [6_UI_UX_ARCH-REQ-026]

### **[6_UI_UX_ARCH-REQ-004]** Theme-Aware Styling
- **Type:** UX
- **Description:** The VSCode Extension MUST NOT hardcode colors. It MUST utilize the standard VSCode CSS variables to ensure perfect legibility across Dark, Light, and High-Contrast themes.
- **Source:** UI/UX Architecture (specs/6_ui_ux_architecture.md)
- **Dependencies:** None

### **[7_UI_UX_DESIGN-REQ-UI-DES-010]** Token Anchoring
- **Type:** UX
- **Description:** To ensure theme resilience, all semantic colors MUST be derived from or mapped to standard VSCode theme tokens. This prevents the "Flashlight Effect" (bright UI elements in dark themes) and ensures accessibility across 1,000+ community themes.
- **Source:** UI/UX Design (specs/7_ui_ux_design.md)
- **Dependencies:** None

### **[7_UI_UX_DESIGN-REQ-UI-DES-005-1]** Token Compliance
- **Type:** UX
- **Description:** Mandatory use of VSCode design tokens (`--vscode-*` variables) for all primary UI elements.
- **Source:** UI/UX Design (specs/7_ui_ux_design.md)
- **Dependencies:** None

### **[7_UI_UX_DESIGN-REQ-UI-DES-052]** Tool Execution Micro-Animations
- **Type:** UX
- **Description:** - **[7_UI_UX_DESIGN-REQ-UI-DES-052-1] Invocation Shimmer**: When a tool is called, the corresponding "Action Card" in the log MUST exhibit a one-time horizontal shimmer effect (linear-gradient sweep) to signify the handoff from reasoning to execution.
- **Source:** UI/UX Design (specs/7_ui_ux_design.md)
- **Dependencies:** None

### **[7_UI_UX_DESIGN-REQ-UI-DES-094-2]** Tool Log (Right Sidebar)
- **Type:** UX
- **Description:** A collapsed list of tool calls (`read_file`, `npm test`). Clicking expands the raw redacted output.
- **Source:** UI/UX Design (specs/7_ui_ux_design.md)
- **Dependencies:** None

### **[7_UI_UX_DESIGN-REQ-UI-DES-101]** Transactional Sign-off
- **Type:** UX
- **Description:** - **[7_UI_UX_DESIGN-REQ-UI-DES-101-1] Diff View**: When an agent proposes a TAS change mid-implementation, the approval modal MUST show a side-by-side diff of the Markdown spec.
- **Source:** UI/UX Design (specs/7_ui_ux_design.md)
- **Dependencies:** None

### **[7_UI_UX_DESIGN-REQ-UI-DES-063-1]** TrueColor (24-bit)
- **Type:** UX
- **Description:** Used by default if `chalk.level >= 3`. Maps hex codes directly from the VSCode Dark+ theme.
- **Source:** UI/UX Design (specs/7_ui_ux_design.md)
- **Dependencies:** None

### **[7_UI_UX_DESIGN-REQ-UI-DES-030]** Typography Philosophy (Semantic Separation)
- **Type:** UX
- **Description:** The typography in 'devs' is designed to create an immediate cognitive distinction between human input, agentic reasoning, and system output. By varying font families and scales, the UI communicates the "weight" and "source" of information without requiring explicit labels.
- **Source:** UI/UX Design (specs/7_ui_ux_design.md)
- **Dependencies:** None

### **[7_UI_UX_DESIGN-REQ-UI-DES-035-3]** UI Navigation
- **Type:** UX
- **Description:** `line-height: 1.2`. Compact for sidebar items and dashboard tiles.
- **Source:** UI/UX Design (specs/7_ui_ux_design.md)
- **Dependencies:** None

### **[7_UI_UX_DESIGN-REQ-UI-DES-049-1]** Ultra-Wide Support
- **Type:** UX
- **Description:** On viewports > 1920px, the Main Viewport MUST maintain a `max-width: 1200px` (centered) for PRD/TAS reading to maintain line-length legibility (~80 characters per line).
- **Source:** UI/UX Design (specs/7_ui_ux_design.md)
- **Dependencies:** None

### **[6_UI_UX_ARCH-REQ-073]** VSCode Codicons (Iconography)
- **Type:** UX
- **Description:** Use @vscode/codicons for standard icons to support theme-driven color inheritance.
- **Source:** UI/UX Architecture (specs/6_ui_ux_architecture.md)
- **Dependencies:** None

### **[6_UI_UX_ARCH-REQ-071]** VSCode Theme Variable Mapping
- **Type:** UX
- **Description:** Mandatory use of vscode-webview-ui-toolkit tokens or native VSCode variables; no hardcoded hex codes.
- **Source:** UI/UX Architecture (specs/6_ui_ux_architecture.md)
- **Dependencies:** None

### **[7_UI_UX_DESIGN-REQ-UI-DES-039-1]** Variable Font Size
- **Type:** UX
- **Description:** The UI MUST respect the `window.zoomLevel` and `editor.fontSize` settings from VSCode, scaling the entire typography system proportionally.
- **Source:** UI/UX Design (specs/7_ui_ux_design.md)
- **Dependencies:** None

### **[6_UI_UX_ARCH-REQ-065]** View State Restoration
- **Type:** UX
- **Description:** The router MUST cache transient states (e.g., pan/zoom) for each view and restore them when returning to the view.
- **Source:** UI/UX Architecture (specs/6_ui_ux_architecture.md)
- **Dependencies:** [6_UI_UX_ARCH-REQ-052]

### **[7_UI_UX_DESIGN-REQ-UI-DES-081]** Viewport Breakpoints (Logical Widths)
- **Type:** UX
- **Description:** The UI MUST adapt its multi-pane architecture based on the available width of the Webview container.
- **Source:** UI/UX Design (specs/7_ui_ux_design.md)
- **Dependencies:** None

### **[7_UI_UX_DESIGN-REQ-UI-DES-054-1]** Visual
- **Type:** UX
- **Description:** On submission of a directive, a transient success badge (`Directive Injected`) MUST slide in from the top-right of the Console View (+20px Y-offset).
- **Source:** UI/UX Design (specs/7_ui_ux_design.md)
- **Dependencies:** None

### **[7_UI_UX_DESIGN-REQ-UI-DES-057-1]** Visual
- **Type:** UX
- **Description:** During requirement distillation, requirements MUST appear to "fly" from the TAS/PRD document preview into the Roadmap list.
- **Source:** UI/UX Design (specs/7_ui_ux_design.md)
- **Dependencies:** None

### **[7_UI_UX_DESIGN-REQ-UI-DES-070-1]** Visual
- **Type:** UX
- **Description:** When approving a TAS/PRD change, the TUI MUST render a side-by-side or unified diff using standard `+` (Green) and `-` (Red) syntax.
- **Source:** UI/UX Design (specs/7_ui_ux_design.md)
- **Dependencies:** None

### **[7_UI_UX_DESIGN-REQ-UI-DES-002]** Visual Hierarchy of Agency (Source of Truth levels)
- **Type:** UX
- **Description:** To prevent cognitive overload, UI elements are prioritized based on their "Source of Truth" (SoT). This hierarchy determines z-index, contrast ratio, and font-weight:
- **Source:** UI/UX Design (specs/7_ui_ux_design.md)
- **Dependencies:** None

### **[7_UI_UX_DESIGN-REQ-UI-DES-036-2]** Webfont Strategy
- **Type:** UX
- **Description:** Serif fonts (e.g., Georgia) are treated as system-standard. If a user's OS lacks a quality serif, the UI MUST fallback to a generic `serif` to avoid the overhead of heavy font-face downloads within the VSCode extension.
- **Source:** UI/UX Design (specs/7_ui_ux_design.md)
- **Dependencies:** None

### **[7_UI_UX_DESIGN-REQ-UI-DES-062-3]** Wide Mode (> 120 chars)
- **Type:** UX
- **Description:** Tri-pane layout (Roadmap, Implementation, Documentation Preview).
- **Source:** UI/UX Design (specs/7_ui_ux_design.md)
- **Dependencies:** None

### **[7_UI_UX_DESIGN-REQ-UI-DES-083-2-2]** Wide mode
- **Type:** UX
- **Description:** In **Wide** mode, the UI displays a side-by-side "Thought vs. Action" view.
- **Source:** UI/UX Design (specs/7_ui_ux_design.md)
- **Dependencies:** None

### **[6_UI_UX_ARCH-REQ-023]** Zoom/Pan Interaction
- **Type:** UX
- **Description:** Mandatory for navigating 8-16 Epics in the DAGCanvas.
- **Source:** UI/UX Architecture (specs/6_ui_ux_architecture.md)
- **Dependencies:** [6_UI_UX_ARCH-REQ-020]

## **Block 8: Phase 5 - Full System Validation**

### **[TAS-053]** Phase 5: Full System Validation
- **Type:** Functional
- **Description:** Global Reviewer agent runs the entire test suite and verifies documentation density before project completion.
- **Source:** TAS (Technical Architecture Specification) (specs/2_tas.md)
- **Dependencies:** [TAS-052]

### **[9_ROADMAP-REQ-MET-001]** **[9_ROADMAP-REQ-MET-003]** **[9_ROADMAP-REQ-PLAN-001]** **[9_ROADMAP-REQ-PLAN-002]** **[9_ROADMAP-REQ-RES-001]** **[9_ROADMAP-REQ-RES-002]** **[9_ROADMAP-REQ-RES-003]** **[9_ROADMAP-REQ-RES-004]** **[9_ROADMAP-REQ-SYS-004]** **[9_ROADMAP-REQ-UI-003]** Technical Requirements
- **Type:** Functional
- **Description:** Technical Requirements: , , , .
- **Source:** Project Roadmap (specs/9_project_roadmap.md)
- **Dependencies:** None

### **[9_ROADMAP-TAS-802]** Build the Project MCP Server template for generated codebases.
- **Type:** Technical
- **Description:** Build the Project MCP Server template for generated codebases.
- **Source:** Project Roadmap (specs/9_project_roadmap.md)
- **Dependencies:** None

### **[9_ROADMAP-TAS-805]** Create "Agent-Ready" project templates (Next.js, FastAPI, Go).
- **Type:** Technical
- **Description:** Create "Agent-Ready" project templates (Next.js, FastAPI, Go).
- **Source:** Project Roadmap (specs/9_project_roadmap.md)
- **Dependencies:** None

### **[9_ROADMAP-TAS-803]** Develop the Benchmarking Suite (TAR, TTFC, RTI, and USD/Task metrics).
- **Type:** Technical
- **Description:** Develop the Benchmarking Suite (TAR, TTFC, RTI, and USD/Task metrics).
- **Source:** Project Roadmap (specs/9_project_roadmap.md)
- **Dependencies:** None

### **[9_ROADMAP-TAS-801]** Implement "Global Validation" phase for full project requirement audit.
- **Type:** Technical
- **Description:** Implement "Global Validation" phase for full project requirement audit.
- **Source:** Project Roadmap (specs/9_project_roadmap.md)
- **Dependencies:** None

### **[9_ROADMAP-PHASE-008]** Phase 8
- **Type:** Technical
- **Description:** Phase 8: Validation, Self-Hosting & Optimization
- **Source:** Project Roadmap (specs/9_project_roadmap.md)
- **Dependencies:** None

### **[9_ROADMAP-TAS-804]** Project Self-Host
- **Type:** Technical
- **Description:** Project Self-Host: Use 'devs' to implement new 'devs' features (The Maker Journey).
- **Source:** Project Roadmap (specs/9_project_roadmap.md)
- **Dependencies:** None

## **Block 9: Non-Functional, Security & Operational**

### **[1_PRD-REQ-OOS-017]** 3D Modeling, Texturing & Game Asset Pipelines
- **Type:** Functional
- **Description:** Out of Scope: No generation of 3D assets or game pipelines.
- **Source:** PRD (Product Requirements Document) (specs/1_prd.md)
- **Dependencies:** None

### **[1_PRD-REQ-UI-013]** Agent-Initiated Clarification (AIC)
- **Type:** Functional
- **Description:** Agents must request clarification upon detecting logical contradictions.
- **Source:** PRD (Product Requirements Document) (specs/1_prd.md)
- **Dependencies:** None

### **[4_USER_FEATURES-REQ-026]** Ambiguous Brief Handling
- **Type:** Functional
- **Description:** If the prompt is < 100 characters or lacks a clear objective, the agent MUST emit a `CLARIFICATION_REQUIRED` status and present a clarification field.
- **Source:** User Features (specs/4_user_features.md)
- **Dependencies:** None

### **[1_PRD-REQ-OOS-006]** App Store & Marketplace Submission Management
- **Type:** Functional
- **Description:** Out of Scope: No management of app store submission workflows.
- **Source:** PRD (Product Requirements Document) (specs/1_prd.md)
- **Dependencies:** None

### **[1_PRD-REQ-MET-013]** Approval Latency
- **Type:** Functional
- **Description:** Total time spent in "Wait-for-Approval" state.
- **Source:** PRD (Product Requirements Document) (specs/1_prd.md)
- **Dependencies:** None

### **[9_ROADMAP-REQ-029]** Architectural Traceability
- **Type:** Functional
- **Description:** Architectural Traceability: Every requirement in the PRD must be linked to at least one interface contract in the TAS.
- **Source:** Project Roadmap (specs/9_project_roadmap.md)
- **Dependencies:** None

### **[3_MCP-REQ-GOAL-002]** Architecture-Driven Development (ADD)
- **Type:** Functional
- **Description:** Every project must have a validated PRD and TAS before implementation begins. Implementation agents are strictly bound by these blueprints.
- **Source:** MCP and AI Development Design (specs/3_mcp_design.md)
- **Dependencies:** None

### **[1_PRD-REQ-OOS-016]** Browser/OS-Specific Polyfilling & Quirk-Handling
- **Type:** Functional
- **Description:** Out of Scope: No support for legacy browser polyfills or OS-specific quirks.
- **Source:** PRD (Product Requirements Document) (specs/1_prd.md)
- **Dependencies:** None

### **[4_USER_FEATURES-REQ-035]** Circular Task Dependency Resolution
- **Type:** Functional
- **Description:** If the DAG generator creates a cycle, the orchestrator must automatically run "Cycle Resolution" or prompt for manual reordering.
- **Source:** User Features (specs/4_user_features.md)
- **Dependencies:** None

### **[2_TAS-REQ-002]** Compression Process
- **Type:** Functional
- **Description:** The Architect distills research into structured specifications.
- **Source:** TAS (Technical Architecture Specification) (specs/2_tas.md)
- **Dependencies:** [2_TAS-REQ-001]

### **[9_ROADMAP-REQ-026]** Content Extraction
- **Type:** Functional
- **Description:** Content Extraction: `ContentExtractor` must successfully convert SPA/Dynamic sites into clean Markdown, stripping 100% of navigation/ad noise.
- **Source:** Project Roadmap (specs/9_project_roadmap.md)
- **Dependencies:** None

### **[4_USER_FEATURES-REQ-010]** Context Injection (Whispering)
- **Type:** Functional
- **Description:** A dedicated input field to send mid-task "Directives" directly to the active agent's short-term memory without pausing the execution loop.
- **Source:** User Features (specs/4_user_features.md)
- **Dependencies:** None

### **[1_PRD-REQ-NEED-MAKER-03]** Cost estimation
- **Type:** Functional
- **Description:** Cost and token usage estimation per project phase.
- **Source:** PRD (Product Requirements Document) (specs/1_prd.md)
- **Dependencies:** None

### **[1_PRD-REQ-OOS-003]** Creative Asset & Marketing Content Generation
- **Type:** Functional
- **Description:** Out of Scope: No generation of logos, branding, or marketing copy.
- **Source:** PRD (Product Requirements Document) (specs/1_prd.md)
- **Dependencies:** None

### **[1_PRD-REQ-OOS-009]** Data Migration, Cleaning & ETL
- **Type:** Functional
- **Description:** Out of Scope: No production data migration or complex ETL.
- **Source:** PRD (Product Requirements Document) (specs/1_prd.md)
- **Dependencies:** None

### **[1_PRD-REQ-MET-012]** Decision Transparency Score
- **Type:** Functional
- **Description:** 100% of failures must provide root cause and suggested fix for resolution in <5 min.
- **Source:** PRD (Product Requirements Document) (specs/1_prd.md)
- **Dependencies:** None

### **[2_TAS-REQ-003]** Decomposition Process
- **Type:** Functional
- **Description:** The Distiller breaks specifications into atomic, executable tasks.
- **Source:** TAS (Technical Architecture Specification) (specs/2_tas.md)
- **Dependencies:** [2_TAS-REQ-002]

### **[4_USER_FEATURES-REQ-002]** Deterministic Rewind (Time-Travel)
- **Type:** Functional
- **Description:** Command `devs rewind --to <task_id>` to revert the filesystem (Git) and state (SQLite/Vector) to a specific historical checkpoint with 100% fidelity.
- **Source:** User Features (specs/4_user_features.md)
- **Dependencies:** None

### **[4_USER_FEATURES-REQ-074]** Deterministic Rollback
- **Type:** Functional
- **Description:** Reverts filesystem (Git) and state database (SQLite) to any historical Task ID.
- **Source:** User Features (specs/4_user_features.md)
- **Dependencies:** None

### **[4_USER_FEATURES-REQ-041]** Dirty Workspace Rewind Block
- **Type:** Functional
- **Description:** System blocks rewind if the workspace has uncommitted manual changes, prompting to "Commit, Stash, or Discard".
- **Source:** User Features (specs/4_user_features.md)
- **Dependencies:** None

### **[9_ROADMAP-REQ-007]** Discovery-to-Architecture (P3 -> P4)
- **Type:** Functional
- **Description:** Discovery-to-Architecture (P3 -> P4): The transition occurs once the Research Manager Agent confirms that confidence scores for Market, Tech, and Competitive reports exceed 85%. If scores are low, the system triggers a "Deep Search" recursive turn.
- **Source:** Project Roadmap (specs/9_project_roadmap.md)
- **Dependencies:** None

### **[1_PRD-REQ-OOS-014]** Distributed Load & Stress Testing
- **Type:** Functional
- **Description:** Out of Scope: No large-scale distributed load tests.
- **Source:** PRD (Product Requirements Document) (specs/1_prd.md)
- **Dependencies:** None

### **[2_TAS-REQ-004]** Execution Process
- **Type:** Functional
- **Description:** Developer agents transform tasks into code commits.
- **Source:** TAS (Technical Architecture Specification) (specs/2_tas.md)
- **Dependencies:** [2_TAS-REQ-003]

### **[2_TAS-REQ-001]** Expansion Process
- **Type:** Functional
- **Description:** Research agents expand user input into thousands of tokens of context.
- **Source:** TAS (Technical Architecture Specification) (specs/2_tas.md)
- **Dependencies:** [TAS-082]

### **[4_USER_FEATURES-REQ-072]** Feedback Injection Tool
- **Type:** Functional
- **Description:** Dedicated interface to provide global feedback that updates Long-term Memory (LanceDB).
- **Source:** User Features (specs/4_user_features.md)
- **Dependencies:** None

### **[1_PRD-REQ-OOS-019]** Full Offline Operational Mode
- **Type:** Functional
- **Description:** Out of Scope: Internet connection required for LLM API.
- **Source:** PRD (Product Requirements Document) (specs/1_prd.md)
- **Dependencies:** None

### **[1_PRD-REQ-UI-008]** Global Pause/Resume
- **Type:** Functional
- **Description:** Immediate suspension and persistence of state for all active agents.
- **Source:** PRD (Product Requirements Document) (specs/1_prd.md)
- **Dependencies:** None

### **[1_PRD-REQ-OOS-005]** Hardware-Specific & Embedded Systems Development
- **Type:** Functional
- **Description:** Out of Scope: No support for proprietary hardware or RTOS.
- **Source:** PRD (Product Requirements Document) (specs/1_prd.md)
- **Dependencies:** None

### **[1_PRD-REQ-NEED-DOMAIN-01]** High-fidelity Research Reports
- **Type:** Functional
- **Description:** High-fidelity "Research Reports" explaining the "Why" behind tech choices.
- **Source:** PRD (Product Requirements Document) (specs/1_prd.md)
- **Dependencies:** None

### **[1_PRD-REQ-NEED-MAKER-01]** Instant project scaffolding
- **Type:** Functional
- **Description:** Instant project scaffolding without manual configuration.
- **Source:** PRD (Product Requirements Document) (specs/1_prd.md)
- **Dependencies:** None

### **[1_PRD-REQ-MET-011]** Intervention Frequency
- **Type:** Functional
- **Description:** Number of manual rewinds/overrides per Epic (Target <2).
- **Source:** PRD (Product Requirements Document) (specs/1_prd.md)
- **Dependencies:** None

### **[1_PRD-REQ-OOS-001]** Legacy System Refactoring & Migration
- **Type:** Functional
- **Description:** Out of Scope: Greenfield development only; no legacy refactoring.
- **Source:** PRD (Product Requirements Document) (specs/1_prd.md)
- **Dependencies:** None

### **[1_PRD-REQ-OOS-007]** Legal, Regulatory & Compliance Certification
- **Type:** Functional
- **Description:** Out of Scope: No legal or regulatory guarantees (GDPR, HIPAA, etc.).
- **Source:** PRD (Product Requirements Document) (specs/1_prd.md)
- **Dependencies:** None

### **[1_PRD-REQ-OOS-002]** Live Production Infrastructure Provisioning
- **Type:** Functional
- **Description:** Out of Scope: Will not execute deployment/provisioning commands to live clouds.
- **Source:** PRD (Product Requirements Document) (specs/1_prd.md)
- **Dependencies:** None

### **[1_PRD-REQ-OOS-011]** Local LLM Hosting & Inference Management
- **Type:** Functional
- **Description:** Out of Scope: No management of local LLM inference engines.
- **Source:** PRD (Product Requirements Document) (specs/1_prd.md)
- **Dependencies:** None

### **[9_ROADMAP-REQ-023]** MCP Handshake
- **Type:** Functional
- **Description:** MCP Handshake: 100% success rate for agent-to-tool handshakes via the `@modelcontextprotocol/sdk`.
- **Source:** Project Roadmap (specs/9_project_roadmap.md)
- **Dependencies:** None

### **[4_USER_FEATURES-REQ-065]** Manual Intervention Thresholds
- **Type:** Functional
- **Description:** User-configurable limits for "Max Turns" and "Max Cost" per task that trigger a hard pause.
- **Source:** User Features (specs/4_user_features.md)
- **Dependencies:** None

### **[4_USER_FEATURES-REQ-031]** Manual Markdown Corruption Linting
- **Type:** Functional
- **Description:** If the user manually edits specs and introduces syntax errors, the system must run a `LINT_SPECS` check and highlight error lines.
- **Source:** User Features (specs/4_user_features.md)
- **Dependencies:** None

### **[1_PRD-REQ-UI-009]** Mid-Task Context Injection (Directives)
- **Type:** Functional
- **Description:** Users can provide "Whisper" directives that take precedence over TAS for a task.
- **Source:** PRD (Product Requirements Document) (specs/1_prd.md)
- **Dependencies:** None

### **[4_USER_FEATURES-REQ-067]** Multi-Choice Resolution Proposals
- **Type:** Functional
- **Description:** Agents propose 2-3 resolution strategies for conflicts (e.g., updating TAS vs. refactoring implementation).
- **Source:** User Features (specs/4_user_features.md)
- **Dependencies:** None

### **[1_PRD-REQ-OOS-008]** Niche or Proprietary Language Support
- **Type:** Functional
- **Description:** Out of Scope: Limited to mainstream languages with robust tooling.
- **Source:** PRD (Product Requirements Document) (specs/1_prd.md)
- **Dependencies:** None

### **[1_PRD-REQ-OOS-004]** Ongoing "Agent-as-a-Service" Maintenance
- **Type:** Functional
- **Description:** Out of Scope: No long-term maintenance or incident response.
- **Source:** PRD (Product Requirements Document) (specs/1_prd.md)
- **Dependencies:** None

### **[9_ROADMAP-REQ-024]** Parallelization
- **Type:** Functional
- **Description:** Parallelization: `ResearchManager` must handle 3+ concurrent search/extract streams without thread starvation or rate-limit lockouts.
- **Source:** Project Roadmap (specs/9_project_roadmap.md)
- **Dependencies:** None

### **[1_PRD-REQ-OOS-020]** Project Hosting & PaaS Functionality
- **Type:** Functional
- **Description:** Out of Scope: Not a hosting provider.
- **Source:** PRD (Product Requirements Document) (specs/1_prd.md)
- **Dependencies:** None

### **[4_USER_FEATURES-REQ-001]** Project Lifecycle Management
- **Type:** Functional
- **Description:** Comprehensive command set for `init` (bootstrapping), `run` (continuous implementation), `pause`, `resume`, and `status`.
- **Source:** User Features (specs/4_user_features.md)
- **Dependencies:** None

### **[1_PRD-REQ-UI-011]** Project Rewind (Time-Travel)
- **Type:** Functional
- **Description:** Ability to revert project to a specific Task ID via git and state reset.
- **Source:** PRD (Product Requirements Document) (specs/1_prd.md)
- **Dependencies:** None

### **[1_PRD-REQ-GOAL-001]** Radical Compression of Time-to-Market (TTM)
- **Type:** Functional
- **Description:** Compress discovery, architecture, and initial build phases from weeks to hours/days.
- **Source:** PRD (Product Requirements Document) (specs/1_prd.md)
- **Dependencies:** None

### **[1_PRD-REQ-OOS-010]** Real-time Multi-User Orchestration (Collaboration)
- **Type:** Functional
- **Description:** Out of Scope: Single-user tool; no multi-user collaboration.
- **Source:** PRD (Product Requirements Document) (specs/1_prd.md)
- **Dependencies:** None

### **[4_USER_FEATURES-REQ-034]** Requirement Orphanage Detection
- **Type:** Functional
- **Description:** If a PRD requirement cannot be mapped to any task, the system flags a "Coverage Gap" and forces re-decomposition.
- **Source:** User Features (specs/4_user_features.md)
- **Dependencies:** None

### **[4_USER_FEATURES-REQ-073]** Requirement Refinement Mode
- **Type:** Functional
- **Description:** During pause, users can edit specs and the system offers to "Re-distill" the roadmap.
- **Source:** User Features (specs/4_user_features.md)
- **Dependencies:** None

### **[1_PRD-REQ-MET-003]** Requirement Traceability Index (RTI)
- **Type:** Functional
- **Description:** 100% of atomic requirements mapped to passing test cases and code.
- **Source:** PRD (Product Requirements Document) (specs/1_prd.md)
- **Dependencies:** None

### **[3_MCP-REQ-GOAL-001]** Research-First Methodology
- **Type:** Functional
- **Description:** No implementation occurs until the problem space, technology landscape, and competitive analysis are finalized and approved. This prevents architectural drift.
- **Source:** MCP and AI Development Design (specs/3_mcp_design.md)
- **Dependencies:** None

### **[4_USER_FEATURES-REQ-060]** Root Cause Analysis (RCA) Reports
- **Type:** Functional
- **Description:** Reviewer Agent generates Markdown reports on task failure identifying causes like dependency conflicts or hallucinations.
- **Source:** User Features (specs/4_user_features.md)
- **Dependencies:** None

### **[4_USER_FEATURES-REQ-027]** Search Dead-end Handling
- **Type:** Functional
- **Description:** If no relevant competitors are found, the agent MUST perform "Adjacent Market Analysis" and explain why a direct match was not found.
- **Source:** User Features (specs/4_user_features.md)
- **Dependencies:** None

### **[4_USER_FEATURES-REQ-076]** Short-term Memory Injection
- **Type:** Functional
- **Description:** Users can send directives to an active agent that take precedence over the TAS for the current task.
- **Source:** User Features (specs/4_user_features.md)
- **Dependencies:** None

### **[4_USER_FEATURES-REQ-028]** Source Contradiction Handling
- **Type:** Functional
- **Description:** If scraped sources provide conflicting data, the agent must flag this as a "Contradictory Finding" with a lower confidence score.
- **Source:** User Features (specs/4_user_features.md)
- **Dependencies:** None

### **[9_ROADMAP-REQ-025]** Source Credibility
- **Type:** Functional
- **Description:** Source Credibility: 100% of cited facts in research reports must be linked to a verifiable URL with a `Confidence Score` > 0.8.
- **Source:** Project Roadmap (specs/9_project_roadmap.md)
- **Dependencies:** None

### **[4_USER_FEATURES-REQ-077]** Strategy Override
- **Type:** Functional
- **Description:** Forcing an agent to pivot its implementation approach (e.g., changing libraries).
- **Source:** User Features (specs/4_user_features.md)
- **Dependencies:** None

### **[3_MCP-REQ-GOAL-005]** Strict TDD (Test-Driven Development) Loop
- **Type:** Functional
- **Description:** A mandatory "Red-Green-Refactor" cycle where tests are the primary source of truth for requirement fulfillment.
- **Source:** MCP and AI Development Design (specs/3_mcp_design.md)
- **Dependencies:** None

### **[9_ROADMAP-REQ-022]** Surgical Precision
- **Type:** Functional
- **Description:** Surgical Precision: `surgical_edit` tool must pass the "Large File Refactor" test, applying 20+ non-contiguous edits without breaking syntax.
- **Source:** Project Roadmap (specs/9_project_roadmap.md)
- **Dependencies:** None

### **[1_PRD-REQ-MET-001]** Task Autonomy Rate (TAR)
- **Type:** Functional
- **Description:** Percentage of tasks completed without human intervention (Target >85%).
- **Source:** PRD (Product Requirements Document) (specs/1_prd.md)
- **Dependencies:** None

### **[1_PRD-REQ-UI-010]** Task Skip & Manual Completion
- **Type:** Functional
- **Description:** User can manually fix code and mark tasks as complete.
- **Source:** PRD (Product Requirements Document) (specs/1_prd.md)
- **Dependencies:** None

### **[4_USER_FEATURES-REQ-038]** Test Hallucination Verification
- **Type:** Functional
- **Description:** Reviewer Agent performs a "Logic Verification" turn to ensure tests pass correctly and are not hallucinated (e.g., `expect(true).toBe(true)`).
- **Source:** User Features (specs/4_user_features.md)
- **Dependencies:** None

### **[9_ROADMAP-REQ-009]** The Distillation Compiler (P5)
- **Type:** Functional
- **Description:** The Distillation Compiler (P5): Phase 5 acts as a "Compiler" for the project. It validates that 100% of the `Must-have` requirements in the PRD are mapped to at least one task in the DAG. Any "Orphaned Requirements" trigger an automated re-distillation turn.
- **Source:** Project Roadmap (specs/9_project_roadmap.md)
- **Dependencies:** None

### **[1_PRD-REQ-MET-002]** Time-to-First-Commit (TTFC)
- **Type:** Functional
- **Description:** Clock time from `devs init` to first successful implementation commit (Target <60 min).
- **Source:** PRD (Product Requirements Document) (specs/1_prd.md)
- **Dependencies:** None

### **[4_USER_FEATURES-REQ-084]** Token Budgeting
- **Type:** Functional
- **Description:** Users can set hard and soft USD limits per project or per Epic.
- **Source:** User Features (specs/4_user_features.md)
- **Dependencies:** None

### **[2_TAS-REQ-005]** Verification Process
- **Type:** Functional
- **Description:** Reviewer agents validate commits against requirements.
- **Source:** TAS (Technical Architecture Specification) (specs/2_tas.md)
- **Dependencies:** [2_TAS-REQ-004]

### **[9_ROADMAP-REQ-028]** Visual Correctness
- **Type:** Functional
- **Description:** Visual Correctness: 100% of Mermaid.js diagrams (ERD, Sequence) must render without syntax errors in the `MermaidHost`.
- **Source:** Project Roadmap (specs/9_project_roadmap.md)
- **Dependencies:** None

### **[2_TAS-REQ-011]** execute_query Tool
- **Type:** Functional
- **Description:** Tool for agents to verify data persistence in the generated app during TDD.
- **Source:** TAS (Technical Architecture Specification) (specs/2_tas.md)
- **Dependencies:** [TAS-043]

### **[2_TAS-REQ-006]** get_project_status Tool
- **Type:** Functional
- **Description:** Tool to return requirement fulfillment and task progress.
- **Source:** TAS (Technical Architecture Specification) (specs/2_tas.md)
- **Dependencies:** [TAS-101]

### **[2_TAS-REQ-007]** inject_directive Tool
- **Type:** Functional
- **Description:** Tool to add human-in-the-loop constraints to the active task.
- **Source:** TAS (Technical Architecture Specification) (specs/2_tas.md)
- **Dependencies:** [TAS-101]

### **[2_TAS-REQ-009]** inspect_state Tool
- **Type:** Functional
- **Description:** Tool to read runtime variables or database state of the generated application.
- **Source:** TAS (Technical Architecture Specification) (specs/2_tas.md)
- **Dependencies:** [TAS-043]

### **[2_TAS-REQ-008]** rewind_to_task Tool
- **Type:** Functional
- **Description:** Tool to roll back git and SQLite state to a specific taskId.
- **Source:** TAS (Technical Architecture Specification) (specs/2_tas.md)
- **Dependencies:** [TAS-101]

### **[2_TAS-REQ-010]** run_profiler Tool
- **Type:** Functional
- **Description:** Tool to capture CPU/Memory traces of the generated application.
- **Source:** TAS (Technical Architecture Specification) (specs/2_tas.md)
- **Dependencies:** [TAS-043]

### **[9_ROADMAP-REQ-006]** Additionally, the Task Failure Gate (HITL Recovery) is triggered if an agent hit
- **Type:** Non-Functional
- **Description:** Additionally, the Task Failure Gate (HITL Recovery) is triggered if an agent hits the entropy limit.
- **Source:** Project Roadmap (specs/9_project_roadmap.md)
- **Dependencies:** None

### **[4_USER_FEATURES-REQ-055]** Contextual Focus Management
- **Type:** Non-Functional
- **Description:** During human-in-the-loop gates, UI must automatically move focus to the primary action or clarification field.
- **Source:** User Features (specs/4_user_features.md)
- **Dependencies:** None

### **[4_USER_FEATURES-REQ-059]** Cross-Language Requirement Traceability
- **Type:** Non-Functional
- **Description:** Reviewer Agent MUST verify semantic intent is preserved when requirements are in one language and code is in English.
- **Source:** User Features (specs/4_user_features.md)
- **Dependencies:** None

### **[4_USER_FEATURES-REQ-047]** High-Contrast & Color Blindness Support
- **Type:** Non-Functional
- **Description:** UI must respect VSCode High Contrast themes; Mermaid diagrams must use accessible palettes and visual cues.
- **Source:** User Features (specs/4_user_features.md)
- **Dependencies:** None

### **[4_USER_FEATURES-REQ-046]** Keyboard-First Navigation
- **Type:** Non-Functional
- **Description:** Every interactive element in CLI and VSCode UI MUST be reachable and operable via keyboard.
- **Source:** User Features (specs/4_user_features.md)
- **Dependencies:** None

### **[4_USER_FEATURES-REQ-052]** Language-Specific Model Support
- **Type:** Non-Functional
- **Description:** Orchestrator should allow users to specify LLM models optimized for their native language.
- **Source:** User Features (specs/4_user_features.md)
- **Dependencies:** None

### **[4_USER_FEATURES-REQ-051]** Locale-Aware Formatting
- **Type:** Non-Functional
- **Description:** UI timestamps, numbers, and currencies MUST follow user system locale; internal storage uses ISO 8601 UTC.
- **Source:** User Features (specs/4_user_features.md)
- **Dependencies:** None

### **[4_USER_FEATURES-REQ-050]** Multi-Lingual Research & Analysis
- **Type:** Non-Functional
- **Description:** Research Agent must be capable of scraping and distilling documentation in multiple languages (English, Chinese, Spanish, Japanese, etc.).
- **Source:** User Features (specs/4_user_features.md)
- **Dependencies:** None

### **[4_USER_FEATURES-REQ-053]** Pluralization & Gendered Grammar
- **Type:** Non-Functional
- **Description:** UI strings must be externalized via a localization framework (e.g., `i18next`) handling complex grammatical rules.
- **Source:** User Features (specs/4_user_features.md)
- **Dependencies:** None

### **[4_USER_FEATURES-REQ-058]** RTL Layout Support
- **Type:** Non-Functional
- **Description:** VSCode Extension dashboard MUST support RTL mirroring and use CSS logical properties for languages like Arabic or Hebrew.
- **Source:** User Features (specs/4_user_features.md)
- **Dependencies:** None

### **[4_USER_FEATURES-REQ-048]** Responsive Sizing & Reflow
- **Type:** Non-Functional
- **Description:** UI MUST support text scaling up to 200% and reflow gracefully without loss of functionality.
- **Source:** User Features (specs/4_user_features.md)
- **Dependencies:** None

### **[4_USER_FEATURES-REQ-045]** Screen Reader ARIA-Live Optimization
- **Type:** Non-Functional
- **Description:** "Agent Console" MUST use `aria-live` regions (polite for thoughts, assertive for interventions) for real-time announcements.
- **Source:** User Features (specs/4_user_features.md)
- **Dependencies:** None

### **[4_USER_FEATURES-REQ-054]** Structural Navigation & Semantics
- **Type:** Non-Functional
- **Description:** Generated documents MUST use semantic headers to enable rapid structural navigation by assistive technologies.
- **Source:** User Features (specs/4_user_features.md)
- **Dependencies:** None

### **[4_USER_FEATURES-REQ-056]** Text-to-Speech (TTS) Compatibility
- **Type:** Non-Functional
- **Description:** Agent logs and thoughts must be structured to avoid technical noise, providing a "Clean Log" mode for audio.
- **Source:** User Features (specs/4_user_features.md)
- **Dependencies:** None

### **[4_USER_FEATURES-REQ-049]** Universal Unicode Support
- **Type:** Non-Functional
- **Description:** Support UTF-8 encoding across all artifacts (specs, code, logs) for global scripts and symbols.
- **Source:** User Features (specs/4_user_features.md)
- **Dependencies:** None

### **[4_USER_FEATURES-REQ-057]** Visual Diagram Alternatives
- **Type:** Non-Functional
- **Description:** System MUST provide text summaries or queryable table formats as alternatives for visual Mermaid diagrams.
- **Source:** User Features (specs/4_user_features.md)
- **Dependencies:** None

### **[4_USER_FEATURES-REQ-044]** WCAG 2.1 Level AA Compliance
- **Type:** Non-Functional
- **Description:** The VSCode extension and web dashboards MUST adhere to WCAG 2.1 AA standards for contrast, focus, and semantics.
- **Source:** User Features (specs/4_user_features.md)
- **Dependencies:** None

### **[8_RISKS-REQ-117]** Approval Fatigue & Human Error Risk Mitigation
- **Type:** Operational
- **Description:** Mitigation for Approval Fatigue & Human Error risk through Delta-Based Review Interfaces.
- **Source:** Risks and Mitigation (specs/8_risks_mitigation.md)
- **Dependencies:** None

### **[8_RISKS-REQ-089]** Budget Alert and Pause
- **Type:** Operational
- **Description:** Soft Limit: Pause and notify at 80% budget. Hard Limit: At 100%, the system executes a snapshot_and_freeze operation.
- **Source:** Risks and Mitigation (specs/8_risks_mitigation.md)
- **Dependencies:** None

### **[8_RISKS-REQ-120]** LLM API Rate Limiting & Latency Risk Mitigation
- **Type:** Operational
- **Description:** Mitigation for LLM API Rate Limiting & Latency risk through Exponential Backoff & Caching.
- **Source:** Risks and Mitigation (specs/8_risks_mitigation.md)
- **Dependencies:** None

### **[8_RISKS-REQ-057]** Pre-Execution Cost Estimation
- **Type:** Operational
- **Description:** Phase 3 (Distillation) MUST provide a "Project Token Estimate" (+/- 20%) before implementation begins.
- **Source:** Risks and Mitigation (specs/8_risks_mitigation.md)
- **Dependencies:** None

### **[8_RISKS-REQ-090]** Recovery Workflow
- **Type:** Operational
- **Description:** Project can only resume once the user updates config.json with an increased budget or authorizes a "Tier 2" model (e.g., Flash) for all subsequent tasks.
- **Source:** Risks and Mitigation (specs/8_risks_mitigation.md)
- **Dependencies:** [8_RISKS-REQ-089]

### **[8_RISKS-REQ-023]** User Escalation with RCA
- **Type:** Operational
- **Description:** If arbitration fails, the system MUST pause and present a "Conflict Analysis" report to the user, highlighting the specific PRD/TAS contradiction.
- **Source:** Risks and Mitigation (specs/8_risks_mitigation.md)
- **Dependencies:** [8_RISKS-REQ-022]

### **[8_RISKS-REQ-075]** User Intervention
- **Type:** Operational
- **Description:** The user manually modifies the code in src/.
- **Source:** Risks and Mitigation (specs/8_risks_mitigation.md)
- **Dependencies:** [8_RISKS-REQ-074]

### **[8_RISKS-REQ-037]** Background Indexing
- **Type:** Performance
- **Description:** Vector DB indexing (LanceDB) MUST be throttled to avoid CPU spikes during active agent implementation turns.
- **Source:** Risks and Mitigation (specs/8_risks_mitigation.md)
- **Dependencies:** None

### **[8_RISKS-REQ-035]** Off-Main-Thread Execution
- **Type:** Performance
- **Description:** All trace parsing, vector search operations, and Markdown-to-HTML rendering MUST occur in a separate Worker Thread.
- **Source:** Risks and Mitigation (specs/8_risks_mitigation.md)
- **Dependencies:** None

### **[8_RISKS-REQ-128]** VSCode Extension Resource Overload Risk Mitigation
- **Type:** Performance
- **Description:** Mitigation for VSCode Extension Resource Overload risk through Off-Main-Thread Processing.
- **Source:** Risks and Mitigation (specs/8_risks_mitigation.md)
- **Dependencies:** None

### **[8_RISKS-REQ-114]** Secret Leakage in Logs/Traces Risk Mitigation
- **Type:** Privacy
- **Description:** Mitigation for Secret Leakage in Logs/Traces risk through Mandatory SecretMasker Middleware.
- **Source:** Risks and Mitigation (specs/8_risks_mitigation.md)
- **Dependencies:** None

### **[8_RISKS-REQ-061]** Agent-Oriented Documentation (AOD)
- **Type:** Quality
- **Description:** Every module includes .agent.md documentation, ensuring the project is as readable to humans as it is to agents.
- **Source:** Risks and Mitigation (specs/8_risks_mitigation.md)
- **Dependencies:** None

### **[8_RISKS-REQ-098]** Agent-Oriented Documentation (AOD) Audit
- **Type:** Quality
- **Description:** The Reviewer MUST verify that the .agent.md documentation for the modified module has been updated and accurately reflects the "Agentic Hooks."
- **Source:** Risks and Mitigation (specs/8_risks_mitigation.md)
- **Dependencies:** None

### **[8_RISKS-REQ-110]** Architectural Drift & TAS Violation Risk Mitigation
- **Type:** Quality
- **Description:** Mitigation for Architectural Drift & TAS Violation risk through Reviewer Agent & Fidelity Gates.
- **Source:** Risks and Mitigation (specs/8_risks_mitigation.md)
- **Dependencies:** None

### **[8_RISKS-REQ-051]** Automated Link Validation
- **Type:** Quality
- **Description:** The orchestrator MUST attempt to fetch and verify the existence of all cited URLs.
- **Source:** Risks and Mitigation (specs/8_risks_mitigation.md)
- **Dependencies:** [8_RISKS-REQ-050]

### **[8_RISKS-REQ-068]** Automated Onboarding
- **Type:** Quality
- **Description:** Every project includes an onboarding.agent.md that explains the architecture to any new developer (human or AI).
- **Source:** Risks and Mitigation (specs/8_risks_mitigation.md)
- **Dependencies:** None

### **[8_RISKS-REQ-086]** Blame Identification
- **Type:** Quality
- **Description:** Automated analysis to find the task that introduced the regression.
- **Source:** Risks and Mitigation (specs/8_risks_mitigation.md)
- **Dependencies:** None

### **[8_RISKS-REQ-104]** Context Pruning Heuristics
- **Type:** Quality
- **Description:** The orchestrator MUST implement semantic similarity thresholds to filter out low-relevance results from LanceDB.
- **Source:** Risks and Mitigation (specs/8_risks_mitigation.md)
- **Dependencies:** None

### **[8_RISKS-REQ-052]** Fact-Checker Agent
- **Type:** Quality
- **Description:** A separate agent MUST be used to cross-reference the research report against the raw scraped data to identify discrepancies.
- **Source:** Risks and Mitigation (specs/8_risks_mitigation.md)
- **Dependencies:** None

### **[8_RISKS-REQ-100]** Flakiness Heuristics
- **Type:** Quality
- **Description:** If a test fails with different error messages across retries, the system flags it as FLAKY and pauses for human intervention.
- **Source:** Risks and Mitigation (specs/8_risks_mitigation.md)
- **Dependencies:** [8_RISKS-REQ-099]

### **[8_RISKS-REQ-116]** Flaky Tests & Non-Deterministic TDD Risk Mitigation
- **Type:** Quality
- **Description:** Mitigation for Flaky Tests & Non-Deterministic TDD risk through Heuristic Failure Analysis.
- **Source:** Risks and Mitigation (specs/8_risks_mitigation.md)
- **Dependencies:** None

### **[8_RISKS-REQ-107]** Global Validation Phase
- **Type:** Quality
- **Description:** A final "Global Audit" task MUST be executed after all Epics are complete to verify every requirement ID is present in the codebase and test suite.
- **Source:** Risks and Mitigation (specs/8_risks_mitigation.md)
- **Dependencies:** None

### **[8_RISKS-REQ-121]** Hallucinated Requirements Distillation Risk Mitigation
- **Type:** Quality
- **Description:** Mitigation for Hallucinated Requirements Distillation risk through Multi-Agent Cross-Check & User Gate.
- **Source:** Risks and Mitigation (specs/8_risks_mitigation.md)
- **Dependencies:** None

### **[8_RISKS-REQ-067]** Idiomatic Pattern Enforcement
- **Type:** Quality
- **Description:** The Reviewer Agent uses a "Clean Code" prompt to ensure generated code follows standard community patterns (e.g., SOLID, Clean Architecture).
- **Source:** Risks and Mitigation (specs/8_risks_mitigation.md)
- **Dependencies:** None

### **[8_RISKS-REQ-096]** Independent Reviewer Agent
- **Type:** Quality
- **Description:** Every task implementation is reviewed by a separate agent instance with a "Hostile Auditor" prompt.
- **Source:** Risks and Mitigation (specs/8_risks_mitigation.md)
- **Dependencies:** None

### **[8_RISKS-REQ-039]** Logic Anomaly Alerts
- **Type:** Quality
- **Description:** The Reviewer Agent MUST flag if a user directive contradicts a previously established "Long-term Memory" constraint, requiring an explicit confirmation.
- **Source:** Risks and Mitigation (specs/8_risks_mitigation.md)
- **Dependencies:** None

### **[8_RISKS-REQ-137]** Long-Term Memory Hallucination Unknown
- **Type:** Quality
- **Description:** Uncertainty if retrieval noise will increase as the vector store grows.
- **Source:** Risks and Mitigation (specs/8_risks_mitigation.md)
- **Dependencies:** None

### **[8_RISKS-REQ-136]** Maintenance & "Agentic Debt" Risk
- **Type:** Quality
- **Description:** Risk that AI-generated code is "alien" to human maintainers and requires AI for maintenance.
- **Source:** Risks and Mitigation (specs/8_risks_mitigation.md)
- **Dependencies:** None

### **[8_RISKS-REQ-060]** Mandatory TDD Verification
- **Type:** Quality
- **Description:** Code is never presented as "done" without a 100% test pass rate in a clean sandbox, providing empirical proof of correctness.
- **Source:** Risks and Mitigation (specs/8_risks_mitigation.md)
- **Dependencies:** None

### **[8_RISKS-REQ-103]** Mandatory User Approval Gate
- **Type:** Quality
- **Description:** Distilled requirements MUST be approved by the user before Epics and Tasks are generated.
- **Source:** Risks and Mitigation (specs/8_risks_mitigation.md)
- **Dependencies:** None

### **[8_RISKS-REQ-101]** Multi-Agent Cross-Check
- **Type:** Quality
- **Description:** Requirements distilled by one agent MUST be reviewed by a second agent using the source documents as reference.
- **Source:** Risks and Mitigation (specs/8_risks_mitigation.md)
- **Dependencies:** None

### **[8_RISKS-REQ-099]** Multi-Run Verification
- **Type:** Quality
- **Description:** Every "Green" test completion MUST be verified by running the test suite 3 consecutive times in a clean sandbox.
- **Source:** Risks and Mitigation (specs/8_risks_mitigation.md)
- **Dependencies:** None

### **[8_RISKS-REQ-064]** Origin Traceability
- **Type:** Quality
- **Description:** Every requirement is traced from the user's initial prompt to the final code, providing a clear map of human intent.
- **Source:** Risks and Mitigation (specs/8_risks_mitigation.md)
- **Dependencies:** None

### **[8_RISKS-REQ-049]** Post-Parallel Validation
- **Type:** Quality
- **Description:** After parallel tasks merge, the system MUST run a "Global Epic Test" to ensure no side-effect regressions were introduced by the combined changes.
- **Source:** Risks and Mitigation (specs/8_risks_mitigation.md)
- **Dependencies:** None

### **[8_RISKS-REQ-106]** RTI Metric Monitoring
- **Type:** Quality
- **Description:** The system MUST calculate a Requirement Traceability Index (RTI) at each phase to ensure 100% coverage.
- **Source:** Risks and Mitigation (specs/8_risks_mitigation.md)
- **Dependencies:** None

### **[8_RISKS-REQ-088]** Re-implementation
- **Type:** Quality
- **Description:** The regressive task is re-assigned with the regression failure as a high-priority constraint.
- **Source:** Risks and Mitigation (specs/8_risks_mitigation.md)
- **Dependencies:** [8_RISKS-REQ-087]

### **[8_RISKS-REQ-129]** Requirement Traceability Gaps Risk Mitigation
- **Type:** Quality
- **Description:** Mitigation for Requirement Traceability Gaps risk through RTI Metric & Global Validation Phase.
- **Source:** Risks and Mitigation (specs/8_risks_mitigation.md)
- **Dependencies:** None

### **[8_RISKS-REQ-102]** Requirement Traceability Linkage
- **Type:** Quality
- **Description:** Every distilled requirement MUST link back to a specific paragraph or section in the source specs.
- **Source:** Risks and Mitigation (specs/8_risks_mitigation.md)
- **Dependencies:** None

### **[8_RISKS-REQ-084]** Roadmap Reconstruction
- **Type:** Quality
- **Description:** The requirement roadmap is reconstructed by cross-referencing commit tags with the specs/ documentation.
- **Source:** Risks and Mitigation (specs/8_risks_mitigation.md)
- **Dependencies:** [8_RISKS-REQ-083]

### **[8_RISKS-REQ-105]** Semantic Decay
- **Type:** Quality
- **Description:** Older memory entries should have their "weight" reduced over time if they contradict newer entries.
- **Source:** Risks and Mitigation (specs/8_risks_mitigation.md)
- **Dependencies:** None

### **[8_RISKS-REQ-050]** Source Citation Requirement
- **Type:** Quality
- **Description:** Every claim in a research report MUST be accompanied by a valid URL or document reference.
- **Source:** Risks and Mitigation (specs/8_risks_mitigation.md)
- **Dependencies:** None

### **[8_RISKS-REQ-122]** Stale/Irrelevant Vector Memory Risk Mitigation
- **Type:** Quality
- **Description:** Mitigation for Stale/Irrelevant Vector Memory risk through Context Pruning & Semantic Decay.
- **Source:** Risks and Mitigation (specs/8_risks_mitigation.md)
- **Dependencies:** None

### **[8_RISKS-REQ-097]** TAS Fidelity Gate
- **Type:** Quality
- **Description:** The Reviewer Agent is provided with the TAS as its primary constraint. It MUST verify that no new top-level directories or unapproved libraries were introduced.
- **Source:** Risks and Mitigation (specs/8_risks_mitigation.md)
- **Dependencies:** None

### **[8_RISKS-REQ-059]** The Glass-Box Audit Trail
- **Type:** Quality
- **Description:** Every commit MUST be linked to a queryable reasoning trace (SAOP_Envelope) in SQLite, allowing architects to inspect the "Why" behind every decision.
- **Source:** Risks and Mitigation (specs/8_risks_mitigation.md)
- **Dependencies:** None

### **[8_RISKS-REQ-041]** ACID-Compliant Commits
- **Type:** Reliability
- **Description:** All state changes (Success -> Commit -> Log Write) MUST be wrapped in a database transaction that rolls back if the Git operation fails.
- **Source:** Risks and Mitigation (specs/8_risks_mitigation.md)
- **Dependencies:** None

### **[8_RISKS-REQ-094]** ACID-Compliant State Transitions
- **Type:** Reliability
- **Description:** All state changes (Task Status: Success -> Git Commit -> Log Write) MUST be wrapped in a database transaction.
- **Source:** Risks and Mitigation (specs/8_risks_mitigation.md)
- **Dependencies:** None

### **[8_RISKS-REQ-083]** Audit Trail Reconstruction
- **Type:** Reliability
- **Description:** The system parses the Git repository's commit history and extracts REQ-ID and TaskID metadata from structured commit footers.
- **Source:** Risks and Mitigation (specs/8_risks_mitigation.md)
- **Dependencies:** None

### **[8_RISKS-REQ-043]** Automatic Lockfile Cleanup
- **Type:** Reliability
- **Description:** devs MUST perform a cleanup of stale .git/index.lock or .devs/state.sqlite-journal files upon startup.
- **Source:** Risks and Mitigation (specs/8_risks_mitigation.md)
- **Dependencies:** None

### **[8_RISKS-REQ-072]** Dirty Workspace Detection
- **Type:** Reliability
- **Description:** The system MUST detect uncommitted manual changes and prompt for git stash or discard before proceeding.
- **Source:** Risks and Mitigation (specs/8_risks_mitigation.md)
- **Dependencies:** None

### **[8_RISKS-REQ-069]** Filesystem Restoration
- **Type:** Reliability
- **Description:** The orchestrator executes a git checkout <commit_hash> --force to restore the work tree.
- **Source:** Risks and Mitigation (specs/8_risks_mitigation.md)
- **Dependencies:** None

### **[8_RISKS-REQ-127]** Git History Corruption/Conflicts Risk Mitigation
- **Type:** Reliability
- **Description:** Mitigation for Git History Corruption/Conflicts risk through Atomic Snapshots & State Locking.
- **Source:** Risks and Mitigation (specs/8_risks_mitigation.md)
- **Dependencies:** None

### **[8_RISKS-REQ-042]** **[8_RISKS-REQ-095]** Git-DB Verification on Resume
- **Type:** Reliability
- **Description:** On startup, the orchestrator MUST verify that the repository HEAD matches the git_commit_hash of the last successfully completed task in SQLite.
- **Source:** Risks and Mitigation (specs/8_risks_mitigation.md)
- **Dependencies:** None

### **[8_RISKS-REQ-070]** Relational State Rollback
- **Type:** Reliability
- **Description:** ACID-compliant deletion of all records in agent_logs, tasks, and requirements with timestamps succeeding the target snapshot.
- **Source:** Risks and Mitigation (specs/8_risks_mitigation.md)
- **Dependencies:** None

### **[8_RISKS-REQ-073]** Schema Drift Reconciliation
- **Type:** Reliability
- **Description:** If a task involved a database schema migration, the system MUST run a "Schema Reconciliation" turn to revert the local database instance.
- **Source:** Risks and Mitigation (specs/8_risks_mitigation.md)
- **Dependencies:** None

### **[8_RISKS-REQ-087]** Soft Rewind
- **Type:** Reliability
- **Description:** Reversion of application code to the pre-regressive state while retaining the new failing test case.
- **Source:** Risks and Mitigation (specs/8_risks_mitigation.md)
- **Dependencies:** [8_RISKS-REQ-086]

### **[8_RISKS-REQ-085]** State Snapshot in commit footer
- **Type:** Reliability
- **Description:** Every commit MUST include a "State Snapshot" block in the footer containing current requirement fulfillment status.
- **Source:** Risks and Mitigation (specs/8_risks_mitigation.md)
- **Dependencies:** None

### **[8_RISKS-REQ-071]** Vector Memory Pruning
- **Type:** Reliability
- **Description:** Temporal filtering of LanceDB queries to exclude semantic embeddings generated after the rewind point, preventing "future knowledge" hallucinations.
- **Source:** Risks and Mitigation (specs/8_risks_mitigation.md)
- **Dependencies:** None

### **[1_PRD-REQ-OOS-013]** Advanced Red-Team Security Penetration Testing
- **Type:** Security
- **Description:** Out of Scope: No simulation of APTs or deep network-level pen-testing.
- **Source:** PRD (Product Requirements Document) (specs/1_prd.md)
- **Dependencies:** None

### **[8_RISKS-REQ-026]** Automated SAST Injection
- **Type:** Security
- **Description:** The Reviewer Agent MUST run static analysis tools (e.g., eslint-plugin-security, bandit, gosec) as part of the implementation loop.
- **Source:** Risks and Mitigation (specs/8_risks_mitigation.md)
- **Dependencies:** None

### **[8_RISKS-REQ-028]** Dependency Vulnerability Scan
- **Type:** Security
- **Description:** The Developer Agent MUST run a security audit (e.g., npm audit) after every dependency installation. Any "High" or "Critical" vulnerability MUST trigger a task failure.
- **Source:** Risks and Mitigation (specs/8_risks_mitigation.md)
- **Dependencies:** None

### **[4_USER_FEATURES-REQ-020]** Ephemeral Sandbox Isolation
- **Type:** Security
- **Description:** Mandatory execution of all agent commands in isolated Docker or WebContainer environments with restricted CPU/Memory quotas and "Default Deny" network policies.
- **Source:** User Features (specs/4_user_features.md)
- **Dependencies:** None

### **[REQ-SEC-003]** Filesystem Protection
- **Type:** Security
- **Description:** Ensures .git and .devs are protected during filesystem synchronization between host and sandbox.
- **Source:** TAS (Technical Architecture Specification) (specs/2_tas.md)
- **Dependencies:** [TAS-080-1]

### **[8_RISKS-REQ-008]** Filesystem Virtualization
- **Type:** Security
- **Description:** The host project directory is mounted to /workspace in the sandbox. The .git and .devs folders are NOT mounted to prevent agents from corrupting history or the state machine.
- **Source:** Risks and Mitigation (specs/8_risks_mitigation.md)
- **Dependencies:** None

### **[1_PRD-REQ-OOS-018]** Formal Cryptographic & Smart Contract Auditing
- **Type:** Security
- **Description:** Out of Scope: No formal verification beyond standard unit testing.
- **Source:** PRD (Product Requirements Document) (specs/1_prd.md)
- **Dependencies:** None

### **[4_USER_FEATURES-REQ-023]** Git-Backed State Integrity
- **Type:** Security
- **Description:** Automatic Git commits after every successful task, creating a permanent, verifiable audit trail of code evolution.
- **Source:** User Features (specs/4_user_features.md)
- **Dependencies:** None

### **[8_RISKS-REQ-006]** Hardened Docker Configuration
- **Type:** Security
- **Description:** Use of minimal Alpine-based images. Containers MUST run with --cap-drop=ALL, --security-opt=no-new-privileges, and --pids-limit 128.
- **Source:** Risks and Mitigation (specs/8_risks_mitigation.md)
- **Dependencies:** None

### **[8_RISKS-REQ-092]** High-Entropy Detection
- **Type:** Security
- **Description:** Any contiguous string of 20+ characters with high Shannon entropy (>4.5) is replaced with [REDACTED] before being persisted or sent to the LLM.
- **Source:** Risks and Mitigation (specs/8_risks_mitigation.md)
- **Dependencies:** [8_RISKS-REQ-091]

### **[8_RISKS-REQ-018]** High-Reasoning Sanitization
- **Type:** Security
- **Description:** A "Sanitizer Agent" (using Gemini 3 Flash) pre-processes all research data to identify and strip imperative language or "jailbreak" patterns before it reaches the Architect Agent.
- **Source:** Risks and Mitigation (specs/8_risks_mitigation.md)
- **Dependencies:** None

### **[8_RISKS-REQ-113]** Indirect Prompt Injection (Research) Risk Mitigation
- **Type:** Security
- **Description:** Mitigation for Indirect Prompt Injection risk through Context Delimitation & Redaction.
- **Source:** Risks and Mitigation (specs/8_risks_mitigation.md)
- **Dependencies:** None

### **[8_RISKS-REQ-124]** Insecure Generated Code Patterns Risk Mitigation
- **Type:** Security
- **Description:** Mitigation for Insecure Generated Code Patterns risk through Automated SAST & Security Spec.
- **Source:** Risks and Mitigation (specs/8_risks_mitigation.md)
- **Dependencies:** None

### **[8_RISKS-REQ-093]** Local State Hardening
- **Type:** Security
- **Description:** The .devs/state.sqlite file is initialized with 0600 permissions. No secrets are ever stored in the database; only references to the host OS Keychain are permitted.
- **Source:** Risks and Mitigation (specs/8_risks_mitigation.md)
- **Dependencies:** None

### **[8_RISKS-REQ-091]** Mandatory SecretMasker
- **Type:** Security
- **Description:** All sandbox stdout/stderr MUST pass through a regex and entropy-based redaction engine.
- **Source:** Risks and Mitigation (specs/8_risks_mitigation.md)
- **Dependencies:** None

### **[8_RISKS-REQ-025]** Mandatory Security Spec
- **Type:** Security
- **Description:** The Architect Agent MUST generate a 5_security_design.md for every project, which the Developer Agent is required to ingest as a high-priority constraint.
- **Source:** Risks and Mitigation (specs/8_risks_mitigation.md)
- **Dependencies:** None

### **[8_RISKS-REQ-007]** Network Egress Proxy
- **Type:** Security
- **Description:** Implementation sandboxes operate on a "Deny-All" policy. Dependency resolution is routed through an orchestrator-controlled proxy that enforces a whitelist (e.g., registry.npmjs.org, pypi.org).
- **Source:** Risks and Mitigation (specs/8_risks_mitigation.md)
- **Dependencies:** None

### **[4_USER_FEATURES-REQ-021]** PII & Secret Redaction
- **Type:** Security
- **Description:** Real-time `SecretMasker` middleware that intercepts sandbox output and redacts high-entropy strings (API keys, tokens) before they enter the logs or LLM context.
- **Source:** User Features (specs/4_user_features.md)
- **Dependencies:** None

### **[8_RISKS-REQ-015]** Post-Install Audit Gate
- **Type:** Security
- **Description:** Every dependency installation turn MUST be followed by an automated audit (e.g., npm audit). Any "High" or "Critical" vulnerability triggers a task failure.
- **Source:** Risks and Mitigation (specs/8_risks_mitigation.md)
- **Dependencies:** None

### **[9_ROADMAP-REQ-021]** Redaction Accuracy
- **Type:** Security
- **Description:** Redaction Accuracy: `SecretMasker` must achieve >99.9% recall on a benchmark of 500+ diverse secrets (API keys, SSH tokens).
- **Source:** Project Roadmap (specs/9_project_roadmap.md)
- **Dependencies:** None

### **[4_USER_FEATURES-REQ-081]** Requirement Contradiction Detection
- **Type:** Security
- **Description:** Distiller Agent detects logical mismatches between docs (e.g., Offline First vs. Postgres-only) and requires clarification.
- **Source:** User Features (specs/4_user_features.md)
- **Dependencies:** None

### **[8_RISKS-REQ-109]** Sandbox Escape & Host Compromise Risk Mitigation
- **Type:** Security
- **Description:** Mitigation for Sandbox Escape & Host Compromise risk through Zero-Trust Containerization.
- **Source:** Risks and Mitigation (specs/8_risks_mitigation.md)
- **Dependencies:** None

### **[1_PRD-REQ-UI-015]** Sandbox Escape Monitoring
- **Type:** Security
- **Description:** Real-time monitoring and pause on unauthorized filesystem or network access.
- **Source:** PRD (Product Requirements Document) (specs/1_prd.md)
- **Dependencies:** None

### **[4_USER_FEATURES-REQ-082]** Sandbox Escape/Resource Exhaustion Detection
- **Type:** Security
- **Description:** Sandbox Monitor kills processes at 100% CPU usage spike (e.g., recursive script) after 10 seconds.
- **Source:** User Features (specs/4_user_features.md)
- **Dependencies:** None

### **[9_ROADMAP-REQ-020]** Sandbox Isolation
- **Type:** Security
- **Description:** Sandbox Isolation: 100% of unauthorized network egress attempts must be blocked and logged.
- **Source:** Project Roadmap (specs/9_project_roadmap.md)
- **Dependencies:** None

### **[1_PRD-REQ-OOS-015]** Secret Management & Vault Hosting
- **Type:** Security
- **Description:** Out of Scope: No hosting/management of secrets (Vault, etc.).
- **Source:** PRD (Product Requirements Document) (specs/1_prd.md)
- **Dependencies:** None

### **[1_PRD-REQ-GOAL-008]** Secure, Sandboxed Autonomy
- **Type:** Security
- **Description:** All code execution and testing must occur within a strictly isolated environment (Docker/WebContainers).
- **Source:** PRD (Product Requirements Document) (specs/1_prd.md)
- **Dependencies:** None

### **[8_RISKS-REQ-027]** Security-Focused Reviewer Prompt
- **Type:** Security
- **Description:** The Reviewer Agent is specifically instructed to flag patterns like eval(), dangerouslySetInnerHTML, or unparameterized queries even if they pass the functional tests.
- **Source:** Risks and Mitigation (specs/8_risks_mitigation.md)
- **Dependencies:** None

### **[8_RISKS-REQ-112]** Supply Chain Attacks & Typosquatting Risk Mitigation
- **Type:** Security
- **Description:** Mitigation for Supply Chain Attacks & Typosquatting risk through Dependency Whitelisting & Audits.
- **Source:** Risks and Mitigation (specs/8_risks_mitigation.md)
- **Dependencies:** None

### **[1_PRD-REQ-UI-007]** Tool Call Interception (Safety Mode)
- **Type:** Security
- **Description:** Configurable mode requiring approval for filesystem changes or network requests.
- **Source:** PRD (Product Requirements Document) (specs/1_prd.md)
- **Dependencies:** None

### **[8_RISKS-REQ-017]** Untrusted Context Delimitation
- **Type:** Security
- **Description:** All data ingested from external sources MUST be wrapped in strict delimiters (e.g., <untrusted_research_data>) in the LLM prompt.
- **Source:** Risks and Mitigation (specs/8_risks_mitigation.md)
- **Dependencies:** None

### **[9_ROADMAP-RISK-SEC-01]** WebContainer syscall compatibility for non-JS languages (Rust/Go).
- **Type:** Security
- **Description:** WebContainer syscall compatibility for non-JS languages (Rust/Go).
- **Source:** Project Roadmap (specs/9_project_roadmap.md)
- **Dependencies:** None

### **[1_PRD-REQ-MET-016]** Zero Sandbox Escapes
- **Type:** Security
- **Description:** Zero unauthorized filesystem or network access attempts.
- **Source:** PRD (Product Requirements Document) (specs/1_prd.md)
- **Dependencies:** None

### **[8_RISKS-REQ-063]** Zero-Data-Retention Option
- **Type:** Security
- **Description:** Support for Enterprise LLM endpoints that guarantee user code is not used for model training.
- **Source:** Risks and Mitigation (specs/8_risks_mitigation.md)
- **Dependencies:** None

### **[8_RISKS-REQ-135]** Competitive Encroachment (Platform Erosion) Risk
- **Type:** Strategic
- **Description:** Risk that major IDE players integrate orchestration natively, rendering 'devs' redundant.
- **Source:** Risks and Mitigation (specs/8_risks_mitigation.md)
- **Dependencies:** None

### **[8_RISKS-REQ-132]** Economic Viability (Token Inflation) Risk
- **Type:** Strategic
- **Description:** Risk that project generation cost exceeds solo "Maker" budget due to agent inefficiency or retries.
- **Source:** Risks and Mitigation (specs/8_risks_mitigation.md)
- **Dependencies:** None

### **[8_RISKS-REQ-062]** Human-in-the-Loop Sign-off
- **Type:** Strategic
- **Description:** All architectural decisions (PRD/TAS) require explicit user approval, ensuring significant human "creative direction" is part of the audit trail.
- **Source:** Risks and Mitigation (specs/8_risks_mitigation.md)
- **Dependencies:** None

### **[8_RISKS-REQ-134]** Intellectual Property (IP) & Copyright Uncertainty Risk
- **Type:** Strategic
- **Description:** Risk regarding legal precedents of copyrightability of AI-generated code.
- **Source:** Risks and Mitigation (specs/8_risks_mitigation.md)
- **Dependencies:** None

### **[8_RISKS-REQ-126]** Market Research Hallucination Risk Mitigation
- **Type:** Strategic
- **Description:** Mitigation for Market Research Hallucination risk through Cite-Checking & Source Validation.
- **Source:** Risks and Mitigation (specs/8_risks_mitigation.md)
- **Dependencies:** None

### **[8_RISKS-REQ-133]** Professional Trust & "Black-Box" Resistance Risk
- **Type:** Strategic
- **Description:** Risk that senior architects reject AI-generated code due to lack of control or auditing difficulty.
- **Source:** Risks and Mitigation (specs/8_risks_mitigation.md)
- **Dependencies:** None

### **[8_RISKS-REQ-065]** The "Architecture-First" Differentiator
- **Type:** Strategic
- **Description:** Focus on the Deep Research and TAS phase which general-purpose assistants currently ignore.
- **Source:** Risks and Mitigation (specs/8_risks_mitigation.md)
- **Dependencies:** None

### **[3_MCP-UNKNOWN-101]** 
- **Type:** Technical
- **Description:** How should the system handle multi-agent collaboration within the same Glass-Box? Will multiple agents write to the same `agent_logs` thread, or should each have a dedicated `agent_id` partition?
- **Source:** MCP and AI Development Design (specs/3_mcp_design.md)
- **Dependencies:** None

### **[3_MCP-UNKNOWN-201]** 
- **Type:** Technical
- **Description:** How should the system handle MCP tool execution in a multi-container environment (e.g., a microservices project)? Will each service have its own ProjectServer?
- **Source:** MCP and AI Development Design (specs/3_mcp_design.md)
- **Dependencies:** None

### **[3_MCP-UNKNOWN-301]** 
- **Type:** Technical
- **Description:** Require a `TAS_REVISION_GATE` with user approval).
- **Source:** MCP and AI Development Design (specs/3_mcp_design.md)
- **Dependencies:** None

### **[3_MCP-UNKNOWN-302]** 
- **Type:** Technical
- **Description:** How should the system handle long-running background processes (e.g., a database migration) that might span multiple nodes?
- **Source:** MCP and AI Development Design (specs/3_mcp_design.md)
- **Dependencies:** None

### **[3_MCP-UNKNOWN-501]** 
- **Type:** Technical
- **Description:** Should we support "Shared Memory" across different projects built by the same user (e.g., a common UI library preference)?
- **Source:** MCP and AI Development Design (specs/3_mcp_design.md)
- **Dependencies:** None

### **[3_MCP-UNKNOWN-502]** 
- **Type:** Technical
- **Description:** User directives always take precedence in Short-term memory).
- **Source:** MCP and AI Development Design (specs/3_mcp_design.md)
- **Dependencies:** None

### **[4_USER_FEATURES-REQ-062]** "Suspended Sandbox" Access
- **Type:** Technical
- **Description:** One-click terminal access (`devs debug --task <ID>`) into the exact container state where a failure occurred.
- **Source:** User Features (specs/4_user_features.md)
- **Dependencies:** None

### **[3_MCP-TAS-070]** 1.2.1 Turn Envelope Schema & Execution Logic
- **Type:** Technical
- **Description:** Every interaction turn is encapsulated in a strictly-typed JSON structure. The orchestrator MUST validate the schema before execution.
- **Source:** MCP and AI Development Design (specs/3_mcp_design.md)
- **Dependencies:** None

### **[3_MCP-TAS-077]** 2.1.1 Core Toolset
- **Type:** Technical
- **Description:** | Tool | Parameters | Return Type | Description | | :--- | :--- | :--- | :--- | | `get_project_context` | `{ project_id: string, include_docs?: boolean }` | `ProjectContext` | Returns the active PRD, TAS, and a summary of requirement fulfillment. | | `search_memory` | `{ query: string, limit?: number, type?: MemoryType }` | `MemoryResult[]` | Performs semantic search across the LanceDB vector store (Long-term Memory). |
- **Source:** MCP and AI Development Design (specs/3_mcp_design.md)
- **Dependencies:** None

### **[3_MCP-TAS-078]** 2.1.2 Data Models (Orchestrator)
- **Type:** Technical
- **Description:** ```typescript interface ProjectContext { requirements: Array<{ id: string; status: "pending" | "met" | "failed"; doc_link: string }>; active_epic: { id: string; title: string; progress: number };
- **Source:** MCP and AI Development Design (specs/3_mcp_design.md)
- **Dependencies:** None

### **[3_MCP-TAS-079]** 2.2.1 Core Toolset
- **Type:** Technical
- **Description:** | Tool | Parameters | Return Type | Description | | :--- | :--- | :--- | :--- | | `filesystem_operation` | `{ action: "read" \| "write" \| "list" \| "move", path: string, content?: string }` | `FSResult` | Atomic file operations with path validation and size limits (max 500KB per read). | | `apply_surgical_edits` | `{ path: string, edits: Array<{ old: string, new: string }> }` | `EditResult` | Replaces specific text blocks to prevent full-file overwrite corruption. |
- **Source:** MCP and AI Development Design (specs/3_mcp_design.md)
- **Dependencies:** None

### **[3_MCP-TAS-080]** 2.3.1 Core Toolset
- **Type:** Technical
- **Description:** | Tool | Parameters | Return Type | Description | | :--- | :--- | :--- | :--- | | `inspect_state` | `{ path: string, depth?: number }` | `JSON` | Reads internal memory, cache values, or singleton states of the running application. | | `run_test_task` | `{ test_path: string, reporter: "json" \| "tap" }` | `StructuredTestReport` | Executes specific tests and returns machine-readable failure analysis (stack traces, diffs). |
- **Source:** MCP and AI Development Design (specs/3_mcp_design.md)
- **Dependencies:** None

### **[3_MCP-TAS-041]** 3.1.2 The Binary Gate Protocol
- **Type:** Technical
- **Description:** Transition between nodes is governed by strict exit-code gates within the sandbox.
- **Source:** MCP and AI Development Design (specs/3_mcp_design.md)
- **Dependencies:** None

### **[3_MCP-REQ-MET-009]** 3.2.2 The Reviewer Agent's Hierarchy of Concerns
- **Type:** Technical
- **Description:** The Reviewer Agent does not just run tests; it performs a multi-dimensional audit: 1. **Requirement Fidelity**: Does the implementation meet the *atomic requirement* defined in the Task? 2. **TAS Compliance**: Does the code use approved patterns? (e.g., "Did the agent use an external library not in the TAS?"). 3. **Agentic Observability**: Does the module include the required `.agent.md` documentation and "Introspection Points" for the `ProjectServer`?
- **Source:** MCP and AI Development Design (specs/3_mcp_design.md)
- **Dependencies:** None

### **[3_MCP-TAS-092]** 3.4.2 State Introspection during Failures
- **Type:** Technical
- **Description:** If the `CodeNode` cannot reach the GREEN gate after 5 turns: 1. The agent is encouraged to use `inspect_state` (ProjectServer) to look at internal application memory. 2. This "Expert Debugger" mode allows the agent to see *why* a variable is null or why a state transition failed, reducing hallucination-driven implementation attempts.
- **Source:** MCP and AI Development Design (specs/3_mcp_design.md)
- **Dependencies:** None

### **[3_MCP-REQ-MET-010]** 3.5.1 The "Shadow Requirement" Problem
- **Type:** Technical
- **Description:** Risk**: Agents may implement extra features not in the requirement ("Scope Creep"). - **Mitigation**: The Reviewer Agent specifically checks for code additions that have no corresponding test case or requirement mapping.
- **Source:** MCP and AI Development Design (specs/3_mcp_design.md)
- **Dependencies:** None

### **[3_MCP-TAS-093]** 3.5.2 Dependency Collision
- **Type:** Technical
- **Description:** Risk**: `Task A` installs `lib-v1` and `Task B` (in parallel) installs `lib-v2`. - **Mitigation**: The `SandboxServer`'s `dependency_manager` tool performs a `git lock` on `package.json` to ensure sequential updates and triggers a `npm audit` after every change.
- **Source:** MCP and AI Development Design (specs/3_mcp_design.md)
- **Dependencies:** None

### **[3_MCP-TAS-016]** **[3_MCP-TAS-017]** **[3_MCP-TAS-018]** 5.1 The Tiered Memory Hierarchy [3_MCP-TAS-017] [3_MCP-TAS-018
- **Type:** Technical
- **Description:** | Tier | Persistence | Implementation | Scope | Key Data Points | | :--- | :--- | :--- | :--- | :--- | | **Short-Term (Working Set)** | Volatile (In-Context) | LLM Active Window | Active Task | Current Task ID, last 10 turns, active file buffers, terminal observations. | | **Medium-Term (Epic Context)** | Relational | SQLite (`agent_logs`) | Active Epic | Summaries of previous tasks in the Epic, failed strategy logs, Epic-level TAS overrides. |
- **Source:** MCP and AI Development Design (specs/3_mcp_design.md)
- **Dependencies:** None

### **[9_ROADMAP-FUTURE-002]** : "Team Mode": Multi-user collaborative project development.
- **Type:** Technical
- **Description:** : "Team Mode": Multi-user collaborative project development.
- **Source:** Project Roadmap (specs/9_project_roadmap.md)
- **Dependencies:** None

### **[9_ROADMAP-FUTURE-003]** : Automated PR Reviewer: Integrating 'devs' into existing GitHub workflows.
- **Type:** Technical
- **Description:** : Automated PR Reviewer: Integrating 'devs' into existing GitHub workflows.
- **Source:** Project Roadmap (specs/9_project_roadmap.md)
- **Dependencies:** None

### **[9_ROADMAP-BLOCKER-003]** : How does the system handle "Dependency Deadlocks" where two parallel tasks in
- **Type:** Technical
- **Description:** : How does the system handle "Dependency Deadlocks" where two parallel tasks in the same Epic require conflicting library versions?
- **Source:** Project Roadmap (specs/9_project_roadmap.md)
- **Dependencies:** None

### **[9_ROADMAP-BLOCKER-002]** : Is the `surgical_edit` tool precise enough to handle multi-file refactors with
- **Type:** Technical
- **Description:** : Is the `surgical_edit` tool precise enough to handle multi-file refactors without introducing syntax errors that the agent cannot recover from?
- **Source:** Project Roadmap (specs/9_project_roadmap.md)
- **Dependencies:** None

### **[9_ROADMAP-FUTURE-004]** : Native Mobile App: Monitoring project builds on the go.
- **Type:** Technical
- **Description:** : Native Mobile App: Monitoring project builds on the go.
- **Source:** Project Roadmap (specs/9_project_roadmap.md)
- **Dependencies:** None

### **[9_ROADMAP-FUTURE-001]** : Support for local LLMs (Ollama/vLLM) for enterprise offline mode.
- **Type:** Technical
- **Description:** : Support for local LLMs (Ollama/vLLM) for enterprise offline mode.
- **Source:** Project Roadmap (specs/9_project_roadmap.md)
- **Dependencies:** None

### **[9_ROADMAP-BLOCKER-001]** : Will the `ContextPruner` be able to maintain architectural intent across 100+
- **Type:** Technical
- **Description:** : Will the `ContextPruner` be able to maintain architectural intent across 100+ turns without triggering "Model Drift"?
- **Source:** Project Roadmap (specs/9_project_roadmap.md)
- **Dependencies:** None

### **[TAS-098]** @devs/agents
- **Type:** Technical
- **Description:** Encapsulates LLM logic, prompts, and tool bindings.
- **Source:** TAS (Technical Architecture Specification) (specs/2_tas.md)
- **Dependencies:** None

### **[4_USER_FEATURES-REQ-070]** API Connectivity Monitoring
- **Type:** Technical
- **Description:** Real-time status indicators for Gemini API, Docker socket, and search provider connectivity.
- **Source:** User Features (specs/4_user_features.md)
- **Dependencies:** None

### **[3_MCP-TAS-048]** Active File Management
- **Type:** Technical
- **Description:** The `SandboxServer` provides tools to "Pin" specific files to the context window. Agents can read up to 5 files simultaneously; beyond that, older files are swapped out to prevent token overflow.
- **Source:** MCP and AI Development Design (specs/3_mcp_design.md)
- **Dependencies:** None

### **[8_RISKS-REQ-125]** Agent Deadlock (Reviewer vs Dev) Risk Mitigation
- **Type:** Technical
- **Description:** Mitigation for Agent Deadlock risk through User Clarification & Pivot Logic.
- **Source:** Risks and Mitigation (specs/8_risks_mitigation.md)
- **Dependencies:** None

### **[TAS-079]** Agent Suite
- **Type:** Technical
- **Description:** A collection of specialized agents (Research, Architect, Developer, Reviewer) each with dedicated system prompts and tool-access permissions.
- **Source:** TAS (Technical Architecture Specification) (specs/2_tas.md)
- **Dependencies:** None

### **[8_RISKS-REQ-074]** Agent Suspension
- **Type:** Technical
- **Description:** The active task is moved to PAUSED_FOR_INTERVENTION, and the sandbox is preserved ("Suspended State").
- **Source:** Risks and Mitigation (specs/8_risks_mitigation.md)
- **Dependencies:** None

### **[1_PRD-REQ-OBS-002]** Agent-Oriented Documentation (AOD)
- **Type:** Technical
- **Description:** Module-level `.agent.md` files defining Intent, Testability, and Edge Cases.
- **Source:** PRD (Product Requirements Document) (specs/1_prd.md)
- **Dependencies:** None

### **[3_MCP-REQ-MET-008]** Agent-Oriented Documentation (AOD)
- **Type:** Technical
- **Description:** The ProjectServer MUST register all tools in the `.agent/index.agent.md` manifest so agents know which "Introspection Points" are available.
- **Source:** MCP and AI Development Design (specs/3_mcp_design.md)
- **Dependencies:** None

### **[REQ-GOAL-004]** Agent-Ready Debugging
- **Type:** Technical
- **Description:** Blueprint for MCP server injected into every generated project to enable agentic debugging.
- **Source:** TAS (Technical Architecture Specification) (specs/2_tas.md)
- **Dependencies:** [2_TAS-REQ-031]

### **[2_TAS-REQ-020]** AgentFactory
- **Type:** Technical
- **Description:** Dynamically instantiates agents based on Tier and System Prompts.
- **Source:** TAS (Technical Architecture Specification) (specs/2_tas.md)
- **Dependencies:** [TAS-098]

### **[8_RISKS-REQ-108]** Agentic Looping & Token Exhaustion Risk Mitigation
- **Type:** Technical
- **Description:** Mitigation for Agentic Looping & Token Exhaustion risk through Entropy Detection & Turn Limits.
- **Source:** Risks and Mitigation (specs/8_risks_mitigation.md)
- **Dependencies:** None

### **[3_MCP-TAS-001]** Agentic Observability & Traceability
- **Type:** Technical
- **Description:** Every decision, tool call, and reasoning step is logged, queryable, and streamable in real-time.
- **Source:** MCP and AI Development Design (specs/3_mcp_design.md)
- **Dependencies:** None

### **[1_PRD-REQ-PIL-004]** Agentic Observability & Traceability (Glass-Box)
- **Type:** Technical
- **Description:** Every decision, tool call, and reasoning step must be logged and queryable to eliminate the "Black-Box" mystery.
- **Source:** PRD (Product Requirements Document) (specs/1_prd.md)
- **Dependencies:** None

### **[8_RISKS-REQ-066]** Agentic Observability (MCP)
- **Type:** Technical
- **Description:** Build the most robust MCP-native debugging environment, making 'devs'-generated projects easier to maintain than generic AI-scaffolded ones.
- **Source:** Risks and Mitigation (specs/8_risks_mitigation.md)
- **Dependencies:** None

### **[1_PRD-REQ-NEED-DOMAIN-02]** Agentic profiling via MCP
- **Type:** Technical
- **Description:** Agentic profiling via MCP to explain performance bottlenecks in unfamiliar code.
- **Source:** PRD (Product Requirements Document) (specs/1_prd.md)
- **Dependencies:** None

### **[3_MCP-TAS-063]** Agents discover available tools through the MCP `list_tools` capability, which is filtered by the orchestrator based on the current Phase.
- **Type:** Technical
- **Description:** Agents discover available tools through the MCP `list_tools` capability, which is filtered by the orchestrator based on the current Phase.
- **Source:** MCP and AI Development Design (specs/3_mcp_design.md)
- **Dependencies:** None

### **[3_MCP-TAS-035]** All interactions between the Agent Suite and the Orchestration Layer MUST follow the SAOP specification to ensure deterministic execution and transparent reasoning.
- **Type:** Technical
- **Description:** All interactions between the Agent Suite and the Orchestration Layer MUST follow the SAOP specification to ensure deterministic execution and transparent reasoning.
- **Source:** MCP and AI Development Design (specs/3_mcp_design.md)
- **Dependencies:** None

### **[8_RISKS-REQ-022]** Arbitration Node
- **Type:** Technical
- **Description:** On the 3rd disagreement turn, a 3rd "Arbitrator Agent" (using a high-reasoning prompt) is invoked to review both reasoning traces and provide a binding decision.
- **Source:** Risks and Mitigation (specs/8_risks_mitigation.md)
- **Dependencies:** None

### **[1_PRD-REQ-MET-004]** Architectural Fidelity Score (AFS)
- **Type:** Technical
- **Description:** <5% variance between TAS folder structure/dependency graph and implementation.
- **Source:** PRD (Product Requirements Document) (specs/1_prd.md)
- **Dependencies:** None

### **[8_RISKS-REQ-013]** Architectural Lesson Vectorization
- **Type:** Technical
- **Description:** Critical decisions made mid-task are vectorized into LanceDB (Long-term Memory) to ensure they persist across Epics even if the short-term context is cleared.
- **Source:** Risks and Mitigation (specs/8_risks_mitigation.md)
- **Dependencies:** None

### **[1_PRD-REQ-PIL-002]** Architecture-Driven Development (ADD)
- **Type:** Technical
- **Description:** Every project must have a validated PRD and TAS before implementation begins to ensure agents build against a stable, human-approved design.
- **Source:** PRD (Product Requirements Document) (specs/1_prd.md)
- **Dependencies:** None

### **[TAS-033]** Automated Code Auditing
- **Type:** Technical
- **Description:** Integration of ESLint, Prettier, and language-specific static analysis tools in the TDD loop.
- **Source:** TAS (Technical Architecture Specification) (specs/2_tas.md)
- **Dependencies:** None

### **[1_PRD-REQ-NEED-ARCH-03]** Automated Reviewer Agents
- **Type:** Technical
- **Description:** Automated Reviewer Agents that catch "anti-patterns" or security flaws.
- **Source:** PRD (Product Requirements Document) (specs/1_prd.md)
- **Dependencies:** None

### **[4_USER_FEATURES-REQ-071]** Automated State Integrity Checks
- **Type:** Technical
- **Description:** Background validation of SQLite and LanceDB files with "Auto-Repair" prompts for corruption.
- **Source:** User Features (specs/4_user_features.md)
- **Dependencies:** None

### **[9_ROADMAP-M-3]** Autonomy (Phase 6-8)
- **Type:** Technical
- **Description:** Autonomy (Phase 6-8)
- **Source:** Project Roadmap (specs/9_project_roadmap.md)
- **Dependencies:** None

### **[2_TAS-REQ-033]** CLIController
- **Type:** Technical
- **Description:** Handles CLI arguments and terminal progress reporting.
- **Source:** TAS (Technical Architecture Specification) (specs/2_tas.md)
- **Dependencies:** [TAS-102]

### **[8_RISKS-REQ-058]** Caching & Memoization
- **Type:** Technical
- **Description:** Orchestrator MUST cache successful research results and distilled requirements across project attempts to avoid redundant API calls.
- **Source:** Risks and Mitigation (specs/8_risks_mitigation.md)
- **Dependencies:** None

### **[8_RISKS-REQ-044]** Canonical Sandbox Images
- **Type:** Technical
- **Description:** Every project MUST use a version-locked base image (Docker/WebContainer) defined in the TAS.
- **Source:** Risks and Mitigation (specs/8_risks_mitigation.md)
- **Dependencies:** None

### **[1_PRD-REQ-CON-003]** Conflict Resolution
- **Type:** Technical
- **Description:** Automate resolution or escalate to the user when Reviewer and Developer agents disagree.
- **Source:** PRD (Product Requirements Document) (specs/1_prd.md)
- **Dependencies:** None

### **[TAS-028]** Content Extraction
- **Type:** Technical
- **Description:** Firecrawl or Jina Reader for converting web content into LLM-optimized Markdown.
- **Source:** TAS (Technical Architecture Specification) (specs/2_tas.md)
- **Dependencies:** None

### **[3_MCP-RISK-303]** Context Drift
- **Type:** Technical
- **Description:** Summaries lose critical technical nuance. Mitigation: Always prioritize the TAS and raw Requirements in the pruning window.
- **Source:** MCP and AI Development Design (specs/3_mcp_design.md)
- **Dependencies:** None

### **[1_PRD-REQ-MET-010]** Context Optimization Efficiency
- **Type:** Technical
- **Description:** Keep active context windows <200k tokens for 90% of tasks.
- **Source:** PRD (Product Requirements Document) (specs/1_prd.md)
- **Dependencies:** None

### **[3_MCP-RISK-503]** Context Poisoning
- **Type:** Technical
- **Description:** Only "Approved" tasks and "Verified" architectural decisions are committed to the Vector DNA.
- **Source:** MCP and AI Development Design (specs/3_mcp_design.md)
- **Dependencies:** None

### **[4_USER_FEATURES-REQ-018]** Context Pruning & Refresh
- **Type:** Technical
- **Description:** Automatic sliding-window management to keep agent context windows focused while re-injecting core TAS/PRD blueprints every 10 turns to prevent "reasoning decay."
- **Source:** User Features (specs/4_user_features.md)
- **Dependencies:** None

### **[TAS-024]** Context Pruning Requirement
- **Type:** Technical
- **Description:** Flash model summarization triggered at 800k tokens to preserve critical context.
- **Source:** TAS (Technical Architecture Specification) (specs/2_tas.md)
- **Dependencies:** None

### **[3_MCP-TAS-089]** Context Refresh
- **Type:** Technical
- **Description:** After 5 turns in a single node, the orchestrator re-injects the TAS and PRD summary to prevent reasoning drift.
- **Source:** MCP and AI Development Design (specs/3_mcp_design.md)
- **Dependencies:** None

### **[8_RISKS-REQ-111]** Context Saturation & Reasoning Decay Risk Mitigation
- **Type:** Technical
- **Description:** Mitigation for Context Saturation & Reasoning Decay risk through Sliding Window Summarization.
- **Source:** Risks and Mitigation (specs/8_risks_mitigation.md)
- **Dependencies:** None

### **[1_PRD-REQ-PERF-001]** Context Window Compression & Pruning
- **Type:** Technical
- **Description:** Sliding relevance window and summarization handoffs to manage context.
- **Source:** PRD (Product Requirements Document) (specs/1_prd.md)
- **Dependencies:** None

### **[RISK-802]** Context Window Exhaustion
- **Type:** Technical
- **Description:** Long-running tasks with heavy failures can fill the 1M token window.
- **Source:** TAS (Technical Architecture Specification) (specs/2_tas.md)
- **Dependencies:** None

### **[1_PRD-REQ-CON-004]** Context Window Optimization
- **Type:** Technical
- **Description:** Efficient context pruning to prioritize relevant task requirements and architectural constraints.
- **Source:** PRD (Product Requirements Document) (specs/1_prd.md)
- **Dependencies:** None

### **[3_MCP-TAS-024]** Context Window Saturation Mitigation
- **Type:** Technical
- **Description:** Mandatory summarization of intermediate turns, preserving only the Plan, TAS, and the current failing Observation.
- **Source:** MCP and AI Development Design (specs/3_mcp_design.md)
- **Dependencies:** None

### **[2_TAS-REQ-028]** ContextPruner
- **Type:** Technical
- **Description:** Sophisticated logic for sliding-window context management for 1M token limits.
- **Source:** TAS (Technical Architecture Specification) (specs/2_tas.md)
- **Dependencies:** [TAS-100]

### **[8_RISKS-REQ-076]** Contextual Ingestion
- **Type:** Technical
- **Description:** Upon resume, the agent executes a diff_analysis tool to identify user changes and updates its Medium-term Memory.
- **Source:** Risks and Mitigation (specs/8_risks_mitigation.md)
- **Dependencies:** [8_RISKS-REQ-075]

### **[TAS-077]** Core Toolset Scoping
- **Type:** Technical
- **Description:** Tools are exposed to agents based on the current Phase and Epic context.
- **Source:** TAS (Technical Architecture Specification) (specs/2_tas.md)
- **Dependencies:** None

### **[8_RISKS-REQ-005]** Cost Guardrails
- **Type:** Technical
- **Description:** Real-time USD tracking per task. If a single task exceeds a user-defined threshold (default $5.00), the orchestrator suspends execution.
- **Source:** Risks and Mitigation (specs/8_risks_mitigation.md)
- **Dependencies:** None

### **[TAS-074]** Cross-Agent Verification Requirement
- **Type:** Technical
- **Description:** ReviewerAgent independently verifies DeveloperAgent's task completion in a clean sandbox.
- **Source:** TAS (Technical Architecture Specification) (specs/2_tas.md)
- **Dependencies:** None

### **[8_RISKS-REQ-077]** DNA Encoding
- **Type:** Technical
- **Description:** The user's fix is vectorized into Long-term Memory as a USER_PREFERENCE to ensure future agents adhere to the manual logic.
- **Source:** Risks and Mitigation (specs/8_risks_mitigation.md)
- **Dependencies:** [8_RISKS-REQ-076]

### **[8_RISKS-REQ-078]** Deep Purge
- **Type:** Technical
- **Description:** Execution of docker-compose down -v followed by a cleanup of ephemeral volumes.
- **Source:** Risks and Mitigation (specs/8_risks_mitigation.md)
- **Dependencies:** None

### **[8_RISKS-REQ-119]** Dependency Collision (Parallelism) Risk Mitigation
- **Type:** Technical
- **Description:** Mitigation for Dependency Collision risk through Task DAG Serialization Rules.
- **Source:** Risks and Mitigation (specs/8_risks_mitigation.md)
- **Dependencies:** None

### **[4_USER_FEATURES-REQ-015]** Dependency DAG Execution
- **Type:** Technical
- **Description:** Intelligent task scheduler that respects technical dependencies and enables parallel execution of independent tasks within the same Epic.
- **Source:** User Features (specs/4_user_features.md)
- **Dependencies:** None

### **[3_MCP-RISK-302]** Dependency Deadlock
- **Type:** Technical
- **Description:** Agent installs a package that conflicts with TAS. Mitigation: Reviewer Agent must validate package.json diffs against TAS allowed_libraries.
- **Source:** MCP and AI Development Design (specs/3_mcp_design.md)
- **Dependencies:** None

### **[TAS-025]** Dependency Deadlock Resolution
- **Type:** Technical
- **Description:** ReviewerAgent blocks commits that conflict with TAS; triggers TAS Reconciliation.
- **Source:** TAS (Technical Architecture Specification) (specs/2_tas.md)
- **Dependencies:** None

### **[1_PRD-REQ-CON-005]** Dependency Management
- **Type:** Technical
- **Description:** Ensure agents do not introduce conflicting or insecure third-party dependencies.
- **Source:** PRD (Product Requirements Document) (specs/1_prd.md)
- **Dependencies:** None

### **[1_PRD-REQ-NEED-DEVS-01]** Detailed tracing
- **Type:** Technical
- **Description:** Detailed tracing of "Agent-to-Agent" communication.
- **Source:** PRD (Product Requirements Document) (specs/1_prd.md)
- **Dependencies:** None

### **[1_PRD-REQ-NEED-AGENT-03]** Determinism
- **Type:** Technical
- **Description:** Consistent behavior from the Sandbox and Test Runner.
- **Source:** PRD (Product Requirements Document) (specs/1_prd.md)
- **Dependencies:** None

### **[1_PRD-REQ-UI-016]** Deterministic "Snapshot" Points
- **Type:** Technical
- **Description:** Create filesystem snapshots before large or experimental tasks.
- **Source:** PRD (Product Requirements Document) (specs/1_prd.md)
- **Dependencies:** None

### **[8_RISKS-REQ-012]** Deterministic Context Pruning
- **Type:** Technical
- **Description:** Large tool outputs (e.g., multi-megabyte log files) MUST be summarized or truncated after 2 turns, while maintaining the full raw output in the state.sqlite for deep-querying if needed.
- **Source:** Risks and Mitigation (specs/8_risks_mitigation.md)
- **Dependencies:** None

### **[8_RISKS-REQ-002]** Deterministic Entropy Detection
- **Type:** Technical
- **Description:** The orchestrator MUST maintain a rolling buffer of the last 3 tool observations (stdout/stderr). If SHA256(obs_n) == SHA256(obs_n-1), the entropy counter increments.
- **Source:** Risks and Mitigation (specs/8_risks_mitigation.md)
- **Dependencies:** None

### **[1_PRD-REQ-GOAL-005]** Deterministic Reliability via Multi-Agent Verification
- **Type:** Technical
- **Description:** Mandate a 100% pass rate on generated tests using multi-agent cross-verification (Developer Agent and Reviewer Agent).
- **Source:** PRD (Product Requirements Document) (specs/1_prd.md)
- **Dependencies:** None

### **[4_USER_FEATURES-REQ-068]** Directive History Trace
- **Type:** Technical
- **Description:** Log of all human interventions during failure states, vectorized into Long-term Memory.
- **Source:** User Features (specs/4_user_features.md)
- **Dependencies:** None

### **[9_ROADMAP-DOD-P3]** Discovery (The Eyes)
- **Type:** Technical
- **Description:** Discovery (The Eyes)
- **Source:** Project Roadmap (specs/9_project_roadmap.md)
- **Dependencies:** None

### **[2_TAS-REQ-025]** DockerDriver
- **Type:** Technical
- **Description:** CLI implementation of sandbox using ephemeral Docker containers.
- **Source:** TAS (Technical Architecture Specification) (specs/2_tas.md)
- **Dependencies:** [2_TAS-REQ-024]

### **[1_PRD-REQ-MET-007]** Documentation Density (AOD)
- **Type:** Technical
- **Description:** 1:1 ratio of logic modules to Agent-Oriented Documentation files.
- **Source:** PRD (Product Requirements Document) (specs/1_prd.md)
- **Dependencies:** None

### **[3_MCP-REQ-MET-007]** Documentation Density (AOD)
- **Type:** Technical
- **Description:** Every significant module MUST include an Agent-Oriented Documentation (`.agent.md`) file defining intent, architecture, and agentic hooks.
- **Source:** MCP and AI Development Design (specs/3_mcp_design.md)
- **Dependencies:** None

### **[RISK-602]** Documentation Drift
- **Type:** Technical
- **Description:** Source code and agent-oriented documentation may drift over time.
- **Source:** TAS (Technical Architecture Specification) (specs/2_tas.md)
- **Dependencies:** None

### **[8_RISKS-REQ-131]** Ecosystem Dependency & Model Lock-in Risk
- **Type:** Technical
- **Description:** Risk that 'devs' is heavily optimized for Gemini 3 Pro and MCP protocol, potentially becoming obsolete if standards shift.
- **Source:** Risks and Mitigation (specs/8_risks_mitigation.md)
- **Dependencies:** None

### **[1_PRD-REQ-OBS-007]** Edge Cases
- **Type:** Technical
- **Description:** Known edge cases and constraints documented in AOD.
- **Source:** PRD (Product Requirements Document) (specs/1_prd.md)
- **Dependencies:** None

### **[1_PRD-REQ-GOAL-002]** Elimination of Architectural Debt and "Boilerplate Tax"
- **Type:** Technical
- **Description:** Automate the generation of standardized, clean-code project foundations following modern patterns (SOLID, Clean Architecture).
- **Source:** PRD (Product Requirements Document) (specs/1_prd.md)
- **Dependencies:** None

### **[4_USER_FEATURES-REQ-022]** Entropy & Loop Detection
- **Type:** Technical
- **Description:** Algorithmic monitoring of repeating error hashes; automatically triggers a "Strategy Pivot" or human-in-the-loop pause if an agent gets stuck in a failing implementation cycle.
- **Source:** User Features (specs/4_user_features.md)
- **Dependencies:** None

### **[TAS-064]** Entropy Detection
- **Type:** Technical
- **Description:** Real-time monitoring of agent loops; pauses and alerts user if an agent repeats a failing strategy 3 times.
- **Source:** TAS (Technical Architecture Specification) (specs/2_tas.md)
- **Dependencies:** None

### **[3_MCP-TAS-019]** Entropy Detection
- **Type:** Technical
- **Description:** By comparing the hashes of the last 3 SAOP observation payloads, the system identifies looping behavior. If detected, the Glass-Box forces an "Architectural Review" turn where the agent must summarize its failures before proceeding.
- **Source:** MCP and AI Development Design (specs/3_mcp_design.md)
- **Dependencies:** None

### **[1_PRD-REQ-MET-015]** Entropy Detection Accuracy
- **Type:** Technical
- **Description:** >95% accuracy in identifying infinite loops or failed retries.
- **Source:** PRD (Product Requirements Document) (specs/1_prd.md)
- **Dependencies:** None

### **[4_USER_FEATURES-REQ-080]** Entropy Pause
- **Type:** Technical
- **Description:** Automatic suspension and hand-off to the user after 5 failed implementation attempts.
- **Source:** User Features (specs/4_user_features.md)
- **Dependencies:** None

### **[1_PRD-REQ-UI-012]** Entropy Pause (Max-Retry Threshold)
- **Type:** Technical
- **Description:** Pause and present Failure Analysis after 3 TDD loop failures.
- **Source:** PRD (Product Requirements Document) (specs/1_prd.md)
- **Dependencies:** None

### **[8_RISKS-REQ-046]** Environment Scrubbing
- **Type:** Technical
- **Description:** Mandatory stripping of host-specific environment variables before spawning any sandbox process.
- **Source:** Risks and Mitigation (specs/8_risks_mitigation.md)
- **Dependencies:** None

### **[8_RISKS-REQ-033]** Ephemeral Artifact Purging
- **Type:** Technical
- **Description:** Automated cleanup of node_modules/.cache, build logs, and temporary test artifacts between Epics.
- **Source:** Risks and Mitigation (specs/8_risks_mitigation.md)
- **Dependencies:** None

### **[2_TAS-REQ-018]** EventBus
- **Type:** Technical
- **Description:** Real-time event streaming for status updates to VSCode and CLI.
- **Source:** TAS (Technical Architecture Specification) (specs/2_tas.md)
- **Dependencies:** [TAS-097]

### **[3_MCP-TAS-043]** Every project generated by `devs` MUST include an internal MCP server at `<root>/mcp-server`. This enables the agent to interact with its own creation as an expert debugger.
- **Type:** Technical
- **Description:** Every project generated by `devs` MUST include an internal MCP server at `<root>/mcp-server`. This enables the agent to interact with its own creation as an expert debugger.
- **Source:** MCP and AI Development Design (specs/3_mcp_design.md)
- **Dependencies:** None

### **[1_PRD-REQ-OBS-004]** Execution
- **Type:** Technical
- **Description:** Ability to run specific modules or tests in isolation via MCP.
- **Source:** PRD (Product Requirements Document) (specs/1_prd.md)
- **Dependencies:** None

### **[9_ROADMAP-DOD-P2]** Execution (The Hands)
- **Type:** Technical
- **Description:** Execution (The Hands)
- **Source:** Project Roadmap (specs/9_project_roadmap.md)
- **Dependencies:** None

### **[8_RISKS-REQ-130]** Execution Environment Non-Determinism Risk Mitigation
- **Type:** Technical
- **Description:** Mitigation for Execution Environment Non-Determinism risk through Canonical Sandbox Images.
- **Source:** Risks and Mitigation (specs/8_risks_mitigation.md)
- **Dependencies:** None

### **[8_RISKS-REQ-021]** Expert Refinement Gates
- **Type:** Technical
- **Description:** Users can mark specific modules as "Expert Only," forcing the orchestrator to use the highest-reasoning model and requiring a 3-agent logic verification before commit.
- **Source:** Risks and Mitigation (specs/8_risks_mitigation.md)
- **Dependencies:** None

### **[RISK-402]** Extension Memory Limits
- **Type:** Technical
- **Description:** Orchestrator may hit memory limits when running inside a VSCode extension.
- **Source:** TAS (Technical Architecture Specification) (specs/2_tas.md)
- **Dependencies:** None

### **[2_TAS-REQ-034]** ExtensionHost
- **Type:** Technical
- **Description:** Manages VSCode extension lifecycle and trace streaming.
- **Source:** TAS (Technical Architecture Specification) (specs/2_tas.md)
- **Dependencies:** [TAS-102]

### **[8_RISKS-REQ-080]** Fallback Registry
- **Type:** Technical
- **Description:** If the primary image registry is unreachable, the system attempts failover to a secondary mirror or local cache.
- **Source:** Risks and Mitigation (specs/8_risks_mitigation.md)
- **Dependencies:** None

### **[8_RISKS-REQ-047]** File-Level Write Locking
- **Type:** Technical
- **Description:** The orchestrator MUST maintain a "Write Lock" on all files within the active task's input_files scope. No two parallel tasks can have overlapping writable file sets.
- **Source:** Risks and Mitigation (specs/8_risks_mitigation.md)
- **Dependencies:** None

### **[4_USER_FEATURES-REQ-040]** Flaky Test Detection
- **Type:** Technical
- **Description:** If a test passes once but fails during review, it is flagged as `FLAKY_POTENTIAL` and executed 3 times to verify stability.
- **Source:** User Features (specs/4_user_features.md)
- **Dependencies:** None

### **[3_MCP-TAS-021]** For failed implementation tasks, the system preserves the execution environment for manual inspection.
- **Type:** Technical
- **Description:** For failed implementation tasks, the system preserves the execution environment for manual inspection.
- **Source:** MCP and AI Development Design (specs/3_mcp_design.md)
- **Dependencies:** None

### **[9_ROADMAP-M-1]** Foundation (Phase 1-2)
- **Type:** Technical
- **Description:** Foundation (Phase 1-2)
- **Source:** Project Roadmap (specs/9_project_roadmap.md)
- **Dependencies:** None

### **[9_ROADMAP-DOD-P1]** Foundation (The Brain)
- **Type:** Technical
- **Description:** Foundation (The Brain)
- **Source:** Project Roadmap (specs/9_project_roadmap.md)
- **Dependencies:** None

### **[3_MCP-TAS-039]** Git-DB Correlation
- **Type:** Technical
- **Description:** Every successful task completion maps to a Git Commit. The `tasks` table stores the `HEAD` hash, enabling a "Hard Rewind" that restores both the filesystem and the database to a consistent historical state.
- **Source:** MCP and AI Development Design (specs/3_mcp_design.md)
- **Dependencies:** None

### **[3_MCP-TAS-094]** Git-SQLite Synchronization
- **Type:** Technical
- **Description:** Every task completion in the `ImplementationLoop` results in an atomic Git commit. The `tasks` table in `state.sqlite` records the `git_commit_hash` associated with the success state.
- **Source:** MCP and AI Development Design (specs/3_mcp_design.md)
- **Dependencies:** None

### **[4_USER_FEATURES-REQ-043]** Graceful Suspension on Interruption
- **Type:** Technical
- **Description:** On network loss, the orchestrator saves the current turn state to SQLite and resumes automatically upon reconnection.
- **Source:** User Features (specs/4_user_features.md)
- **Dependencies:** None

### **[8_RISKS-REQ-004]** Hard Turn Limits
- **Type:** Technical
- **Description:** Every task implementation is capped at 10 turns. Every Epic is capped at a total turn budget. Exceeding these triggers an immediate PAUSE_FOR_INTERVENTION.
- **Source:** Risks and Mitigation (specs/8_risks_mitigation.md)
- **Dependencies:** None

### **[8_RISKS-REQ-054]** Headless CLI Parity
- **Type:** Technical
- **Description:** Ensure the CLI remains fully functional without the VSCode Extension to mitigate risk of IDE-specific breakages.
- **Source:** Risks and Mitigation (specs/8_risks_mitigation.md)
- **Dependencies:** None

### **[3_MCP-TAS-091]** Heuristic Analysis
- **Type:** Technical
- **Description:** If the test fails with different errors each time, it is flagged as `FLAKY` and the system pauses for human intervention.
- **Source:** MCP and AI Development Design (specs/3_mcp_design.md)
- **Dependencies:** None

### **[UNKNOWN-602]** Hidden project files handling
- **Type:** Technical
- **Description:** Strategy for handling hidden files like .vscode/settings.json that influence agent environment.
- **Source:** TAS (Technical Architecture Specification) (specs/2_tas.md)
- **Dependencies:** None

### **[4_USER_FEATURES-REQ-042]** Historical Log Retrieval Tool
- **Type:** Technical
- **Description:** Agent MUST have a `read_logs` tool to retrieve raw historical data if context summaries are insufficient.
- **Source:** User Features (specs/4_user_features.md)
- **Dependencies:** None

### **[2_TAS-REQ-019]** HumanInTheLoopManager
- **Type:** Technical
- **Description:** Manages "Wait-for-Approval" gates and persists graph state during suspension.
- **Source:** TAS (Technical Architecture Specification) (specs/2_tas.md)
- **Dependencies:** [TAS-097]

### **[8_RISKS-REQ-079]** Image Reconstruction
- **Type:** Technical
- **Description:** Rebuild of the sandbox using the TAS-locked base image and SHA-pinned dependencies.
- **Source:** Risks and Mitigation (specs/8_risks_mitigation.md)
- **Dependencies:** [8_RISKS-REQ-078]

### **[3_MCP-TAS-076]** Immutable Observations
- **Type:** Technical
- **Description:** Tool outputs (observations) are captured in their raw, unsummarized form. This prevents agents from misinterpreting failed test results during the reflection phase.
- **Source:** MCP and AI Development Design (specs/3_mcp_design.md)
- **Dependencies:** None

### **[9_ROADMAP-DOD-P6]** Implementation (The Loop)
- **Type:** Technical
- **Description:** Implementation (The Loop)
- **Source:** Project Roadmap (specs/9_project_roadmap.md)
- **Dependencies:** None

### **[3_MCP-TAS-037]** Injected into the ephemeral Docker or WebContainer environment. It provides a secure, monitored interface for the Developer Agent to manipulate code and verify implementation.
- **Type:** Technical
- **Description:** Injected into the ephemeral Docker or WebContainer environment. It provides a secure, monitored interface for the Developer Agent to manipulate code and verify implementation.
- **Source:** MCP and AI Development Design (specs/3_mcp_design.md)
- **Dependencies:** None

### **[9_ROADMAP-M-2]** Intelligence (Phase 3-5)
- **Type:** Technical
- **Description:** Intelligence (Phase 3-5)
- **Source:** Project Roadmap (specs/9_project_roadmap.md)
- **Dependencies:** None

### **[8_RISKS-REQ-031]** Intelligent Token Budgeting
- **Type:** Technical
- **Description:** The orchestrator tracks token usage in real-time and slows down parallel execution if the project is within 10% of its hard limit.
- **Source:** Risks and Mitigation (specs/8_risks_mitigation.md)
- **Dependencies:** None

### **[8_RISKS-REQ-030]** Jittered Exponential Backoff
- **Type:** Technical
- **Description:** Mandatory implementation of exponential backoff (Base 2s, Max 60s) for all 429 (Rate Limit) errors.
- **Source:** Risks and Mitigation (specs/8_risks_mitigation.md)
- **Dependencies:** None

### **[3_MCP-TAS-011]** LanceDB Implementation
- **Type:** Technical
- **Description:** Uses text-embedding-004 for project documents and performs cosine_similarity search before every task to retrieve relevant TAS/PRD sections.
- **Source:** MCP and AI Development Design (specs/3_mcp_design.md)
- **Dependencies:** None

### **[2_TAS-REQ-015]** LanceDB Path
- **Type:** Technical
- **Description:** Long-term memory stored at `.devs/memory.lancedb`.
- **Source:** TAS (Technical Architecture Specification) (specs/2_tas.md)
- **Dependencies:** None

### **[4_USER_FEATURES-REQ-013]** LangGraph State Persistence
- **Type:** Technical
- **Description:** ACID-compliant checkpointing of the entire multi-agent state machine to `state.sqlite`, ensuring the system can resume from the exact node/turn after a crash or network drop.
- **Source:** User Features (specs/4_user_features.md)
- **Dependencies:** None

### **[3_MCP-TAS-097]** Learning Injection
- **Type:** Technical
- **Description:** The results of the RCA are stored in the **Long-term Memory** (LanceDB) to prevent similar failures in future tasks or projects.
- **Source:** MCP and AI Development Design (specs/3_mcp_design.md)
- **Dependencies:** None

### **[3_MCP-TAS-081]** Lifecycle Sync
- **Type:** Technical
- **Description:** The ProjectServer MUST automatically start when the `DeveloperAgent` runs the application's "Dev Mode" within the sandbox.
- **Source:** MCP and AI Development Design (specs/3_mcp_design.md)
- **Dependencies:** None

### **[1_PRD-REQ-MET-006]** Lint & Build Cleanliness
- **Type:** Technical
- **Description:** Zero errors/warnings from linter and build tools.
- **Source:** PRD (Product Requirements Document) (specs/1_prd.md)
- **Dependencies:** None

### **[8_RISKS-REQ-016]** Lockfile Integrity
- **Type:** Technical
- **Description:** The system enforces the presence of a lockfile. Any task that modifies package.json without updating the lockfile is rejected by the Reviewer Agent.
- **Source:** Risks and Mitigation (specs/8_risks_mitigation.md)
- **Dependencies:** None

### **[1_PRD-REQ-NEED-AGENT-01]** Long-Term Context
- **Type:** Technical
- **Description:** Access to project-wide architectural decisions (TAS) during every task.
- **Source:** PRD (Product Requirements Document) (specs/1_prd.md)
- **Dependencies:** None

### **[9_ROADMAP-SPIKE-002]** Long-Term Memory Drift  Phase 1  Investigate at what point LanceDB noise impacts
- **Type:** Technical
- **Description:** Long-Term Memory Drift  Phase 1  Investigate at what point LanceDB noise impacts Gemini's reasoning.
- **Source:** Project Roadmap (specs/9_project_roadmap.md)
- **Dependencies:** None

### **[TAS-018]** Long-term Memory Requirement
- **Type:** Technical
- **Description:** Management of project-wide constraints and architectural decisions in LanceDB.
- **Source:** TAS (Technical Architecture Specification) (specs/2_tas.md)
- **Dependencies:** None

### **[1_PRD-REQ-PIL-005]** MCP-Native (Model Context Protocol)
- **Type:** Technical
- **Description:** The orchestrator and generated projects must support MCP for deep introspection, debugging, and profiling via standardized interfaces.
- **Source:** PRD (Product Requirements Document) (specs/1_prd.md)
- **Dependencies:** None

### **[3_MCP-TAS-003]** MCP-Native Integration
- **Type:** Technical
- **Description:** Both the orchestrator and the generated code utilize the Model Context Protocol to provide standardized interfaces for introspection, debugging, and profiling.
- **Source:** MCP and AI Development Design (specs/3_mcp_design.md)
- **Dependencies:** None

### **[3_MCP-TAS-071]** Malformed Response
- **Type:** Technical
- **Description:** If the agent returns invalid JSON or fails the schema check, the orchestrator MUST trigger a "Formatting Correction" turn (max 2 retries) before escalating to the user.
- **Source:** MCP and AI Development Design (specs/3_mcp_design.md)
- **Dependencies:** None

### **[8_RISKS-REQ-048]** Manifest Serialization
- **Type:** Technical
- **Description:** Modifications to global manifests (package.json, Cargo.toml) MUST be serialized through a central "Dependency Orchestrator" agent.
- **Source:** Risks and Mitigation (specs/8_risks_mitigation.md)
- **Dependencies:** None

### **[TAS-017]** Medium-term Memory Requirement
- **Type:** Technical
- **Description:** Management of Epic-level decisions and task summaries in SQLite logs.
- **Source:** TAS (Technical Architecture Specification) (specs/2_tas.md)
- **Dependencies:** None

### **[4_USER_FEATURES-REQ-075]** Memory Syncing on Rewind
- **Type:** Technical
- **Description:** Pruning of Vector DB (LanceDB) to remove semantic memories generated after the rewind point.
- **Source:** User Features (specs/4_user_features.md)
- **Dependencies:** None

### **[2_TAS-REQ-029]** MemoryRefresher
- **Type:** Technical
- **Description:** Periodic summarization of Epic progress into long-term memory.
- **Source:** TAS (Technical Architecture Specification) (specs/2_tas.md)
- **Dependencies:** [TAS-100]

### **[8_RISKS-REQ-081]** Model Failover Logic
- **Type:** Technical
- **Description:** Automatic switching of LLM providers (Gemini 3 Pro -> Claude 3.5 Sonnet -> GPT-4o) to mitigate service outages or rate-limiting.
- **Source:** Risks and Mitigation (specs/8_risks_mitigation.md)
- **Dependencies:** None

### **[8_RISKS-REQ-118]** Model Reasoning Ceiling (Complex Arch) Risk Mitigation
- **Type:** Technical
- **Description:** Mitigation for Model Reasoning Ceiling risk through Recursive Task Decomposition.
- **Source:** Risks and Mitigation (specs/8_risks_mitigation.md)
- **Dependencies:** None

### **[RISK-601]** Monorepo Complexity
- **Type:** Technical
- **Description:** Evolution into monorepo requires careful root-level state management.
- **Source:** TAS (Technical Architecture Specification) (specs/2_tas.md)
- **Dependencies:** None

### **[8_RISKS-REQ-020]** Multi-Agent Chain-of-Thought
- **Type:** Technical
- **Description:** Complex tasks use a "Primary Developer" and a "Shadow Architect" working in parallel. The Shadow Architect reviews the PlanNode before code is written.
- **Source:** Risks and Mitigation (specs/8_risks_mitigation.md)
- **Dependencies:** None

### **[8_RISKS-REQ-138]** Multi-Agent Conflict Unknown
- **Type:** Technical
- **Description:** Uncertainty on how to resolve deep disagreements between Developer and Reviewer agents.
- **Source:** Risks and Mitigation (specs/8_risks_mitigation.md)
- **Dependencies:** None

### **[4_USER_FEATURES-REQ-016]** Multi-Agent Cross-Verification
- **Type:** Technical
- **Description:** Mandatory review of implementation tasks by a separate "Reviewer Agent" using a clean sandbox to verify that tests pass and TAS patterns are followed.
- **Source:** User Features (specs/4_user_features.md)
- **Dependencies:** None

### **[9_ROADMAP-SPIKE-003]** Multi-Agent Parallelism  Phase 6  Optimize file-level locking for simultaneous t
- **Type:** Technical
- **Description:** Multi-Agent Parallelism  Phase 6  Optimize file-level locking for simultaneous task implementation within one Epic.
- **Source:** Project Roadmap (specs/9_project_roadmap.md)
- **Dependencies:** None

### **[8_RISKS-REQ-053]** Multi-Model Failover Architecture
- **Type:** Technical
- **Description:** The Agent Factory MUST be designed to support Anthropic (Claude 3.5 Sonnet) and OpenAI (GPT-4o) as secondary providers, even if context window performance degrades.
- **Source:** Risks and Mitigation (specs/8_risks_mitigation.md)
- **Dependencies:** None

### **[1_PRD-REQ-GOAL-007]** Multi-Tiered Context & Memory Management
- **Type:** Technical
- **Description:** Implement short-term (task), medium-term (Epic), and long-term (project) memory to maintain consistent context.
- **Source:** PRD (Product Requirements Document) (specs/1_prd.md)
- **Dependencies:** None

### **[UNKNOWN-801]** Multi-agent parallel execution support
- **Type:** Technical
- **Description:** Need to determine if SAOP should support multiple agents working on independent tasks in one turn.
- **Source:** TAS (Technical Architecture Specification) (specs/2_tas.md)
- **Dependencies:** None

### **[TAS-003]** Native Agentic Observability (MCP)
- **Type:** Technical
- **Description:** The generated project includes a built-in MCP server that exposes internal state, logs, and profiling data for AI agents to debug and optimize.
- **Source:** TAS (Technical Architecture Specification) (specs/2_tas.md)
- **Dependencies:** None

### **[1_PRD-REQ-OBS-001]** Native MCP Server Integration
- **Type:** Technical
- **Description:** Generated projects must include an MCP server for introspection, execution, and profiling.
- **Source:** PRD (Product Requirements Document) (specs/1_prd.md)
- **Dependencies:** None

### **[RISK-801]** Non-UTF8 Tool Output
- **Type:** Technical
- **Description:** Binary or non-standard characters in terminal output could crash the JSON-based protocol.
- **Source:** TAS (Technical Architecture Specification) (specs/2_tas.md)
- **Dependencies:** None

### **[4_USER_FEATURES-REQ-078]** Observation Hashing
- **Type:** Technical
- **Description:** Real-time monitoring of repeating error messages to detect infinite loops.
- **Source:** User Features (specs/4_user_features.md)
- **Dependencies:** None

### **[TAS-065]** Observation Standard
- **Type:** Technical
- **Description:** Standardized JSON structure for tool outputs (observations) returned to agents.
- **Source:** TAS (Technical Architecture Specification) (specs/2_tas.md)
- **Dependencies:** None

### **[8_RISKS-REQ-055]** Open-Standard MCP Compliance
- **Type:** Technical
- **Description:** Adhere strictly to the public MCP spec rather than proprietary extensions to ensure compatibility with future agentic tools.
- **Source:** Risks and Mitigation (specs/8_risks_mitigation.md)
- **Dependencies:** None

### **[9_ROADMAP-DOD-P8]** Optimization (The Polish)
- **Type:** Technical
- **Description:** Optimization (The Polish)
- **Source:** Project Roadmap (specs/9_project_roadmap.md)
- **Dependencies:** None

### **[2_TAS-REQ-016]** OrchestrationGraph
- **Type:** Technical
- **Description:** Implements LangGraph.js state machine for Research, Design, Distillation, and TDD loop.
- **Source:** TAS (Technical Architecture Specification) (specs/2_tas.md)
- **Dependencies:** [TAS-097]

### **[4_USER_FEATURES-REQ-011]** Orchestrator Control Server
- **Type:** Technical
- **Description:** Exposes the `devs` state machine and requirement fulfillment status as an MCP server, allowing external agents (e.g., Cursor, Gemini) to query project status and inject tasks.
- **Source:** User Features (specs/4_user_features.md)
- **Dependencies:** None

### **[TAS-032]** Orchestrator Verification
- **Type:** Technical
- **Description:** Vitest for unit and integration testing of agent nodes and state transitions.
- **Source:** TAS (Technical Architecture Specification) (specs/2_tas.md)
- **Dependencies:** None

### **[2_TAS-REQ-030]** OrchestratorServer
- **Type:** Technical
- **Description:** MCP server exposing internal orchestrator state to VSCode.
- **Source:** TAS (Technical Architecture Specification) (specs/2_tas.md)
- **Dependencies:** [TAS-101]

### **[TAS-068]** Orphaned Requirements Check
- **Type:** Technical
- **Description:** System must verify every requirement is mapped to at least one task during Phase 3.
- **Source:** TAS (Technical Architecture Specification) (specs/2_tas.md)
- **Dependencies:** None

### **[1_PRD-REQ-PERF-003]** Parallel Task Execution
- **Type:** Technical
- **Description:** Execute independent tasks within an Epic in parallel sandboxes.
- **Source:** PRD (Product Requirements Document) (specs/1_prd.md)
- **Dependencies:** None

### **[3_MCP-TAS-072]** Partial Completions
- **Type:** Technical
- **Description:** In cases where the LLM hits a token limit mid-envelope, the orchestrator MUST implement a "Resume Protocol" that prompts the agent to complete the JSON payload starting from the last valid token.
- **Source:** MCP and AI Development Design (specs/3_mcp_design.md)
- **Dependencies:** None

### **[8_RISKS-REQ-045]** Path Normalization Middleware
- **Type:** Technical
- **Description:** The orchestrator MUST use upath or similar for all internal file operations to ensure cross-platform consistency.
- **Source:** Risks and Mitigation (specs/8_risks_mitigation.md)
- **Dependencies:** None

### **[1_PRD-REQ-NEED-ARCH-01]** Pattern enforcement
- **Type:** Technical
- **Description:** Strict enforcement of specific patterns (e.g., "Must use Functional Programming with Effect-TS").
- **Source:** PRD (Product Requirements Document) (specs/1_prd.md)
- **Dependencies:** None

### **[9_ROADMAP-RISK-401]** Performance impact of deep LangGraph recursion on Node.js memory limits.
- **Type:** Technical
- **Description:** Performance impact of deep LangGraph recursion on Node.js memory limits.
- **Source:** Project Roadmap (specs/9_project_roadmap.md)
- **Dependencies:** None

### **[9_ROADMAP-DOD-P5]** Planning (The Strategy)
- **Type:** Technical
- **Description:** Planning (The Strategy)
- **Source:** Project Roadmap (specs/9_project_roadmap.md)
- **Dependencies:** None

### **[TAS-007]** Primary Reasoning Model
- **Type:** Technical
- **Description:** Google Gemini 3 Pro with 1M+ token context window for high-level research and architectural design.
- **Source:** TAS (Technical Architecture Specification) (specs/2_tas.md)
- **Dependencies:** None

### **[1_PRD-REQ-GOAL-006]** Proactive Entropy Detection & Resource Efficiency
- **Type:** Technical
- **Description:** Detect lack of progress (entropy) and automatically pause for human intervention after a predefined threshold of failed attempts.
- **Source:** PRD (Product Requirements Document) (specs/1_prd.md)
- **Dependencies:** None

### **[1_PRD-REQ-OBS-005]** Profiling
- **Type:** Technical
- **Description:** Access to CPU/Memory traces via MCP.
- **Source:** PRD (Product Requirements Document) (specs/1_prd.md)
- **Dependencies:** None

### **[4_USER_FEATURES-REQ-087]** Project Export
- **Type:** Technical
- **Description:** Command to generate a "Final Validation Report" and archive the project for handover.
- **Source:** User Features (specs/4_user_features.md)
- **Dependencies:** None

### **[4_USER_FEATURES-REQ-012]** Project Introspection Server
- **Type:** Technical
- **Description:** Every generated project includes an internal MCP server (`/mcp-server`) that provides tools for debugging, state inspection, and live profiling of the newly built codebase.
- **Source:** User Features (specs/4_user_features.md)
- **Dependencies:** None

### **[2_TAS-REQ-031]** ProjectServerTemplate
- **Type:** Technical
- **Description:** Blueprint for MCP servers injected into generated projects.
- **Source:** TAS (Technical Architecture Specification) (specs/2_tas.md)
- **Dependencies:** [TAS-101]

### **[2_TAS-REQ-021]** PromptManager
- **Type:** Technical
- **Description:** Version-controlled repository of system instructions and reasoning protocols.
- **Source:** TAS (Technical Architecture Specification) (specs/2_tas.md)
- **Dependencies:** [TAS-098]

### **[3_MCP-TAS-096]** RCA Turn
- **Type:** Technical
- **Description:** A **Gemini 3 Pro** instance (the Reviewer) analyzes the `agent_logs` and the `Suspended Sandbox` to identify the root cause (e.g., "Dependency Conflict," "Ambiguous PRD Requirement," "Sandbox Permission Denied").
- **Source:** MCP and AI Development Design (specs/3_mcp_design.md)
- **Dependencies:** None

### **[TAS-026]** Rate Limit Handling
- **Type:** Technical
- **Description:** Exponential backoff for LLM API calls with state preservation.
- **Source:** TAS (Technical Architecture Specification) (specs/2_tas.md)
- **Dependencies:** None

### **[1_PRD-REQ-CON-001]** Rate Limiting & Token Management
- **Type:** Technical
- **Description:** Gracefully handle LLM API rate limits with exponential backoff and prioritization of critical reasoning.
- **Source:** PRD (Product Requirements Document) (specs/1_prd.md)
- **Dependencies:** None

### **[8_RISKS-REQ-032]** Real-time Resource Gauges
- **Type:** Technical
- **Description:** The SandboxProvider MUST monitor stats from Docker/WebContainer and trigger an ENTROPY_PAUSE before a hard OOM kill occurs.
- **Source:** Risks and Mitigation (specs/8_risks_mitigation.md)
- **Dependencies:** None

### **[TAS-027]** Real-time Search Integration
- **Type:** Technical
- **Description:** Google Search API (via Serper) for validating library documentation and competitive intelligence.
- **Source:** TAS (Technical Architecture Specification) (specs/2_tas.md)
- **Dependencies:** None

### **[1_PRD-REQ-OBS-003]** Real-time State Tracing
- **Type:** Technical
- **Description:** Stream all internal communication and tool calls to `.devs/trace.log`.
- **Source:** PRD (Product Requirements Document) (specs/1_prd.md)
- **Dependencies:** None

### **[3_MCP-TAS-038]** Real-time Trace Streaming
- **Type:** Technical
- **Description:** The orchestrator MUST support a websocket or SSE (Server-Sent Events) stream of the SAOP envelopes, enabling the VSCode Extension to display the agent's "Thought Stream" with minimal latency.
- **Source:** MCP and AI Development Design (specs/3_mcp_design.md)
- **Dependencies:** None

### **[3_MCP-RISK-101]** Reasoning Log Volume
- **Type:** Technical
- **Description:** For projects with 200+ tasks, the `agent_logs` table may exceed several gigabytes. We need an archival strategy that maintains the "Traceability" index while offloading old blobs.
- **Source:** MCP and AI Development Design (specs/3_mcp_design.md)
- **Dependencies:** None

### **[3_MCP-TAS-075]** Reasoning Persistence
- **Type:** Technical
- **Description:** The `payload.analysis.reasoning_chain` is never discarded. It is stored as a blob in the `agent_logs` table, allowing for post-hoc analysis of "hallucination triggers."
- **Source:** MCP and AI Development Design (specs/3_mcp_design.md)
- **Dependencies:** None

### **[2_TAS-REQ-023]** ReasoningEngine
- **Type:** Technical
- **Description:** Parses structured thought protocol from LLM outputs.
- **Source:** TAS (Technical Architecture Specification) (specs/2_tas.md)
- **Dependencies:** [TAS-098]

### **[8_RISKS-REQ-019]** Recursive Decomposition
- **Type:** Technical
- **Description:** If an agent identifies a task as "High Complexity," the Architect Agent MUST be invoked to break it down into smaller, atomic sub-tasks (max 200 LoC per task).
- **Source:** Risks and Mitigation (specs/8_risks_mitigation.md)
- **Dependencies:** None

### **[TAS-063]** Requirement Mapping
- **Type:** Technical
- **Description:** Every function and test in the generated codebase is tagged with a REQ-ID for a full audit trail.
- **Source:** TAS (Technical Architecture Specification) (specs/2_tas.md)
- **Dependencies:** None

### **[3_MCP-REQ-MCP-001]** Requirement-Tagged Logic
- **Type:** Technical
- **Description:** Source code blocks and test cases SHOULD include comments or metadata linking them back to specific `REQ-ID`s from the PRD.
- **Source:** MCP and AI Development Design (specs/3_mcp_design.md)
- **Dependencies:** None

### **[4_USER_FEATURES-REQ-014]** Requirement-to-Task Distillation
- **Type:** Technical
- **Description:** Automated extraction of atomic requirements from specs, mapping each to a unique `REQ-ID` that is traced through the entire implementation lifecycle.
- **Source:** User Features (specs/4_user_features.md)
- **Dependencies:** None

### **[1_PRD-REQ-PIL-001]** Research-First Methodology
- **Type:** Technical
- **Description:** No code is written until the problem space, competitive landscape, and technology options are exhaustively analyzed to prevent architectural drift.
- **Source:** PRD (Product Requirements Document) (specs/1_prd.md)
- **Dependencies:** None

### **[8_RISKS-REQ-009]** Resource Quotas
- **Type:** Technical
- **Description:** Hard CPU (2 cores) and Memory (4GB) limits enforced via Cgroups to prevent local Denial-of-Service attacks.
- **Source:** Risks and Mitigation (specs/8_risks_mitigation.md)
- **Dependencies:** None

### **[3_MCP-TAS-090]** Retry Protocol
- **Type:** Technical
- **Description:** On a non-zero exit code during the GREEN or VERIFY phases, the orchestrator automatically retries the command twice.
- **Source:** MCP and AI Development Design (specs/3_mcp_design.md)
- **Dependencies:** None

### **[3_MCP-TAS-095]** Rewind Execution Logic
- **Type:** Technical
- **Description:** 1. Filesystem Reset: git checkout <hash>. 2. Relational State Reset: Delete records with timestamp > target. 3. Vector Memory Pruning: Prune semantic embeddings generated after the rewind point.
- **Source:** MCP and AI Development Design (specs/3_mcp_design.md)
- **Dependencies:** None

### **[TAS-035]** SAOP Protocol
- **Type:** Technical
- **Description:** Structured Agent-Orchestrator Protocol for transparent inter-agent communication.
- **Source:** TAS (Technical Architecture Specification) (specs/2_tas.md)
- **Dependencies:** None

### **[RISK-401]** Sandbox Latency
- **Type:** Technical
- **Description:** Overhead from Docker containers may impact task execution speed.
- **Source:** TAS (Technical Architecture Specification) (specs/2_tas.md)
- **Dependencies:** None

### **[3_MCP-RISK-301]** Sandbox Latency
- **Type:** Technical
- **Description:** Docker startup per tool call is slow. Mitigation: Implement a Warm Pool of containers or use WebContainers for lighter tasks.
- **Source:** MCP and AI Development Design (specs/3_mcp_design.md)
- **Dependencies:** None

### **[8_RISKS-REQ-139]** Sandbox Latency at Scale Unknown
- **Type:** Technical
- **Description:** Uncertainty regarding performance bottlenecks for large projects with many tasks.
- **Source:** Risks and Mitigation (specs/8_risks_mitigation.md)
- **Dependencies:** None

### **[1_PRD-REQ-MET-009]** Sandbox Provisioning Latency
- **Type:** Technical
- **Description:** Time to "Sandbox Ready" state (Target <30s Docker, <10s WebContainers).
- **Source:** PRD (Product Requirements Document) (specs/1_prd.md)
- **Dependencies:** None

### **[8_RISKS-REQ-123]** Sandbox Resource Exhaustion (OOM/Disk) Risk Mitigation
- **Type:** Technical
- **Description:** Mitigation for Sandbox Resource Exhaustion risk through Cgroups & Ephemeral Cleanup.
- **Source:** Risks and Mitigation (specs/8_risks_mitigation.md)
- **Dependencies:** None

### **[4_USER_FEATURES-REQ-039]** Sandbox Resource Exhaustion Management
- **Type:** Technical
- **Description:** `SandboxMonitor` kills processes exceeding limits (e.g., memory leak, infinite loop) and triggers an "Resource Limit Exceeded" alert.
- **Source:** User Features (specs/4_user_features.md)
- **Dependencies:** None

### **[2_TAS-REQ-024]** SandboxProvider
- **Type:** Technical
- **Description:** Abstract interface for multi-platform execution.
- **Source:** TAS (Technical Architecture Specification) (specs/2_tas.md)
- **Dependencies:** [TAS-099]

### **[3_MCP-RISK-102]** Schema Evolution
- **Type:** Technical
- **Description:** If the SAOP schema updates mid-project, older logs may become incompatible. A versioned migration strategy for `.devs/state.sqlite` is required.
- **Source:** MCP and AI Development Design (specs/3_mcp_design.md)
- **Dependencies:** None

### **[3_MCP-TAS-023]** Secret Masking
- **Type:** Technical
- **Description:** The `SecretMasker` is a mandatory filter in the observation pipeline, ensuring that sensitive data (API keys, PII) is redacted before being stored in the Glass-Box or returned to the LLM.
- **Source:** MCP and AI Development Design (specs/3_mcp_design.md)
- **Dependencies:** None

### **[3_MCP-RISK-501]** Semantic Drift
- **Type:** Technical
- **Description:** Always keep the last 5 terminal observations in raw, unsummarized form.
- **Source:** MCP and AI Development Design (specs/3_mcp_design.md)
- **Dependencies:** None

### **[4_USER_FEATURES-REQ-019]** Semantic Memory Retrieval
- **Type:** Technical
- **Description:** Proactive RAG (Retrieval-Augmented Generation) that fetches relevant historical decisions from LanceDB before starting a new task to ensure architectural consistency.
- **Source:** User Features (specs/4_user_features.md)
- **Dependencies:** None

### **[TAS-016]** Short-term Memory Requirement
- **Type:** Technical
- **Description:** Management of in-context task logs, tool calls, and active file contents.
- **Source:** TAS (Technical Architecture Specification) (specs/2_tas.md)
- **Dependencies:** None

### **[8_RISKS-REQ-010]** Sliding Window Summarization
- **Type:** Technical
- **Description:** The orchestrator MUST trigger a Gemini 3 Flash task to summarize intermediate reasoning turns once the active context window exceeds 500k tokens.
- **Source:** Risks and Mitigation (specs/8_risks_mitigation.md)
- **Dependencies:** None

### **[REQ-SYS-001]** Sliding-Window Context Management
- **Type:** Technical
- **Description:** Ensures agents stay within the 1M token limit without losing critical architectural info.
- **Source:** TAS (Technical Architecture Specification) (specs/2_tas.md)
- **Dependencies:** [2_TAS-REQ-028]

### **[3_MCP-TAS-050]** Spec Refresh Protocol
- **Type:** Technical
- **Description:** To combat "Reasoning Decay," the system re-injects the full TAS and PRD text every 10 turns, ensuring the agent doesn't "forget" the high-level blueprints during long implementation cycles.
- **Source:** MCP and AI Development Design (specs/3_mcp_design.md)
- **Dependencies:** None

### **[3_MCP-TAS-074]** Standardized Introspection
- **Type:** Technical
- **Description:** Implementation MUST include "Introspection Points"—predetermined locations in the code (e.g., custom events, state snapshots) that the internal MCP server can query.
- **Source:** MCP and AI Development Design (specs/3_mcp_design.md)
- **Dependencies:** None

### **[1_PRD-REQ-GOAL-004]** Standardizing "Agent-Ready" Software
- **Type:** Technical
- **Description:** Every project must include a built-in MCP server and comprehensive agent-oriented documentation.
- **Source:** PRD (Product Requirements Document) (specs/1_prd.md)
- **Dependencies:** None

### **[8_RISKS-REQ-115]** State Desync & ACID Violations Risk Mitigation
- **Type:** Technical
- **Description:** Mitigation for State Desync & ACID Violations risk through Transactional SQLite Persistence.
- **Source:** Risks and Mitigation (specs/8_risks_mitigation.md)
- **Dependencies:** None

### **[1_PRD-REQ-CON-002]** State Persistence & Recovery
- **Type:** Technical
- **Description:** Persist every state change locally to allow resumption from any point after failure.
- **Source:** PRD (Product Requirements Document) (specs/1_prd.md)
- **Dependencies:** None

### **[3_MCP-RISK-202]** State Pollution
- **Type:** Technical
- **Description:** Preference for read-only tools and explicit `ROLLBACK` support in `db_bridge`.
- **Source:** MCP and AI Development Design (specs/3_mcp_design.md)
- **Dependencies:** None

### **[8_RISKS-REQ-082]** State Preservation
- **Type:** Technical
- **Description:** The thread_id and reasoning context are serialized into a model-agnostic Markdown format to maintain continuity across provider handoffs.
- **Source:** Risks and Mitigation (specs/8_risks_mitigation.md)
- **Dependencies:** [8_RISKS-REQ-081]

### **[1_PRD-REQ-MET-014]** State Recovery Success Rate
- **Type:** Technical
- **Description:** 100% success rate for `devs resume` operations without data loss.
- **Source:** PRD (Product Requirements Document) (specs/1_prd.md)
- **Dependencies:** None

### **[2_TAS-REQ-017]** StateRepository
- **Type:** Technical
- **Description:** SQLite-backed ACID checkpointer for graph state and agent logs.
- **Source:** TAS (Technical Architecture Specification) (specs/2_tas.md)
- **Dependencies:** [TAS-097]

### **[8_RISKS-REQ-011]** Static Specification Re-Injection
- **Type:** Technical
- **Description:** Every 10 turns, the full TAS and PRD text MUST be re-injected into the prompt as "High-Priority Anchors" to reset the agent's focus.
- **Source:** Risks and Mitigation (specs/8_risks_mitigation.md)
- **Dependencies:** None

### **[3_MCP-TAS-052]** Strategy Blacklist
- **Type:** Technical
- **Description:** If an agent fails a task due to a specific architectural misunderstanding (as identified by the RCA), that failure is logged as a "Lesson Learned" in SQLite. This prevents the next agent (or the same agent on retry) from attempting the same invalid strategy.
- **Source:** MCP and AI Development Design (specs/3_mcp_design.md)
- **Dependencies:** None

### **[8_RISKS-REQ-003]** Strategy Pivot Directive
- **Type:** Technical
- **Description:** Upon an entropy count of 3, the agent is issued a mandatory SYSTEM_PIVOT instruction, forcing it to "Reason from First Principles" and ignore its previous 3 attempts.
- **Source:** Risks and Mitigation (specs/8_risks_mitigation.md)
- **Dependencies:** [8_RISKS-REQ-002]

### **[4_USER_FEATURES-REQ-079]** Strategy Pivot on Loop
- **Type:** Technical
- **Description:** Automatic forced "reasoning from first principles" when an agentic loop is detected.
- **Source:** User Features (specs/4_user_features.md)
- **Dependencies:** None

### **[1_PRD-REQ-PIL-003]** Strict TDD (Test-Driven Development) Loop
- **Type:** Technical
- **Description:** Implementation follows a rigorous "Red-Green-Refactor" cycle where every feature is validated by automated tests in a secure sandbox.
- **Source:** PRD (Product Requirements Document) (specs/1_prd.md)
- **Dependencies:** None

### **[TAS-004]** Strict TDD-Driven Implementation
- **Type:** Technical
- **Description:** Implementation follows a mandatory "Red-Green-Refactor" cycle where code is only written after a failing test case is established in the sandbox.
- **Source:** TAS (Technical Architecture Specification) (specs/2_tas.md)
- **Dependencies:** None

### **[4_USER_FEATURES-REQ-003]** Structured Audit Export
- **Type:** Technical
- **Description:** Support for `--json` and `--markdown` flags on all status and log commands to facilitate integration with external CI/CD pipelines and automated auditing tools.
- **Source:** User Features (specs/4_user_features.md)
- **Dependencies:** None

### **[1_PRD-REQ-PERF-004]** Summarization Handoffs
- **Type:** Technical
- **Description:** Summarize older logs/reasoning and move to medium-term memory.
- **Source:** PRD (Product Requirements Document) (specs/1_prd.md)
- **Dependencies:** None

### **[9_ROADMAP-DOD-P4]** Synthesis (The Blueprint)
- **Type:** Technical
- **Description:** Synthesis (The Blueprint)
- **Source:** Project Roadmap (specs/9_project_roadmap.md)
- **Dependencies:** None

### **[4_USER_FEATURES-REQ-005]** System Health (devs doctor)
- **Type:** Technical
- **Description:** Automated diagnostic tool to verify Docker/WebContainer availability, API connectivity, and `.devs/` directory integrity.
- **Source:** User Features (specs/4_user_features.md)
- **Dependencies:** None

### **[1_PRD-REQ-NEED-DEVS-03]** System-wide profiling
- **Type:** Technical
- **Description:** System-wide profiling to identify which agent phase is the slowest or most token-intensive.
- **Source:** PRD (Product Requirements Document) (specs/1_prd.md)
- **Dependencies:** None

### **[8_RISKS-REQ-024]** TAS Evolution Workflow
- **Type:** Technical
- **Description:** If the Developer Agent provides a valid technical justification for a TAS violation, the Arbitrator can propose a "TAS Revision" task for human approval.
- **Source:** Risks and Mitigation (specs/8_risks_mitigation.md)
- **Dependencies:** [8_RISKS-REQ-022]

### **[8_RISKS-REQ-014]** TAS-Approved Library List
- **Type:** Technical
- **Description:** The Architect Agent generates an "Allowed Libraries" manifest in the TAS. The Developer Agent is blocked from adding new top-level dependencies without a re-architecting phase and human approval.
- **Source:** Risks and Mitigation (specs/8_risks_mitigation.md)
- **Dependencies:** None

### **[3_MCP-TAS-098]** Task-to-Task Handoff
- **Type:** Technical
- **Description:** Upon completion of a task, the **Reviewer Agent** generates a `TaskSummary` containing
- **Source:** MCP and AI Development Design (specs/3_mcp_design.md)
- **Dependencies:** None

### **[1_PRD-REQ-MET-005]** Test Suite Integrity
- **Type:** Technical
- **Description:** 100% pass rate on all tests in a clean, isolated sandbox.
- **Source:** PRD (Product Requirements Document) (specs/1_prd.md)
- **Dependencies:** None

### **[1_PRD-REQ-OBS-006]** Testability
- **Type:** Technical
- **Description:** Explicitly define "How" to test each module in AOD.
- **Source:** PRD (Product Requirements Document) (specs/1_prd.md)
- **Dependencies:** None

### **[3_MCP-TAS-064]** The Implementation Phase is orchestrated as a cyclical graph where each node represents a specific agentic state or tool execution boundary.
- **Type:** Technical
- **Description:** The Implementation Phase is orchestrated as a cyclical graph where each node represents a specific agentic state or tool execution boundary.
- **Source:** MCP and AI Development Design (specs/3_mcp_design.md)
- **Dependencies:** None

### **[3_MCP-TAS-036]** The OrchestratorServer resides at the root of the `devs` engine. It exposes the internal state machine, memory stores, and human-in-the-loop (HITL) coordination mechanisms. It is the primary interface for the VSCode Extension and CLI.
- **Type:** Technical
- **Description:** The OrchestratorServer resides at the root of the `devs` engine. It exposes the internal state machine, memory stores, and human-in-the-loop (HITL) coordination mechanisms. It is the primary interface for the VSCode Extension and CLI.
- **Source:** MCP and AI Development Design (specs/3_mcp_design.md)
- **Dependencies:** None

### **[3_MCP-TAS-066]** The generated project is natively "Agent-Ready" via standardized introspection interfaces.
- **Type:** Technical
- **Description:** The generated project is natively "Agent-Ready" via standardized introspection interfaces.
- **Source:** MCP and AI Development Design (specs/3_mcp_design.md)
- **Dependencies:** None

### **[4_USER_FEATURES-REQ-017]** Tiered Memory Hierarchy
- **Type:** Technical
- **Description:** Support for Short-Term (active files/tool outputs), Medium-Term (Epic-level decisions/task summaries in SQLite), and Long-Term (project-wide constraints/architectural DNA in Vector DB) memory.
- **Source:** User Features (specs/4_user_features.md)
- **Dependencies:** None

### **[8_RISKS-REQ-029]** Tiered Model Failover
- **Type:** Technical
- **Description:** If Gemini 3 Pro is rate-limited, the system MUST automatically route non-reasoning tasks (linting, basic unit tests) to Gemini 3 Flash.
- **Source:** Risks and Mitigation (specs/8_risks_mitigation.md)
- **Dependencies:** None

### **[1_PRD-REQ-PERF-002]** Tiered Model Orchestration
- **Type:** Technical
- **Description:** Use Gemini 3 Pro for complex tasks and Gemini 3 Flash for routine reviews.
- **Source:** PRD (Product Requirements Document) (specs/1_prd.md)
- **Dependencies:** None

### **[8_RISKS-REQ-056]** Tiered Model Orchestration
- **Type:** Technical
- **Description:** Mandatory use of Gemini 3 Flash for routine tasks (Linting, simple code reviews) to reduce cost by up to 80% compared to Pro-only execution.
- **Source:** Risks and Mitigation (specs/8_risks_mitigation.md)
- **Dependencies:** None

### **[1_PRD-REQ-NEED-DEVS-02]** Time-Travel debugging
- **Type:** Technical
- **Description:** Ability to rewind the system state to a previous task or Epic.
- **Source:** PRD (Product Requirements Document) (specs/1_prd.md)
- **Dependencies:** None

### **[4_USER_FEATURES-REQ-083]** Token Limit Context Refresh
- **Type:** Technical
- **Description:** At 800k tokens, system triggers a context refresh using a summary to keep within 1M token limit.
- **Source:** User Features (specs/4_user_features.md)
- **Dependencies:** None

### **[1_PRD-REQ-MET-008]** Token-to-Value Ratio (TVR)
- **Type:** Technical
- **Description:** Total USD cost of tokens per successful task (Target <$1.50).
- **Source:** PRD (Product Requirements Document) (specs/1_prd.md)
- **Dependencies:** None

### **[1_PRD-REQ-UI-014]** Token/Cost Budgeting
- **Type:** Technical
- **Description:** Hard and soft limits on USD/Token spend per Epic.
- **Source:** PRD (Product Requirements Document) (specs/1_prd.md)
- **Dependencies:** None

### **[3_MCP-RISK-201]** Tool Hallucination
- **Type:** Technical
- **Description:** Strict JSON schema validation and automated "Help" prompts on failure.
- **Source:** MCP and AI Development Design (specs/3_mcp_design.md)
- **Dependencies:** None

### **[3_MCP-TAS-051]** Tool Result Retention
- **Type:** Technical
- **Description:** Unlike reasoning traces, large tool outputs (e.g., a 200-line test log) are truncated in the context window after 2 turns, but the full raw output remains queryable via the `get_task_trace` tool.
- **Source:** MCP and AI Development Design (specs/3_mcp_design.md)
- **Dependencies:** None

### **[3_MCP-TAS-073]** Tool Timeout
- **Type:** Technical
- **Description:** If an MCP tool exceeds the 300s timeout, the observation returned to the agent MUST include a `TIMEOUT_EXCEEDED` status, forcing the agent to reassess its strategy.
- **Source:** MCP and AI Development Design (specs/3_mcp_design.md)
- **Dependencies:** None

### **[1_PRD-REQ-NEED-AGENT-02]** Tool-Rich Environment
- **Type:** Technical
- **Description:** Seamless MCP access to file system, terminal, and live profilers.
- **Source:** PRD (Product Requirements Document) (specs/1_prd.md)
- **Dependencies:** None

### **[2_TAS-REQ-032]** ToolProxy
- **Type:** Technical
- **Description:** Bridges LLM tool calls to the sandbox execution layer.
- **Source:** TAS (Technical Architecture Specification) (specs/2_tas.md)
- **Dependencies:** [TAS-101]

### **[2_TAS-REQ-022]** ToolRegistry
- **Type:** Technical
- **Description:** Mapping of MCP tools to specific agent roles with restricted access.
- **Source:** TAS (Technical Architecture Specification) (specs/2_tas.md)
- **Dependencies:** [TAS-098]

### **[UNKNOWN-802]** Transient Sandbox Flakiness
- **Type:** Technical
- **Description:** Handling network timeouts or other transient errors without triggering entropy detection.
- **Source:** TAS (Technical Architecture Specification) (specs/2_tas.md)
- **Dependencies:** None

### **[3_MCP-TAS-049]** Trigger Thresholds
- **Type:** Technical
- **Description:** Warning at 600k tokens for Context Compression; Gemini 3 Flash Compression Turn at 800k tokens.
- **Source:** MCP and AI Development Design (specs/3_mcp_design.md)
- **Dependencies:** None

### **[TAS-008]** Utility & Review Model
- **Type:** Technical
- **Description:** Google Gemini 3 Flash for low-latency tasks like linting, unit test generation, and log summarization.
- **Source:** TAS (Technical Architecture Specification) (specs/2_tas.md)
- **Dependencies:** None

### **[TAS-011]** Vector Memory (Long-term)
- **Type:** Technical
- **Description:** LanceDB (embedded) for semantic embeddings of requirements and architectural decisions.
- **Source:** TAS (Technical Architecture Specification) (specs/2_tas.md)
- **Dependencies:** None

### **[3_MCP-RISK-502]** Vector Retrieval Noise
- **Type:** Technical
- **Description:** Use metadata filtering (e.g., `epic_id`) to restrict search results to the current Epic's scope.
- **Source:** MCP and AI Development Design (specs/3_mcp_design.md)
- **Dependencies:** None

### **[2_TAS-REQ-027]** VectorStore
- **Type:** Technical
- **Description:** LanceDB integration for long-term project-wide context.
- **Source:** TAS (Technical Architecture Specification) (specs/2_tas.md)
- **Dependencies:** [TAS-100]

### **[9_ROADMAP-SPIKE-004]** Visual Requirement Mapping  Phase 7  Research D3-to-Mermaid interactivity for li
- **Type:** Technical
- **Description:** Visual Requirement Mapping  Phase 7  Research D3-to-Mermaid interactivity for linking DAG nodes to PRD sections.
- **Source:** Project Roadmap (specs/9_project_roadmap.md)
- **Dependencies:** None

### **[9_ROADMAP-SPIKE-001]** WebContainer Parity  Phase 2  Determine if WebContainers support the same syscal
- **Type:** Technical
- **Description:** WebContainer Parity  Phase 2  Determine if WebContainers support the same syscalls as Docker for non-JS stacks.
- **Source:** Project Roadmap (specs/9_project_roadmap.md)
- **Dependencies:** None

### **[2_TAS-REQ-026]** WebContainerDriver
- **Type:** Technical
- **Description:** VSCode Web implementation of sandbox using browser-native Node.js.
- **Source:** TAS (Technical Architecture Specification) (specs/2_tas.md)
- **Dependencies:** [2_TAS-REQ-024]

### **[UNKNOWN-401]** WebContainers native dependency support
- **Type:** Technical
- **Description:** Uncertainty if WebContainers will support all complex backend project features.
- **Source:** TAS (Technical Architecture Specification) (specs/2_tas.md)
- **Dependencies:** None

### **[3_MCP-TAS-047]** Window Composition
- **Type:** Technical
- **Description:** The orchestrator dynamically constructs the active context window prioritizing the Goal (Task/Tests), the Map (TAS/File structure), and the Recent Past (last 5-10 SAOP envelopes).
- **Source:** MCP and AI Development Design (specs/3_mcp_design.md)
- **Dependencies:** None

### **[8_RISKS-REQ-034]** Writable Volume Quotas
- **Type:** Technical
- **Description:** Enforcement of strict disk quotas on the /workspace mount using xfs_quota or container-level limits.
- **Source:** Risks and Mitigation (specs/8_risks_mitigation.md)
- **Dependencies:** None

### **[4_USER_FEATURES-REQ-086]** Zero-External-Dependency Storage
- **Type:** Technical
- **Description:** All project state (SQLite, Vector DB, Logs) is stored within the `.devs/` folder for 100% portability.
- **Source:** User Features (specs/4_user_features.md)
- **Dependencies:** None

### **[3_MCP-TAS-084]** `CodeNode` (Green Phase)
- **Type:** Technical
- **Description:** The agent modifies the application source code to satisfy the failing test.
- **Source:** MCP and AI Development Design (specs/3_mcp_design.md)
- **Dependencies:** None

### **[3_MCP-TAS-087]** `CommitNode`
- **Type:** Technical
- **Description:** Upon successful review, the state machine triggers an atomic Git commit and updates the SQLite task status.
- **Source:** MCP and AI Development Design (specs/3_mcp_design.md)
- **Dependencies:** None

### **[3_MCP-TAS-082]** `PlanNode`
- **Type:** Technical
- **Description:** The Developer Agent ingests the current task description, relevant PRD/TAS sections, and Medium-term Memory (Epic context). It generates a `TaskStrategy` object.
- **Source:** MCP and AI Development Design (specs/3_mcp_design.md)
- **Dependencies:** None

### **[3_MCP-TAS-085]** `RefactorNode`
- **Type:** Technical
- **Description:** The agent performs code cleanup and ensures compliance with project-wide quality standards (linting, types).
- **Source:** MCP and AI Development Design (specs/3_mcp_design.md)
- **Dependencies:** None

### **[3_MCP-TAS-086]** `ReviewNode` (Independent Validation)
- **Type:** Technical
- **Description:** A separate Reviewer Agent instance validates the work, checking for TAS violations and regression failures.
- **Source:** MCP and AI Development Design (specs/3_mcp_design.md)
- **Dependencies:** None

### **[3_MCP-TAS-083]** `TestNode` (Red Phase)
- **Type:** Technical
- **Description:** The agent writes a unit or integration test that exercises the target requirement.
- **Source:** MCP and AI Development Design (specs/3_mcp_design.md)
- **Dependencies:** None

### **[2_TAS-REQ-012]** bootstrap-sandbox script
- **Type:** Technical
- **Description:** Script to prepare the Docker/WebContainer environment.
- **Source:** TAS (Technical Architecture Specification) (specs/2_tas.md)
- **Dependencies:** [TAS-099]

### **[2_TAS-REQ-013]** run-mcp script
- **Type:** Technical
- **Description:** Script to start the project's internal MCP server.
- **Source:** TAS (Technical Architecture Specification) (specs/2_tas.md)
- **Dependencies:** [TAS-043]

### **[8_RISKS-REQ-001]** state machine robustness
- **Type:** Technical
- **Description:** Technical & Reliability Risks are owned by the Orchestration Manager (`devs-core`) and must be mitigated through state machine robustness, entropy detection, and ACID persistence.
- **Source:** Risks and Mitigation (specs/8_risks_mitigation.md)
- **Dependencies:** None

### **[UNKNOWN-601]** state.sqlite git strategy
- **Type:** Technical
- **Description:** Decision needed on whether to commit the state database to version control.
- **Source:** TAS (Technical Architecture Specification) (specs/2_tas.md)
- **Dependencies:** None

### **[3_MCP-TAS-088]** turn_index
- **Type:** Technical
- **Description:** Tracked in `agent_logs` to prevent context bloat.
- **Source:** MCP and AI Development Design (specs/3_mcp_design.md)
- **Dependencies:** None

### **[2_TAS-REQ-014]** validate-all script
- **Type:** Technical
- **Description:** Script to run the full verification suite (Lint, Build, Test).
- **Source:** TAS (Technical Architecture Specification) (specs/2_tas.md)
- **Dependencies:** None

### **[4_USER_FEATURES-REQ-066]** AIC Interaction Dialogs
- **Type:** UX
- **Description:** High-priority popups or CLI prompts for agent-initiated clarification when conflicts are detected.
- **Source:** User Features (specs/4_user_features.md)
- **Dependencies:** None

### **[1_PRD-REQ-GOAL-003]** Absolute User Agency & Intervention Control
- **Type:** UX
- **Description:** Provide explicit approval checkpoints at critical junctions and allow granular monitoring and mid-stream adjustments.
- **Source:** PRD (Product Requirements Document) (specs/1_prd.md)
- **Dependencies:** None

### **[4_USER_FEATURES-REQ-036]** Active Task Card UI
- **Type:** UX
- **Description:** UI shows an "Active Task" card with the corresponding REQ-ID during implementation.
- **Source:** User Features (specs/4_user_features.md)
- **Dependencies:** None

### **[1_PRD-REQ-UI-002]** Architecture Suite Sign-off
- **Type:** UX
- **Description:** "Freeze" architecture after user validates PRD, TAS, and other docs.
- **Source:** PRD (Product Requirements Document) (specs/1_prd.md)
- **Dependencies:** None

### **[4_USER_FEATURES-REQ-008]** Blueprint & Spec Previewer
- **Type:** UX
- **Description:** Native rendering for all Mermaid-based diagrams within PRDs/TAS documents, including live-updating ERDs and sequence diagrams during the Design phase.
- **Source:** User Features (specs/4_user_features.md)
- **Dependencies:** None

### **[4_USER_FEATURES-REQ-025]** CLI Progress Bar
- **Type:** UX
- **Description:** CLI shows a progress bar with `[Scraping competitors...]` during Phase 1 research.
- **Source:** User Features (specs/4_user_features.md)
- **Dependencies:** None

### **[1_PRD-REQ-NEED-MAKER-02]** Clear progress summaries
- **Type:** UX
- **Description:** Clear, non-technical progress summaries (Epics/Milestones).
- **Source:** PRD (Product Requirements Document) (specs/1_prd.md)
- **Dependencies:** None

### **[TAS-030]** Component Architecture
- **Type:** UX
- **Description:** Use of vscode-webview-ui-toolkit for seamless VSCode theme integration.
- **Source:** TAS (Technical Architecture Specification) (specs/2_tas.md)
- **Dependencies:** None

### **[4_USER_FEATURES-REQ-085]** Cost Transparency
- **Type:** UX
- **Description:** VSCode dashboard displays real-time estimation of "Current Task Cost" and "Epic Spend."
- **Source:** User Features (specs/4_user_features.md)
- **Dependencies:** None

### **[9_ROADMAP-REQ-027]** Document Validity
- **Type:** UX
- **Description:** Document Validity: PRD, TAS, Security, and UI/UX docs must pass the Markdown linting suite and be stored as `APPROVED` version 1.0.
- **Source:** Project Roadmap (specs/9_project_roadmap.md)
- **Dependencies:** None

### **[TAS-031]** Documentation Rendering
- **Type:** UX
- **Description:** Mermaid.js for dynamic rendering of architectural diagrams and roadmaps in Markdown previews.
- **Source:** TAS (Technical Architecture Specification) (specs/2_tas.md)
- **Dependencies:** None

### **[4_USER_FEATURES-REQ-064]** Entropy Pivot Prompts
- **Type:** UX
- **Description:** Users are notified with a "Pivot Rationalization" message when the system forces a strategy change.
- **Source:** User Features (specs/4_user_features.md)
- **Dependencies:** None

### **[1_PRD-REQ-UI-004]** Epic Commencement Checkpoint
- **Type:** UX
- **Description:** Start-of-epic review allowing for just-in-time adjustments.
- **Source:** PRD (Product Requirements Document) (specs/1_prd.md)
- **Dependencies:** None

### **[3_MCP-REQ-UI-002]** Failure Report
- **Type:** UX
- **Description:** The system generates a Markdown report containing
- **Source:** MCP and AI Development Design (specs/3_mcp_design.md)
- **Dependencies:** None

### **[3_MCP-REQ-UI-001]** Gated Autonomy
- **Type:** UX
- **Description:** Explicit checkpoints (e.g., TAS approval) are enforced by the orchestrator. The state machine "Freezes" and waits for a `RESUME` signal from the `OrchestratorServer`.
- **Source:** MCP and AI Development Design (specs/3_mcp_design.md)
- **Dependencies:** None

### **[4_USER_FEATURES-REQ-009]** Gated Autonomy UI
- **Type:** UX
- **Description:** Visual popups and status indicators for mandatory human-in-the-loop sign-offs, with integrated diff views for approving agent-proposed architectural changes.
- **Source:** User Features (specs/4_user_features.md)
- **Dependencies:** None

### **[4_USER_FEATURES-REQ-007]** Glass-Box Trace Streamer
- **Type:** UX
- **Description:** A specialized "Agent Console" utilizing the Structured Agent-Orchestrator Protocol (SAOP) to stream reasoning (thoughts), tool calls (actions), and sandbox outputs (observations) with semantic highlighting.
- **Source:** User Features (specs/4_user_features.md)
- **Dependencies:** None

### **[1_PRD-REQ-NEED-ARCH-02]** Granular approval
- **Type:** UX
- **Description:** Granular approval of TAS and PRD before code generation.
- **Source:** PRD (Product Requirements Document) (specs/1_prd.md)
- **Dependencies:** None

### **[8_RISKS-REQ-038]** High-Signal Diff UI
- **Type:** UX
- **Description:** Approvals MUST highlight semantic changes (e.g., "New Dependency Added", "Security Policy Modified") rather than raw text diffs.
- **Source:** Risks and Mitigation (specs/8_risks_mitigation.md)
- **Dependencies:** None

### **[4_USER_FEATURES-REQ-061]** Interactive Failure Diffs
- **Type:** UX
- **Description:** Visual comparison between failing test output and implementation, highlighting associated REQ-IDs.
- **Source:** User Features (specs/4_user_features.md)
- **Dependencies:** None

### **[1_PRD-REQ-NEED-DOMAIN-03]** Interactive Q&A
- **Type:** UX
- **Description:** Interactive "Q&A" sessions with the Architect Agent regarding the TAS.
- **Source:** PRD (Product Requirements Document) (specs/1_prd.md)
- **Dependencies:** None

### **[4_USER_FEATURES-REQ-030]** Interactive SVG Mermaid Diagrams
- **Type:** UX
- **Description:** Mermaid diagrams (ERDs, Sequence) are rendered as interactive SVG blocks within the VSCode review mode.
- **Source:** User Features (specs/4_user_features.md)
- **Dependencies:** None

### **[4_USER_FEATURES-REQ-004]** Interactive TUI Approval Gates
- **Type:** UX
- **Description:** A high-fidelity Terminal User Interface for reviewing research reports and architecture specs, providing a rich, non-GUI way to manage human-in-the-loop gates.
- **Source:** User Features (specs/4_user_features.md)
- **Dependencies:** None

### **[9_ROADMAP-DOD-P7]** Interface (The Lens)
- **Type:** UX
- **Description:** Interface (The Lens)
- **Source:** Project Roadmap (specs/9_project_roadmap.md)
- **Dependencies:** None

### **[1_PRD-REQ-UI-005]** Live Trace Streaming
- **Type:** UX
- **Description:** Real-time stream of Thoughts, Actions, and Observations.
- **Source:** PRD (Product Requirements Document) (specs/1_prd.md)
- **Dependencies:** None

### **[1_PRD-REQ-UI-017]** Mandatory Approval Gates
- **Type:** UX
- **Description:** Mandatory "Wait-for-Approval" gates at critical architectural junctions.
- **Source:** PRD (Product Requirements Document) (specs/1_prd.md)
- **Dependencies:** None

### **[4_USER_FEATURES-REQ-006]** Multi-Agent Dashboard
- **Type:** UX
- **Description:** A dedicated sidebar view rendering the current Epic progress, active task details, and a real-time visualization of the Task Dependency DAG.
- **Source:** User Features (specs/4_user_features.md)
- **Dependencies:** None

### **[4_USER_FEATURES-REQ-032]** Pattern Conflict Dialog
- **Type:** UX
- **Description:** If a user directive contradicts project-wide constraints, the system MUST trigger a "Constraint Violation Dialog" for override confirmation.
- **Source:** User Features (specs/4_user_features.md)
- **Dependencies:** None

### **[4_USER_FEATURES-REQ-069]** Real-time Resource Gauges
- **Type:** UX
- **Description:** Visual feedback on CPU, Memory, and Token usage for active sandbox and orchestrator.
- **Source:** User Features (specs/4_user_features.md)
- **Dependencies:** None

### **[1_PRD-REQ-UI-001]** Research Suite Sign-off
- **Type:** UX
- **Description:** Block Phase 2 until user reviews and approves research reports.
- **Source:** PRD (Product Requirements Document) (specs/1_prd.md)
- **Dependencies:** None

### **[4_USER_FEATURES-REQ-029]** Review Dashboard UI
- **Type:** UX
- **Description:** VSCode renders a "Review Dashboard" with a side-by-side view of the Brief and the new Specs during Phase 2.
- **Source:** User Features (specs/4_user_features.md)
- **Dependencies:** None

### **[1_PRD-REQ-UI-003]** Roadmap & Task DAG Approval
- **Type:** UX
- **Description:** User review and modification of Epics and Tasks before implementation.
- **Source:** PRD (Product Requirements Document) (specs/1_prd.md)
- **Dependencies:** None

### **[4_USER_FEATURES-REQ-033]** Roadmap Viewer (Gantt/DAG)
- **Type:** UX
- **Description:** A "Roadmap Viewer" (Gantt-style or DAG) showing 8-16 Epics, each expandable to show constituent tasks.
- **Source:** User Features (specs/4_user_features.md)
- **Dependencies:** None

### **[8_RISKS-REQ-040]** Staggered Review Cadence
- **Type:** UX
- **Description:** Users can configure "Batch Approval" for P1 tasks while requiring individual sign-off for P3 architectural changes.
- **Source:** Risks and Mitigation (specs/8_risks_mitigation.md)
- **Dependencies:** None

### **[1_PRD-REQ-OOS-012]** Subjective Manual UI/UX QA
- **Type:** UX
- **Description:** Out of Scope: No manual aesthetic testing; only automated functional UI validation.
- **Source:** PRD (Product Requirements Document) (specs/1_prd.md)
- **Dependencies:** None

### **[4_USER_FEATURES-REQ-037]** TDD Test Status UI
- **Type:** UX
- **Description:** CLI/VSCode Terminal shows `npm test` failure/success with statuses like "Test Established (Red)" and "Requirement Met (Green)".
- **Source:** User Features (specs/4_user_features.md)
- **Dependencies:** None

### **[9_ROADMAP-REQ-008]** The Blueprint Gate (Gate 1)
- **Type:** UX
- **Description:** The Blueprint Gate (Gate 1): This is a blocking synchronous wait. The orchestrator persists the current LangGraph checkpoint to SQLite and enters a `WAITING_FOR_USER` state. Implementation cannot begin until a signed `approval_token` is written to the `documents` table.
- **Source:** Project Roadmap (specs/9_project_roadmap.md)
- **Dependencies:** None

### **[9_ROADMAP-REQ-002]** The Blueprint Gate (Post-Phase 4)
- **Type:** UX
- **Description:** The Blueprint Gate (Post-Phase 4): Approval of the PRD and TAS. This freezes the architectural DNA.
- **Source:** Project Roadmap (specs/9_project_roadmap.md)
- **Dependencies:** None

### **[9_ROADMAP-REQ-004]** The Epic Start Gate
- **Type:** UX
- **Description:** The Epic Start Gate: User review of the upcoming tasks at the beginning of each Epic.
- **Source:** Project Roadmap (specs/9_project_roadmap.md)
- **Dependencies:** None

### **[9_ROADMAP-REQ-005]** The Final Validation Gate (Post-Phase 8)
- **Type:** UX
- **Description:** The Final Validation Gate (Post-Phase 8): The "Zero-Defect" audit before the project is marked as `COMPLETED`.
- **Source:** Project Roadmap (specs/9_project_roadmap.md)
- **Dependencies:** None

### **[9_ROADMAP-REQ-001]** The Research Gate (Post-Phase 3)
- **Type:** UX
- **Description:** The Research Gate (Post-Phase 3): Approval of the Research Suite (Market, Tech, Comp, User).
- **Source:** Project Roadmap (specs/9_project_roadmap.md)
- **Dependencies:** None

### **[9_ROADMAP-REQ-003]** The Roadmap Gate (Post-Phase 5)
- **Type:** UX
- **Description:** The Roadmap Gate (Post-Phase 5): Approval of the 8-16 Epics and 200+ Tasks. This authorizes the implementation spend.
- **Source:** Project Roadmap (specs/9_project_roadmap.md)
- **Dependencies:** None

### **[TAS-058]** Trace Streaming
- **Type:** UX
- **Description:** Real-time websocket streaming of agent "Thoughts" to the VSCode UI.
- **Source:** TAS (Technical Architecture Specification) (specs/2_tas.md)
- **Dependencies:** None

### **[1_PRD-REQ-UI-018]** Transparency and Exposure
- **Type:** UX
- **Description:** Every internal state change and reasoning step must be exposed to the user.
- **Source:** PRD (Product Requirements Document) (specs/1_prd.md)
- **Dependencies:** None

### **[4_USER_FEATURES-REQ-024]** VSCode Sidebar Research Status
- **Type:** UX
- **Description:** VSCode Sidebar shows a "Researching..." status with a list of active search queries and scraped URLs during Phase 1.
- **Source:** User Features (specs/4_user_features.md)
- **Dependencies:** None

### **[TAS-029]** View Layer
- **Type:** UX
- **Description:** React 18+ with Tailwind CSS for VSCode Webview dashboard.
- **Source:** TAS (Technical Architecture Specification) (specs/2_tas.md)
- **Dependencies:** None

### **[8_RISKS-REQ-036]** Virtualized Trace Streaming
- **Type:** UX
- **Description:** The VSCode Webview MUST implement virtualized lists for agent logs, rendering only the visible window of the trace.
- **Source:** Risks and Mitigation (specs/8_risks_mitigation.md)
- **Dependencies:** None

### **[4_USER_FEATURES-REQ-063]** Visual Loop Indicators
- **Type:** UX
- **Description:** Roadmap DAG UI highlights repeating tasks with color-coding (orange for turns 3+, red for 5+).
- **Source:** User Features (specs/4_user_features.md)
- **Dependencies:** None

### **[1_PRD-REQ-UI-006]** Visual Task Progress (DAG View)
- **Type:** UX
- **Description:** Real-time visualization of the task dependency graph and states.
- **Source:** PRD (Product Requirements Document) (specs/1_prd.md)
- **Dependencies:** None

## Removed or Modified Requirements

### **[7_UI_UX_DESIGN-REQ-UI-DES-047-3-1]** shadow-sm
- **Type:** UX
- **Description:** `0 2px 4px rgba(0,0,0,0.15)`   - **[7_UI_UX_DESIGN-REQ-UI-DES-047-3-2] shadow-md**: `0 8px 24px rgba(0,0,0,0.30)`
- **Source:** UI/UX Design (specs/7_ui_ux_design.md)
- **Dependencies:** None

