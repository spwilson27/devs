# Requirements from TAS (Technical Architecture Specification)

### **[TAS-046]** Full Traceability
- **Type:** Technical
- **Description:** Every agent thought, decision, tool call, and terminal output must be captured and queryable.
- **Source:** TAS (Technical Architecture Specification) (specs/2_tas.md)
- **Dependencies:** None

### **[TAS-047]** Stateful Determinism
- **Type:** Technical
- **Description:** The system can be paused, resumed, or rewound to any previous state (Task/Epic) with 100% fidelity.
- **Source:** TAS (Technical Architecture Specification) (specs/2_tas.md)
- **Dependencies:** None

### **[TAS-048]** Human-in-the-Loop (HITL)
- **Type:** UX
- **Description:** The system provides explicit "Gated Autonomy" checkpoints where users must approve architectural blueprints and roadmaps before implementation begins.
- **Source:** TAS (Technical Architecture Specification) (specs/2_tas.md)
- **Dependencies:** None

### **[TAS-001]** Glass-Box Transparency & Auditability
- **Type:** Technical
- **Description:** Every state transition and agent reasoning step is persisted to a local SQLite database (`.devs/state.sqlite`) as a "Flight Recorder".
- **Source:** TAS (Technical Architecture Specification) (specs/2_tas.md)
- **Dependencies:** None

### **[TAS-002]** Stateless & Resumable Orchestration
- **Type:** Technical
- **Description:** The core engine is stateless; the entire project context (Agent memory, requirement DAGs, and task status) is reloaded from the project's `.devs/` directory.
- **Source:** TAS (Technical Architecture Specification) (specs/2_tas.md)
- **Dependencies:** None

### **[TAS-003]** Native Agentic Observability (MCP)
- **Type:** Technical
- **Description:** The generated project includes a built-in MCP server that exposes internal state, logs, and profiling data for AI agents to debug and optimize.
- **Source:** TAS (Technical Architecture Specification) (specs/2_tas.md)
- **Dependencies:** None

### **[TAS-004]** Strict TDD-Driven Implementation
- **Type:** Technical
- **Description:** Implementation follows a mandatory "Red-Green-Refactor" cycle where code is only written after a failing test case is established in the sandbox.
- **Source:** TAS (Technical Architecture Specification) (specs/2_tas.md)
- **Dependencies:** None

### **[TAS-078]** Orchestration Layer
- **Type:** Technical
- **Description:** Uses LangGraph.js to manage high-level state machine, handles agent handoffs, checkpointing to SQLite, and human-in-the-loop signaling.
- **Source:** TAS (Technical Architecture Specification) (specs/2_tas.md)
- **Dependencies:** None

### **[TAS-079]** Agent Suite
- **Type:** Technical
- **Description:** A collection of specialized agents (Research, Architect, Developer, Reviewer) each with dedicated system prompts and tool-access permissions.
- **Source:** TAS (Technical Architecture Specification) (specs/2_tas.md)
- **Dependencies:** None

### **[TAS-080]** Execution Layer (Sandbox)
- **Type:** Technical
- **Description:** An isolated Docker or WebContainer environment where agents perform file I/O, run tests, and execute shell commands.
- **Source:** TAS (Technical Architecture Specification) (specs/2_tas.md)
- **Dependencies:** None

### **[TAS-081]** Memory Layer
- **Type:** Technical
- **Description:** A tiered system consisting of short-term (active task), medium-term (epic-level), and long-term (project-wide constraints in LanceDB) memory.
- **Source:** TAS (Technical Architecture Specification) (specs/2_tas.md)
- **Dependencies:** None

### **[TAS-049]** Phase 1: Discovery & Research
- **Type:** Functional
- **Description:** Deployment of parallel agents to analyze market, technology landscape, and competitive space.
- **Source:** TAS (Technical Architecture Specification) (specs/2_tas.md)
- **Dependencies:** None

### **[TAS-050]** Phase 2: Blueprint Generation
- **Type:** Functional
- **Description:** The Architect Agent generates PRDs and TAS documents, ending with a mandatory user approval gate.
- **Source:** TAS (Technical Architecture Specification) (specs/2_tas.md)
- **Dependencies:** [TAS-049]

### **[TAS-051]** Phase 3: Requirement Compilation
- **Type:** Functional
- **Description:** The Distiller Agent translates documents into atomic requirements and a Directed Acyclic Graph (DAG) of implementation tasks.
- **Source:** TAS (Technical Architecture Specification) (specs/2_tas.md)
- **Dependencies:** [TAS-050]

### **[TAS-052]** Phase 4: TDD Implementation
- **Type:** Functional
- **Description:** Iterative execution of tasks using Developer Agent in a TDD cycle (write test, fail, write code, pass).
- **Source:** TAS (Technical Architecture Specification) (specs/2_tas.md)
- **Dependencies:** [TAS-051]

### **[TAS-053]** Phase 5: Full System Validation
- **Type:** Functional
- **Description:** Global Reviewer agent runs the entire test suite and verifies documentation density before project completion.
- **Source:** TAS (Technical Architecture Specification) (specs/2_tas.md)
- **Dependencies:** [TAS-052]

### **[TAS-083]** Cyclical Refinement Pattern
- **Type:** Technical
- **Description:** Data flows through Expansion, Compression, Decomposition, Execution, and Verification stages.
- **Source:** TAS (Technical Architecture Specification) (specs/2_tas.md)
- **Dependencies:** None

### **[TAS-082]** Input Requirement
- **Type:** Functional
- **Description:** User provides a brief and journeys as the starting point for the orchestration.
- **Source:** TAS (Technical Architecture Specification) (specs/2_tas.md)
- **Dependencies:** None

### **[2_TAS-REQ-001]** Expansion Process
- **Type:** Functional
- **Description:** Research agents expand user input into thousands of tokens of context.
- **Source:** TAS (Technical Architecture Specification) (specs/2_tas.md)
- **Dependencies:** [TAS-082]

### **[2_TAS-REQ-002]** Compression Process
- **Type:** Functional
- **Description:** The Architect distills research into structured specifications.
- **Source:** TAS (Technical Architecture Specification) (specs/2_tas.md)
- **Dependencies:** [2_TAS-REQ-001]

### **[2_TAS-REQ-003]** Decomposition Process
- **Type:** Functional
- **Description:** The Distiller breaks specifications into atomic, executable tasks.
- **Source:** TAS (Technical Architecture Specification) (specs/2_tas.md)
- **Dependencies:** [2_TAS-REQ-002]

### **[2_TAS-REQ-004]** Execution Process
- **Type:** Functional
- **Description:** Developer agents transform tasks into code commits.
- **Source:** TAS (Technical Architecture Specification) (specs/2_tas.md)
- **Dependencies:** [2_TAS-REQ-003]

### **[2_TAS-REQ-005]** Verification Process
- **Type:** Functional
- **Description:** Reviewer agents validate commits against requirements.
- **Source:** TAS (Technical Architecture Specification) (specs/2_tas.md)
- **Dependencies:** [2_TAS-REQ-004]

### **[TAS-054]** Snapshot-at-Commit Strategy
- **Type:** Technical
- **Description:** The system performs git snapshots, trace persistence, and vector memory updates after every successful task.
- **Source:** TAS (Technical Architecture Specification) (specs/2_tas.md)
- **Dependencies:** None

### **[TAS-055]** Git Snapshots
- **Type:** Technical
- **Description:** Commits code changes to the project's Git repository after each successful task.
- **Source:** TAS (Technical Architecture Specification) (specs/2_tas.md)
- **Dependencies:** None

### **[TAS-056]** Trace Persistence
- **Type:** Technical
- **Description:** Persists agent's reasoning trace to SQLite after each successful task.
- **Source:** TAS (Technical Architecture Specification) (specs/2_tas.md)
- **Dependencies:** None

### **[TAS-057]** Vector Memory Updates
- **Type:** Technical
- **Description:** Updates the Vector DB with any new architectural decisions made during the task.
- **Source:** TAS (Technical Architecture Specification) (specs/2_tas.md)
- **Dependencies:** None

### **[TAS-058]** Trace Streaming
- **Type:** UX
- **Description:** Real-time websocket streaming of agent "Thoughts" to the VSCode UI.
- **Source:** TAS (Technical Architecture Specification) (specs/2_tas.md)
- **Dependencies:** None

### **[TAS-059]** Decision Logs
- **Type:** Technical
- **Description:** Searchable history of every alternative the agent considered but rejected.
- **Source:** TAS (Technical Architecture Specification) (specs/2_tas.md)
- **Dependencies:** None

### **[TAS-063]** Requirement Mapping
- **Type:** Technical
- **Description:** Every function and test in the generated codebase is tagged with a REQ-ID for a full audit trail.
- **Source:** TAS (Technical Architecture Specification) (specs/2_tas.md)
- **Dependencies:** None

### **[TAS-064]** Entropy Detection
- **Type:** Technical
- **Description:** Real-time monitoring of agent loops; pauses and alerts user if an agent repeats a failing strategy 3 times.
- **Source:** TAS (Technical Architecture Specification) (specs/2_tas.md)
- **Dependencies:** None

### **[TAS-060]** Runtime Environment
- **Type:** Technical
- **Description:** Node.js v22.x (LTS) with headless-first design for CLI/Extension parity.
- **Source:** TAS (Technical Architecture Specification) (specs/2_tas.md)
- **Dependencies:** None

### **[TAS-005]** Programming Language
- **Type:** Technical
- **Description:** TypeScript 5.4+ (Strict Mode) with mandatory strict typing configurations.
- **Source:** TAS (Technical Architecture Specification) (specs/2_tas.md)
- **Dependencies:** None

### **[TAS-006]** Package Manager
- **Type:** Technical
- **Description:** pnpm v9.x with monorepo workspace structure.
- **Source:** TAS (Technical Architecture Specification) (specs/2_tas.md)
- **Dependencies:** None

### **[TAS-007]** Primary Reasoning Model
- **Type:** Technical
- **Description:** Google Gemini 3 Pro with 1M+ token context window for high-level research and architectural design.
- **Source:** TAS (Technical Architecture Specification) (specs/2_tas.md)
- **Dependencies:** None

### **[TAS-008]** Utility & Review Model
- **Type:** Technical
- **Description:** Google Gemini 3 Flash for low-latency tasks like linting, unit test generation, and log summarization.
- **Source:** TAS (Technical Architecture Specification) (specs/2_tas.md)
- **Dependencies:** None

### **[TAS-009]** Orchestration Engine
- **Type:** Technical
- **Description:** LangGraph.js for orchestrating multi-agent workflow as a stateful, cyclical graph.
- **Source:** TAS (Technical Architecture Specification) (specs/2_tas.md)
- **Dependencies:** None

### **[TAS-010]** Relational State Store
- **Type:** Technical
- **Description:** SQLite 3 via better-sqlite3 for project state and audit trails.
- **Source:** TAS (Technical Architecture Specification) (specs/2_tas.md)
- **Dependencies:** None

### **[TAS-011]** Vector Memory (Long-term)
- **Type:** Technical
- **Description:** LanceDB (embedded) for semantic embeddings of requirements and architectural decisions.
- **Source:** TAS (Technical Architecture Specification) (specs/2_tas.md)
- **Dependencies:** None

### **[TAS-012]** Filesystem & Change Tracking
- **Type:** Technical
- **Description:** simple-git for atomic state snapshots and audit trail of project evolution.
- **Source:** TAS (Technical Architecture Specification) (specs/2_tas.md)
- **Dependencies:** None

### **[TAS-013]** Agent Sandboxing
- **Type:** Technical
- **Description:** Isolated runtime for agents to execute code safely.
- **Source:** TAS (Technical Architecture Specification) (specs/2_tas.md)
- **Dependencies:** None

### **[TAS-014]** Model Context Protocol (MCP) Integration
- **Type:** Technical
- **Description:** Full integration of MCP SDK for standardized tool interfaces and orchestrator observability.
- **Source:** TAS (Technical Architecture Specification) (specs/2_tas.md)
- **Dependencies:** None

### **[TAS-023]** Secret Masking & Redaction
- **Type:** Security
- **Description:** Middleware layer intercepting sandbox output to redact API keys, credentials, or PII using regex and entropy masking.
- **Source:** TAS (Technical Architecture Specification) (specs/2_tas.md)
- **Dependencies:** None

### **[TAS-027]** Real-time Search Integration
- **Type:** Technical
- **Description:** Google Search API (via Serper) for validating library documentation and competitive intelligence.
- **Source:** TAS (Technical Architecture Specification) (specs/2_tas.md)
- **Dependencies:** None

### **[TAS-028]** Content Extraction
- **Type:** Technical
- **Description:** Firecrawl or Jina Reader for converting web content into LLM-optimized Markdown.
- **Source:** TAS (Technical Architecture Specification) (specs/2_tas.md)
- **Dependencies:** None

### **[TAS-029]** View Layer
- **Type:** UX
- **Description:** React 18+ with Tailwind CSS for VSCode Webview dashboard.
- **Source:** TAS (Technical Architecture Specification) (specs/2_tas.md)
- **Dependencies:** None

### **[TAS-030]** Component Architecture
- **Type:** UX
- **Description:** Use of vscode-webview-ui-toolkit for seamless VSCode theme integration.
- **Source:** TAS (Technical Architecture Specification) (specs/2_tas.md)
- **Dependencies:** None

### **[TAS-031]** Documentation Rendering
- **Type:** UX
- **Description:** Mermaid.js for dynamic rendering of architectural diagrams and roadmaps in Markdown previews.
- **Source:** TAS (Technical Architecture Specification) (specs/2_tas.md)
- **Dependencies:** None

### **[TAS-032]** Orchestrator Verification
- **Type:** Technical
- **Description:** Vitest for unit and integration testing of agent nodes and state transitions.
- **Source:** TAS (Technical Architecture Specification) (specs/2_tas.md)
- **Dependencies:** None

### **[TAS-033]** Automated Code Auditing
- **Type:** Technical
- **Description:** Integration of ESLint, Prettier, and language-specific static analysis tools in the TDD loop.
- **Source:** TAS (Technical Architecture Specification) (specs/2_tas.md)
- **Dependencies:** None

### **[TAS-066]** Primary Source of Truth
- **Type:** Technical
- **Description:** SQLite database (`.devs/state.sqlite`) is the primary source of truth for project state and audit logs.
- **Source:** TAS (Technical Architecture Specification) (specs/2_tas.md)
- **Dependencies:** None

### **[TAS-067]** ACID-Compliant Transactions
- **Type:** Technical
- **Description:** All database tables use ACID-compliant transactions to ensure consistency during agent handoffs.
- **Source:** TAS (Technical Architecture Specification) (specs/2_tas.md)
- **Dependencies:** None

### **[TAS-105]** Projects Table
- **Type:** Technical
- **Description:** SQLite table for project metadata including phase and status.
- **Source:** TAS (Technical Architecture Specification) (specs/2_tas.md)
- **Dependencies:** [TAS-066]

### **[TAS-106]** Documents Table
- **Type:** Technical
- **Description:** SQLite table for storing document content, versions, and approval status.
- **Source:** TAS (Technical Architecture Specification) (specs/2_tas.md)
- **Dependencies:** [TAS-066]

### **[TAS-107]** Requirements Table
- **Type:** Technical
- **Description:** SQLite table for atomic requirements with priority, status, and trace metadata.
- **Source:** TAS (Technical Architecture Specification) (specs/2_tas.md)
- **Dependencies:** [TAS-066]

### **[TAS-108]** Epics Table
- **Type:** Technical
- **Description:** SQLite table for project epics and their roadmap order.
- **Source:** TAS (Technical Architecture Specification) (specs/2_tas.md)
- **Dependencies:** [TAS-066]

### **[TAS-109]** Tasks Table
- **Type:** Technical
- **Description:** SQLite table for tasks including implementation instructions, status, and associated git commit hashes.
- **Source:** TAS (Technical Architecture Specification) (specs/2_tas.md)
- **Dependencies:** [TAS-066]

### **[TAS-110]** Agent Logs Table
- **Type:** Technical
- **Description:** SQLite table for detailed audit of agent thoughts, strategies, tool calls, and observations.
- **Source:** TAS (Technical Architecture Specification) (specs/2_tas.md)
- **Dependencies:** [TAS-066]

### **[TAS-111]** Entropy Events Table
- **Type:** Technical
- **Description:** SQLite table tracking repeating failures for loop prevention.
- **Source:** TAS (Technical Architecture Specification) (specs/2_tas.md)
- **Dependencies:** [TAS-066]

### **[TAS-091]** Embedding Model
- **Type:** Technical
- **Description:** Use of text-embedding-004 (768 dimensions) for semantic memory.
- **Source:** TAS (Technical Architecture Specification) (specs/2_tas.md)
- **Dependencies:** None

### **[TAS-092]** Indexing Strategy
- **Type:** Technical
- **Description:** IVF-PQ (Inverted File with Product Quantization) for efficient vector search in LanceDB.
- **Source:** TAS (Technical Architecture Specification) (specs/2_tas.md)
- **Dependencies:** None

### **[TAS-093]** Vector Schema
- **Type:** Technical
- **Description:** LanceDB schema including vector, content, type (ARCHITECTURAL_DECISION, etc.), and metadata.
- **Source:** TAS (Technical Architecture Specification) (specs/2_tas.md)
- **Dependencies:** None

### **[2_TAS-REQ-015]** LanceDB Path
- **Type:** Technical
- **Description:** Long-term memory stored at `.devs/memory.lancedb`.
- **Source:** TAS (Technical Architecture Specification) (specs/2_tas.md)
- **Dependencies:** None

### **[TAS-094]** Checkpoint Object
- **Type:** Technical
- **Description:** LangGraph graph state persisted as binary/JSON blobs in SQLite.
- **Source:** TAS (Technical Architecture Specification) (specs/2_tas.md)
- **Dependencies:** None

### **[TAS-095]** Git Snapshot Association
- **Type:** Technical
- **Description:** Every successful task results in a Git commit hash stored in the tasks table.
- **Source:** TAS (Technical Architecture Specification) (specs/2_tas.md)
- **Dependencies:** None

### **[TAS-068]** Orphaned Requirements Check
- **Type:** Technical
- **Description:** System must verify every requirement is mapped to at least one task during Phase 3.
- **Source:** TAS (Technical Architecture Specification) (specs/2_tas.md)
- **Dependencies:** None

### **[TAS-069]** State Recovery
- **Type:** Technical
- **Description:** If .devs folder is missing, orchestrator reconstructs requirement maps from code comments/documentation.
- **Source:** TAS (Technical Architecture Specification) (specs/2_tas.md)
- **Dependencies:** None

### **[TAS-070]** Concurrency Management
- **Type:** Technical
- **Description:** Database uses WAL mode and row-level locking for parallel agent safety.
- **Source:** TAS (Technical Architecture Specification) (specs/2_tas.md)
- **Dependencies:** None

### **[TAS-071]** Scaling Traces
- **Type:** Technical
- **Description:** Archival strategy for agent_logs over 100MB to compressed JSON files.
- **Source:** TAS (Technical Architecture Specification) (specs/2_tas.md)
- **Dependencies:** None

### **[TAS-096]** Module Architecture
- **Type:** Technical
- **Description:** TypeScript monorepo with clear separation between core, agents, sandbox, memory, and MCP modules.
- **Source:** TAS (Technical Architecture Specification) (specs/2_tas.md)
- **Dependencies:** None

### **[TAS-097]** @devs/core
- **Type:** Technical
- **Description:** Orchestration engine responsible for state transitions and persistence.
- **Source:** TAS (Technical Architecture Specification) (specs/2_tas.md)
- **Dependencies:** None

### **[2_TAS-REQ-016]** OrchestrationGraph
- **Type:** Technical
- **Description:** Implements LangGraph.js state machine for Research, Design, Distillation, and TDD loop.
- **Source:** TAS (Technical Architecture Specification) (specs/2_tas.md)
- **Dependencies:** [TAS-097]

### **[2_TAS-REQ-017]** StateRepository
- **Type:** Technical
- **Description:** SQLite-backed ACID checkpointer for graph state and agent logs.
- **Source:** TAS (Technical Architecture Specification) (specs/2_tas.md)
- **Dependencies:** [TAS-097]

### **[2_TAS-REQ-018]** EventBus
- **Type:** Technical
- **Description:** Real-time event streaming for status updates to VSCode and CLI.
- **Source:** TAS (Technical Architecture Specification) (specs/2_tas.md)
- **Dependencies:** [TAS-097]

### **[2_TAS-REQ-019]** HumanInTheLoopManager
- **Type:** Technical
- **Description:** Manages "Wait-for-Approval" gates and persists graph state during suspension.
- **Source:** TAS (Technical Architecture Specification) (specs/2_tas.md)
- **Dependencies:** [TAS-097]

### **[TAS-098]** @devs/agents
- **Type:** Technical
- **Description:** Encapsulates LLM logic, prompts, and tool bindings.
- **Source:** TAS (Technical Architecture Specification) (specs/2_tas.md)
- **Dependencies:** None

### **[2_TAS-REQ-020]** AgentFactory
- **Type:** Technical
- **Description:** Dynamically instantiates agents based on Tier and System Prompts.
- **Source:** TAS (Technical Architecture Specification) (specs/2_tas.md)
- **Dependencies:** [TAS-098]

### **[2_TAS-REQ-021]** PromptManager
- **Type:** Technical
- **Description:** Version-controlled repository of system instructions and reasoning protocols.
- **Source:** TAS (Technical Architecture Specification) (specs/2_tas.md)
- **Dependencies:** [TAS-098]

### **[2_TAS-REQ-022]** ToolRegistry
- **Type:** Technical
- **Description:** Mapping of MCP tools to specific agent roles with restricted access.
- **Source:** TAS (Technical Architecture Specification) (specs/2_tas.md)
- **Dependencies:** [TAS-098]

### **[2_TAS-REQ-023]** ReasoningEngine
- **Type:** Technical
- **Description:** Parses structured thought protocol from LLM outputs.
- **Source:** TAS (Technical Architecture Specification) (specs/2_tas.md)
- **Dependencies:** [TAS-098]

### **[TAS-099]** @devs/sandbox
- **Type:** Technical
- **Description:** Isolated execution abstraction for shell commands and file I/O.
- **Source:** TAS (Technical Architecture Specification) (specs/2_tas.md)
- **Dependencies:** None

### **[2_TAS-REQ-024]** SandboxProvider
- **Type:** Technical
- **Description:** Abstract interface for multi-platform execution.
- **Source:** TAS (Technical Architecture Specification) (specs/2_tas.md)
- **Dependencies:** [TAS-099]

### **[2_TAS-REQ-025]** DockerDriver
- **Type:** Technical
- **Description:** CLI implementation of sandbox using ephemeral Docker containers.
- **Source:** TAS (Technical Architecture Specification) (specs/2_tas.md)
- **Dependencies:** [2_TAS-REQ-024]

### **[2_TAS-REQ-026]** WebContainerDriver
- **Type:** Technical
- **Description:** VSCode Web implementation of sandbox using browser-native Node.js.
- **Source:** TAS (Technical Architecture Specification) (specs/2_tas.md)
- **Dependencies:** [2_TAS-REQ-024]

### **[TAS-080]** FilesystemManager
- **Type:** Security
- **Description:** Synchronizes host and sandbox while protecting sensitive metadata like .git and .devs.
- **Source:** TAS (Technical Architecture Specification) (specs/2_tas.md)
- **Dependencies:** [TAS-099]

### **[REQ-SEC-003]** Filesystem Protection
- **Type:** Security
- **Description:** Ensures .git and .devs are protected during filesystem synchronization between host and sandbox.
- **Source:** TAS (Technical Architecture Specification) (specs/2_tas.md)
- **Dependencies:** [TAS-080]

### **[TAS-100]** @devs/memory
- **Type:** Technical
- **Description:** Tiered memory system management.
- **Source:** TAS (Technical Architecture Specification) (specs/2_tas.md)
- **Dependencies:** None

### **[2_TAS-REQ-027]** VectorStore
- **Type:** Technical
- **Description:** LanceDB integration for long-term project-wide context.
- **Source:** TAS (Technical Architecture Specification) (specs/2_tas.md)
- **Dependencies:** [TAS-100]

### **[2_TAS-REQ-028]** ContextPruner
- **Type:** Technical
- **Description:** Sophisticated logic for sliding-window context management for 1M token limits.
- **Source:** TAS (Technical Architecture Specification) (specs/2_tas.md)
- **Dependencies:** [TAS-100]

### **[REQ-SYS-001]** Sliding-Window Context Management
- **Type:** Technical
- **Description:** Ensures agents stay within the 1M token limit without losing critical architectural info.
- **Source:** TAS (Technical Architecture Specification) (specs/2_tas.md)
- **Dependencies:** [2_TAS-REQ-028]

### **[2_TAS-REQ-029]** MemoryRefresher
- **Type:** Technical
- **Description:** Periodic summarization of Epic progress into long-term memory.
- **Source:** TAS (Technical Architecture Specification) (specs/2_tas.md)
- **Dependencies:** [TAS-100]

### **[TAS-101]** @devs/mcp
- **Type:** Technical
- **Description:** Standardized communication protocols using MCP.
- **Source:** TAS (Technical Architecture Specification) (specs/2_tas.md)
- **Dependencies:** None

### **[2_TAS-REQ-030]** OrchestratorServer
- **Type:** Technical
- **Description:** MCP server exposing internal orchestrator state to VSCode.
- **Source:** TAS (Technical Architecture Specification) (specs/2_tas.md)
- **Dependencies:** [TAS-101]

### **[2_TAS-REQ-031]** ProjectServerTemplate
- **Type:** Technical
- **Description:** Blueprint for MCP servers injected into generated projects.
- **Source:** TAS (Technical Architecture Specification) (specs/2_tas.md)
- **Dependencies:** [TAS-101]

### **[REQ-GOAL-004]** Agent-Ready Debugging
- **Type:** Technical
- **Description:** Blueprint for MCP server injected into every generated project to enable agentic debugging.
- **Source:** TAS (Technical Architecture Specification) (specs/2_tas.md)
- **Dependencies:** [2_TAS-REQ-031]

### **[2_TAS-REQ-032]** ToolProxy
- **Type:** Technical
- **Description:** Bridges LLM tool calls to the sandbox execution layer.
- **Source:** TAS (Technical Architecture Specification) (specs/2_tas.md)
- **Dependencies:** [TAS-101]

### **[TAS-102]** @devs/cli & @devs/vscode
- **Type:** Technical
- **Description:** User interface controllers for CLI and VSCode Extension.
- **Source:** TAS (Technical Architecture Specification) (specs/2_tas.md)
- **Dependencies:** None

### **[2_TAS-REQ-033]** CLIController
- **Type:** Technical
- **Description:** Handles CLI arguments and terminal progress reporting.
- **Source:** TAS (Technical Architecture Specification) (specs/2_tas.md)
- **Dependencies:** [TAS-102]

### **[2_TAS-REQ-034]** ExtensionHost
- **Type:** Technical
- **Description:** Manages VSCode extension lifecycle and trace streaming.
- **Source:** TAS (Technical Architecture Specification) (specs/2_tas.md)
- **Dependencies:** [TAS-102]

### **[TAS-072]** Tool Execution Flow
- **Type:** Technical
- **Description:** Agents emit tool_call; core validates via ToolRegistry and forwards to sandbox; result logged to agent_logs.
- **Source:** TAS (Technical Architecture Specification) (specs/2_tas.md)
- **Dependencies:** None

### **[TAS-073]** State Checkpointing Requirement
- **Type:** Technical
- **Description:** ACID commit to SQLite triggered after every LangGraph node transition.
- **Source:** TAS (Technical Architecture Specification) (specs/2_tas.md)
- **Dependencies:** None

### **[TAS-074]** Cross-Agent Verification Requirement
- **Type:** Technical
- **Description:** ReviewerAgent independently verifies DeveloperAgent's task completion in a clean sandbox.
- **Source:** TAS (Technical Architecture Specification) (specs/2_tas.md)
- **Dependencies:** None

### **[TAS-103]** Cyclical Orchestration Graph
- **Type:** Technical
- **Description:** Orchestrator follows a cyclical graph (LangGraph) for Research, Design, Distillation, and Implementation.
- **Source:** TAS (Technical Architecture Specification) (specs/2_tas.md)
- **Dependencies:** None

### **[TAS-015]** User Approval Gate
- **Type:** UX
- **Description:** Explicit user sign-off required on generated blueprints before proceeding to distillation.
- **Source:** TAS (Technical Architecture Specification) (specs/2_tas.md)
- **Dependencies:** None

### **[TAS-016]** Short-term Memory Requirement
- **Type:** Technical
- **Description:** Management of in-context task logs, tool calls, and active file contents.
- **Source:** TAS (Technical Architecture Specification) (specs/2_tas.md)
- **Dependencies:** None

### **[TAS-017]** Medium-term Memory Requirement
- **Type:** Technical
- **Description:** Management of Epic-level decisions and task summaries in SQLite logs.
- **Source:** TAS (Technical Architecture Specification) (specs/2_tas.md)
- **Dependencies:** None

### **[TAS-018]** Long-term Memory Requirement
- **Type:** Technical
- **Description:** Management of project-wide constraints and architectural decisions in LanceDB.
- **Source:** TAS (Technical Architecture Specification) (specs/2_tas.md)
- **Dependencies:** None

### **[TAS-019]** Deterministic Entropy Detection Algorithm
- **Type:** Technical
- **Description:** 4-step algorithm using SHA-256 hashes of errors to detect loops and trigger strategy pivots.
- **Source:** TAS (Technical Architecture Specification) (specs/2_tas.md)
- **Dependencies:** None

### **[TAS-020]** Escalation Pause
- **Type:** UX
- **Description:** System pauses for human intervention after 5 total task implementation failures.
- **Source:** TAS (Technical Architecture Specification) (specs/2_tas.md)
- **Dependencies:** [TAS-019]

### **[TAS-021]** Sandbox Resource Constraints
- **Type:** Technical
- **Description:** Limits of 2 vCPUs, 4GB RAM, 2GB storage, and 300s timeout per tool call.
- **Source:** TAS (Technical Architecture Specification) (specs/2_tas.md)
- **Dependencies:** None

### **[TAS-022]** Network Egress Policy
- **Type:** Security
- **Description:** Default Deny with allow-list for npmjs.org, pypi.org, and github.com during dependency phases.
- **Source:** TAS (Technical Architecture Specification) (specs/2_tas.md)
- **Dependencies:** None

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

### **[2_TAS-REQ-008]** rewind_to_task Tool
- **Type:** Functional
- **Description:** Tool to roll back git and SQLite state to a specific taskId.
- **Source:** TAS (Technical Architecture Specification) (specs/2_tas.md)
- **Dependencies:** [TAS-101]

### **[2_TAS-REQ-009]** inspect_state Tool
- **Type:** Functional
- **Description:** Tool to read runtime variables or database state of the generated application.
- **Source:** TAS (Technical Architecture Specification) (specs/2_tas.md)
- **Dependencies:** [TAS-043]

### **[2_TAS-REQ-010]** run_profiler Tool
- **Type:** Functional
- **Description:** Tool to capture CPU/Memory traces of the generated application.
- **Source:** TAS (Technical Architecture Specification) (specs/2_tas.md)
- **Dependencies:** [TAS-043]

### **[2_TAS-REQ-011]** execute_query Tool
- **Type:** Functional
- **Description:** Tool for agents to verify data persistence in the generated app during TDD.
- **Source:** TAS (Technical Architecture Specification) (specs/2_tas.md)
- **Dependencies:** [TAS-043]

### **[TAS-035]** SAOP Protocol
- **Type:** Technical
- **Description:** Structured Agent-Orchestrator Protocol for transparent inter-agent communication.
- **Source:** TAS (Technical Architecture Specification) (specs/2_tas.md)
- **Dependencies:** None

### **[TAS-112]** Turn Envelope Schema
- **Type:** Technical
- **Description:** Strictly-typed JSON structure for every agent interaction turn.
- **Source:** TAS (Technical Architecture Specification) (specs/2_tas.md)
- **Dependencies:** [TAS-035]

### **[TAS-036]** MCP Standard Usage
- **Type:** Technical
- **Description:** Unified interface for all tool-based operations using MCP.
- **Source:** TAS (Technical Architecture Specification) (specs/2_tas.md)
- **Dependencies:** None

### **[TAS-077]** Core Toolset Scoping
- **Type:** Technical
- **Description:** Tools are exposed to agents based on the current Phase and Epic context.
- **Source:** TAS (Technical Architecture Specification) (specs/2_tas.md)
- **Dependencies:** None

### **[TAS-065]** Observation Standard
- **Type:** Technical
- **Description:** Standardized JSON structure for tool outputs (observations) returned to agents.
- **Source:** TAS (Technical Architecture Specification) (specs/2_tas.md)
- **Dependencies:** None

### **[TAS-043]** Generated Project MCP API
- **Type:** Technical
- **Description:** Mandatory internal MCP server in generated projects for post-delivery maintenance.
- **Source:** TAS (Technical Architecture Specification) (specs/2_tas.md)
- **Dependencies:** None

### **[TAS-038]** Real-time Trace & Event Streaming (RTES)
- **Type:** Technical
- **Description:** Event bus for synchronizing state between core and UI/CLI dashboards.
- **Source:** TAS (Technical Architecture Specification) (specs/2_tas.md)
- **Dependencies:** None

### **[TAS-113]** Event Types and Payloads
- **Type:** Technical
- **Description:** Specified event types (THOUGHT_STREAM, TOOL_LIFECYCLE, etc.) for real-time orchestration feedback.
- **Source:** TAS (Technical Architecture Specification) (specs/2_tas.md)
- **Dependencies:** [TAS-038]

### **[TAS-041]** TDD Verification & Binary Gate Protocol
- **Type:** Technical
- **Description:** Set of deterministic exit-code gates (RED, GREEN, REGRESSION, QUALITY) for task progression.
- **Source:** TAS (Technical Architecture Specification) (specs/2_tas.md)
- **Dependencies:** None

### **[TAS-039]** Persistence & Inter-Agent Handoff
- **Type:** Technical
- **Description:** Stateless handoffs between agents via shared database state.
- **Source:** TAS (Technical Architecture Specification) (specs/2_tas.md)
- **Dependencies:** None

### **[TAS-075]** Data Locality Requirement
- **Type:** Technical
- **Description:** Agents must not hold long-term state internally; all findings written to DB tables.
- **Source:** TAS (Technical Architecture Specification) (specs/2_tas.md)
- **Dependencies:** None

### **[TAS-114]** Git State Correlation
- **Type:** Technical
- **Description:** Every task transition mapped to a Git commit hash in the tasks table for project rewind capability.
- **Source:** TAS (Technical Architecture Specification) (specs/2_tas.md)
- **Dependencies:** None

### **[TAS-024]** Context Pruning Requirement
- **Type:** Technical
- **Description:** Flash model summarization triggered at 800k tokens to preserve critical context.
- **Source:** TAS (Technical Architecture Specification) (specs/2_tas.md)
- **Dependencies:** None

### **[TAS-025]** Dependency Deadlock Resolution
- **Type:** Technical
- **Description:** ReviewerAgent blocks commits that conflict with TAS; triggers TAS Reconciliation.
- **Source:** TAS (Technical Architecture Specification) (specs/2_tas.md)
- **Dependencies:** None

### **[TAS-026]** Rate Limit Handling
- **Type:** Technical
- **Description:** Exponential backoff for LLM API calls with state preservation.
- **Source:** TAS (Technical Architecture Specification) (specs/2_tas.md)
- **Dependencies:** None

### **[TAS-040]** Generated Project Directory Structure
- **Type:** Technical
- **Description:** Mandatory directory structure for generated projects ensuring transparency and observability.
- **Source:** TAS (Technical Architecture Specification) (specs/2_tas.md)
- **Dependencies:** None

### **[TAS-104]** Top-Level Directory Overview
- **Type:** Technical
- **Description:** Specific top-level folders: .devs, .agent, mcp-server, src, tests, docs, scripts.
- **Source:** TAS (Technical Architecture Specification) (specs/2_tas.md)
- **Dependencies:** [TAS-040]

### **[TAS-061]** The .devs/ Directory Requirement
- **Type:** Technical
- **Description:** Flight recorder directory containing SQLite DB, LanceDB, and trace logs; excluded from Developer Agent write-access.
- **Source:** TAS (Technical Architecture Specification) (specs/2_tas.md)
- **Dependencies:** [TAS-104]

### **[TAS-042]** The .agent/ Directory Requirement
- **Type:** Technical
- **Description:** Contains Agent-Oriented Documentation (AOD) for future AI agent context.
- **Source:** TAS (Technical Architecture Specification) (specs/2_tas.md)
- **Dependencies:** [TAS-104]

### **[TAS-062]** The mcp-server/ Directory Requirement
- **Type:** Technical
- **Description:** Standalone MCP project in generated output for application inspection.
- **Source:** TAS (Technical Architecture Specification) (specs/2_tas.md)
- **Dependencies:** [TAS-104]

### **[TAS-044]** The docs/ Directory Requirement
- **Type:** Technical
- **Description:** Standardized Markdown specs and research reports generated during Phase 1 & 2.
- **Source:** TAS (Technical Architecture Specification) (specs/2_tas.md)
- **Dependencies:** [TAS-104]

### **[TAS-045]** src and tests Directory Structure
- **Type:** Technical
- **Description:** Modular src structure mirroring defined architecture; tests mirroring src with unit, integration, and agent-specific tests.
- **Source:** TAS (Technical Architecture Specification) (specs/2_tas.md)
- **Dependencies:** [TAS-104]

### **[TAS-076]** Version Manifest Requirement
- **Type:** Technical
- **Description:** package.json must include a devs section with project metadata.
- **Source:** TAS (Technical Architecture Specification) (specs/2_tas.md)
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

### **[2_TAS-REQ-014]** validate-all script
- **Type:** Technical
- **Description:** Script to run the full verification suite (Lint, Build, Test).
- **Source:** TAS (Technical Architecture Specification) (specs/2_tas.md)
- **Dependencies:** None

### **[RISK-401]** Sandbox Latency
- **Type:** Technical
- **Description:** Overhead from Docker containers may impact task execution speed.
- **Source:** TAS (Technical Architecture Specification) (specs/2_tas.md)
- **Dependencies:** None

### **[RISK-402]** Extension Memory Limits
- **Type:** Technical
- **Description:** Orchestrator may hit memory limits when running inside a VSCode extension.
- **Source:** TAS (Technical Architecture Specification) (specs/2_tas.md)
- **Dependencies:** None

### **[RISK-601]** Monorepo Complexity
- **Type:** Technical
- **Description:** Evolution into monorepo requires careful root-level state management.
- **Source:** TAS (Technical Architecture Specification) (specs/2_tas.md)
- **Dependencies:** None

### **[RISK-602]** Documentation Drift
- **Type:** Technical
- **Description:** Source code and agent-oriented documentation may drift over time.
- **Source:** TAS (Technical Architecture Specification) (specs/2_tas.md)
- **Dependencies:** None

### **[RISK-801]** Non-UTF8 Tool Output
- **Type:** Technical
- **Description:** Binary or non-standard characters in terminal output could crash the JSON-based protocol.
- **Source:** TAS (Technical Architecture Specification) (specs/2_tas.md)
- **Dependencies:** None

### **[RISK-802]** Context Window Exhaustion
- **Type:** Technical
- **Description:** Long-running tasks with heavy failures can fill the 1M token window.
- **Source:** TAS (Technical Architecture Specification) (specs/2_tas.md)
- **Dependencies:** None

### **[UNKNOWN-401]** WebContainers native dependency support
- **Type:** Technical
- **Description:** Uncertainty if WebContainers will support all complex backend project features.
- **Source:** TAS (Technical Architecture Specification) (specs/2_tas.md)
- **Dependencies:** None

### **[UNKNOWN-601]** state.sqlite git strategy
- **Type:** Technical
- **Description:** Decision needed on whether to commit the state database to version control.
- **Source:** TAS (Technical Architecture Specification) (specs/2_tas.md)
- **Dependencies:** None

### **[UNKNOWN-602]** Hidden project files handling
- **Type:** Technical
- **Description:** Strategy for handling hidden files like .vscode/settings.json that influence agent environment.
- **Source:** TAS (Technical Architecture Specification) (specs/2_tas.md)
- **Dependencies:** None

### **[UNKNOWN-801]** Multi-agent parallel execution support
- **Type:** Technical
- **Description:** Need to determine if SAOP should support multiple agents working on independent tasks in one turn.
- **Source:** TAS (Technical Architecture Specification) (specs/2_tas.md)
- **Dependencies:** None

### **[UNKNOWN-802]** Transient Sandbox Flakiness
- **Type:** Technical
- **Description:** Handling network timeouts or other transient errors without triggering entropy detection.
- **Source:** TAS (Technical Architecture Specification) (specs/2_tas.md)
- **Dependencies:** None
